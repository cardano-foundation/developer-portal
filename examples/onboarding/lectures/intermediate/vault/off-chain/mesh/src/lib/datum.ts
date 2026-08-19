// #region file
import { mConStr0, mConStr1 } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";

/// The datum: who owns the locked UTxO.
export function vaultDatum(ownerPubKeyHash: string): Data {
  return mConStr0([ownerPubKeyHash]);
}

/// The redeemer for `Unlock`.
export const unlockRedeemer: Data = mConStr0([]);

// #region recover
/// The redeemer for `Recover`, added in parameters.
export const recoverRedeemer: Data = mConStr1([]);
// #endregion recover
// #endregion file
