use aiken/collection/pairs
use aiken_design_patterns/merkelized_validator.{
  ComputationRedeemer, ValidationRedeemer,
}
use cardano/address.{Credential, Script}
use cardano/certificate.{Certificate, RegisterCredential}
use cardano/transaction.{Transaction}
use fixtures
use rules
use voucher.{Price, QuoteInput}

// #region quote-worker
validator quotation(catalogue: List<Price>) {
  withdraw(
    io: ComputationRedeemer<QuoteInput, Int>,
    credential: Credential,
    tx: Transaction,
  ) {
    expect pairs.get_first(tx.withdrawals, credential) == Some(0)
    merkelized_validator.computation_withdrawal_wrapper(
      io,
      fn(input) { rules.quote(catalogue, input) },
    )
  }

  publish(_redeemer: Data, certificate: Certificate, _tx: Transaction) {
    when certificate is {
      RegisterCredential { .. } -> True
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

// #endregion quote-worker

// #region code-worker
validator redemption(codes: List<ByteArray>) {
  withdraw(
    io: ValidationRedeemer<ByteArray>,
    credential: Credential,
    tx: Transaction,
  ) {
    expect pairs.get_first(tx.withdrawals, credential) == Some(0)
    merkelized_validator.validation_withdrawal_wrapper(
      io,
      fn(code) { rules.code_allowed(codes, code) },
    )
  }

  publish(_redeemer: Data, certificate: Certificate, _tx: Transaction) {
    when certificate is {
      RegisterCredential { .. } -> True
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

// #endregion code-worker

test computation_approves_the_correct_proposed_price() {
  quotation.withdraw(
    fixtures.catalogue,
    fixtures.quotation(6_000_000),
    Script(fixtures.quote_hash),
    fixtures.purchase(6_000_000),
  )
}

test computation_refuses_a_fabricated_result() {
  !quotation.withdraw(
    fixtures.catalogue,
    fixtures.quotation(4_000_000),
    Script(fixtures.quote_hash),
    fixtures.purchase(6_000_000),
  )
}

test validation_refuses_an_unlisted_code() {
  !redemption.withdraw(
    [],
    ValidationRedeemer { input_arg: fixtures.code },
    Script(fixtures.code_hash),
    fixtures.purchase(6_000_000),
  )
}
