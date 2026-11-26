import { DEFAULT_PROTOCOL_PARAMETERS } from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-csl";
import { BOOKS } from "./blueprint.ts";
import type { Book } from "./blueprint.ts";
import { offlineChain } from "./offline.ts";
import { buildFillTx } from "./orders.ts";

/// How many orders each measured fill takes. The naive book's cost grows with
/// the square of this, so the larger sizes are where the difference shows.
export const FILL_SIZES = [1, 5, 10, 20] as const;

/// The most one transaction may use, from the protocol parameters the offline
/// chain runs on.
export const LIMITS = {
  mem: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExMem),
  cpu: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxExSteps),
  size: Number(DEFAULT_PROTOCOL_PARAMETERS.maxTxSize),
};

/// What one fill costs: the execution units of every script run added up, the
/// fee in lovelace, the transaction's size in bytes, and whether all three
/// stay within one transaction's limits.
export type Cost = { mem: number; cpu: number; fee: number; size: number; fits: boolean };

/// Everything `npm run bench` writes to `costs.json`.
export type Costs = {
  limits: { mem: number; cpu: number; size: number };
  books: Record<
    Book,
    {
      fills: Record<string, Cost>;
      largestFill: number;
      limitedBy: Limit;
      partialFills: Record<string, Cost>;
      largestPartialFill: number;
    }
  >;
};

/// Which of a transaction's limits a fill runs into first.
export type Limit = "mem" | "cpu" | "size";

/// How many of each order's 100 tokens a measured partial fill delivers.
export const PARTLY = 40;

/// Build one fill of `orders` orders from `book` on a fresh chain, and run its
/// scripts. With `partly`, each order is only partly filled.
export async function measure(book: Book, orders: number, partly?: number): Promise<Cost> {
  const chain = await offlineChain();
  const unsignedTx = await buildFillTx(
    {
      wallet: chain.wallet,
      provider: chain.fetcher,
      orders: chain.placeOrders(book, orders),
      evaluator: chain.evaluator,
    },
    book,
    partly,
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

/// The most orders `book` can fill in one transaction. Doubles until a fill no
/// longer fits, then halves the gap between the last size that did and the
/// first that did not.
export async function largestFill(book: Book, partly?: number): Promise<number> {
  const fits = async (size: number) => {
    try {
      return (await measure(book, size, partly)).fits;
    } catch (error) {
      // Well past the size limit, Mesh refuses to build the transaction at all.
      if (String(error).includes("Maximum Input Count Exceeded")) return false;
      throw error;
    }
  };
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

/// Which limit stops `book` from filling one more order than `largest`.
export async function limitedBy(book: Book, largest: number): Promise<Limit> {
  let cost: Cost;
  try {
    cost = await measure(book, largest + 1);
  } catch {
    return "size";
  }
  if (cost.mem > LIMITS.mem) return "mem";
  if (cost.cpu > LIMITS.cpu) return "cpu";
  return "size";
}

/// Measure every book at every size, and find each one's largest fill.
export async function measureAll(): Promise<Costs> {
  const books = {} as Costs["books"];
  for (const book of Object.keys(BOOKS) as Book[]) {
    const fills: Record<string, Cost> = {};
    const partialFills: Record<string, Cost> = {};
    for (const size of FILL_SIZES) {
      fills[size] = await measure(book, size);
      partialFills[size] = await measure(book, size, PARTLY);
    }
    const largest = await largestFill(book);
    books[book] = {
      fills,
      largestFill: largest,
      limitedBy: await limitedBy(book, largest),
      partialFills,
      largestPartialFill: await largestFill(book, PARTLY),
    };
  }
  return { limits: LIMITS, books };
}
