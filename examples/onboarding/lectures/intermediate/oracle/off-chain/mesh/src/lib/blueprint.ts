import { applyParamsToScript, serializePlutusScript } from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this contract, copied in from
// `../../on-chain/aiken/plutus.json`. It holds two validators: the oracle, and
// the consumer that reads it as a reference input.
import blueprint from "../../blueprints/oracle.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

function scriptAddress(cbor: string, networkId: number): string {
  return serializePlutusScript({ code: cbor, version: PLUTUS_VERSION }, undefined, networkId)
    .address;
}

/// The oracle: a UTxO whose datum gets replaced instead of released.
export const oracleScriptCbor = applyParamsToScript(
  compiledCode(blueprint, "oracle.oracle.spend"),
  [],
);

export function oracleAddress(networkId: number): string {
  return scriptAddress(oracleScriptCbor, networkId);
}

/// The consumer: a contract that reads the oracle's datum without spending it.
export const consumerScriptCbor = applyParamsToScript(
  compiledCode(blueprint, "consumer.consumer.spend"),
  [],
);

export function consumerAddress(networkId: number): string {
  return scriptAddress(consumerScriptCbor, networkId);
}
