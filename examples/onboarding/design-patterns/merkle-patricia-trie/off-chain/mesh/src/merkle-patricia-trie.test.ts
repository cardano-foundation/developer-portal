import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DEFAULT_PROTOCOL_PARAMETERS, MeshTxBuilder, mConStr0, mConStr1, serializeData } from "@meshsdk/core";
import type { Data, UTxO } from "@meshsdk/core";
import { csl, deserializeTx } from "@meshsdk/core-csl";
import { Trie } from "@aiken-lang/merkle-patricia-forestry";
import { registryPolicy, registryScriptCbor } from "./lib/blueprint.ts";
import type { Version } from "./lib/blueprint.ts";
import { NAIVE_SIZES, OPERATIONS_AT, TRIE_SIZES, example, naiveLimit, measure } from "./lib/costs.ts";
import type { Costs, Operation } from "./lib/costs.ts";
import { offlineChain } from "./lib/offline.ts";
import { buildChangeTx, buildGenesisTx, buildPayNameTx, buildReleasePaymentTx, holderOf } from "./lib/registry.ts";
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
  targetHash,
} from "./lib/trie.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

type Chain = Awaited<ReturnType<typeof offlineChain>>;
const TRIES = ["withLibrary"] as const;
const VOID = mConStr0([]);

function tags(runs: { tag: string }[]): string[] {
  return runs.map((run) => run.tag).sort();
}

/// Run a transaction's scripts. Built without the evaluator, so a refusal
/// comes from running it here.
const run = (chain: Chain, tx: Promise<string>) => tx.then((t) => chain.evaluator.evaluateTx(t, [], []));

/// The registry, built without running the scripts.
const unchecked = <V extends Version>(chain: Chain, version: V) => ({ ...chain.registry(version), evaluator: undefined });

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
    const genesis = await buildGenesisTx(registry, EMPTY_ROOT);
    assert.deepEqual(tags(await run(chain, Promise.resolve(genesis))), ["MINT"]);

    let current = chain.applyTx(genesis)[0]!;
    for (const name of ["alice", "bob", "carol"]) {
      const change = await proveRegister(trie, name, chain.alice);
      const tx = await buildChangeTx(registry, current, register(name, chain.alice, change.proof), change.after, { name, quantity: 1 });
      assert.deepEqual(tags(await run(chain, Promise.resolve(tx))), ["MINT", "SPEND"]);
      current = chain.applyTx(tx)[0]!;
      await change.confirm(rootDatum(current));
    }

    const change = await proveRetarget(trie, "bob", chain.bob);
    const holder = await holderOf(registry, "bob");
    assert.ok(holder);
    const retargeted = await buildChangeTx(registry, current, retarget("bob", chain.alice, chain.bob, change.proof), change.after, undefined, holder);
    assert.deepEqual(tags(await run(chain, Promise.resolve(retargeted))), ["SPEND"]);
    current = chain.applyTx(retargeted)[0]!;
    await change.confirm(rootDatum(current));

    const removal = await proveRelease(trie, "carol");
    const carol = await holderOf(registry, "carol");
    assert.ok(carol);
    const released = await buildChangeTx(registry, current, release("carol", chain.alice, removal.proof), removal.after, { name: "carol", quantity: -1 }, carol);
    assert.deepEqual(tags(await run(chain, Promise.resolve(released))), ["MINT", "SPEND"]);
    current = chain.applyTx(released)[0]!;
    await removal.confirm(rootDatum(current));

    const payment = chain.applyTx(await buildPayNameTx(registry, "bob", "10000000"))[0]!;
    const paid = buildReleasePaymentTx(registry, payment, current, await proveResolution(trie, "bob"));
    assert.deepEqual(tags(await run(chain, paid)), ["SPEND"]);
  });
}

function rootDatum(utxo: UTxO): string {
  return Buffer.from(csl.PlutusData.from_hex(utxo.output.plutusData!).as_bytes()!).toString("hex");
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
    const change = await proveRegister(trie, "dave", chain.bob);
    await run(chain, buildChangeTx(registry, current, register("dave", chain.bob, change.proof), change.after, { name: "dave", quantity: 1 }));
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
    const change = await proveRegister(trie, "dave", chain.bob);
    await run(chain, buildChangeTx(registry, current, register("dave", chain.bob, change.proof), change.after, { name: "dave", quantity: 1 }));
    // The same proof, but the registry left as it was: the name is minted and
    // never recorded.
    await assert.rejects(
      run(chain, buildChangeTx(registry, current, register("dave", chain.bob, change.proof), before, { name: "dave", quantity: 1 })),
      /"tag":"spend"/,
    );
  });

  test(`theft: ${version} refuses retargeting by anyone but the holder`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const current = chain.registryAt(version, rootOf(trie));
    const change = await proveRetarget(trie, "alice", chain.bob);
    const action = retarget("alice", chain.alice, chain.bob, change.proof);
    // Honest: Alice spends her "alice" token.
    const registry = unchecked(chain, version);
    await run(chain, buildChangeTx(registry, current, action, change.after, undefined, chain.holding(version, chain.aliceAddress, "alice")));
    // The attack: Bob, holding a token for another name.
    const bobs = unchecked(chain, version);
    bobs.wallet = chain.bobWallet;
    await assert.rejects(
      run(chain, buildChangeTx(bobs, current, action, change.after, undefined, chain.holding(version, chain.bobAddress, "name-1"))),
      /"tag":"spend"/,
    );
  });

  test(`theft: ${version} refuses releasing a name without burning its token`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const current = chain.registryAt(version, rootOf(trie));
    const change = await proveRelease(trie, "alice");
    const registry = unchecked(chain, version);
    await run(chain, buildChangeTx(registry, current, release("alice", chain.alice, change.proof), change.after, { name: "alice", quantity: -1 }, chain.holding(version, chain.aliceAddress, "alice")));
    // The name leaves the registry, but its token stays in circulation.
    await assert.rejects(
      run(chain, buildChangeTx(registry, current, release("alice", chain.alice, change.proof), change.after)),
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

  // Updating this key preserves the proof steps, but changes the value those
  // steps must accompany. The old target no longer matches the current root.
  test(`theft: ${version} refuses paying a name with a stale proof`, async () => {
    const chain = await offlineChain();
    const trie = await fiftyNames(chain);
    const stale = await proveResolution(trie, "alice");
    const change = await proveRetarget(trie, "alice", chain.bob);
    await change.confirm(change.after);
    const current = chain.registryAt(version, rootOf(trie));
    const registry = unchecked(chain, version);
    assert.deepEqual(stale.proof, (await proveResolution(trie, "alice")).proof);
    await run(chain, buildReleasePaymentTx(registry, chain.paidToName(version, "alice", "10000000"), current, { ...stale, target: chain.bob }));
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
// Regression checks: ledger funding, target bounds and staged local state.

function assertFunded(tx: string): void {
  const outputs = deserializeTx(tx).body().outputs();
  const cost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(String(DEFAULT_PROTOCOL_PARAMETERS.coinsPerUtxoSize)));
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    assert.ok(BigInt(output.amount().coin().to_str()) >= BigInt(csl.min_ada_for_output(output, cost).to_str()), `output ${i} is underfunded`);
  }
}

test("naive: a growing datum is topped up and removal preserves that deposit", async () => {
  const chain = await offlineChain();
  const registry = chain.registry("naive");
  const genesis = await buildGenesisTx(registry, new Map());
  let current = chain.applyTx(genesis)[0]!;
  let names = new Map<string, string>();
  // Cross the original 5 ADA funding limit using actual preceding outputs.
  for (let i = 0; i < 30; i++) {
    const name = `name-${i}`;
    names = new Map([[nameHex(name), chain.alice], ...names]);
    const tx = await buildChangeTx(registry, current, register(name, chain.alice, VOID), names, { name, quantity: 1 });
    assertFunded(tx);
    current = chain.applyTx(tx)[0]!;
  }
  const deposit = BigInt(current.output.amount.find((a) => a.unit === "lovelace")!.quantity);
  assert.ok(deposit > 5_000_000n);
  names.delete(nameHex("name-29"));
  const tx = await buildChangeTx(registry, current, release("name-29", chain.alice, VOID), names, { name: "name-29", quantity: -1 }, await holderOf(registry, "name-29"));
  assertFunded(tx);
  assert.equal(BigInt(deserializeTx(tx).body().outputs().get(0).amount().coin().to_str()), deposit);

  // The benchmark fixture's pre-existing datum must also be fundable.
  const many = new Map(Array.from({ length: 100 }, (_, i) => [nameHex(`name-${i}`), chain.alice]));
  const fixture = chain.registryAt("naive", many);
  assert.ok(BigInt(fixture.output.amount[0]!.quantity) > 5_000_000n);
  const next = new Map([[nameHex("newcomer"), chain.alice], ...many]);
  assertFunded(await buildChangeTx(registry, fixture, register("newcomer", chain.alice, VOID), next, { name: "newcomer", quantity: 1 }));
});

test("payment builders reject a naive registry before creating or releasing a payment", async () => {
  const chain = await offlineChain();
  const registry = chain.registry("naive");
  // @ts-expect-error Deliberately exercise the runtime guard as a JS caller.
  await assert.rejects(buildPayNameTx(registry, "alice", "10000000"), /requires a trie registry/);
  // @ts-expect-error Both entry points restrict the registry version.
  await assert.rejects(buildReleasePaymentTx(registry, chain.paidToName("naive", "alice", "10000000"), chain.registryAt("naive", new Map()), { target: chain.alice, proof: [] }), /requires a trie registry/);
});

for (const version of ["naive", ...TRIES] as const) {
  test(`${version}: the registry deposit cannot be withdrawn`, async () => {
    const chain = await offlineChain();
    const trie = new Trie();
    const change = await proveRegister(trie, "alice", chain.alice);
    const current = chain.registryAt(version, version === "naive" ? new Map() : EMPTY_ROOT);
    const proof = version === "naive" ? VOID : change.proof;
    const next = version === "naive" ? new Map([[nameHex("alice"), chain.alice]]) : change.after;
    await run(chain, buildChangeTx(unchecked(chain, version), current, register("alice", chain.alice, proof), next, { name: "alice", quantity: 1 }));
    const script = registryScriptCbor(version, chain.seed);
    const policy = registryPolicy(version, chain.seed);
    const collateral = (await chain.aliceWallet.getCollateral())[0]!;
    const attack = new MeshTxBuilder({ fetcher: chain.fetcher })
      .spendingPlutusScriptV3()
      .txIn(current.input.txHash, current.input.outputIndex, current.output.amount, current.output.address)
      .txInScript(script).txInInlineDatumPresent().txInRedeemerValue(register("alice", chain.alice, proof))
      .txOut(current.output.address, [{ unit: "lovelace", quantity: "2000000" }, { unit: policy, quantity: "1" }])
      .txOutInlineDatumValue(next)
      .mintPlutusScriptV3().mint("1", policy, nameHex("alice")).mintingScript(script).mintRedeemerValue(VOID)
      .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
      .changeAddress(chain.aliceAddress)
      .selectUtxosFrom((await chain.aliceWallet.getUtxos()).filter((u) => u.input.txHash !== collateral.input.txHash))
      .complete();
    await assert.rejects(run(chain, attack), /"tag":"spend"/);
  });

  test(`${version}: malformed targets fail on-chain even when local validation is bypassed`, async () => {
    const chain = await offlineChain();
    const registry = unchecked(chain, version);
    const one = await Trie.fromList([{ key: "alice", value: Buffer.from(chain.alice, "hex") }]);
    const current = chain.registryAt(version, version === "naive" ? new Map([[nameHex("alice"), chain.alice]]) : rootOf(one));
    const empty = chain.registryAt(version, version === "naive" ? new Map() : EMPTY_ROOT);
    const holder = chain.holding(version, chain.aliceAddress, "alice");
    const proof: Data = version === "naive" ? VOID : [];
    for (const target of ["", "00", "00".repeat(27), "00".repeat(29)]) {
      const malformed = await Trie.fromList([{ key: "alice", value: Buffer.from(target, "hex") }]);
      const next = version === "naive" ? new Map([[nameHex("alice"), target]]) : rootOf(malformed);
      await assert.rejects(run(chain, buildChangeTx(registry, empty, mConStr0([nameHex("alice"), target, proof]), next, { name: "alice", quantity: 1 })), /"tag":"spend"/);
      await assert.rejects(run(chain, buildChangeTx(registry, current, mConStr1([nameHex("alice"), chain.alice, target, proof]), next, undefined, holder)), /"tag":"spend"/);
    }
  });
}

test("prepared changes survive failed construction and cancellation without advancing the trie", async () => {
  const chain = await offlineChain();
  const trie = await fiftyNames(chain);
  const before = rootOf(trie);
  const pending = await proveRegister(trie, "dave", chain.bob);
  const current = chain.registryAt("withLibrary", before);
  await assert.rejects(buildChangeTx(chain.registry("withLibrary"), current, register("dave", chain.bob, pending.proof), before, { name: "dave", quantity: 1 }), /"tag":"spend"/);
  assert.equal(rootOf(trie), before);
  // A cancelled signing/submission needs no undo; prepare the same change again.
  const retry = await proveRegister(trie, "dave", chain.bob);
  assert.equal(retry.after, pending.after);
  assert.equal(await trie.get("dave"), undefined);
  await assert.rejects(retry.confirm(before), /does not confirm/);
  assert.equal(rootOf(trie), before);

  const tx = await buildChangeTx(chain.registry("withLibrary"), current, register("dave", chain.bob, retry.proof), retry.after, { name: "dave", quantity: 1 });
  const observed = chain.applyTx(tx)[0]!;
  await retry.confirm(rootDatum(observed));
  assert.equal((await trie.get("dave"))!.toString("hex"), chain.bob);
  await assert.rejects(pending.confirm(pending.after), /local trie has advanced/);
  await assert.rejects(retry.confirm(retry.after), /already confirmed/);

  const update = await proveRetarget(trie, "dave", chain.alice);
  const removal = await proveRelease(trie, "dave");
  assert.equal(rootOf(trie), retry.after);
  assert.equal((await trie.get("dave"))!.toString("hex"), chain.bob);
  await update.confirm(update.after);
  await assert.rejects(removal.confirm(removal.after), /local trie has advanced/);
  assert.equal((await trie.get("dave"))!.toString("hex"), chain.alice);
});

test("names are bounded by UTF-8 bytes and target validation precedes local changes", async () => {
  const trie = await Trie.fromList([{ key: "alice", value: Buffer.alloc(28, 1) }]);
  const before = rootOf(trie);
  assert.equal(nameHex("🦀".repeat(8)).length, 64);
  for (const name of ["", "a".repeat(33), "🦀".repeat(9)]) {
    assert.throws(() => nameHex(name), /1–32 UTF-8 bytes/);
  }
  for (const target of ["", "00", "00".repeat(29), "gg".repeat(28), `${"00".repeat(28)}ff`]) {
    assert.throws(() => targetHash(target), /28-byte hexadecimal/);
    await assert.rejects(proveRegister(trie, "bob", target), /28-byte hexadecimal/);
    await assert.rejects(proveRetarget(trie, "alice", target), /28-byte hexadecimal/);
    assert.equal(rootOf(trie), before);
  }
  assert.equal(targetHash("AB".repeat(28)), "ab".repeat(28));
});

test("pinned benchmark funding fixes the input set even when the holder can pay the fee", async () => {
  const chain = await offlineChain();
  const registry = { ...chain.registry("naive"), funding: chain.funding };
  const current = chain.registryAt("naive", new Map([[nameHex("alice"), chain.alice]]));
  const holder = chain.holding("naive", chain.aliceAddress, "alice");
  const build = () => buildChangeTx(registry, current, release("alice", chain.alice, VOID), new Map(), { name: "alice", quantity: -1 }, holder);
  const first = await build();
  chain.addUtxo(chain.aliceAddress, [{ unit: "lovelace", quantity: "50000000" }]);
  assert.equal(await build(), first);
  const inputs = deserializeTx(first).body().inputs();
  const references = Array.from({ length: inputs.len() }, (_, i) => {
    const input = inputs.get(i);
    return `${input.transaction_id().to_hex()}#${input.index()}`;
  });
  assert.deepEqual(references.sort(), [current, holder, chain.funding].map((u) => `${u.input.txHash}#${u.input.outputIndex}`).sort());
  assertFunded(first);
});

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

for (const version of ["naive", "withLibrary"] as Version[]) {
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

test("costs.json is up to date for the naive registry's insertion limit", async () => {
  const limit = await naiveLimit();
  assert.deepEqual(limit, recorded.naiveLimit, "run npm run bench");
  assert.ok(limit.last.fits);
  assert.ok(limit.last.size <= recorded.limits.size);
  assert.ok(limit.next === null || !limit.next.fits);
});

test("costs.json is up to date for the example proof", async () => {
  assert.deepEqual(await example(), recorded.example, "run npm run bench");
});
