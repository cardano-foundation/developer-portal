import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PROTOCOL_PARAMETERS,
  OfflineFetcher,
  deserializeAddress,
  mConStr0,
  serializeData,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";

import { beaconPolicyId, beaconUnit, consumerAddress, oracleAddress } from "./lib/blueprint.ts";
import {
  buildOracleCreateTx,
  buildOracleDeleteTx,
  buildOracleUpdateTx,
  rateOf,
} from "./lib/oracle.ts";
import type { Deployment } from "./lib/oracle.ts";
import { buildConsumerSpendTx } from "./lib/reference-input.ts";

// An in-memory chain and a funded wallet. No node and no waiting: the tests
// below build real transactions and run the real compiled validators on them.
const NETWORK = 0;

const OPERATOR =
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

/// A published oracle: the beacon and 5 ADA at the derived address, with the
/// rate as a bare integer datum.
function publishOracle(fetcher: OfflineFetcher, deployment: Deployment, rate: number) {
  const policyId = beaconPolicyId(deployment.seed);
  return addUtxo(
    fetcher,
    oracleAddress(policyId, deployment.operator, NETWORK),
    [
      { unit: "lovelace", quantity: "5000000" },
      { unit: beaconUnit(policyId), quantity: "1" },
    ],
    serializeData(rate),
  );
}

/// The seed can be any reference for the tests that never run the mint handler.
function deploymentFor(operator: string): Deployment {
  return {
    seed: { txHash: "00".repeat(32), outputIndex: 0 },
    operator,
  };
}

test("create: minting the beacon and locking it with the first rate", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  fund(fetcher, await wallet.getChangeAddress());

  const { unsignedTx, deployment } = await buildOracleCreateTx(wallet, fetcher, NETWORK, 100);

  // The seed the builder picked is what every address is derived from, so it
  // has to come back to the caller. Losing it loses the oracle.
  assert.ok(deployment.seed.txHash, "the create builder should report its seed");

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the beacon policy should approve the mint");
});

test("update: the UTxO is spent and a new one goes straight back", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);

  const deployment = deploymentFor(deserializeAddress(address).pubKeyHash);
  const published = publishOracle(fetcher, deployment, 100);

  const unsignedTx = await buildOracleUpdateTx(
    wallet,
    fetcher,
    NETWORK,
    deployment,
    published,
    150,
  );

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the oracle should approve the update");
});

test("delete: closing the oracle burns the beacon", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);

  const deployment = deploymentFor(deserializeAddress(address).pubKeyHash);
  const published = publishOracle(fetcher, deployment, 100);

  const unsignedTx = await buildOracleDeleteTx(wallet, fetcher, deployment, published);

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  // Two scripts run here: the oracle's spend handler and the beacon's burn.
  assert.ok(costs.length >= 2, "the oracle and the beacon policy should both approve");
});

test("consumer: the oracle is read as a reference input, not spent", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);

  const deployment = deploymentFor(deserializeAddress(address).pubKeyHash);
  const published = publishOracle(fetcher, deployment, 150);
  const policyId = beaconPolicyId(deployment.seed);

  const locked = addUtxo(
    fetcher,
    consumerAddress(policyId, NETWORK),
    [{ unit: "lovelace", quantity: "5000000" }],
    serializeData(mConStr0([])),
  );

  const unsignedTx = await buildConsumerSpendTx(
    wallet,
    fetcher,
    NETWORK,
    deployment,
    locked,
    published,
  );

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the consumer should approve while the rate is positive");
});

// Proves the assertions above are not passing vacuously: the same builder, on a
// UTxO with no beacon on it, must be rejected by the validator.
test("update: a UTxO at the address without the beacon is refused", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);

  const deployment = deploymentFor(deserializeAddress(address).pubKeyHash);
  const policyId = beaconPolicyId(deployment.seed);
  // Same address, same datum, but nobody minted a beacon into it.
  const impostor = addUtxo(
    fetcher,
    oracleAddress(policyId, deployment.operator, NETWORK),
    [{ unit: "lovelace", quantity: "5000000" }],
    serializeData(100),
  );

  const unsignedTx = await buildOracleUpdateTx(
    wallet,
    fetcher,
    NETWORK,
    deployment,
    impostor,
    150,
  );

  await assert.rejects(
    () => evaluator(fetcher).evaluateTx(unsignedTx, [], []),
    "the oracle should refuse a UTxO that does not hold the beacon",
  );
});

test("rateOf reads a bare integer datum", () => {
  const fetcher = newFetcher();
  const deployment = deploymentFor("00".repeat(28));
  const published = publishOracle(fetcher, deployment, 150);
  assert.equal(rateOf(published), 150);
});
