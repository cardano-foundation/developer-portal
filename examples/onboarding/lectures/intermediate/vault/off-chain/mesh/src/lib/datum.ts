// #region file
import { mConStr0, mConStr1 } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";

/// The **datum**: who owns the locked UTxO, mirroring the on-chain
/// `VaultDatum { owner }`.
export function vaultDatum(ownerPubKeyHash: string): Data {
  return mConStr0([ownerPubKeyHash]);
}

/// The **redeemer**: the spender's action, mirroring `VaultAction`. `Unlock` is
/// the first constructor, so it is number 0, and it carries no fields.
export const unlockRedeemer: Data = mConStr0([]);

// #region recover
/// The second action, added in **parameters**. `Recover` is declared after
/// `Unlock` on-chain, so it is constructor **1**, the number is the whole
/// difference between the two.
export const recoverRedeemer: Data = mConStr1([]);
// #endregion recover
// #endregion file
