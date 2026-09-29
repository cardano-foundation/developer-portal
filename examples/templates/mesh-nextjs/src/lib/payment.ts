import { MeshTxBuilder } from "@meshsdk/core";
import type { IFetcher, IWallet, Protocol } from "@meshsdk/core";

// Builds an unsigned payment of `lovelace` to `to`, funded and changed back to
// the connected wallet. It only builds: the caller has the wallet sign and
// submit. `params` are the live protocol parameters the fee is priced with.
export async function buildPaymentTx(
  wallet: IWallet,
  fetcher: IFetcher,
  params: Protocol,
  to: string,
  lovelace: number,
): Promise<string> {
  return new MeshTxBuilder({ fetcher, params })
    .txOut(to, [{ unit: "lovelace", quantity: lovelace.toString() }])
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}
