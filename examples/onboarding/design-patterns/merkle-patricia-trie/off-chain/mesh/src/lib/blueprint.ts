import {
  applyParamsToScript,
  mOutputReference,
  resolveScriptHash,
  serializePlutusScript,
} from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this project, copied in from
// `../../on-chain/aiken/plutus.json`. It holds the naive list registry, the
// registry using Merkle Patricia Forestry, and the contract that pays a name.
import blueprint from "../../blueprints/merkle-patricia-trie.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// Every version of the registry, by the validator's title without its handler.
export const VERSIONS = {
  naive: "naive.registry",
  withLibrary: "with_library.registry",
} as const;

export type Version = keyof typeof VERSIONS;

/// The registry token's name: empty. Names are minted under the same policy.
export const REGISTRY_TOKEN = "";

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(title: string): string {
  const validator = (blueprint as Blueprint).validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The registry, compiled around the UTxO its creation spends. Its spend and
/// mint handlers share this one script, so its address and its policy ID are
/// the same hash.
export function registryScriptCbor(version: Version, seed: UTxO): string {
  return applyParamsToScript(compiledCode(`${VERSIONS[version]}.spend`), [
    mOutputReference(seed.input.txHash, seed.input.outputIndex),
  ]);
}

export function registryPolicy(version: Version, seed: UTxO): string {
  return resolveScriptHash(registryScriptCbor(version, seed), PLUTUS_VERSION);
}

export function registryAddress(version: Version, seed: UTxO, networkId: number): string {
  return serializePlutusScript(
    { code: registryScriptCbor(version, seed), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// The contract that pays a name, compiled around the registry it reads.
export function namePaymentScriptCbor(registryPolicyId: string): string {
  return applyParamsToScript(compiledCode("name_payment.name_payment.spend"), [registryPolicyId]);
}

export function namePaymentAddress(registryPolicyId: string, networkId: number): string {
  return serializePlutusScript(
    { code: namePaymentScriptCbor(registryPolicyId), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// The size of a compiled script, in bytes.
export function scriptSize(version: Version): number {
  return compiledCode(`${VERSIONS[version]}.spend`).length / 2;
}
