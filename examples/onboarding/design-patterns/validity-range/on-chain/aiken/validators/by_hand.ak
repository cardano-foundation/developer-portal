use aiken/collection/list
use aiken/fuzz
use aiken/interval.{
  Finite, Interval, IntervalBound, IntervalBoundType, NegativeInfinity,
  PositiveInfinity,
}
use cardano/transaction.{OutputReference, Transaction, ValidityRange}
use fixtures.{
  beneficiary_key, end, grant, grant_ref, grantor_key, payment, rest, spend,
  today, window,
}
use vesting.{Action, Claim, Clawback, Grant}

// #region normalized
/// A validity range reduced to what it means. Every bound is a moment the
/// transaction may happen at, included in the window, so no flag is needed.
pub type NormalizedTimeRange {
  /// From `lower` to `upper`, both included.
  ClosedRange { lower: Int, upper: Int }
  /// Any moment up to `upper`, included.
  FromNegInf { upper: Int }
  /// Any moment from `lower`, included.
  ToPosInf { lower: Int }
  /// Any moment at all.
  Always
  /// No moment at all: no transaction can be valid in this window.
  InvalidRange
}

// #endregion normalized

// #region normalize
/// Reduce a validity range to its normalized form. Equivalent ranges, however
/// they are encoded, come out the same.
pub fn normalize(range: ValidityRange) -> NormalizedTimeRange {
  let Interval { lower_bound, upper_bound } = range
  when (lower_bound.bound_type, upper_bound.bound_type) is {
    (NegativeInfinity, PositiveInfinity) -> Always
    (NegativeInfinity, Finite(upper)) ->
      FromNegInf { upper: last_moment(upper, upper_bound.is_inclusive) }
    (Finite(lower), PositiveInfinity) ->
      ToPosInf { lower: first_moment(lower, lower_bound.is_inclusive) }
    (Finite(lower), Finite(upper)) -> {
      let lower = first_moment(lower, lower_bound.is_inclusive)
      let upper = last_moment(upper, upper_bound.is_inclusive)
      if lower > upper {
        InvalidRange
      } else {
        ClosedRange { lower, upper }
      }
    }
    // A lower bound at +∞, or an upper bound at -∞: nothing fits.
    _ -> InvalidRange
  }
}

/// The first moment a lower bound lets in. Moments are whole milliseconds, so
/// a bound that excludes `bound` lets in `bound + 1` first.
fn first_moment(bound: Int, is_inclusive: Bool) -> Int {
  if is_inclusive {
    bound
  } else {
    bound + 1
  }
}

/// The last moment an upper bound lets in.
fn last_moment(bound: Int, is_inclusive: Bool) -> Int {
  if is_inclusive {
    bound
  } else {
    bound - 1
  }
}

// #endregion normalize

// #region by-hand
validator linear_vesting {
  spend(
    datum: Option<Grant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(grant) = datum
    let window = normalize(self.validity_range)
    when action is {
      // Paid by what has vested at the first moment the transaction can
      // happen, so the window must have one.
      Claim -> {
        let earliest = when window is {
          ClosedRange { lower, .. } -> lower
          ToPosInf { lower } -> lower
          FromNegInf { .. } | Always | InvalidRange -> fail
        }
        vesting.claim_ok(self, own_ref, grant, earliest)
      }
      // Limited by what is unvested at the last moment the transaction can
      // happen, so the window must have one.
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

// #endregion by-hand

// ---------------------------------------------------------------------------
// What normalizing changes. The shared checks are attacked in `naive.ak`.

test normalize_gives_every_encoding_of_a_window_one_form() {
  let expected = ClosedRange { lower: 5_000_001, upper: 5_999_999 }
  and {
    normalize(window(Finite(5_000_001), True, Finite(5_999_999), True)) == expected,
    normalize(window(Finite(5_000_000), False, Finite(5_999_999), True)) == expected,
    normalize(window(Finite(5_000_001), True, Finite(6_000_000), False)) == expected,
    normalize(window(Finite(5_000_000), False, Finite(6_000_000), False)) == expected,
  }
}

test normalize_reads_infinite_bounds_the_same_whatever_their_flag() {
  and {
    normalize(window(NegativeInfinity, True, PositiveInfinity, True)) == Always,
    normalize(window(NegativeInfinity, False, PositiveInfinity, False)) == Always,
    normalize(window(NegativeInfinity, False, Finite(10), True)) == FromNegInf {
      upper: 10,
    },
    normalize(window(Finite(10), True, PositiveInfinity, False)) == ToPosInf {
      lower: 10,
    },
  }
}

test normalize_keeps_a_one_moment_window() {
  normalize(window(Finite(9), False, Finite(11), False)) == ClosedRange {
    lower: 10,
    upper: 10,
  }
}

test normalize_refuses_windows_no_moment_fits() {
  and {
    normalize(window(Finite(10), False, Finite(11), False)) == InvalidRange,
    normalize(window(Finite(11), True, Finite(10), True)) == InvalidRange,
    normalize(window(PositiveInfinity, True, PositiveInfinity, True)) == InvalidRange,
    normalize(window(NegativeInfinity, True, NegativeInfinity, True)) == InvalidRange,
  }
}

test claim_ok_halfway() {
  let tx = spend(
    beneficiary_key,
    today(6_000_000, 6_001_000),
    [rest(5_000_000)],
  )
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

test claim_fails_when_it_keeps_one_lovelace_too_many() fail {
  let tx = spend(
    beneficiary_key,
    today(6_000_000, 6_001_000),
    [rest(4_999_999)],
  )
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

// The window the naive grant misreads: the same claim, allowed or refused
// alike in both encodings.
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

// A synthetic inclusive window: the amount must cover its included endpoint.
// This checks interval interpretation, not pre-Conway ledger admission.
test clawback_fails_one_lovelace_short_under_a_closed_upper_bound() fail {
  let tx = spend(
    grantor_key,
    window(NegativeInfinity, True, Finite(6_000_000), True),
    [payment(4_999_999, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_ok_in_full_under_a_closed_upper_bound() {
  let tx = spend(
    grantor_key,
    window(NegativeInfinity, True, Finite(6_000_000), True),
    [payment(5_000_000, grant_ref(0))],
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

// A claim with no lower bound could be happening at any time in the past.
test claim_fails_without_a_lower_bound() fail {
  let tx = spend(
    beneficiary_key,
    window(NegativeInfinity, True, Finite(end + 1_000), False),
    [],
  )
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

// A clawback with no upper bound could be happening at any time in the future.
test clawback_fails_without_an_upper_bound() fail {
  let tx = spend(
    grantor_key,
    window(Finite(0), True, PositiveInfinity, True),
    [],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test claim_fails_in_a_window_no_moment_fits() fail {
  let tx = spend(
    beneficiary_key,
    window(Finite(end + 2), True, Finite(end + 1), True),
    [],
  )
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

// Membership is the semantic oracle: normalization must preserve the set,
// including singletons, empty intervals, negative times and infinite bounds.
fn arbitrary_bound() -> Fuzzer<IntervalBound> {
  let kind = fuzz.either(
    fuzz.map(fuzz.int(), Finite),
    fuzz.either(
      fuzz.constant(NegativeInfinity),
      fuzz.constant(PositiveInfinity),
    ),
  )
  fuzz.map2(kind, fuzz.bool(), IntervalBound)
}

fn nearby(bound: IntervalBoundType) -> List<Int> {
  when bound is {
    Finite(t) -> [t - 1, t, t + 1]
    _ -> []
  }
}

test normalization_preserves_membership(
  range via fuzz.map2(arbitrary_bound(), arbitrary_bound(), Interval),
) {
  let points = list.concat(
    [-1, 0, 1],
    list.concat(
      nearby(range.lower_bound.bound_type),
      nearby(range.upper_bound.bound_type),
    ),
  )
  list.all(
    points,
    fn(point) {
      let contained = when normalize(range) is {
        ClosedRange { lower, upper } -> lower <= point && point <= upper
        FromNegInf { upper } -> point <= upper
        ToPosInf { lower } -> lower <= point
        Always -> True
        InvalidRange -> False
      }
      contained == interval.contains(range, point)
    },
  )
}

test equivalent_finite_encodings_have_one_form(
  bounds via fuzz.both(fuzz.int(), fuzz.int()),
) {
  let (lower, upper) = bounds
  let expected = normalize(window(Finite(lower), True, Finite(upper), True))
  and {
    normalize(window(Finite(lower - 1), False, Finite(upper), True)) == expected,
    normalize(window(Finite(lower), True, Finite(upper + 1), False)) == expected,
    normalize(window(Finite(lower - 1), False, Finite(upper + 1), False)) == expected,
  }
}

test a_changed_endpoint_is_not_just_an_equivalent_encoding() {
  and {
    normalize(window(NegativeInfinity, True, Finite(10), True)) == FromNegInf {
      upper: 10,
    },
    normalize(window(NegativeInfinity, True, Finite(10), False)) == FromNegInf {
      upper: 9,
    },
  }
}

test every_singleton_encoding_keeps_its_member() {
  let encodings = [
    window(Finite(10), True, Finite(10), True),
    window(Finite(9), False, Finite(10), True),
    window(Finite(10), True, Finite(11), False),
    window(Finite(9), False, Finite(11), False),
  ]
  list.all(
    encodings,
    fn(range) {
      interval.contains(range, 10) && normalize(range) == ClosedRange {
        lower: 10,
        upper: 10,
      }
    },
  )
}
