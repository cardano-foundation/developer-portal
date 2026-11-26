import type { IFetcher, UTxO } from "@meshsdk/core";

import { beaconUnitOf, derive } from "./deployment.ts";
import type { DeploymentRecord } from "./deployment.ts";
import { rateOf } from "./oracle.ts";

/// One question about a live deployment, and the answer the chain gave.
export type Check = { ok: boolean; what: string };

/// Ask the chain whether a deployment still looks the way its record says.
///
/// Each check reads the chain itself instead of trusting the record or the last
/// transaction your own code sent: anybody can send a transaction, and a
/// rollback can take yours back.
// #region checks
export async function checkDeployment(
  fetcher: IFetcher,
  networkId: number,
  record: DeploymentRecord,
): Promise<Check[]> {
  const unit = beaconUnitOf(record);

  // 1. The record was written for this blueprint. A record edited by hand, or
  //    a blueprint rebuilt from changed code, gives different addresses.
  const derived = derive(networkId, record.seed, record.operator);
  const matches =
    derived.beaconPolicyId === record.beaconPolicyId &&
    derived.oracleAddress === record.oracleAddress &&
    derived.consumerAddress === record.consumerAddress &&
    derived.consumerScriptHash === record.consumerScriptHash;

  // 2. Exactly one beacon exists, and it sits at the oracle's address.
  const holders = await orNothing(fetcher.fetchAssetAddresses(unit));
  const oneBeacon =
    holders.length === 1 &&
    holders[0]!.address === record.oracleAddress &&
    holders[0]!.quantity === "1";

  // 3. The oracle's UTxO carries a rate the consumer accepts.
  const oracles = await orNothing(fetcher.fetchAddressUTxOs(record.oracleAddress, unit));
  const rate = oracles.length === 1 ? readRate(oracles[0]!) : undefined;

  // 4. The reference script is still where the record says, unspent.
  const stored = await orNothing(fetcher.fetchAddressUTxOs(record.consumerScript.address));
  const script = stored.find((utxo) => isAt(utxo, record.consumerScript));

  return [
    { ok: matches, what: "the record matches the blueprint" },
    {
      ok: oneBeacon,
      what: oneBeacon
        ? "one beacon, held by the oracle"
        : `the beacon is held by ${holders.length} addresses, expected only the oracle`,
    },
    {
      ok: rate !== undefined && rate > 0,
      what:
        rate === undefined
          ? `${oracles.length} UTxOs hold the beacon at the oracle's address, expected one with a rate`
          : `the oracle's rate is ${rate}, and the consumer needs it above 0`,
    },
    {
      ok: script?.output.scriptHash === record.consumerScriptHash,
      what: script
        ? "the consumer's reference script is published and unspent"
        : "the consumer's reference script is missing",
    },
  ];
}
// #endregion checks

function isAt(utxo: UTxO, ref: { txHash: string; outputIndex: number }): boolean {
  return utxo.input.txHash === ref.txHash && utxo.input.outputIndex === ref.outputIndex;
}

/// A provider answers "nothing here" with an error for some questions, so an
/// error reads as an empty answer, and the check that needed it fails.
async function orNothing<T>(answer: Promise<T[]>): Promise<T[]> {
  try {
    return await answer;
  } catch {
    return [];
  }
}

/// A datum that does not decode as a rate is no rate at all.
function readRate(utxo: UTxO): number | undefined {
  try {
    const rate = rateOf(utxo);
    return Number.isFinite(rate) ? rate : undefined;
  } catch {
    return undefined;
  }
}
