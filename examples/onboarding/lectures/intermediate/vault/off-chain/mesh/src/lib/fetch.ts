// #region file
import { deserializeDatum } from "@meshsdk/core";
import type { IFetcher, UTxO } from "@meshsdk/core";

import { vaultAddress } from "./blueprint.ts";

/// The owner named in a locked UTxO's datum, or `undefined` if it has no datum
/// this contract can read.
function ownerOf(utxo: UTxO): string | undefined {
  try {
    return String(deserializeDatum(utxo.output.plutusData ?? "").fields[0].bytes);
  } catch {
    return undefined;
  }
}

/// The UTxOs locked at the contract that name **you** as the owner.
export async function fetchLocked(
  provider: IFetcher,
  networkId: number,
  ownerPubKeyHash: string,
): Promise<UTxO[]> {
  const all = await provider.fetchAddressUTxOs(vaultAddress(networkId));
  return all.filter((utxo) => ownerOf(utxo) === ownerPubKeyHash);
}
// #endregion file
