use aiken/collection/list
use aiken/interval.{Finite, NegativeInfinity, PositiveInfinity}
use aiken_design_patterns/validity_range_normalization.{normalize_time_range}
use by_hand.{Always, ClosedRange, FromNegInf, InvalidRange, ToPosInf, normalize}
use cardano/address.{VerificationKey}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  beneficiary_key, end, grant_ref, grantor_key, payment, rest_of, scheduled,
  spend_scheduled, start, stranger_key, today, window,
}
use schedule.{ScheduledGrant}
use vesting.{Action, Claim, Clawback}

// #region scheduled
validator scheduled_vesting {
  spend(
    datum: Option<ScheduledGrant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(scheduled) = datum
    // The period, in whatever encoding the grantor wrote it.
    let vests = when normalize(scheduled.period) is {
      // Linear, from the first moment to the last.
      ClosedRange { lower, upper } ->
        Some(schedule.vesting_between(scheduled, lower, upper))
      // No start: a cliff. Nothing vests before the last moment, all of it
      // vests then.
      FromNegInf { upper } ->
        Some(schedule.vesting_between(scheduled, upper, upper))
      // Protocol policy: these periods vest nothing and allow a refund.
      // This policy is separate from interval normalization.
      ToPosInf { .. } |
      Always |
      InvalidRange -> None
    }
    let window = normalize(self.validity_range)
    when action is {
      Claim -> {
        // A grant that never vests has nothing to claim.
        expect Some(grant) = vests
        let earliest = when window is {
          ClosedRange { lower, .. } -> lower
          ToPosInf { lower } -> lower
          FromNegInf { .. } | Always | InvalidRange -> fail
        }
        vesting.claim_ok(self, own_ref, grant, earliest)
      }
      Clawback ->
        when vests is {
          Some(grant) -> {
            let latest = when window is {
              ClosedRange { upper, .. } -> upper
              FromNegInf { upper } -> upper
              ToPosInf { .. } | Always | InvalidRange -> fail
            }
            vesting.clawback_ok(self, own_ref, grant, latest)
          }
          // The refund policy needs only authorization, not a time bound or
          // one-grant restriction. There is no beneficiary payment to share.
          None -> vesting.signed_by(self, VerificationKey(scheduled.grantor))
        }
    }
  }

  else(_) {
    fail
  }
}

// #endregion scheduled

// ---------------------------------------------------------------------------
// Every encoding of the same period vests the same way.

test claim_answers_the_same_for_every_encoding_of_the_period() {
  let claim_leaves = fn(period, lovelace) {
    let datum = scheduled(period)
    let tx = spend_scheduled(
      datum,
      beneficiary_key,
      today(6_000_000, 6_001_000),
      [rest_of(datum, lovelace)],
    )
    scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
  }
  let periods = [
    window(Finite(start), True, Finite(end), True),
    window(Finite(start - 1), False, Finite(end), True),
    window(Finite(start), True, Finite(end + 1), False),
    window(Finite(start - 1), False, Finite(end + 1), False),
  ]
  and {
    list.all(periods, fn(period) { claim_leaves(period, 5_000_000) }),
    list.all(periods, fn(period) { !claim_leaves(period, 4_999_999) }),
  }
}

// A cliff: the grant the naive version locks for good.

test claim_fails_before_the_cliff() fail {
  let datum = scheduled(window(NegativeInfinity, True, Finite(end), True))
  let tx = spend_scheduled(
    datum,
    beneficiary_key,
    today(end - 1_000, end),
    [rest_of(datum, 1)],
  )
  scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
}

test claim_ok_takes_everything_at_the_cliff() {
  let datum = scheduled(window(NegativeInfinity, True, Finite(end), True))
  let tx = spend_scheduled(datum, beneficiary_key, today(end, end + 1_000), [])
  scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
}

test clawback_ok_takes_everything_before_the_cliff() {
  let datum = scheduled(window(NegativeInfinity, True, Finite(end), True))
  let tx = spend_scheduled(datum, grantor_key, today(0, end), [])
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}

test clawback_fails_short_after_the_cliff() fail {
  let datum = scheduled(window(NegativeInfinity, True, Finite(end), True))
  let tx = spend_scheduled(
    datum,
    grantor_key,
    today(0, end + 1),
    [payment(fixtures.grant.total - 1, grant_ref(0))],
  )
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}

// Our policy for a period with no end: nothing vests and the grantor can refund.

test claim_fails_when_the_period_never_ends() fail {
  let datum = scheduled(window(Finite(start), True, PositiveInfinity, True))
  let tx = spend_scheduled(
    datum,
    beneficiary_key,
    today(end * 10, end * 10 + 1_000),
    [rest_of(datum, 1)],
  )
  scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
}

test clawback_ok_takes_everything_when_the_period_never_ends() {
  let datum = scheduled(window(Finite(start), True, PositiveInfinity, True))
  let tx = spend_scheduled(
    datum,
    grantor_key,
    today(end * 10, end * 10 + 1),
    [],
  )
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}

test clawback_fails_unsigned_when_the_period_never_ends() fail {
  let datum = scheduled(window(Finite(start), True, PositiveInfinity, True))
  let tx = spend_scheduled(datum, stranger_key, today(0, 1), [])
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}

// A period holding one moment is a cliff written as a closed period. The
// hand-written normalization keeps it. The library's refuses it, and the grant
// would read it as never vesting: with a period from a datum, that difference
// decides who gets the funds.
test a_one_moment_period_is_a_cliff_by_hand_and_invalid_with_the_library() {
  let period = window(Finite(end), True, Finite(end), True)
  and {
    normalize(period) == ClosedRange { lower: end, upper: end },
    normalize_time_range(period) == validity_range_normalization.InvalidRange,
  }
}

test claim_ok_at_a_one_moment_period() {
  let datum = scheduled(window(Finite(end), True, Finite(end), True))
  let tx = spend_scheduled(datum, beneficiary_key, today(end, end + 1_000), [])
  scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
}

test singleton_cliff_rejects_underpayment_after_it_vests() fail {
  let datum = scheduled(window(Finite(end), True, Finite(end), True))
  let tx = spend_scheduled(
    datum,
    grantor_key,
    today(end, end + 1_000),
    [payment(fixtures.grant.total - 1, grant_ref(0))],
  )
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}

test refund_policy_covers_unbounded_and_empty_periods() {
  let periods = [
    window(Finite(start), True, PositiveInfinity, True),
    window(NegativeInfinity, False, PositiveInfinity, False),
    window(Finite(end), False, Finite(end), True),
    window(Finite(end), True, Finite(start), True),
    window(PositiveInfinity, True, PositiveInfinity, True),
    window(NegativeInfinity, True, NegativeInfinity, True),
  ]
  list.all(
    periods,
    fn(period) {
      let datum = scheduled(period)
      let window = window(NegativeInfinity, True, PositiveInfinity, True)
      let tx = spend_scheduled(datum, grantor_key, window, [])
      and {
        scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx),
        !scheduled_vesting.spend(
          Some(datum),
          Clawback,
          grant_ref(0),
          Transaction { ..tx, extra_signatories: [stranger_key] },
        ),
      }
    },
  )
}

test refund_policy_allows_multiple_grants_without_a_time_bound() {
  let datum = scheduled(window(NegativeInfinity, True, PositiveInfinity, True))
  let first = fixtures.scheduled_input(datum)
  let second = transaction.Input { ..first, output_reference: grant_ref(1) }
  let tx = Transaction {
    ..spend_scheduled(
      datum,
      grantor_key,
      window(NegativeInfinity, True, PositiveInfinity, True),
      [],
    ),
    inputs: [first, second],
  }
  and {
    scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx),
    scheduled_vesting.spend(Some(datum), Clawback, grant_ref(1), tx),
  }
}
