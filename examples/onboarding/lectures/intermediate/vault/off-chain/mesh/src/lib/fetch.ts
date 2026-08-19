// #region file
import { deserializeDatum } from "@meshsdk/core";
import type { IFetcher, UTxO } from "@meshsdk/core";

import { vaultAddress } from "./blueprint.ts";

/// Read the owner back out of a locked UTxO's datum. Returns `undefined` if the
/// UTxO has no datum, or carries one this contract cannot read, anyone may send
/// funds to a script address, including by mistake.
function ownerOf(utxo: UTxO): string | undefined {
  try {
    return String(deserializeDatum(utxo.output.plutusData ?? "").fields[0].bytes);
  } catch {
    return undefined;
  }
}

/// Read the UTxOs locked at the contract that name **you** as the owner.
///
/// The filter is the part worth understanding. A script address is not yours: it
/// is the hash of the contract, so everyone who compiles this same contract gets
/// the same address, and everything they lock sits here alongside yours. Fetching
/// without filtering returns their UTxOs too, and the validator will refuse when
/// you try to spend one, because its datum names someone else.
///
/// What makes a UTxO yours is the datum, not the address.
export async function fetchLocked(
  provider: IFetcher,
  networkId: number,
  ownerPubKeyHash: string,
): Promise<UTxO[]> {
  const all = await provider.fetchAddressUTxOs(vaultAddress(networkId));
  return all.filter((utxo) => ownerOf(utxo) === ownerPubKeyHash);
}
// #endregion file
