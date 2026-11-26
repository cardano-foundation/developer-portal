import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MeshTxBuilder, deserializeAddress, mConStr1, mOutputReference } from "@meshsdk/core";
import {
  BOOKS,
  FEE_PER_ORDER,
  TOKEN_UNIT,
  bookHash,
  bookScriptCbor,
  coordinatorRewardAddress,
  orderDatum,
} from "./lib/blueprint.ts";
import type { Book, CoordinatedBook, MixedBook } from "./lib/blueprint.ts";
import { BATCH_SIZES, limitedBy, measure } from "./lib/costs.ts";
import type { Costs } from "./lib/costs.ts";
import { NETWORK, TREASURY, offlineChain } from "./lib/offline.ts";
import {
  buildBatchTx,
  buildCancelTx,
  byLedgerOrder,
  collateralOf,
  coordinatorRedeemer,
  spendRedeemer,
  withoutCollateral,
} from "./lib/orders.ts";
import type { Placement } from "./lib/orders.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

const ALL_BOOKS = Object.keys(BOOKS) as Book[];
const COORDINATED: CoordinatedBook[] = ["byHand", "withLibrary", "mixedByHand", "mixedLibrary"];
const MIXED: MixedBook[] = ["mixedByHand", "mixedLibrary"];

function tags(runs: { tag: string }[]): string[] {
  return runs.map((run) => run.tag).sort();
}

// ---------------------------------------------------------------------------
// The builders: every honest transaction is approved.

for (const book of ALL_BOOKS) {
  test(`${book}: a batch of three runs the expected scripts`, async () => {
    const chain = await offlineChain();
    const tx = await buildBatchTx(
      {
        wallet: chain.wallet,
        provider: chain.fetcher,
        treasury: TREASURY,
        orders: chain.placeOrders(book, 3),
        evaluator: chain.evaluator,
      },
      book,
      NETWORK,
    );
    const expected = book === "perOrder" ? ["SPEND", "SPEND", "SPEND"] : ["REWARD", "SPEND", "SPEND", "SPEND"];
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), expected);
  });

  test(`${book}: the owner may cancel an order on its own`, async () => {
    const chain = await offlineChain();
    const [order] = chain.placeOrders(book, 1);
    const tx = await buildCancelTx(chain.buyerWallet, chain.fetcher, book, TREASURY, order!, chain.evaluator);
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), ["SPEND"]);
  });
}

for (const book of MIXED) {
  test(`${book}: a batch may mix whole and partial fills`, async () => {
    const chain = await offlineChain();
    const orders = chain.placeOrders(book, 4).map((order, n) => (n % 2 ? { ...order, partly: 40 } : order));
    const tx = await buildBatchTx(
      { wallet: chain.wallet, provider: chain.fetcher, treasury: TREASURY, orders, evaluator: chain.evaluator },
      book,
      NETWORK,
    );
    assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), [
      "REWARD",
      "SPEND",
      "SPEND",
      "SPEND",
      "SPEND",
    ]);
  });
}

// ---------------------------------------------------------------------------
// Attacks. `forge` builds a batch of two orders, the second one partly filled
// for a mixed batch, with one thing changed, and no evaluator, so the builder
// accepts what the scripts refuse. Each attack is paired with the honest
// batch, built by the same helper, so a refusal cannot come from a broken
// helper.

type Tamper =
  /// Deliver the second order's tokens to the seller.
  | "paySeller"
  /// Pay the fee for one order fewer.
  | "feeShort"
  /// Tag the fee for another book.
  | "feeForAnotherBook"
  /// Drop the second order's payment and point it at the first one's.
  | "reusePayment"
  /// Leave the coordinator out.
  | "noCoordinator"
  /// Leave the second order out of the coordinator's redeemer, and keep it.
  | "leaveOut"
  /// Have the owner cancel the second order inside the batch, and keep it.
  | "cancelInBatch"
  /// Keep one lovelace too many from the second order's rest.
  | "restShort";

async function forge(book: Book, options: { mixed?: boolean; tamper?: Tamper } = {}) {
  const { mixed = false, tamper } = options;
  const chain = await offlineChain();
  const collateral = await collateralOf(chain.wallet);
  const funds = withoutCollateral(await chain.wallet.getUtxos(), collateral);
  const orders = chain
    .placeOrders(book, 2)
    .map((order, n) => (mixed && n === 1 ? { ...order, partly: 40 } : order))
    .sort((a, b) => byLedgerOrder(a.utxo, b.utxo));
  const inputs = [...orders.map((order) => order.utxo), ...funds].sort(byLedgerOrder);
  const dropsSecond = tamper === "reusePayment" || tamper === "leaveOut" || tamper === "cancelInBatch";

  // Lay out the outputs, as the honest builder does, then bend them.
  const placements: Placement[] = [];
  let next = 0;
  for (const [n, order] of orders.entries()) {
    if (n === 1 && dropsSecond) {
      placements.push({ order, input: inputs.indexOf(order.utxo), payment: 0 });
      continue;
    }
    placements.push({ order, input: inputs.indexOf(order.utxo), payment: next });
    next += order.partly === undefined ? 1 : 2;
  }
  const feeIndex = next;
  const counted = tamper === "leaveOut" || tamper === "cancelInBatch" ? placements.slice(0, 1) : placements;

  const script = bookScriptCbor(book, TREASURY);
  const txBuilder = new MeshTxBuilder({ fetcher: chain.fetcher });
  for (const [n, placement] of placements.entries()) {
    const { utxo } = placement.order;
    const cancels = n === 1 && tamper === "cancelInBatch";
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
      .txInScript(script)
      .txInInlineDatumPresent()
      .txInRedeemerValue(cancels ? mConStr1([]) : spendRedeemer(book, TREASURY, placement, feeIndex));
  }
  if (tamper === "cancelInBatch") {
    txBuilder.requiredSignerHash(deserializeAddress(chain.buyerAddress).pubKeyHash);
  }
  if (book !== "perOrder" && tamper !== "noCoordinator") {
    txBuilder
      .withdrawalPlutusScriptV3()
      .withdrawal(coordinatorRewardAddress(book, TREASURY, NETWORK), "0")
      .withdrawalScript(script)
      .withdrawalRedeemerValue(coordinatorRedeemer(book, counted, feeIndex));
  }
  for (const [n, order] of orders.entries()) {
    if (n === 1 && dropsSecond) continue;
    const { utxo, owner, quantity, partly } = order;
    const sent = partly ?? quantity;
    const to = n === 1 && tamper === "paySeller" ? chain.sellerAddress : owner;
    txBuilder
      .txOut(to, [{ unit: TOKEN_UNIT, quantity: String(sent) }])
      .txOutInlineDatumValue(mOutputReference(utxo.input.txHash, utxo.input.outputIndex));
    if (partly !== undefined) {
      const kept = n === 1 && tamper === "restShort" ? 5_999_999 : 6_000_000;
      txBuilder
        .txOut(utxo.output.address, [{ unit: "lovelace", quantity: String(kept) }])
        .txOutInlineDatumValue(orderDatum(owner, quantity - sent));
    }
  }
  const feeOrders = BigInt(tamper === "feeShort" ? counted.length - 1 : counted.length);
  txBuilder
    .txOut(TREASURY, [{ unit: "lovelace", quantity: String(FEE_PER_ORDER * feeOrders) }])
    .txOutInlineDatumValue(bookHash(tamper === "feeForAnotherBook" ? otherBook(book) : book, TREASURY));
  for (const { input, output } of funds) {
    txBuilder.txIn(input.txHash, input.outputIndex, output.amount, output.address);
  }
  const tx = await txBuilder
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(chain.sellerAddress)
    .complete();
  return chain.evaluator.evaluateTx(tx, [], []);
}

function otherBook(book: Book): Book {
  return book === "perOrder" ? "byHand" : "perOrder";
}

/// Assert the honest batch passes and the tampered one is refused.
async function refused(book: Book, tamper: Tamper, mixed = false) {
  await forge(book, { mixed });
  await assert.rejects(forge(book, { mixed, tamper }));
}

for (const book of ALL_BOOKS) {
  test(`theft: ${book} refuses tokens delivered to someone else`, () => refused(book, "paySeller"));
  test(`theft: ${book} refuses a fee for one order fewer`, () => refused(book, "feeShort"));
  test(`theft: ${book} refuses a fee paid on behalf of another book`, () =>
    refused(book, "feeForAnotherBook"));
  test(`double satisfaction: ${book} refuses one payment for two orders`, () =>
    refused(book, "reusePayment"));
}

for (const book of COORDINATED) {
  test(`theft: ${book} refuses a batch without its coordinator`, () => refused(book, "noCoordinator"));
  test(`theft: ${book} refuses an order left out of the coordinator's redeemer`, () =>
    refused(book, "leaveOut"));
  test(`theft: ${book} refuses a cancel inside a batch`, () => refused(book, "cancelInBatch"));
}

for (const book of MIXED) {
  test(`theft: ${book} refuses a partial fill that keeps too much ADA`, () =>
    refused(book, "restShort", true));
  test(`theft: ${book} refuses a mixed batch paid to someone else`, () =>
    refused(book, "paySeller", true));
  test(`theft: ${book} refuses a mixed batch that leaves an order out`, () =>
    refused(book, "leaveOut", true));
}

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

const kinds: [keyof Omit<Costs, "limits">, Book, boolean][] = [
  ...ALL_BOOKS.map((book): [keyof Omit<Costs, "limits">, Book, boolean] => ["whole", book, false]),
  ...MIXED.map((book): [keyof Omit<Costs, "limits">, Book, boolean] => ["mixed", book, true]),
];

for (const [kind, book, mixed] of kinds) {
  test(`costs.json is up to date for ${kind} batches with ${book}`, async () => {
    const { batches, largestBatch, limitedBy: limit } = (recorded[kind] as Record<Book, Costs["whole"][Book]>)[book];
    for (const size of BATCH_SIZES) {
      assert.deepEqual(await measure(book, size, mixed), batches[size], `${size} orders: run npm run bench`);
    }
    // The search is slow, so check only its answer: that size fits, one more
    // does not, and it is stopped by the recorded limit.
    assert.ok((await measure(book, largestBatch, mixed)).fits, "largestBatch no longer fits: run npm run bench");
    assert.equal(await limitedBy(book, largestBatch, mixed), limit, "limitedBy is stale: run npm run bench");
  });
}
