// #region import-dict
use aiken/collection/dict
// #endregion import-dict

use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/fuzz

// #region import-policy-id
use cardano/assets.{PolicyId}
// #endregion import-policy-id

use cardano/transaction.{OutputReference, Transaction}

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

// The name of the token this policy can mint. One policy, one token name.
// #region token-name
const vault_token: ByteArray = "VAULT"
// #endregion token-name

// The vault the reader builds across the track: the owner's key for normal use,
// and a backup key welded in at build time.
//
// Three facts reach `spend`, each fixed at a different moment: `recovery` at
// build time, `owner` at lock time, and the action at spend time.
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

  else(_) {
    fail
  }
}
// #endregion vault

// A second script, with no parameter, so its hash is the same for everybody
// while the vault's moves with the recovery key. That hash is also this script's
// policy id, so it decides which tokens may exist under it: one token in, or one
// token out.
// #region mint-validator
validator vault_policy {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    expect [Pair(name, _)] = assets.tokens(self.mint, policy_id)
      |> dict.to_pairs()
    name == vault_token
  }

  else(_) {
    fail
  }
}
// #endregion mint-validator

// Tests. The reader starts them in **testing**, against the vault as it stands
// there, and extends them as the contract grows: the recovery pair in
// **parameters**, the mint trio in **validator purposes**.
//
// Each one copies `transaction.placeholder` and fills in only the field its rule
// reads. `recovery` leads every call into `vault`, the way a parameter always
// comes first in a handler, and none into `vault_policy`, which has no parameter.

// #region spend-tests
const owner: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

// #endregion spend-tests

// The backup key the vault is compiled around. It arrives in **parameters**,
// alongside the `Recover` action it guards.
// #region recover-tests
const recovery: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000003"
// #endregion recover-tests

// #region spend-tests
const dummy_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }
// #endregion spend-tests

// Stands in for the policy id the network would hand the handler.
// #region mint-tests
const policy: PolicyId =
  #"000000000000000000000000000000000000000000000000000000ff"
// #endregion mint-tests

// #region spend-tests
test unlock_ok_when_the_owner_signs() {
  let tx = Transaction { ..transaction.placeholder, extra_signatories: [owner] }
  vault.spend(recovery, Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}

test unlock_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [stranger],
  }
  vault.spend(recovery, Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}
// #endregion spend-tests

// #region recover-tests
test recover_ok_when_the_recovery_key_signs() {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [recovery],
  }
  vault.spend(recovery, Some(VaultDatum { owner }), Recover, dummy_ref, tx)
}

// The important one: the two actions are genuinely separate. Being the owner
// does not let you take the `Recover` path, and vice versa.
test recover_fails_when_the_owner_signs() fail {
  let tx = Transaction { ..transaction.placeholder, extra_signatories: [owner] }
  vault.spend(recovery, Some(VaultDatum { owner }), Recover, dummy_ref, tx)
}
// #endregion recover-tests

// A property, not an example: the rule has to hold for *every* owner, not just
// the one the tests happen to name. Aiken generates the keys and, if it finds a
// failure, shrinks it to the smallest one that still fails.
// #region vault-property
test unlock_ok_for_any_owner(any_owner via fuzz.bytearray()) {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [any_owner],
  }
  vault.spend(
    recovery,
    Some(VaultDatum { owner: any_owner }),
    Unlock,
    dummy_ref,
    tx,
  )
}
// #endregion vault-property

// #region mint-tests
test mint_ok_for_a_correctly_named_token() {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(policy, vault_token, 1),
  }
  vault_policy.mint(Void, policy, tx)
}

test burn_ok_for_a_correctly_named_token() {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(policy, vault_token, -1),
  }
  vault_policy.mint(Void, policy, tx)
}

test mint_fails_for_a_wrongly_named_token() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(policy, "IMPOSTOR", 1),
  }
  vault_policy.mint(Void, policy, tx)
}
// #endregion mint-tests
