import { MeshTxBuilder, deserializeAddress, deserializeDatum, mConStr0 } from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { oracleAddress, oracleScriptCbor } from "./blueprint.ts";

/// Mirrors the on-chain `OracleDatum { owner, price }`. The price is the piece
/// of state that changes; the owner is who may change it.
export function oracleDatum(ownerPubKeyHash: string, price: number): Data {
  return mConStr0([ownerPubKeyHash, price]);
}

const updateRedeemer: Data = mConStr0([]);

/// Read the published price straight off the chain.
export function priceOf(utxo: UTxO): number {
  const datum = deserializeDatum(utxo.output.plutusData ?? "");
  return Number(datum.fields[1].int);
}

/// Read the owner out of an oracle's datum: the only key allowed to update it.
export function ownerOf(utxo: UTxO): string | undefined {
  try {
    return String(deserializeDatum(utxo.output.plutusData ?? "").fields[0].bytes);
  } catch {
    return undefined;
  }
}

/// Read every oracle UTxO currently on the chain.
///
/// Unlike the vault, this is **not** filtered to yours, and that is the point of
/// an oracle: the contract takes no parameter, so everyone who compiles it shares
/// one address, and every published price is sitting there for anyone to read.
/// Reading is open to all; only updating is restricted, and the datum's owner is
/// what the validator checks. Use `ownerOf` to tell which ones you may change.
export async function fetchOracles(provider: IFetcher, networkId: number): Promise<UTxO[]> {
  return await provider.fetchAddressUTxOs(oracleAddress(networkId));
}

/// Publish an oracle: a plain payment to the script address, carrying the first
/// price in its datum. Nothing runs yet, same as every lock so far.
export async function buildOracleCreateTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  price: number,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside that address: who will be allowed to update the price.
  const owner = deserializeAddress(changeAddress).pubKeyHash;

  // The builder. `fetcher` is how it looks up UTxOs and protocol parameters.
  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    // Create an output at the contract's address. The ADA is not the point here;
    // it is the minimum a UTxO needs in order to exist and carry the datum.
    .txOut(oracleAddress(networkId), [{ unit: "lovelace", quantity: "5000000" }])
    // The published data itself: who owns it, and the first price.
    .txOutInlineDatumValue(oracleDatum(owner, price))
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover this.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}

/// Change the published price.
///
/// This is a spend, so the validator runs, but look at what the transaction
/// does with the funds: instead of taking them, it sends an output straight
/// back to the same script address, carrying a **new** datum. The old UTxO is
/// consumed and a replacement appears in the same transaction, which is what a
/// state change looks like on a ledger made of immutable UTxOs.
// #region oracle-update
export async function buildOracleUpdateTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  oracleUtxo: UTxO,
  newPrice: number,
  evaluator?: IEvaluator,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside it: the owner the current datum names.
  const owner = deserializeAddress(changeAddress).pubKeyHash;
  // The deposit, as with any spend that runs a script.
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }

  // Passing `evaluator` is what makes the contract run here, before you send.
  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    // Everything that follows describes one Plutus V3 script being spent.
    .spendingPlutusScriptV3()
    // Consume the oracle UTxO holding the *old* price.
    .txIn(
      oracleUtxo.input.txHash,
      oracleUtxo.input.outputIndex,
      oracleUtxo.output.amount,
      oracleUtxo.output.address,
    )
    // Carry the compiled contract, so the network has the code to run.
    .txInScript(oracleScriptCbor)
    // The old datum is already on the UTxO being spent.
    .txInInlineDatumPresent()
    // The contract offers only one action, so the redeemer is empty.
    .txInRedeemerValue(updateRedeemer)
    // **The two lines that make this an update rather than a withdrawal.** Send
    // the same value straight back to the same address...
    .txOut(oracleAddress(networkId), oracleUtxo.output.amount)
    // ...carrying a new datum. The old UTxO dies and its replacement is born in
    // the same transaction, which is what "changing data" means on a UTxO ledger.
    .txOutInlineDatumValue(oracleDatum(owner, newPrice))
    // The signature the validator looks for.
    .requiredSignerHash(owner)
    // Offer the deposit found above.
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover the fee.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion oracle-update
