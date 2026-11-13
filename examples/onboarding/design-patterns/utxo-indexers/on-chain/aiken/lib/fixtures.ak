//// Test-only values: an order book, a buyer, orders, and the outputs that fill
//// them. Only tests use them, so none of it reaches the chain.

use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, Input, NoDatum, Output, OutputReference}
use order_book.{Order}

/// The buyer's key.
pub const owner_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

/// Where the buyer wants their tokens: their key, and their own stake
/// credential.
pub const owner: Address =
  Address {
    payment_credential: VerificationKey(owner_key),
    stake_credential: Some(
      Inline(
        VerificationKey(
          #"00000000000000000000000000000000000000000000000000000011",
        ),
      ),
    ),
  }

/// Somebody else: the seller, or an attacker.
pub const stranger_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

/// The buyer's key under a stake credential somebody else chose.
pub const restaked: Address =
  Address {
    payment_credential: VerificationKey(owner_key),
    stake_credential: Some(Inline(VerificationKey(stranger_key))),
  }

/// Somebody else's address.
pub const stranger: Address =
  Address {
    payment_credential: VerificationKey(stranger_key),
    stake_credential: None,
  }

/// Stands in for the order book's script hash, which the tests cannot compute.
pub const book_hash: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ff"

/// The token every test order buys.
pub const token_policy: PolicyId =
  #"000000000000000000000000000000000000000000000000000000aa"

pub const token_name: AssetName = "TOKEN"

/// An order for 100 tokens, delivered to the buyer.
pub const an_order: Order =
  Order {
    owner,
    policy_id: token_policy,
    asset_name: token_name,
    quantity: 100,
  }

/// The reference of the `n`th order in a test transaction.
pub fn order_ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

/// `count` orders of 10 ADA each, locked at the order book, numbered from 0.
pub fn open_orders(count: Int) -> List<Input> {
  let datum: Data = an_order
  list.range(0, count - 1)
    |> list.map(
        fn(n) {
          Input {
            output_reference: order_ref(n),
            output: Output {
              address: Address {
                payment_credential: Script(book_hash),
                stake_credential: None,
              },
              value: assets.from_lovelace(10_000_000),
              datum: InlineDatum(datum),
              reference_script: None,
            },
          }
        },
      )
}

/// An input that is not an order: the seller's own funds.
pub fn wallet_input(n: Int) -> Input {
  Input {
    output_reference: OutputReference {
      transaction_id: #"1111111111111111111111111111111111111111111111111111111111111111",
      output_index: n,
    },
    output: Output {
      address: stranger,
      value: assets.from_lovelace(100_000_000),
      datum: NoDatum,
      reference_script: None,
    },
  }
}

/// An output paying `quantity` tokens to `to`, tagged as filling the `n`th
/// order.
pub fn fill(n: Int, to: Address, quantity: Int) -> Output {
  let tag: Data = order_ref(n)
  Output {
    address: to,
    value: assets.from_lovelace(2_000_000)
      |> assets.add(token_policy, token_name, quantity),
    datum: InlineDatum(tag),
    reference_script: None,
  }
}

/// Outputs filling the first `count` orders in full, in order.
pub fn fills(count: Int) -> List<Output> {
  list.range(0, count - 1) |> list.map(fn(n) { fill(n, owner, 100) })
}

/// The same fill with a junk token added, which the buyer did not ask for.
pub fn fill_with_junk(n: Int) -> Output {
  let output = fill(n, owner, 100)
  Output {
    ..output,
    value: assets.add(
      output.value,
      #"000000000000000000000000000000000000000000000000000000bb",
      "JUNK",
      1,
    ),
  }
}

/// The same fill with a reference script attached.
pub fn fill_with_script(n: Int) -> Output {
  Output {
    ..fill(n, owner, 100),
    reference_script: Some(
      #"000000000000000000000000000000000000000000000000000000cc",
    ),
  }
}

/// The rest of the test order, back on the book: still owed `quantity`
/// tokens, holding `lovelace`.
pub fn remainder(quantity: Int, lovelace: Int) -> Output {
  let rest: Data = Order { ..an_order, quantity }
  Output {
    address: Address {
      payment_credential: Script(book_hash),
      stake_credential: None,
    },
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(rest),
    reference_script: None,
  }
}

/// Change back to the seller.
pub const change: Output =
  Output {
    address: stranger,
    value: assets.from_lovelace(50_000_000),
    datum: NoDatum,
    reference_script: None,
  }
