use aiken/collection/list
use cardano/transaction.{
  Datum, InlineDatum, Output, OutputReference, Transaction,
}
use fixtures.{
  an_order, change, fill, fill_with_junk, fill_with_script, fills, open_orders,
  order_ref, owner, owner_key, remainder, restaked, stranger, stranger_key,
}
use order_book.{Order}

/// What the spender wants to do with an order.
pub type Action {
  /// Deliver the tokens and take the ADA. Anyone may.
  Fill
  /// Take the ADA back. Only the owner may.
  Cancel
  /// Deliver some of the tokens and put the rest of the order back on the
  /// book. Anyone may.
  PartialFill
}

// The obvious order book: every order searches the outputs for the one that
// fills it.
//
// Fill ten orders and this handler runs ten times, and each run walks the
// outputs until it finds its own, so the work grows with the square of the
// batch.
// #region naive
validator orders {
  spend(
    datum: Option<Order>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(order) = datum
    when action is {
      // Look at every output until one fills this order.
      Fill -> list.any(self.outputs, order_book.is_filled_by(order, own_ref, _))
      Cancel -> order_book.owner_signs(self, order)
      // Find the order's own input, then look for the output that carries
      // this order's tag.
      PartialFill -> {
        expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
        let tag: Data = own_ref
        has_partial_fill(
          self.outputs,
          order,
          own_input.output,
          own_ref,
          InlineDatum(tag),
        )
      }
    }
  }

  else(_) {
    fail
  }
}

/// Whether the output tagged for this order delivers part of it, with the rest
/// of the order right after it.
///
/// The tag only finds the payment: only this order's payment carries it, and
/// comparing it is cheap. Every check still runs on what it finds, and a
/// tagged output that fails them fails the spend, instead of the search going
/// on to accept something else.
fn has_partial_fill(
  outputs: List<Output>,
  order: Order,
  own_input: Output,
  own_ref: OutputReference,
  tag: Datum,
) -> Bool {
  when outputs is {
    [payment, remainder, ..rest] ->
      if payment.datum == tag {
        order_book.is_partly_filled_by(
          order,
          own_input,
          own_ref,
          payment,
          remainder,
        )
      } else {
        has_partial_fill([remainder, ..rest], order, own_input, own_ref, tag)
      }
    _ -> False
  }
}

// #endregion naive

test fill_ok_when_the_owner_is_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(3),
    outputs: list.concat(fills(3), [change]),
  }
  orders.spend(Some(an_order), Fill, order_ref(2), tx)
}

test fill_fails_when_paid_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 99)],
  }
  orders.spend(Some(an_order), Fill, order_ref(0), tx)
}

test fill_fails_when_paid_to_someone_else() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, stranger, 100)],
  }
  orders.spend(Some(an_order), Fill, order_ref(0), tx)
}

// The owner's key, but a stake credential the seller picked.
test fill_fails_when_the_stake_credential_is_swapped() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, restaked, 100)],
  }
  orders.spend(Some(an_order), Fill, order_ref(0), tx)
}

// Double satisfaction: two identical orders, one output. The output is tagged
// for order 0, so order 1 finds nothing.
test fill_fails_when_one_output_serves_two_orders() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(2),
    outputs: [fill(0, owner, 100)],
  }
  orders.spend(Some(an_order), Fill, order_ref(1), tx)
}

// Junk in the buyer's output makes it bigger and costlier to spend.
test fill_fails_with_another_token_in_the_output() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill_with_junk(0)],
  }
  orders.spend(Some(an_order), Fill, order_ref(0), tx)
}

test fill_fails_with_a_reference_script_in_the_output() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill_with_script(0)],
  }
  orders.spend(Some(an_order), Fill, order_ref(0), tx)
}

// An order for nothing would hand its ADA to anyone who sends a tagged output.
test fill_fails_for_an_order_of_zero() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 0)],
  }
  orders.spend(Some(Order { ..an_order, quantity: 0 }), Fill, order_ref(0), tx)
}

test partial_fill_ok_when_the_rest_goes_back() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(2),
    outputs: [
      change,
      fill(0, owner, 100),
      fill(1, owner, 40),
      remainder(60, 6_000_000),
    ],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(1), tx)
}

// The remainder is a share of the ADA: 60 tokens still owed out of 100 keeps
// at least 60% of the 10 ADA.
test partial_fill_fails_when_the_rest_is_short_of_ada() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 40), remainder(60, 5_999_999)],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(0), tx)
}

// The rest of the order must still ask for exactly what is still owed.
test partial_fill_fails_when_the_rest_asks_for_less() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 40), remainder(50, 6_000_000)],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(0), tx)
}

test partial_fill_fails_when_the_rest_goes_elsewhere() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [
      fill(0, owner, 40),
      Output { ..remainder(60, 6_000_000), address: stranger },
    ],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(0), tx)
}

// Delivering everything is a fill, not a partial fill.
test partial_fill_fails_when_nothing_is_left() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [fill(0, owner, 100), remainder(0, 0)],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(0), tx)
}

// The first output carrying the order's tag is the one checked. A tagged
// output that pays someone else, ahead of the real payment, fails the spend
// rather than being skipped.
test partial_fill_fails_after_a_tagged_decoy() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(1),
    outputs: [
      fill(0, stranger, 40),
      fill(0, owner, 40),
      remainder(60, 6_000_000),
    ],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(0), tx)
}

// Double satisfaction: two identical orders, half filled, both claiming one
// remainder. The remainder has to sit right after each order's own payment,
// so order 1, paid at output 2, has no remainder of its own.
test partial_fill_fails_when_two_orders_share_the_rest() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: open_orders(2),
    outputs: [fill(0, owner, 40), remainder(60, 6_000_000), fill(1, owner, 40)],
  }
  orders.spend(Some(an_order), PartialFill, order_ref(1), tx)
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
