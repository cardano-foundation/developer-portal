// #region imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/bytearray
use aiken_design_patterns/merkelized_validator.{
  ComputationRedeemer, ValidationRedeemer,
}
use cardano/address.{Address}
use cardano/assets
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}
// #endregion imports

// #region types
pub type Price {
  sku: ByteArray,
  unit_price: Int,
}

/// Every version remembers the same purchase request in its datum.
pub type Voucher {
  owner: VerificationKeyHash,
  sku: ByteArray,
  units: Int,
  redemption_code: ByteArray,
}

pub type QuoteInput {
  sku: ByteArray,
  units: Int,
}

/// Worker redeemers share the library's public input/result data shape.
pub type QuoteIO =
  ComputationRedeemer<QuoteInput, Int>

pub type CodeIO =
  ValidationRedeemer<ByteArray>

pub type Action {
  Purchase { quote_redeemer: Int, code_redeemer: Int, payment_output: Int }
  Cancel
}

// #endregion types

// #region request
pub fn quote_input(voucher: Voucher) -> QuoteInput {
  QuoteInput { sku: voucher.sku, units: voucher.units }
}

pub fn owner_signs(voucher: Voucher, tx: Transaction) -> Bool {
  bytearray.length(voucher.owner) == 28 && list.has(
    tx.extra_signatories,
    voucher.owner,
  )
}

// #endregion request

// #region payment
/// Each payment satisfies one voucher only. The owner authorizes disposition
/// of any change; the merchant must receive at least the verified price.
pub fn pays_merchant(
  output: Output,
  merchant: Address,
  own_ref: OutputReference,
  price: Int,
) -> Bool {
  let tag: Data = own_ref
  and {
    price >= 2_000_000,
    output.address == merchant,
    output.reference_script == None,
    output.datum == InlineDatum(tag),
    assets.flatten(assets.without_lovelace(output.value)) == [],
    assets.lovelace_of(output.value) >= price,
  }
}
// #endregion payment
