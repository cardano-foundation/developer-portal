// #region giftcard-imports
use aiken/collection/list
use cardano/address.{Script}
use cardano/assets.{PolicyId, from_lovelace}
use cardano/transaction.{OutputReference, Transaction}
use cocktail.{token_minted}
use mocktail.{complete, mint, mocktail_tx, tx_in}
use mocktail/virgin_address.{mock_script_address}
use mocktail/virgin_key_hash.{mock_script_hash}
use mocktail/virgin_output_reference.{mock_tx_hash, mock_utxo_ref}
// #endregion giftcard-imports

// One validator, two handlers, cooperating inside a single transaction. The
// token is the key: minting one creates a gift card, burning it releases the
// funds locked at this same script's address.
// #region giftcard
const card_name: ByteArray = "GIFT"

validator giftcard {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    or {
      token_minted(self.mint, policy_id, card_name, 1),
      token_minted(self.mint, policy_id, card_name, -1),
    }?
  }

  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) =
      list.find(self.inputs, fn(input) { input.output_reference == own_ref })
    expect Script(policy_id) = own_input.output.address.payment_credential
    token_minted(self.mint, policy_id, card_name, -1)?
  }

  else(_) {
    fail
  }
}

// #endregion giftcard

// Tests.
// #region giftcard-tests

const policy: PolicyId = mock_script_hash(0)

const dummy_ref: OutputReference = mock_utxo_ref(0, 0)

test mint_ok_for_one_card() {
  let tx = mocktail_tx() |> mint(True, 1, policy, card_name) |> complete()
  giftcard.mint(Void, policy, tx)
}

test burn_ok_for_one_card() {
  let tx = mocktail_tx() |> mint(True, -1, policy, card_name) |> complete()
  giftcard.mint(Void, policy, tx)
}

test mint_fails_for_two_cards() fail {
  let tx = mocktail_tx() |> mint(True, 2, policy, card_name) |> complete()
  giftcard.mint(Void, policy, tx)
}

test redeem_ok_when_the_card_is_burned() {
  let tx =
    mocktail_tx()
      |> tx_in(
          True,
          mock_tx_hash(0),
          0,
          from_lovelace(5_000_000),
          mock_script_address(0, None),
        )
      |> mint(True, -1, policy, card_name)
      |> complete()
  giftcard.spend(None, Void, dummy_ref, tx)
}

test redeem_fails_when_the_card_is_kept() fail {
  let tx =
    mocktail_tx()
      |> tx_in(
          True,
          mock_tx_hash(0),
          0,
          from_lovelace(5_000_000),
          mock_script_address(0, None),
        )
      |> complete()
  giftcard.spend(None, Void, dummy_ref, tx)
}
// #endregion giftcard-tests
