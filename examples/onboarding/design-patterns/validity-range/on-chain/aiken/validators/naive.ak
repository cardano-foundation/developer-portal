use aiken/interval.{Finite, NegativeInfinity, PositiveInfinity}
use cardano/transaction.{OutputReference, Transaction, ValidityRange}
use fixtures.{
  beneficiary_key, end, grant, grant_input, grant_ref, grantor_key, paid_to,
  payment, rest, spend, start, stranger_key, today, window,
}
use vesting.{Action, Claim, Clawback, Grant}

// The obvious grant: it reads each bound straight out of the validity range,
// assuming the encoding the ledger produces today.
// #region naive
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

/// The first moment the transaction can happen. Today the ledger always
/// includes a finite lower bound in the window, so the bound is that moment.
pub fn earliest(range: ValidityRange) -> Int {
  expect Finite(lower) = range.lower_bound.bound_type
  lower
}

/// The last moment the transaction can happen. Today the ledger always
/// excludes a finite upper bound from the window, so the last moment is one
/// millisecond before it.
pub fn latest(range: ValidityRange) -> Int {
  expect Finite(upper) = range.upper_bound.bound_type
  upper - 1
}

// #endregion naive

// ---------------------------------------------------------------------------
// The shared checks, attacked. Every version of the grant runs the same ones,
// so they are tested here once. Windows use today's encoding.

// Halfway through, half has vested: 5 ADA claimed, 5 ADA back to the grant.
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

test claim_fails_without_the_beneficiary_signature() fail {
  let tx = spend(stranger_key, today(6_000_000, 6_001_000), [rest(5_000_000)])
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

test claim_fails_when_the_rest_changes_the_grant() fail {
  let changed = Grant { ..grant, end: end + 1_000_000 }
  let tx = spend(
    beneficiary_key,
    today(6_000_000, 6_001_000),
    [
      {
        let datum: Data = changed
        transaction.Output {
          ..rest(5_000_000),
          datum: transaction.InlineDatum(datum),
        }
      },
    ],
  )
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

test claim_ok_without_a_rest_once_fully_vested() {
  let tx = spend(beneficiary_key, today(end, end + 1_000), [])
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

test claim_fails_without_a_rest_before_the_end() fail {
  let tx = spend(beneficiary_key, today(end - 1_000, end), [])
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

// Two grants with the same datum, one rest meant to count for both.
test claim_fails_for_two_grants_at_once() fail {
  let tx = transaction.Transaction {
    ..spend(beneficiary_key, today(6_000_000, 6_001_000), [rest(5_000_000)]),
    inputs: [grant_input(0), grant_input(1)],
  }
  linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
}

// The window ends at 6,000,000 excluded, so 4,999,999 ms have vested at most:
// 4,999,999 lovelace to the beneficiary, 5,000,001 back to the grantor.
test clawback_ok_pays_what_has_vested() {
  let tx = spend(
    grantor_key,
    today(5_000_000, 6_000_000),
    [payment(4_999_999, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_fails_when_it_pays_one_lovelace_short() fail {
  let tx = spend(
    grantor_key,
    today(5_000_000, 6_000_000),
    [payment(4_999_998, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_fails_without_the_grantor_signature() fail {
  let tx = spend(
    stranger_key,
    today(5_000_000, 6_000_000),
    [payment(4_999_999, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

// The right amount at the right address, but no tag. Tagging binds the payment
// to this input; another contract must also check tags to avoid sharing it.
test clawback_fails_when_the_payment_is_not_tagged() fail {
  let tx = spend(
    grantor_key,
    today(5_000_000, 6_000_000),
    [paid_to(fixtures.beneficiary, 4_999_999)],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_fails_when_the_payment_is_tagged_for_another_grant() fail {
  let tx = spend(
    grantor_key,
    today(5_000_000, 6_000_000),
    [payment(4_999_999, grant_ref(1))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

test clawback_ok_takes_everything_before_the_start() {
  let tx = spend(grantor_key, today(0, start + 1), [])
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

// ---------------------------------------------------------------------------
// Where reading the bounds directly goes wrong. Every test below passes, and
// that is the problem: each one is a window the naive grant misreads.

// A synthetic inclusive interval includes 6,000,000. The naive code prices it
// one millisecond early. This is not a historical ledger exploit: pre-Conway
// upper-only contexts had an inclusive endpoint, but phase one still required
// slot < invalidHereafter. That extra context endpoint was not admissible.
test naive_lets_the_grantor_underpay_under_a_closed_upper_bound() {
  let tx = spend(
    grantor_key,
    window(NegativeInfinity, True, Finite(6_000_000), True),
    [payment(4_999_999, grant_ref(0))],
  )
  linear_vesting.spend(Some(grant), Clawback, grant_ref(0), tx)
}

// The same set of moments, written two ways: from 5,000,001 included, or from
// 5,000,000 excluded. The naive grant reads the second as starting one
// millisecond earlier, and refuses a claim the first encoding allows.
test naive_answers_differently_for_the_same_window() {
  let claim = fn(range) {
    let tx = spend(beneficiary_key, range, [rest(5_999_999)])
    linear_vesting.spend(Some(grant), Claim, grant_ref(0), tx)
  }
  and {
    claim(window(Finite(5_000_001), True, PositiveInfinity, True)),
    !claim(window(Finite(5_000_000), False, PositiveInfinity, True)),
  }
}
