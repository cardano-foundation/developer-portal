import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { POLICIES, policyScriptCbor, scriptSize } from "./blueprint.ts";
import type { Member, Policy } from "./blueprint.ts";
import { NETWORK, offlineChain } from "./offline.ts";
import { buildMintRewardsTx, listedLockups } from "./rewards.ts";

/// How many members each measured mint pays.
export const MINT_SIZES = [1, 5, 10, 20] as const;

/// The most one transaction may use, from the protocol parameters the offline
/// chain runs on.
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};

/// What one mint costs: the policy's execution units, the fee in lovelace,
/// the signed transaction's size, the size of the policy script it carries, and
/// whether it fits in one transaction.
export type Cost = {
  mem: number;
  cpu: number;
  fee: number;
  size: number;
  scriptSize: number;
  fits: boolean;
};

/// Which limit a transaction one member larger than the largest would break.
export type Limit = "mem" | "cpu" | "size";

/// Everything `npm run bench` writes to `costs.json`.
export type Costs = {
  limits: typeof LIMITS;
  policies: Record<Policy, { mints: Record<string, Cost>; largestMint: number; limitedBy: Limit }>;
  /// The most lock-ups the naive policy can list and still fit in a
  /// transaction that pays one of them.
  largestNaiveList: number;
};

/// Each member gets 10 reward tokens. The terms policies give each member
/// their own date, one second apart.
function rewardsFor(policy: Policy, members: Member[]) {
  return members.map((member, i) => ({
    member: policy === "hashedTerms" || policy === "rawTerms" ? { ...member, unlockAt: member.unlockAt + i * 1000 } : member,
    quantity: 10,
  }));
}

/// Mint rewards to `paid` members under `policy`, on a fresh chain. The naive
/// policy lists `listed` members' lock-ups, the paid ones first.
export async function measure(policy: Policy, paid: number, listed = paid): Promise<Cost> {
  const chain = await offlineChain();
  const rewards = rewardsFor(policy, chain.members(Math.max(paid, listed)));
  const list = listedLockups(policy, rewards.map((r) => r.member));
  const mint = {
    wallet: chain.adminWallet,
    provider: chain.fetcher,
    policy,
    admin: chain.admin,
    unlockAt: chain.unlockAt,
    rewards: rewards.slice(0, paid),
    listed: list,
    networkId: NETWORK,
  };
  let unsignedTx: string;
  try {
    unsignedTx = await buildMintRewardsTx({ ...mint, evaluator: chain.evaluator });
  } catch {
    // Over a limit, the evaluator refuses to build. Build it without running
    // the scripts, to measure it anyway.
    unsignedTx = await buildMintRewardsTx(mint);
  }
  let mem = Infinity;
  let cpu = Infinity;
  try {
    const runs = await chain.evaluator.evaluateTx(unsignedTx, [], []);
    mem = runs.reduce((total, run) => total + run.budget.mem, 0);
    cpu = runs.reduce((total, run) => total + run.budget.steps, 0);
  } catch {
    // The policy ran out of budget: it does not fit.
  }
  // Witnesses count toward the ledger's transaction-size limit too.
  const signedTx = await chain.adminWallet.signTx(unsignedTx);
  const size = signedTx.length / 2;
  return {
    mem,
    cpu,
    fee: Number(deserializeTx(unsignedTx).body().fee().to_str()),
    size,
    scriptSize: scriptSize(policyScriptCbor(policy, chain.admin, chain.unlockAt, list)),
    fits: mem <= LIMITS.mem && cpu <= LIMITS.cpu && size <= LIMITS.size,
  };
}

/// The largest `n` for which `fits(n)`, searching by doubling then halving.
async function largest(fits: (n: number) => Promise<boolean>): Promise<number> {
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

/// Whether a mint fits. Far past the size limit, Mesh refuses to build it at
/// all ("Maximum Input Count Exceeded"), which also means it does not fit.
async function fits(policy: Policy, paid: number, listed = paid): Promise<boolean> {
  try {
    return (await measure(policy, paid, listed)).fits;
  } catch {
    return false;
  }
}

export const largestMint = (policy: Policy) => largest((n) => fits(policy, n));

export const largestNaiveList = () => largest((n) => fits("naive", 1, n));

/// The limit a mint to `most + 1` members breaks.
export async function limitPast(policy: Policy, most: number): Promise<Limit> {
  let cost: Cost;
  try {
    cost = await measure(policy, most + 1);
  } catch {
    return "size";
  }
  if (cost.size > LIMITS.size) return "size";
  return cost.mem > LIMITS.mem ? "mem" : "cpu";
}

/// Measure every policy at every size, and the limits.
export async function measureAll(): Promise<Costs> {
  const policies = {} as Costs["policies"];
  for (const policy of Object.keys(POLICIES) as Policy[]) {
    const mints: Record<string, Cost> = {};
    for (const size of MINT_SIZES) mints[size] = await measure(policy, size);
    const most = await largestMint(policy);
    policies[policy] = { mints, largestMint: most, limitedBy: await limitPast(policy, most) };
  }
  return { limits: LIMITS, policies, largestNaiveList: await largestNaiveList() };
}
