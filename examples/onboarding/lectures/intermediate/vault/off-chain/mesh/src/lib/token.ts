// #region file
import { MeshTxBuilder, mConStr0, stringToHex } from "@meshsdk/core";
import type { IFetcher, IWallet } from "@meshsdk/core";

import { vaultTokenPolicyId, vaultTokenScriptCbor } from "./blueprint.ts";

/// The token name the policy allows, as the contract spells it.
export const TOKEN_NAME = "TOKEN A";

/// The token's **unit**: its policy id followed by its name in hex. That pair is
/// how the chain names one particular token, and every balance is filed under it.
export function tokenUnit(): string {
  return vaultTokenPolicyId() + stringToHex(TOKEN_NAME);
}

/// How many of the token this wallet holds right now. Nothing is built or sent
/// here, so this is a read, like `fetch.ts`.
export async function fetchTokenBalance(wallet: IWallet): Promise<string> {
  const balance = await wallet.getBalance();
  return balance.find((asset) => asset.unit === tokenUnit())?.quantity ?? "0";
}

/// Build a transaction that only changes how many tokens exist. A positive
/// `quantity` mints that many into your wallet, a negative one burns that many
/// out of it. The policy checks the name and ignores the amount, so the two
/// directions are one transaction with one sign changed.
export async function buildTokenTx(
  wallet: IWallet,
  provider: IFetcher,
  quantity: string,
): Promise<string> {
  // Where the wallet wants anything left over sent back to. Minted tokens land
  // here too, because nothing else in this transaction claims them.
  const changeAddress = await wallet.getChangeAddress();
  // Minting runs a script, so this transaction needs a deposit.
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }

  const policyId = vaultTokenPolicyId();
  // Token names travel as hex on the chain, so convert it once here.
  const tokenNameHex = stringToHex(TOKEN_NAME);
  const unit = tokenUnit();
  const burning = quantity.startsWith("-");
  const utxos = await wallet.getUtxos();

  // Burning destroys tokens you already hold, so the transaction has to spend
  // the UTxOs holding them. Minting has nothing to spend.
  const holding = burning
    ? utxos.filter((utxo) => utxo.output.amount.some((asset) => asset.unit === unit))
    : [];
  if (burning && holding.length === 0) {
    throw new Error(`no ${TOKEN_NAME} in this wallet to burn`);
  }

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  for (const utxo of holding) {
    txBuilder.txIn(
      utxo.input.txHash,
      utxo.input.outputIndex,
      utxo.output.amount,
      utxo.output.address,
    );
  }

  return await txBuilder
    // Everything that follows describes one Plutus V3 script minting.
    .mintPlutusScriptV3()
    // Positive creates tokens, negative destroys them. The policy allows any
    // amount, so long as this is the only name minted under it.
    .mint(quantity, policyId, tokenNameHex)
    // Carry the compiled policy, so the network can run its mint handler.
    .mintingScript(vaultTokenScriptCbor)
    // The mint handler ignores its redeemer, so an empty one is enough.
    .mintRedeemerValue(mConStr0([]))
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
    .selectUtxosFrom(utxos)
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion file
