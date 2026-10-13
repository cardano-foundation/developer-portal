import { mConStr0, mConStr1, mConStr2 } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";
import { Proof, Trie } from "@aiken-lang/merkle-patricia-forestry";

// The registry's names, kept off-chain. The chain holds only the trie's root;
// whoever builds a transaction needs the whole trie, to prove a change.

/// The root of the empty trie, as the on-chain library defines it.
export const EMPTY_ROOT = "00".repeat(32);

/// The trie's root. The off-chain library has none for an empty trie.
export function rootOf(trie: Trie): string {
  return trie.hash ? trie.hash.toString("hex") : EMPTY_ROOT;
}

/// A name, as the bytes the trie and the chain use.
export function nameHex(name: string): string {
  return Buffer.from(name, "utf8").toString("hex");
}

type Step =
  | { type: "branch"; skip: number; neighbors: string }
  | { type: "fork"; skip: number; neighbor: { nibble: number; prefix: string; root: string } }
  | { type: "leaf"; skip: number; neighbor: { key: string; value: string } };

// #region proof-data
/// A proof as the data the validator reads: `Proof` in the on-chain library,
/// a list of `Branch`, `Fork` and `Leaf` steps.
export function proofData(proof: Proof): Data {
  return (proof.toJSON() as Step[]).map((step) => {
    switch (step.type) {
      case "branch":
        return mConStr0([step.skip, step.neighbors]);
      case "fork":
        return mConStr1([
          step.skip,
          mConStr0([step.neighbor.nibble, step.neighbor.prefix, step.neighbor.root]),
        ]);
      case "leaf":
        return mConStr2([step.skip, step.neighbor.key, step.neighbor.value]);
    }
  });
}
// #endregion proof-data

/// The redeemers: `Action` in `lib/names.ak`. `proof` is `Void` for the
/// naive registry.
export const register = (name: string, target: string, proof: Data) =>
  mConStr0([nameHex(name), target, proof]);
export const retarget = (name: string, from: string, to: string, proof: Data) =>
  mConStr1([nameHex(name), from, to, proof]);
export const release = (name: string, target: string, proof: Data) =>
  mConStr2([nameHex(name), target, proof]);

// #region changes
/// Register `name` in `trie`, pointing at `target`. Returns the proof the
/// validator needs, and changes `trie` to match the chain once the
/// transaction lands.
export async function proveRegister(trie: Trie, name: string, target: string): Promise<Data> {
  await trie.insert(name, Buffer.from(target, "hex"));
  // Proved with the name in: read without it, the same proof gives the old root.
  return proofData(await trie.prove(name));
}

/// Point `name` at `to` instead of `from`. One proof covers both: the key and
/// its neighbors stay where they are, only the value changes.
export async function proveRetarget(trie: Trie, name: string, to: string): Promise<Data> {
  const proof = proofData(await trie.prove(name));
  await trie.delete(name);
  await trie.insert(name, Buffer.from(to, "hex"));
  return proof;
}

/// Remove `name`. Proved with the name still in.
export async function proveRelease(trie: Trie, name: string): Promise<Data> {
  const proof = proofData(await trie.prove(name));
  await trie.delete(name);
  return proof;
}

/// Where `name` points, with the proof, for the contract that pays a name.
export async function proveResolution(trie: Trie, name: string): Promise<{ target: string; proof: Data }> {
  const target = await trie.get(name);
  if (!target) throw new Error(`${name} is not registered`);
  return { target: target.toString("hex"), proof: proofData(await trie.prove(name)) };
}
// #endregion changes
