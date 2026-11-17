use aiken/cbor
use aiken/crypto.{Blake2b_224, Hash, blake2b_224}
use aiken_design_patterns/parameter_validation.{Parameter}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{member_key, spend_after, stranger_key, terms}
use lockups.{Terms}

// #region lockup-terms
/// A lock-up whose terms are a parameter of any size. The script holds only
/// their hash, which is always 28 bytes. Every spend states the terms in its
/// redeemer, and the wrapper checks they hash to the parameter.
validator lockup_terms(terms_hash: Hash<Blake2b_224, Terms>) {
  spend(
    _datum: Option<Data>,
    redeemer: Parameter<Terms>,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    let terms <- parameter_validation.wrapper_no_redeemer(
      terms_hash,
      fn(terms) { cbor.serialise(terms) },
      redeemer,
    )
    lockups.unlocked(self, terms.owner, terms.unlock_at)
  }

  else(_) {
    fail
  }
}

// #endregion lockup-terms

test withdraw_ok_with_the_terms_it_was_made_with() {
  let hash = blake2b_224(cbor.serialise(terms))
  lockup_terms.spend(
    hash,
    None,
    Parameter { param: terms },
    fixtures.ref(0),
    spend_after(member_key),
  )
}

// Terms with an earlier date do not hash to the parameter.
test withdraw_fails_with_other_terms() fail {
  let hash = blake2b_224(cbor.serialise(terms))
  let earlier = Terms { ..terms, unlock_at: 0 }
  lockup_terms.spend(
    hash,
    None,
    Parameter { param: earlier },
    fixtures.ref(0),
    spend_after(member_key),
  )
}

test withdraw_fails_without_the_owner_even_with_correct_terms() fail {
  lockup_terms.spend(
    blake2b_224(cbor.serialise(terms)),
    None,
    Parameter { param: terms },
    fixtures.ref(0),
    spend_after(stranger_key),
  )
}
