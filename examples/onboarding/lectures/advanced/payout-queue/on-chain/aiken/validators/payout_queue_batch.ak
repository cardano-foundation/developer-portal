// #region batch-imports
use aiken/collection/list
use aiken/collection/pairs
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Credential, Script, VerificationKey}
use cardano/assets.{from_lovelace}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #endregion batch-imports

// The payout queue with the whole queue checked once, in a withdrawal of zero
// ADA. The second of the three changes the Advanced lecture "Optimization"
// measures.

// One debt: who the treasury owes, and how much.
pub type Payout {
  recipient: VerificationKeyHash,
  amount: Int,
}

validator payout_queue {
  // #region spend-batch
  spend(
    _datum: Option<Payout>,
    position: Int,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) = list.at(self.inputs, position)
    and {
      (own_input.output_reference == own_ref)?,
      pairs.has_key(
        self.withdrawals,
        own_input.output.address.payment_credential,
      )?,
    }
  }

  // #endregion spend-batch
  // #region withdraw-batch
  withdraw(_redeemer: Data, account: Credential, self: Transaction) {
    every_payout_is_paid(self.inputs, self.outputs, account)
  }

  // #endregion withdraw-batch
  else(_) {
    fail
  }
}

// #region every-payout-is-paid
// Whether every queued payout among the inputs is paid by the output at the
// same position.
fn every_payout_is_paid(
  inputs: List<Input>,
  outputs: List<Output>,
  script: Credential,
) -> Bool {
  let positions = list.zip(inputs, outputs)
  and {
    (list.length(outputs) >= list.length(inputs))?,
    list.all(
      positions,
      fn(position) {
        let (input, payment) = position
        if input.output.address.payment_credential == script {
          pays(input, payment)
        } else {
          True
        }
      },
    )?,
  }
}

// Whether this output pays what the queued payout asks for.
fn pays(input: Input, payment: Output) -> Bool {
  expect InlineDatum(data) = input.output.datum
  expect Payout { recipient, amount } = data
  and {
    payment.address.payment_credential == VerificationKey(recipient),
    assets.lovelace_of(payment.value) >= amount,
  }
}

// #endregion every-payout-is-paid

// #region batch-tests
// The script's own hash. 28 bytes, like any hash.
const script_hash: ByteArray =
  #"000000000000000000000000000000000000000000000000000000ff"

// The credential the queued payouts are locked under, and the one the
// withdrawal of zero ADA is made under.
const script_credential: Credential = Script(script_hash)

// The address every queued payout is locked at.
const script_address: Address =
  Address { payment_credential: script_credential, stake_credential: None }

// Two people the treasury owes.
const alice: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const bob: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

// The reference of the queued payout at position n.
fn queued_ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

// A queued payout: a UTxO at the script's address, holding the debt in its datum.
fn queued(n: Int, recipient: VerificationKeyHash, amount: Int) -> Input {
  let datum: Data = Payout { recipient, amount }
  Input {
    output_reference: queued_ref(n),
    output: Output {
      address: script_address,
      value: from_lovelace(2_000_000),
      datum: InlineDatum(datum),
      reference_script: None,
    },
  }
}

// A payment to somebody.
fn paid(recipient: VerificationKeyHash, amount: Int) -> Output {
  Output {
    address: Address {
      payment_credential: VerificationKey(recipient),
      stake_credential: None,
    },
    value: from_lovelace(amount),
    datum: transaction.NoDatum,
    reference_script: None,
  }
}

// A transaction that takes zero ADA out of the script's reward account.
fn withdrawing(inputs: List<Input>, outputs: List<Output>) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs,
    outputs,
    withdrawals: [Pair(script_credential, 0)],
  }
}

test releases_a_payout_that_is_paid() {
  let tx = withdrawing(
    [queued(0, alice, 10_000_000)],
    [paid(alice, 10_000_000)],
  )
  and {
    payout_queue.withdraw(Void, script_credential, tx),
    payout_queue.spend(
      Some(Payout { recipient: alice, amount: 10_000_000 }),
      0,
      queued_ref(0),
      tx,
    ),
  }
}

test refuses_a_payment_that_is_short() fail {
  let tx = withdrawing([queued(0, alice, 10_000_000)], [paid(alice, 9_000_000)])
  payout_queue.withdraw(Void, script_credential, tx)
}

test refuses_a_payment_to_somebody_else() fail {
  let tx = withdrawing([queued(0, alice, 10_000_000)], [paid(bob, 10_000_000)])
  payout_queue.withdraw(Void, script_credential, tx)
}

// #region no-withdrawal-test
// The queue is checked in the withdrawal, so a transaction without one may
// spend nothing.
test refuses_a_release_without_the_withdrawal() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [queued(0, alice, 10_000_000)],
    outputs: [paid(alice, 10_000_000)],
  }
  payout_queue.spend(
    Some(Payout { recipient: alice, amount: 10_000_000 }),
    0,
    queued_ref(0),
    tx,
  )
}

// #endregion no-withdrawal-test
// The redeemer points at the other payout's input.
test refuses_a_position_that_points_elsewhere() fail {
  let tx = withdrawing(
    [queued(0, alice, 10_000_000), queued(1, bob, 4_000_000)],
    [paid(alice, 10_000_000), paid(bob, 4_000_000)],
  )
  payout_queue.spend(
    Some(Payout { recipient: alice, amount: 10_000_000 }),
    1,
    queued_ref(0),
    tx,
  )
}

test two_payouts_take_their_two_payments() {
  let tx = withdrawing(
    [queued(0, alice, 10_000_000), queued(1, bob, 4_000_000)],
    [paid(alice, 10_000_000), paid(bob, 4_000_000)],
  )
  and {
    payout_queue.withdraw(Void, script_credential, tx),
    payout_queue.spend(
      Some(Payout { recipient: alice, amount: 10_000_000 }),
      0,
      queued_ref(0),
      tx,
    ),
    payout_queue.spend(
      Some(Payout { recipient: bob, amount: 4_000_000 }),
      1,
      queued_ref(1),
      tx,
    ),
  }
}

// Two payouts to the same person, and one payment for both of them.
test two_payouts_cannot_share_one_payment() fail {
  let tx = withdrawing(
    [queued(0, alice, 10_000_000), queued(1, alice, 10_000_000)],
    [paid(alice, 10_000_000)],
  )
  payout_queue.withdraw(Void, script_credential, tx)
}

// #endregion batch-tests

// #region batch-measure
// The person owed the payout at position n.
fn person(n: Int) -> VerificationKeyHash {
  if n % 2 == 0 {
    alice
  } else {
    bob
  }
}

// A release of `count` queued payouts: every payout is paid by the output
// sitting at the same position.
fn release_of(count: Int) -> Transaction {
  let positions = list.range(0, count - 1)
  withdrawing(
    list.map(positions, fn(n) { queued(n, person(n), 10_000_000) }),
    list.map(positions, fn(n) { paid(person(n), 10_000_000) }),
  )
}

// Every handler the chain runs for that release: the withdrawal once, and the
// spend handler once per queued payout.
fn run_release(tx: Transaction) -> Bool {
  and {
    payout_queue.withdraw(Void, script_credential, tx),
    list.indexed_foldr(
      tx.inputs,
      True,
      fn(n, _input, rest) {
        and {
          payout_queue.spend(
            Some(Payout { recipient: person(n), amount: 10_000_000 }),
            n,
            queued_ref(n),
            tx,
          ),
          rest,
        }
      },
    ),
  }
}

test ten_payouts_are_released() {
  run_release(release_of(10))
}

test thirty_payouts_are_released() {
  run_release(release_of(30))
}

test sixty_payouts_are_released() {
  run_release(release_of(60))
}

// #endregion batch-measure

// #region batch-bench
fn release_sized(size: Int) -> Fuzzer<Transaction> {
  fn(prng) { Some((prng, release_of(size))) }
}

bench release(tx: Transaction via release_sized) {
  run_release(tx)
}

// #region check-bench
bench check_queue(tx: Transaction via release_sized) {
  every_payout_is_paid(tx.inputs, tx.outputs, script_credential)
}
// #endregion check-bench
// #endregion batch-bench
