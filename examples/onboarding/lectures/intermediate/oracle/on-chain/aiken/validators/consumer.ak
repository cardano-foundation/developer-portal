// #region consumer-imports
use cardano/assets.{from_lovelace}
use cardano/transaction.{OutputReference, Transaction}
use cocktail.{input_inline_datum}
use mocktail.{complete, mocktail_tx, ref_tx_in, ref_tx_in_inline_datum}
use mocktail/virgin_address.{mock_script_address}
use mocktail/virgin_key_hash.{mock_pub_key_hash}
use mocktail/virgin_output_reference.{mock_tx_hash, mock_utxo_ref}
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
    expect oracle_datum: OracleDatum = input_inline_datum(oracle_input)
    (oracle_datum.price > 0)?
  }

  else(_) {
    fail
  }
}

// #endregion consumer

// Tests.
// #region consumer-tests

const dummy_ref: OutputReference = mock_utxo_ref(1, 0)

fn oracle_datum(price: Int) -> OracleDatum {
  OracleDatum { owner: mock_pub_key_hash(1), price }
}

fn tx_reading_oracle(price: Int) -> Transaction {
  mocktail_tx()
    |> ref_tx_in(
        True,
        mock_tx_hash(0),
        0,
        from_lovelace(5_000_000),
        mock_script_address(0, None),
      )
    |> ref_tx_in_inline_datum(True, oracle_datum(price))
    |> complete()
}

test spend_ok_when_the_oracle_price_is_positive() {
  consumer.spend(None, Void, dummy_ref, tx_reading_oracle(150))
}

test spend_fails_when_the_oracle_price_is_zero() fail {
  consumer.spend(None, Void, dummy_ref, tx_reading_oracle(0))
}
// #endregion consumer-tests
