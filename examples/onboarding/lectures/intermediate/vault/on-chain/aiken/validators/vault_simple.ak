// `vault.ak` part way through the track: no `recovery` parameter, no minting
// policy. Lectures 4, 5 and 6 render from here, so their pages show the file as
// it looked at that point. It sits in `validators/` so the compiler checks it,
// which is also why `plutus.json` carries `vault_simple.*` entries nothing reads.

use aiken/collection/list
// #region datum-imports
use aiken/crypto.{VerificationKeyHash}
// #endregion datum-imports

// The generators the property test draws its keys from. Added in **testing**.
// #region simple-fuzz-import
use aiken/fuzz
use cardano/transaction.{OutputReference, Transaction}

// #endregion simple-fuzz-import

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
//
// The two `trace` lines belong to **testing**, which renders `trace-example` to
// show them in place. Lecture 5 renders `validator` with `traces` omitted, so it
// still shows the handler without them, and `aiken build` strips them either
// way, which is why the hash lecture 5 publishes does not move.
// #region validator
validator vault {
  spend(
    datum: Option<VaultDatum>,
    _redeemer: VaultAction,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    // #region trace-example
    expect Some(VaultDatum { owner }) = datum
    // #region traces
    trace @"checking the vault"
    trace @"signers": self.extra_signatories
    // #endregion traces
    // #region rule
    list.has(self.extra_signatories, owner)
    // #endregion rule
    // #endregion trace-example
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
// reads. A key hash is 28 bytes, so any 28 bytes stand in for one.
const owner: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

const dummy_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// `transaction.placeholder` is an empty transaction context. `..` copies it and
// fills in the one field this rule reads.
test unlock_ok_when_the_owner_signs() {
  let tx = Transaction { ..transaction.placeholder, extra_signatories: [owner] }
  vault.spend(Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}

// The rule is only worth anything if it also says no. `fail` is how a test
// asserts refusal: this passes when the validator rejects the transaction.
test unlock_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [stranger],
  }
  vault.spend(Some(VaultDatum { owner }), Unlock, dummy_ref, tx)
}

// #endregion simple-tests

// A property, not an example: the rule has to hold for *every* owner, not just
// the one the tests happen to name. Aiken generates the keys and, if it finds a
// failure, shrinks it to the smallest one that still fails.
// #region simple-property
test unlock_ok_for_any_owner(any_owner via fuzz.bytearray()) {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [any_owner],
  }
  vault.spend(Some(VaultDatum { owner: any_owner }), Unlock, dummy_ref, tx)
}
// #endregion simple-property

// The smallest test in the language. **Testing** shows it first, so the reader
// meets the shape before the vault's own tests arrive.
// #region test-shape
test one_plus_one_is_two() {
  1 + 1 == 2
}
// #endregion test-shape

// The question the vault's rule asks, written with the pipe operator, so `|>`
// is familiar by the time the minting policy uses it in **validator purposes**.
// #region pipe
test the_owner_is_in_the_list() {
  [owner, stranger] |> list.has(owner)
}
// #endregion pipe
