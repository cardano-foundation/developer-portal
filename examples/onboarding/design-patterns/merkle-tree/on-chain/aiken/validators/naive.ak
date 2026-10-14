use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use allowlist.{ListedGrant}
use cardano/transaction.{OutputReference, Transaction}
use fixtures

// #region validator
/// Any listed key may consume this entire grant, if it signs.
validator listed_grant {
  spend(
    datum: Option<ListedGrant>,
    beneficiary: VerificationKeyHash,
    _ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(grant) = datum
    allowlist.authorized(beneficiary, tx) && list.has(
      grant.members,
      beneficiary,
    )
  }

  else(_) {
    fail
  }
}

// #endregion validator

test member_can_claim_with_their_signature() {
  listed_grant.spend(
    Some(fixtures.listed()),
    fixtures.bob,
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}

test non_member_cannot_claim_even_if_they_sign() fail {
  listed_grant.spend(
    Some(fixtures.listed()),
    fixtures.stranger,
    fixtures.ref(),
    fixtures.signed_by(fixtures.stranger),
  )
}

test membership_without_the_members_signature_is_not_authorization() fail {
  listed_grant.spend(
    Some(fixtures.listed()),
    fixtures.bob,
    fixtures.ref(),
    fixtures.signed_by(fixtures.stranger),
  )
}

test missing_datum_fails() fail {
  listed_grant.spend(
    None,
    fixtures.bob,
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}

test empty_allowlist_authorizes_nobody() fail {
  listed_grant.spend(
    Some(ListedGrant { members: [] }),
    fixtures.bob,
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}
