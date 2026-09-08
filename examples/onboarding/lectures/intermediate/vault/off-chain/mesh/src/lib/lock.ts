// #region file
import { MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import type { Asset, IFetcher, IWallet } from "@meshsdk/core";

import { vaultAddress } from "./blueprint.ts";
import { vaultDatum } from "./datum.ts";

/// Build a transaction that **locks** `assets` at the contract's address, with a
/// datum naming the connected wallet as the owner. A UTxO holds a bundle, so
/// this takes the whole list: ADA on its own, or ADA and tokens together.
export async function buildLockTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  assets: Asset[],
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside that address. This is what makes you the owner.
  const owner = deserializeAddress(changeAddress).pubKeyHash;

  // The builder. `fetcher` is how it looks up UTxOs and protocol parameters.
  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    // Create an output at the contract's address, holding the funds. Whatever is
    // in this bundle is what comes back when the owner unlocks it.
    .txOut(vaultAddress(networkId), assets)
    // Attach the note that names you. `Inline` means it is stored on the UTxO
    // itself, in full, rather than as a hash the spender has to supply later.
    .txOutInlineDatumValue(vaultDatum(owner))
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover this.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion file
