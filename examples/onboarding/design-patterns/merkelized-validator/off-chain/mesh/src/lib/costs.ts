import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS } from "./blueprint.ts";
import type { Script, Source, Version } from "./blueprint.ts";
import { offlineChain } from "./offline.ts";
import { buildPublishTx, buildRegisterTx, buildTransaction, minimumReferenceAda, transactionPlan } from "./transactions.ts";
import type { Action } from "./transactions.ts";

export const SIZES = [1, 5, 10, 20] as const;
export const SOURCES = ["inline", "reference"] as const;
export const ACTIONS = ["purchase", "cancel"] as const;
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: DEFAULT_PROTOCOL_PARAMETERS.maxTxSize,
  referenceBytes: 200 * 1024,
};

/// Conway's tier calculation, using integers/rationals and flooring once at
/// the end. A duplicate script in a different referenced UTxO counts again.
/// https://github.com/IntersectMBO/cardano-ledger/blob/cardano-ledger-conway-1.19.0.0/eras/conway/impl/src/Cardano/Ledger/Conway/Tx.hs
export function referenceFee(bytes: number): number {
  let left = BigInt(bytes);
  let numerator = BigInt(DEFAULT_PROTOCOL_PARAMETERS.minFeeRefScriptCostPerByte);
  let denominator = 1n;
  let total = 0n;
  while (left > 0n) {
    const chunk = left > 25_600n ? 25_600n : left;
    total = total * 5n + numerator * chunk * 5n;
    denominator *= 5n;
    numerator *= 6n;
    left -= chunk;
  }
  return Number(total / denominator);
}

type Cost = {
  mem: number; cpu: number; size: number; fee: number;
  referenceBytes: number; referenceFee: number; fits: boolean;
};

// Fixed fixtures are identical within one benchmark/test process. Reuse a
// measurement when the boundary search revisits a sample or its failed bound.
const measurements = new Map<string, Promise<Cost>>();

export function measure(version: Version, source: Source, action: Action, count: number, policySize = 96): Promise<Cost> {
  const key = `${version}/${source}/${action}/${count}/${policySize}`;
  let measured = measurements.get(key);
  if (!measured) {
    measured = measureFresh(version, source, action, count, policySize);
    measurements.set(key, measured);
  }
  return measured;
}

async function measureFresh(version: Version, source: Source, action: Action, count: number, policySize: number): Promise<Cost> {
  const chain = await offlineChain(version, count, policySize);
  const plan = transactionPlan(chain, action);
  const tx = await buildTransaction(chain, plan, source, chain.evaluator);
  const runs = await chain.evaluator.evaluateTx(tx, [], []);
  const signed = await chain.wallet.signTx(tx);
  const mem = runs.reduce((sum, run) => sum + run.budget.mem, 0);
  const cpu = runs.reduce((sum, run) => sum + run.budget.steps, 0);
  const size = signed.length / 2;
  const scripts = [chain.deployment.root, ...plan.withdrawals.map((w) => w.script)];
  const bytes = source === "reference" ? scripts.reduce((sum, script) => sum + script.size, 0) : 0;
  return {
    mem, cpu, size,
    fee: Number(deserializeTx(tx).body().fee().to_str()),
    referenceBytes: bytes,
    referenceFee: referenceFee(bytes),
    fits: mem <= LIMITS.mem && cpu <= LIMITS.cpu && size <= LIMITS.size && bytes <= LIMITS.referenceBytes,
  };
}

export async function largestBatch(version: Version, source: Source) {
  const cost = async (n: number) => {
    try { return await measure(version, source, "purchase", n); }
    catch (error) {
      if (String(error).includes("Maximum Input Count Exceeded")) return null;
      throw error;
    }
  };
  let fitting = 1;
  let failing = 2;
  while ((await cost(failing))?.fits) { fitting = failing; failing *= 2; }
  while (failing - fitting > 1) {
    const middle = Math.floor((fitting + failing) / 2);
    if ((await cost(middle))?.fits) fitting = middle;
    else failing = middle;
  }
  const next = await cost(failing);
  return {
    count: fitting,
    limitedBy: next && next.mem > LIMITS.mem ? "mem" : next && next.cpu > LIMITS.cpu ? "cpu" : "size",
  };
}

export async function publication(version: Version, policySize = 96) {
  const chain = await offlineChain(version, 1, policySize);
  const modules: Record<string, { scriptSize: number; txSize: number | null; fee: number | null; minimumAda: number; fits: boolean }> = {};
  for (const [name, script] of Object.entries(chain.deployment)) {
    if (name === "version" || !script) continue;
    const module = script as Script;
    let size: number | null = null;
    let fee: number | null = null;
    try {
      const tx = await buildPublishTx(chain, module);
      size = (await chain.wallet.signTx(tx)).length / 2;
      fee = Number(deserializeTx(tx).body().fee().to_str());
    } catch (error) {
      if (!String(error).includes("Maximum Input Count Exceeded")) throw error;
    }
    modules[name] = {
      scriptSize: module.size, txSize: size, fee,
      minimumAda: Number(await minimumReferenceAda(chain, module)),
      fits: size !== null && size <= LIMITS.size,
    };
  }
  let registrationFee = 0;
  if (version !== "naive") {
    registrationFee = Number(deserializeTx(await buildRegisterTx(chain)).body().fee().to_str());
  }
  return {
    modules,
    totalScriptSize: Object.values(modules).reduce((sum, m) => sum + m.scriptSize, 0),
    totalPublicationFee: Object.values(modules).reduce((sum, m) => sum + (m.fee ?? 0), 0),
    totalMinimumAda: Object.values(modules).reduce((sum, m) => sum + m.minimumAda, 0),
    registrationFee,
    stakeDeposits: version === "naive" ? 0 : 2 * DEFAULT_PROTOCOL_PARAMETERS.keyDeposit,
  };
}

export async function measureAll() {
  const versions = {} as Record<Version, {
    setup: Awaited<ReturnType<typeof publication>>;
    sources: Record<Source, { purchase: Record<string, Awaited<ReturnType<typeof measure>>>; cancel: Record<string, Awaited<ReturnType<typeof measure>>>; largestPurchase: Awaited<ReturnType<typeof largestBatch>> }>;
  }>;
  for (const version of VERSIONS) {
    const sources = {} as typeof versions[Version]["sources"];
    for (const source of SOURCES) {
      const purchase: Record<string, Awaited<ReturnType<typeof measure>>> = {};
      const cancel: Record<string, Awaited<ReturnType<typeof measure>>> = {};
      for (const n of SIZES) {
        purchase[n] = await measure(version, source, "purchase", n);
        cancel[n] = await measure(version, source, "cancel", n);
      }
      sources[source] = { purchase, cancel, largestPurchase: await largestBatch(version, source) };
    }
    versions[version] = { setup: await publication(version), sources };
  }
  return {
    limits: LIMITS, policySize: 96, versions,
    wide: {
      policySize: 256,
      naive: await publication("naive", 256),
      byHand: await publication("byHand", 256),
      withLibrary: await publication("withLibrary", 256),
      purchaseByHand: await measure("byHand", "reference", "purchase", 1, 256),
      purchaseWithLibrary: await measure("withLibrary", "reference", "purchase", 1, 256),
    },
  };
}
