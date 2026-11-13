import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PROTOCOL_PARAMETERS,
  MeshValue,
  OfflineFetcher,
  TxParser,
  deserializeAddress,
  serializeData,
  stringToHex,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { CSLSerializer, OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";

import { swapAddress, tokenPolicyId } from "./blueprint.ts";
import { offerDatum } from "./datum.ts";
import { fetchOffers } from "./fetch-offers.ts";
import { buildCancelTx } from "./cancel.ts";
import { buildLockTx } from "./lock.ts";
import { buildMintTx } from "./mint.ts";
import { buildSwapTx } from "./swap.ts";

// Test fixtures: an in-memory chain (OfflineFetcher) and two funded wallets
// (Alice, Bob) with fixed mnemonics, no node, no network
const NETWORK = 0;
const GOLD = stringToHex("GOLD");
const SILVER = stringToHex("SILVER");

const ALICE = "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(" ",);
const BOB = "cliff click strike honey surround lock caution remind leaf knife purpose token column exclude crucial together pyramid gadget cram sound pole twin pottery spend".split(" ",);

function newFetcher(): OfflineFetcher {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  return fetcher;
}

async function makeWallet(fetcher: OfflineFetcher, mnemonic: string[]): Promise<MeshWallet> {
  const wallet = new MeshWallet({
    networkId: NETWORK,
    fetcher,
    submitter: fetcher,
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

/// Add a UTxO holding `assets` (plus min ADA) to an address, optionally with an
/// inline datum. Returns the created UTxO.
function addUtxo(fetcher: OfflineFetcher, address: string, assets: Asset[], plutusData?: string) {
  const utxo = {
    input: { txHash: nextTxHash(), outputIndex: 0 },
    output: { address, amount: assets, ...(plutusData ? { plutusData } : {}) },
  };
  fetcher.addUTxOs([utxo]);
  return utxo;
}

/// Fund an address with a big ADA UTxO (fees + change) and a 5-ADA collateral UTxO.
function fund(fetcher: OfflineFetcher, address: string) {
  addUtxo(fetcher, address, [{ unit: "lovelace", quantity: "1000000000" }]);
  addUtxo(fetcher, address, [{ unit: "lovelace", quantity: "5000000" }]);
}

async function pkhOf(wallet: { getChangeAddress(): Promise<string> }) {
  return deserializeAddress(await wallet.getChangeAddress()).pubKeyHash;
}

test("mint: Bob can mint GOLD under his own policy", async () => {
  const fetcher = newFetcher();
  const bob = await makeWallet(fetcher, BOB);
  fund(fetcher, await bob.getChangeAddress());

  const unsignedTx = await buildMintTx(bob, fetcher, GOLD, "1");

  // The mint policy is a Plutus script, evaluating proves it validates.
  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "mint policy should evaluate to a budget");
});

test("lock: Bob locks GOLD at the swap contract with an offer datum", async () => {
  const fetcher = newFetcher();
  const bob = await makeWallet(fetcher, BOB);
  const bobAddr = await bob.getChangeAddress();
  const bobPkh = await pkhOf(bob);
  const gold = tokenPolicyId(bobPkh) + GOLD;

  fund(fetcher, bobAddr);
  addUtxo(fetcher, bobAddr, [
    { unit: "lovelace", quantity: "2000000" },
    { unit: gold, quantity: "1" },
  ]);

  const price = [
    { policyId: tokenPolicyId(await pkhOf(await makeWallet(fetcher, ALICE))), assetName: SILVER, quantity: "1" },
  ];
  const unsignedTx = await buildLockTx(
    bob,
    fetcher,
    NETWORK,
    [{ unit: "lovelace", quantity: "2000000" }, { unit: gold, quantity: "1" }],
    price,
  );

  const parser = new TxParser(new CSLSerializer(), fetcher);
  await parser.parse(unsignedTx, await bob.getUtxos());
  const tester = parser.toTester();
  tester
    .outputsAt(swapAddress(NETWORK))
    .outputsValue(
      MeshValue.fromAssets([
        { unit: "lovelace", quantity: "2000000" },
        { unit: gold, quantity: "1" },
      ]),
    );
  assert.ok(tester.success(), `lock output at script: ${JSON.stringify(tester.errors())}`);
});

test("fetch-offers: an offer locked at the contract is decoded", async () => {
  const fetcher = newFetcher();
  const bob = await makeWallet(fetcher, BOB);
  const alice = await makeWallet(fetcher, ALICE);
  const bobPkh = await pkhOf(bob);
  const bobAddr = await bob.getChangeAddress();
  const gold = tokenPolicyId(bobPkh) + GOLD;
  const silverPolicy = tokenPolicyId(await pkhOf(alice));

  const datum = offerDatum({
    owner: bobAddr,
    price: [{ policyId: silverPolicy, assetName: SILVER, quantity: "1" }],
  });
  addUtxo(
    fetcher,
    swapAddress(NETWORK),
    [{ unit: "lovelace", quantity: "2000000" }, { unit: gold, quantity: "1" }],
    serializeData(datum),
  );

  const offers = await fetchOffers(fetcher, NETWORK);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].owner, bobAddr);
  assert.deepEqual(offers[0].price, [
    { policyId: silverPolicy, assetName: SILVER, quantity: "1" },
  ]);
});

test("swap: Alice fulfills Bob's offer and the validator accepts", async () => {
  const fetcher = newFetcher();
  const bob = await makeWallet(fetcher, BOB);
  const alice = await makeWallet(fetcher, ALICE);
  const bobPkh = await pkhOf(bob);
  const bobAddr = await bob.getChangeAddress();
  const alicePkh = await pkhOf(alice);
  const gold = tokenPolicyId(bobPkh) + GOLD;
  const silver = tokenPolicyId(alicePkh) + SILVER;

  // Bob's offer is already locked at the contract.
  const datum = offerDatum({
    owner: bobAddr,
    price: [{ policyId: tokenPolicyId(alicePkh), assetName: SILVER, quantity: "1" }],
  });
  addUtxo(
    fetcher,
    swapAddress(NETWORK),
    [{ unit: "lovelace", quantity: "2000000" }, { unit: gold, quantity: "1" }],
    serializeData(datum),
  );

  // Alice has SILVER to pay, plus ADA + collateral.
  const aliceAddr = await alice.getChangeAddress();
  fund(fetcher, aliceAddr);
  addUtxo(fetcher, aliceAddr, [
    { unit: "lovelace", quantity: "2000000" },
    { unit: silver, quantity: "1" },
  ]);

  const [offer] = await fetchOffers(fetcher, NETWORK);
  const unsignedTx = await buildSwapTx(alice, fetcher, offer);

  // The swap validator is a Plutus script; evaluating proves it accepts.
  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "swap validator should evaluate to a budget");
});

test("cancel: Bob reclaims his own locked offer", async () => {
  const fetcher = newFetcher();
  const bob = await makeWallet(fetcher, BOB);
  const bobPkh = await pkhOf(bob);
  const bobAddr = await bob.getChangeAddress();
  const gold = tokenPolicyId(bobPkh) + GOLD;

  // Bob's offer is already locked at the contract.
  const datum = offerDatum({
    owner: bobAddr,
    price: [{ policyId: tokenPolicyId(bobPkh), assetName: SILVER, quantity: "1" }],
  });
  addUtxo(
    fetcher,
    swapAddress(NETWORK),
    [{ unit: "lovelace", quantity: "2000000" }, { unit: gold, quantity: "1" }],
    serializeData(datum),
  );

  // Bob needs ADA + collateral to spend the locked UTxO.
  fund(fetcher, bobAddr);

  const [offer] = await fetchOffers(fetcher, NETWORK);
  const unsignedTx = await buildCancelTx(bob, fetcher, offer);

  // The validator runs on Cancel too; evaluating proves it accepts Bob's reclaim.
  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "cancel should evaluate to a budget");
});
