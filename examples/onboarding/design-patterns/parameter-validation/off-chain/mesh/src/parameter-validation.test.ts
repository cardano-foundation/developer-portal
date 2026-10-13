import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MeshTxBuilder } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import {
  POLICIES,
  REWARD_NAME_HEX,
  blake2b224,
  lockupAddress,
  lockupHash,
  lockupPrefix,
  policyId,
  policyScriptCbor,
  termsPrefix,
} from "./lib/blueprint.ts";
import type { Member, Policy } from "./lib/blueprint.ts";
import { MINT_SIZES, limitPast, measure } from "./lib/costs.ts";
import type { Costs } from "./lib/costs.ts";
import { NETWORK, UNLOCK_SLOT, offlineChain } from "./lib/offline.ts";
import { LOCKUP_DATUM, buildMintRewardsTx, buildWithdrawTx, listedLockups } from "./lib/rewards.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

const ALL = Object.keys(POLICIES) as Policy[];
type Chain = Awaited<ReturnType<typeof offlineChain>>;

function tags(runs: { tag: string }[]): string[] {
  return runs.map((run) => run.tag).sort();
}

/// Members for `policy`: the terms policies give each their own date.
function membersFor(chain: Chain, policy: Policy, count: number): Member[] {
  const perMember = policy === "hashedTerms" || policy === "rawTerms";
  return chain.members(count).map((m, i) => (perMember ? { ...m, unlockAt: m.unlockAt + i * 1000 } : m));
}

// ---------------------------------------------------------------------------
// The prefix: rebuilt off-chain exactly as the policies rebuild it on-chain.

test("a lock-up's hash is the hash of the prefix, the owner's key and the tail", async () => {
  const chain = await offlineChain();
  const rebuilt = blake2b224("03" + lockupPrefix(chain.unlockAt) + chain.member.owner + "0001");
  assert.equal(rebuilt, lockupHash("byHand", chain.member));
});

test("a terms lock-up's hash is the hash of the prefix, the terms' hash and the tail", async () => {
  const chain = await offlineChain();
  const member = { ...chain.member, unlockAt: chain.unlockAt + 5000 };
  const { serializeData } = await import("@meshsdk/core");
  const { termsData } = await import("./lib/blueprint.ts");
  const rebuilt = blake2b224("03" + termsPrefix() + blake2b224(serializeData(termsData(member))) + "0001");
  assert.equal(rebuilt, lockupHash("hashedTerms", member));
});

// ---------------------------------------------------------------------------
// The builders: every honest transaction is approved.

for (const policy of ALL) {
  test(`${policy}: minting runs the policy once and measures its signed size`, async () => {
    const chain = await offlineChain();
    const members = membersFor(chain, policy, 3);
    const tx = await buildMintRewardsTx({
      wallet: chain.adminWallet,
      provider: chain.fetcher,
      policy,
      admin: chain.admin,
      unlockAt: chain.unlockAt,
      rewards: members.map((member) => ({ member, quantity: 10 })),
      listed: listedLockups(policy, members),
      networkId: NETWORK,
      evaluator: chain.evaluator,
    });
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["MINT"]);
    const signed = await chain.adminWallet.signTx(tx);
    assert.equal(deserializeTx(signed).witness_set().vkeys()!.len(), 1);
    assert.ok(signed.length > tx.length, "the size measurement must include the admin's witness");
    assert.equal((await measure(policy, 3)).size, signed.length / 2);
  });

  test(`${policy}: mint funding excludes existing rewards but permits unrelated tokens`, async (t) => {
    const chain = await offlineChain();
    const members = membersFor(chain, policy, 1);
    const listed = listedLockups(policy, members);
    const unit = policyId(policyScriptCbor(policy, chain.admin, chain.unlockAt, listed)) + REWARD_NAME_HEX;
    const existing = chain.addUtxo(chain.adminAddress, [
      { unit: "lovelace", quantity: "1000000000" },
      { unit, quantity: "1" },
    ]);
    const collateral = (await chain.adminWallet.getCollateral())[0]!;
    const available = [existing, collateral];
    t.mock.method(chain.adminWallet, "getUtxos", async () => available);
    const mint = {
      wallet: chain.adminWallet,
      provider: chain.fetcher,
      policy,
      admin: chain.admin,
      unlockAt: chain.unlockAt,
      rewards: members.map((member) => ({ member, quantity: 10 })),
      listed,
      networkId: NETWORK,
      evaluator: chain.evaluator,
    };
    await assert.rejects(buildMintRewardsTx(mint), /no mint funding UTxOs without this program's REWARD tokens/);

    const funding = chain.addUtxo(chain.adminAddress, [
      { unit: "lovelace", quantity: "1000000000" },
      { unit: "ff".repeat(28) + REWARD_NAME_HEX, quantity: "1" },
    ]);
    available.push(funding);
    const tx = await buildMintRewardsTx(mint);
    const inputs = deserializeTx(tx).body().inputs();
    const spent = Array.from({ length: inputs.len() }, (_, i) => inputs.get(i).transaction_id().to_hex());
    assert.ok(spent.includes(funding.input.txHash));
    assert.ok(!spent.includes(existing.input.txHash));
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["MINT"]);
  });

  test(`${policy}: the member withdraws from their lock-up once it opens`, async () => {
    const chain = await offlineChain();
    const member = membersFor(chain, policy, 1)[0]!;
    const lockup = chain.rewarded(policy, member, 10);
    const tx = await buildWithdrawTx(
      chain.memberWallet,
      chain.fetcher,
      policy,
      member,
      lockup,
      UNLOCK_SLOT + 1,
      chain.evaluator,
    );
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
  });

  test(`${policy}: the lock-up refuses a withdrawal before it opens`, async () => {
    const chain = await offlineChain();
    const member = membersFor(chain, policy, 1)[0]!;
    const lockup = chain.rewarded(policy, member, 10);
    const tx = await buildWithdrawTx(chain.memberWallet, chain.fetcher, policy, member, lockup, UNLOCK_SLOT - 10);
    await assert.rejects(chain.evaluator.evaluateTx(tx, [], []), /"tag":"spend"/);
  });

  test(`${policy}: the owner can authorize withdrawal to another wallet`, async () => {
    const chain = await offlineChain();
    const tx = await buildWithdrawTx(
      chain.adminWallet,
      chain.fetcher,
      policy,
      chain.member,
      chain.rewarded(policy, chain.member, 10),
      UNLOCK_SLOT + 1,
      chain.evaluator,
    );
    const body = deserializeTx(tx).body();
    assert.equal(body.outputs().get(0).address().to_bech32(), chain.adminAddress);
    assert.equal(body.required_signers()!.get(0).to_hex(), chain.member.owner);
    const ownerSigned = await chain.memberWallet.signTx(tx, true);
    const signed = await chain.adminWallet.signTx(ownerSigned, true);
    assert.equal(deserializeTx(signed).witness_set().vkeys()!.len(), 2);
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(signed, [], [])), ["SPEND"]);
  });
}

test("anyone holding reward tokens may burn them", async () => {
  const chain = await offlineChain();
  const policyCbor = policyScriptCbor("byHand", chain.admin, chain.unlockAt);
  const address = await chain.memberWallet.getChangeAddress();
  chain.addUtxo(address, [
    { unit: "lovelace", quantity: "2000000" },
    { unit: policyId(policyCbor) + REWARD_NAME_HEX, quantity: "10" },
  ]);
  const collateral = (await chain.memberWallet.getCollateral())[0]!;
  const tx = await new MeshTxBuilder({ fetcher: chain.fetcher })
    .mintPlutusScriptV3()
    .mint("-10", policyId(policyCbor), REWARD_NAME_HEX)
    .mintingScript(policyCbor)
    .mintRedeemerValue([])
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
    .changeAddress(address)
    .selectUtxosFrom((await chain.memberWallet.getUtxos()).filter((u) => u.input.txHash !== collateral.input.txHash))
    .complete();
  assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["MINT"]);
});

// ---------------------------------------------------------------------------
// Attacks. `forge` builds whatever mint it is told to, with no evaluator, so
// the builder accepts what the policy refuses. Each attack is paired with the
// honest version of the same transaction, built by the same helper, so a
// refusal cannot come from a broken helper.

type Forgery = {
  policy: Policy;
  /// Who signs: the admin, or somebody else.
  signer: "admin" | "member";
  /// The members the redeemer names, in order.
  named: Member[];
  /// Where the reward tokens go, and how many.
  outputs: { address: string; quantity: number }[];
  /// The lock-ups the naive policy lists.
  listed: Member[];
  /// Previously minted rewards spent as an input, separate from the new mint.
  existing?: number;
};

async function forge(build: (chain: Chain) => Forgery) {
  const chain = await offlineChain();
  const forgery = build(chain);
  const signerWallet = forgery.signer === "admin" ? chain.adminWallet : chain.memberWallet;
  const signerAddress = await signerWallet.getChangeAddress();
  const collateral = (await signerWallet.getCollateral())[0]!;
  const listed = listedLockups(forgery.policy, forgery.listed);
  const policyCbor = policyScriptCbor(forgery.policy, chain.admin, chain.unlockAt, listed);
  const minted = forgery.outputs.reduce((total, o) => total + o.quantity, 0) - (forgery.existing ?? 0);
  const redeemer =
    forgery.policy === "naive"
      ? []
      : forgery.policy === "hashedTerms" || forgery.policy === "rawTerms"
        ? forgery.named.map((m) => ({ alternative: 0, fields: [m.owner, m.unlockAt] }))
        : forgery.named.map((m) => m.owner);
  const txBuilder = new MeshTxBuilder({ fetcher: chain.fetcher })
    .mintPlutusScriptV3()
    .mint(minted.toString(), policyId(policyCbor), REWARD_NAME_HEX)
    .mintingScript(policyCbor)
    .mintRedeemerValue(redeemer);
  if (forgery.existing) {
    const input = chain.addUtxo(signerAddress, [
      { unit: "lovelace", quantity: "2000000" },
      { unit: policyId(policyCbor) + REWARD_NAME_HEX, quantity: forgery.existing.toString() },
    ]);
    txBuilder.txIn(input.input.txHash, input.input.outputIndex, input.output.amount, input.output.address);
  }
  for (const { address, quantity } of forgery.outputs) {
    txBuilder
      .txOut(address, [
        { unit: "lovelace", quantity: "2000000" },
        { unit: policyId(policyCbor) + REWARD_NAME_HEX, quantity: quantity.toString() },
      ])
      .txOutInlineDatumValue(LOCKUP_DATUM);
  }
  const tx = await txBuilder
    .requiredSignerHash(forgery.signer === "admin" ? chain.admin : chain.member.owner)
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
    .changeAddress(signerAddress)
    .selectUtxosFrom((await signerWallet.getUtxos()).filter((u) => u.input.txHash !== collateral.input.txHash))
    .complete();
  return chain.evaluator.evaluateTx(tx, [], []);
}

/// Assert the honest mint passes and the attack is refused, by the policy.
async function refused(honest: (chain: Chain) => Forgery, attack: (chain: Chain) => Partial<Forgery>) {
  await forge(honest);
  await assert.rejects(
    forge((chain) => ({ ...honest(chain), ...attack(chain) })),
    /"tag":"mint"/,
  );
}

for (const policy of ALL) {
  /// The honest mint: 10 tokens into each of two members' lock-ups.
  const honest = (chain: Chain): Forgery => {
    const members = membersFor(chain, policy, 2);
    return {
      policy,
      signer: "admin",
      named: members,
      outputs: members.map((m) => ({ address: lockupAddress(policy, m, NETWORK), quantity: 10 })),
      listed: members,
    };
  };

  test(`theft: ${policy} refuses a mint the admin did not sign`, () =>
    refused(honest, () => ({ signer: "member" })));

  test(`${policy}: minting cannot consume existing rewards even when all outputs are lock-ups`, () =>
    refused(honest, () => ({ existing: 1 })));

  // Ten tokens into a lock-up, ten more into the admin's own wallet.
  test(`theft: ${policy} refuses rewards kept outside the lock-ups`, () =>
    refused(honest, (chain) => ({
      outputs: [honest(chain).outputs[0]!, { address: chain.adminAddress, quantity: 10 }],
    })));

  // The member's lock-up, but one that opens a second earlier: a real lock-up
  // script, with the wrong parameters.
  test(`theft: ${policy} refuses rewards in a lock-up that opens earlier`, () =>
    refused(honest, (chain) => {
      const [first, second] = honest(chain).named;
      const earlier = { ...first!, unlockAt: first!.unlockAt - 1000 };
      return {
        outputs: [
          { address: lockupAddress(policy, earlier, NETWORK), quantity: 10 },
          { address: lockupAddress(policy, second!, NETWORK), quantity: 10 },
        ],
      };
    }));

  // Two members, but the outputs swapped: each lock-up is real, and neither is
  // the one its place in the redeemer names. The naive policy accepts this: it
  // only knows the lock-ups are on its list.
  if (policy !== "naive") {
    test(`theft: ${policy} refuses rewards in another member's lock-up`, () =>
      refused(honest, (chain) => ({ named: [...honest(chain).named].reverse() })));
  }

  if (policy === "hashedTerms" || policy === "rawTerms") {
    test(`${policy}: the policy ID commits to the minimum unlock date`, async () => {
      const chain = await offlineChain();
      assert.notEqual(
        policyId(policyScriptCbor(policy, chain.admin, chain.unlockAt)),
        policyId(policyScriptCbor(policy, chain.admin, chain.unlockAt - 1)),
      );
    });

    for (const date of ["zero", "just before minimum"] as const) {
      test(`theft: ${policy} refuses matching redeemer and output dates at ${date}`, () =>
        refused(honest, (chain) => {
          const early = { ...chain.member, unlockAt: date === "zero" ? 0 : chain.unlockAt - 1 };
          return {
            named: [early],
            outputs: [{ address: lockupAddress(policy, early, NETWORK), quantity: 10 }],
          };
        }));
    }

    test(`${policy}: a later member date still restricts withdrawal after the program minimum`, async () => {
      const chain = await offlineChain();
      const member = { ...chain.member, unlockAt: chain.unlockAt + 10_000 };
      const lockup = chain.rewarded(policy, member, 10);
      const early = await buildWithdrawTx(chain.memberWallet, chain.fetcher, policy, member, lockup, UNLOCK_SLOT + 1);
      await assert.rejects(chain.evaluator.evaluateTx(early, [], []), /"tag":"spend"/);
      const after = await buildWithdrawTx(chain.memberWallet, chain.fetcher, policy, member, lockup, UNLOCK_SLOT + 11);
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(after, [], [])), ["SPEND"]);
    });
  }
}

// The naive policy knows only the lock-ups it was deployed with.
test("theft: naive refuses rewards in a lock-up added after deployment", () =>
  refused(
    (chain) => {
      const members = chain.members(2);
      return {
        policy: "naive",
        signer: "admin",
        named: members,
        outputs: members.map((m) => ({ address: lockupAddress("naive", m, NETWORK), quantity: 10 })),
        listed: members,
      };
    },
    (chain) => ({ listed: chain.members(1) }),
  ));

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

for (const policy of ALL) {
  test(`costs.json is up to date for ${policy}`, async () => {
    const { mints, largestMint, limitedBy } = recorded.policies[policy];
    for (const size of MINT_SIZES) {
      assert.deepEqual(await measure(policy, size), mints[size], `${size} members: run npm run bench`);
    }
    // The search is slow, so check only its answer: that size fits, one more does not.
    assert.ok((await measure(policy, largestMint)).fits, "largestMint no longer fits: run npm run bench");
    assert.equal(await limitPast(policy, largestMint), limitedBy, "limitedBy changed: run npm run bench");
    // Far past the size limit Mesh refuses to build at all, which also means
    // it does not fit.
    const over = await measure(policy, largestMint + 1).catch(() => undefined);
    assert.ok(!over?.fits, "largestMint is too small: run npm run bench");
  });
}

test("costs.json is up to date for the naive policy's longest list", async () => {
  assert.ok((await measure("naive", 1, recorded.largestNaiveList)).fits, "run npm run bench");
  const over = await measure("naive", 1, recorded.largestNaiveList + 1).catch(() => undefined);
  assert.ok(!over?.fits, "largestNaiveList is too small: run npm run bench");
});
