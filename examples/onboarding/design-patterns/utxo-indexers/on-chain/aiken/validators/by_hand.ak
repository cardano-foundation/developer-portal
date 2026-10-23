use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  an_order, change, fill, fills, open_orders, order_ref, owner, owner_key,
  remainder, stranger_key, wallet_input,
}
use order_book.{Action, Cancel, Fill, InputAndOutput, Order, PartialFill}

// Each order is told where its output is. The redeemer carries the output's
// index, and the spend goes straight to it instead of searching.
// #region indexed
validator orders {
  spend(
    datum: Option<Order>,
    action: Action<Int, InputAndOutput>,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(order) = datum
    when action is {
      Fill(output_index) -> {
        // The index is a hint, not a promise: whatever sits there still has
        // to fill this order, tag included.
        expect Some(output) = list.at(self.outputs, output_index)
        order_book.is_filled_by(order, own_ref, output)
      }
      Cancel -> order_book.owner_signs(self, order)
      PartialFill(InputAndOutput { input_index, output_index }) -> {
        // The share of the ADA depends on what the order holds, which only
        // its own input says. So a partial fill points at that too.
        expect Some(own_input) = list.at(self.inputs, input_index)
        expect own_input.output_reference == own_ref
        // One index, two outputs: the payment, and right after it the rest
        // of the order.
        expect [payment, remainder, ..] = list.drop(self.outputs, output_index)
        order_book.is_partly_filled_by(
          order,
          own_input.output,
          own_ref,
          payment,
          remainder,
        )
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion indexed

// What the index changes: where the spend looks, and what happens when the
// index points somewhere else.

test fill_ok_at_the_given_output() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(3),
    outputs: list.concat(fills(3), [change]),
  }
  orders.spend(Some(an_order), Fill(1), order_ref(1), tx)
}

// Double satisfaction: two orders pointing at one output. The output is tagged
// for order 0, so order 1 is refused.
test fill_fails_at_another_orders_output() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(2),
    outputs: [fill(0, owner, 100), fill(1, owner, 100)],
  }
  orders.spend(Some(an_order), Fill(0), order_ref(1), tx)
}

test fill_fails_past_the_last_output() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 100)],
  }
  orders.spend(Some(an_order), Fill(1), order_ref(0), tx)
}

test fill_fails_when_paid_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 99)],
  }
  orders.spend(Some(an_order), Fill(0), order_ref(0), tx)
}

test partial_fill_ok_at_the_given_input_and_output() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [wallet_input(0), ..open_orders(2)],
    outputs: [fill(0, owner, 100), fill(1, owner, 40), remainder(60, 6_000_000)],
  }
  orders.spend(
    Some(an_order),
    PartialFill(InputAndOutput { input_index: 2, output_index: 1 }),
    order_ref(1),
    tx,
  )
}

// The input index decides how much ADA the order held, so it is checked.
test partial_fill_fails_at_another_input() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [wallet_input(0), ..open_orders(2)],
    outputs: [fill(1, owner, 40), remainder(60, 6_000_000)],
  }
  orders.spend(
    Some(an_order),
    PartialFill(InputAndOutput { input_index: 0, output_index: 0 }),
    order_ref(1),
    tx,
  )
}

// The rest of the order must come right after the payment.
test partial_fill_fails_when_the_rest_is_not_next() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 40), change, remainder(60, 6_000_000)],
  }
  orders.spend(
    Some(an_order),
    PartialFill(InputAndOutput { input_index: 0, output_index: 0 }),
    order_ref(0),
    tx,
  )
}

test cancel_ok_for_the_owner() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    extra_signatories: [owner_key],
  }
  orders.spend(Some(an_order), Cancel, order_ref(0), tx)
}

test cancel_fails_for_anyone_else() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    extra_signatories: [stranger_key],
  }
  orders.spend(Some(an_order), Cancel, order_ref(0), tx)
}
