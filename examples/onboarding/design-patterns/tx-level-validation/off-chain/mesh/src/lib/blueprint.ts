import {
  applyParamsToScript,
  deserializeAddress,
  mPubKeyAddress,
  resolveScriptHash,
  serializePlutusScript,
  serializeRewardAddress,
  stringToHex,
} from "@meshsdk/core";

// The `plutus.json` that `aiken build` wrote for this project, copied in from
// `../../on-chain/aiken/plutus.json`. It holds five pools: the naive one, and a
// withdraw and a mint version of the pattern, each written by hand and with the
// library.
import blueprint from "../../blueprints/tx-level-validation.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// Every pool in the blueprint, by the validator's title without its handler.
export const POOLS = {
  naive: "naive.pool",
  withdrawByHand: "by_hand.pool_withdraw",
  mintByHand: "by_hand.pool_mint",
  withdrawLibrary: "with_library.pool_withdraw",
  mintLibrary: "with_library.pool_mint",
} as const;

export type Pool = keyof typeof POOLS;

/// The token the mint coordinators mint to make their policy run: one per
/// sweep, kept by whoever swept, and burnable by whoever holds it. It proves
/// nothing, and nothing in the pool reads it.
export const SWEEP_NAME_HEX = stringToHex("SWEEP");

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(source: Blueprint, title: string): string {
  const validator = source.validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// The pool's parameter: the beneficiary's whole address as on-chain data, its
/// stake credential included, so a payout cannot be redirected to the same key
/// under a stake credential someone else chose.
export function beneficiaryData(beneficiaryAddress: string) {
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(beneficiaryAddress);
  return mPubKeyAddress(pubKeyHash, stakeCredentialHash || undefined);
}

/// The pool, compiled around the address it pays out to. Every handler of a
/// validator shares one compiled script, so the `else` entry is as good as any.
export function poolScriptCbor(pool: Pool, beneficiaryAddress: string): string {
  return applyParamsToScript(compiledCode(blueprint, `${POOLS[pool]}.else`), [
    beneficiaryData(beneficiaryAddress),
  ]);
}

/// The pool's hash. It is the payment credential of the pool's address, and,
/// for the pattern's pools, the coordinator's stake credential or policy id.
/// Every payout is tagged with it.
export function poolHash(pool: Pool, beneficiaryAddress: string): string {
  return resolveScriptHash(poolScriptCbor(pool, beneficiaryAddress), PLUTUS_VERSION);
}

/// Where donations are sent.
export function poolAddress(pool: Pool, beneficiaryAddress: string, networkId: number): string {
  return serializePlutusScript(
    { code: poolScriptCbor(pool, beneficiaryAddress), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

// #region reward-address
/// The same hash as a stake credential: the reward address a withdrawal names
/// to make the coordinator run.
export function coordinatorRewardAddress(
  pool: Pool,
  beneficiaryAddress: string,
  networkId: number,
): string {
  return serializeRewardAddress(poolHash(pool, beneficiaryAddress), true, networkId as 0 | 1);
}
// #endregion reward-address
