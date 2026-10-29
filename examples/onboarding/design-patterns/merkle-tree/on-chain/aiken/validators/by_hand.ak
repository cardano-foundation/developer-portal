use allowlist.{Claim, CommittedGrant, Proof}
use cardano/transaction.{OutputReference, Transaction}
use fixtures
use merkle

// #region validator
validator committed_grant {
  spend(
    datum: Option<CommittedGrant>,
    claim: Claim<Proof>,
    _ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(grant) = datum
    allowlist.authorized(claim.beneficiary, tx) && merkle.is_member(
      grant.root,
      claim.beneficiary,
      claim.proof,
    )
  }

  else(_) {
    fail
  }
}

// #endregion validator

test member_can_claim_using_the_datum_root() {
  committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.bob, proof: fixtures.bob_proof() },
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}

test another_members_proof_does_not_authorize_a_stranger() fail {
  committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.stranger, proof: fixtures.bob_proof() },
    fixtures.ref(),
    fixtures.signed_by(fixtures.stranger),
  )
}

test proof_without_signature_fails() fail {
  committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.bob, proof: fixtures.bob_proof() },
    fixtures.ref(),
    fixtures.signed_by(fixtures.stranger),
  )
}

test sibling_direction_matters() fail {
  let wrong = [
    allowlist.Left { hash: fixtures.leaf(fixtures.carol) },
    allowlist.Left { hash: fixtures.leaf(fixtures.alice) },
  ]
  committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.bob, proof: wrong },
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}

test truncated_proof_fails() fail {
  committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.bob, proof: [] },
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}
