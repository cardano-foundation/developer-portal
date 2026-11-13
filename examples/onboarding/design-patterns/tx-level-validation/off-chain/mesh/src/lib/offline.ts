import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher,
  serializeData,
} from "@meshsdk/core";
import type { AccountInfo, Asset, UTxO } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { coordinatorRewardAddress, poolAddress } from "./blueprint.ts";
import type { Pool } from "./blueprint.ts";
import { DONATION_DATUM } from "./sweep.ts";

// An in-memory chain with two funded wallets. No node and no waiting: the
// tests and the benchmark build real transactions and run the real compiled
// validators on them. Everything here is fixed, so the same code always
// measures the same numbers.

export const NETWORK = 0;

/// Whoever sweeps. Anybody may: the pool only cares where the funds go.
const SWEEPER =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

/// Who the pool pays out to.
const BENEFICIARY =
  "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(
    " ",
  );

/// A fresh chain: an empty UTxO set, a funded sweeper, and the beneficiary's
/// address.
export async function offlineChain() {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  // The offline fetcher has no cost models of its own, so hand it Mesh's
  // defaults, the ones the builder would fall back to anyway.
  fetcher.fetchCostModels = async () => [
    DEFAULT_V1_COST_MODEL_LIST,
    DEFAULT_V2_COST_MODEL_LIST,
    DEFAULT_V3_COST_MODEL_LIST,
  ];
  let txCounter = 0;

  function addUtxo(address: string, assets: Asset[], plutusData?: string): UTxO {
    txCounter += 1;
    const utxo = {
      input: { txHash: txCounter.toString(16).padStart(64, "0"), outputIndex: 0 },
      output: { address, amount: assets, ...(plutusData ? { plutusData } : {}) },
    };
    fetcher.addUTxOs([utxo]);
    return utxo;
  }

  const wallet = await makeWallet(fetcher, SWEEPER);
  const sweeperAddress = await wallet.getChangeAddress();
  // A big ADA UTxO for fees and change, plus a 5 ADA one that serves as collateral.
  addUtxo(sweeperAddress, [{ unit: "lovelace", quantity: "1000000000" }]);
  addUtxo(sweeperAddress, [{ unit: "lovelace", quantity: "5000000" }]);

  const beneficiaryWallet = await makeWallet(fetcher, BENEFICIARY);
  const beneficiaryAddress = await beneficiaryWallet.getChangeAddress();
  // The beneficiary needs funds of their own only to deregister a coordinator.
  addUtxo(beneficiaryAddress, [{ unit: "lovelace", quantity: "100000000" }]);
  addUtxo(beneficiaryAddress, [{ unit: "lovelace", quantity: "5000000" }]);

  // Stake accounts, by reward address. `OfflineFetcher.addAccount` accepts only
  // payment addresses, so the offline chain answers for reward addresses here.
  // It does not model registration: an entry is only what the lookup returns.
  const accounts = new Map<string, AccountInfo>();
  fetcher.fetchAccountInfo = async (address: string) => {
    const account = accounts.get(address);
    if (!account) throw new Error(`no stake account at ${address}: register it first`);
    return account;
  };

  /// Give `pool`'s stake account a reward balance.
  function setRewards(pool: Pool, lovelace: string) {
    accounts.set(coordinatorRewardAddress(pool, beneficiaryAddress, NETWORK), {
      active: true,
      balance: lovelace,
      rewards: lovelace,
      withdrawals: "0",
    });
  }

  /// `count` donations of 10 ADA each, locked at `pool`. The pool's stake
  /// account is registered with nothing in it, as it would be after
  /// `buildRegisterCoordinatorTx`.
  function donate(pool: Pool, count: number): UTxO[] {
    setRewards(pool, "0");
    const address = poolAddress(pool, beneficiaryAddress, NETWORK);
    return Array.from({ length: count }, () =>
      addUtxo(address, [{ unit: "lovelace", quantity: "10000000" }], serializeData(DONATION_DATUM)),
    );
  }

  return {
    fetcher,
    wallet,
    beneficiaryWallet,
    beneficiaryAddress,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
    addUtxo,
    donate,
    setRewards,
  };
}

async function makeWallet(fetcher: OfflineFetcher, mnemonic: string[]): Promise<MeshWallet> {
  // No submitter: nothing here is ever submitted anywhere.
  const wallet = new MeshWallet({
    networkId: NETWORK,
    fetcher,
    key: { type: "mnemonic", words: mnemonic },
  });
  await wallet.init();
  return wallet;
}
