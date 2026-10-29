use cardano/address.{Address, Script}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  beneficiary, donation_ref, donations, other_pool_hash, payment, pool_hash,
  restaked,
}
use sweep

// The obvious pool: every donation it holds checks the whole sweep for itself.
//
// Sweep ten donations and this handler runs ten times, and each run walks
// every input and every output of the transaction. Nothing it computes changes
// from one run to the next.
// #region naive
validator pool(beneficiary: Address) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    // Find the donation being spent, to learn the pool's own hash.
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
    expect Script(own_hash) = own_input.output.address.payment_credential
    // Then check the whole transaction. Every other donation does the same.
    sweep.is_paid(self, own_hash, beneficiary)
  }

  else(_) {
    fail
  }
}

// #endregion naive

test sweep_ok_when_the_beneficiary_is_paid_in_full() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
  }
  pool.spend(beneficiary, None, Void, donation_ref(0), tx)
}

test sweep_fails_when_the_beneficiary_is_paid_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 29_999_999, pool_hash)],
  }
  pool.spend(beneficiary, None, Void, donation_ref(0), tx)
}

// The beneficiary's key, but a stake credential the sweeper picked.
test sweep_fails_when_the_stake_credential_is_swapped() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(restaked, 30_000_000, pool_hash)],
  }
  pool.spend(beneficiary, None, Void, donation_ref(0), tx)
}

// A payment tagged for another pool does not count for this one.
test sweep_fails_when_the_payment_is_tagged_for_another_pool() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, other_pool_hash)],
  }
  pool.spend(beneficiary, None, Void, donation_ref(0), tx)
}
