//// A buy order, the checks that fill it, and the protocol's fee, shared by
//// every version of the book in this project. The order and its checks are
//// the ones from the UTxO indexers example. What is new is the fee, which
//// depends on the whole batch.

use aiken/collection/list
use aiken/collection/pairs
use aiken/crypto.{ScriptHash}
use cardano/address.{Address, Credential, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}

/// What a buyer locks their ADA with: the token they want, how many, and where
/// to deliver them.
pub type Order {
  owner: Address,
  policy_id: PolicyId,
  asset_name: AssetName,
  quantity: Int,
}

/// How many of the ordered token `output` delivers for the order locked at
/// `own_ref`, or `None` if it is not a delivery for that order.
///
/// A delivery pays the owner's exact address, holds nothing but ADA and the
/// token ordered, carries no reference script, and is tagged with the order's
/// own output reference, so it counts for no other order.
pub fn delivered(
  order: Order,
  own_ref: OutputReference,
  output: Output,
) -> Option<Int> {
  let tag: Data = own_ref
  if and {
    output.address == order.owner,
    output.reference_script == None,
    output.datum == InlineDatum(tag),
  } {
    when assets.flatten(assets.without_lovelace(output.value)) is {
      [(policy_id, asset_name, quantity)] ->
        if policy_id == order.policy_id && asset_name == order.asset_name {
          Some(quantity)
        } else {
          None
        }
      _ -> None
    }
  } else {
    None
  }
}

/// Whether `output` fills the whole order locked at `own_ref`.
pub fn is_filled_by(
  order: Order,
  own_ref: OutputReference,
  output: Output,
) -> Bool {
  when delivered(order, own_ref, output) is {
    Some(quantity) -> order.quantity > 0 && quantity >= order.quantity
    None -> False
  }
}

/// Whether `payment` and `remainder` fill part of the order spent from
/// `own_input`, and put the rest of it back on the book, keeping at least the
/// rest's share of the ADA.
pub fn is_partly_filled_by(
  order: Order,
  own_input: Output,
  own_ref: OutputReference,
  payment: Output,
  remainder: Output,
) -> Bool {
  expect Some(sent) = delivered(order, own_ref, payment)
  let rest = order.quantity - sent
  let rest_of_order: Data = Order { ..order, quantity: rest }
  and {
    sent > 0,
    rest > 0,
    remainder.address == own_input.address,
    assets.without_lovelace(remainder.value) == assets.zero,
    remainder.reference_script == None,
    remainder.datum == InlineDatum(rest_of_order),
    assets.lovelace_of(remainder.value) * order.quantity >= assets.lovelace_of(
      own_input.value,
    ) * rest,
  }
}

// #region fee
/// What the protocol charges for each order a batch fills, in lovelace.
pub const fee_per_order: Int = 1_000_000

/// Whether `output` pays the protocol its fee for a batch of `orders` orders
/// from the book `book`: at the treasury's exact address, tagged with the
/// book's hash, so one payment cannot count for two books.
pub fn pays_fee(
  output: Output,
  treasury: Address,
  book: ScriptHash,
  orders: Int,
) -> Bool {
  let tag: Data = book
  and {
    output.address == treasury,
    output.datum == InlineDatum(tag),
    assets.lovelace_of(output.value) >= fee_per_order * orders,
  }
}

// #endregion fee

// #region cancel
/// Whether the owner cancels the order, in a transaction that does not run
/// the book's coordinator. A cancelled order is not filled, so a coordinator
/// that met one would have to skip it, and an order the coordinator skips is
/// an order nobody checks.
pub fn cancels_alone(self: Transaction, order: Order, book: Credential) -> Bool {
  and {
    owner_signs(self, order),
    !pairs.has_key(self.withdrawals, book),
  }
}

// #endregion cancel

/// Whether the order's owner signed the transaction.
pub fn owner_signs(self: Transaction, order: Order) -> Bool {
  when order.owner.payment_credential is {
    VerificationKey(key) -> list.has(self.extra_signatories, key)
    Script(_) -> False
  }
}
