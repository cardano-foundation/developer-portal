use aiken/collection/list
use aiken_design_patterns/multi_utxo_indexer
use aiken_design_patterns/stake_validator
use cardano/address.{Address, Credential, Script}
use cardano/certificate.{Certificate, RegisterCredential}
use cardano/transaction.{InlineDatum, Input, OutputReference, Transaction}
use fixtures.{
  an_order, book_hash, change, fee, fills, open_orders, order_ref, treasury,
  wallet_input,
}
use order_book.{Order}

// `by_hand.ak` again, with the walk taken from aiken-design-patterns.

/// What the spender wants to do with an order.
pub type Action {
  /// Fill the order, as part of a batch: where the order sits among the
  /// inputs, and where the coordinator sits among the withdrawals.
  Fill { input_index: Int, withdrawal_index: Int }
  /// Take the ADA back. Only the owner may, and never in a batch.
  Cancel
}

/// What the coordinator is told: each order's input index paired with its
/// payment's output index, both going up, and where the fee is.
pub type Batch {
  indices: Pairs<Int, Int>,
  fee: Int,
}

// #region coordinator
validator orders(treasury: Address) {
  spend(
    datum: Option<Order>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    when action is {
      Fill { input_index, withdrawal_index } -> {
        expect Some(own_input) = list.at(self.inputs, input_index)
        expect own_input.output_reference == own_ref
        expect Script(own_hash) = own_input.output.address.payment_credential
        stake_validator.validate_withdraw_minimal(
          own_hash,
          self.withdrawals,
          withdrawal_index,
        )
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
    // Every input from the book must be paired with an output, in order.
    expect
      multi_utxo_indexer.one_to_one_no_redeemer(
        indices: batch.indices,
        spending_script_hash: own_hash,
        inputs: self.inputs,
        outputs: self.outputs,
        validation_logic: fn(_input_index, input, _output_index, payment) {
          expect InlineDatum(datum) = input.output.datum
          expect order: Order = datum
          order_book.is_filled_by(order, input.output_reference, payment)
        },
      )
    // One pair per order, so the pairs count the orders.
    expect Some(fee) = list.at(self.outputs, batch.fee)
    order_book.pays_fee(fee, treasury, own_hash, list.length(batch.indices))
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

/// The seller's funds first, then three orders: order `n` is input `n + 1`.
fn batch_inputs() -> List<Input> {
  [wallet_input(), ..open_orders(3)]
}

test coordinator_ok_when_every_order_is_filled_and_the_fee_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(3), [fee(3, book_hash), change]),
  }
  orders.withdraw(
    treasury,
    Batch { indices: [Pair(1, 0), Pair(2, 1), Pair(3, 2)], fee: 3 },
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
    Batch { indices: [Pair(1, 0), Pair(2, 1), Pair(3, 2)], fee: 3 },
    Script(book_hash),
    tx,
  )
}

// The library walks every input, so an order cannot be left out of the count.
test coordinator_fails_when_an_order_is_left_out() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(2), [fee(2, book_hash), change]),
  }
  orders.withdraw(
    treasury,
    Batch { indices: [Pair(1, 0), Pair(2, 1)], fee: 2 },
    Script(book_hash),
    tx,
  )
}

test spend_ok_when_the_coordinator_runs() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(
    treasury,
    None,
    Fill { input_index: 2, withdrawal_index: 0 },
    order_ref(1),
    tx,
  )
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
