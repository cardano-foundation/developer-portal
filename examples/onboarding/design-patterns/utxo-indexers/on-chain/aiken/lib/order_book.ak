//// A buy order, and the checks that fill it, shared by every version of the
//// order book in this project. Only *how each order finds its outputs*
//// changes from one validator to the next: a search in `naive.ak`, an index
//// in the other two.

use aiken/collection/list
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}

// #region order
/// What a buyer locks their ADA with: the token they want, how many, and where
/// to deliver them.
pub type Order {
  owner: Address,
  policy_id: PolicyId,
  asset_name: AssetName,
  quantity: Int,
}

// #endregion order

// #region action
/// What a spender wants to do with an order. A fill carries a hint about
/// where to look, and each indexed version of the book decides what that hint
/// is.
pub type Action<fill, partial> {
  /// Deliver all the tokens and take all the ADA. Anyone may.
  Fill(fill)
  /// Take the ADA back. Only the owner may.
  Cancel
  /// Deliver some of the tokens, take that share of the ADA, and put the rest
  /// of the order back on the book. Anyone may.
  PartialFill(partial)
}

// #endregion action

// #region hint
/// Where to look for an order and its outputs: the order among the inputs,
/// and its first output among the outputs.
pub type InputAndOutput {
  input_index: Int,
  output_index: Int,
}

// #endregion hint

// #region check
/// How many of the ordered token `output` delivers for the order locked at
/// `own_ref`, or `None` if it is not a delivery for that order.
///
/// A delivery pays the owner's exact address, stake credential included, and
/// holds nothing but ADA and the token ordered: no other tokens, and no
/// reference script. Its inline datum is the order's own output reference: no
/// two orders share one, so no output can count for two orders.
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

/// Whether `output` fills the whole order locked at `own_ref`. The order must
/// ask for a positive quantity, and the output deliver at least that much.
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

// #endregion check

// #region remainder
/// Whether `payment` and `remainder` fill part of the order spent from
/// `own_input`, and put the rest of it back on the book.
///
/// The payment delivers some of the tokens, but not all. The remainder goes
/// back to the order's own address, holds only ADA, and is the same order for
/// the tokens still owed. The seller takes at most its share of the ADA,
/// rounded in the buyer's favor.
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
    // kept / locked >= rest / ordered, without dividing.
    assets.lovelace_of(remainder.value) * order.quantity >= assets.lovelace_of(
      own_input.value,
    ) * rest,
  }
}

// #endregion remainder

// #region signed
/// Whether the order's owner signed the transaction. Only a key can sign, so
/// an order owned by a script address can never be cancelled.
pub fn owner_signs(self: Transaction, order: Order) -> Bool {
  when order.owner.payment_credential is {
    VerificationKey(key) -> list.has(self.extra_signatories, key)
    Script(_) -> False
  }
}
// #endregion signed
