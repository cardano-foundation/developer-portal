// #region file
import { mConStr0, mConStr1 } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";

/// The datum: who owns the locked UTxO.
export function vaultDatum(ownerPubKeyHash: string): Data {
  return mConStr0([ownerPubKeyHash]);
}

/// The redeemer for `Unlock`.
export const unlockRedeemer: Data = mConStr0([]);

// #region admin
/// The redeemer for `AdminUnlock`, added in parameters.
export const adminRedeemer: Data = mConStr1([]);
// #endregion admin
// #endregion file
