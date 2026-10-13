import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, scriptSize } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { START_SLOT, offlineChain } from "./offline.ts";
import { buildClaimTx, buildClawbackTx } from "./vesting.ts";
import type { Window } from "./vesting.ts";

/// The transactions measured for every version: a claim and a clawback halfway
/// through the grant, each with one bound set and with both.
export const SCENARIOS = {
  /// A claim declaring only a lower bound.
  claimFrom: { action: "claim", window: { from: START_SLOT + 5_000 } },
  /// A claim declaring both bounds, 100 slots apart.
  claimBetween: { action: "claim", window: { from: START_SLOT + 5_000, until: START_SLOT + 5_100 } },
  /// A clawback declaring only an upper bound.
  clawbackUntil: { action: "clawback", window: { until: START_SLOT + 5_000 } },
  /// A clawback declaring both bounds, 100 slots apart.
  clawbackBetween: { action: "clawback", window: { from: START_SLOT + 4_900, until: START_SLOT + 5_000 } },
} as const satisfies Record<string, { action: "claim" | "clawback"; window: Window }>;

export type Scenario = keyof typeof SCENARIOS;

/// The most one transaction may use, from the protocol parameters the offline
/// chain runs on.
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};

/// What one transaction costs: the execution units of its script run, the fee
/// in lovelace, its size in bytes, and the size in bytes of the compiled script
/// it carries.
export type Cost = { mem: number; cpu: number; fee: number; size: number; scriptSize: number };

/// Everything `npm run bench` writes to `costs.json`.
export type Costs = {
  limits: { mem: number; cpu: number; size: number };
  versions: Record<Version, Record<Scenario, Cost>>;
};

/// Build one scenario's transaction against `version` on a fresh chain, and
/// run its script.
export async function measure(version: Version, scenario: Scenario): Promise<Cost> {
  const chain = await offlineChain();
  const { action, window } = SCENARIOS[scenario];
  const spend = {
    wallet: action === "claim" ? chain.beneficiaryWallet : chain.grantorWallet,
    provider: chain.fetcher,
    version,
    grant: chain.grant,
    grantUtxo: chain.lock(version),
    window,
    evaluator: chain.evaluator,
  };
  const unsignedTx = action === "claim" ? await buildClaimTx(spend) : await buildClawbackTx(spend);
  const runs = await chain.evaluator.evaluateTx(unsignedTx, [], []);
  const tx = deserializeTx(unsignedTx);
  return {
    mem: runs.reduce((total, run) => total + run.budget.mem, 0),
    cpu: runs.reduce((total, run) => total + run.budget.steps, 0),
    fee: Number(tx.body().fee().to_str()),
    size: unsignedTx.length / 2,
    scriptSize: scriptSize(version),
  };
}

/// Measure every version in every scenario.
export async function measureAll(): Promise<Costs> {
  const versions = {} as Costs["versions"];
  for (const version of Object.keys(VERSIONS) as Version[]) {
    const scenarios = {} as Record<Scenario, Cost>;
    for (const scenario of Object.keys(SCENARIOS) as Scenario[]) {
      scenarios[scenario] = await measure(version, scenario);
    }
    versions[version] = scenarios;
  }
  return { limits: LIMITS, versions };
}
