use cardano/transaction.{OutputReference, Transaction}

// The smallest contract that needs a parameter. 
// `guess` is welded in at build time, so every UTxO at this address opens with
// the same number.
// #region guesser
validator guesser(guess: Int) {
  spend(
    _datum: Option<Data>,
    redeemer: Int,
    _own_ref: OutputReference,
    _self: Transaction,
  ) {
    redeemer == guess
  }

  else(_) {
    fail
  }
}
// #endregion guesser
