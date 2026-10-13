import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MeshTxBuilder, mConStr0, serializeData } from "@meshsdk/core";
import { Trie } from "@aiken-lang/merkle-patricia-forestry";
import { registryPolicy, registryScriptCbor } from "./lib/blueprint.ts";
import type { Version } from "./lib/blueprint.ts";
import { NAIVE_SIZES, OPERATIONS_AT, TRIE_SIZES, example, largestNaiveRegistry, measure } from "./lib/costs.ts";
import type { Costs, Operation } from "./lib/costs.ts";
import { offlineChain } from "./lib/offline.ts";
import { buildChangeTx, buildGenesisTx, buildReleasePaymentTx } from "./lib/registry.ts";
import {
  EMPTY_ROOT,
  nameHex,
  proofData,
  proveRegister,
  proveRelease,
  proveResolution,
  proveRetarget,
  register,
  release,
  retarget,
  rootOf,
} from "./lib/trie.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

type Chain = Awaited<ReturnType<typeof offlineChain>>;
const TRIES = ["byHand", "withLibrary"] as const;
const VOID = mConStr0([]);

function tags(runs: { tag: string }[]): string[] {
  return runs.map((run) => run.tag).sort();
}

/// Run a transaction's scripts. Built without the evaluator, so a refusal
/// comes from running it here.
const run = (chain: Chain, tx: Promise<string>) => tx.then((t) => chain.evaluator.evaluateTx(t, [], []));

/// The registry, built without running the scripts.
const unchecked = (chain: Chain, version: Version) => ({ ...chain.registry(version), evaluator: undefined });

// ---------------------------------------------------------------------------
// Proofs: what the off-chain library proves is what the validator reads.

test("a proof converted to data is byte for byte the library's own CBOR", async () => {
  const trie = await Trie.fromList(
    Array.from({ length: 300 }, (_, i) => ({ key: `name-${i}`, value: Buffer.alloc(28, i % 256) })),
  );
  const kinds = new Set<string>();
  for (let i = 0; i < 300; i++) {
    const proof = await trie.prove(`name-${i}`);
    for (const step of proof.toJSON() as { type: string }[]) kinds.add(step.type);
    assert.equal(serializeData(proofData(proof)), proof.toCBOR().toString("hex"));
  }
  // Every kind of step was exercised.
  assert.deepEqual([...kinds].sort(), ["branch", "fork", "leaf"]);
});

// ---------------------------------------------------------------------------
// The whole life of a name, through every version.

for (const version of TRIES) {
  test(`${version}: genesis, register, retarget, release and pay a name`, async () => {
    const chain = await offlineChain();
    const registry = chain.registry(version);
    const trie = new Trie();
    assert.deepEqual(tags(await run(chain, buildGenesisTx(registry, EMPTY_ROOT))), ["MINT"]);

    let current = chain.registryAt(version, EMPTY_ROOT);
    for (const name of ["alice", "bob", "carol"]) {
      const proof = await proveRegister(trie, name, chain.alice);
      const tx = buildChangeTx(registry, current, register(name, chain.alice, proof), rootOf(trie), { name, quantity: 1 });
      assert.deepEqual(tags(await run(chain, tx)), ["MINT", "SPEND"]);
      current = chain.registryAt(version, rootOf(trie));
    }

    const proof = await proveRetarget(trie, "bob", chain.bob);
    const holder = chain.holding(version, chain.aliceAddress, "bob");
    const retargeted = buildChangeTx(registry, current, retarget("bob", chain.alice, chain.bob, proof), rootOf(trie), undefined, holder);
    assert.deepEqual(tags(await run(chain, retargeted)), ["SPEND"]);
    current = chain.registryAt(version, rootOf(trie));

    const releaseProof = await proveRelease(trie, "carol");
    const carol = chain.holding(version, chain.aliceAddress, "carol");
    const released = buildChangeTx(registry, current, release("carol", chain.alice, releaseProof), rootOf(trie), { name: "carol", quantity: -1 }, carol);
    assert.deepEqual(tags(await run(chain, released)), ["MINT", "SPEND"]);
    current = chain.registryAt(version, rootOf(trie));

    const payment = chain.paidToName(version, "bob", "10000000");
    const paid = buildReleasePaymentTx(registry, payment, current, await proveResolution(trie, "bob"));
    assert.deepEqual(tags(await run(chain, paid)), ["SPEND"]);
  });
}

test("naive: genesis, register, retarget and release", async () => {
  const chain = await offlineChain();
  const registry = chain.registry("naive");
  assert.deepEqual(tags(await run(chain, buildGenesisTx(registry, new Map()))), ["MINT"]);
  const one = new Map([[nameHex("alice"), chain.alice]]);
  let current = chain.registryAt("naive", new Map());
  assert.deepEqual(
    tags(await run(chain, buildChangeTx(registry, current, register("alice", chain.alice, VOID), one, { name: "alice", quantity: 1 }))),
    ["MINT", "SPEND"],
  );
  current = chain.registryAt("naive", one);
  const holder = chain.holding("naive", chain.aliceAddress, "alice");
  const moved = new Map([[nameHex("alice"), chain.bob]]);
  assert.deepEqual(
    tags(await run(chain, buildChangeTx(registry, current, retarget("alice", chain.alice, chain.bob, VOID), moved, undefined, holder))),
    ["SPEND"],
  );
  current = chain.registryAt("naive", moved);
  const burn = chain.holding("naive", chain.aliceAddress, "alice");
  assert.deepEqual(
    tags(await run(chain, buildChangeTx(registry, current, release("alice", chain.bob, VOID), new Map(), { name: "alice", quantity: -1 }, burn))),
    ["MINT", "SPEND"],
  );
});

// ---------------------------------------------------------------------------
// Attacks. Each one is checked next to the honest transaction it changes, so
// a refusal cannot come from a broken helper.

/// A registry of 50 names, with "alice" among them, pointing at Alice.
async function fiftyNames(chain: Chain) {
  const trie = await Trie.fromList(
    Array.from({ length: 49 }, (_, i) => ({ key: `name-${i}`, value: Buffer.alloc(28, i + 1) })),
  );
  await trie.insert("alice", Buffer.from(chain.alice, "hex"));
  return trie;
}

for (const version of TRIES) {
  test(`theft: ${version} refuses registering a name that is taken`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const current = chain.registryAt(version, rootOf(trie));
    const registry = unchecked(chain, version);
    // Honest: a free name.
    const proof = await proveRegister(trie, "dave", chain.bob);
    await run(chain, buildChangeTx(registry, current, register("dave", chain.bob, proof), rootOf(trie), { name: "dave", quantity: 1 }));
    await trie.delete("dave");
    // The attack: claim "alice" for Bob. A proof that she is there, and the
    // root with her pointing at Bob, are the best Bob can offer.
    const aliceProof = proofData(await trie.prove("alice"));
    await trie.delete("alice");
    await trie.insert("alice", Buffer.from(chain.bob, "hex"));
    await assert.rejects(
      run(chain, buildChangeTx(registry, current, register("alice", chain.bob, aliceProof), rootOf(trie), { name: "alice", quantity: 1 })),
      /"tag":"spend"/,
    );
  });

  test(`theft: ${version} refuses a new root the proof does not give`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const before = rootOf(trie);
    const current = chain.registryAt(version, before);
    const registry = unchecked(chain, version);
    const proof = await proveRegister(trie, "dave", chain.bob);
    await run(chain, buildChangeTx(registry, current, register("dave", chain.bob, proof), rootOf(trie), { name: "dave", quantity: 1 }));
    // The same proof, but the registry left as it was: the name is minted and
    // never recorded.
    await assert.rejects(
      run(chain, buildChangeTx(registry, current, register("dave", chain.bob, proof), before, { name: "dave", quantity: 1 })),
      /"tag":"spend"/,
    );
  });

  test(`theft: ${version} refuses retargeting by anyone but the holder`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const current = chain.registryAt(version, rootOf(trie));
    const proof = await proveRetarget(trie, "alice", chain.bob);
    const action = retarget("alice", chain.alice, chain.bob, proof);
    // Honest: Alice spends her "alice" token.
    const registry = unchecked(chain, version);
    await run(chain, buildChangeTx(registry, current, action, rootOf(trie), undefined, chain.holding(version, chain.aliceAddress, "alice")));
    // The attack: Bob, holding a token for another name.
    const bobs = unchecked(chain, version);
    bobs.wallet = chain.bobWallet;
    await assert.rejects(
      run(chain, buildChangeTx(bobs, current, action, rootOf(trie), undefined, chain.holding(version, chain.bobAddress, "name-1"))),
      /"tag":"spend"/,
    );
  });

  test(`theft: ${version} refuses releasing a name without burning its token`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const current = chain.registryAt(version, rootOf(trie));
    const proof = await proveRelease(trie, "alice");
    const registry = unchecked(chain, version);
    await run(chain, buildChangeTx(registry, current, release("alice", chain.alice, proof), rootOf(trie), { name: "alice", quantity: -1 }, chain.holding(version, chain.aliceAddress, "alice")));
    // The name leaves the registry, but its token stays in circulation.
    await assert.rejects(
      run(chain, buildChangeTx(registry, current, release("alice", chain.alice, proof), rootOf(trie))),
      /"tag":"spend"/,
    );
  });

  test(`theft: ${version} refuses minting a name without the registry`, async () => {
    const chain = await offlineChain();
    const registry = chain.registry(version);
    const script = registryScriptCbor(version, chain.seed);
    const collateral = (await chain.aliceWallet.getCollateral())[0]!;
    const tx = new MeshTxBuilder({ fetcher: chain.fetcher })
      .mintPlutusScriptV3()
      .mint("1", registryPolicy(version, chain.seed), nameHex("alice"))
      .mintingScript(script)
      .mintRedeemerValue(VOID)
      .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
      .changeAddress(chain.aliceAddress)
      .selectUtxosFrom((await registry.wallet.getUtxos()).filter((u) => u.input.txHash !== collateral.input.txHash))
      .complete();
    await assert.rejects(run(chain, tx), /"tag":"mint"/);
  });

  // A proof is valid only against the root it was made from. Once "alice"
  // points at Bob, the proof that she pointed at Alice proves nothing.
  test(`theft: ${version} refuses paying a name with a stale proof`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const stale = await proveResolution(trie, "alice");
    await proveRetarget(trie, "alice", chain.bob);
    const current = chain.registryAt(version, rootOf(trie));
    const registry = unchecked(chain, version);
    await run(chain, buildReleasePaymentTx(registry, chain.paidToName(version, "alice", "10000000"), current, await proveResolution(trie, "alice")));
    await assert.rejects(
      run(chain, buildReleasePaymentTx(registry, chain.paidToName(version, "alice", "10000000"), current, stale)),
      /"tag":"spend"/,
    );
  });
}

test("theft: naive refuses registering a name that is taken", async () => {
  const chain = await offlineChain();
  const names = new Map([[nameHex("alice"), chain.alice]]);
  const current = chain.registryAt("naive", names);
  const registry = unchecked(chain, "naive");
  await run(chain, buildChangeTx(registry, current, register("dave", chain.bob, VOID), new Map([[nameHex("dave"), chain.bob], ...names]), { name: "dave", quantity: 1 }));
  await assert.rejects(
    run(chain, buildChangeTx(registry, current, register("alice", chain.bob, VOID), new Map([[nameHex("alice"), chain.bob], ...names]), { name: "alice", quantity: 1 })),
    /"tag":"spend"/,
  );
});

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

for (const version of ["naive", "byHand", "withLibrary"] as Version[]) {
  test(`costs.json is up to date for ${version}`, async () => {
    const { register: registerCosts, operations } = recorded.versions[version];
    for (const size of version === "naive" ? NAIVE_SIZES : TRIE_SIZES) {
      assert.deepEqual(await measure(version, "register", size), registerCosts[size], `register at ${size}: run npm run bench`);
    }
    for (const [op, cost] of Object.entries(operations)) {
      assert.deepEqual(await measure(version, op as Operation, OPERATIONS_AT), cost, `${op}: run npm run bench`);
    }
  });
}

test("costs.json is up to date for the naive registry's largest size", async () => {
  assert.equal(await largestNaiveRegistry(), recorded.largestNaiveRegistry, "run npm run bench");
});

test("costs.json is up to date for the example proof", async () => {
  assert.deepEqual(await example(), recorded.example, "run npm run bench");
});
