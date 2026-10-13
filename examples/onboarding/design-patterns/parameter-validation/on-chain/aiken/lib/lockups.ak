//// What every lock-up checks, whichever way it receives its parameters.

use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/interval
use cardano/transaction.{Transaction}

// #region unlocked
/// The owner signs, and the transaction happens after the unlock date: its
/// validity window starts after `unlock_at`, in POSIX milliseconds.
pub fn unlocked(
  self: Transaction,
  owner: VerificationKeyHash,
  unlock_at: Int,
) -> Bool {
  and {
    list.has(self.extra_signatories, owner),
    interval.is_entirely_after(self.validity_range, unlock_at),
  }
}

// #endregion unlocked

// #region terms
/// One member's lock-up terms, for programs where every member has their own
/// unlock date.
pub type Terms {
  owner: VerificationKeyHash,
  unlock_at: Int,
}
// #endregion terms
