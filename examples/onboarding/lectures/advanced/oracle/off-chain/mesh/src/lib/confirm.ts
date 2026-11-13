import type { IFetcher } from "@meshsdk/core";

/// How many blocks sit on top of the block holding `txHash`. Zero while it is
/// still waiting for a block, or while the provider has not seen it yet.
export async function confirmationsOf(fetcher: IFetcher, txHash: string): Promise<number> {
  try {
    const tx = await fetcher.fetchTxInfo(txHash);
    const block = await fetcher.fetchBlockInfo(tx.block);
    return block.confirmations;
  } catch {
    return 0;
  }
}

/// Wait until `depth` blocks sit on top of the transaction.
///
/// A transaction in the newest block can still be rolled back, and a deployment
/// built on one that was rolled back points at UTxOs that no longer exist. The
/// chance of that falls with every block added on top, so a deployment waits
/// for some before it writes anything down.
// #region wait-for-confirmations
export async function waitForConfirmations(
  fetcher: IFetcher,
  txHash: string,
  depth: number,
  { intervalMs = 20_000, timeoutMs = 20 * 60_000 } = {},
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const confirmations = await confirmationsOf(fetcher, txHash);
    if (confirmations >= depth) return;
    if (Date.now() > deadline) {
      throw new Error(`${txHash}: ${confirmations} of ${depth} confirmations, giving up`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
// #endregion wait-for-confirmations
