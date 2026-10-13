use aiken/interval.{Finite, NegativeInfinity, PositiveInfinity}
use aiken_design_patterns/validity_range_normalization.{
  Always, ClosedRange, FromNegInf, InvalidRange, ToPosInf, normalize_time_range,
}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  beneficiary_key, grant, grant_ref, grantor_key, payment, rest, spend, today,
  window,
}
use vesting.{Action, Claim, Clawback, Grant}

// #region with-library
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    let window = normalize_time_range(self.validity_range)
    when action is {
      Claim -> {
        let earliest = when window is {
          ClosedRange { lower, .. } -> lower
          ToPosInf { lower } -> lower
          FromNegInf { .. } | Always | InvalidRange -> fail
        }
        vesting.claim_ok(self, own_ref, grant, earliest)
      }
      Clawback -> {
        let latest = when window is {
          ClosedRange { upper, .. } -> upper
          FromNegInf { upper } -> upper
          ToPosInf { .. } | Always | InvalidRange -> fail
        }
        vesting.clawback_ok(self, own_ref, grant, latest)
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion with-library

// ---------------------------------------------------------------------------
// The library's normalization against the hand-written one in `by_hand.ak`.

test library_gives_every_encoding_of_a_window_one_form() {
  let expected = ClosedRange { lower: 5_000_001, upper: 5_999_999 }
  and {
    normalize_time_range(
      window(Finite(5_000_001), True, Finite(5_999_999), True),
    ) == expected,
    normalize_time_range(
      window(Finite(5_000_000), False, Finite(6_000_000), False),
    ) == expected,
  }
}

// The one difference: a window holding a single moment is refused, where
// `by_hand.ak` keeps it. The ledger never produces one, because a window runs
// from the start of one slot to the start of a later one.
test library_refuses_a_one_moment_window() {
  normalize_time_range(window(Finite(9), False, Finite(11), False)) == InvalidRange
}

test claim_ok_halfway() {
  let tx = spend(
    beneficiary_key,
    today(6_000_000, 6_001_000),
    [rest(5_000_000)],
  )
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

test claim_answers_the_same_for_the_same_window() {
  let claim = fn(range) {
    let tx = spend(beneficiary_key, range, [rest(5_999_999)])
    linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
  }
  and {
    claim(window(Finite(5_000_001), True, PositiveInfinity, True)),
    claim(window(Finite(5_000_000), False, PositiveInfinity, True)),
  }
}

test clawback_fails_one_lovelace_short_under_a_closed_upper_bound() fail {
  let tx = spend(
    grantor_key,
    window(NegativeInfinity, True, Finite(6_000_000), True),
    [payment(4_999_999, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_ok_under_todays_encoding() {
  let tx = spend(
    grantor_key,
    window(NegativeInfinity, True, Finite(6_000_000), False),
    [payment(4_999_999, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_fails_without_an_upper_bound() fail {
  let tx = spend(
    grantor_key,
    window(Finite(0), True, PositiveInfinity, True),
    [],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}
