import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PROTOCOL_PARAMETERS,
  OfflineFetcher,
  deserializeAddress,
  mConStr0,
  resolveScriptRef,
  serializeData,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";

import {
  beaconPolicyId,
  beaconUnit,
  consumerAddress,
  consumerScriptCbor,
  consumerScriptHash,
  neverAddress,
  oracleAddress,
} from "./lib/blueprint.ts";
import blueprint from "../blueprints/oracle.plutus.json" with { type: "json" };
import { derive } from "./lib/deployment.ts";
import type { DeploymentRecord } from "./lib/deployment.ts";
import { checkDeployment } from "./lib/health.ts";
import {
  buildOracleCreateTx,
  buildOracleDeleteTx,
  buildOracleUpdateTx,
  rateOf,
} from "./lib/oracle.ts";
import type { Deployment } from "./lib/oracle.ts";
import { buildConsumerLockTx, buildConsumerSpendTx } from "./lib/reference-input.ts";
import {
  buildConsumerSpendViaReferenceTx,
  buildPublishConsumerScriptTx,
} from "./lib/reference-script.ts";
import { assertKeyMatches, networkFrom } from "./lib/network.ts";

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
  const collateral = (await wallet.getCollateral())[0]!;
  assert.notDeepEqual(
    deployment.seed,
    { txHash: collateral.input.txHash, outputIndex: collateral.input.outputIndex },
    "the seed should not be the collateral",
  );

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

test("publish: the consumer's script goes to the never address", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);
  const deployment = deploymentFor(deserializeAddress(address).pubKeyHash);

  const unsignedTx = await buildPublishConsumerScriptTx(wallet, fetcher, NETWORK, deployment);

  // The compiled code travels inside this one transaction, as the reference
  // script of an output. A slice from the middle of it is enough to recognize.
  const cbor = consumerScriptCbor(beaconPolicyId(deployment.seed));
  assert.ok(unsignedTx.includes(cbor.slice(64, 264)), "the compiled consumer should be attached to an output");
  // And that output is at `never`, whose script hash is in its address.
  const never = deserializeAddress(neverAddress(NETWORK)).scriptHash;
  assert.ok(unsignedTx.includes(never), "the script should be parked at the never address");
});

test("never: the address is the hash the blueprint gives the never validator", () => {
  const never = blueprint.validators.find((v) => v.title === "never.never.spend")!;
  assert.equal(deserializeAddress(neverAddress(NETWORK)).scriptHash, never.hash);
});

test("consumer: unlocking through the published script carries no script", async () => {
  const fetcher = newFetcher();
  const wallet = await makeWallet(fetcher, OPERATOR);
  const address = await wallet.getChangeAddress();
  fund(fetcher, address);

  const deployment = deploymentFor(deserializeAddress(address).pubKeyHash);
  const published = publishOracle(fetcher, deployment, 150);
  const policyId = beaconPolicyId(deployment.seed);
  const cbor = consumerScriptCbor(policyId);

  // The UTxO a publish transaction would have left: the never address, some
  // ADA, and the consumer's code attached to it.
  const scriptUtxo = {
    input: { txHash: nextTxHash(), outputIndex: 0 },
    output: {
      address: neverAddress(NETWORK),
      amount: [{ unit: "lovelace", quantity: "10000000" }],
      // A provider hands the script back in its reference form, not as the
      // bare compiled code.
      scriptRef: resolveScriptRef({ code: cbor, version: "V3" }),
      scriptHash: consumerScriptHash(policyId),
    },
  };
  fetcher.addUTxOs([scriptUtxo]);

  const locked = addUtxo(
    fetcher,
    consumerAddress(policyId, NETWORK),
    [{ unit: "lovelace", quantity: "5000000" }],
    serializeData(mConStr0([])),
  );

  const unsignedTx = await buildConsumerSpendViaReferenceTx(
    wallet,
    fetcher,
    deployment,
    locked,
    published,
    scriptUtxo,
  );

  // The saving, made checkable: the code is not in this transaction.
  assert.ok(!unsignedTx.includes(cbor.slice(64, 264)), "the script should not travel in the transaction");

  const costs = await evaluator(fetcher).evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the consumer should approve when read from the reference");
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

/// A deployment as `npm run deploy` would leave it: the beacon and the rate at
/// the oracle's address, the consumer's script at `never`, and the record.
function deployed(fetcher: OfflineFetcher, operator: string, rate: number): DeploymentRecord {
  const deployment = deploymentFor(operator);
  const { scriptStoreAddress, ...derived } = derive(NETWORK, deployment.seed, operator);
  const createOracle = publishOracle(fetcher, deployment, rate);
  const script = addUtxo(fetcher, scriptStoreAddress, [{ unit: "lovelace", quantity: "10000000" }]);
  // `addUtxo` cannot attach a script, so give the stored UTxO its hash here.
  Object.assign(script.output, { scriptHash: derived.consumerScriptHash });
  return {
    network: "preprod",
    ...deployment,
    ...derived,
    consumerScript: { ...script.input, address: scriptStoreAddress },
    transactions: { createOracle: createOracle.input.txHash, publishConsumerScript: script.input.txHash },
  };
}

test("monitor: a healthy deployment passes every check", async () => {
  const fetcher = newFetcher();
  const record = deployed(fetcher, "00".repeat(28), 150);

  const checks = await checkDeployment(fetcher, NETWORK, record);
  assert.deepEqual(
    checks.filter((check) => !check.ok),
    [],
    "every check should pass on a fresh deployment",
  );
});

test("monitor: a zero rate, a stray beacon and an edited record are each caught", async () => {
  const fetcher = newFetcher();
  const record = deployed(fetcher, "00".repeat(28), 0);
  // A second UTxO with the beacon's unit somewhere else.
  addUtxo(fetcher, consumerAddress(record.beaconPolicyId, NETWORK), [
    { unit: "lovelace", quantity: "2000000" },
    { unit: beaconUnit(record.beaconPolicyId), quantity: "1" },
  ]);
  // A record whose operator no longer matches its oracle's address.
  const edited = { ...record, operator: "11".repeat(28) };

  const failed = (await checkDeployment(fetcher, NETWORK, edited)).filter((check) => !check.ok);
  assert.deepEqual(failed.map((check) => check.what), [
    "the record matches the blueprint",
    "the beacon is held by 2 addresses, expected only the oracle",
    "the oracle's rate is 0, and the consumer needs it above 0",
  ]);
});

test("monitor: a reference script that is gone is caught", async () => {
  const fetcher = newFetcher();
  const record = deployed(fetcher, "00".repeat(28), 150);
  const moved = { ...record, consumerScript: { ...record.consumerScript, outputIndex: 1 } };

  const failed = (await checkDeployment(fetcher, NETWORK, moved)).filter((check) => !check.ok);
  assert.deepEqual(
    failed.map((check) => check.what),
    ["the consumer's reference script is missing"],
  );
});

test("network: a key for another network is refused", () => {
  assert.throws(() => assertKeyMatches("previewAbc", networkFrom("preprod")));
  assert.doesNotThrow(() => assertKeyMatches("preprodAbc", networkFrom("preprod")));
});
