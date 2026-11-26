use aiken/collection/list
use cardano/address.{Address, Credential, Script}
use cardano/transaction.{Input, OutputReference, Transaction}
use fixtures.{
  an_order, book_hash, change, fee, fill, fills, open_orders, order_ref,
  other_book_hash, owner, treasury, wallet_input,
}
use order_book.{Order}

/// What the spender wants to do with an order.
pub type Action {
  /// Fill the order, as part of a batch. The indices say where the order
  /// sits among the inputs, where its payment and the batch's fee sit among
  /// the outputs.
  Fill { input_index: Int, output_index: Int, fee_index: Int }
  /// Take the ADA back. Only the owner may.
  Cancel
}

// The order book from the UTxO indexers example, with the protocol's fee. Each
// order still finds its payment by index, but the fee depends on how many
// orders the batch fills, so every order counts them all again.
// #region per-order
validator orders(treasury: Address) {
  spend(
    datum: Option<Order>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(order) = datum
    when action is {
      Fill { input_index, output_index, fee_index } -> {
        expect Some(own_input) = list.at(self.inputs, input_index)
        expect own_input.output_reference == own_ref
        let book = own_input.output.address.payment_credential
        expect Script(own_hash) = book
        expect Some(payment) = list.at(self.outputs, output_index)
        expect Some(fee) = list.at(self.outputs, fee_index)
        and {
          order_book.is_filled_by(order, own_ref, payment),
          // The same count, by every order in the batch.
          order_book.pays_fee(
            fee,
            treasury,
            own_hash,
            count_orders(self.inputs, book),
          ),
        }
      }
      Cancel -> order_book.owner_signs(self, order)
    }
  }

  else(_) {
    fail
  }
}

/// How many inputs the transaction spends from the book.
fn count_orders(inputs: List<Input>, book: Credential) -> Int {
  list.count(
    inputs,
    fn(input) { input.output.address.payment_credential == book },
  )
}

// #endregion per-order

/// The seller's funds first, then three orders: order `n` is input `n + 1`.
fn batch_inputs() -> List<Input> {
  [wallet_input(), ..open_orders(3)]
}

test fill_ok_when_the_batch_pays_its_fee() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(3), [fee(3, book_hash), change]),
  }
  orders.spend(
    treasury,
    Some(an_order),
    Fill { input_index: 2, output_index: 1, fee_index: 3 },
    order_ref(1),
    tx,
  )
}

// The fee is for every order in the batch, not just this one.
test fill_fails_when_the_fee_is_for_fewer_orders() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(3), [fee(2, book_hash), change]),
  }
  orders.spend(
    treasury,
    Some(an_order),
    Fill { input_index: 2, output_index: 1, fee_index: 3 },
    order_ref(1),
    tx,
  )
}

// A fee paid on behalf of another book does not count for this one.
test fill_fails_when_the_fee_is_for_another_book() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: list.concat(fills(3), [fee(3, other_book_hash), change]),
  }
  orders.spend(
    treasury,
    Some(an_order),
    Fill { input_index: 2, output_index: 1, fee_index: 3 },
    order_ref(1),
    tx,
  )
}

test fill_fails_when_paid_short() fail {
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
  orders.spend(
    treasury,
    Some(an_order),
    Fill { input_index: 2, output_index: 1, fee_index: 3 },
    order_ref(1),
    tx,
  )
}
