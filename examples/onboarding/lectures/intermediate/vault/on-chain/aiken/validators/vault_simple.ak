// This is not a second contract. It is `vault.ak` as the reader has it part way
// through the track: the vault with a working rule, but no `recovery` parameter
// and no mint handler yet. Those arrive in **parameters** and **validator
// purposes**, and `vault.ak` beside this file is where the track ends up.
//
// Lectures 4, 5 and 6 render their code from here, so what those pages show is
// the file as it looks at that moment rather than the finished version carrying
// fields the reader has not met. It lives in `validators/` so the compiler
// checks it: the code in a lecture should be code that compiles, not code that
// only looks right.
//
// It therefore gets its own `vault_simple.*` entries in `plutus.json`. Nothing
// reads them. The entries that matter are `vault.vault.*`, from `vault.ak`.

use aiken/collection/list
// #region datum-imports
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}
// #endregion datum-imports

// What the tests need. `mocktail` builds a pretend transaction context, the
// thing the transaction context lecture just finished describing, and the two
// `virgin_*` modules invent the key hashes and output reference to fill it.
// #region simple-test-imports
// #region simple-fuzz-import
use aiken/fuzz
// #endregion simple-fuzz-import
use mocktail.{complete, mocktail_tx, required_signer_hash}
use mocktail/virgin_key_hash.{mock_pub_key_hash}
use mocktail/virgin_output_reference.{mock_utxo_ref}
// #endregion simple-test-imports

// The datum: who owns *this* locked UTxO. It changes from one UTxO to the next,
// so it belongs on the UTxO.
// #region types
pub type VaultDatum {
  owner: VerificationKeyHash,
}
// #endregion types

// The redeemer: the action the spender is taking. At this stage there is only
// one, which is why the vault does not yet look at it.
// #region types
pub type VaultAction {
  Unlock
}

// #endregion types

// The vault at lecture 5: it reads the owner out of the datum and asks whether
// that owner signed the transaction. One line of rule.
// #region validator
validator vault {
  spend(
    datum: Option<VaultDatum>,
    _redeemer: VaultAction,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(VaultDatum { owner }) = datum
    // #region rule
    list.has(self.extra_signatories, owner)
    // #endregion rule
  }

  else(_) {
    fail
  }
}
// #endregion validator

// Tests. The reader writes these in **testing**, against the vault as it stands
// at that point: no parameter yet, so `spend` is called with the four arguments
// the handler declares and nothing in front of them.

// #region simple-tests
// Two keys that are not each other, and one output reference the vault never
// reads. `mock_pub_key_hash` just turns a number into a valid 28-byte hash.
const owner: VerificationKeyHash = mock_pub_key_hash(1)

const stranger: VerificationKeyHash = mock_pub_key_hash(2)

const dummy_ref: OutputReference = mock_utxo_ref(0, 0)

test unlock_ok_when_the_owner_signs() {
  let tx = mocktail_tx() |> required_signer_hash(True, owner) |> complete()
  vault.spend(Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}

// The rule is only worth anything if it also says no. `fail` is how a test
// asserts refusal: this passes when the validator rejects the transaction.
test unlock_fails_for_a_stranger() fail {
  let tx = mocktail_tx() |> required_signer_hash(True, stranger) |> complete()
  vault.spend(Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}
// #endregion simple-tests

// A property, not an example: the rule has to hold for *every* owner, not just
// the one the tests happen to name. Aiken generates the keys and, if it finds a
// failure, shrinks it to the smallest one that still fails.
// #region simple-property
test unlock_ok_for_any_owner(any_owner via fuzz.bytearray()) {
  let tx = mocktail_tx() |> required_signer_hash(True, any_owner) |> complete()
  vault.spend(Some(VaultDatum { owner: any_owner }), Unlock, dummy_ref, tx)
}
// #endregion simple-property
