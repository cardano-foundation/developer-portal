// #region imports
use aiken/collection/list
use cardano/address.{Address, VerificationKey}
use cardano/assets.{from_lovelace}
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}

// #endregion imports

// The third change: the walk stops as soon as the price is covered.

// #region swap
// The offer: who sold the locked asset, and the price in lovelace.
pub type SwapDatum {
  owner: Address,
  price: Int,
}

pub type SwapAction {
  Swap
  Cancel
}

validator swap {
  spend(
    datum: Option<SwapDatum>,
    redeemer: SwapAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(SwapDatum { owner, price }) = datum
    // #region swap-stop-early
    when redeemer is {
      Cancel -> {
        expect VerificationKey(owner_key) = owner.payment_credential
        list.has(self.extra_signatories, owner_key)
      }
      Swap -> is_paid(self.outputs, owner, own_ref, price)
    }
    // #endregion swap-stop-early
  }

  else(_) {
    fail
  }
}

// #endregion swap

// #region paid-to-stop-early
// Is the price covered? `left` is what is still owed. The walk stops with
// True as soon as it reaches zero, and with False if the outputs run out.
fn is_paid(
  outputs: List<Output>,
  owner: Address,
  own_ref: OutputReference,
  left: Int,
) -> Bool {
  when outputs is {
    [] -> False
    [output, ..rest] ->
      if output.address == owner {
        if marked_with(output, own_ref) {
          let left = left - assets.lovelace_of(output.value)
          left <= 0 || is_paid(rest, owner, own_ref, left)
        } else {
          is_paid(rest, owner, own_ref, left)
        }
      } else {
        is_paid(rest, owner, own_ref, left)
      }
  }
}

// #endregion paid-to-stop-early

// #region marked-with
// Is this output tagged with `tag` as its inline datum?
fn marked_with(output: Output, tag: Data) -> Bool {
  when output.datum is {
    InlineDatum(data) -> data == tag
    _ -> False
  }
}

// #endregion marked-with

// #region tests
// Two sellers. 28 bytes each, like any key hash.
const alice: ByteArray =
  #"00000000000000000000000000000000000000000000000000000001"

const bob: ByteArray =
  #"00000000000000000000000000000000000000000000000000000002"

fn wallet(key: ByteArray) -> Address {
  Address { payment_credential: VerificationKey(key), stake_credential: None }
}

// The reference of the locked offer number n. It is also that offer's tag.
fn offer_ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

// A payment of `amount` lovelace to `key`, tagged for offer number n.
fn payment(key: ByteArray, amount: Int, n: Int) -> Output {
  let tag: Data = offer_ref(n)
  Output {
    address: wallet(key),
    value: from_lovelace(amount),
    datum: InlineDatum(tag),
    reference_script: None,
  }
}

fn swap_with(outputs: List<Output>) -> Bool {
  swap.spend(
    Some(SwapDatum { owner: wallet(alice), price: 10_000_000 }),
    Swap,
    offer_ref(0),
    Transaction { ..transaction.placeholder, outputs },
  )
}

test accepts_one_payment() {
  swap_with([payment(alice, 10_000_000, 0)])
}

test accepts_a_payment_split_over_two_outputs() {
  swap_with([payment(alice, 6_000_000, 0), payment(alice, 4_000_000, 0)])
}

test refuses_a_payment_that_is_short() fail {
  swap_with([payment(alice, 9_000_000, 0)])
}

test refuses_a_payment_to_somebody_else() fail {
  swap_with([payment(bob, 10_000_000, 0)])
}

test refuses_a_payment_tagged_for_another_offer() fail {
  swap_with([payment(alice, 10_000_000, 1)])
}

test the_owner_can_cancel() {
  swap.spend(
    Some(SwapDatum { owner: wallet(alice), price: 10_000_000 }),
    Cancel,
    offer_ref(0),
    Transaction { ..transaction.placeholder, extra_signatories: [alice] },
  )
}

test nobody_else_can_cancel() fail {
  swap.spend(
    Some(SwapDatum { owner: wallet(alice), price: 10_000_000 }),
    Cancel,
    offer_ref(0),
    Transaction { ..transaction.placeholder, extra_signatories: [bob] },
  )
}

// #endregion tests

// #region measure
// A third seller, for the transactions that fill many offers.
const carol: ByteArray =
  #"00000000000000000000000000000000000000000000000000000003"

// The seller of offer number n.
fn seller(n: Int) -> ByteArray {
  when n % 3 is {
    0 -> alice
    1 -> bob
    _ -> carol
  }
}

// One transaction that takes `count` offers. Each offer costs 10 ADA and is
// paid in two outputs, both tagged with that offer's reference.
fn batch_of(count: Int) -> Transaction {
  let offers = list.range(0, count - 1)
  Transaction {
    ..transaction.placeholder,
    outputs: list.flat_map(
      offers,
      fn(n) {
        [payment(seller(n), 6_000_000, n), payment(seller(n), 4_000_000, n)]
      },
    ),
  }
}

// Every run the chain makes for that transaction: the spend handler, once per
// offer taken.
fn run_batch(tx: Transaction, count: Int) -> Bool {
  list.all(
    list.range(0, count - 1),
    fn(n) {
      swap.spend(
        Some(SwapDatum { owner: wallet(seller(n)), price: 10_000_000 }),
        Swap,
        offer_ref(n),
        tx,
      )
    },
  )
}

test ten_offers_are_taken() {
  run_batch(batch_of(10), 10)
}

test thirty_offers_are_taken() {
  run_batch(batch_of(30), 30)
}

// #endregion measure

// #region bench
fn batch_sized(size: Int) -> Fuzzer<(Transaction, Int)> {
  fn(prng) { Some((prng, (batch_of(size), size))) }
}

bench batch(input: (Transaction, Int) via batch_sized) {
  let (tx, count) = input
  run_batch(tx, count)
}
// #endregion bench
