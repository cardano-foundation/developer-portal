import { deserializeAddress, mBool, mConStr0, mConStr1, mConStr2, mPubKeyAddress } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";
import type { Grant } from "./blueprint.ts";

// The second example: a grant whose vesting period is an interval in the
// datum, written by whoever locks the grant, in any encoding.

// #region period
/// One end of a period. `at` left out is infinite: −∞ for a lower bound, +∞
/// for an upper one.
export type Bound = { at?: number; included: boolean };

/// A period exactly as it goes into the datum: `Interval` in the stdlib.
export type Period = { lower: Bound; upper: Bound };

/// The period as on-chain data. Bound types are `NegativeInfinity`,
/// `Finite(at)` and `PositiveInfinity`, in that order.
export function periodData({ lower, upper }: Period) {
  const bound = (end: Bound, infinity: Data) =>
    mConStr0([end.at === undefined ? infinity : mConStr1([end.at]), mBool(end.included)]);
  return mConStr0([bound(lower, mConStr0([])), bound(upper, mConStr2([]))]);
}

/// The datum: `ScheduledGrant` in `lib/schedule.ak`, field for field.
export function scheduledDatum(grant: Grant, period: Period) {
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(grant.beneficiaryAddress);
  return mConStr0([
    mPubKeyAddress(pubKeyHash, stakeCredentialHash || undefined),
    deserializeAddress(grant.grantorAddress).pubKeyHash,
    periodData(period),
    grant.total,
  ]);
}
// #endregion period

/// The grant a period gives, read the way `validators/scheduled.ak` reads it:
/// linear over a closed period, a cliff at the end of a period with no start,
/// and never vesting otherwise. A grant that never vests has a start and an
/// end that never come.
export function vestingOf(grant: Grant, { lower, upper }: Period): Grant {
  const never = { ...grant, start: Infinity, end: Infinity };
  if (upper.at === undefined) return never;
  const last = upper.included ? upper.at : upper.at - 1;
  if (lower.at === undefined) return { ...grant, start: last, end: last };
  const first = lower.included ? lower.at : lower.at + 1;
  return first > last ? never : { ...grant, start: first, end: last };
}
