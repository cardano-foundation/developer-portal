import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, keyOf } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { offlineChain } from "./offline.ts";
import { buildPlan, mutationPlan, proofPlan } from "./registry.ts";

export const SIZES = [1, 5, 10, 20, 100] as const;
export const SCENARIOS = ["insert", "remove", "update", "member", "absent"] as const;
export type Scenario = typeof SCENARIOS[number];
export const LIMITS = { mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem), cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps), size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize) };
export type Cost = { mem: number; cpu: number; size: number; fee: number; fits: boolean };

export async function measure(version: Version, count: number, scenario: Scenario): Promise<Cost> {
  const chain = await offlineChain(version, count);
  const entry = scenario === "insert"
    ? { key: keyOf(count * 2 + 1), label: "participant" }
    : { ...chain.entries.at(-1)!, label: "updated" };
  const plan = scenario === "member" || scenario === "absent"
    ? proofPlan(chain, scenario === "member", keyOf(count * 2 + (scenario === "absent" ? 1 : 0)))
    : mutationPlan(chain, scenario, entry);
  const tx = await buildPlan(chain, plan, chain.evaluator);
  const runs = await chain.evaluator.evaluateTx(tx, [], []);
  const mem = runs.reduce((sum, run) => sum + run.budget.mem, 0);
  const cpu = runs.reduce((sum, run) => sum + run.budget.steps, 0);
  // Include the wallet's real witness: unsigned CBOR undercounts the size at
  // the boundary. Signing stays offline and leaves the transaction body alone.
  const size = (await chain.wallet.signTx(tx)).length / 2;
  return { mem, cpu, size, fee: Number(deserializeTx(tx).body().fee().to_str()), fits: mem <= LIMITS.mem && cpu <= LIMITS.cpu && size <= LIMITS.size };
}

export async function largestArray() {
  const cost = async (count: number) => {
    try {
      return await measure("naive", count, "insert");
    } catch (error) {
      if (String(error).includes("Maximum Input Count Exceeded")) return null;
      throw error;
    }
  };
  let fits = 0;
  let fails = 1;
  while ((await cost(fails))?.fits) { fits = fails; fails *= 2; }
  while (fails - fits > 1) {
    const n = Math.floor((fits + fails) / 2);
    if ((await cost(n))?.fits) fits = n;
    else fails = n;
  }
  const next = await cost(fails);
  return { largestExisting: fits, limitedBy: next && next.mem > LIMITS.mem ? "mem" : next && next.cpu > LIMITS.cpu ? "cpu" : "size", last: await measure("naive", fits, "insert"), next };
}

export async function measureAll() {
  const versions = {} as Record<Version, { scriptSize: number; scenarios: Record<Scenario, Record<string, Cost>> }>;
  for (const version of VERSIONS) {
    const chain = await offlineChain(version);
    const scenarios = {} as Record<Scenario, Record<string, Cost>>;
    for (const scenario of SCENARIOS) {
      scenarios[scenario] = {};
      for (const n of SIZES) scenarios[scenario][n] = await measure(version, n, scenario);
    }
    versions[version] = { scriptSize: chain.deployed.cbor.length / 2, scenarios };
  }
  return {
    limits: LIMITS, versions, arrayLimit: await largestArray(),
    largeList: { size: 1000, byHand: await measure("byHand", 1000, "insert"), withLibrary: await measure("withLibrary", 1000, "insert") },
  };
}
