// #region vesting-imports
use aiken/crypto.{VerificationKeyHash}
use aiken/fuzz
use cardano/transaction.{OutputReference, Transaction}
use cocktail.{key_signed, valid_after}
use mocktail.{complete, invalid_before, mocktail_tx, required_signer_hash}
use mocktail/virgin_key_hash.{mock_pub_key_hash}
use mocktail/virgin_output_reference.{mock_utxo_ref}
// #endregion vesting-imports

// The vault from the earlier lectures, with a deadline added. Note that the
// validator never asks what time it is: it reads the window the transaction
// declared, which the ledger has already checked against the real slot.
// #region vesting
pub type VestingDatum {
  beneficiary: VerificationKeyHash,
  lock_until: Int,
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
      key_signed(self.extra_signatories, beneficiary)?,
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

const beneficiary: VerificationKeyHash = mock_pub_key_hash(1)

const stranger: VerificationKeyHash = mock_pub_key_hash(2)

const deadline: Int = 1_700_000_000_000

const dummy_ref: OutputReference = mock_utxo_ref(0, 0)

fn vesting_datum() -> Option<VestingDatum> {
  Some(VestingDatum { beneficiary, lock_until: deadline })
}

test claim_ok_after_the_deadline() {
  let tx =
    mocktail_tx()
      |> required_signer_hash(True, beneficiary)
      |> invalid_before(True, deadline + 1)
      |> complete()
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_fails_before_the_deadline() fail {
  let tx =
    mocktail_tx()
      |> required_signer_hash(True, beneficiary)
      |> invalid_before(True, deadline - 1)
      |> complete()
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_fails_without_a_deadline_bound() fail {
  let tx = mocktail_tx() |> required_signer_hash(True, beneficiary) |> complete()
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_fails_for_a_stranger() fail {
  let tx =
    mocktail_tx()
      |> required_signer_hash(True, stranger)
      |> invalid_before(True, deadline + 1)
      |> complete()
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}

test claim_ok_at_any_time_after_the_deadline(
  offset via fuzz.int_between(1, 1_000_000_000),
) {
  let tx =
    mocktail_tx()
      |> required_signer_hash(True, beneficiary)
      |> invalid_before(True, deadline + offset)
      |> complete()
  vesting.spend(vesting_datum(), Void, dummy_ref, tx)
}
// #endregion vesting-tests
