// #region consumer-imports
use cardano/address.{Address, Script}
use cardano/assets.{from_lovelace}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
use oracle.{OracleDatum}
// #endregion consumer-imports

// A second contract that reads the oracle without touching it.
//
// The oracle's UTxO is attached as a *reference input*: the transaction can
// read its datum, but does not spend it. So the oracle stays exactly where it
// is, and any number of contracts can consult the same one in the same block.
// #region consumer
validator consumer {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect [oracle_input] = self.reference_inputs
    expect InlineDatum(published) = oracle_input.output.datum
    expect oracle_datum: OracleDatum = published
    (oracle_datum.price > 0)?
  }

  else(_) {
    fail
  }
}

// #endregion consumer

// Tests.
// #region consumer-tests

const dummy_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000001",
    output_index: 0,
  }

const oracle_address: Address =
  Address {
    payment_credential: Script(
      #"000000000000000000000000000000000000000000000000000000ff",
    ),
    stake_credential: None,
  }

fn oracle_datum(price: Int) -> OracleDatum {
  OracleDatum {
    owner: #"00000000000000000000000000000000000000000000000000000001",
    price,
  }
}

// The oracle's UTxO, attached for reading only. Nothing spends it, so it stays
// where it is and the consumer never touches the oracle's contract.
fn tx_reading_oracle(price: Int) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    reference_inputs: [
      Input {
        output_reference: OutputReference {
          transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
          output_index: 0,
        },
        output: Output {
          address: oracle_address,
          value: from_lovelace(5_000_000),
          datum: InlineDatum(oracle_datum(price)),
          reference_script: None,
        },
      },
    ],
  }
}

test spend_ok_when_the_oracle_price_is_positive() {
  consumer.spend(None, Void, dummy_ref, tx_reading_oracle(150))
}

test spend_fails_when_the_oracle_price_is_zero() fail {
  consumer.spend(None, Void, dummy_ref, tx_reading_oracle(0))
}
// #endregion consumer-tests
