use aiken/primitive/bytearray
use aiken_merkle_tree/mt
use allowlist.{Claim, CommittedGrant, Proof}
use cardano/transaction.{OutputReference, Transaction}
use fixtures
use library_proof

// #region validator
validator committed_grant {
  spend(
    datum: Option<CommittedGrant>,
    claim: Claim<Proof>,
    _ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(grant) = datum
    expect allowlist.authorized(claim.beneficiary, tx)
    expect bytearray.length(grant.root) == 32
    let proof = library_proof.from_public(claim.proof)
    mt.is_member(
      mt.from_hash(grant.root),
      claim.beneficiary,
      proof,
      allowlist.serialise_member,
    )
  }

  else(_) {
    fail
  }
}

// #endregion validator

test member_can_claim_with_a_library_generated_proof() {
  let tree = mt.from_list(fixtures.members, allowlist.serialise_member)
  expect Some(proof) = mt.get_proof(
    tree,
    fixtures.bob,
    allowlist.serialise_member,
  )
  proof == library_proof.from_public(fixtures.bob_proof()) && committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.bob, proof: fixtures.bob_proof() },
    fixtures.ref(),
    fixtures.signed_by(fixtures.bob),
  )
}

test library_root_matches_the_independent_hand_written_fixture() {
  let tree = mt.from_list(fixtures.members, allowlist.serialise_member)
  mt.to_hash(mt.root(tree)) == Some(fixtures.root_hash())
}

test public_proof_conversion_matches_the_library() {
  let tree = mt.from_list(fixtures.members, allowlist.serialise_member)
  expect Some(proof) = mt.get_proof(
    tree,
    fixtures.bob,
    allowlist.serialise_member,
  )
  let library_data: Data = proof
  let hand_data: Data = library_proof.from_public(fixtures.bob_proof())
  library_data == hand_data
}

test a_proof_for_another_member_fails() fail {
  let tree = mt.from_list(fixtures.members, allowlist.serialise_member)
  expect Some(_proof) = mt.get_proof(
    tree,
    fixtures.bob,
    allowlist.serialise_member,
  )
  committed_grant.spend(
    Some(fixtures.grant()),
    Claim { beneficiary: fixtures.stranger, proof: fixtures.bob_proof() },
    fixtures.ref(),
    fixtures.signed_by(fixtures.stranger),
  )
}
