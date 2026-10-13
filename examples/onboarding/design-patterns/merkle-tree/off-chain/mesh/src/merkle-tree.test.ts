import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { mConStr0, resolveTxHash } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, claimRedeemer, grantDatum } from "./lib/blueprint.ts";
import type { Version } from "./lib/blueprint.ts";
import { measureAll } from "./lib/costs.ts";
import { offlineChain } from "./lib/offline.ts";
import type { Chain } from "./lib/offline.ts";
import { buildClaimTx, buildLockTx, claimPlan, minimumAda } from "./lib/grants.ts";
import type { ClaimPlan } from "./lib/grants.ts";
import { combine, fromList, leafHash, proofAt, sha256 } from "./lib/tree.ts";
import type { Proof } from "./lib/tree.ts";

const key = (n: number) => n.toString(16).padStart(56, "0");
const tags = (runs: { tag: string }[]) => runs.map((run) => run.tag).sort();

test("empty, singleton, and three-leaf tree conventions", () => {
  assert.equal(fromList([]), undefined);
  const singleton = fromList([key(1)])!;
  assert.equal(singleton.hash, sha256("00" + key(1)));
  assert.deepEqual(proofAt(singleton, 0), []);
  const tree = fromList([key(1), key(2), key(3)])!;
  assert.equal(tree.hash, combine(leafHash(key(1)), combine(leafHash(key(2)), leafHash(key(3)))));
  assert.deepEqual(proofAt(tree, 1), [
    { side: "right", hash: leafHash(key(3)) },
    { side: "left", hash: leafHash(key(1)) },
  ]);
  assert.equal(proofAt(tree, 0).length, 1);
});

test("builder rejects malformed keys, duplicate members, and invalid proof indices", () => {
  assert.throws(() => fromList(["ab"]), /28-byte/);
  assert.throws(() => fromList([key(1), key(1)]), /duplicate/);
  assert.throws(() => proofAt(fromList([key(1)])!, 1), /out of range/);
});

for (const version of VERSIONS) {
  for (const count of [1, 2, 3, 5, 10, 20]) {
    test(`${version}: honest claim from a ${count}-member allowlist runs one spend`, async () => {
      const chain = await offlineChain(version, count);
      const tx = await buildClaimTx(chain, claimPlan(chain), chain.evaluator);
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
    });
  }
  test(`${version}: claim uses the actual datum of the published grant`, async () => {
    const chain = await offlineChain(version, 20);
    const lock = await buildLockTx(chain);
    const output = deserializeTx(lock).body().outputs().get(0);
    assert.equal(output.plutus_data()!.to_hex(), chain.grant.output.plutusData);
    assert.ok(BigInt(JSON.parse(output.to_json()).amount.coin) >= await minimumAda(chain));
    // Consume the actual grant and change produced by the lock transaction.
    // Reusing the original funding input would double-spend it on a ledger.
    const outputs = deserializeTx(lock).body().outputs();
    const txHash = resolveTxHash(lock);
    const grantJson = JSON.parse(output.to_json());
    chain.grant = {
      input: { txHash, outputIndex: 0 },
      output: {
        address: grantJson.address,
        amount: [{ unit: "lovelace", quantity: grantJson.amount.coin }],
        plutusData: output.plutus_data()!.to_hex(),
      },
    };
    const changeIndex = outputs.len() - 1;
    const change = JSON.parse(outputs.get(changeIndex).to_json());
    chain.funding = {
      input: { txHash, outputIndex: changeIndex },
      output: { address: change.address, amount: [{ unit: "lovelace", quantity: change.amount.coin }] },
    };
    chain.fetcher.addUTxOs([chain.grant, chain.funding]);
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(await buildClaimTx(chain), [], [])), ["SPEND"]);
  });
}

// Every attack is paired with the unchanged, accepted transaction from the
// same helper. No evaluator runs while constructing the forged transaction.
async function forge(version: Version, change: (plan: ClaimPlan, chain: Chain) => void) {
  const chain = await offlineChain(version, 5);
  const plan = claimPlan(chain);
  assert.deepEqual(tags(await chain.evaluator.evaluateTx(await buildClaimTx(chain, plan), [], [])), ["SPEND"]);
  change(plan, chain);
  return chain.evaluator.evaluateTx(await buildClaimTx(chain, plan), [], []);
}

for (const version of VERSIONS) {
  test(`${version}: membership without a required member signature fails`, async () => {
    await assert.rejects(forge(version, (plan) => { plan.signer = undefined; }), /"tag":"spend"/);
  });
  test(`${version}: a signing non-member fails`, async () => {
    await assert.rejects(forge(version, (plan, chain) => {
      // Keep the real claimant/signature, but publish a dataset excluding it.
      const members = Array.from({ length: 5 }, (_, n) => key(n + 1));
      const root = fromList(members)!.hash;
      const fake = chain.addUtxo(chain.grant.output.address, chain.grant.output.amount, grantDatum(version, members, root));
      plan.grant = fake;
    }), /"tag":"spend"/);
  });
}

function changedProof(chain: Chain, proof: Proof) {
  return claimRedeemer(chain.version, chain.beneficiary, proof);
}

for (const version of ["byHand", "withLibrary"] as const) {
  for (const [label, mutate] of [
    ["a changed sibling", (p: Proof): Proof => [{ ...p[0]!, hash: "00".repeat(32) }, ...p.slice(1)]],
    ["a reversed direction", (p: Proof): Proof => [{ ...p[0]!, side: p[0]!.side === "left" ? "right" : "left" }, ...p.slice(1)]],
    ["a reversed path", (p: Proof): Proof => [...p].reverse()],
    ["a truncated path", (p: Proof): Proof => p.slice(1)],
    ["an appended sibling", (p: Proof): Proof => [...p, { side: "left", hash: "00".repeat(32) }]],
    ["a short sibling", (p: Proof): Proof => [{ ...p[0]!, hash: "aa".repeat(31) }, ...p.slice(1)]],
    ["an oversized sibling", (p: Proof): Proof => [{ ...p[0]!, hash: "aa".repeat(33) }, ...p.slice(1)]],
    ["an overlong path", (p: Proof): Proof => Array.from({ length: 33 }, () => p[0]!)],
  ] as const) {
    test(`${version}: ${label} fails in the spend script`, async () => {
      await assert.rejects(forge(version, (plan, chain) => { plan.redeemer = changedProof(chain, mutate(chain.proof)); }), /"tag":"spend"/);
    });
  }
  test(`${version}: a changed root invalidates the old proof`, async () => {
    await assert.rejects(forge(version, (plan, chain) => {
      plan.grant = chain.addUtxo(chain.grant.output.address, chain.grant.output.amount, mConStr0(["00".repeat(32)]));
    }), /"tag":"spend"/);
  });
  test(`${version}: a copied proof does not prove another listed key`, async () => {
    await assert.rejects(forge(version, (plan, chain) => {
      const anotherMember = chain.members[0]!;
      plan.signer = anotherMember;
      plan.redeemer = claimRedeemer(version, anotherMember, chain.proof);
    }), /"tag":"spend"/);
  });
  test(`${version}: a matching 32-step proof passes and matching 33-step proof hits the cap`, async () => {
    const chain = await offlineChain(version, 5);
    for (const depth of [32, 33]) {
      const proof: Proof = Array.from({ length: depth }, (_, n) => ({ side: "left", hash: leafHash(key(n + 1)) }));
      let root = leafHash(chain.beneficiary);
      for (const step of proof) root = combine(step.hash, root);
      const grant = chain.addUtxo(chain.grant.output.address, chain.grant.output.amount, mConStr0([root]));
      const plan = { ...claimPlan(chain), grant, redeemer: claimRedeemer(version, chain.beneficiary, proof) };
      const evaluation = chain.evaluator.evaluateTx(await buildClaimTx(chain, plan), [], []);
      if (depth === 32) assert.deepEqual(tags(await evaluation), ["SPEND"]);
      else await assert.rejects(evaluation, /"tag":"spend"/);
    }
  });
  test(`${version}: short/empty datum root is refused`, async () => {
    for (const root of ["", "aa".repeat(31)]) {
      await assert.rejects(forge(version, (plan, chain) => {
        plan.grant = chain.addUtxo(chain.grant.output.address, chain.grant.output.amount, mConStr0([root]));
      }), /"tag":"spend"/);
    }
  });
  test(`${version}: membership hashing must use raw, leaf-tagged bytes`, async () => {
    await assert.rejects(forge(version, (plan, chain) => {
      // Same members, but a publisher hashing untagged bytes made another root.
      const wrongRoot = chain.members.map((member) => sha256(member));
      function build(hashes: string[]): string {
        if (hashes.length === 1) return hashes[0]!;
        const split = Math.floor(hashes.length / 2);
        return combine(build(hashes.slice(0, split)), build(hashes.slice(split)));
      }
      plan.grant = chain.addUtxo(chain.grant.output.address, chain.grant.output.amount, mConStr0([build(wrongRoot)]));
    }), /"tag":"spend"/);
  });
  test(`${version}: public proof is reusable for separate grants with the same root`, async () => {
    const chain = await offlineChain(version, 5);
    const another = chain.addUtxo(chain.grant.output.address, chain.grant.output.amount, chain.datum);
    for (const grant of [chain.grant, another]) {
      const plan = { ...claimPlan(chain), grant };
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(await buildClaimTx(chain, plan), [], [])), ["SPEND"]);
    }
  });
  test(`${version}: left, middle, and right leaves of an odd tree all verify`, async () => {
    for (const index of [0, 2, 4]) {
      const chain = await offlineChain(version, 5, index);
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(await buildClaimTx(chain), [], [])), ["SPEND"]);
    }
  });
}

test("all figures in costs.json match the current scripts, proof format, and builders", async () => {
  const saved = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));
  assert.deepEqual(await measureAll(), saved);
});
