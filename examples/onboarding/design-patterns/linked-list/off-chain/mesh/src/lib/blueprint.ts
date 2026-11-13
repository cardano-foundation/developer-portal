import {
  applyParamsToScript,
  mConStr0,
  mConStr1,
  mOutputReference,
  resolveScriptHash,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";
import blueprint from "../../blueprints/linked-list.plutus.json" with { type: "json" };

// #region types
export const VERSIONS = ["naive", "byHand", "withLibrary"] as const;
export type Version = typeof VERSIONS[number];
export type Entry = { key: string; label: string };
export type Scripts = {
  version: Version;
  cbor: string;
  policy: string;
  address: string;
  proofCbor: string;
  proofAddress: string;
};
export const ROOT = "";
export const PREFIX = stringToHex("NODE");
// #endregion types
const TITLES = {
  naive: "naive.registry_array",
  byHand: "by_hand.registry_list",
  withLibrary: "with_library.registry_list",
};
const PROOFS = {
  naive: "proofs.naive",
  byHand: "proofs.by_hand",
  withLibrary: "proofs.with_library",
};

// #region deployment
export function scripts(
  version: Version,
  seed: { txHash: string; outputIndex: number },
  operator: string,
): Scripts {
  const cbor = applyParamsToScript(code(`${TITLES[version]}.else`), [
    mOutputReference(seed.txHash, seed.outputIndex),
    operator,
  ]);
  const policy = resolveScriptHash(cbor, "V3");
  const address = serializePlutusScript({ code: cbor, version: "V3" }, undefined, 0).address;
  const proofCbor = applyParamsToScript(code(`${PROOFS[version]}.else`), [policy]);
  const proofAddress = serializePlutusScript({ code: proofCbor, version: "V3" }, undefined, 0).address;
  return { version, cbor, policy, address, proofCbor, proofAddress };
}

function code(title: string): string {
  const script = blueprint.validators.find((v) => v.title === title);
  if (!script) throw new Error(`missing validator ${title}`);
  return script.compiledCode;
}
// #endregion deployment

// #region data
/// A 28-byte fixed-width ordering key. The fixture uses even keys so each gap
/// has a missing odd key to prove absent.
export function keyOf(n: number): string {
  return n.toString(16).padStart(56, "0");
}

export function entryData(entry: Entry) {
  return mConStr0([entry.key, mConStr0([stringToHex(entry.label)])]);
}

export function arrayDatum(entries: Entry[]) {
  return mConStr0([entries.map(entryData)]);
}

/// Element(Root(version) | Node(label), Some(next key) | None).
export function elementDatum(entry: Entry | undefined, next?: string) {
  const data = entry
    ? mConStr1([mConStr0([stringToHex(entry.label)])])
    : mConStr0([mConStr0([0])]);
  return mConStr0([data, next === undefined ? mConStr1([]) : mConStr0([next])]);
}
// #endregion data
