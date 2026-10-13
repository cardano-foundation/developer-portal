use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken_merkle_tree/mt
use allowlist
use fixtures

// #region library-api
/// Construction and proof generation belong off-chain. These Aiken calls run
/// in unit tests to check the port and the serialization contract.
pub fn roundtrip(
  members: List<VerificationKeyHash>,
  member: VerificationKeyHash,
) -> Bool {
  let tree = mt.from_list(members, allowlist.serialise_member)
  expect !mt.is_empty(tree)
  expect Some(root_hash) = mt.to_hash(mt.root(tree))
  expect Some(proof) = mt.get_proof(tree, member, allowlist.serialise_member)
  and {
    mt.to_list(tree) == members,
    mt.size(tree) == list.length(members),
    mt.is_member(
      mt.from_hash(root_hash),
      member,
      proof,
      allowlist.serialise_member,
    ),
  }
}

// #endregion library-api

test library_api_roundtrips_the_three_member_allowlist() {
  roundtrip(fixtures.members, fixtures.bob)
}

test combining_the_two_children_matches_the_parent() {
  let left = mt.from_list([fixtures.alice], allowlist.serialise_member)
  let right = mt.from_list(
    [fixtures.bob, fixtures.carol],
    allowlist.serialise_member,
  )
  mt.to_hash(mt.combine(mt.root(left), mt.root(right))) == Some(
    fixtures.root_hash(),
  )
}
