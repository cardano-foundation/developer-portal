use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken_design_patterns/merkelized_validator.{
  ComputationRedeemer, ValidationRedeemer,
}
use cardano/address.{Script}
use cardano/transaction.{Redeemer, ScriptPurpose, Withdraw}
use fixtures
use voucher.{QuoteInput}

// #region delegation
/// Check the script purpose as well as the raw redeemer at the hinted position.
fn withdrawal_redeemer(
  hash: ScriptHash,
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  index: Int,
) -> Data {
  let Pair(purpose, data) = list.expect_at(redeemers, index)
  expect purpose == Withdraw(Script(hash))
  data
}

pub fn computed_price(
  wanted: QuoteInput,
  worker: ScriptHash,
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  index: Int,
) -> Int {
  expect io: ComputationRedeemer<QuoteInput, Int> = withdrawal_redeemer(
    worker,
    redeemers,
    index,
  )
  expect io.input_arg == wanted
  io.result
}

pub fn validated_code(
  wanted: ByteArray,
  worker: ScriptHash,
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  index: Int,
) -> Bool {
  expect io: ValidationRedeemer<ByteArray> = withdrawal_redeemer(
    worker,
    redeemers,
    index,
  )
  io.input_arg == wanted
}

// #endregion delegation

test correct_payload_under_the_wrong_script_purpose_is_not_a_computation() fail {
  let data: Data = fixtures.quotation(6_000_000)
  computed_price(
    voucher.quote_input(fixtures.a_voucher),
    fixtures.quote_hash,
    [Pair(transaction.Spend(fixtures.ref(0)), data)],
    0,
  ) == 6_000_000
}
