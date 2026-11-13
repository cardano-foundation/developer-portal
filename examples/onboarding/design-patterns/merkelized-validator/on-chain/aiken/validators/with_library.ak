use aiken/builtin
use aiken/collection/list
use aiken/crypto.{ScriptHash}
use aiken_design_patterns/merkelized_validator
use cardano/address.{Address}
use cardano/transaction.{OutputReference, Transaction}
use fixtures
use voucher.{Action, Cancel, Purchase, QuoteInput, Voucher}

// #region validator
validator gate(
  merchant: Address,
  quote_worker: ScriptHash,
  code_worker: ScriptHash,
) {
  spend(
    datum: Option<Voucher>,
    action: Action,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(v) = datum
    expect voucher.owner_signs(v, tx)
    when action is {
      Purchase { quote_redeemer, code_redeemer, payment_output } -> {
        let price = merkelized_validator.delegated_compute(
          voucher.quote_input(v),
          quote_worker,
          tx.redeemers,
          quote_redeemer,
          fn(data) {
            expect input: QuoteInput = data
            input
          },
          builtin.un_i_data,
        )
        expect
          merkelized_validator.delegated_validation(
            v.redemption_code,
            code_worker,
            tx.redeemers,
            code_redeemer,
            builtin.un_b_data,
          )
        voucher.pays_merchant(
          list.expect_at(tx.outputs, payment_output),
          merchant,
          own_ref,
          price,
        )
      }
      Cancel -> True
    }
  }

  else(_) {
    fail
  }
}

// #endregion validator

test binds_both_workers_and_both_arguments() {
  gate.spend(
    fixtures.merchant,
    fixtures.quote_hash,
    fixtures.code_hash,
    Some(fixtures.a_voucher),
    fixtures.action(),
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}

test a_proof_for_another_quantity_fails() fail {
  let v = Voucher { ..fixtures.a_voucher, units: 3 }
  gate.spend(
    fixtures.merchant,
    fixtures.quote_hash,
    fixtures.code_hash,
    Some(v),
    fixtures.action(),
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}

test wrong_worker_hash_fails() fail {
  gate.spend(
    fixtures.merchant,
    fixtures.code_hash,
    fixtures.quote_hash,
    Some(fixtures.a_voucher),
    fixtures.action(),
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}

test reusing_one_index_for_two_workers_fails() fail {
  let action = Purchase {
    quote_redeemer: 1,
    code_redeemer: 1,
    payment_output: 0,
  }
  gate.spend(
    fixtures.merchant,
    fixtures.quote_hash,
    fixtures.code_hash,
    Some(fixtures.a_voucher),
    action,
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}
