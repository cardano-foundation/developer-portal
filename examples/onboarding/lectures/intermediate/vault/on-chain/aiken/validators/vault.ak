use aiken/collection/list
use aiken/fuzz
use aiken/crypto.{VerificationKeyHash}

// #region import-policy-id
use cardano/assets.{PolicyId}
// #endregion import-policy-id

use cardano/transaction.{OutputReference, Transaction}

// #region import-token-minted
use cocktail.{token_minted}
// #endregion import-token-minted

// #region spend-test-imports
use mocktail.{complete, mocktail_tx, required_signer_hash}
use mocktail/virgin_key_hash.{mock_pub_key_hash}
use mocktail/virgin_output_reference.{mock_utxo_ref}
// #endregion spend-test-imports

// The mint tests need two more helpers. They live in modules already imported
// above, and Aiken takes them on their own lines, so the reader adds these
// rather than editing the lines they already have.
// #region mint-test-imports
use mocktail.{mint}
use mocktail/virgin_key_hash.{mock_script_hash}
// #endregion mint-test-imports

// The datum: who owns *this* locked UTxO. It changes from one UTxO to the next,
// so it belongs on the UTxO.
// #region types
pub type VaultDatum {
  owner: VerificationKeyHash,
}
// #endregion types

// The redeemer: which of the two actions the spender is taking.
// #region types
pub type VaultAction {
  Unlock
  Recover
}

// #endregion types

// The name of the token this vault can mint. One script, one token.
// #region token-name
const vault_token: ByteArray = "VAULT"
// #endregion token-name

// The vault the reader builds across the track: the owner's key, a backup key
// welded in at build time, and a token of its own.
//
// `spend` guards the locked UTxO. Three facts reach it, each fixed at a
// different moment: `recovery` at build time, `owner` at lock time, and the
// action at spend time.
//
// `mint` guards the token: the same hash is this script's policy id, so it also
// decides which tokens may exist under it. One token in, or one token out.
// #region vault
validator vault(recovery: VerificationKeyHash) {
  spend(
    datum: Option<VaultDatum>,
    redeemer: VaultAction,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(VaultDatum { owner }) = datum
    when redeemer is {
      Unlock -> list.has(self.extra_signatories, owner)
      Recover -> list.has(self.extra_signatories, recovery)
    }
  }

  // #region mint-handler
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    or {
      token_minted(self.mint, policy_id, vault_token, 1),
      token_minted(self.mint, policy_id, vault_token, -1),
    }
  }
  // #endregion mint-handler

  else(_) {
    fail
  }
}

// #endregion vault

// Tests. The reader starts them in **testing**, against the vault as it stands
// there, and extends them as the contract grows: the recovery pair in
// **parameters**, the mint trio in **validator purposes**.
//
// Every call passes `recovery` first, the way a parameter always comes first in
// a handler. That is the edit **parameters** makes to the tests written in
// **testing**, where the vault had no parameter to pass.

// #region spend-tests
const owner: VerificationKeyHash = mock_pub_key_hash(1)

const stranger: VerificationKeyHash = mock_pub_key_hash(2)
// #endregion spend-tests

// The backup key the vault is compiled around. It arrives in **parameters**,
// alongside the `Recover` action it guards.
// #region recover-tests
const recovery: VerificationKeyHash = mock_pub_key_hash(3)
// #endregion recover-tests

// #region spend-tests
const dummy_ref: OutputReference = mock_utxo_ref(0, 0)
// #endregion spend-tests

// #region mint-tests
const policy: PolicyId = mock_script_hash(0)
// #endregion mint-tests

// #region spend-tests
test unlock_ok_when_the_owner_signs() {
  let tx = mocktail_tx() |> required_signer_hash(True, owner) |> complete()
  vault.spend(recovery, Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}

test unlock_fails_for_a_stranger() fail {
  let tx = mocktail_tx() |> required_signer_hash(True, stranger) |> complete()
  vault.spend(recovery, Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}

// #endregion spend-tests

// #region recover-tests
test recover_ok_when_the_recovery_key_signs() {
  let tx = mocktail_tx() |> required_signer_hash(True, recovery) |> complete()
  vault.spend(recovery, Some(VaultDatum { owner }), Recover, dummy_ref, tx)
}

// The important one: the two actions are genuinely separate. Being the owner
// does not let you take the `Recover` path, and vice versa.
test recover_fails_when_the_owner_signs() fail {
  let tx = mocktail_tx() |> required_signer_hash(True, owner) |> complete()
  vault.spend(recovery, Some(VaultDatum { owner }), Recover, dummy_ref, tx)
}
// #endregion recover-tests

// A property, not an example: the rule has to hold for *every* owner, not just
// the one the tests happen to name. Aiken generates the keys and, if it finds a
// failure, shrinks it to the smallest one that still fails.
// #region vault-property
test unlock_ok_for_any_owner(any_owner via fuzz.bytearray()) {
  let tx = mocktail_tx() |> required_signer_hash(True, any_owner) |> complete()
  vault.spend(recovery, Some(VaultDatum { owner: any_owner }), Unlock, dummy_ref, tx)
}
// #endregion vault-property

// The parameter comes first in every handler, `mint` included.
// #region mint-tests
test mint_ok_for_a_single_token() {
  let tx = mocktail_tx() |> mint(True, 1, policy, vault_token) |> complete()
  vault.mint(recovery, Void, policy, tx)
}

test burn_ok_for_a_single_token() {
  let tx = mocktail_tx() |> mint(True, -1, policy, vault_token) |> complete()
  vault.mint(recovery, Void, policy, tx)
}

test mint_fails_for_more_than_one() fail {
  let tx = mocktail_tx() |> mint(True, 2, policy, vault_token) |> complete()
  vault.mint(recovery, Void, policy, tx)
}
// #endregion mint-tests
