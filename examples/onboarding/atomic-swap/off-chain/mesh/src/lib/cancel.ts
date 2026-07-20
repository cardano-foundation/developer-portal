import { MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import type { IFetcher } from "@meshsdk/core";

import { swapScriptCbor } from "./blueprint.ts";
import { cancelRedeemer } from "./datum.ts";
import type { Offer } from "./fetch-offers.ts";
import type { Wallet } from "./wallet.ts";

// #region cancel
/// Build an unsigned transaction that cancels `offer`: the owner spends their own
/// locked UTxO with the `Cancel` redeemer and takes the asset back (it returns as
/// change). The validator only allows this if the owner signs, so we add the
/// owner's key as a required signer.
export async function buildCancelTx(
  wallet: Wallet,
  provider: IFetcher,
  offer: Offer,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const ownerPubKeyHash = deserializeAddress(changeAddress).pubKeyHash;
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) throw new Error("wallet has no collateral UTxO");

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    .spendingPlutusScriptV3()
    .txIn(
      offer.utxo.input.txHash,
      offer.utxo.input.outputIndex,
      offer.utxo.output.amount,
      offer.utxo.output.address,
    )
    .txInScript(swapScriptCbor)
    .txInInlineDatumPresent()
    .txInRedeemerValue(cancelRedeemer)
    // The validator checks the owner signed, so require their key.
    .requiredSignerHash(ownerPubKeyHash)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}
// #endregion cancel
