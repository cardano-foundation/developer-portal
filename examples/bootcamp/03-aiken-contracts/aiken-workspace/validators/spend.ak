use cardano/assets.{PolicyId, from_asset}
use cardano/transaction.{OutputReference, Transaction}
use cocktail/vodka_inputs.{inputs_with_policy}
use mocktail.{
  complete, mock_policy_id, mock_pub_key_address, mock_tx_hash, mock_utxo_ref,
  mocktail_tx, ref_tx_in,
}

pub type Datum {
  oracle_nft: PolicyId,
}

validator hello_world {
  spend(
    datum_opt: Option<Datum>,
    _redeemer: Data,
    _input: OutputReference,
    tx: Transaction,
  ) {
    when datum_opt is {
      Some(datum) ->
        when inputs_with_policy(tx.reference_inputs, datum.oracle_nft) is {
          [_ref_input] -> True
          _ -> False
        }
      None -> False
    }
  }

  else(_) {
    fail @"unsupported purpose"
  }
}

const oracle_nft_policy_id = mock_policy_id(0)

fn mock_tx(is_ref_input_exist: Bool) -> Transaction {
  mocktail_tx()
    |> ref_tx_in(
        is_ref_input_exist,
        mock_tx_hash(0),
        1,
        from_asset(oracle_nft_policy_id, "", 1),
        mock_pub_key_address(0, None),
      )
    |> complete()
}

test test_hello_world() {
  let datum = Datum { oracle_nft: oracle_nft_policy_id }
  let tx = mock_tx(True)
  hello_world.spend(Some(datum), Void, mock_utxo_ref(0, 0), tx)
}

test test_failed_hello_world_no_ref_input() {
  let datum = Datum { oracle_nft: oracle_nft_policy_id }
  let tx = mock_tx(False)
  !hello_world.spend(Some(datum), Void, mock_utxo_ref(0, 0), tx)
}
