import { MeshTxBuilder, mOutputReference } from "@meshsdk/core";
import type { Asset, IFetcher } from "@meshsdk/core";

import { swapScriptCbor } from "./blueprint.ts";
import { swapRedeemer } from "./datum.ts";
import type { Offer } from "./fetch-offers.ts";
import type { Wallet } from "./wallet.ts";

// #region swap
/// Build an unsigned transaction that fulfills `offer`: spend the locked UTxO,
/// pay the owner the price in an output *marked with the offer UTxO's reference*
/// (the double-satisfaction guard the validator checks), and take the asset.
export async function buildSwapTx(
  wallet: Wallet,
  provider: IFetcher,
  offer: Offer,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) throw new Error("wallet has no collateral UTxO");

  // The offer already stores the owner's full wallet address, so pay them there
  // directly, the validator checks the payment goes to this exact address.
  const ownerAddress = offer.owner;
  const price: Asset[] = offer.price.map((asset) => ({
    unit: asset.policyId + asset.assetName,
    quantity: asset.quantity,
  }));

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
    .txInRedeemerValue(swapRedeemer)
    // Pay the owner the price, in an output marked with the offer's reference.
    .txOut(ownerAddress, price)
    .txOutInlineDatumValue(
      mOutputReference(offer.utxo.input.txHash, offer.utxo.input.outputIndex),
    )
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
// #endregion swap
