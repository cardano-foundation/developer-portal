import {
  applyCborEncoding,
  deserializeAddress,
  mConStr0,
  mPubKeyAddress,
  resolveScriptHash,
  serializePlutusScript,
} from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this project, copied in from
// `../../on-chain/aiken/plutus.json`. It holds three versions of the grant,
// the naive one and the normalized one written by hand and with the library,
// and two of the grant whose period is an interval in its datum.
import blueprint from "../../blueprints/validity-range.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// Every version of the grant in the blueprint, by the validator's title
/// without its handler.
export const VERSIONS = {
  naive: "naive.linear_vesting",
  byHand: "by_hand.linear_vesting",
  withLibrary: "with_library.linear_vesting",
  // The second example: the vesting period is an interval in the datum.
  scheduledNaive: "scheduled_naive.scheduled_vesting",
  scheduled: "scheduled.scheduled_vesting",
} as const;

export type Version = keyof typeof VERSIONS;

/// Whether `version` reads its period from an interval in the datum.
export function isScheduled(version: Version): boolean {
  return version === "scheduledNaive" || version === "scheduled";
}

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The grant's script. It takes no parameters: every grant at one version
/// shares one address, and each UTxO's datum says whose grant it is.
export function grantScriptCbor(version: Version): string {
  return applyCborEncoding(compiledCode(blueprint, `${VERSIONS[version]}.spend`));
}

/// The size of the grant's compiled script, in bytes.
export function scriptSize(version: Version): number {
  return compiledCode(blueprint, `${VERSIONS[version]}.spend`).length / 2;
}

/// The grant's hash.
export function grantHash(version: Version): string {
  return resolveScriptHash(grantScriptCbor(version), PLUTUS_VERSION);
}

/// Where grants are locked.
export function grantAddress(version: Version, networkId: number): string {
  return serializePlutusScript(
    { code: grantScriptCbor(version), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

// #region grant
/// A grant, as the off-chain code holds it. Times are POSIX milliseconds,
/// amounts are lovelace, the same units the validator reads.
export type Grant = {
  /// Who the grant vests to.
  beneficiaryAddress: string;
  /// The address of whoever may claw it back. Only its key goes in the datum.
  grantorAddress: string;
  start: number;
  end: number;
  total: bigint;
};

/// The grant as the datum the validator reads: `Grant` in `lib/vesting.ak`,
/// field for field.
export function grantDatum(grant: Grant) {
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(grant.beneficiaryAddress);
  return mConStr0([
    mPubKeyAddress(pubKeyHash, stakeCredentialHash || undefined),
    deserializeAddress(grant.grantorAddress).pubKeyHash,
    grant.start,
    grant.end,
    grant.total,
  ]);
}
// #endregion grant
