use cardano/transaction.{OutputReference, Transaction}
use fixtures.{member_key, spend_after, spend_before, terms}
use lockups.{Terms}

// #region lockup-raw
/// The same lock-up, with its terms as the parameter itself: no hash, no
/// redeemer.
validator lockup_raw(terms: Terms) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    lockups.unlocked(self, terms.owner, terms.unlock_at)
  }

  else(_) {
    fail
  }
}

// #endregion lockup-raw

test withdraw_ok_after_the_unlock_date() {
  lockup_raw.spend(terms, None, Void, fixtures.ref(0), spend_after(member_key))
}

test withdraw_fails_before_the_unlock_date() fail {
  lockup_raw.spend(terms, None, Void, fixtures.ref(0), spend_before(member_key))
}
