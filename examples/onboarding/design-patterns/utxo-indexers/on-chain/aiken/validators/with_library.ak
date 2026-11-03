use aiken/collection/list
use aiken_design_patterns/singular_utxo_indexer
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  an_order, change, fill, fills, open_orders, order_ref, owner, remainder,
  wallet_input,
}
use order_book.{Action, Cancel, Fill, InputAndOutput, Order, PartialFill}

// `by_hand.ak` again, with the indexing taken from aiken-design-patterns. What
// fills an order is still `order_book.is_filled_by`: the library finds the
// input and the output, and the check it runs on them is still yours.

// #region hints
/// Where `one_to_many` looks: the order among the inputs, and its outputs
/// among the outputs.
pub type InputAndOutputs {
  input_index: Int,
  output_indices: List<Int>,
}

// #endregion hints

// #region indexed
validator orders {
  spend(
    datum: Option<Order>,
    action: Action<InputAndOutput, InputAndOutputs>,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(order) = datum
    when action is {
      Fill(InputAndOutput { input_index, output_index }) -> {
        let _own_input, output <- singular_utxo_indexer.one_to_one(
          input_index: input_index,
          output_index: output_index,
          own_ref: own_ref,
          inputs: self.inputs,
          outputs: self.outputs,
          // Not checked by the library: the tag in `is_filled_by` is what
          // stops two orders from sharing an output.
          double_satisfaction_prevented: True,
        )
        order_book.is_filled_by(order, own_ref, output)
      }
      Cancel -> order_book.owner_signs(self, order)
      PartialFill(InputAndOutputs { input_index, output_indices }) -> {
        // The payment, and right after it the rest of the order.
        expect [payment_index, remainder_index] = output_indices
        expect remainder_index == payment_index + 1
        singular_utxo_indexer.one_to_many(
          input_index: input_index,
          output_indices: output_indices,
          own_ref: own_ref,
          inputs: self.inputs,
          outputs: self.outputs,
          double_satisfaction_prevented: True,
          // Runs once per output. Each output's job depends on the other,
          // so there is nothing to check here on its own.
          input_output_validator: fn(_own_input, _output_index, _output) {
            True
          },
          // Runs once, with every output the indices named, in order.
          input_collective_outputs_validator: fn(own_input, outputs) {
            expect [payment, remainder] = outputs
            order_book.is_partly_filled_by(
              order,
              own_input.output,
              own_ref,
              payment,
              remainder,
            )
          },
        )
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion indexed

// The checks on the order are the ones `by_hand.ak` tests. These cover what
// the library adds: the indices it reads, and what it does with wrong ones.

// The seller's funds sort first here, so order 1 is input 2.
test fill_ok_at_the_given_input_and_output() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [wallet_input(0), ..open_orders(3)],
    outputs: list.concat(fills(3), [change]),
  }
  orders.spend(
    Some(an_order),
    Fill(InputAndOutput { input_index: 2, output_index: 1 }),
    order_ref(1),
    tx,
  )
}

// The library checks the input index points at the order being spent.
test fill_fails_at_another_input() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [wallet_input(0), ..open_orders(3)],
    outputs: list.concat(fills(3), [change]),
  }
  orders.spend(
    Some(an_order),
    Fill(InputAndOutput { input_index: 1, output_index: 1 }),
    order_ref(1),
    tx,
  )
}

test partial_fill_ok_at_the_given_input_and_outputs() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [wallet_input(0), ..open_orders(2)],
    outputs: [fill(0, owner, 100), fill(1, owner, 40), remainder(60, 6_000_000)],
  }
  orders.spend(
    Some(an_order),
    PartialFill(InputAndOutputs { input_index: 2, output_indices: [1, 2] }),
    order_ref(1),
    tx,
  )
}

test partial_fill_fails_when_the_rest_is_not_next() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 40), change, remainder(60, 6_000_000)],
  }
  orders.spend(
    Some(an_order),
    PartialFill(InputAndOutputs { input_index: 0, output_indices: [0, 2] }),
    order_ref(0),
    tx,
  )
}

test fill_fails_at_another_orders_output() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(2),
    outputs: [fill(0, owner, 100), fill(1, owner, 100)],
  }
  orders.spend(
    Some(an_order),
    Fill(InputAndOutput { input_index: 1, output_index: 0 }),
    order_ref(1),
    tx,
  )
}
