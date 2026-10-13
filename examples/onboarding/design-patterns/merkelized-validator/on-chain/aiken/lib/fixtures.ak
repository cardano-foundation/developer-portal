use aiken_design_patterns/merkelized_validator.{
  ComputationRedeemer, ValidationRedeemer,
}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Spend, Transaction, Withdraw,
}
use voucher.{Action, Price, Purchase, QuoteInput, Voucher}

pub const owner = #"00000000000000000000000000000000000000000000000000000001"

pub const stranger = #"00000000000000000000000000000000000000000000000000000002"

pub const merchant =
  Address {
    payment_credential: VerificationKey(stranger),
    stake_credential: None,
  }

pub const quote_hash =
  #"00000000000000000000000000000000000000000000000000000011"

pub const code_hash =
  #"00000000000000000000000000000000000000000000000000000022"

pub const sku =
  #"0000000000000000000000000000000000000000000000000000000000000001"

pub const code =
  #"000000000000000000000000000000000000000000000000000000000000000a"

pub const catalogue = [Price { sku, unit_price: 3_000_000 }]

pub const codes = [code]

pub const a_voucher = Voucher { owner, sku, units: 2, redemption_code: code }

pub fn ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

pub fn action() -> Action {
  Purchase { quote_redeemer: 1, code_redeemer: 2, payment_output: 0 }
}

pub fn quotation(amount: Int) -> ComputationRedeemer<QuoteInput, Int> {
  ComputationRedeemer {
    input_arg: voucher.quote_input(a_voucher),
    result: amount,
  }
}

pub fn payment(n: Int, amount: Int) -> Output {
  let tag: Data = ref(n)
  Output {
    address: merchant,
    value: assets.from_lovelace(amount),
    datum: InlineDatum(tag),
    reference_script: None,
  }
}

pub fn purchase(amount: Int) -> Transaction {
  let quote_data: Data = quotation(amount)
  let code_data: Data = ValidationRedeemer { input_arg: code }
  let spend_data: Data = action()
  Transaction {
    ..transaction.placeholder,
    outputs: [payment(0, amount)],
    extra_signatories: [owner],
    withdrawals: [Pair(Script(quote_hash), 0), Pair(Script(code_hash), 0)],
    redeemers: [
      Pair(Spend(ref(0)), spend_data),
      Pair(Withdraw(Script(quote_hash)), quote_data),
      Pair(Withdraw(Script(code_hash)), code_data),
    ],
  }
}
