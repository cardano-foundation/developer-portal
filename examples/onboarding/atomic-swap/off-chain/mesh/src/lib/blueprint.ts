import {
  applyParamsToScript,
  resolveScriptHash,
  serializePlutusScript,
} from "@meshsdk/core";

import blueprint from "../../plutus.json" with { type: "json" };

// #region blueprint
// The compiled contract lives in `plutus.json`, produced by `aiken build` in
// ../../on-chain/aiken and copied here so the off-chain project is self-contained.

const PLUTUS_VERSION = "V3";

function compiledCode(title: string): string {
  const validator = blueprint.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in plutus.json`);
  return validator.compiledCode;
}

/// The swap validator takes no parameters, so its script is fixed.
export const swapScriptCbor = applyParamsToScript(compiledCode("swap.swap.spend"), []);

/// Every offer is locked at this one script address.
export function swapAddress(networkId: number): string {
  return serializePlutusScript(
    { code: swapScriptCbor, version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// The minting policy is parameterized by the owner's key hash, so Alice and Bob
/// each get a distinct policy id and therefore a distinct token.
export function mintScriptCbor(ownerPubKeyHash: string): string {
  return applyParamsToScript(compiledCode("mint.token.mint"), [ownerPubKeyHash]);
}

export function tokenPolicyId(ownerPubKeyHash: string): string {
  return resolveScriptHash(mintScriptCbor(ownerPubKeyHash), PLUTUS_VERSION);
}
// #endregion blueprint
