import { MeshTxBuilder } from "@meshsdk/core";
import type { Asset, IFetcher } from "@meshsdk/core";

import { swapAddress } from "./blueprint.ts";
import { offerDatum, type PricedAsset } from "./datum.ts";
import type { Wallet } from "./wallet.ts";

// #region lock
/// Build an unsigned transaction that locks `assets` at the swap contract with
/// an offer datum saying the owner (the connected wallet) wants `price` back.
export async function buildLockTx(
  wallet: Wallet,
  provider: IFetcher,
  networkId: number,
  assets: Asset[],
  price: PricedAsset[],
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    .txOut(swapAddress(networkId), assets)
    .txOutInlineDatumValue(offerDatum({ owner: changeAddress, price }))
    .changeAddress(changeAddress)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}
// #endregion lock
