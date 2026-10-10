import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { POOLS } from "./blueprint.ts";
import type { Pool } from "./blueprint.ts";
import { NETWORK, offlineChain } from "./offline.ts";
import { buildMintSweepTx, buildNaiveSweepTx, buildWithdrawSweepTx } from "./sweep.ts";
import type { Sweep } from "./sweep.ts";

/// How many donations each measured sweep takes. The naive pool's cost grows
/// with the square of this, so the larger sizes are where the difference shows.
export const SWEEP_SIZES = [1, 5, 10, 20] as const;

/// The most one transaction may use, from the protocol parameters the offline
/// chain runs on.
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};

/// What one sweep costs: the execution units of every script run added up,
/// the fee in lovelace, the transaction's size in bytes, and whether all three
/// stay within one transaction's limits.
export type Cost = { mem: number; cpu: number; fee: number; size: number; fits: boolean };

/// Everything `npm run bench` writes to `costs.json`.
export type Costs = {
  limits: { mem: number; cpu: number; size: number };
  pools: Record<Pool, { sweeps: Record<string, Cost>; largestSweep: number }>;
};

/// Build one sweep of `donations` donations from `pool` on a fresh chain, and run
/// its scripts.
export async function measure(pool: Pool, donations: number): Promise<Cost> {
  const chain = await offlineChain();
  const sweep: Sweep = {
    wallet: chain.wallet,
    provider: chain.fetcher,
    beneficiaryAddress: chain.beneficiaryAddress,
    donations: chain.donate(pool, donations),
    evaluator: chain.evaluator,
  };
  const unsignedTx = await buildSweep(sweep, pool);
  const runs = await chain.evaluator.evaluateTx(unsignedTx, [], []);
  const mem = runs.reduce((total, run) => total + run.budget.mem, 0);
  const cpu = runs.reduce((total, run) => total + run.budget.steps, 0);
  const size = unsignedTx.length / 2;
  return {
    mem,
    cpu,
    fee: Number(deserializeTx(unsignedTx).body().fee().to_str()),
    size,
    fits: mem <= LIMITS.mem && cpu <= LIMITS.cpu && size <= LIMITS.size,
  };
}

/// The most donations `pool` can sweep in one transaction. Doubles until a
/// sweep no longer fits, then halves the gap between the last size that did
/// and the first that did not.
export async function largestSweep(pool: Pool): Promise<number> {
  const fits = async (size: number) => (await measure(pool, size)).fits;
  let fitting = 1;
  let failing = 2;
  while (await fits(failing)) {
    fitting = failing;
    failing *= 2;
  }
  while (failing - fitting > 1) {
    const middle = Math.floor((fitting + failing) / 2);
    if (await fits(middle)) fitting = middle;
    else failing = middle;
  }
  return fitting;
}

/// Measure every pool at every size, and find each one's largest sweep.
export async function measureAll(): Promise<Costs> {
  const pools = {} as Costs["pools"];
  for (const pool of Object.keys(POOLS) as Pool[]) {
    const sweeps: Record<string, Cost> = {};
    for (const size of SWEEP_SIZES) sweeps[size] = await measure(pool, size);
    pools[pool] = { sweeps, largestSweep: await largestSweep(pool) };
  }
  return { limits: LIMITS, pools };
}

function buildSweep(sweep: Sweep, pool: Pool): Promise<string> {
  switch (pool) {
    case "naive":
      return buildNaiveSweepTx(sweep);
    case "withdrawByHand":
    case "withdrawLibrary":
      return buildWithdrawSweepTx(sweep, pool, NETWORK);
    case "mintByHand":
    case "mintLibrary":
      return buildMintSweepTx(sweep, pool);
  }
}
