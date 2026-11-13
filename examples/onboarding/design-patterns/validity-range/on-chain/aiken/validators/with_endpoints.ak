use aiken/interval.{Finite, NegativeInfinity, PositiveInfinity}
use cardano/transaction.{OutputReference, Transaction, ValidityRange}
use fixtures.{
  beneficiary_key, grant, grant_ref, grantor_key, payment, rest, spend, window,
}
use vesting.{Action, Claim, Clawback, Grant}

// #region endpoints
/// Read only the endpoint the action needs, honoring its flag. These helpers
/// are for the ledger's nonempty transaction window. They do not validate an
/// arbitrary datum interval or inspect the other bound.
pub fn earliest(range: ValidityRange) -> Int {
  let bound = range.lower_bound
  expect Finite(lower) = bound.bound_type
  if bound.is_inclusive {
    lower
  } else {
    lower + 1
  }
}

pub fn latest(range: ValidityRange) -> Int {
  let bound = range.upper_bound
  expect Finite(upper) = bound.bound_type
  if bound.is_inclusive {
    upper
  } else {
    upper - 1
  }
}

// #endregion endpoints

// #region with-endpoints
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    when action is {
      Claim ->
        vesting.claim_ok(self, own_ref, grant, earliest(self.validity_range))
      Clawback ->
        vesting.clawback_ok(self, own_ref, grant, latest(self.validity_range))
    }
  }

  else(_) {
    fail
  }
}

// #endregion with-endpoints

test equivalent_lower_bounds_allow_the_same_claim() {
  let claim = fn(range) {
    linear_vesting.spend(
      Some(grant),
      Claim,
      grant_ref(0),
      spend(beneficiary_key, range, [rest(5_999_999)]),
    )
  }
  and {
    claim(window(Finite(5_000_001), True, PositiveInfinity, True)),
    claim(window(Finite(5_000_000), False, PositiveInfinity, False)),
  }
}

test equivalent_upper_bounds_allow_the_same_clawback() {
  let clawback = fn(range) {
    linear_vesting.spend(
      Some(grant),
      Clawback,
      grant_ref(0),
      spend(grantor_key, range, [payment(5_000_000, grant_ref(0))]),
    )
  }
  and {
    clawback(window(NegativeInfinity, True, Finite(6_000_000), True)),
    clawback(window(NegativeInfinity, False, Finite(6_000_001), False)),
  }
}

test inclusive_upper_bound_rejects_one_lovelace_short() fail {
  linear_vesting.spend(
    Some(grant),
    Clawback,
    grant_ref(0),
    spend(
      grantor_key,
      window(NegativeInfinity, True, Finite(6_000_000), True),
      [payment(4_999_999, grant_ref(0))],
    ),
  )
}

test missing_lower_bound_is_an_explicit_rejection() fail {
  earliest(window(NegativeInfinity, True, Finite(10), False)) == 0
}

test missing_upper_bound_is_an_explicit_rejection() fail {
  latest(window(Finite(0), True, PositiveInfinity, True)) == 0
}

test reading_one_endpoint_does_not_validate_the_other() {
  // This cannot be the validity window of an admitted transaction. A datum
  // interval needs a separate emptiness check or full normalization.
  let empty = window(Finite(10), True, Finite(0), True)
  earliest(empty) == 10 && latest(empty) == 0
}
