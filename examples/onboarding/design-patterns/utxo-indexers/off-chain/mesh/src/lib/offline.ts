import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher,
  serializeData,
} from "@meshsdk/core";
import type { Asset, UTxO } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { TOKEN_UNIT, bookAddress, orderDatum } from "./blueprint.ts";
import type { Book } from "./blueprint.ts";
import type { Order } from "./orders.ts";

// An in-memory chain with two funded wallets. No node and no waiting: the
// tests and the benchmark build real transactions and run the real compiled
// validators on them. Everything here is fixed, so the same code always
// measures the same numbers.

export const NETWORK = 0;

/// Whoever fills orders. Anybody may: the book only cares that each buyer gets
/// their tokens.
const SELLER =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

/// Who places the orders.
const BUYER =
  "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(
    " ",
  );

/// What each order holds and asks for.
export const ORDER_LOVELACE = "10000000";
export const ORDER_QUANTITY = 100;

/// A fresh chain: an empty UTxO set, a seller holding ADA and tokens, and a
/// buyer holding ADA.
export async function offlineChain() {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  // The offline fetcher has no cost models of its own, so hand it Mesh's
  // defaults, the ones the builder would fall back to anyway.
  fetcher.fetchCostModels = async () => [
    DEFAULT_V1_COST_MODEL_LIST,
    DEFAULT_V2_COST_MODEL_LIST,
    DEFAULT_V3_COST_MODEL_LIST,
  ];
  let txCounter = 0;

  function addUtxo(address: string, assets: Asset[], plutusData?: string): UTxO {
    txCounter += 1;
    const utxo = {
      input: { txHash: txCounter.toString(16).padStart(64, "0"), outputIndex: 0 },
      output: { address, amount: assets, ...(plutusData ? { plutusData } : {}) },
    };
    fetcher.addUTxOs([utxo]);
    return utxo;
  }

  const wallet = await makeWallet(fetcher, SELLER);
  const sellerAddress = await wallet.getChangeAddress();
  const buyerWallet = await makeWallet(fetcher, BUYER);
  const buyerAddress = await buyerWallet.getChangeAddress();

  /// `count` orders from the buyer, each locking 10 ADA for 100 tokens.
  function placeOrders(book: Book, count: number): Order[] {
    const address = bookAddress(book, NETWORK);
    const datum = serializeData(orderDatum(buyerAddress, ORDER_QUANTITY));
    return Array.from({ length: count }, () => ({
      utxo: addUtxo(address, [{ unit: "lovelace", quantity: ORDER_LOVELACE }], datum),
      owner: buyerAddress,
      quantity: ORDER_QUANTITY,
    }));
  }

  // The offline chain numbers its transactions in order, so the orders, placed
  // later, sort after these UTxOs: in a fill, the seller's funds come first.
  // The seller: ADA for fees and the outputs' minimum ADA, plenty of tokens,
  // and a 5 ADA UTxO that serves as collateral.
  addUtxo(sellerAddress, [
    { unit: "lovelace", quantity: "1000000000" },
    { unit: TOKEN_UNIT, quantity: "1000000" },
  ]);
  addUtxo(sellerAddress, [{ unit: "lovelace", quantity: "5000000" }]);
  // The buyer needs funds of their own only to cancel.
  addUtxo(buyerAddress, [{ unit: "lovelace", quantity: "100000000" }]);
  addUtxo(buyerAddress, [{ unit: "lovelace", quantity: "5000000" }]);

  return {
    fetcher,
    wallet,
    sellerAddress,
    buyerWallet,
    buyerAddress,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
    addUtxo,
    placeOrders,
  };
}

async function makeWallet(fetcher: OfflineFetcher, mnemonic: string[]): Promise<MeshWallet> {
  // No submitter: nothing here is ever submitted anywhere.
  const wallet = new MeshWallet({
    networkId: NETWORK,
    fetcher,
    key: { type: "mnemonic", words: mnemonic },
  });
  await wallet.init();
  return wallet;
}
