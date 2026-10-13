//// Compatibility port of Anastasia-Labs/aiken-merkle-tree 0.0.1.
//// Original: https://github.com/Anastasia-Labs/aiken-merkle-tree/blob/0256f166d2c7990bc9455ddabd85f2a1571c5b50/lib/aiken_merkle_tree/mt.ak
//// Upstream ports aiken-lang/trees and Hydra's Plutus Merkle tree.
//// See VENDOR.md and LICENSE.aiken-merkle-tree for provenance and changes.
//// SHA-256 tree construction and proof semantics are unchanged.

use aiken/collection/list
use aiken/crypto.{Hash, Sha2_256, sha2_256}
use aiken/option.{choice}
use aiken/primitive/bytearray

// #region library-types
pub opaque type MerkleTree<a> {
  Empty
  Leaf { value: a, hash: Hash<Sha2_256, a> }
  Node { root: Root, left: MerkleTree<a>, right: MerkleTree<a> }
}

pub type Proof<a> =
  List<ProofItem<a>>

pub opaque type ProofItem<a> {
  Left(Root)
  Right(Root)
}

pub opaque type Root {
  inner: ByteArray,
}

// #endregion library-types

pub fn to_hash(self: Root) -> Option<Hash<Sha2_256, a>> {
  if self.inner == #"" {
    None
  } else {
    Some(self.inner)
  }
}

/// This conversion does not establish that a root came from a valid tree.
pub fn from_hash(hash: Hash<alg, a>) -> Root {
  Root(hash)
}

pub fn to_list(self: MerkleTree<a>) -> List<a> {
  when self is {
    Empty -> []
    Leaf { value, .. } -> [value]
    Node { left, right, .. } -> list.concat(to_list(left), to_list(right))
  }
}

pub fn root(self: MerkleTree<a>) -> Root {
  when self is {
    Empty -> Root(#"")
    Leaf { hash, .. } -> Root(hash)
    Node { root, .. } -> root
  }
}

pub fn equals(left: MerkleTree<a>, right: MerkleTree<a>) -> Bool {
  root(left) == root(right)
}

pub fn size(self: MerkleTree<a>) -> Int {
  when self is {
    Empty -> 0
    Leaf { .. } -> 1
    Node { left, right, .. } -> size(left) + size(right)
  }
}

pub fn is_empty(self: MerkleTree<a>) -> Bool {
  when self is {
    Empty -> True
    _ -> False
  }
}

pub fn get_proof(
  self: MerkleTree<a>,
  item: a,
  serialise: fn(a) -> ByteArray,
) -> Option<Proof<a>> {
  do_get_proof(self, sha2_256(serialise(item)), [])
}

fn do_get_proof(
  self: MerkleTree<a>,
  item_hash: Hash<Sha2_256, a>,
  proof: Proof<a>,
) -> Option<Proof<a>> {
  when self is {
    Empty -> None
    Leaf { hash, .. } ->
      if hash == item_hash {
        Some(proof)
      } else {
        None
      }
    Node { left, right, .. } -> {
      let try_left = do_get_proof(
        left,
        item_hash,
        [Right(root(right)), ..proof],
      )
      let try_right = do_get_proof(
        right,
        item_hash,
        [Left(root(left)), ..proof],
      )
      choice([try_left, try_right])
    }
  }
}

fn do_from_list(
  items: List<a>,
  len: Int,
  serialise: fn(a) -> ByteArray,
) -> MerkleTree<a> {
  when items is {
    [] -> Empty
    [value] -> Leaf { value, hash: sha2_256(serialise(value)) }
    _ -> {
      let cutoff = len / 2
      let left = do_from_list(list.take(items, cutoff), cutoff, serialise)
      let right = do_from_list(
        list.drop(items, cutoff),
        len - cutoff,
        serialise,
      )
      Node { root: combine(root(left), root(right)), left, right }
    }
  }
}

/// Tree construction is intended for off-chain use.
pub fn from_list(items: List<a>, serialise: fn(a) -> ByteArray) -> MerkleTree<a> {
  do_from_list(items, list.length(items), serialise)
}

pub fn is_member(
  root: Root,
  item: a,
  proof: Proof<a>,
  serialise: fn(a) -> ByteArray,
) -> Bool {
  verify_proof(root, sha2_256(serialise(item)), proof)
}

pub fn verify_proof(
  root: Root,
  item_hash: Hash<Sha2_256, a>,
  proof: Proof<a>,
) -> Bool {
  when proof is {
    [] -> root == Root(item_hash)
    [head, ..tail] ->
      when head is {
        Left(left) ->
          verify_proof(root, combine(left, Root(item_hash)).inner, tail)
        Right(right) ->
          verify_proof(root, combine(Root(item_hash), right).inner, tail)
      }
  }
}

/// Exposed by this port; the original module keeps combine private.
pub fn combine(left: Root, right: Root) -> Root {
  Root(sha2_256(bytearray.concat(left.inner, right.inner)))
}

// #region checked-constructors
// Checked constructors added by this port. Modern Aiken forbids opaque types
// in validator redeemers; an application converts its public wire format here.
pub fn left_sibling(hash: ByteArray) -> ProofItem<a> {
  expect bytearray.length(hash) == 32
  Left(Root(hash))
}

pub fn right_sibling(hash: ByteArray) -> ProofItem<a> {
  expect bytearray.length(hash) == 32
  Right(Root(hash))
}

// #endregion checked-constructors

test empty_tree_has_no_root_or_proof() {
  let tree = from_list([], identity)
  is_empty(tree) && size(tree) == 0 && to_hash(root(tree)) == None && get_proof(
    tree,
    "dog",
    identity,
  ) == None
}

test singleton_has_an_empty_proof() {
  let tree = from_list(["dog"], identity)
  expect Some(proof) = get_proof(tree, "dog", identity)
  proof == [] && root(tree) == from_hash(sha2_256("dog")) && is_member(
    root(tree),
    "dog",
    proof,
    identity,
  )
}

test odd_tree_uses_floor_half_split_without_padding() {
  let tree = from_list(["dog", "cat", "mouse"], identity)
  let expected = sha2_256(
    bytearray.concat(
      sha2_256("dog"),
      sha2_256(bytearray.concat(sha2_256("cat"), sha2_256("mouse"))),
    ),
  )
  expect Some(dog_proof) = get_proof(tree, "dog", identity)
  expect Some(cat_proof) = get_proof(tree, "cat", identity)
  to_hash(root(tree)) == Some(expected) && list.length(dog_proof) == 1 && list.length(
    cat_proof,
  ) == 2 && to_list(tree) == ["dog", "cat", "mouse"] && size(tree) == 3 && is_member(
    root(tree),
    "cat",
    cat_proof,
    identity,
  )
}

test wrong_leaf_does_not_use_another_members_proof() {
  let tree = from_list(["dog", "cat", "mouse"], identity)
  expect Some(proof) = get_proof(tree, "dog", identity)
  !is_member(root(tree), "cat", proof, identity) && get_proof(
    tree,
    "parrot",
    identity,
  ) == None
}
