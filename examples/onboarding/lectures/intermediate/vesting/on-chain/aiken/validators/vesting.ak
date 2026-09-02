// #region vesting-imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/fuzz
use aiken/interval.{Finite}
use cardano/transaction.{OutputReference, Transaction, ValidityRange}

// #endregion vesting-imports

// The vault from the earlier lectures, with a deadline added. Note that the
// validator never asks what time it is: it reads the window the transaction
// declared, which the ledger has already checked against the real slot.
// #region vesting
pub type VestingDatum {
  beneficiary: VerificationKeyHash,
  lock_until: Int,
}

// Reads the start of the window the transaction declared, and asks whether it
// is already past the deadline. A transaction with no start could be submitted
// at any moment, so it is refused.
fn valid_after(range: ValidityRange, lock_until: Int) -> Bool {
  when range.lower_bound.bound_type is {
    Finite(lower_bound) -> lower_bound > lock_until
    _ -> False
  }
}

validator vesting {
  spend(
    datum: Option<VestingDatum>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(VestingDatum { beneficiary, lock_until }) = datum
    and {
      list.has(self.extra_signatories, beneficiary)?,
      valid_after(self.validity_range, lock_until)?,
    }
  }

  else(_) {
    fail
  }
}

// #endregion vesting

// Tests.
// #region vesting-tests

const beneficiary: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

const deadline: Int = 1_700_000_000_000

const dummy_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

fn vesting_datum() -> Option<VestingDatum> {
  Some(VestingDatum { beneficiary, lock_until: deadline })
}

test claim_ok_after_the_deadline() {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [beneficiary],
    validity_range: interval.after(deadline + 1),
  }
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_fails_before_the_deadline() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [beneficiary],
    validity_range: interval.after(deadline - 1),
  }
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_fails_without_a_deadline_bound() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [beneficiary],
  }
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [stranger],
    validity_range: interval.after(deadline + 1),
  }
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_ok_at_any_time_after_the_deadline(
  offset via fuzz.int_between(1, 1_000_000_000),
) {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [beneficiary],
    validity_range: interval.after(deadline + offset),
  }
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}
// #endregion vesting-tests
