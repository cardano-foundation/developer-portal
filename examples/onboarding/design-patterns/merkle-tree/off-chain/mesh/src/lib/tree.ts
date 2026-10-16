import { createHash } from "node:crypto";
import { mConStr0, mConStr1 } from "@meshsdk/core";

// #region types
/// Left/right describe where the sibling goes in the concatenation.
export type Step = { side: "left" | "right"; hash: string };
export type Proof = Step[];
export type Tree =
  | { kind: "leaf"; hash: string; size: 1; member: string }
  | { kind: "branch"; hash: string; size: number; left: Tree; right: Tree };
// #endregion types

// #region hashes
/// SHA-256 over decoded bytes, not over the printable hex characters.
export function sha256(hex: string): string {
  return createHash("sha256").update(Buffer.from(hex, "hex")).digest("hex");
}

/// Exactly the Aiken serialise_member bytes: 00 || 28-byte payment key hash.
export function leafHash(member: string): string {
  if (!/^[0-9a-f]{56}$/i.test(member)) {
    throw new Error("a member must be a 28-byte key hash");
  }
  return sha256("00" + member);
}

export function combine(left: string, right: string): string {
  if (!/^[0-9a-f]{64}$/i.test(left) || !/^[0-9a-f]{64}$/i.test(right)) {
    throw new Error("a branch needs two 32-byte digests");
  }
  return sha256(left + right);
}
// #endregion hashes

// #region construction
/// Preserve the publisher's order. A non-power-of-two list splits at floor(n/2),
/// exactly like aiken-merkle-tree: no duplication or padding of the last leaf.
export function fromList(members: string[]): Tree | undefined {
  const normalized = members.map((member) => member.toLowerCase());
  if (new Set(normalized).size !== normalized.length) {
    throw new Error("duplicate allowlist member");
  }
  const leaves = normalized.map((member) => ({
    kind: "leaf" as const,
    hash: leafHash(member),
    size: 1 as const,
    member,
  }));
  function build(start: number, end: number): Tree {
    if (end - start === 1) return leaves[start]!;
    const middle = start + Math.floor((end - start) / 2);
    const left = build(start, middle);
    const right = build(middle, end);
    return {
      kind: "branch",
      hash: combine(left.hash, right.hash),
      size: end - start,
      left,
      right,
    };
  }
  return leaves.length === 0 ? undefined : build(0, leaves.length);
}

/// With an off-chain member-to-index map, proof generation follows one path.
/// The returned siblings are ordered from the leaf toward the root.
export function proofAt(tree: Tree, index: number): Proof {
  if (!Number.isInteger(index) || index < 0 || index >= tree.size) {
    throw new Error("member index out of range");
  }
  if (tree.kind === "leaf") return [];
  if (index < tree.left.size) {
    return [...proofAt(tree.left, index), { side: "right", hash: tree.right.hash }];
  }
  return [
    ...proofAt(tree.right, index - tree.left.size),
    { side: "left", hash: tree.left.hash },
  ];
}
// #endregion construction

// #region encoding
/// Wire format for the Aiken validator's public Step constructors.
export function proofData(proof: Proof) {
  return proof.map(({ side, hash }) =>
    side === "left" ? mConStr0([hash]) : mConStr1([hash]),
  );
}
// #endregion encoding
