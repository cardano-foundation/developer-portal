import { createHash } from "node:crypto";
import {
  applyCborEncoding, applyParamsToScript, deserializeAddress, mConStr0, mPubKeyAddress, mScriptAddress,
  resolveScriptHash, resolveScriptRef, serializePlutusScript, serializeRewardAddress,
} from "@meshsdk/core";
import type { Data } from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";
import blueprint from "../../blueprints/merkelized-validator.plutus.json" with { type: "json" };

// #region types
export const VERSIONS = ["naive", "byHand", "withLibrary"] as const;
export type Version = typeof VERSIONS[number];
export type Source = "inline" | "reference";
export type Price = { serviceId: string; unitPrice: number };
export type Policy = { catalogue: Price[]; codes: string[] };
export type Script = { cbor: string; hash: string; size: number; scriptRef: string; address: string; rewardAddress: string };
export type Deployment = { version: Version; root: Script; quote?: Script; code?: Script };
export type Voucher = { owner: string; serviceId: string; units: number; redemptionCode: string };
// #endregion types

/// Synthetic policy fixtures, embedded as immutable deployment parameters.
export function policyOf(count = 96): Policy {
  const digest = (text: string) => createHash("sha256").update(text).digest("hex");
  return {
    catalogue: Array.from({ length: count }, (_, n) => ({ serviceId: digest(`service:${n}`), unitPrice: 2_000_000 + n * 10_000 })),
    codes: Array.from({ length: count }, (_, n) => digest(`redemption:${n}`)),
  };
}

// #region script
function compiled(title: string) {
  const validator = blueprint.validators.find((v) => v.title === `${title}.else`);
  if (!validator) throw new Error(`missing validator ${title}`);
  return validator.compiledCode;
}

function script(title: string, params: Data[]): Script {
  const cbor = applyParamsToScript(compiled(title), params);
  const hash = resolveScriptHash(cbor, "V3");
  const scriptRef = resolveScriptRef({ code: cbor, version: "V3" });
  // Ledger fees count raw script bytes, excluding CBOR/version wrappers.
  const size = scriptRefObject(scriptRef).plutus_script()!.bytes().length;
  return {
    cbor, hash, size, scriptRef,
    address: serializePlutusScript({ code: cbor, version: "V3" }, undefined, 0).address,
    rewardAddress: serializeRewardAddress(hash, true, 0),
  };
}

/// Mesh providers use the unwrapped [version, script] representation. CSL's
/// ScriptRef parser expects tag 24 around a CBOR bytestring containing it.
export function scriptRefObject(scriptRef: string) {
  return csl.ScriptRef.from_hex("d818" + applyCborEncoding(scriptRef));
}
// #endregion script

// #region deployment
/// Instantiate workers first; their hashes are immutable parameters of the gate.
export function deploy(version: Version, merchant: string, policy: Policy): Deployment {
  const address = csl.Address.from_bech32(merchant);
  if (!csl.BaseAddress.from_address(address) && !csl.EnterpriseAddress.from_address(address)) {
    throw new Error("Merchant must be a base or enterprise payment address");
  }
  const catalogue = policy.catalogue.map(({ serviceId, unitPrice }) => mConStr0([serviceId, unitPrice]));
  const { pubKeyHash, scriptHash, stakeCredentialHash, stakeScriptCredentialHash } = deserializeAddress(merchant);
  const stakeHash = stakeCredentialHash || stakeScriptCredentialHash || undefined;
  const stakeIsScript = Boolean(stakeScriptCredentialHash);
  const merchantData = pubKeyHash
    ? mPubKeyAddress(pubKeyHash, stakeHash, stakeIsScript)
    : mScriptAddress(scriptHash, stakeHash, stakeIsScript);
  if (version === "naive") {
    return { version, root: script("naive.monolith", [merchantData, catalogue, policy.codes]) };
  }
  const module = version === "byHand" ? "workers_by_hand" : "workers_with_library";
  const quote = script(`${module}.quotation`, [catalogue]);
  const code = script(`${module}.redemption`, [policy.codes]);
  const root = script(`${version === "byHand" ? "by_hand" : "with_library"}.gate`, [merchantData, quote.hash, code.hash]);
  return { version, root, quote, code };
}
// #endregion deployment

// #region data
export function voucherDatum(v: Voucher) {
  return mConStr0([v.owner, v.serviceId, v.units, v.redemptionCode]);
}

export function quoteInput(v: Voucher) {
  return mConStr0([v.serviceId, v.units]);
}

export function quotedPrice(policy: Policy, v: Voucher): number {
  const entry = policy.catalogue.find((p) => p.serviceId === v.serviceId);
  if (!entry || v.units < 1 || v.units > 1_000) throw new Error("invalid purchase request");
  return entry.unitPrice * v.units;
}
// #endregion data
