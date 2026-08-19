// Everything the unlock scenario test needs. The reader writes this file in
// **testing**, so this block is the one they type first.
// #region offline-imports
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher,
  deserializeAddress,
  serializeData,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";

import { vaultAddress } from "./lib/blueprint.ts";
import { vaultDatum } from "./lib/datum.ts";
import { buildLockTx } from "./lib/lock.ts";
import { buildUnlockTx } from "./lib/unlock.ts";
// #endregion offline-imports

// The other tests in this file need more: the mint and recover builders, and two
// helpers for applying a parameter by hand. The blueprint comes from
// `lib/blueprint.ts`, which is where its path is written down once.
import { applyParamsToScript, serializePlutusScript } from "@meshsdk/core";

import { blueprint } from "./lib/blueprint.ts";

import { buildMintAndLockTx } from "./lib/mint.ts";
import { buildRecoverTx } from "./lib/recover.ts";

// An in-memory chain and a funded wallet. No node, no network, no test ADA, and
// no waiting: every test below builds a real transaction and runs the real
// compiled validator against it.
// #region offline-setup
const NETWORK = 0;

const OWNER =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

function newFetcher(): OfflineFetcher {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  // A pretend chain has no cost models. Without these the builder still works,
  // it just logs a stack trace on its way to these very defaults.
  fetcher.fetchCostModels = async () => [
    DEFAULT_V1_COST_MODEL_LIST,
    DEFAULT_V2_COST_MODEL_LIST,
    DEFAULT_V3_COST_MODEL_LIST,
  ];
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
// #endregion offline-setup

// Putting a UTxO on the pretend chain. A real chain hands you a transaction
// hash; here we invent one, because nothing was ever submitted.
// #region offline-helpers
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
// #endregion offline-helpers

/// The vault built around an arbitrary recovery key, rather than the one fixed
/// in `lib/blueprint.ts`. The reader changes that constant by hand; this lets
/// the parameters test show two keys giving two addresses in a single run.
function recoveryVaultAddress(recoveryPubKeyHash: string, networkId: number): string {
  const validator = blueprint.validators.find((v) => v.title === "vault.vault.spend");
  if (!validator) throw new Error('validator "vault.vault.spend" not found in the blueprint');
  const cbor = applyParamsToScript(validator.compiledCode, [recoveryPubKeyHash]);
  return serializePlutusScript({ code: cbor, version: "V3" }, undefined, networkId).address;
}

// #region offline-lock
test("lock: the vault's lock transaction is an ordinary payment carrying a datum", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  fund(fetcher, address);

  const unsignedTx = await buildLockTx(owner, fetcher, NETWORK, "5000000");
  assert.ok(unsignedTx.length > 0, "lock transaction should build");
});
// #endregion offline-lock

test("mint: one transaction mints a vault token and locks it", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  fund(fetcher, address);

  const unsignedTx = await buildMintAndLockTx(owner, fetcher, NETWORK, "5000000");

  // Evaluating runs the compiled mint handler. A cost budget back means the
  // script approved the new token.
  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the mint handler should approve one token");
});

// #region offline-unlock
test("unlock: the vault releases funds to the owner who signs", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  const pubKeyHash = deserializeAddress(address).pubKeyHash;
  fund(fetcher, address);

  // Put a locked UTxO on our pretend chain, with the owner named in its datum.
  const locked = addUtxo(
    fetcher,
    vaultAddress(NETWORK),
    FIVE_ADA,
    serializeData(vaultDatum(pubKeyHash)),
  );

  const unsignedTx = await buildUnlockTx(owner, fetcher, locked);

  // Evaluating runs the actual compiled validator. Getting a cost budget back
  // means it said yes.
  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the validator should approve the spend");
});
// #endregion offline-unlock

// The recovery door, proven offline. `lib/blueprint.ts` compiles the vault
// around a fixed `RECOVERY` constant, and no wallet's key hash is ever going to
// equal it, so what this can show is the half that matters: `Recover` checks the
// key welded into the script and ignores the datum's owner entirely. The owner
// signing a `Recover` spend is refused, which is exactly what keeps the two
// doors separate.
test("recover: the owner's signature does not open the recovery door", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  const pubKeyHash = deserializeAddress(address).pubKeyHash;
  fund(fetcher, address);

  const locked = addUtxo(
    fetcher,
    vaultAddress(NETWORK),
    FIVE_ADA,
    serializeData(vaultDatum(pubKeyHash)),
  );

  // The same UTxO the unlock test spends, and the same wallet signing it. Only
  // the redeemer differs, so only the branch the validator takes differs.
  const unsignedTx = await buildRecoverTx(owner, fetcher, locked);

  const evaluator = new OfflineEvaluator(fetcher, "preview");
  await assert.rejects(
    () => evaluator.evaluateTx(unsignedTx, [], []),
    "the validator should refuse a Recover signed by the owner",
  );
});

test("parameters: a different recovery key gives the vault a different address", () => {
  // Two 28-byte key hashes, written as hex.
  const alice = "a".repeat(56);
  const bob = "b".repeat(56);

  const alicesVault = recoveryVaultAddress(alice, NETWORK);
  const bobsVault = recoveryVaultAddress(bob, NETWORK);

  // Same source code, same compiled validator, two addresses. The recovery key
  // is part of the script, the script's hash is the address, so changing the
  // key moves the vault.
  assert.notEqual(alicesVault, bobsVault, "each recovery key should get its own address");

  // Both are real addresses, which also proves the parameter was applied to a
  // script the ledger can read rather than producing nonsense.
  for (const address of [alicesVault, bobsVault]) {
    assert.match(address, /^addr_test1/, "should be a valid Preview script address");
  }

  // And it is stable: the same key always lands on the same vault.
  assert.equal(recoveryVaultAddress(alice, NETWORK), alicesVault);
});
