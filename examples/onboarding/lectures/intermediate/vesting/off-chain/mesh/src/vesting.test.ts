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

import { vestingAddress } from "./lib/blueprint.ts";
import { buildVestingClaimTx, vestingDatum } from "./lib/vesting.ts";

// An in-memory chain and a funded wallet. No node, no network, no test ADA, and
// no waiting: every test below builds a real transaction and runs the real
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

test("vesting: the claim succeeds once the window starts after the deadline", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  const pubKeyHash = deserializeAddress(address).pubKeyHash;
  fund(fetcher, address);

  const deadline = Date.now() - 60_000; // already passed
  const vested = addUtxo(
    fetcher,
    vestingAddress(NETWORK),
    FIVE_ADA,
    serializeData(vestingDatum(pubKeyHash, deadline)),
  );

  const unsignedTx = await buildVestingClaimTx(owner, fetcher, vested, deadline);

  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the validator should approve the claim");
});

test("vesting: declaring a window that starts too early is refused", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  const pubKeyHash = deserializeAddress(address).pubKeyHash;
  fund(fetcher, address);

  const deadline = Date.now() + 3_600_000; // an hour away
  const vested = addUtxo(
    fetcher,
    vestingAddress(NETWORK),
    FIVE_ADA,
    serializeData(vestingDatum(pubKeyHash, deadline)),
  );

  // A claimant who declares a window opening before the deadline. The datum
  // still says the funds are locked for another hour, so the validator refuses.
  const unsignedTx = await buildVestingClaimTx(owner, fetcher, vested, deadline - 600_000);

  // Assert on *why* it failed, not just that it did. A bare `rejects` would
  // also pass if the transaction never built, which would prove nothing.
  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const reason = await evaluator
    .evaluateTx(unsignedTx, [], [])
    .then(() => null)
    .catch((error: unknown) => String((error as Error)?.message ?? error));
  assert.ok(reason, "the validator should refuse a claim made before the deadline");
  assert.match(reason, /"tag":"spend"/, "the refusal should come from the spend validator");
});
