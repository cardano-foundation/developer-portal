use aiken/collection/list
use cardano/address.{Address}
use cardano/transaction.{OutputReference, Transaction}
use fixtures
use rules
use voucher.{Action, Cancel, Price, Purchase, Voucher}

// #region validator
validator monolith(
  merchant: Address,
  catalogue: List<Price>,
  codes: List<ByteArray>,
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
      Purchase { payment_output, .. } -> {
        expect rules.code_allowed(codes, v.redemption_code)
        let price = rules.quote(catalogue, voucher.quote_input(v))
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

test purchases_when_the_tagged_merchant_is_paid() {
  monolith.spend(
    fixtures.merchant,
    fixtures.catalogue,
    fixtures.codes,
    Some(fixtures.a_voucher),
    fixtures.action(),
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}

test refuses_a_short_payment() fail {
  monolith.spend(
    fixtures.merchant,
    fixtures.catalogue,
    fixtures.codes,
    Some(fixtures.a_voucher),
    fixtures.action(),
    fixtures.ref(0),
    fixtures.purchase(5_999_999),
  )
}

test payment_cannot_satisfy_a_second_voucher() fail {
  monolith.spend(
    fixtures.merchant,
    fixtures.catalogue,
    fixtures.codes,
    Some(fixtures.a_voucher),
    fixtures.action(),
    fixtures.ref(1),
    fixtures.purchase(6_000_000),
  )
}

test only_the_owner_can_cancel() {
  monolith.spend(
    fixtures.merchant,
    fixtures.catalogue,
    fixtures.codes,
    Some(fixtures.a_voucher),
    Cancel,
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}

test stranger_cannot_cancel() fail {
  let tx = fixtures.purchase(6_000_000)
  monolith.spend(
    fixtures.merchant,
    fixtures.catalogue,
    fixtures.codes,
    Some(fixtures.a_voucher),
    Cancel,
    fixtures.ref(0),
    Transaction { ..tx, extra_signatories: [fixtures.stranger] },
  )
}

test zero_units_are_refused() fail {
  let v = Voucher { ..fixtures.a_voucher, units: 0 }
  monolith.spend(
    fixtures.merchant,
    fixtures.catalogue,
    fixtures.codes,
    Some(v),
    fixtures.action(),
    fixtures.ref(0),
    fixtures.purchase(6_000_000),
  )
}
