import { applyCborEncoding, mConStr0, serializePlutusScript } from "@meshsdk/core";
import type { Proof } from "./tree.ts";
import { proofData } from "./tree.ts";
import blueprint from "../../blueprints/merkle-tree.plutus.json" with { type: "json" };

// #region versions
export const VERSIONS = ["naive", "byHand", "withLibrary"] as const;
export type Version = typeof VERSIONS[number];
// #endregion versions
const TITLES = { naive: "naive.listed_grant", byHand: "by_hand.committed_grant", withLibrary: "with_library.committed_grant" };

export function grantScript(version: Version): string {
  const title = `${TITLES[version]}.else`;
  const script = blueprint.validators.find((v) => v.title === title);
  if (!script) throw new Error(`missing validator ${title}`);
  return applyCborEncoding(script.compiledCode);
}

export function grantAddress(version: Version): string {
  return serializePlutusScript({ code: grantScript(version), version: "V3" }, undefined, 0).address;
}

// #region data
/// Datum comes from the funder's chosen allowlist/root, never from the claim.
export function grantDatum(version: Version, members: string[], root: string) {
  return mConStr0([version === "naive" ? members : root]);
}

export function claimRedeemer(version: Version, beneficiary: string, proof: Proof) {
  return version === "naive" ? beneficiary : mConStr0([beneficiary, proofData(proof)]);
}
// #endregion data
