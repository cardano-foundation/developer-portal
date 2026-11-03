use aiken/interval.{Finite, NegativeInfinity, PositiveInfinity}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  beneficiary_key, end, grant_ref, grantor_key, rest_of, scheduled,
  spend_scheduled, start, today, window,
}
use naive.{earliest, latest}
use schedule.{ScheduledGrant}
use vesting.{Action, Claim, Clawback}

// The grant with its period in the datum, read the obvious way: a period has a
// start and an end, so both bounds must be finite. Times in the transaction's
// own window are read as in `naive.ak`.
// #region scheduled-naive
validator scheduled_vesting {
  spend(
    datum: Option<ScheduledGrant>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(scheduled) = datum
    expect Finite(start) = scheduled.period.lower_bound.bound_type
    expect Finite(end) = scheduled.period.upper_bound.bound_type
    let grant = schedule.vesting_between(scheduled, start, end)
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

// #endregion scheduled-naive

test claim_ok_halfway_through_a_closed_period() {
  let datum = scheduled(window(Finite(start), True, Finite(end), True))
  let tx = spend_scheduled(
    datum,
    beneficiary_key,
    today(6_000_000, 6_001_000),
    [rest_of(datum, 5_000_000)],
  )
  scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
}

test naive_answers_differently_for_equivalent_finite_periods() {
  let claim = fn(period) {
    let datum = scheduled(period)
    let tx = spend_scheduled(
      datum,
      beneficiary_key,
      today(6_000_000, 6_001_000),
      [rest_of(datum, 5_000_000)],
    )
    scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
  }
  and {
    claim(window(Finite(start), True, Finite(end), True)),
    !claim(window(Finite(start), True, Finite(end + 1), False)),
  }
}

// ---------------------------------------------------------------------------
// A period with no start is a cliff: nothing vests until its end, everything
// vests then. Nothing stopped the grantor from writing one, and the naive grant
// can never spend it again: every claim and every clawback fails. The funds
// are locked for good.

test naive_refuses_every_claim_on_a_cliff_grant() fail {
  let datum = scheduled(window(NegativeInfinity, True, Finite(end), True))
  let tx = spend_scheduled(datum, beneficiary_key, today(end, end + 1_000), [])
  scheduled_vesting.spend(Some(datum), Claim, grant_ref(0), tx)
}

test naive_refuses_every_clawback_on_a_cliff_grant() fail {
  let datum = scheduled(window(NegativeInfinity, True, Finite(end), True))
  let tx = spend_scheduled(datum, grantor_key, today(0, start), [])
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}

// A period with no end never finishes vesting. The naive grant cannot give
// that a meaning either, so the grantor cannot take the funds back.
test naive_refuses_every_clawback_on_a_grant_that_never_ends() fail {
  let datum = scheduled(window(Finite(start), True, PositiveInfinity, True))
  let tx = spend_scheduled(datum, grantor_key, today(0, start), [])
  scheduled_vesting.spend(Some(datum), Clawback, grant_ref(0), tx)
}
