use cardano/transaction.{OutputReference, Transaction}

// Nothing locked at this script's address can ever be spent. The Advanced
// lecture "Going to production" parks the consumer's reference script here,
// where no key, not even the one that published it, can spend it by mistake.
//
// It takes no parameters, so its address is the same for everyone who compiles
// it with the same compiler, and anyone can check that by compiling it.
// #region never
validator never {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _own_ref: OutputReference,
    _self: Transaction,
  ) {
    False
  }

  else(_) {
    fail
  }
}
// #endregion never

test nothing_is_ever_spent() fail {
  let own_ref = OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }
  never.spend(None, Void, own_ref, transaction.placeholder)
}
