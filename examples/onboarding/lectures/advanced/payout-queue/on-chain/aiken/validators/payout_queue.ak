// #region imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{from_lovelace}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #endregion imports

// The payout queue as first written: correct, and it walks the whole
// transaction once for every payout it releases. The Advanced lecture
// "Optimization" measures it and then makes it cheaper three times.

// #region queue
/// One debt: who the treasury owes, and how much.
pub type Payout {
  recipient: VerificationKeyHash,
  amount: Int,
}

validator payout_queue {
  spend(
    datum: Option<Payout>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(Payout { recipient, amount }) = datum
    let position = position_of(self.inputs, own_ref)
    expect Some(payment) = list.at(self.outputs, position)
    and {
      (payment.address.payment_credential == VerificationKey(recipient))?,
      (assets.lovelace_of(payment.value) >= amount)?,
    }
  }

  else(_) {
    fail
  }
}

/// Where this UTxO sits among the transaction's inputs.
fn position_of(inputs: List<Input>, own_ref: OutputReference) -> Int {
  when inputs is {
    [] -> fail @"the UTxO being spent is not among the inputs"
    [input, ..rest] ->
      if input.output_reference == own_ref {
        0
      } else {
        1 + position_of(rest, own_ref)
      }
  }
}

// #endregion queue

// #region tests
// The script's own hash. 28 bytes, like any hash.
const script_hash: ByteArray =
  #"000000000000000000000000000000000000000000000000000000ff"

// The address every queued payout is locked at.
const script_address: Address =
  Address { payment_credential: Script(script_hash), stake_credential: None }

// Two people the treasury owes.
const alice: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const bob: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

/// The reference of the queued payout at position n.
fn queued_ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

/// A queued payout: a UTxO at the script's address, holding the debt in its datum.
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

/// A payment to somebody.
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

test releases_a_payout_that_is_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [queued(0, alice, 10_000_000)],
    outputs: [paid(alice, 10_000_000)],
  }
  payout_queue.spend(
    Some(Payout { recipient: alice, amount: 10_000_000 }),
    Void,
    queued_ref(0),
    tx,
  )
}

test refuses_a_payment_that_is_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [queued(0, alice, 10_000_000)],
    outputs: [paid(alice, 9_000_000)],
  }
  payout_queue.spend(
    Some(Payout { recipient: alice, amount: 10_000_000 }),
    Void,
    queued_ref(0),
    tx,
  )
}

test refuses_a_payment_to_somebody_else() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [queued(0, alice, 10_000_000)],
    outputs: [paid(bob, 10_000_000)],
  }
  payout_queue.spend(
    Some(Payout { recipient: alice, amount: 10_000_000 }),
    Void,
    queued_ref(0),
    tx,
  )
}

test two_payouts_take_their_two_payments() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [queued(0, alice, 10_000_000), queued(1, bob, 4_000_000)],
    outputs: [paid(alice, 10_000_000), paid(bob, 4_000_000)],
  }
  and {
    payout_queue.spend(
      Some(Payout { recipient: alice, amount: 10_000_000 }),
      Void,
      queued_ref(0),
      tx,
    ),
    payout_queue.spend(
      Some(Payout { recipient: bob, amount: 4_000_000 }),
      Void,
      queued_ref(1),
      tx,
    ),
  }
}

// Two payouts to the same person, and one payment for both of them.
test two_payouts_cannot_share_one_payment() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [queued(0, alice, 10_000_000), queued(1, alice, 10_000_000)],
    outputs: [paid(alice, 10_000_000)],
  }
  and {
    payout_queue.spend(
      Some(Payout { recipient: alice, amount: 10_000_000 }),
      Void,
      queued_ref(0),
      tx,
    ),
    payout_queue.spend(
      Some(Payout { recipient: alice, amount: 10_000_000 }),
      Void,
      queued_ref(1),
      tx,
    ),
  }
}

// #endregion tests

// #region measure
/// The person owed the payout at position n.
fn person(n: Int) -> VerificationKeyHash {
  if n % 2 == 0 {
    alice
  } else {
    bob
  }
}

/// A release of `count` queued payouts: every payout is paid by the output
/// sitting at the same position.
fn release_of(count: Int) -> Transaction {
  let positions = list.range(0, count - 1)
  Transaction {
    ..transaction.placeholder,
    inputs: list.map(positions, fn(n) { queued(n, person(n), 10_000_000) }),
    outputs: list.map(positions, fn(n) { paid(person(n), 10_000_000) }),
  }
}

/// Every handler the chain runs for that release: the spend handler, once per
/// queued payout.
fn run_release(tx: Transaction) -> Bool {
  list.indexed_foldr(
    tx.inputs,
    True,
    fn(n, _input, rest) {
      and {
        payout_queue.spend(
          Some(Payout { recipient: person(n), amount: 10_000_000 }),
          Void,
          queued_ref(n),
          tx,
        ),
        rest,
      }
    },
  )
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

// #endregion measure

// #region bench
fn release_sized(size: Int) -> Fuzzer<Transaction> {
  fn(prng) { Some((prng, release_of(size))) }
}

bench release(tx: Transaction via release_sized) {
  run_release(tx)
}
// #endregion bench
