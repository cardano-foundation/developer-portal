//// The second example: the same grant, with its vesting period stored in the
//// datum as an interval. No script runs when a grant is locked, so whoever
//// locks one can write the period in any encoding the type allows.

use aiken/crypto.{VerificationKeyHash}
use aiken/interval.{Interval}
use cardano/address.{Address}
use vesting.{Grant}

// #region scheduled-grant
/// A grant whose vesting period is an interval: when it starts vesting, and
/// when it has fully vested. Times are POSIX milliseconds, amounts lovelace.
pub type ScheduledGrant {
  beneficiary: Address,
  grantor: VerificationKeyHash,
  /// Written by whoever locks the grant, in any encoding.
  period: Interval,
  total: Int,
}

/// The grant the shared checks read: the same parties and total, with the
/// period resolved to a first and a last moment.
pub fn vesting_between(self: ScheduledGrant, start: Int, end: Int) -> Grant {
  Grant {
    beneficiary: self.beneficiary,
    grantor: self.grantor,
    start,
    end,
    total: self.total,
  }
}
// #endregion scheduled-grant
