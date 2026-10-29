use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Address, Credential, Script}
use cardano/certificate.{
  Certificate, DelegateCredential, RegisterCredential, UnregisterCredential,
}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
use fixtures.{
  an_order, book_hash, change, fee, fill, fills, open_orders, order_ref, owner,
  owner_key, treasury, wallet_input,
}
use order_book.{Order}

/// What the spender wants to do with an order.
pub type Action {
  /// Fill the order, as part of a batch. The index says where the order sits
  /// among the inputs, which is how the spend learns the book's hash.
  Fill { input_index: Int }
  /// Take the ADA back. Only the owner may, and never in a batch.
  Cancel
}

// #region batch
/// What the coordinator is told: where each order's payment is, in the order
/// the orders appear among the inputs, and where the fee is.
pub type Batch {
  payments: List<Int>,
  fee: Int,
}

// #endregion batch

// One coordinator checks the whole batch: every order's payment, and the fee
// for all of them. Spend, withdraw and publish share one hash, as in
// transaction-level validation.
// #region coordinator
validator orders(treasury: Address) {
  spend(
    datum: Option<Order>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    when action is {
      // Each order only checks that the coordinator runs.
      Fill { input_index } -> {
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
/// Walk the inputs once, in the ledger's order, and return how many orders
/// were filled. Each order meets the next index in `payments`, and the
/// outputs are walked forward to it. `position` is the index of the first
/// output not yet passed.
///
/// The indices must go up, so no output pays two orders, and every order
/// needs one, so none is left out.
fn fill_all(
  inputs: List<Input>,
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
        expect [index, ..other_payments] = payments
        expect index >= position
        expect [payment, ..later_outputs] = list.drop(outputs, index - position)
        expect InlineDatum(datum) = input.output.datum
        expect order: Order = datum
        expect order_book.is_filled_by(order, input.output_reference, payment)
        fill_all(
          other_inputs,
          other_payments,
          later_outputs,
          index + 1,
          book,
          filled + 1,
        )
      } else {
        fill_all(other_inputs, payments, outputs, position, book, filled)
      }
  }
}

// #endregion walk

/// The seller's funds first, then three orders: order `n` is input `n + 1`.
fn batch_inputs() -> List<Input> {
  [wallet_input(), ..open_orders(3)]
}

fn batch_outputs() -> List<Output> {
  list.concat(fills(3), [fee(3, book_hash), change])
}

test spend_ok_when_the_coordinator_runs() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(treasury, None, Fill { input_index: 2 }, order_ref(1), tx)
}

test spend_fails_without_the_coordinator() fail {
  let tx = Transaction { ..transaction.placeholder, inputs: batch_inputs() }
  orders.spend(treasury, None, Fill { input_index: 2 }, order_ref(1), tx)
}

test spend_fails_at_another_input() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(treasury, None, Fill { input_index: 1 }, order_ref(1), tx)
}

test cancel_ok_for_the_owner_alone() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    extra_signatories: [owner_key],
  }
  orders.spend(treasury, Some(an_order), Cancel, order_ref(0), tx)
}

// A cancel never shares a transaction with the coordinator.
test cancel_fails_in_a_batch() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    extra_signatories: [owner_key],
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(treasury, Some(an_order), Cancel, order_ref(0), tx)
}

test coordinator_ok_when_every_order_is_filled_and_the_fee_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: batch_outputs(),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1, 2], fee: 3 },
    Script(book_hash),
    tx,
  )
}

test coordinator_ok_with_other_outputs_between() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: [
      fee(3, book_hash),
      fill(0, owner, 100),
      change,
      fill(1, owner, 100),
      fill(2, owner, 100),
    ],
  }
  orders.withdraw(
    treasury,
    Batch { payments: [1, 3, 4], fee: 0 },
    Script(book_hash),
    tx,
  )
}

test coordinator_fails_when_the_fee_is_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(3), [fee(2, book_hash), change]),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1, 2], fee: 3 },
    Script(book_hash),
    tx,
  )
}

test coordinator_fails_when_paid_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: [
      fill(0, owner, 100),
      fill(1, owner, 99),
      fill(2, owner, 100),
      fee(3, book_hash),
    ],
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1, 2], fee: 3 },
    Script(book_hash),
    tx,
  )
}

// Double satisfaction: one payment for two orders. The indices must go up.
test coordinator_fails_when_a_payment_is_reused() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: batch_outputs(),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 0, 2], fee: 3 },
    Script(book_hash),
    tx,
  )
}

// An order the redeemer forgets is still an order the coordinator checks.
test coordinator_fails_when_an_order_is_left_out() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(2), [fee(2, book_hash), change]),
  }
  orders.withdraw(
    treasury,
    Batch { payments: [0, 1], fee: 2 },
    Script(book_hash),
    tx,
  )
}

test publish_ok_for_anyone_registering() {
  orders.publish(
    treasury,
    Void,
    RegisterCredential { credential: Script(book_hash), deposit: Never },
    transaction.placeholder,
  )
}

test publish_fails_for_deregistration() fail {
  orders.publish(
    treasury,
    Void,
    UnregisterCredential { credential: Script(book_hash), refund: Never },
    transaction.placeholder,
  )
}

test publish_fails_for_delegation() fail {
  orders.publish(
    treasury,
    Void,
    DelegateCredential {
      credential: Script(book_hash),
      delegate: certificate.DelegateBlockProduction {
        stake_pool: #"00000000000000000000000000000000000000000000000000000099",
      },
    },
    transaction.placeholder,
  )
}
