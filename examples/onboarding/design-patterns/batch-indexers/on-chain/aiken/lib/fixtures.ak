//// Test-only values: an order book, a buyer, a treasury, orders, and the
//// outputs that fill them. Only tests use them, so none of it reaches the
//// chain.

use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, Input, NoDatum, Output, OutputReference}
use order_book.{Order, fee_per_order}

/// The buyer's key.
pub const owner_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

/// Where the buyer wants their tokens.
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

pub const stranger: Address =
  Address {
    payment_credential: VerificationKey(stranger_key),
    stake_credential: None,
  }

/// Where the protocol's fees go.
pub const treasury: Address =
  Address {
    payment_credential: VerificationKey(
      #"00000000000000000000000000000000000000000000000000000003",
    ),
    stake_credential: None,
  }

/// Stands in for the order book's script hash, which the tests cannot compute.
pub const book_hash: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ff"

/// Another book paying the same treasury.
pub const other_book_hash: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ee"

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

/// The book's address.
pub const book: Address =
  Address { payment_credential: Script(book_hash), stake_credential: None }

/// `count` orders of 10 ADA each, locked at the order book, numbered from 0.
pub fn open_orders(count: Int) -> List<Input> {
  let datum: Data = an_order
  list.range(0, count - 1)
    |> list.map(
        fn(n) {
          Input {
            output_reference: order_ref(n),
            output: Output {
              address: book,
              value: assets.from_lovelace(10_000_000),
              datum: InlineDatum(datum),
              reference_script: None,
            },
          }
        },
      )
}

/// An input that is not an order: the seller's own funds.
pub fn wallet_input() -> Input {
  Input {
    output_reference: OutputReference {
      transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
      output_index: 99,
    },
    output: Output {
      address: stranger,
      value: assets.from_lovelace(100_000_000),
      datum: NoDatum,
      reference_script: None,
    },
  }
}

/// An output paying `quantity` tokens to `to`, tagged as paying the `n`th
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

/// The rest of the test order, back on the book: still owed `quantity`
/// tokens, holding `lovelace`.
pub fn remainder(quantity: Int, lovelace: Int) -> Output {
  let rest: Data = Order { ..an_order, quantity }
  Output {
    address: book,
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(rest),
    reference_script: None,
  }
}

/// The fee for `orders` orders, paid to the treasury on behalf of `for_book`.
pub fn fee(orders: Int, for_book: ScriptHash) -> Output {
  let tag: Data = for_book
  Output {
    address: treasury,
    value: assets.from_lovelace(fee_per_order * orders),
    datum: InlineDatum(tag),
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
