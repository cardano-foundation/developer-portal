// The import below uses this project's own layout, where the blueprint sits in
// `blueprints/`. The reader's sits in `on-chain/vault/`, so the `#replace`
// directive renders their path in the docs while this file keeps the one it
// needs to run. Both this note and the directive stay out of the page.
// #region file
import { applyParamsToScript, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";

// The blueprint your `aiken build` wrote, and the only file that names its path.
// #replace ../../blueprints/vault.plutus.json -> ../../../on-chain/vault/plutus.json
import blueprint from "../../blueprints/vault.plutus.json" with { type: "json" };

export { blueprint };

// #region admin-const
// The admin key this vault is compiled around. It fixes the address, so it has
// to stay the same forever.
const ADMIN = "00000000000000000000000000000000000000000000000000000000";
// #endregion admin-const

const PLUTUS_VERSION = "V3";

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The compiled contract, with the admin key built into it.
// #region params
export const vaultScriptCbor = applyParamsToScript(compiledCode(blueprint, "vault.vault.spend"), [ADMIN]);
// #endregion params

/// The token's policy, a second script. It takes no parameter, so the list of
/// values to fill in is empty and every reader compiles the same bytes.
export const vaultTokenScriptCbor = applyParamsToScript(compiledCode(blueprint, "vault.vault_policy.mint"), []);

/// The script's address: the hash of that script, written for one network.
export function vaultAddress(networkId: number): string {
  return serializePlutusScript(
    { code: vaultScriptCbor, version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// The policy script's hash, which is the policy id the token is filed under.
export function vaultTokenPolicyId(): string {
  return resolveScriptHash(vaultTokenScriptCbor, PLUTUS_VERSION);
}
// #endregion file
