use aiken/collection/list
use aiken_design_patterns/multi_utxo_indexer
use aiken_design_patterns/stake_validator
use cardano/address.{Address, Credential, Script, VerificationKey}
use cardano/certificate.{Certificate, RegisterCredential}
use cardano/transaction.{
  InlineDatum, Input, OutputReference, Redeemer, ScriptPurpose, Spend,
  Transaction,
}
use fixtures.{
  an_order, book_hash, change, fee, fill, open_orders, order_ref, owner,
  remainder, treasury, wallet_input,
}
use order_book.{Order}

/// Whether an order is filled whole or in part.
pub type Filling {
  Whole
  Partly
}

/// What the spender wants to do with an order.
pub type Action {
  /// Fill the order, as part of a batch. Besides the indices, the redeemer
  /// carries the coordinator's credential: that is how the library picks out
  /// this book's redeemers from every other script's.
  Fill {
    filling: Filling,
    input_index: Int,
    withdrawal_index: Int,
    coordinator: Credential,
  }
  /// Take the ADA back. Only the owner may, and never in a batch.
  Cancel
}

/// What the coordinator is told: each order's input index paired with its
/// payment's output index, both going up, and where the fee is.
pub type Batch {
  indices: Pairs<Int, Int>,
  fee: Int,
}

// `with_library.ak` again, for batches that mix whole and partial fills, with
// the library's variant that hands the coordinator each order's redeemer.
// #region coordinator
validator orders(treasury: Address) {
  spend(
    datum: Option<Order>,
    action: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    when action is {
      Fill { input_index, withdrawal_index, coordinator, .. } -> {
        expect Some(own_input) = list.at(self.inputs, input_index)
        expect own_input.output_reference == own_ref
        let book = own_input.output.address.payment_credential
        expect Script(own_hash) = book
        and {
          // A redeemer naming any other coordinator would be invisible to
          // this one, and the order would go unchecked.
          coordinator == book,
          stake_validator.validate_withdraw_minimal(
            own_hash,
            self.withdrawals,
            withdrawal_index,
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
    expect
      multi_utxo_indexer.one_to_one_with_redeemer(
        indices: batch.indices,
        spending_script_hash: own_hash,
        stake_script_hash: own_hash,
        inputs: self.inputs,
        outputs: self.outputs,
        redeemers: self.redeemers,
        // Runs on every spend redeemer in the transaction, other scripts'
        // included, so it must not fail on a shape it does not know.
        spend_redeemer_coercer_and_stake_credential_extractor: fn(redeemer) {
          if redeemer is Fill { filling, coordinator, .. }: Action {
            (filling, coordinator)
          } else {
            (Whole, VerificationKey(""))
          }
        },
        validation_logic: fn(
          _input_index,
          input,
          filling,
          output_index,
          payment,
        ) {
          expect InlineDatum(datum) = input.output.datum
          expect order: Order = datum
          when filling is {
            Whole ->
              order_book.is_filled_by(order, input.output_reference, payment)
            Partly -> {
              expect Some(rest) = list.at(self.outputs, output_index + 1)
              order_book.is_partly_filled_by(
                order,
                input.output,
                input.output_reference,
                payment,
                rest,
              )
            }
          }
        },
      )
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

/// The seller's funds first, then two orders: order `n` is input `n + 1`.
fn batch_inputs() -> List<Input> {
  [wallet_input(), ..open_orders(2)]
}

/// The spend redeemers of a batch where order 0 is filled whole and order 1
/// in part, both naming `coordinator`.
fn mixed_redeemers(coordinator: Credential) -> Pairs<ScriptPurpose, Redeemer> {
  let whole: Data = Fill {
    filling: Whole,
    input_index: 1,
    withdrawal_index: 0,
    coordinator,
  }
  let part: Data = Fill {
    filling: Partly,
    input_index: 2,
    withdrawal_index: 0,
    coordinator,
  }
  [Pair(Spend(order_ref(0)), whole), Pair(Spend(order_ref(1)), part)]
}

fn mixed_outputs() {
  [
    fill(0, owner, 100),
    fill(1, owner, 40),
    remainder(60, 6_000_000),
    fee(2, book_hash),
    change,
  ]
}

test coordinator_ok_for_a_mixed_batch() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: mixed_outputs(),
    redeemers: mixed_redeemers(Script(book_hash)),
  }
  orders.withdraw(
    treasury,
    Batch { indices: [Pair(1, 0), Pair(2, 1)], fee: 3 },
    Script(book_hash),
    tx,
  )
}

// Redeemers naming another coordinator are not this book's to check.
test coordinator_fails_when_no_redeemer_names_it() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    outputs: mixed_outputs(),
    redeemers: mixed_redeemers(Script(fixtures.other_book_hash)),
  }
  orders.withdraw(
    treasury,
    Batch { indices: [Pair(1, 0), Pair(2, 1)], fee: 3 },
    Script(book_hash),
    tx,
  )
}

test spend_fails_when_naming_another_coordinator() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(
    treasury,
    None,
    Fill {
      filling: Whole,
      input_index: 1,
      withdrawal_index: 0,
      coordinator: Script(fixtures.other_book_hash),
    },
    order_ref(0),
    tx,
  )
}

test spend_ok_when_naming_its_own_coordinator() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: batch_inputs(),
    withdrawals: [Pair(Script(book_hash), 0)],
  }
  orders.spend(
    treasury,
    None,
    Fill {
      filling: Whole,
      input_index: 1,
      withdrawal_index: 0,
      coordinator: Script(book_hash),
    },
    order_ref(0),
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
