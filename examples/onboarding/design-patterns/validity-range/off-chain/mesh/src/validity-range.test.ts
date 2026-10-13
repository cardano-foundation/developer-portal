import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MeshTxBuilder, deserializeAddress, mOutputReference } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, grantScriptCbor } from "./lib/blueprint.ts";
import type { Version } from "./lib/blueprint.ts";
import { SCENARIOS, measure } from "./lib/costs.ts";
import type { Costs, Scenario } from "./lib/costs.ts";
import { START_SLOT, VESTING_SLOTS, offlineChain } from "./lib/offline.ts";
import type { Period } from "./lib/schedule.ts";
import { CLAIM, CLAWBACK, buildClaimTx, buildClawbackTx, slotTime, unvested } from "./lib/vesting.ts";
import type { Spend, Window } from "./lib/vesting.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

const ALL = Object.keys(VERSIONS) as Version[];

/// Halfway through: a claim from this slot leaves 5 ADA behind, and a
/// clawback until this slot owes the beneficiary 4,999,999 lovelace.
const HALFWAY = START_SLOT + VESTING_SLOTS / 2;


async function spendOf(version: Version, who: "beneficiary" | "grantor", window: Window) {
  const chain = await offlineChain();
  const spend: Spend = {
    wallet: who === "beneficiary" ? chain.beneficiaryWallet : chain.grantorWallet,
    provider: chain.fetcher,
    version,
    grant: chain.grant,
    grantUtxo: chain.lock(version),
    window,
    evaluator: chain.evaluator,
  };
  return { chain, spend };
}

function tags(runs: { tag: string }[]): string[] {
  return runs.map((run) => run.tag).sort();
}

function outputsOf(tx: string): { address: string; amount: { coin: string } }[] {
  return JSON.parse(deserializeTx(tx).to_json()).body.outputs;
}

// ---------------------------------------------------------------------------
// The builders: every honest transaction is approved, by every version.

for (const version of ALL) {
  for (const scenario of Object.keys(SCENARIOS) as Scenario[]) {
    const { action, window } = SCENARIOS[scenario];
    test(`${version}: ${scenario} runs the grant once`, async () => {
      const who = action === "claim" ? "beneficiary" : "grantor";
      const { chain, spend } = await spendOf(version, who, window);
      const tx = action === "claim" ? await buildClaimTx(spend) : await buildClawbackTx(spend);
      assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
    });
  }

  test(`${version}: a claim halfway leaves half the grant behind`, async () => {
    const { spend } = await spendOf(version, "beneficiary", { from: START_SLOT + VESTING_SLOTS / 2 });
    const [rest] = outputsOf(await buildClaimTx(spend));
    assert.equal(rest!.amount.coin, "5000000");
  });

  test(`${version}: a claim once fully vested takes everything`, async () => {
    const { chain, spend } = await spendOf(version, "beneficiary", { from: START_SLOT + VESTING_SLOTS });
    const tx = await buildClaimTx(spend);
    assert.equal(outputsOf(tx).length, 1, "only the beneficiary's change");
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
  });

  // One slot before the end, 1,000 lovelace are unvested: less than the ledger
  // accepts in an output, so the claim sends back the minimum instead.
  test(`${version}: a claim near the end sends back at least the ledger's minimum`, async () => {
    const { chain, spend } = await spendOf(version, "beneficiary", { from: START_SLOT + VESTING_SLOTS - 1 });
    const tx = await buildClaimTx(spend);
    const rest = BigInt(outputsOf(tx)[0]!.amount.coin);
    assert.ok(rest > 1_000n, `the rest holds ${rest} lovelace`);
    assert.ok(rest >= 1_000_000n, "an output with a datum needs at least 1 ADA");
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
  });

  test(`${version}: a clawback before the start takes everything back`, async () => {
    const { chain, spend } = await spendOf(version, "grantor", { until: START_SLOT });
    const tx = await buildClawbackTx(spend);
    assert.equal(outputsOf(tx).length, 1, "only the grantor's change");
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
  });
}

// The ledger excludes an upper bound from the window, and so does the
// evaluator: a clawback valid until slot S may happen up to one millisecond
// before S starts, and owes what has vested by then, not by S.
test("a clawback owes what has vested one millisecond before its upper bound", async () => {
  const until = START_SLOT + VESTING_SLOTS / 2;
  const { chain, spend } = await spendOf("byHand", "grantor", { until });
  const [payment] = outputsOf(await buildClawbackTx(spend));
  assert.equal(BigInt(payment!.amount.coin), chain.grant.total - unvested(chain.grant, slotTime(until) - 1));
  assert.equal(payment!.amount.coin, "4999999");
});

// ---------------------------------------------------------------------------
// The second example: the vesting period is an interval in the datum, so the
// grantor can write it in any encoding, or leave a bound out.

async function scheduledSpendOf(
  version: "scheduledNaive" | "scheduled",
  who: "beneficiary" | "grantor",
  window: Window,
  period: (grant: { start: number; end: number }) => Period,
) {
  const chain = await offlineChain();
  const locked = chain.lockScheduled(version, period(chain.grant));
  const spend: Spend = {
    wallet: who === "beneficiary" ? chain.beneficiaryWallet : chain.grantorWallet,
    provider: chain.fetcher,
    version,
    grant: locked.grant,
    grantUtxo: locked.utxo,
    window,
  };
  return { chain, spend };
}

/// Build without running the scripts, then run them: the builder accepts what
/// the scripts refuse, so a refusal comes from the grant.
async function evaluate(chain: Awaited<ReturnType<typeof offlineChain>>, tx: Promise<string>) {
  return chain.evaluator.evaluateTx(await tx, [], []);
}

/// Four encodings of the test grant's period: closed, open, and both mixes.
const ENCODINGS: ((grant: { start: number; end: number }) => Period)[] = [
  ({ start, end }) => ({ lower: { at: start, included: true }, upper: { at: end, included: true } }),
  ({ start, end }) => ({ lower: { at: start - 1, included: false }, upper: { at: end, included: true } }),
  ({ start, end }) => ({ lower: { at: start, included: true }, upper: { at: end + 1, included: false } }),
  ({ start, end }) => ({ lower: { at: start - 1, included: false }, upper: { at: end + 1, included: false } }),
];

/// No start: a cliff at the end.
const CLIFF = ({ end }: { end: number }): Period => ({
  lower: { included: true },
  upper: { at: end, included: true },
});

/// No end: it never finishes vesting.
const ENDLESS = ({ start }: { start: number }): Period => ({
  lower: { at: start, included: true },
  upper: { included: true },
});

test("scheduled: every encoding of the period leaves the same rest", async () => {
  for (const period of ENCODINGS) {
    const { chain, spend } = await scheduledSpendOf("scheduled", "beneficiary", { from: HALFWAY }, period);
    const tx = await buildClaimTx(spend);
    assert.equal(outputsOf(tx)[0]!.amount.coin, "5000000");
    assert.deepEqual(tags(await evaluate(chain, Promise.resolve(tx))), ["SPEND"]);
  }
});

test("scheduled: a cliff vests everything at its end", async () => {
  const { chain, spend } = await scheduledSpendOf("scheduled", "beneficiary", { from: START_SLOT + VESTING_SLOTS }, CLIFF);
  const tx = await buildClaimTx(spend);
  assert.equal(outputsOf(tx).length, 1, "only the beneficiary's change");
  assert.deepEqual(tags(await evaluate(chain, Promise.resolve(tx))), ["SPEND"]);
});

test("scheduled: a cliff vests nothing before its end", async () => {
  const { chain, spend } = await scheduledSpendOf("scheduled", "grantor", { until: START_SLOT + VESTING_SLOTS }, CLIFF);
  const tx = await buildClawbackTx(spend);
  assert.equal(outputsOf(tx).length, 1, "the grantor takes everything back");
  assert.deepEqual(tags(await evaluate(chain, Promise.resolve(tx))), ["SPEND"]);
});

test("scheduled: a grant whose period never ends can be taken back whole", async () => {
  const { chain, spend } = await scheduledSpendOf("scheduled", "grantor", { until: START_SLOT + 10 * VESTING_SLOTS }, ENDLESS);
  const tx = await buildClawbackTx(spend);
  assert.equal(outputsOf(tx).length, 1, "the grantor takes everything back");
  assert.deepEqual(tags(await evaluate(chain, Promise.resolve(tx))), ["SPEND"]);
});

test("scheduledNaive: a cliff grant can never be spent again", async () => {
  const claim = await scheduledSpendOf("scheduledNaive", "beneficiary", { from: START_SLOT + VESTING_SLOTS }, CLIFF);
  await assert.rejects(evaluate(claim.chain, buildClaimTx(claim.spend)), /"tag":"spend"/);
  const clawback = await scheduledSpendOf("scheduledNaive", "grantor", { until: START_SLOT }, CLIFF);
  await assert.rejects(evaluate(clawback.chain, buildClawbackTx(clawback.spend)), /"tag":"spend"/);
});

test("scheduledNaive: a grant whose period never ends can never be taken back", async () => {
  const { chain, spend } = await scheduledSpendOf("scheduledNaive", "grantor", { until: START_SLOT }, ENDLESS);
  await assert.rejects(evaluate(chain, buildClawbackTx(spend)), /"tag":"spend"/);
});

// ---------------------------------------------------------------------------
// Attacks. `forge` builds whatever transaction it is told to, with no
// evaluator, so the builder accepts what the scripts refuse. Each attack is
// paired with the honest version of the same transaction, built by the same
// helper, so a refusal cannot come from a broken helper.

type Forgery = {
  version: Version;
  action: "claim" | "clawback";
  /// Who builds and signs the transaction.
  signer: "beneficiary" | "grantor";
  window: Window;
  /// How many identical grants the transaction spends.
  grants?: number;
  /// Lovelace sent back to the grant, under the same datum.
  rest?: bigint;
  /// Lovelace paid to the beneficiary, and whether the payment carries the
  /// first grant's output reference as its tag.
  payment?: { lovelace: bigint; tagged: boolean };
};

async function forge(forgery: Forgery) {
  const chain = await offlineChain();
  const { version, window } = forgery;
  const wallet = forgery.signer === "beneficiary" ? chain.beneficiaryWallet : chain.grantorWallet;
  const signerAddress = await wallet.getChangeAddress();
  const collateral = (await wallet.getCollateral())[0]!;
  const grants = Array.from({ length: forgery.grants ?? 1 }, () => chain.lock(version));
  const txBuilder = new MeshTxBuilder({ fetcher: chain.fetcher });

  for (const grant of grants) {
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(grant.input.txHash, grant.input.outputIndex, grant.output.amount, grant.output.address)
      .txInScript(grantScriptCbor(version))
      .txInInlineDatumPresent()
      .txInRedeemerValue(forgery.action === "claim" ? CLAIM : CLAWBACK);
  }
  if (window.from !== undefined) txBuilder.invalidBefore(window.from);
  if (window.until !== undefined) txBuilder.invalidHereafter(window.until);
  if (forgery.rest !== undefined) {
    txBuilder
      .txOut(grants[0]!.output.address, [{ unit: "lovelace", quantity: forgery.rest.toString() }])
      .txOutInlineDatumValue(grants[0]!.output.plutusData!, "CBOR");
  }
  if (forgery.payment) {
    txBuilder.txOut(chain.beneficiaryAddress, [
      { unit: "lovelace", quantity: forgery.payment.lovelace.toString() },
    ]);
    if (forgery.payment.tagged) {
      const { txHash, outputIndex } = grants[0]!.input;
      txBuilder.txOutInlineDatumValue(mOutputReference(txHash, outputIndex));
    }
  }

  const tx = await txBuilder
    .requiredSignerHash(deserializeAddress(signerAddress).pubKeyHash)
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
    .changeAddress(signerAddress)
    .selectUtxosFrom((await wallet.getUtxos()).filter((u) => u.input.txHash !== collateral.input.txHash))
    .complete();
  return chain.evaluator.evaluateTx(tx, [], []);
}

/// Assert the honest transaction passes and the attack is refused, by the
/// grant's own spend script rather than by anything else.
async function refused(honest: Forgery, attack: Partial<Forgery>) {
  await forge(honest);
  await assert.rejects(forge({ ...honest, ...attack }), /"tag":"spend"/);
}


for (const version of ALL) {
  const claim: Forgery = {
    version,
    action: "claim",
    signer: "beneficiary",
    window: { from: HALFWAY, until: HALFWAY + 100 },
    rest: 5_000_000n,
  };
  const clawback: Forgery = {
    version,
    action: "clawback",
    signer: "grantor",
    window: { from: HALFWAY - 100, until: HALFWAY },
    payment: { lovelace: 4_999_999n, tagged: true },
  };

  test(`theft: ${version} refuses a claim that keeps one lovelace too many`, () =>
    refused(claim, { rest: 4_999_999n }));

  test(`theft: ${version} refuses a claim the beneficiary did not sign`, () =>
    refused(claim, { signer: "grantor" }));

  test(`theft: ${version} refuses two grants claimed against one rest`, () =>
    refused(claim, { grants: 2 }));

  test(`theft: ${version} refuses a clawback that pays one lovelace short`, () =>
    refused(clawback, { payment: { lovelace: 4_999_998n, tagged: true } }));

  test(`theft: ${version} refuses a clawback the grantor did not sign`, () =>
    refused(clawback, { signer: "beneficiary" }));

  test(`theft: ${version} refuses a clawback paid without the grant's tag`, () =>
    refused(clawback, { payment: { lovelace: 4_999_999n, tagged: false } }));

  // A window with no lower bound may be happening at any moment in the past,
  // so it says nothing about what has vested.
  test(`theft: ${version} refuses a claim with no lower bound`, () =>
    refused(claim, { window: { until: HALFWAY + 100 } }));

  // A window with no upper bound may be happening at any moment in the future.
  test(`theft: ${version} refuses a clawback with no upper bound`, () =>
    refused(clawback, { window: { from: HALFWAY - 100 } }));
}

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

for (const version of ALL) {
  test(`costs.json is up to date for ${version}`, async () => {
    for (const scenario of Object.keys(SCENARIOS) as Scenario[]) {
      assert.deepEqual(
        await measure(version, scenario),
        recorded.versions[version][scenario],
        `${scenario}: run npm run bench`,
      );
    }
  });
}
