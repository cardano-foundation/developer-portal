import {
  applyParamsToScript,
  mConStr0,
  resolveScriptHash,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this contract, copied in from
// `../../on-chain/aiken/plutus.json`. It holds three validators: the beacon
// policy, the oracle, and the consumer that reads it as a reference input.
import blueprint from "../../blueprints/oracle.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// The token name the beacon policy allows, as the contract spells it.
export const BEACON_NAME = "ORACLE";

/// Token names travel as hex on the chain, so convert it once here.
export const BEACON_NAME_HEX = stringToHex(BEACON_NAME);

/// The UTxO an oracle was seeded from. Everything else here is derived from it,
/// so this pair of values is the whole identity of one deployed oracle.
export type Seed = { txHash: string; outputIndex: number };

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// Nothing here has an address until a seed is chosen, so these are functions
/// rather than constants. The chain runs one way:
///
///   seed UTxO -> beacon policy id -> oracle parameters -> oracle address
///
/// #region derivation
/// The policy, compiled around the one UTxO that has to be spent to mint. An
/// `OutputReference` is a constructor holding a transaction id and an index.
export function beaconScriptCbor(seed: Seed): string {
  return applyParamsToScript(compiledCode(blueprint, "beacon.beacon.mint"), [
    mConStr0([seed.txHash, seed.outputIndex]),
  ]);
}

/// That script's hash, which is the policy id its token is filed under.
export function beaconPolicyId(seed: Seed): string {
  return resolveScriptHash(beaconScriptCbor(seed), PLUTUS_VERSION);
}

/// The oracle, compiled around `OracleParams { beacon, operator }`. The inner
/// constructor is the `AssetClass`, the outer one is the record holding it.
export function oracleScriptCbor(policyId: string, operator: string): string {
  return applyParamsToScript(compiledCode(blueprint, "oracle.oracle.spend"), [
    mConStr0([mConStr0([policyId, BEACON_NAME_HEX]), operator]),
  ]);
}

/// The oracle's address: the hash of that filled-in script, for one network.
/// Change either parameter and this is a different address.
export function oracleAddress(policyId: string, operator: string, networkId: number): string {
  return scriptAddress(oracleScriptCbor(policyId, operator), networkId);
}
// #endregion derivation

/// The unit a beacon travels under: its policy id followed by its name in hex.
export function beaconUnit(policyId: string): string {
  return policyId + BEACON_NAME_HEX;
}

/// The consumer, compiled around the same beacon the oracle was. It takes no
/// operator: reading the rate is open to everyone, only updating is not.
export function consumerScriptCbor(policyId: string): string {
  return applyParamsToScript(compiledCode(blueprint, "consumer.consumer.spend"), [
    mConStr0([policyId, BEACON_NAME_HEX]),
  ]);
}

export function consumerAddress(policyId: string, networkId: number): string {
  return scriptAddress(consumerScriptCbor(policyId), networkId);
}

/// The consumer's hash, which is how a published copy of it is recognized.
export function consumerScriptHash(policyId: string): string {
  return resolveScriptHash(consumerScriptCbor(policyId), PLUTUS_VERSION);
}

function scriptAddress(cbor: string, networkId: number): string {
  return serializePlutusScript({ code: cbor, version: PLUTUS_VERSION }, undefined, networkId)
    .address;
}
