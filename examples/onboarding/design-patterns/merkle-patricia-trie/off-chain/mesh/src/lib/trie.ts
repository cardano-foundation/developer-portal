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
  const size = Buffer.byteLength(name, "utf8");
  if (size < 1 || size > 32) throw new Error("a registered name must be 1–32 UTF-8 bytes");
  return Buffer.from(name, "utf8").toString("hex");
}

/// A payment verification-key hash, encoded as exactly 28 bytes of hex.
export function targetHash(target: string): string {
  if (!/^[0-9a-fA-F]{56}$/.test(target)) throw new Error("target must be a 28-byte hexadecimal key hash");
  return target.toLowerCase();
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
  mConStr0([nameHex(name), targetHash(target), proof]);
export const retarget = (name: string, from: string, to: string, proof: Data) =>
  mConStr1([nameHex(name), targetHash(from), targetHash(to), proof]);
export const release = (name: string, target: string, proof: Data) =>
  mConStr2([nameHex(name), targetHash(target), proof]);

// #region changes
export type PreparedChange = {
  before: string;
  after: string;
  proof: Data;
  /// Call only after observing `after` in the authenticated registry on-chain.
  confirm: (observedRoot: string) => Promise<void>;
};

/// Prepare an insertion without advancing the confirmed local trie.
export async function proveRegister(trie: Trie, name: string, target: string): Promise<PreparedChange> {
  nameHex(name);
  const value = Buffer.from(targetHash(target), "hex");
  return exclusive(trie, async () => {
    if (await trie.get(name)) throw new Error(`${name} is already registered`);
    const proof = await trie.prove(name, true);
    expectRoot(proof.verify(false, name), rootOf(trie));
    proof.setValue(value);
    return pending(trie, proof, hashHex(proof.verify(true, name)), async () => { await trie.insert(name, value); });
  });
}

/// One proof covers both values: the key and its neighbors stay in place.
export async function proveRetarget(trie: Trie, name: string, to: string): Promise<PreparedChange> {
  nameHex(name);
  const value = Buffer.from(targetHash(to), "hex");
  return exclusive(trie, async () => {
    const proof = await trie.prove(name);
    expectRoot(proof.verify(true, name), rootOf(trie));
    proof.setValue(value);
    return pending(trie, proof, hashHex(proof.verify(true, name)), async () => {
      await trie.delete(name);
      await trie.insert(name, value);
    });
  });
}

/// Prepare a deletion, proving the name while it is still present.
export async function proveRelease(trie: Trie, name: string): Promise<PreparedChange> {
  nameHex(name);
  return exclusive(trie, async () => {
    const proof = await trie.prove(name);
    expectRoot(proof.verify(true, name), rootOf(trie));
    return pending(trie, proof, hashHex(proof.verify(false, name)), async () => { await trie.delete(name); });
  });
}

/// Where `name` points, with the proof, for the contract that pays a name.
export async function proveResolution(trie: Trie, name: string): Promise<{ target: string; proof: Data }> {
  nameHex(name);
  return exclusive(trie, async () => {
    const target = await trie.get(name);
    if (!target) throw new Error(`${name} is not registered`);
    return { target: targetHash(target.toString("hex")), proof: proofData(await trie.prove(name)) };
  });
}
// #endregion changes

// #region confirmation
function pending(trie: Trie, proof: Proof, after: string, apply: () => Promise<void>): PreparedChange {
  const before = rootOf(trie);
  let confirmed = false;
  return {
    before, after, proof: proofData(proof),
    confirm: (observedRoot) => exclusive(trie, async () => {
      if (confirmed) throw new Error("this change was already confirmed");
      if (observedRoot !== after) throw new Error("the on-chain root does not confirm this change; resync the trie");
      if (rootOf(trie) !== before) throw new Error("the local trie has advanced; discard this change and resync");
      await apply();
      expectRoot(trie.hash, after);
      confirmed = true;
    }),
  };
}
// #endregion confirmation

const hashHex = (hash: Buffer | null): string => hash?.toString("hex") ?? EMPTY_ROOT;

function expectRoot(hash: Buffer | null, expected: string): void {
  if (hashHex(hash) !== expected) throw new Error("trie root mismatch; resync from confirmed history");
}

// The library temporarily inserts/removes a missing key while generating an
// absence proof. Serialize access through these helpers; do not mutate the
// supplied Trie directly while a helper is running.
const busy = new WeakSet<Trie>();
async function exclusive<T>(trie: Trie, run: () => Promise<T>): Promise<T> {
  if (busy.has(trie)) throw new Error("the trie is busy; await its current operation");
  busy.add(trie);
  try { return await run(); }
  finally { busy.delete(trie); }
}
