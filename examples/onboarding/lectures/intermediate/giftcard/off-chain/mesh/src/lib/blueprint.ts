import {
  applyParamsToScript,
  mConStr0,
  resolveScriptHash,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this contract, copied in from
// `../../on-chain/aiken/plutus.json`. It holds one validator with two handlers,
// `mint` and `spend`, and both entries carry the same compiled code.
import blueprint from "../../blueprints/giftcard.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// The token name the policy allows, as the contract spells it.
export const CARD_NAME = "GIFT";

/// Token names travel as hex on the chain, so convert it once here.
export const CARD_NAME_HEX = stringToHex(CARD_NAME);

/// The UTxO a card was seeded from. Everything else here is derived from it, so
/// this pair of values is the whole identity of one card.
export type Seed = { txHash: string; outputIndex: number };

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// Nothing here has an address until a seed is chosen, so these are functions
/// rather than constants. One script, one hash, used two ways:
///
///   seed UTxO -> the card's script -> its hash = policy id = address
///
/// #region derivation
/// The contract, compiled around the one UTxO that has to be spent to create
/// the card. An `OutputReference` is a constructor holding a transaction id
/// and an index.
export function cardScriptCbor(seed: Seed): string {
  return applyParamsToScript(compiledCode(blueprint, "giftcard.giftcard.mint"), [
    mConStr0([seed.txHash, seed.outputIndex]),
  ]);
}

/// That script's hash, which is the policy id the card is filed under.
export function cardPolicyId(seed: Seed): string {
  return resolveScriptHash(cardScriptCbor(seed), PLUTUS_VERSION);
}

/// The same hash as an address, for one network: where the funds behind the
/// card sit.
export function cardAddress(seed: Seed, networkId: number): string {
  return serializePlutusScript({ code: cardScriptCbor(seed), version: PLUTUS_VERSION }, undefined, networkId)
    .address;
}
// #endregion derivation

/// The unit a card travels under: its policy id followed by its name in hex.
export function cardUnit(seed: Seed): string {
  return cardPolicyId(seed) + CARD_NAME_HEX;
}
