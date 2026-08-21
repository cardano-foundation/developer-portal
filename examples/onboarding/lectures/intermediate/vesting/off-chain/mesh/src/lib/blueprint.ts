import { applyParamsToScript, serializePlutusScript } from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this contract, copied in from
// `../../on-chain/aiken/plutus.json`. The title is `<file>.<validator>.<purpose>`,
// and the validator is in `vesting.ak`.
import blueprint from "../../blueprints/vesting.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The compiled contract. Unlike the vault, vesting takes no parameter — the
/// deadline lives in each UTxO's datum, not in the code — so the list is empty
/// and every vested UTxO shares one address.
export const vestingScriptCbor = applyParamsToScript(
  compiledCode(blueprint, "vesting.vesting.spend"),
  [],
);

/// The script's address: the hash of that script, written for one network.
export function vestingAddress(networkId: number): string {
  return serializePlutusScript(
    { code: vestingScriptCbor, version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}
