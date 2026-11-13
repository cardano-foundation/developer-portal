import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PROTOCOL_PARAMETERS,
  MeshTxBuilder,
  OfflineFetcher,
  mConStr0,
  mConStr1,
  serializeData,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";

import { CARD_NAME_HEX, cardAddress, cardPolicyId, cardScriptCbor, cardUnit } from "./lib/blueprint.ts";
import { buildCardCreateTx, buildCardKeepTx, buildCardRedeemTx } from "./lib/giftcard.ts";
import type { Card } from "./lib/giftcard.ts";

// An in-memory chain and a funded wallet. No node and no waiting: the tests
// below build real transactions and run the real compiled validator on them.
const NETWORK = 0;

const HOLDER =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

function newFetcher(): OfflineFetcher {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  return fetcher;
}

async function makeWallet(fetcher: OfflineFetcher, mnemonic: string[]): Promise<MeshWallet> {
  // No submitter: these tests build and evaluate, they never submit anywhere.
  const wallet = new MeshWallet({
    networkId: NETWORK,
    fetcher,
    key: { type: "mnemonic", words: mnemonic },
  });
  await wallet.init();
  return wallet;
}

let txCounter = 0;
function nextTxHash(): string {
  txCounter += 1;
  return txCounter.toString(16).padStart(64, "0");
}

function addUtxo(fetcher: OfflineFetcher, address: string, assets: Asset[], plutusData?: string) {
  const utxo = {
    input: { txHash: nextTxHash(), outputIndex: 0 },
    output: { address, amount: assets, ...(plutusData ? { plutusData } : {}) },
  };
  fetcher.addUTxOs([utxo]);
  return utxo;
}

/// A big ADA UTxO for fees and change, plus a 5 ADA one that serves as collateral.
function fund(fetcher: OfflineFetcher, address: string) {
  addUtxo(fetcher, address, [{ unit: "lovelace", quantity: "1000000000" }]);
  addUtxo(fetcher, address, [{ unit: "lovelace", quantity: "5000000" }]);
}

function evaluator(fetcher: OfflineFetcher): OfflineEvaluator {
  return new OfflineEvaluator(fetcher, "preview");
}

/// A card that already exists: 5 ADA locked at its address, and the card itself
/// in the holder's wallet. The seed can be any reference for the tests that
/// never run the `Create` branch.
function existingCard(fetcher: OfflineFetcher, holder: string) {
  const card: Card = { seed: { txHash: "00".repeat(32), outputIndex: 0 } };
  const locked = addUtxo(
    fetcher,
    cardAddress(card.seed, NETWORK),
    [{ unit: "lovelace", quantity: "5000000" }],
    serializeData(mConStr0([])),
  );
  const cardUtxo = addUtxo(fetcher, holder, [
    { unit: "lovelace", quantity: "2000000" },
    { unit: cardUnit(card.seed), quantity: "1" },
  ]);
  return { card, locked, cardUtxo };
}

test("create: one transaction mints the card and locks the funds", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, HOLDER);
  fund(fetcher, await wallet.getChangeAddress());

  const { unsignedTx, card } = await buildCardCreateTx(wallet, fetcher, NETWORK, "5000000");

  // The seed the builder picked is what the policy id and address are derived
  // from, so it has to come back to the caller. Losing it loses the card.
  assert.ok(card.seed.txHash, "the create builder should report its seed");

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the mint handler should approve the card");
});

test("redeem: burning the card and taking the funds runs both handlers", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, HOLDER);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);
  const { card, locked, cardUtxo } = existingCard(fetcher, address);

  const unsignedTx = await buildCardRedeemTx(wallet, fetcher, card, locked, cardUtxo);

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  assert.equal(costs.length, 2, "the spend handler and the mint handler should both run");
});

// The rule the spend handler enforces: the funds leave only if a card is
// destroyed in the same transaction.
test("keep: taking the funds without burning the card is refused", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, HOLDER);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);
  const { card, locked, cardUtxo } = existingCard(fetcher, address);

  const unsignedTx = await buildCardKeepTx(wallet, fetcher, card, locked, cardUtxo);

  await assert.rejects(
    evaluator(fetcher).evaluateTx(unsignedTx, [], []),
    "the spend handler should refuse a transaction that burns no card",
  );
});

// The rule the mint handler enforces on the way out: a card cannot be burned
// on its own, or the funds behind it would be stuck for ever.
test("burn: destroying the card without taking the funds is refused", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, HOLDER);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);
  const { card, cardUtxo } = existingCard(fetcher, address);
  const collateral = (await wallet.getCollateral())[0]!;

  const unsignedTx = await new MeshTxBuilder({ fetcher })
    .txIn(cardUtxo.input.txHash, cardUtxo.input.outputIndex, cardUtxo.output.amount, cardUtxo.output.address)
    .mintPlutusScriptV3()
    .mint("-1", cardPolicyId(card.seed), CARD_NAME_HEX)
    .mintingScript(cardScriptCbor(card.seed))
    .mintRedeemerValue(mConStr1([]))
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
    .changeAddress(address)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  await assert.rejects(
    evaluator(fetcher).evaluateTx(unsignedTx, [], []),
    "the mint handler should refuse a burn that spends nothing at the card's address",
  );
});
