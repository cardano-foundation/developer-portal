// #region oracle-imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{from_lovelace}
use cardano/transaction.{OutputReference, Transaction}
use cocktail.{key_signed, output_inline_datum, outputs_at}
use mocktail.{
  complete, mocktail_tx, required_signer_hash, tx_in, tx_in_inline_datum, tx_out,
  tx_out_inline_datum,
}
use mocktail/virgin_address.{mock_pub_key_address, mock_script_address}
use mocktail/virgin_key_hash.{mock_pub_key_hash}
use mocktail/virgin_output_reference.{mock_tx_hash, mock_utxo_ref}
// #endregion oracle-imports

// A UTxO that carries a number, and is updated instead of emptied: every other
// contract here lets the funds go, this one demands they come straight back.
// #region oracle
pub type OracleDatum {
  owner: VerificationKeyHash,
  price: Int,
}

validator oracle {
  spend(
    datum: Option<OracleDatum>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(OracleDatum { owner, .. }) = datum

    expect Some(own_input) =
      list.find(self.inputs, fn(input) { input.output_reference == own_ref })

    // Without this pair of lines the owner could simply drain the UTxO.
    expect [continuing] = outputs_at(self.outputs, own_input.output.address)
    expect _updated: OracleDatum = output_inline_datum(continuing)

    key_signed(self.extra_signatories, owner)?
  }

  else(_) {
    fail
  }
}

// #endregion oracle

// Tests.
// #region oracle-tests

const owner: VerificationKeyHash = mock_pub_key_hash(1)

const stranger: VerificationKeyHash = mock_pub_key_hash(2)

const script_address = mock_script_address(0, None)

const dummy_ref: OutputReference = mock_utxo_ref(0, 0)

fn old_datum() -> Option<OracleDatum> {
  Some(OracleDatum { owner, price: 100 })
}

fn new_datum() -> OracleDatum {
  OracleDatum { owner, price: 150 }
}

test update_ok_when_owner_signs_and_utxo_returns() {
  let tx =
    mocktail_tx()
      |> tx_in(
          True,
          mock_tx_hash(0),
          0,
          from_lovelace(5_000_000),
          script_address,
        )
      |> tx_in_inline_datum(True, old_datum())
      |> tx_out(True, script_address, from_lovelace(5_000_000))
      |> tx_out_inline_datum(True, new_datum())
      |> required_signer_hash(True, owner)
      |> complete()
  oracle.spend(old_datum(), Void, dummy_ref, tx)
}

test update_fails_when_the_utxo_does_not_return() fail {
  let tx =
    mocktail_tx()
      |> tx_in(
          True,
          mock_tx_hash(0),
          0,
          from_lovelace(5_000_000),
          script_address,
        )
      |> tx_in_inline_datum(True, old_datum())
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(5_000_000))
      |> required_signer_hash(True, owner)
      |> complete()
  oracle.spend(old_datum(), Void, dummy_ref, tx)
}

test update_fails_for_a_stranger() fail {
  let tx =
    mocktail_tx()
      |> tx_in(
          True,
          mock_tx_hash(0),
          0,
          from_lovelace(5_000_000),
          script_address,
        )
      |> tx_in_inline_datum(True, old_datum())
      |> tx_out(True, script_address, from_lovelace(5_000_000))
      |> tx_out_inline_datum(True, new_datum())
      |> required_signer_hash(True, stranger)
      |> complete()
  oracle.spend(old_datum(), Void, dummy_ref, tx)
}
// #endregion oracle-tests
