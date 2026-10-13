use aiken/collection/list
use aiken/crypto.{ScriptHash}
use cardano/address.{Address}
use cardano/transaction.{OutputReference, Transaction}
use delegation
use fixtures
use voucher.{Action, Cancel, Purchase, Voucher}

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
        let price = delegation.computed_price(
          voucher.quote_input(v),
          quote_worker,
          tx.redeemers,
          quote_redeemer,
        )
        expect
          delegation.validated_code(
            v.redemption_code,
            code_worker,
            tx.redeemers,
            code_redeemer,
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

test wrong_worker_index_fails() fail {
  let action = Purchase {
    quote_redeemer: 2,
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

test payment_still_must_carry_this_vouchers_tag() fail {
  gate.spend(
    fixtures.merchant,
    fixtures.quote_hash,
    fixtures.code_hash,
    Some(fixtures.a_voucher),
    fixtures.action(),
    fixtures.ref(1),
    fixtures.purchase(6_000_000),
  )
}
