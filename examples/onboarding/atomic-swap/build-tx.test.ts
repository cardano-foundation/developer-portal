import assert from "node:assert/strict";
import { test } from "node:test";

import { buildAtomicSwapDraft, type Party } from "./build-tx.ts";

const alice: Party = {
  address: "addr_test_alice",
  asset: "lovelace",
  amount: "10000000",
};

const bob: Party = {
  address: "addr_test_bob",
  asset: "policy.TOKEN",
  amount: "1",
};

test("each party receives what the other offered", () => {
  const draft = buildAtomicSwapDraft(alice, bob);

  assert.equal(draft.inputs.length, 2);
  assert.equal(draft.outputs.length, 2);

  const aliceOut = draft.outputs.find((o) => o.address === alice.address);
  const bobOut = draft.outputs.find((o) => o.address === bob.address);

  assert.deepEqual(aliceOut, { address: alice.address, asset: bob.asset, amount: bob.amount });
  assert.deepEqual(bobOut, { address: bob.address, asset: alice.asset, amount: alice.amount });
});

test("a swap needs two distinct parties", () => {
  assert.throws(() => buildAtomicSwapDraft(alice, { ...bob, address: alice.address }));
});
