import { MeshTxBuilder } from "@meshsdk/core";
import type { BrowserWallet } from "@meshsdk/core";

// #region send-ada
/// Send 1 ADA from the connected wallet back to itself, then sign and submit it.
/// It uses only the connected browser wallet, no external provider: the wallet
/// gives up the UTxOs (your "bags") to spend, signs the transaction, and submits
/// it. Sending to yourself is the simplest way to watch a real transaction appear
/// on the explorer, with no second wallet to set up.
export async function sendAdaToSelf(wallet: BrowserWallet): Promise<string> {
  const myAddress = await wallet.getChangeAddress();

  // Build: pay 1 ADA to your own address, the change comes back to you too.
  // The builder picks which of your bags to spend and adds the change output.
  const unsignedTx = await new MeshTxBuilder()
    .txOut(myAddress, [{ unit: "lovelace", quantity: "1000000" }]) // 1 ADA = 1,000,000 lovelace
    .changeAddress(myAddress)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  // Sign (prove it's really you) and submit (send it), both through the wallet.
  const signedTx = await wallet.signTx(unsignedTx);
  return await wallet.submitTx(signedTx);
}
// #endregion send-ada
