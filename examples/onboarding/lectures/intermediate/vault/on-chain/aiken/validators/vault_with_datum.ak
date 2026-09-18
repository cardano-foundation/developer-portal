// The vault at **datum & redeemer**: the two shapes are written, and the
// handler insists on being handed a datum it can read. The rule is still
// `True`, so it still gives the funds to anybody; the owner starts deciding
// things one lecture later, in `vault_simple.ak`.
//
// It sits in `validators/` so the compiler checks it and `aiken build` writes
// its hash, which is the hash that lecture publishes. Nothing off-chain reads
// the `vault_with_datum.*` entries in `plutus.json`.

use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}

pub type VaultDatum {
  owner: VerificationKeyHash,
}

pub type VaultAction {
  Unlock
}

validator vault {
  spend(
    datum: Option<VaultDatum>,
    _redeemer: VaultAction,
    _own_ref: OutputReference,
    _self: Transaction,
  ) {
    expect Some(VaultDatum { owner }) = datum
    True
  }

  else(_) {
    fail
  }
}
