import { deserializeDatum } from "@meshsdk/core";
import type { IFetcher, UTxO } from "@meshsdk/core";

import { vestingAddress } from "./blueprint.ts";

/// The beneficiary named in a vested UTxO's datum, or `undefined` if it carries
/// nothing this contract can read.
function beneficiaryOf(utxo: UTxO): string | undefined {
  try {
    return String(deserializeDatum(utxo.output.plutusData ?? "").fields[0].bytes);
  } catch {
    return undefined;
  }
}

/// Read the vested UTxOs that name **you** as the beneficiary.
///
/// The contract takes no parameter, so its address is the same for everyone who
/// compiles it, and everything they vest sits here too. Claiming one of theirs
/// would be refused: the datum names them, not you. What makes a UTxO yours is
/// the datum, not the address.
export async function fetchVested(
  provider: IFetcher,
  networkId: number,
  beneficiaryPubKeyHash: string,
): Promise<UTxO[]> {
  const all = await provider.fetchAddressUTxOs(vestingAddress(networkId));
  return all.filter((utxo) => beneficiaryOf(utxo) === beneficiaryPubKeyHash);
}
