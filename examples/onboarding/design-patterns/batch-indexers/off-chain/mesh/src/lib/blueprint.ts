import {
  applyParamsToScript,
  deserializeAddress,
  mConStr0,
  mPubKeyAddress,
  resolveScriptHash,
  serializePlutusScript,
  serializeRewardAddress,
  stringToHex,
} from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this project, copied in from
// `../../on-chain/aiken/plutus.json`. It holds five order books: one where
// every order checks the batch, and four with a coordinator, written by hand
// and with the library, for whole fills and for mixed batches.
import blueprint from "../../blueprints/batch-indexers.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// Every order book in the blueprint, by the validator's title without its
/// handler.
export const BOOKS = {
  perOrder: "per_order.orders",
  byHand: "by_hand.orders",
  withLibrary: "with_library.orders",
  mixedByHand: "mixed_by_hand.orders",
  mixedLibrary: "mixed_with_library.orders",
} as const;

export type Book = keyof typeof BOOKS;

/// The books with a withdraw-zero coordinator.
export type CoordinatedBook = Exclude<Book, "perOrder">;

/// The books whose coordinator reads each order's redeemer, so a batch can mix
/// whole and partial fills.
export type MixedBook = "mixedByHand" | "mixedLibrary";

/// What the protocol charges for each order a batch fills, in lovelace: the
/// `fee_per_order` constant in `lib/order_book.ak`.
export const FEE_PER_ORDER = 1_000_000n;

/// The token every order in this example buys. Offline, any policy ID will do.
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

/// An address as on-chain data. Only key addresses are used here.
function addressData(address: string) {
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(address);
  return mPubKeyAddress(pubKeyHash, stakeCredentialHash || undefined);
}

/// The book, compiled around the treasury it pays its fee to.
export function bookScriptCbor(book: Book, treasury: string): string {
  return applyParamsToScript(compiledCode(blueprint, `${BOOKS[book]}.else`), [
    addressData(treasury),
  ]);
}

/// The book's hash: the payment credential of its address, the coordinator's
/// stake credential, and the tag on the fee.
export function bookHash(book: Book, treasury: string): string {
  return resolveScriptHash(bookScriptCbor(book, treasury), PLUTUS_VERSION);
}

/// Where orders are placed.
export function bookAddress(book: Book, treasury: string, networkId: number): string {
  return serializePlutusScript(
    { code: bookScriptCbor(book, treasury), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

/// The same hash as a stake credential: the reward address a withdrawal names
/// to make a book's coordinator run.
export function coordinatorRewardAddress(
  book: CoordinatedBook,
  treasury: string,
  networkId: number,
): string {
  return serializeRewardAddress(bookHash(book, treasury), true, networkId as 0 | 1);
}

/// An order as on-chain data: the `Order` type in `lib/order_book.ak`.
export function orderDatum(owner: string, quantity: number) {
  return mConStr0([addressData(owner), TOKEN.policyId, TOKEN.assetName, quantity]);
}
