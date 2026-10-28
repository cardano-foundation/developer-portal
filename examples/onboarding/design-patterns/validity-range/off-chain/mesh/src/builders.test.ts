import assert from "node:assert/strict";
import { test } from "node:test";
import { deserializeAddress, pubKeyAddress, serializeAddressObj, serializeData } from "@meshsdk/core";
import { csl, deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, grantAddress, grantDatum, isScheduled } from "./lib/blueprint.ts";
import type { Grant, Version } from "./lib/blueprint.ts";
import { START_SLOT, VESTING_SLOTS, offlineChain } from "./lib/offline.ts";
import { scheduledDatum, vestingOf } from "./lib/schedule.ts";
import type { Period } from "./lib/schedule.ts";
import {
  buildClaimTx, buildClawbackTx, buildLockTx, buildScheduledLockTx, slotTime,
} from "./lib/vesting.ts";
import type { Spend } from "./lib/vesting.ts";

type Chain = Awaited<ReturnType<typeof offlineChain>>;
const ALL = Object.keys(VERSIONS) as Version[];
const HALFWAY = START_SLOT + VESTING_SLOTS / 2;

// Read the real builder's output into the offline UTxO set. Do not reconstruct
// its datum with a fixture: that previously hid an unspendable lock output.
function recordOutput(chain: Chain, tx: string, index = 0) {
  const output = deserializeTx(tx).body().outputs().get(index);
  return chain.addUtxo(
    output.address().to_bech32(),
    [{ unit: "lovelace", quantity: output.amount().coin().to_str() }],
    output.plutus_data()?.to_hex(),
  );
}

async function lock(chain: Chain, version: Version, grant: Grant) {
  const args = [chain.grantorWallet, chain.fetcher] as const;
  const tx = isScheduled(version)
    ? await buildScheduledLockTx(...args, version, grant, {
        lower: { at: grant.start, included: true }, upper: { at: grant.end, included: true },
      }, 0)
    : await buildLockTx(...args, version, grant, 0);
  await assertMinimumOutputs(chain, tx);
  return recordOutput(chain, tx);
}

function coin(tx: string, index = 0): bigint {
  return BigInt(deserializeTx(tx).body().outputs().get(index).amount().coin().to_str());
}

// Check the actual serialized outputs, including their datums and the final
// coin encoding. Phase-two script evaluation does not perform this check.
async function assertMinimumOutputs(chain: Chain, tx: string) {
  const { coinsPerUtxoSize } = await chain.fetcher.fetchProtocolParameters(Number.NaN);
  const cost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(coinsPerUtxoSize.toString()));
  const outputs = deserializeTx(tx).body().outputs();
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    const minimum = BigInt(csl.min_ada_for_output(output, cost).to_str());
    assert.ok(coin(tx, i) >= minimum, `output ${i}: ${coin(tx, i)} < ${minimum}`);
  }
}

// Mutate only the payment/rest after a successful control transaction. The
// evaluator must reject the script itself, not a failing transaction builder.
function changeFirstOutput(txHex: string, lovelace: bigint, address?: string): string {
  const tx = JSON.parse(deserializeTx(txHex).to_json());
  tx.body.outputs[0].amount.coin = lovelace.toString();
  if (address) tx.body.outputs[0].address = address;
  return csl.Transaction.from_json(JSON.stringify(tx)).to_hex();
}

async function accepts(chain: Chain, tx: string) {
  assert.deepEqual((await chain.evaluator.evaluateTx(tx, [], [])).map(({ tag }) => tag), ["SPEND"]);
}

for (const version of ALL) {
  test(`${version}: real lock output supports partial claim, later clawback, and final claim`, async () => {
    const chain = await offlineChain();
    const grantUtxo = await lock(chain, version, chain.grant);
    const spend: Spend = {
      wallet: chain.beneficiaryWallet, provider: chain.fetcher, version,
      grant: chain.grant, grantUtxo, window: { from: HALFWAY }, evaluator: chain.evaluator,
    };
    const claimed = await buildClaimTx(spend);
    assert.equal(coin(claimed), 5_000_000n);
    const rest = recordOutput(chain, claimed);
    assert.equal(rest.output.plutusData, grantUtxo.output.plutusData);
    await accepts(chain, claimed);
    const clawback = await buildClawbackTx({
      ...spend, grantUtxo: rest, wallet: chain.grantorWallet,
      window: { until: START_SLOT + 7_500 },
    });
    assert.equal(coin(clawback), 2_499_999n, "only the remaining vested portion is owed");
    await accepts(chain, clawback);
    const finalClaim = await buildClaimTx({ ...spend, grantUtxo: rest, window: { from: START_SLOT + VESTING_SLOTS } });
    assert.equal(deserializeTx(finalClaim).body().outputs().len(), 1);
    await accepts(chain, finalClaim);
    await accepts(chain, await buildClawbackTx({ ...spend, wallet: chain.grantorWallet, window: { until: START_SLOT } }));
  });

  test(`${version}: fractional vesting rounds against the builder in both actions`, async () => {
    for (const [total, extraDuration] of [[10_000_001n, 0], [10_000_000n, 3]] as const) {
      const chain = await offlineChain();
      const grant = { ...chain.grant, total, end: chain.grant.end + extraDuration };
      const grantUtxo = await lock(chain, version, grant);
      const spend: Spend = {
        wallet: chain.beneficiaryWallet, provider: chain.fetcher, version, grant, grantUtxo,
        window: { from: HALFWAY }, evaluator: chain.evaluator,
      };
      const duration = BigInt(grant.end - grant.start);
      const claimNumerator = total * BigInt(grant.end - slotTime(HALFWAY));
      assert.notEqual(claimNumerator % duration, 0n, "exercise fractional lovelace");
      const claim = await buildClaimTx(spend);
      const kept = coin(claim);
      assert.ok(kept * duration >= claimNumerator);
      assert.ok((kept - 1n) * duration < claimNumerator);
      await accepts(chain, claim);
      await assert.rejects(chain.evaluator.evaluateTx(changeFirstOutput(claim, kept - 1n), [], []), /"tag":"spend"/);

      const clawback = await buildClawbackTx({ ...spend, wallet: chain.grantorWallet, window: { until: HALFWAY } });
      const paid = coin(clawback);
      const clawbackNumerator = total * BigInt(grant.end - (slotTime(HALFWAY) - 1));
      assert.notEqual(clawbackNumerator % duration, 0n);
      assert.ok((total - paid) * duration <= clawbackNumerator);
      assert.ok((total - paid + 1n) * duration > clawbackNumerator);
      await accepts(chain, clawback);
      await assert.rejects(chain.evaluator.evaluateTx(changeFirstOutput(clawback, paid - 1n), [], []), /"tag":"spend"/);
    }
  });

  test(`${version}: small clawback payments and claim rests meet the exact ledger minimum`, async () => {
    const chain = await offlineChain();
    const spend: Spend = {
      wallet: chain.grantorWallet, provider: chain.fetcher, version, grant: chain.grant,
      grantUtxo: await lock(chain, version, chain.grant), window: { until: START_SLOT + 1 }, evaluator: chain.evaluator,
    };
    const clawback = await buildClawbackTx(spend);
    assert.ok(coin(clawback) > 999n, "the beneficiary's 999 lovelace need a top-up");
    await assertMinimumOutputs(chain, clawback);
    await accepts(chain, clawback);
    const claim = await buildClaimTx({ ...spend, wallet: chain.beneficiaryWallet, window: { from: START_SLOT + VESTING_SLOTS - 1 } });
    assert.ok(coin(claim) > 1_000n);
    await assertMinimumOutputs(chain, claim);
    await accepts(chain, claim);
  });

  for (const stake of ["key", "script", "none"] as const) {
    test(`${version}: preserves a beneficiary with ${stake} staking credential and rejects a changed address`, async () => {
      const chain = await offlineChain();
      const { pubKeyHash, stakeCredentialHash } = deserializeAddress(chain.beneficiaryAddress);
      const beneficiaryAddress = serializeAddressObj(
        pubKeyAddress(pubKeyHash, stake === "none" ? undefined : stakeCredentialHash, stake === "script"), 0,
      );
      const grant = { ...chain.grant, beneficiaryAddress };
      const grantUtxo = await lock(chain, version, grant);
      const tx = await buildClawbackTx({
        wallet: chain.grantorWallet, provider: chain.fetcher, version, grant, grantUtxo,
        window: { until: HALFWAY }, evaluator: chain.evaluator,
      });
      assert.equal(deserializeTx(tx).body().outputs().get(0).address().to_bech32(), beneficiaryAddress);
      await accepts(chain, tx);
      const changedAddress = serializeAddressObj(pubKeyAddress(pubKeyHash, "01".repeat(28)), 0);
      await assert.rejects(chain.evaluator.evaluateTx(changeFirstOutput(tx, coin(tx), changedAddress), [], []), /"tag":"spend"/);
    });
  }
}

test("lock APIs reject the wrong validator family at both the type and runtime boundaries", async () => {
  const chain = await offlineChain();
  const args = [chain.grantorWallet, chain.fetcher] as const;
  // @ts-expect-error A ScheduledGrant validator must not receive a Grant datum.
  await assert.rejects(buildLockTx(...args, "scheduled", chain.grant, 0), /buildScheduledLockTx/);
  // @ts-expect-error A Grant validator must not receive a ScheduledGrant datum.
  await assert.rejects(buildScheduledLockTx(...args, "naive", chain.grant, chain.period, 0), /buildLockTx/);
});

test("both lock APIs reject underfunded outputs rather than silently changing the grant total", async () => {
  const chain = await offlineChain();
  const grant = { ...chain.grant, total: 1_000n };
  await assert.rejects(buildLockTx(chain.grantorWallet, chain.fetcher, "byHand", grant, 0), /needs at least/);
  await assert.rejects(buildScheduledLockTx(chain.grantorWallet, chain.fetcher, "scheduled", grant, chain.period, 0), /needs at least/);
});

test("datum builders reject parties whose payment credentials cannot sign", async () => {
  const chain = await offlineChain();
  for (const field of ["beneficiaryAddress", "grantorAddress"] as const) {
    const grant = { ...chain.grant, [field]: grantAddress("byHand", 0) };
    assert.throws(() => grantDatum(grant), /key payment credential/);
    assert.throws(() => scheduledDatum(grant, chain.period), /key payment credential/);
  }
});

test("datum builders reject pointer addresses instead of dropping the pointer", async () => {
  const chain = await offlineChain();
  const { pubKeyHash } = deserializeAddress(chain.beneficiaryAddress);
  const address = csl.PointerAddress.new(
    0, csl.Credential.from_keyhash(csl.Ed25519KeyHash.from_hex(pubKeyHash)), csl.Pointer.new(1, 0, 0),
  ).to_address().to_bech32();
  const grant = { ...chain.grant, beneficiaryAddress: address };
  assert.throws(() => grantDatum(grant), /base or enterprise/);
  assert.throws(() => scheduledDatum(grant, chain.period), /base or enterprise/);
});

for (const shape of ["cliff", "singleton", "endless", "always", "empty"] as const) {
  test(`scheduled: real ${shape} lock follows the chosen vesting/refund policy`, async () => {
    const chain = await offlineChain();
    const { start, end } = chain.grant;
    const periods: Record<typeof shape, Period> = {
      cliff: { lower: { included: true }, upper: { at: end, included: true } },
      singleton: { lower: { at: end, included: true }, upper: { at: end, included: true } },
      endless: { lower: { at: start, included: true }, upper: { included: true } },
      always: { lower: { included: false }, upper: { included: false } },
      empty: { lower: { at: end, included: true }, upper: { at: start, included: true } },
    };
    const period = periods[shape];
    const locked = await buildScheduledLockTx(chain.grantorWallet, chain.fetcher, "scheduled", chain.grant, period, 0);
    const spend: Spend = {
      wallet: chain.grantorWallet, provider: chain.fetcher, version: "scheduled",
      grant: vestingOf(chain.grant, period), grantUtxo: recordOutput(chain, locked), window: { until: START_SLOT },
    };
    const before = await buildClawbackTx(spend);
    assert.equal(deserializeTx(before).body().outputs().len(), 1);
    await accepts(chain, before);
    const claim = await buildClaimTx({ ...spend, wallet: chain.beneficiaryWallet, window: { from: START_SLOT + VESTING_SLOTS } });
    if (shape === "cliff" || shape === "singleton") {
      await accepts(chain, claim);
      const paid = await buildClawbackTx({ ...spend, window: { until: START_SLOT + VESTING_SLOTS + 1 } });
      assert.equal(coin(paid), chain.grant.total);
      await accepts(chain, paid);
      await assert.rejects(chain.evaluator.evaluateTx(changeFirstOutput(paid, coin(paid) - 1n), [], []), /"tag":"spend"/);
    } else {
      await assert.rejects(chain.evaluator.evaluateTx(claim, [], []), /"tag":"spend"/);
      const refund = await buildClawbackTx({ ...spend, window: { until: START_SLOT + VESTING_SLOTS + 1 } });
      assert.equal(deserializeTx(refund).body().outputs().len(), 1);
      await accepts(chain, refund);
      const unsigned = JSON.parse(deserializeTx(refund).to_json());
      unsigned.body.required_signers = null;
      await assert.rejects(chain.evaluator.evaluateTx(csl.Transaction.from_json(JSON.stringify(unsigned)).to_hex(), [], []), /"tag":"spend"/);
    }
  });
}

test("normalization cannot recover a datum of the wrong type", async () => {
  const chain = await offlineChain();
  const bad = chain.addUtxo(grantAddress("scheduled", 0), [{ unit: "lovelace", quantity: "10000000" }], serializeData(grantDatum(chain.grant)));
  const spend: Spend = {
    wallet: chain.beneficiaryWallet, provider: chain.fetcher, version: "scheduled",
    grant: chain.grant, grantUtxo: bad, window: { from: START_SLOT + VESTING_SLOTS },
  };
  await assert.rejects(chain.evaluator.evaluateTx(await buildClaimTx(spend), [], []), /"tag":"spend"/);
  await assert.rejects(chain.evaluator.evaluateTx(await buildClawbackTx({ ...spend, wallet: chain.grantorWallet, window: { until: START_SLOT } }), [], []), /"tag":"spend"/);
});
