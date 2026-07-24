import { MeshTxBuilder, resolveSlotNo } from "@meshsdk/core";
import type { BrowserWallet } from "@meshsdk/core";

// #region deadline
/// Send 1 ADA to yourself, but make the transaction valid only for the next ~2
/// minutes. On-chain code can't read "now", so time is set as a slot *window* on
/// the transaction. Off-chain we DO know the wall clock, so we convert "now + 2
/// min" into a slot number and cap the transaction with an upper bound
/// (`invalidHereafter`, also called the TTL). Submit within the window and it
/// works; miss it and the ledger rejects the transaction, no clock required.
export async function sendWithDeadline(wallet: BrowserWallet): Promise<string> {
  const address = await wallet.getChangeAddress();

  // Convert "now + 120 seconds" (POSIX milliseconds) into a Preview slot number.
  const deadlineSlot = resolveSlotNo("preview", Date.now() + 120_000);

  const unsignedTx = await new MeshTxBuilder()
    .txOut(address, [{ unit: "lovelace", quantity: "1000000" }]) // 1 ADA back to yourself
    .invalidHereafter(Number(deadlineSlot)) // valid only up to this slot
    .changeAddress(address)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  return await wallet.submitTx(signedTx);
}
// #endregion deadline
