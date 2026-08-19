// The import below uses this project's own layout, where the blueprint sits in
// `blueprints/`. The reader's sits in `on-chain/vault/`, so the `#replace`
// directive renders their path in the docs while this file keeps the one it
// needs to run. Both this note and the directive stay out of the page.
// #region file
import { applyParamsToScript, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";

// The blueprint your `aiken build` wrote, and the only file that names its
// path. The title is `<file>.<validator>.<purpose>`, and your validator is in
// `vault.ak`.
// #replace ../../blueprints/vault.plutus.json -> ../../../on-chain/vault/plutus.json
import blueprint from "../../blueprints/vault.plutus.json" with { type: "json" };

export { blueprint };

// #region recovery-const
// The recovery key your vault was compiled around: the parameter from the
// parameters lecture, filling the blank the compiler left. Any key hash works,
// but it fixes the address, so it has to be the same every time.
const RECOVERY = "00000000000000000000000000000000000000000000000000000000";
// #endregion recovery-const

const PLUTUS_VERSION = "V3";

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The compiled contract, with the recovery key built into it.
// #region params
export const vaultScriptCbor = applyParamsToScript(compiledCode(blueprint, "vault.vault.spend"), [RECOVERY]);
// #endregion params

/// The script's address: the hash of that script, written for one network.
/// Anything sent here can only be spent if the validator says yes.
export function vaultAddress(networkId: number): string {
  return serializePlutusScript(
    { code: vaultScriptCbor, version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// The same hash, read as a **policy id**.
export function vaultPolicyId(): string {
  return resolveScriptHash(vaultScriptCbor, PLUTUS_VERSION);
}
// #endregion file
