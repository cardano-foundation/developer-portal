import {
  beaconPolicyId,
  beaconUnit,
  consumerAddress,
  consumerScriptHash,
  neverAddress,
  oracleAddress,
} from "./blueprint.ts";
import type { Seed } from "./blueprint.ts";
import type { Deployment } from "./oracle.ts";
import type { NetworkName } from "./network.ts";

/// Where a UTxO is: the transaction that created it, and its position there.
export type OutRef = { txHash: string; outputIndex: number };

/// Everything one deployment of the oracle is, written down once.
///
/// The Intermediate app kept only the seed and the operator, in one browser's
/// storage. This record is a file, so the operator's scripts, the app and anyone
/// reading the repository see the same deployment. The two inputs are at the
/// top. Everything under them is derived from them and the blueprint, and is
/// written out anyway so a reader does not need the code to find the oracle.
/// Nothing in it is secret.
// #region record
export type DeploymentRecord = {
  network: NetworkName;
  // The two values every other one is derived from.
  seed: Seed;
  operator: string;
  // Derived, and checked against the blueprint by the monitor.
  beaconPolicyId: string;
  oracleAddress: string;
  consumerAddress: string;
  consumerScriptHash: string;
  // Where the consumer's reference script was published.
  consumerScript: OutRef & { address: string };
  // The transactions that created this deployment, in order.
  transactions: { createOracle: string; publishConsumerScript: string };
};
// #endregion record

/// The derived half of a record, computed from its inputs.
export function derive(networkId: number, seed: Seed, operator: string) {
  const policyId = beaconPolicyId(seed);
  return {
    beaconPolicyId: policyId,
    oracleAddress: oracleAddress(policyId, operator, networkId),
    consumerAddress: consumerAddress(policyId, networkId),
    consumerScriptHash: consumerScriptHash(policyId),
    scriptStoreAddress: neverAddress(networkId),
  };
}

/// The pair the builders in `oracle.ts` take.
export function deploymentOf(record: DeploymentRecord): Deployment {
  return { seed: record.seed, operator: record.operator };
}

export function beaconUnitOf(record: DeploymentRecord): string {
  return beaconUnit(record.beaconPolicyId);
}
