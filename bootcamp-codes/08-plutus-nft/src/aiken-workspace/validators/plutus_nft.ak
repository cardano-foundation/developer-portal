use aiken/primitive/bytearray.{concat}
use cardano/assets.{PolicyId, add, from_asset}
use cardano/transaction.{InlineDatum, Input, Transaction}
use mocktail.{complete, mint, mocktail_tx, tx_in, tx_in_inline_datum}
use mocktail/virgin_address.{mock_pub_key_address, mock_script_address}
use mocktail/virgin_key_hash.{mock_policy_id}
use mocktail/virgin_output_reference.{mock_tx_hash}
use oracle.{OracleDatum}
use vodka_converter.{convert_int_to_bytes}
use vodka_inputs.{inputs_with_policy}
use vodka_mints.{check_policy_only_burn, only_minted_token}

pub type MintPolarity {
  RMint
  RBurn
}

validator plutus_nft(collection_name: ByteArray, oracle_nft: PolicyId) {
  mint(redeemer: MintPolarity, policy_id: PolicyId, tx: Transaction) {
    when redeemer is {
      RMint -> {
        let Transaction { inputs, mint, .. } = tx
        expect [auth_input] = inputs_with_policy(inputs, oracle_nft)
        expect InlineDatum(input_datum) = auth_input.output.datum
        expect OracleDatum { count, .. }: OracleDatum = input_datum
        let asset_name =
          collection_name
            |> concat(" (")
            |> concat(convert_int_to_bytes(count))
            |> concat(")")
        only_minted_token(mint, policy_id, asset_name, 1)
      }

      RBurn -> check_policy_only_burn(tx.mint, policy_id)
    }
  }

  else(_) {
    fail
  }
}

test success_mint() {
  let redeemer = RMint
  let policy_id = mock_policy_id(1)
  let input_value =
    from_asset(mock_policy_id(0), "", 1) |> add("", "", 2_000_000)

  let tx =
    mocktail_tx()
      |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_script_address(0, None))
      |> tx_in_inline_datum(
          True,
          OracleDatum {
            count: 0,
            lovelace_price: 1_000_000,
            fee_address: mock_pub_key_address(0, None),
          },
        )
      |> mint(True, 1, policy_id, "collection (0)")
      |> complete()

  plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}

test fail_mint_with_incorrect_name() {
  let redeemer = RMint
  let policy_id = mock_policy_id(1)
  let input_value =
    from_asset(mock_policy_id(0), "", 1) |> add("", "", 2_000_000)

  let tx =
    mocktail_tx()
      |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_script_address(0, None))
      |> tx_in_inline_datum(
          True,
          OracleDatum {
            count: 0,
            lovelace_price: 1_000_000,
            fee_address: mock_pub_key_address(0, None),
          },
        )
      |> mint(True, 1, policy_id, "collection (1)")
      |> complete()

  !plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}

test fail_mint_with_mix() {
  let redeemer = RMint
  let policy_id = mock_policy_id(1)
  let input_value =
    from_asset(mock_policy_id(0), "", 1) |> add("", "", 2_000_000)

  let tx =
    mocktail_tx()
      |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_script_address(0, None))
      |> tx_in_inline_datum(
          True,
          OracleDatum {
            count: 0,
            lovelace_price: 1_000_000,
            fee_address: mock_pub_key_address(0, None),
          },
        )
      |> mint(True, 1, policy_id, "collection (0)")
      |> mint(True, 1, mock_policy_id(0), "collection (0)")
      |> complete()

  !plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}

test success_burn() {
  let redeemer = RBurn
  let policy_id = mock_policy_id(1)

  let tx =
    mocktail_tx()
      |> mint(True, -1, policy_id, "")
      |> complete()

  plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}

test success_burn_with_other_minting() {
  let redeemer = RBurn
  let policy_id = mock_policy_id(1)

  let tx =
    mocktail_tx()
      |> mint(True, -1, policy_id, "")
      |> mint(True, -1, mock_policy_id(1), "")
      |> complete()
  plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}

test fail_burn_with_mint() {
  let redeemer = RBurn
  let policy_id = mock_policy_id(1)

  let tx =
    mocktail_tx()
      |> mint(True, 1, policy_id, "")
      |> complete()

  !plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}

test fail_burn_with_mix() {
  let redeemer = RBurn
  let policy_id = mock_policy_id(1)

  let tx =
    mocktail_tx()
      |> mint(True, -1, policy_id, "")
      |> mint(True, 1, policy_id, "1")
      |> complete()

  !plutus_nft.mint("collection", mock_policy_id(0), redeemer, policy_id, tx)
}
