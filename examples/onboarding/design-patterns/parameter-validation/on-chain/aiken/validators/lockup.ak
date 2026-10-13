use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{member_key, spend_after, spend_before, stranger_key, unlock_at}
use lockups

// #region lockup
/// A lock-up: whatever it holds goes to `owner`, after `unlock_at`. One
/// instance per member and per date, each with its own address.
validator lockup(unlock_at: Int, owner: VerificationKeyHash) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    lockups.unlocked(self, owner, unlock_at)
  }

  else(_) {
    fail
  }
}

// #endregion lockup

test withdraw_ok_after_the_unlock_date() {
  lockup.spend(
    unlock_at,
    member_key,
    None,
    Void,
    fixtures.ref(0),
    spend_after(member_key),
  )
}

test withdraw_fails_before_the_unlock_date() fail {
  lockup.spend(
    unlock_at,
    member_key,
    None,
    Void,
    fixtures.ref(0),
    spend_before(member_key),
  )
}

test withdraw_fails_for_anyone_but_the_owner() fail {
  lockup.spend(
    unlock_at,
    member_key,
    None,
    Void,
    fixtures.ref(0),
    spend_after(stranger_key),
  )
}
