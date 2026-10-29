import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MeshTxBuilder, deserializeAddress, mConStr0 } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import {
  POOLS,
  SWEEP_NAME_HEX,
  coordinatorRewardAddress,
  poolHash,
  poolScriptCbor,
} from "./lib/blueprint.ts";
import type { Pool } from "./lib/blueprint.ts";
import { SWEEP_SIZES, measure } from "./lib/costs.ts";
import type { Costs } from "./lib/costs.ts";
import { NETWORK, offlineChain } from "./lib/offline.ts";
import {
  buildBurnSweepTokensTx,
  buildDeregisterCoordinatorTx,
  buildMintSweepTx,
  buildNaiveSweepTx,
  buildRegisterCoordinatorTx,
  buildWithdrawSweepTx,
} from "./lib/sweep.ts";
import type { Sweep } from "./lib/sweep.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

type Chain = Awaited<ReturnType<typeof offlineChain>>;

async function sweepOf(pool: Pool, count: number) {
  const chain = await offlineChain();
  const sweep: Sweep = {
    wallet: chain.wallet,
    provider: chain.fetcher,
    beneficiaryAddress: chain.beneficiaryAddress,
    donations: chain.donate(pool, count),
    evaluator: chain.evaluator,
  };
  return { chain, sweep };
}

function tags(runs: { tag: string }[]): string[] {
  return runs.map((run) => run.tag).sort();
}

// ---------------------------------------------------------------------------
// The builders: every honest transaction is approved.

test("the naive pool approves a sweep, running once per donation", async () => {
  const { chain, sweep } = await sweepOf("naive", 3);
  const runs = await chain.evaluator.evaluateTx(await buildNaiveSweepTx(sweep), [], []);
  assert.deepEqual(tags(runs), ["SPEND", "SPEND", "SPEND"]);
});

for (const pool of ["withdrawByHand", "withdrawLibrary"] as const) {
  test(`${pool}: the coordinator runs once beside every spend`, async () => {
    const { chain, sweep } = await sweepOf(pool, 3);
    const runs = await chain.evaluator.evaluateTx(await buildWithdrawSweepTx(sweep, pool, NETWORK), [], []);
    assert.deepEqual(tags(runs), ["REWARD", "SPEND", "SPEND", "SPEND"]);
  });

  test(`${pool}: rewards paid into the pool's account go to the beneficiary`, async () => {
    const { chain, sweep } = await sweepOf(pool, 3);
    chain.setRewards(pool, "5000000");
    const tx = await buildWithdrawSweepTx(sweep, pool, NETWORK);
    assert.equal((await chain.evaluator.evaluateTx(tx, [], [])).length, 4);
    const payout = JSON.parse(deserializeTx(tx).to_json()).body.outputs[0];
    assert.equal(payout.amount.coin, "35000000");
  });
}

for (const pool of ["mintByHand", "mintLibrary"] as const) {
  test(`${pool}: the coordinator runs once beside every spend`, async () => {
    const { chain, sweep } = await sweepOf(pool, 3);
    const runs = await chain.evaluator.evaluateTx(await buildMintSweepTx(sweep, pool), [], []);
    assert.deepEqual(tags(runs), ["MINT", "SPEND", "SPEND", "SPEND"]);
  });

  test(`${pool}: whoever holds SWEEP tokens may burn them`, async () => {
    const chain = await offlineChain();
    chain.donate(pool, 0);
    const sweeperAddress = await chain.wallet.getChangeAddress();
    const unit = poolHash(pool, chain.beneficiaryAddress) + SWEEP_NAME_HEX;
    chain.addUtxo(sweeperAddress, [
      { unit: "lovelace", quantity: "2000000" },
      { unit, quantity: "2" },
    ]);
    const tx = await buildBurnSweepTokensTx(
      chain.wallet,
      chain.fetcher,
      pool,
      chain.beneficiaryAddress,
      2,
      chain.evaluator,
    );
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["MINT"]);
  });
}

test("registering the coordinator runs no script", async () => {
  const chain = await offlineChain();
  const tx = await buildRegisterCoordinatorTx(
    chain.wallet,
    chain.fetcher,
    "withdrawByHand",
    chain.beneficiaryAddress,
    NETWORK,
  );
  assert.deepEqual(await chain.evaluator.evaluateTx(tx, [], []), []);
});

for (const pool of ["withdrawByHand", "withdrawLibrary"] as const) {
  test(`${pool}: the beneficiary may deregister the coordinator`, async () => {
    const chain = await offlineChain();
    const tx = await buildDeregisterCoordinatorTx(
      chain.beneficiaryWallet,
      chain.fetcher,
      pool,
      NETWORK,
      chain.evaluator,
    );
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["CERT"]);
  });
}

// ---------------------------------------------------------------------------
// Attacks. `forge` builds whatever transaction it is told to, with no
// evaluator, so the builder accepts what the scripts refuse. Each attack is
// paired with the honest version of the same transaction, built by the same
// helper, so a refusal cannot come from a broken helper.

type Forgery = {
  /// Pools whose donations (3 of 10 ADA each) the transaction spends.
  spend?: Pool[];
  /// Withdrawals from pools' stake accounts, in lovelace.
  withdraw?: { pool: Pool; lovelace: string }[];
  /// SWEEP tokens minted (positive) or burned (negative) under pools' policies.
  mint?: { pool: Pool; quantity: string }[];
  /// Payments to make. `tag` is the pool whose hash goes in the datum.
  pay?: { to: "beneficiary" | "sweeper"; lovelace: string; tag?: Pool }[];
  /// Deregister this pool's stake credential, signed by `signer`.
  deregister?: { pool: Pool; signer: "beneficiary" | "sweeper" };
};

async function forge(forgery: Forgery) {
  const chain: Chain = await offlineChain();
  const sweeperAddress = await chain.wallet.getChangeAddress();
  const beneficiary = chain.beneficiaryAddress;
  const collateral = (await chain.wallet.getCollateral())[0]!;
  const txBuilder = new MeshTxBuilder({ fetcher: chain.fetcher });

  for (const pool of forgery.spend ?? []) {
    for (const donation of chain.donate(pool, 3)) {
      txBuilder
        .spendingPlutusScriptV3()
        .txIn(donation.input.txHash, donation.input.outputIndex, donation.output.amount, donation.output.address)
        .txInScript(poolScriptCbor(pool, beneficiary))
        .txInInlineDatumPresent()
        .txInRedeemerValue(0);
    }
  }
  for (const { pool, lovelace } of forgery.withdraw ?? []) {
    chain.setRewards(pool, lovelace);
    txBuilder
      .withdrawalPlutusScriptV3()
      .withdrawal(coordinatorRewardAddress(pool, beneficiary, NETWORK), lovelace)
      .withdrawalScript(poolScriptCbor(pool, beneficiary))
      .withdrawalRedeemerValue(mConStr0([]));
  }
  for (const { pool, quantity } of forgery.mint ?? []) {
    if (quantity.startsWith("-")) {
      chain.addUtxo(sweeperAddress, [
        { unit: "lovelace", quantity: "2000000" },
        { unit: poolHash(pool, beneficiary) + SWEEP_NAME_HEX, quantity: quantity.slice(1) },
      ]);
    }
    txBuilder
      .mintPlutusScriptV3()
      .mint(quantity, poolHash(pool, beneficiary), SWEEP_NAME_HEX)
      .mintingScript(poolScriptCbor(pool, beneficiary))
      .mintRedeemerValue(mConStr0([]));
  }
  for (const { to, lovelace, tag } of forgery.pay ?? []) {
    txBuilder.txOut(to === "beneficiary" ? beneficiary : sweeperAddress, [{ unit: "lovelace", quantity: lovelace }]);
    if (tag) txBuilder.txOutInlineDatumValue(poolHash(tag, beneficiary));
  }
  if (forgery.deregister) {
    const { pool, signer } = forgery.deregister;
    txBuilder
      .deregisterStakeCertificate(coordinatorRewardAddress(pool, beneficiary, NETWORK))
      .certificateScript(poolScriptCbor(pool, beneficiary), "V3")
      .certificateRedeemerValue(mConStr0([]))
      .requiredSignerHash(
        deserializeAddress(signer === "beneficiary" ? beneficiary : sweeperAddress).pubKeyHash,
      );
  }

  const tx = await txBuilder
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
    .changeAddress(sweeperAddress)
    .selectUtxosFrom(
      (await chain.wallet.getUtxos()).filter((u) => u.input.txHash !== collateral.input.txHash),
    )
    .complete();
  return chain.evaluator.evaluateTx(tx, [], []);
}

/// Assert the honest transaction passes and the attack is refused.
async function refused(honest: Forgery, attack: Forgery) {
  await forge(honest);
  await assert.rejects(forge(attack));
}

test("theft: the naive pool refuses a sweep paid to someone else", () =>
  refused(
    { spend: ["naive"], pay: [{ to: "beneficiary", lovelace: "30000000", tag: "naive" }] },
    { spend: ["naive"], pay: [{ to: "sweeper", lovelace: "30000000", tag: "naive" }] },
  ));

for (const pool of ["withdrawByHand", "withdrawLibrary"] as const) {
  const sweep = { spend: [pool], withdraw: [{ pool, lovelace: "0" }] };

  test(`theft: ${pool} refuses a sweep paid to someone else`, () =>
    refused(
      { ...sweep, pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }] },
      { ...sweep, pay: [{ to: "sweeper", lovelace: "30000000", tag: pool }] },
    ));

  test(`theft: ${pool} refuses a sweep that leaves the coordinator out`, () =>
    refused(
      { ...sweep, pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }] },
      { spend: [pool], pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }] },
    ));

  test(`theft: ${pool} refuses a payment without its tag`, () =>
    refused(
      { ...sweep, pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }] },
      { ...sweep, pay: [{ to: "beneficiary", lovelace: "30000000" }] },
    ));

  test(`theft: ${pool} refuses a sweep that keeps the account's rewards`, () =>
    refused(
      {
        spend: [pool],
        withdraw: [{ pool, lovelace: "5000000" }],
        pay: [{ to: "beneficiary", lovelace: "35000000", tag: pool }],
      },
      {
        spend: [pool],
        withdraw: [{ pool, lovelace: "5000000" }],
        pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }],
      },
    ));

  test(`theft: ${pool} refuses deregistration by anyone but the beneficiary`, () =>
    refused(
      { deregister: { pool, signer: "beneficiary" } },
      { deregister: { pool, signer: "sweeper" } },
    ));
}

for (const pool of ["mintByHand", "mintLibrary"] as const) {
  test(`theft: ${pool} refuses a sweep paid to someone else`, () =>
    refused(
      {
        spend: [pool],
        mint: [{ pool, quantity: "1" }],
        pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }],
      },
      {
        spend: [pool],
        mint: [{ pool, quantity: "1" }],
        pay: [{ to: "sweeper", lovelace: "30000000", tag: pool }],
      },
    ));

  // Harmless: nothing is taken, and the token proves nothing.
  test(`${pool} accepts a SWEEP token minted without a sweep`, () =>
    forge({ mint: [{ pool, quantity: "1" }] }).then(() => {}));

  test(`${pool} refuses two SWEEP tokens in one sweep`, () =>
    refused(
      {
        spend: [pool],
        mint: [{ pool, quantity: "1" }],
        pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }],
      },
      {
        spend: [pool],
        mint: [{ pool, quantity: "2" }],
        pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }],
      },
    ));

  test(`theft: ${pool} refuses a burn that sweeps without paying`, () =>
    refused(
      {
        spend: [pool],
        mint: [{ pool, quantity: "-1" }],
        pay: [{ to: "beneficiary", lovelace: "30000000", tag: pool }],
      },
      {
        spend: [pool],
        mint: [{ pool, quantity: "-1" }],
        pay: [{ to: "sweeper", lovelace: "30000000", tag: pool }],
      },
    ));
}

// Double satisfaction: two pools for the same beneficiary, swept together, with
// one payment meant to count for both. Each pool counts only payments tagged
// with its own hash, so the second pool goes unpaid and refuses.
test("double satisfaction: one payment cannot serve two pools", () =>
  refused(
    {
      spend: ["withdrawByHand", "mintByHand"],
      withdraw: [{ pool: "withdrawByHand", lovelace: "0" }],
      mint: [{ pool: "mintByHand", quantity: "1" }],
      pay: [
        { to: "beneficiary", lovelace: "30000000", tag: "withdrawByHand" },
        { to: "beneficiary", lovelace: "30000000", tag: "mintByHand" },
      ],
    },
    {
      spend: ["withdrawByHand", "mintByHand"],
      withdraw: [{ pool: "withdrawByHand", lovelace: "0" }],
      mint: [{ pool: "mintByHand", quantity: "1" }],
      pay: [
        { to: "beneficiary", lovelace: "30000000", tag: "withdrawByHand" },
        { to: "sweeper", lovelace: "30000000" },
      ],
    },
  ));

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

for (const pool of Object.keys(POOLS) as Pool[]) {
  test(`costs.json is up to date for ${pool}`, async () => {
    const { sweeps, largestSweep } = recorded.pools[pool];
    for (const size of SWEEP_SIZES) {
      assert.deepEqual(await measure(pool, size), sweeps[size], `${size} donations: run npm run bench`);
    }
    // The search is slow, so check only its answer: that size fits, one more does not.
    assert.ok((await measure(pool, largestSweep)).fits, "largestSweep no longer fits: run npm run bench");
    assert.ok(!(await measure(pool, largestSweep + 1)).fits, "largestSweep is too small: run npm run bench");
  });
}
