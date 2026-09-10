// The vault at **what is a validator**: a `spend` handler that says yes to
// everybody. It sits in `validators/` so the compiler checks it and `aiken
// build` writes its hash, which is the hash that lecture publishes. Nothing
// off-chain reads the `vault_always_true.*` entries in `plutus.json`.

validator vault {
  spend(_datum: Option<Data>, _redeemer: Data, _own_ref, _self) {
    True
  }

  else(_) {
    fail
  }
}
