import { MeshTxBuilder, deserializeAddress, deserializeDatum, mConStr0, mConStr1 } from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import {
  BEACON_NAME_HEX,
  beaconPolicyId,
  beaconScriptCbor,
  beaconUnit,
  oracleAddress,
  oracleScriptCbor,
} from "./blueprint.ts";
import type { Seed } from "./blueprint.ts";
import { spendableUtxos } from "./spendable.ts";

/// The two redeemers the oracle offers. `OracleAction` reaches the validator as
/// a number, so `Update` is constructor 0 and `Delete` is constructor 1.
const updateRedeemer: Data = mConStr0([]);
const deleteRedeemer: Data = mConStr1([]);

/// The beacon policy's only redeemer pair, in the same order: `Mint`, `Burn`.
const mintRedeemer: Data = mConStr0([]);
const burnRedeemer: Data = mConStr1([]);

/// One deployed oracle: the seed it was minted from, and the key allowed to
/// update it. The address is derived from these two, never stored.
export type Deployment = { seed: Seed; operator: string };

/// Read the published rate straight off the chain. `Rate` is an alias for `Int`
/// on the contract's side, so the datum is a bare integer with no constructor
/// around it, and there are no fields to index into.
export function rateOf(utxo: UTxO): number {
  return Number(deserializeDatum(utxo.output.plutusData ?? "").int);
}

/// Find the oracle belonging to one deployment.
///
/// Anybody can put a UTxO at this address, so a match on the address alone is
/// not enough. The beacon is what says which one is the oracle, and the
/// consumer contract asks the same question on-chain.
export async function fetchOracle(
  provider: IFetcher,
  networkId: number,
  deployment: Deployment,
): Promise<UTxO | undefined> {
  const policyId = beaconPolicyId(deployment.seed);
  const address = oracleAddress(policyId, deployment.operator, networkId);
  const unit = beaconUnit(policyId);
  const utxos = await provider.fetchAddressUTxOs(address);
  return utxos.find((utxo) => utxo.output.amount.some((a) => a.unit === unit && a.quantity === "1"));
}

/// Publish an oracle: mint the beacon and lock it with the first rate.
///
/// This is the one transaction that decides everything else. The seed it spends
/// fixes the policy id, the policy id fixes the oracle's address, and neither
/// can ever be chosen again, because the seed is now spent.
export async function buildOracleCreateTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  rate: number,
): Promise<{ unsignedTx: string; deployment: Deployment }> {
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside that address: who will be allowed to update the rate.
  const operator = deserializeAddress(changeAddress).pubKeyHash;
  // Minting runs a script, so this transaction needs a deposit.
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }

  const utxos = await spendableUtxos(wallet);
  // Any UTxO of yours will do. Spending it is what makes the beacon one of a
  // kind, so the policy is built around whichever one you pick here.
  const seedUtxo = utxos[0];
  if (!seedUtxo) throw new Error("this wallet has no UTxOs to seed the beacon from");
  const seed: Seed = {
    txHash: seedUtxo.input.txHash,
    outputIndex: seedUtxo.input.outputIndex,
  };

  const policyId = beaconPolicyId(seed);
  const unit = beaconUnit(policyId);

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  const unsignedTx = await txBuilder
    // Spend the seed by name. The policy checks for this exact reference among
    // the inputs, so it cannot be left to the coin selection below.
    .txIn(
      seedUtxo.input.txHash,
      seedUtxo.input.outputIndex,
      seedUtxo.output.amount,
      seedUtxo.output.address,
    )
    // Everything that follows describes one Plutus V3 script minting.
    .mintPlutusScriptV3()
    // Exactly one beacon, which is all the policy allows.
    .mint("1", policyId, BEACON_NAME_HEX)
    .mintingScript(beaconScriptCbor(seed))
    .mintRedeemerValue(mintRedeemer)
    // One output at the oracle, holding the ADA and the beacon together.
    .txOut(oracleAddress(policyId, operator, networkId), [
      { unit: "lovelace", quantity: "5000000" },
      { unit, quantity: "1" },
    ])
    // The published data: the rate on its own, with no constructor around it.
    .txOutInlineDatumValue(rate)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();

  return { unsignedTx, deployment: { seed, operator } };
}

/// Change the published rate.
///
/// This is a spend, so the validator runs, but look at what the transaction
/// does with the funds: instead of taking them, it sends an output straight
/// back to the same script address, carrying a **new** datum and the same
/// beacon. The old UTxO is consumed and a replacement appears in the same
/// transaction, which is what a state change looks like on a ledger made of
/// immutable UTxOs.
// #region oracle-update
export async function buildOracleUpdateTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  deployment: Deployment,
  oracleUtxo: UTxO,
  newRate: number,
  evaluator?: IEvaluator,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const { policyId, operator, collateral } = await spendContext(wallet, deployment);

  // Passing `evaluator` is what makes the contract run here, before you send.
  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    // Everything that follows describes one Plutus V3 script being spent.
    .spendingPlutusScriptV3()
    // Consume the oracle UTxO holding the *old* rate.
    .txIn(
      oracleUtxo.input.txHash,
      oracleUtxo.input.outputIndex,
      oracleUtxo.output.amount,
      oracleUtxo.output.address,
    )
    // Carry the compiled contract, with its parameters already filled in.
    .txInScript(oracleScriptCbor(policyId, operator))
    // The old datum is already on the UTxO being spent.
    .txInInlineDatumPresent()
    .txInRedeemerValue(updateRedeemer)
    // **The two lines that make this an update rather than a withdrawal.** Send
    // the whole value straight back, beacon included...
    .txOut(oracleAddress(policyId, operator, networkId), oracleUtxo.output.amount)
    // ...carrying a new rate. The old UTxO dies and its replacement is born in
    // the same transaction, which is what "changing data" means here.
    .txOutInlineDatumValue(newRate)
    // The signature the validator looks for.
    .requiredSignerHash(operator)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(await spendableUtxos(wallet))
    .complete();
}
// #endregion oracle-update

/// Close the oracle: take the ADA back and burn the beacon.
///
/// The burn is what the contract insists on. Without it the beacon would sit in
/// the operator's wallet, and a token that once meant "this is the oracle"
/// could be locked again beside a rate nobody agreed to.
export async function buildOracleDeleteTx(
  wallet: IWallet,
  provider: IFetcher,
  deployment: Deployment,
  oracleUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const { policyId, operator, collateral } = await spendContext(wallet, deployment);

  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    .spendingPlutusScriptV3()
    .txIn(
      oracleUtxo.input.txHash,
      oracleUtxo.input.outputIndex,
      oracleUtxo.output.amount,
      oracleUtxo.output.address,
    )
    .txInScript(oracleScriptCbor(policyId, operator))
    .txInInlineDatumPresent()
    .txInRedeemerValue(deleteRedeemer)
    // Destroying a token is minting a negative amount of it.
    .mintPlutusScriptV3()
    .mint("-1", policyId, BEACON_NAME_HEX)
    .mintingScript(beaconScriptCbor(deployment.seed))
    .mintRedeemerValue(burnRedeemer)
    .requiredSignerHash(operator)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(await spendableUtxos(wallet))
    .complete();
}

/// The three values both spends need, looked up once.
async function spendContext(wallet: IWallet, deployment: Deployment) {
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }
  return {
    policyId: beaconPolicyId(deployment.seed),
    operator: deployment.operator,
    collateral,
  };
}
