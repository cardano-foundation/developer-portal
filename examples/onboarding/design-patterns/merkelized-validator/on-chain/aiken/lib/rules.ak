use aiken/collection/list
use aiken/primitive/bytearray
use voucher.{Price, QuoteInput}

// #region quote
/// The deployed catalogue is embedded in the script, not supplied by a buyer.
pub fn quote(catalogue: List<Price>, input: QuoteInput) -> Int {
  expect bytearray.length(input.sku) == 32
  expect input.units > 0 && input.units <= 1_000
  let price = list.expect_find(catalogue, fn(price) { price.sku == input.sku })
  expect price.unit_price >= 2_000_000
  price.unit_price * input.units
}

// #endregion quote

// #region code
/// Codes are public eligibility categories, not secret passwords or signatures.
pub fn code_allowed(codes: List<ByteArray>, code: ByteArray) -> Bool {
  bytearray.length(code) == 32 && list.has(codes, code)
}
// #endregion code
