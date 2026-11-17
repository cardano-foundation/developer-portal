use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Address, Credential, Script}
use cardano/certificate.{Certificate, RegisterCredential}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Redeemer, ScriptPurpose, Spend,
  Transaction,
}
use fixtures.{
  an_order, book_hash, change, fee, fill, open_orders, order_ref, owner,
  remainder, treasury, wallet_input,
}
use order_book.{Order}

/// What the spender wants to do with an order. The coordinator reads this
/// too: it is how it knows which orders are filled whole and which in part.
pub type Action {
  /// Fill all of the order, as part of a batch.
  Fill { input_index: Int }
  /// Take the ADA back. Only the owner may, and never in a batch.
  Cancel
  /// Fill part of the order, as part of a batch. Its rest goes right after
  /// its payment.
  PartialFill { input_index: Int }
}

/// What the coordinator is told: where each order's payment is, in the order
/// the orders appear among the inputs, and where the fee is.
pub type Batch {
  payments: List<Int>,
  fee: Int,
}

// `by_hand.ak` again, for batches that mix whole and partial fills. The
// coordinator reads each order's own redeemer to know which check to run.
// #region coordinator
validator orders(treasury: Address) {
  spend(
    datum: Option<Order>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    when action is {
      Fill { input_index } | PartialFill { input_index } -> {
        expect Some(own_input) = list.at(self.inputs, input_index)
        and {
          own_input.output_reference == own_ref,
          pairs.has_key(
            self.withdrawals,
            own_input.output.address.payment_credential,
          ),
        }
      }
      Cancel -> {
        expect Some(order) = datum
        expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
        order_book.cancels_alone(
          self,
          order,
          own_input.output.address.payment_credential,
        )
      }
    }
  }

  withdraw(batch: Batch, own_credential: Credential, self: Transaction) {
    expect Script(own_hash) = own_credential
    let filled = fill_all(
      self.inputs,
      self.redeemers,
      batch.payments,
      self.outputs,
      0,
      own_credential,
      0,
    )
    expect Some(fee) = list.at(self.outputs, batch.fee)
    order_book.pays_fee(fee, treasury, own_hash, filled)
  }

  publish(_redeemer: Data, certificate: Certificate, _self: Transaction) {
    when certificate is {
      RegisterCredential { .. } -> True
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

// #endregion coordinator

// #region walk
/// Walk the inputs once, as in `by_hand.ak`, and the redeemers alongside them.
/// The ledger lists spend redeemers in the same order as the inputs, so the
/// walk never goes back.
fn fill_all(
  inputs: List<Input>,
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  payments: List<Int>,
  outputs: List<Output>,
  position: Int,
  book: Credential,
  filled: Int,
) -> Int {
  when inputs is {
    [] -> {
      expect payments == []
      filled
    }
    [input, ..other_inputs] ->
      if input.output.address.payment_credential == book {
        let (action, other_redeemers) = redeemer_of(
          redeemers,
          input.output_reference,
        )
        expect [index, ..other_payments] = payments
        expect index >= position
        expect [payment, ..later_outputs] = list.drop(outputs, index - position)
        expect InlineDatum(datum) = input.output.datum
        expect order: Order = datum
        when action is {
          Fill { .. } -> {
            expect
              order_book.is_filled_by(order, input.output_reference, payment)
            fill_all(
              other_inputs,
              other_redeemers,
              other_payments,
              later_outputs,
              index + 1,
              book,
              filled + 1,
            )
          }
          PartialFill { .. } -> {
            expect [rest, ..after_rest] = later_outputs
            expect
              order_book.is_partly_filled_by(
                order,
                input.output,
                input.output_reference,
                payment,
                rest,
              )
            fill_all(
              other_inputs,
              other_redeemers,
              other_payments,
              after_rest,
              index + 2,
              book,
              filled + 1,
            )
          }
          // Never reached: a cancel refuses to share a transaction with the
          // coordinator.
          Cancel -> fail
        }
      } else {
        fill_all(
          other_inputs,
          redeemers,
          payments,
          outputs,
          position,
          book,
          filled,
        )
      }
  }
}

/// The redeemer spending `own_ref`, and the redeemers after it. It is found
/// by the input it spends, never by its position, so no other script's
/// redeemer can stand in for it.
fn redeemer_of(
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  own_ref: OutputReference,
) -> (Action, Pairs<ScriptPurpose, Redeemer>) {
  expect [Pair(purpose, redeemer), ..others] = redeemers
  if purpose == Spend(own_ref) {
    expect action: Action = redeemer
    (action, others)
  } else {
    redeemer_of(others, own_ref)
  }
}

// #endregion walk

/// The seller's funds first, then two orders: order `n` is input `n + 1`.
fn batch_inputs() -> List<Input> {
  [wallet_input(), ..open_orders(2)]
}

/// The spend redeemers of a batch where order 0 is filled whole and order 1
/// in part.
fn mixed_redeemers() -> Pairs<ScriptPurpose, Redeemer> {
  let whole: Data = Fill { input_index: 1 }
  let part: Data = PartialFill { input_index: 2 }
  [Pair(Spend(order_ref(0)), whole), Pair(Spend(order_ref(1)), part)]
}

test coordinator_ok_for_a_mixed_batch() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: [
      fill(0, owner, 100),
      fill(1, owner, 40),
      remainder(60, 6_000_000),
      fee(2, book_hash),
      change,
    ],
    redeemers: mixed_redeemers(),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1], fee: 3 },
    Script(book_hash),
    tx,
  )
}

// The rest of a partial fill must follow its payment, and keep its share.
test coordinator_fails_when_the_rest_is_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: [
      fill(0, owner, 100),
      fill(1, owner, 40),
      remainder(60, 5_999_999),
      fee(2, book_hash),
    ],
    redeemers: mixed_redeemers(),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1], fee: 3 },
    Script(book_hash),
    tx,
  )
}

// A partial fill whose rest is missing is not a partial fill.
test coordinator_fails_when_a_partial_fill_has_no_rest() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: [fill(0, owner, 100), fill(1, owner, 40), fee(2, book_hash)],
    redeemers: mixed_redeemers(),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1], fee: 2 },
    Script(book_hash),
    tx,
  )
}

// The payments must go up, here as in `by_hand.ak`.
test coordinator_fails_when_payments_go_back() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: [
      fill(1, owner, 40),
      remainder(60, 6_000_000),
      fill(0, owner, 100),
      fee(2, book_hash),
    ],
    redeemers: mixed_redeemers(),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [2, 0], fee: 3 },
    Script(book_hash),
    tx,
  )
}

test spend_ok_for_a_partial_fill_when_the_coordinator_runs() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(treasury, None, PartialFill { input_index: 2 }, order_ref(1), tx)
}

test cancel_fails_in_a_batch() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    extra_signatories: [fixtures.owner_key],
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(treasury, Some(an_order), Cancel, order_ref(0), tx)
}

test publish_fails_for_anything_but_registering() fail {
  orders.publish(
    treasury,
    Void,
    certificate.UnregisterCredential {
      credential: Script(book_hash),
      refund: Never,
    },
    transaction.placeholder,
  )
}
