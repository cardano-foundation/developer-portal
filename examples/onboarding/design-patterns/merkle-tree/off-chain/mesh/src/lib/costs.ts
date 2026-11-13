import { DEFAULT_PROTOCOL_PARAMETERS, serializeData } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, grantScript } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { offlineChain } from "./offline.ts";
import { buildClaimTx, buildLockTx, claimPlan, minimumAda } from "./grants.ts";
import { proofData } from "./tree.ts";

export const SIZES = [1, 5, 10, 20, 100, 256] as const;
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};
export type Cost = { mem: number; cpu: number; size: number; fee: number; fits: boolean };

export async function measure(version: Version, count: number) {
  const chain = await offlineChain(version, count);
  const claim = await buildClaimTx(chain, claimPlan(chain), chain.evaluator);
  const runs = await chain.evaluator.evaluateTx(claim, [], []);
  const mem = runs.reduce((sum, run) => sum + run.budget.mem, 0);
  const cpu = runs.reduce((sum, run) => sum + run.budget.steps, 0);
  const size = (await chain.wallet.signTx(claim)).length / 2;
  const lock = await buildLockTx(chain);
  return {
    claim: {
      mem, cpu, size,
      fee: Number(deserializeTx(claim).body().fee().to_str()),
      fits: mem <= LIMITS.mem && cpu <= LIMITS.cpu && size <= LIMITS.size,
    } satisfies Cost,
    lock: {
      size: (await chain.wallet.signTx(lock)).length / 2,
      fee: Number(deserializeTx(lock).body().fee().to_str()),
      minimumAda: Number(await minimumAda(chain)),
    },
    datumSize: chain.grant.output.plutusData!.length / 2,
    proofSteps: version === "naive" ? 0 : chain.proof.length,
    proofSize: version === "naive" ? 0 : serializeData(proofData(chain.proof)).length / 2,
  };
}

/// The spend only references the old inline datum. Find the *publication*
/// limit instead of inventing an enormous list UTxO that could never be created.
export async function largestPublishedList() {
  const sizeOf = async (count: number) => {
    const chain = await offlineChain("naive", count);
    try {
      return (await chain.wallet.signTx(await buildLockTx(chain))).length / 2;
    } catch (error) {
      if (String(error).includes("Maximum Input Count Exceeded")) return null;
      throw error;
    }
  };
  const fits = async (count: number) => {
    const size = await sizeOf(count);
    return size !== null && size <= LIMITS.size;
  };
  let fitting = 1;
  let failing = 2;
  while (await fits(failing)) { fitting = failing; failing *= 2; }
  while (failing - fitting > 1) {
    const middle = Math.floor((fitting + failing) / 2);
    if (await fits(middle)) fitting = middle;
    else failing = middle;
  }
  return {
    members: fitting,
    limitedBy: "size" as const,
    lastSize: (await sizeOf(fitting))!,
    nextSize: await sizeOf(failing),
  };
}

export async function measureAll() {
  const versions = {} as Record<Version, { scriptSize: number; sizes: Record<string, Awaited<ReturnType<typeof measure>>> }>;
  for (const version of VERSIONS) {
    const sizes: Record<string, Awaited<ReturnType<typeof measure>>> = {};
    for (const count of SIZES) sizes[count] = await measure(version, count);
    versions[version] = { scriptSize: grantScript(version).length / 2, sizes };
  }
  return {
    limits: LIMITS,
    versions,
    listPublicationLimit: await largestPublishedList(),
    largeTree: {
      members: 65_536,
      byHand: await measure("byHand", 65_536),
    },
  };
}
