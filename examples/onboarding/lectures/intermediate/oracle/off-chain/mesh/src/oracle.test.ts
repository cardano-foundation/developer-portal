import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PROTOCOL_PARAMETERS,
  OfflineFetcher,
  deserializeAddress,
  serializeData,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";

import { oracleAddress } from "./lib/blueprint.ts";
import { buildOracleUpdateTx, oracleDatum } from "./lib/oracle.ts";

// An in-memory chain and a funded wallet. No node, no network, no test ADA, and
// no waiting: the test below builds a real transaction and runs the real
// compiled validator against it.
const NETWORK = 0;

const OWNER =
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

const FIVE_ADA: Asset[] = [{ unit: "lovelace", quantity: "5000000" }];

test("oracle: an update spends the UTxO and puts a new one back", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  const pubKeyHash = deserializeAddress(address).pubKeyHash;
  fund(fetcher, address);

  const published = addUtxo(
    fetcher,
    oracleAddress(NETWORK),
    FIVE_ADA,
    serializeData(oracleDatum(pubKeyHash, 100)),
  );

  const unsignedTx = await buildOracleUpdateTx(owner, fetcher, NETWORK, published, 150);

  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the validator should approve the update");
});
