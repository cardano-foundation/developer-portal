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

// The other tests in this file need more: the mint and admin builders, and two
// helpers for applying a parameter by hand. The blueprint comes from
// `lib/blueprint.ts`, which is where its path is written down once.
import { applyParamsToScript, serializePlutusScript } from "@meshsdk/core";

import { blueprint } from "./lib/blueprint.ts";

import { buildMintAndLockTx } from "./lib/mint.ts";
import { buildAdminUnlockTx } from "./lib/admin.ts";
import { TOKEN_NAME, buildTokenTx, fetchTokenBalance, tokenUnit } from "./lib/token.ts";

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

/// The vault built around an arbitrary admin key, rather than the one fixed
/// in `lib/blueprint.ts`. The reader changes that constant by hand; this lets
/// the parameters test show two keys giving two addresses in a single run.
function adminVaultAddress(adminPubKeyHash: string, networkId: number): string {
  const validator = blueprint.validators.find((v) => v.title === "vault.vault.spend");
  if (!validator) throw new Error('validator "vault.vault.spend" not found in the blueprint');
  const cbor = applyParamsToScript(validator.compiledCode, [adminPubKeyHash]);
  return serializePlutusScript({ code: cbor, version: "V3" }, undefined, networkId).address;
}

// #region offline-lock
test("lock: the vault's lock transaction is an ordinary payment carrying a datum", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  fund(fetcher, address);

  const unsignedTx = await buildLockTx(owner, fetcher, NETWORK, FIVE_ADA);
  assert.ok(unsignedTx.length > 0, "lock transaction should build");
});
// #endregion offline-lock

test("lock: a UTxO can hold tokens as well as ADA", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  fund(fetcher, address);
  // The tokens a standalone mint would have left in the wallet.
  addUtxo(fetcher, address, [
    { unit: "lovelace", quantity: "5000000" },
    { unit: tokenUnit(), quantity: "3" },
  ]);

  // One output, one bundle. The vault's validator never looks at what is in it.
  const unsignedTx = await buildLockTx(owner, fetcher, NETWORK, [
    ...FIVE_ADA,
    { unit: tokenUnit(), quantity: "3" },
  ]);
  assert.ok(unsignedTx.length > 0, "lock with tokens should build");
});

test("mint: one transaction mints the token and locks it", async () => {
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

test("token: a transaction that only mints, with no vault output", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  fund(fetcher, await owner.getChangeAddress());

  // Three at once. The policy checks the name and ignores the amount.
  const unsignedTx = await buildTokenTx(owner, fetcher, "3");

  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the mint handler should approve three tokens");
});

test("token: burning spends the tokens the wallet holds", async () => {
  const fetcher = newFetcher();
  const owner = await makeWallet(fetcher, OWNER);
  const address = await owner.getChangeAddress();
  fund(fetcher, address);

  // A UTxO holding tokens, the way one would sit in the wallet after a mint.
  // Burning has to spend it, which is the difference from minting.
  addUtxo(fetcher, address, [
    { unit: "lovelace", quantity: "5000000" },
    { unit: tokenUnit(), quantity: "3" },
  ]);

  // What the page's "Refresh tokens" button reads.
  assert.equal(await fetchTokenBalance(owner), "3", `the wallet should hold three ${TOKEN_NAME}`);

  const unsignedTx = await buildTokenTx(owner, fetcher, "-1");

  const evaluator = new OfflineEvaluator(fetcher, "preview");
  const costs = await evaluator.evaluateTx(unsignedTx, [], []);
  assert.ok(costs.length >= 1, "the mint handler should approve the burn");
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

// The admin door, proven offline. `lib/blueprint.ts` compiles the vault around
// a fixed `ADMIN` constant, and no wallet's key hash is ever going to equal it,
// so what this can show is the half that matters: `AdminUnlock` checks the key
// welded into the script and ignores the datum's owner entirely. The owner
// signing an `AdminUnlock` spend is refused, which is exactly what keeps the two
// doors separate.
test("admin: the owner's signature does not open the admin door", async () => {
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
  const unsignedTx = await buildAdminUnlockTx(owner, fetcher, locked);

  const evaluator = new OfflineEvaluator(fetcher, "preview");
  await assert.rejects(
    () => evaluator.evaluateTx(unsignedTx, [], []),
    "the validator should refuse an AdminUnlock signed by the owner",
  );
});

test("parameters: a different admin key gives the vault a different address", () => {
  // Two 28-byte key hashes, written as hex.
  const alice = "a".repeat(56);
  const bob = "b".repeat(56);

  const alicesVault = adminVaultAddress(alice, NETWORK);
  const bobsVault = adminVaultAddress(bob, NETWORK);

  // Same source code, same compiled validator, two addresses. The admin key is
  // part of the script, the script's hash is the address, so changing the key
  // moves the vault.
  assert.notEqual(alicesVault, bobsVault, "each admin key should get its own address");

  // Both are real addresses, which also proves the parameter was applied to a
  // script the ledger can read rather than producing nonsense.
  for (const address of [alicesVault, bobsVault]) {
    assert.match(address, /^addr_test1/, "should be a valid Preview script address");
  }

  // And it is stable: the same key always lands on the same vault.
  assert.equal(adminVaultAddress(alice, NETWORK), alicesVault);
});
