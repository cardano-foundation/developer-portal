import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher,
  serializeData,
} from "@meshsdk/core";
import type { Asset, Data, UTxO } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { grantAddress, grantDatum, isScheduled } from "./blueprint.ts";
import type { Grant, Version } from "./blueprint.ts";
import { scheduledDatum, vestingOf } from "./schedule.ts";
import type { Period } from "./schedule.ts";
import { slotTime } from "./vesting.ts";

// An in-memory chain with two funded wallets. No node and no waiting: the
// tests and the benchmark build real transactions and run the real compiled
// validators on them. Everything here is fixed, so the same code always
// measures the same numbers.

export const NETWORK = 0;

/// The slot the test grant starts vesting at. Any slot works offline: the
/// evaluator runs the scripts, and does not check the window against a clock.
export const START_SLOT = 100_000_000;

/// How many slots the test grant takes to vest: 10,000 one-second slots.
export const VESTING_SLOTS = 10_000;

/// Who the grant vests to.
const BENEFICIARY =
  "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(
    " ",
  );

/// Who made the grant, and may claw back what has not vested.
const GRANTOR =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

/// A fresh chain: an empty UTxO set, and two funded wallets.
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

  const beneficiaryWallet = await makeWallet(fetcher, BENEFICIARY);
  const beneficiaryAddress = await beneficiaryWallet.getChangeAddress();
  const grantorWallet = await makeWallet(fetcher, GRANTOR);
  const grantorAddress = await grantorWallet.getChangeAddress();
  // Each needs a big ADA UTxO for fees and change, plus a 5 ADA one that serves
  // as collateral.
  for (const address of [beneficiaryAddress, grantorAddress]) {
    addUtxo(address, [{ unit: "lovelace", quantity: "1000000000" }]);
    addUtxo(address, [{ unit: "lovelace", quantity: "5000000" }]);
  }

  /// 10 ADA vesting over `VESTING_SLOTS` slots from `START_SLOT`: one lovelace
  /// every millisecond.
  const grant: Grant = {
    beneficiaryAddress,
    grantorAddress,
    start: slotTime(START_SLOT),
    end: slotTime(START_SLOT + VESTING_SLOTS),
    total: 10_000_000n,
  };

  /// The test grant's period as an interval: from its start to its end, both
  /// included. It vests exactly as `grant` does.
  const period: Period = {
    lower: { at: grant.start, included: true },
    upper: { at: grant.end, included: true },
  };

  /// Lock the test grant at `version`'s address, as `buildLockTx` would. A
  /// version that reads an interval from its datum gets `period`.
  function lock(version: Version): UTxO {
    return isScheduled(version) ? lockScheduled(version, period).utxo : addGrant(version, grantDatum(grant));
  }

  /// Lock the test grant with `vestingPeriod` as its period, at a version that
  /// reads an interval from its datum. Returns the UTxO, and the grant the
  /// period gives, for the builders' arithmetic.
  function lockScheduled(version: Version, vestingPeriod: Period) {
    return {
      utxo: addGrant(version, scheduledDatum(grant, vestingPeriod)),
      grant: vestingOf(grant, vestingPeriod),
    };
  }

  function addGrant(version: Version, datum: Data): UTxO {
    return addUtxo(
      grantAddress(version, NETWORK),
      [{ unit: "lovelace", quantity: grant.total.toString() }],
      serializeData(datum),
    );
  }

  return {
    fetcher,
    beneficiaryWallet,
    beneficiaryAddress,
    grantorWallet,
    grantorAddress,
    grant,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
    period,
    addUtxo,
    lock,
    lockScheduled,
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
