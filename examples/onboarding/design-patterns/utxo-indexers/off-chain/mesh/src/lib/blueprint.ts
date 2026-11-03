import {
  applyCborEncoding,
  deserializeAddress,
  mConStr0,
  mPubKeyAddress,
  resolveScriptHash,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this project, copied in from
// `../../on-chain/aiken/plutus.json`. It holds three order books: the naive
// one, and the pattern written by hand and with the library.
import blueprint from "../../blueprints/utxo-indexers.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// Every order book in the blueprint, by the validator's title without its
/// handler.
export const BOOKS = {
  naive: "naive.orders",
  byHand: "by_hand.orders",
  withLibrary: "with_library.orders",
} as const;

export type Book = keyof typeof BOOKS;

/// The token every order in this example buys. On a real network it would be
/// an existing token; offline, any policy ID will do.
export const TOKEN = {
  policyId: "00000000000000000000000000000000000000000000000000000aaa",
  assetName: stringToHex("TOKEN"),
};
export const TOKEN_UNIT = TOKEN.policyId + TOKEN.assetName;

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The book's compiled script. The books take no parameters, so this is the
/// blueprint's code as it is. Every handler of a validator shares it, so the
/// `else` entry is as good as any.
export function bookScriptCbor(book: Book): string {
  return applyCborEncoding(compiledCode(blueprint, `${BOOKS[book]}.else`));
}

/// The book's hash: the payment credential of its address.
export function bookHash(book: Book): string {
  return resolveScriptHash(bookScriptCbor(book), PLUTUS_VERSION);
}

/// Where orders are placed.
export function bookAddress(book: Book, networkId: number): string {
  return serializePlutusScript(
    { code: bookScriptCbor(book), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// An order as on-chain data: the `Order` type in `lib/order_book.ak`. The
/// owner is the buyer's whole address, stake credential included, so the
/// tokens cannot be delivered to their key under somebody else's stake.
export function orderDatum(owner: string, quantity: number) {
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(owner);
  return mConStr0([
    mPubKeyAddress(pubKeyHash, stakeCredentialHash || undefined),
    TOKEN.policyId,
    TOKEN.assetName,
    quantity,
  ]);
}
