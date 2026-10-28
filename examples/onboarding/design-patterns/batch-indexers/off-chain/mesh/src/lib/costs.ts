import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { BOOKS } from "./blueprint.ts";
import type { Book, MixedBook } from "./blueprint.ts";
import { NETWORK, TREASURY, offlineChain } from "./offline.ts";
import { buildBatchTx } from "./orders.ts";

/// How many orders each measured batch takes.
export const BATCH_SIZES = [1, 5, 10, 20] as const;

/// In a mixed batch, every other order is filled this much of its 100 tokens.
export const PARTLY = 40;

/// The most one transaction may use, from the protocol parameters the offline
/// chain runs on.
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};

/// What one batch costs: the execution units of every script run added up,
/// the fee in lovelace, the transaction's size in bytes, and whether all three
/// stay within one transaction's limits.
export type Cost = { mem: number; cpu: number; fee: number; size: number; fits: boolean };

/// Which of a transaction's limits a batch runs into first.
export type Limit = "mem" | "cpu" | "size";

/// One kind of batch, measured: at each size, and the largest that fits.
export type Measured = { batches: Record<string, Cost>; largestBatch: number; limitedBy: Limit };

/// Everything `npm run bench` writes to `costs.json`.
export type Costs = {
  limits: { mem: number; cpu: number; size: number };
  /// Batches of whole fills, with every book.
  whole: Record<Book, Measured>;
  /// Batches where every other order is only partly filled.
  mixed: Record<MixedBook, Measured>;
};

/// Build one batch of `orders` orders from `book` on a fresh chain, and run its
/// scripts. A `mixed` batch partly fills every other order.
export async function measure(book: Book, orders: number, mixed = false): Promise<Cost> {
  const chain = await offlineChain();
  const placed = chain
    .placeOrders(book, orders)
    .map((order, n) => (mixed && n % 2 === 1 ? { ...order, partly: PARTLY } : order));
  const unsignedTx = await buildBatchTx(
    {
      wallet: chain.wallet,
      provider: chain.fetcher,
      treasury: TREASURY,
      orders: placed,
      evaluator: chain.evaluator,
    },
    book,
    NETWORK,
  );
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

async function fits(book: Book, size: number, mixed: boolean): Promise<boolean> {
  try {
    return (await measure(book, size, mixed)).fits;
  } catch (error) {
    // Well past the size limit, Mesh refuses to build the transaction at all.
    if (String(error).includes("Maximum Input Count Exceeded")) return false;
    throw error;
  }
}

/// The most orders `book` can take in one batch. Doubles until a batch no
/// longer fits, then halves the gap between the last size that did and the
/// first that did not.
export async function largestBatch(book: Book, mixed = false): Promise<number> {
  let fitting = 1;
  let failing = 2;
  while (await fits(book, failing, mixed)) {
    fitting = failing;
    failing *= 2;
  }
  while (failing - fitting > 1) {
    const middle = Math.floor((fitting + failing) / 2);
    if (await fits(book, middle, mixed)) fitting = middle;
    else failing = middle;
  }
  return fitting;
}

/// Which limit stops `book` from taking one more order than `largest`.
export async function limitedBy(book: Book, largest: number, mixed = false): Promise<Limit> {
  let cost: Cost;
  try {
    cost = await measure(book, largest + 1, mixed);
  } catch {
    return "size";
  }
  if (cost.mem > LIMITS.mem) return "mem";
  if (cost.cpu > LIMITS.cpu) return "cpu";
  return "size";
}

async function measureKind(book: Book, mixed: boolean): Promise<Measured> {
  const batches: Record<string, Cost> = {};
  for (const size of BATCH_SIZES) batches[size] = await measure(book, size, mixed);
  const largest = await largestBatch(book, mixed);
  return { batches, largestBatch: largest, limitedBy: await limitedBy(book, largest, mixed) };
}

/// Measure every book's whole batches, and the mixed books' mixed batches.
export async function measureAll(): Promise<Costs> {
  const whole = {} as Costs["whole"];
  for (const book of Object.keys(BOOKS) as Book[]) whole[book] = await measureKind(book, false);
  const mixed = {} as Costs["mixed"];
  for (const book of ["mixedByHand", "mixedLibrary"] as const) {
    mixed[book] = await measureKind(book, true);
  }
  return { limits: LIMITS, whole, mixed };
}
