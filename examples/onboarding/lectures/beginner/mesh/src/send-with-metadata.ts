import { MeshTxBuilder } from "@meshsdk/core";
import type { BrowserWallet } from "@meshsdk/core";

// #region metadata
/// Send a tiny transaction to yourself with a metadata "memo" attached. The
/// metadata rides along with the transaction and is stored on-chain forever, it
/// isn't money, just a note. Label 674 with a `msg` array is the community
/// standard (CIP-20) for a plain transaction message.
export async function sendWithMetadata(wallet: BrowserWallet, message: string): Promise<string> {
  const address = await wallet.getChangeAddress();

  const unsignedTx = await new MeshTxBuilder()
    .txOut(address, [{ unit: "lovelace", quantity: "1000000" }]) // 1 ADA back to yourself
    .metadataValue(674, { msg: [message] }) // the memo: label 674, CIP-20 message
    .changeAddress(address)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  return await wallet.submitTx(signedTx);
}
// #endregion metadata
