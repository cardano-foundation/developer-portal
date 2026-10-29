import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MeshTxBuilder,
  deserializeAddress,
  mConStr1,
  mOutputReference,
  pubKeyAddress,
  serializeAddressObj,
} from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { BOOKS, TOKEN_UNIT, bookScriptCbor, orderDatum } from "./lib/blueprint.ts";
import type { Book } from "./lib/blueprint.ts";
import { FILL_SIZES, PARTLY, limitedBy, measure } from "./lib/costs.ts";
import type { Costs } from "./lib/costs.ts";
import { NETWORK, ORDER_QUANTITY, offlineChain } from "./lib/offline.ts";
import {
  buildCancelTx,
  buildFillTx,
  byLedgerOrder,
  collateralOf,
  fillRedeemer,
  partialFillRedeemer,
  withoutCollateral,
} from "./lib/orders.ts";

// Every transaction here is built against an in-memory chain and run through
// the real compiled validators. Nothing is submitted.

const ALL_BOOKS = Object.keys(BOOKS) as Book[];

// ---------------------------------------------------------------------------
// The builders: every honest transaction is approved.

for (const book of ALL_BOOKS) {
  test(`${book}: a fill runs one spend per order and delivers every order`, async () => {
    const chain = await offlineChain();
    const orders = chain.placeOrders(book, 3);
    const tx = await buildFillTx(
      { wallet: chain.wallet, provider: chain.fetcher, orders, evaluator: chain.evaluator },
      book,
    );
    const runs = await chain.evaluator.evaluateTx(tx, [], []);
    assert.deepEqual(
      runs.map((run) => run.tag),
      ["SPEND", "SPEND", "SPEND"],
    );
    // The seller's funds sort first, so the orders are inputs 1 to 3, and
    // their outputs are 0 to 2, each tagged with its own order.
    const body = JSON.parse(deserializeTx(tx).to_json()).body;
    assert.deepEqual(
      runs.map((run) => run.index),
      [1, 2, 3],
    );
    const sorted = orders.map((order) => order.utxo).sort(byLedgerOrder);
    sorted.forEach((utxo, n) => {
      const output = body.outputs[n];
      assert.equal(output.address, chain.buyerAddress);
      assert.ok(JSON.stringify(output.amount.multiasset).includes(`"${ORDER_QUANTITY}"`));
      assert.ok(output.plutus_data.Data.includes(utxo.input.txHash));
    });
  });

  test(`${book}: a partial fill puts the rest of each order back on the book`, async () => {
    const chain = await offlineChain();
    const orders = chain.placeOrders(book, 3);
    const tx = await buildFillTx(
      { wallet: chain.wallet, provider: chain.fetcher, orders, evaluator: chain.evaluator },
      book,
      40,
    );
    assert.equal((await chain.evaluator.evaluateTx(tx, [], [])).length, 3);
    // Each order is paid 40 tokens, then keeps 60% of its 10 ADA on the book.
    const outputs = JSON.parse(deserializeTx(tx).to_json()).body.outputs;
    for (const n of [0, 1, 2]) {
      assert.equal(outputs[2 * n].address, chain.buyerAddress);
      assert.equal(outputs[2 * n + 1].address, orders[0]!.utxo.output.address);
      assert.equal(outputs[2 * n + 1].amount.coin, "6000000");
    }
  });

  test(`${book}: the owner may cancel an order`, async () => {
    const chain = await offlineChain();
    const [order] = chain.placeOrders(book, 1);
    const tx = await buildCancelTx(chain.buyerWallet, chain.fetcher, book, order!, chain.evaluator);
    assert.deepEqual(
      (await chain.evaluator.evaluateTx(tx, [], [])).map((run) => run.tag),
      ["SPEND"],
    );
  });
}

// ---------------------------------------------------------------------------
// Attacks. `forge` builds whatever fill it is told to, with no evaluator, so
// the builder accepts what the scripts refuse. Each attack is paired with the
// honest version of the same transaction, built by the same helper, so a
// refusal cannot come from a broken helper.

type Payee = "owner" | "seller" | "restaked";

/// A payment of `quantity` tokens. `tag` is the order, by ledger position,
/// whose output reference goes in the datum; leave it out for no datum. `junk`
/// adds a token the buyer did not ask for.
type Payment = { to: Payee; quantity: number; tag?: number; junk?: boolean };

/// The rest of an order, still owed `rest` tokens and holding `lovelace`, sent
/// back to the book or somewhere else.
type Rest = { rest: number; lovelace: string; to: "book" | "seller" };

type Forgery = {
  /// How many orders (100 tokens for 10 ADA each) the transaction spends.
  orders: number;
  /// The outputs, in order: payments and, for partial fills, the rest of an
  /// order.
  outputs: (Payment | Rest)[];
  /// Partly fill every order instead of filling it, so each redeemer points at
  /// a payment followed by the rest of the order.
  partly?: boolean;
  /// For each order, the output index its redeemer points at. Defaults to
  /// output `n` for order `n`, or `2n` for a partial fill.
  pointAt?: number[];
  /// For each order, how far off its input index is. Defaults to 0.
  inputShift?: number[];
  /// Cancel every order instead, signed by this party.
  cancelBy?: "owner" | "seller";
};

async function forge(book: Book, forgery: Forgery) {
  const chain = await offlineChain();
  if (forgery.outputs.some((output) => "junk" in output && output.junk)) {
    chain.addUtxo(chain.sellerAddress, [
      { unit: "lovelace", quantity: "2000000" },
      { unit: JUNK_UNIT, quantity: "1" },
    ]);
  }
  const collateral = await collateralOf(chain.wallet);
  const funds = withoutCollateral(await chain.wallet.getUtxos(), collateral);
  const orders = chain.placeOrders(book, forgery.orders).sort((a, b) => byLedgerOrder(a.utxo, b.utxo));
  const inputs = [...orders.map((order) => order.utxo), ...funds].sort(byLedgerOrder);
  const txBuilder = new MeshTxBuilder({ fetcher: chain.fetcher });

  orders.forEach(({ utxo }, n) => {
    const input = inputs.indexOf(utxo) + (forgery.inputShift?.[n] ?? 0);
    const output = forgery.pointAt?.[n] ?? (forgery.partly ? 2 * n : n);
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
      .txInScript(bookScriptCbor(book))
      .txInInlineDatumPresent()
      .txInRedeemerValue(
        forgery.cancelBy
          ? mConStr1([])
          : forgery.partly
            ? partialFillRedeemer(book, input, output)
            : fillRedeemer(book, input, output),
      );
  });
  for (const output of forgery.outputs) {
    if ("rest" in output) {
      const address = output.to === "book" ? orders[0]!.utxo.output.address : chain.sellerAddress;
      txBuilder
        .txOut(address, [{ unit: "lovelace", quantity: output.lovelace }])
        .txOutInlineDatumValue(orderDatum(chain.buyerAddress, output.rest));
      continue;
    }
    const { to, quantity, tag, junk } = output;
    txBuilder.txOut(addressOf(chain, to), [
      { unit: TOKEN_UNIT, quantity: String(quantity) },
      ...(junk ? [{ unit: JUNK_UNIT, quantity: "1" }] : []),
    ]);
    if (tag !== undefined) {
      const { txHash, outputIndex } = orders[tag]!.utxo.input;
      txBuilder.txOutInlineDatumValue(mOutputReference(txHash, outputIndex));
    }
  }
  if (forgery.cancelBy) {
    const signer = forgery.cancelBy === "owner" ? chain.buyerAddress : chain.sellerAddress;
    txBuilder.requiredSignerHash(deserializeAddress(signer).pubKeyHash);
  }
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

type Chain = Awaited<ReturnType<typeof offlineChain>>;

/// A token nobody ordered.
const JUNK_UNIT = "00000000000000000000000000000000000000000000000000000bbb" + "4a554e4b";

function addressOf(chain: Chain, payee: Payee): string {
  if (payee === "owner") return chain.buyerAddress;
  if (payee === "seller") return chain.sellerAddress;
  // The buyer's key, under the seller's stake credential.
  const { pubKeyHash } = deserializeAddress(chain.buyerAddress);
  const { stakeCredentialHash } = deserializeAddress(chain.sellerAddress);
  return serializeAddressObj(pubKeyAddress(pubKeyHash, stakeCredentialHash), NETWORK);
}

/// Assert the honest transaction passes and the attack is refused.
async function refused(book: Book, honest: Forgery, attack: Forgery) {
  await forge(book, honest);
  await assert.rejects(forge(book, attack));
}

/// Two orders, each filled in full by its own tagged output.
const honest: Forgery = {
  orders: 2,
  outputs: [
    { to: "owner", quantity: 100, tag: 0 },
    { to: "owner", quantity: 100, tag: 1 },
  ],
};

for (const book of ALL_BOOKS) {
  test(`theft: ${book} refuses tokens delivered to someone else`, () =>
    refused(book, honest, {
      ...honest,
      outputs: [
        { to: "owner", quantity: 100, tag: 0 },
        { to: "seller", quantity: 100, tag: 1 },
      ],
    }));

  test(`theft: ${book} refuses an order filled short`, () =>
    refused(book, honest, {
      ...honest,
      outputs: [
        { to: "owner", quantity: 100, tag: 0 },
        { to: "owner", quantity: 99, tag: 1 },
      ],
    }));

  test(`theft: ${book} refuses the owner's key under someone else's stake`, () =>
    refused(book, honest, {
      ...honest,
      outputs: [
        { to: "owner", quantity: 100, tag: 0 },
        { to: "restaked", quantity: 100, tag: 1 },
      ],
    }));

  test(`theft: ${book} refuses an output without its tag`, () =>
    refused(book, honest, {
      ...honest,
      outputs: [
        { to: "owner", quantity: 100, tag: 0 },
        { to: "owner", quantity: 100 },
      ],
    }));

  test(`${book} refuses a token the buyer did not order`, () =>
    refused(book, honest, {
      ...honest,
      outputs: [
        { to: "owner", quantity: 100, tag: 0 },
        { to: "owner", quantity: 100, tag: 1, junk: true },
      ],
    }));

  // Double satisfaction: two identical orders, one output pointed at by both.
  // It carries order 0's tag, so order 1 is refused.
  test(`double satisfaction: ${book} refuses one output for two orders`, () =>
    refused(book, honest, {
      orders: 2,
      outputs: [{ to: "owner", quantity: 100, tag: 0 }],
      pointAt: [0, 0],
    }));

  test(`theft: ${book} refuses a cancel not signed by the owner`, () =>
    refused(
      book,
      { orders: 1, outputs: [], cancelBy: "owner" },
      { orders: 1, outputs: [], cancelBy: "seller" },
    ));
}

/// Two orders, each 40% filled, each followed by the rest of it: 60 tokens
/// still owed, for 6 of its 10 ADA.
const honestPartly: Forgery = {
  orders: 2,
  partly: true,
  outputs: [
    { to: "owner", quantity: 40, tag: 0 },
    { rest: 60, lovelace: "6000000", to: "book" },
    { to: "owner", quantity: 40, tag: 1 },
    { rest: 60, lovelace: "6000000", to: "book" },
  ],
};

for (const book of ALL_BOOKS) {
  test(`theft: ${book} refuses a partial fill that keeps too much ADA`, () =>
    refused(book, honestPartly, {
      ...honestPartly,
      outputs: [
        ...honestPartly.outputs.slice(0, 3),
        { rest: 60, lovelace: "5999999", to: "book" },
      ],
    }));

  test(`theft: ${book} refuses a partial fill that owes less than it should`, () =>
    refused(book, honestPartly, {
      ...honestPartly,
      outputs: [
        ...honestPartly.outputs.slice(0, 3),
        { rest: 50, lovelace: "6000000", to: "book" },
      ],
    }));

  test(`theft: ${book} refuses the rest of an order sent off the book`, () =>
    refused(book, honestPartly, {
      ...honestPartly,
      outputs: [
        ...honestPartly.outputs.slice(0, 3),
        { rest: 60, lovelace: "6000000", to: "seller" },
      ],
    }));

  // Double satisfaction: both orders point at one rest. Order 1's payment is
  // not followed by a rest of its own, so it is refused.
  test(`double satisfaction: ${book} refuses one rest for two orders`, () =>
    refused(book, honestPartly, {
      orders: 2,
      partly: true,
      outputs: [
        { to: "owner", quantity: 40, tag: 0 },
        { rest: 60, lovelace: "6000000", to: "book" },
        { to: "owner", quantity: 40, tag: 1 },
      ],
    }));
}

// The indices are checked, not trusted.
for (const book of ["byHand", "withLibrary"] as const) {
  test(`${book} refuses an index pointing at another order's output`, () =>
    refused(book, honest, { ...honest, pointAt: [0, 0] }));
}

test("withLibrary refuses an input index pointing at another input", () =>
  refused("withLibrary", honest, { ...honest, inputShift: [0, -1] }));

// ---------------------------------------------------------------------------
// `costs.json` is what the docs page shows. It is regenerated by
// `npm run bench`; this test measures again and fails if anyone forgot.

const recorded: Costs = JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8"));

for (const book of ALL_BOOKS) {
  test(`costs.json is up to date for ${book}`, async () => {
    const { fills, largestFill, limitedBy: limit, partialFills, largestPartialFill } =
      recorded.books[book];
    for (const size of FILL_SIZES) {
      assert.deepEqual(await measure(book, size), fills[size], `${size} orders: run npm run bench`);
      assert.deepEqual(
        await measure(book, size, PARTLY),
        partialFills[size],
        `${size} partial fills: run npm run bench`,
      );
    }
    assert.ok(
      (await measure(book, largestPartialFill, PARTLY)).fits,
      "largestPartialFill no longer fits: run npm run bench",
    );
    assert.ok(
      !(await measure(book, largestPartialFill + 1, PARTLY).catch(() => ({ fits: false }))).fits,
      "largestPartialFill is too small: run npm run bench",
    );
    // The search is slow, so check only its answer: that size fits, one more
    // does not, and it is stopped by the recorded limit.
    assert.ok((await measure(book, largestFill)).fits, "largestFill no longer fits: run npm run bench");
    assert.equal(await limitedBy(book, largestFill), limit, "limitedBy is stale: run npm run bench");
  });
}
