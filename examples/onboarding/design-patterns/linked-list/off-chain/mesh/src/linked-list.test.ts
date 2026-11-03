import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { mConStr0, mConStr1, mConStr3, resolveTxHash } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, PREFIX, arrayDatum, elementDatum, keyOf } from "./lib/blueprint.ts";
import type { Version } from "./lib/blueprint.ts";
import { measureAll } from "./lib/costs.ts";
import { offlineChain } from "./lib/offline.ts";
import type { Chain } from "./lib/offline.ts";
import { buildPlan, mutationPlan, proofPlan } from "./lib/registry.ts";
import type { Mutation, Plan } from "./lib/registry.ts";

const tags = (runs: { tag: string }[]) => runs.map((r) => r.tag).sort();

for (const version of VERSIONS) {
  for (const action of ["insert", "remove", "update"] as const) {
    test(`${version}: ${action} runs every expected handler`, async () => {
      const chain = await offlineChain(version, 5);
      const entry = action === "insert" ? { key: keyOf(11), label: "participant" } : { ...chain.entries.at(-1)!, label: "updated" };
      const tx = await buildPlan(chain, mutationPlan(chain, action, entry), chain.evaluator);
      const expected = version === "naive" || action === "update" ? ["SPEND"] : action === "insert" ? ["MINT", "SPEND"] : ["MINT", "SPEND", "SPEND"];
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), expected);
    });
  }
  for (const present of [true, false]) {
    test(`${version}: ${present ? "membership" : "absence"} reads a reference without running the registry`, async () => {
      const chain = await offlineChain(version, 5);
      const plan = proofPlan(chain, present, keyOf(present ? 10 : 11));
      const tx = await buildPlan(chain, plan, chain.evaluator);
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
      const body = JSON.parse(deserializeTx(tx).to_json()).body;
      assert.equal(body.reference_inputs.length, 1);
      assert.equal(plan.inputs[0]!.utxo.output.address, chain.deployed.proofAddress);
    });
  }

  test(`${version}: create, insert, update, remove, and close from real previous outputs`, async () => {
    const chain = await offlineChain(version, 0, false);
    const entry = { key: keyOf(2), label: "participant" };
    for (const action of ["init", "insert", "update", "remove", "deinit"] as const) {
      const changed = action === "update" ? { ...entry, label: "updated" } : entry;
      const plan = mutationPlan(chain, action, changed);
      const tx = await buildPlan(chain, plan, chain.evaluator);
      const expected = action === "init" ? ["MINT"] : action === "deinit" ? ["MINT", "SPEND"] : version === "naive" || action === "update" ? ["SPEND"] : action === "remove" ? ["MINT", "SPEND", "SPEND"] : ["MINT", "SPEND"];
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), expected);
      apply(chain, tx, plan);
      if (action === "insert") chain.entries = [entry];
      if (action === "update") chain.entries = [changed];
      if (action === "remove") chain.entries = [];
    }
  });
}

/// Read actual transaction outputs, including their CBOR datums, into the
/// in-memory UTxO set. This tests chained transitions, not invented successors.
function apply(chain: Chain, tx: string, plan: Plan) {
  const hash = resolveTxHash(tx);
  const outputs = deserializeTx(tx).body().outputs();
  const created: UTxO[] = [];
  for (let index = 0; index < outputs.len(); index++) {
    const out = outputs.get(index);
    const json = JSON.parse(out.to_json());
    const amount = [{ unit: "lovelace", quantity: json.amount.coin }];
    for (const [policy, names] of Object.entries(json.amount.multiasset ?? {})) {
      for (const [name, quantity] of Object.entries(names as Record<string, string>)) amount.push({ unit: policy + name, quantity: String(quantity) });
    }
    created.push({ input: { txHash: hash, outputIndex: index }, output: { address: json.address, amount, ...(out.plutus_data() ? { plutusData: out.plutus_data()!.to_hex() } : {}) } });
  }
  chain.fetcher.addUTxOs(created);
  chain.funding = created.at(-1)!;
  const state = created.filter((u) => u.output.address === chain.deployed.address);
  if (chain.deployed.version === "naive") chain.array = state[0];
  else {
    // Keep unspent elements and replace only those this transaction consumed.
    const spent = (u: UTxO) => plan.inputs.some((i) => i.utxo === u);
    const isRoot = (u: UTxO) => u.output.amount.some((a) => a.unit === chain.deployed.policy);
    chain.root = state.find(isRoot) ?? (chain.root && !spent(chain.root) ? chain.root : undefined);
    chain.nodes = [...chain.nodes.filter((u) => !spent(u)), ...state.filter((u) => !isRoot(u))];
  }
}

// Every forgery starts with a valid transaction, then changes one feature and
// builds without an evaluator. The same helper's unchanged version must pass.
async function forge(version: Version, action: Mutation | "member" | "absent", change: (plan: Plan, chain: Chain) => void) {
  const chain = await offlineChain(version, action === "init" || action === "deinit" ? 0 : 3);
  const entry = action === "insert" ? { key: keyOf(7), label: "participant" } : { ...chain.entries.at(-1)!, label: "updated" };
  const plan = action === "member" || action === "absent" ? proofPlan(chain, action === "member", keyOf(action === "member" ? 6 : 7)) : mutationPlan(chain, action, entry);
  const honest = await buildPlan(chain, plan);
  await chain.evaluator.evaluateTx(honest, [], []);
  change(plan, chain);
  const attack = await buildPlan(chain, plan);
  return chain.evaluator.evaluateTx(attack, [], []);
}

for (const version of VERSIONS) {
  test(`${version}: only the operator may mutate`, async () => {
    await assert.rejects(forge(version, "update", (p) => { p.signed = false; }), /"tag":"spend"/);
  });
  test(`${version}: continuation cannot lose its deposit`, async () => {
    await assert.rejects(forge(version, "update", (p) => { p.outputs[0]!.amount = p.outputs[0]!.amount.map((a) => a.unit === "lovelace" ? { ...a, quantity: "50000000" } : a); }), /"tag":"spend"/);
  });
  test(`${version}: continuation cannot change its address`, async () => {
    await assert.rejects(forge(version, "update", (p, c) => { p.outputs[0]!.address = c.walletAddress; }), /"tag":"spend"/);
  });
  test(`${version}: continuation cannot lose its authentication token`, async () => {
    await assert.rejects(forge(version, "update", (p) => { p.outputs[0]!.amount = p.outputs[0]!.amount.filter((a) => a.unit === "lovelace"); }), /"tag":"spend"/);
  });
  test(`${version}: label length is bounded`, async () => {
    await assert.rejects(forge(version, "update", (p, c) => {
      const entry = { ...c.entries.at(-1)!, label: "x".repeat(33) };
      p.outputs[0]!.datum = version === "naive" ? arrayDatum([...c.entries.slice(0, -1), entry]) : elementDatum(entry);
      if (version === "naive") p.inputs[0]!.redeemer = { alternative: 2, fields: [entry.key, mConStr0([Buffer.from(entry.label).toString("hex")]), 0] };
    }), /"tag":"spend"/);
  });
  test(`${version}: a fake node at the registry address is not a membership proof`, async () => {
    await assert.rejects(forge(version, "member", (p, c) => { p.references = [c.addUtxo(c.deployed.address, [{ unit: "lovelace", quantity: "100000000" }], version === "naive" ? arrayDatum(c.entries) : elementDatum(c.entries.at(-1)))]; }), /"tag":"spend"/);
  });
  test(`${version}: existing participant cannot be proven absent`, async () => {
    await assert.rejects(forge(version, "absent", (p) => { p.inputs[0]!.redeemer = mConStr1([keyOf(6), 0]); }), /"tag":"spend"/);
  });
  test(`${version}: missing participant cannot be proven present`, async () => {
    await assert.rejects(forge(version, "member", (p) => { p.inputs[0]!.redeemer = mConStr0([keyOf(7), 0]); }), /"tag":"spend"/);
  });
  test(`${version}: reference index cannot point past the references`, async () => {
    await assert.rejects(forge(version, "member", (p) => { p.inputs[0]!.redeemer = mConStr0([keyOf(6), 1]); }), /"tag":"spend"/);
  });
  test(`${version}: initialization needs the pinned nonce`, async () => {
    await assert.rejects(forge(version, "init", (p, c) => {
      // Same policy, but replace the funding input by another, unpinned nonce.
      c.funding = c.addUtxo(c.walletAddress, [{ unit: "lovelace", quantity: "1000000000" }]);
    }), /"tag":"mint"/);
  });
  test(`${version}: root cannot initialize outside the registry`, async () => {
    await assert.rejects(forge(version, "init", (p, c) => { p.outputs[0]!.address = c.walletAddress; }), /"tag":"mint"/);
  });
  test(`${version}: a nonempty registry cannot be destroyed`, async () => {
    const c = await offlineChain(version, 1);
    const root = c.array ?? c.root!;
    const plan: Plan = {
      inputs: [{ utxo: root, cbor: c.deployed.cbor, redeemer: version === "naive" ? mConStr3([]) : mConStr0([1]) }],
      outputs: [], references: [], signed: true,
      mint: [{ name: "", quantity: "-1", redeemer: mConStr3([]) }],
    };
    await assert.rejects(c.evaluator.evaluateTx(await buildPlan(c, plan), [], []), version === "naive" ? /"tag":"spend"/ : /"tag":"mint"/);
  });
}

for (const version of ["byHand", "withLibrary"] as const) {
  test(`${version}: inserted node cannot lose the old successor`, async () => {
    // Build an insertion in the middle of the list, then cut off the suffix.
    const chain = await offlineChain(version, 3);
    chain.nodes = [chain.nodes[0]!];
    chain.entries = [chain.entries[0]!];
    const plan = mutationPlan(chain, "insert", { key: keyOf(3), label: "participant" });
    plan.outputs[1]!.datum = elementDatum({ key: keyOf(3), label: "participant" }, keyOf(4));
    const honest = await buildPlan(chain, plan);
    await chain.evaluator.evaluateTx(honest, [], []);
    plan.outputs[1]!.datum = elementDatum({ key: keyOf(3), label: "participant" });
    await assert.rejects(chain.evaluator.evaluateTx(await buildPlan(chain, plan), [], []), /"tag":"mint"/);
  });
  test(`${version}: removal cannot leave a dangling link`, async () => {
    await assert.rejects(forge(version, "remove", (p, c) => { p.outputs[0]!.datum = elementDatum(c.entries.at(-2), c.entries.at(-1)!.key); }), /"tag":"mint"/);
  });
  test(`${version}: data update cannot change a link`, async () => {
    await assert.rejects(forge(version, "update", (p, c) => { p.outputs[0]!.datum = elementDatum({ ...c.entries.at(-1)!, label: "updated" }, keyOf(8)); }), /"tag":"spend"/);
  });
  test(`${version}: extra authentic inputs cannot ride along with insertion`, async () => {
    await assert.rejects(forge(version, "insert", (p, c) => {
      p.inputs.push({ utxo: c.root!, cbor: c.deployed.cbor, redeemer: mConStr0([1]) });
      p.inputs[0]!.redeemer = mConStr0([2]);
    }), /"tag":"mint"/);
  });
  test(`${version}: structural spend needs a matching policy invocation`, async () => {
    await assert.rejects(forge(version, "update", (p) => { p.inputs[0]!.redeemer = mConStr0([1]); }), /"tag":"spend"/);
  });
  test(`${version}: spend index cannot name the wallet input`, async () => {
    await assert.rejects(forge(version, "update", (p) => { p.inputs[0]!.redeemer = mConStr1([0, 0]); }), /"tag":"spend"/);
  });
  test(`${version}: output index cannot point past the outputs`, async () => {
    await assert.rejects(forge(version, "insert", (p) => { p.mint![0]!.redeemer = mConStr1([99, 1]); }), /"tag":"mint"/);
  });
  test(`${version}: root and terminal node prove boundary gaps`, async () => {
    const c = await offlineChain(version, 1);
    for (const [reference, key] of [[c.root!, keyOf(1)], [c.nodes[0]!, keyOf(3)]] as const) {
      const plan = proofPlan(c, false, key);
      plan.references = [reference];
      assert.deepEqual(tags(await c.evaluator.evaluateTx(await buildPlan(c, plan), [], [])), ["SPEND"]);
    }
    const empty = await offlineChain(version, 0);
    assert.deepEqual(tags(await empty.evaluator.evaluateTx(await buildPlan(empty, proofPlan(empty, false, keyOf(1))), [], [])), ["SPEND"]);
  });
  test(`${version}: duplicate tail key cannot be inserted`, async () => {
    await assert.rejects(forge(version, "insert", (p, c) => {
      const key = c.entries.at(-1)!.key;
      p.outputs[0]!.datum = elementDatum(c.entries.at(-1), key);
      p.outputs[1]!.datum = elementDatum(c.entries.at(-1));
      p.outputs[1]!.amount[1]!.unit = c.deployed.policy + PREFIX + key;
      p.mint![0]!.name = PREFIX + key;
    }), /"tag":"mint"/);
  });
  test(`${version}: reserved root cannot be minted with a node`, async () => {
    await assert.rejects(forge(version, "insert", (p) => { p.mint!.push({ name: "", quantity: "1", redeemer: p.mint![0]!.redeemer }); }), /"tag":"mint"/);
  });
}

test("costs.json matches all current scripts, transactions, and limits", async () => {
  const saved = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));
  assert.deepEqual(await measureAll(), saved);
});
