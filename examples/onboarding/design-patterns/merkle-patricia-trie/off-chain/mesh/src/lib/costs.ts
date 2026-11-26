import { DEFAULT_PROTOCOL_PARAMETERS, mConStr0, serializeData } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";
import { csl, deserializeTx } from "@meshsdk/core-csl";
import { Trie } from "@aiken-lang/merkle-patricia-forestry";
import { scriptSize } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { offlineChain } from "./offline.ts";
import { buildChangeTx, buildReleasePaymentTx } from "./registry.ts";
import {
  nameHex,
  proveRegister,
  proveRelease,
  proveResolution,
  proveRetarget,
  register,
  release,
  retarget,
  rootOf,
} from "./trie.ts";

/// The registry sizes measured: how many names it holds before the change.
export const TRIE_SIZES = [10, 100, 1000, 10000] as const;
export const NAIVE_SIZES = [10, 100] as const;

/// The size the other operations are measured at.
export const OPERATIONS_AT = 100;

export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};

/// What one transaction costs: every script run added up, the fee in
/// lovelace, its signed size in bytes, the proof's size in bytes (none for the naive
/// registry), and whether it fits in one transaction.
export type Cost = { mem: number; cpu: number; fee: number; size: number; proofBytes: number; fits: boolean };

export type Operation = "register" | "retarget" | "release" | "resolve";

/// Everything `npm run bench` writes to `costs.json`.
export type Costs = {
  limits: typeof LIMITS;
  versions: Record<Version, { register: Record<string, Cost>; operations: Record<string, Cost>; scriptSize: number }>;
  /// Largest pre-insertion count for this fixture and builder.
  naiveLimit: { largestExisting: number; last: Cost; next: Cost | null };
  /// A small registry and one proof from it, for the page to show.
  example: Example;
};

/// Eight names, each pointing at a key, and the proof that one of them is there.
export type Example = { names: string[]; root: string; name: string; steps: unknown };

export const EXAMPLE_NAMES = ["alice", "bob", "carol", "dave", "erin", "frank", "grace", "heidi"];

/// The example: a registry of eight names, and the proof for "carol", which
/// shares its first step with "heidi".
export async function example(): Promise<Example> {
  const trie = await Trie.fromList(
    EXAMPLE_NAMES.map((name, i) => ({ key: name, value: Buffer.from(targetAt(i), "hex") })),
  );
  return { names: EXAMPLE_NAMES, root: rootOf(trie), name: "carol", steps: (await trie.prove("carol")).toJSON() };
}

/// Name `i`, and the key it points to: fixed, so every run measures the same.
const nameAt = (i: number) => `name-${i}`;
const targetAt = (i: number) => (i + 1).toString(16).padStart(56, "0");

const tries = new Map<number, Trie>();

/// A trie holding names 0 to `size - 1`, built once and reused. Preparing a
/// change leaves it at its confirmed root.
async function filledTrie(size: number): Promise<Trie> {
  let trie = tries.get(size);
  if (!trie) {
    trie = await Trie.fromList(
      Array.from({ length: size }, (_, i) => ({ key: nameAt(i), value: Buffer.from(targetAt(i), "hex") })),
    );
    tries.set(size, trie);
  }
  return trie;
}

/// The naive registry's datum for names 0 to `size - 1`: newest first, as
/// registering builds it.
function naiveNames(size: number): Map<string, string> {
  const names = new Map<string, string>();
  for (let i = size - 1; i >= 0; i--) names.set(nameHex(nameAt(i)), targetAt(i));
  return names;
}

const NEWCOMER = "newcomer";

/// Measure `operation` on a registry already holding `size` names, on a fresh
/// chain.
export async function measure(version: Version, operation: Operation, size: number): Promise<Cost> {
  const chain = await offlineChain();
  // Evaluate during construction so fees include the actual execution budget.
  // Script failures are errors, rather than being reported as capacity limits.
  let tx: () => Promise<string>;
  let proof: Data = mConStr0([]);

  if (version === "naive") {
    const registry = { ...chain.registry(version), funding: chain.funding };
    const names = naiveNames(size);
    const current = chain.registryAt(version, names);
    const first = nameHex(nameAt(0));
    switch (operation) {
      case "register":
        tx = () => buildChangeTx(registry, current, register(NEWCOMER, chain.alice, proof), new Map([[nameHex(NEWCOMER), chain.alice], ...names]), { name: NEWCOMER, quantity: 1 });
        break;
      case "retarget":
        tx = () => buildChangeTx(
          registry,
          current,
          retarget(nameAt(0), targetAt(0), chain.bob, proof),
          new Map([...names].map(([k, v]) => [k, k === first ? chain.bob : v])),
          undefined,
          chain.holding(version, chain.aliceAddress, nameAt(0)),
        );
        break;
      case "release":
        tx = () => buildChangeTx(
          registry,
          current,
          release(nameAt(0), targetAt(0), proof),
          new Map([...names].filter(([k]) => k !== first)),
          { name: nameAt(0), quantity: -1 },
          chain.holding(version, chain.aliceAddress, nameAt(0)),
        );
        break;
      case "resolve":
        throw new Error("the naive registry has no contract that pays a name");
    }
  } else {
    const registry = { ...chain.registry(version), funding: chain.funding };
    const trie = await filledTrie(size);
    const current = chain.registryAt(version, rootOf(trie));
    switch (operation) {
      case "register": {
        const change = await proveRegister(trie, NEWCOMER, chain.alice);
        proof = change.proof;
        tx = () => buildChangeTx(registry, current, register(NEWCOMER, chain.alice, proof), change.after, { name: NEWCOMER, quantity: 1 });
        break;
      }
      case "retarget": {
        const change = await proveRetarget(trie, nameAt(0), chain.bob);
        proof = change.proof;
        tx = () => buildChangeTx(
          registry,
          current,
          retarget(nameAt(0), targetAt(0), chain.bob, proof),
          change.after,
          undefined,
          chain.holding(version, chain.aliceAddress, nameAt(0)),
        );
        break;
      }
      case "release": {
        const change = await proveRelease(trie, nameAt(0));
        proof = change.proof;
        tx = () => buildChangeTx(
          registry,
          current,
          release(nameAt(0), targetAt(0), proof),
          change.after,
          { name: nameAt(0), quantity: -1 },
          chain.holding(version, chain.aliceAddress, nameAt(0)),
        );
        break;
      }
      case "resolve": {
        const resolution = await proveResolution(trie, nameAt(0));
        proof = resolution.proof;
        tx = () => buildReleasePaymentTx(registry, chain.paidToName(version, nameAt(0), "10000000"), current, resolution);
        break;
      }
    }
  }

  const unsignedTx = await tx();
  const outputs = deserializeTx(unsignedTx).body().outputs();
  const dataCost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(String(DEFAULT_PROTOCOL_PARAMETERS.coinsPerUtxoSize)));
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    if (BigInt(output.amount().coin().to_str()) < BigInt(csl.min_ada_for_output(output, dataCost).to_str())) {
      throw new Error(`benchmark output ${i} is below minimum ADA`);
    }
  }
  const runs = await chain.evaluator.evaluateTx(unsignedTx, [], []);
  const mem = runs.reduce((total, run) => total + run.budget.mem, 0);
  const cpu = runs.reduce((total, run) => total + run.budget.steps, 0);
  const txSize = (await chain.aliceWallet.signTx(unsignedTx)).length / 2;
  return {
    mem, cpu,
    fee: Number(deserializeTx(unsignedTx).body().fee().to_str()),
    size: txSize,
    proofBytes: version === "naive" ? 0 : serializeData(proof).length / 2,
    fits: mem <= LIMITS.mem && cpu <= LIMITS.cpu && txSize <= LIMITS.size,
  };
}

/// Whether registering into a naive registry of `size` names fits. Far past
/// the size limit Mesh refuses to build at all, which also means it does not.
async function naiveCost(size: number): Promise<Cost | null> {
  try {
    return await measure("naive", "register", size);
  } catch (error) {
    if (String(error).includes("Maximum Input Count Exceeded")) return null;
    throw error;
  }
}

export async function naiveLimit(): Promise<Costs["naiveLimit"]> {
  let fitting = 0;
  let failing = 1;
  while ((await naiveCost(failing))?.fits) {
    fitting = failing;
    failing *= 2;
  }
  while (failing - fitting > 1) {
    const middle = Math.floor((fitting + failing) / 2);
    if ((await naiveCost(middle))?.fits) fitting = middle;
    else failing = middle;
  }
  return { largestExisting: fitting, last: (await naiveCost(fitting))!, next: await naiveCost(failing) };
}

export async function measureAll(): Promise<Costs> {
  const versions = {} as Costs["versions"];
  for (const version of ["naive", "withLibrary"] as Version[]) {
    const sizes = version === "naive" ? NAIVE_SIZES : TRIE_SIZES;
    const registerCosts: Record<string, Cost> = {};
    for (const size of sizes) registerCosts[size] = await measure(version, "register", size);
    const operations: Record<string, Cost> = {};
    const ops: Operation[] = version === "naive" ? ["retarget", "release"] : ["retarget", "release", "resolve"];
    for (const op of ops) operations[op] = await measure(version, op, OPERATIONS_AT);
    versions[version] = { register: registerCosts, operations, scriptSize: scriptSize(version) };
  }
  return { limits: LIMITS, versions, naiveLimit: await naiveLimit(), example: await example() };
}
