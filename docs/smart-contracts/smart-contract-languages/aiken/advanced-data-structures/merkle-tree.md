---
id: merkle-tree
title: Merkle Tree
sidebar_label: Merkle Tree
description: A Merkle tree structure designed following the Aiken methodology.
---

## Introduction

The Aiken Merkle Tree project provides a Plutarch-based implementation of Merkle Trees for the Cardano blockchain. This project allows developers to leverage the security and efficiency of Merkle Trees in their Cardano smart contracts, ensuring data integrity and efficient data verification.

:::info 
The github repository introducing these data structures can be found [here](https://github.com/Anastasia-Labs/aiken-merkle-tree).
:::

## Documentation

### Merkle Tree

A Merkle tree, named after its inventor Ralph Merkle, is a fundamental data structure in computer science and cryptography. It's particularly well-suited for managing and verifying large data structures, especially in distributed systems like blockchain technologies. Here's a detailed explanation:

#### Basic concept

A Merkle tree is a type of binary tree, consisting of nodes. Here's how it's structured:

- **Leaf Nodes**: These are the bottom-most nodes in the tree and contain hashed data. The data could be transactions (as in blockchain), files, or any data chunks.
- **Non-Leaf (Intermediate) Nodes**: These nodes store a cryptographic hash of the combined data of their child nodes.
- **Root Node**: The single node at the top of the tree contains a hash formed by its child nodes, ultimately representing the hashes of all lower levels.

#### Hash function

The core of a Merkle tree is the hash function (like SHA-256 in Bitcoin). This function takes digital data of any size and produces a fixed-size string of bytes, typically a unique digital fingerprint of the input data.

#### Construction

- **Hashing the Data**: First, each piece of data at the leaf level is hashed.
- **Pairing and Hashing Upwards**: These hashes are then paired and concatenated, and the resultant string is hashed again. This process continues until you reach the single hash at the top - the root hash.
- **Tree Structure**: This process creates a tree-like structure where each parent node is a hash of its children, providing a secure and efficient means of verifying the contents of the tree.

#### Features

- **Efficiency in Verification**: To verify any single data chunk's integrity, you don't need to download the entire tree. You only need the hashes of the nodes along the path from your data chunk to the root.
- **Tamper-Proof**: Any change in a leaf node (data) will result in a completely different root hash through a cascading effect of changes in the intermediate hashes. This makes it easy to detect alterations.
- **Concurrency Friendly**: Multiple branches of the tree can be processed simultaneously, making Merkle trees highly efficient for parallel processing.

#### Example

Consider a Merkle tree with four leaf nodes (A, B, C, D).

```
                      Merkle Root
                            |
                +-----------+-----------+
                |                       |
            Hash(A+B)               Hash(C+D)
                |                       |
            +---+---+               +---+---+
            |       |               |       |
            Hash(A) Hash(B)     Hash(C) Hash(D)
```

1. Each of A, B, C, and D is hashed: Hash(A), Hash(B), Hash(C), Hash(D).
2. The hashes of A and B are combined and hashed: Hash(Hash(A) + Hash(B)). Similarly for C and D.
3. The hash results from step 2 are combined and hashed to give the Merkle root.

Thus, the Merkle root is a digest of all the data in the leaf nodes.

In conclusion, Merkle trees offer a secure and efficient way to summarize and verify large data sets.

### Aiken Merkle Tree implementation

The Aiken Merkle Tree implementation provides several functions to create and manipulate Merkle Trees. Below is a brief overview of each function:

-`from_list`: Constructs a Merkle Tree from a list of serialized data.

-`to_list`: Deconstructs a Merkle Tree back into a list of elements.

-`root`: Retrieves the root hash of a Merkle Tree.

-`is_empty`: Checks if a Merkle Tree is empty.

-`size`: Returns the number of leaf nodes in a Merkle Tree.

-`get_proof`: Generates a proof of membership for an element in the Merkle Tree.

-`is_member`: Verifies if an element is part of a Merkle Tree using a proof.

-`combine`: Combines two hashes into a new one.

## Validator Logic

```aiken
// /**
//  * This file contains the implementation of a spend_validator function that validates a spend transaction
//  * using a Merkle tree. It also includes a test case for the spend_validator function.
//  */

use aiken/transaction.{OutputReference, ScriptContext, Spend, TransactionId}
use aiken_merkle_tree/mt.{Proof, Root, from_list, get_proof, is_member, root}

type MyDatum {
  merkle_root: Root,
}

type MyRedeemer {
  my_proof: Proof<ByteArray>,
  user_data: ByteArray,
}

// /**
//  * The spend_validator function validates a spend transaction by checking if the user data is a member of
//  * the Merkle tree with the given Merkle root and proof.
//  *
//  * @param datum - The MyDatum object containing the Merkle root.
//  * @param redeemer - The MyRedeemer object containing the proof and user data.
//  * @param _ctx - The ScriptContext.
//  */
validator {
  fn spend_validator(datum: MyDatum, redeemer: MyRedeemer, _ctx: ScriptContext) {
    let MyDatum { merkle_root } = datum
    let MyRedeemer { my_proof, user_data } = redeemer
    is_member(merkle_root, user_data, my_proof, identity)
  }
}

// /**
//  * Test case for the spend_validator function.
//  */
test spend_validator_1() {
  let data =
    ["dog", "cat", "mouse"]
  let merkle_tree = from_list(data, identity)
  let datum = MyDatum { merkle_root: root(merkle_tree) }
  expect Some(proof) = get_proof(merkle_tree, "cat", identity)
  let redeemer = MyRedeemer { my_proof: proof, user_data: "cat" }
  let placeholder_utxo =
    OutputReference { transaction_id: TransactionId(""), output_index: 0 }
  let context =
    ScriptContext {
      purpose: Spend(placeholder_utxo),
      transaction: transaction.placeholder(),
    }
  spend_validator(datum, redeemer, context)
}
```

### Library

```aiken
// This code is sourced from https://github.com/aiken-lang/trees/blob/main/lib/aiken/trees/mt.ak
//
// A purely functional implementation of MerkleTrees that is suitable for
// usage on-chain. Note, however, that the construction of 'MerkleTree' and
// membership proofs are still expected to happen *off-chain* while only the
// proof verification should be done on-chain.
//
// This implementation uses exclusively SHA-256 as a hashing algorithm.
//
// The code ported to Aiken from [Hydra](https://github.com/input-output-hk/hydra/blob/master/plutus-merkle-tree/src/Plutus/MerkleTree.hs)

use aiken/bytearray
use aiken/hash.{Hash, Sha2_256, sha2_256}
use aiken/list
use aiken/option.{choice, is_none}

/// An opaque representation of a [MerkleTree](#MerkleTree). See
/// [from_list](#from_list) to construct a tree from a list of elements.
pub opaque type MerkleTree<a> {
  Empty
  Leaf { value: a, hash: Hash<Sha2_256, a> }
  Node { root: Root, left: MerkleTree<a>, right: MerkleTree<a> }
}

/// A proof of existence in the tree. See:
///
/// - [`get_proof`](#get_proof) to construct a proof from a given element.
/// - [`is_member`](#is_member) to verify a given proof against a known root.
///
pub type Proof<a> =
  List<ProofItem<a>>

/// An opaque proof element.
pub opaque type ProofItem<a> {
  Left(Root)
  Right(Root)
}

/// An opaque root. Use [to_hash](#to_hash) and
/// [from_hash](#from_hash) to convert back-and-forth between this and
/// classic hashes. This type exists mainly to disambiguate between standard
/// value (leaf) hash from tree hashes.
pub opaque type Root {
  inner: ByteArray,
}

/// Convert a [Root](#Root) into a simple [Hash](https://aiken-lang.github.io/stdlib/aiken/hash.html#Hash), when possible.
///
/// Roots from empty trees have no hash whatsoever.
pub fn to_hash(self: Root) -> Option<Hash<Sha2_256, a>> {
  if self.inner == "" {
    None
  } else {
    Some(self.inner)
  }
}

/// Convert any [Hash](https://aiken-lang.github.io/stdlib/aiken/hash.html#Hash) into a merkle [Root](#Root).
///
/// This operation is _unsafe_ unless you are sure that the given hash digest was produced from a valid merkle tree.
pub fn from_hash(hash: Hash<alg, a>) -> Root {
  Root(hash)
}

/// Deconstruct a [MerkleTree](#MerkleTree) back to a list of elements.
pub fn to_list(self: MerkleTree<a>) -> List<a> {
  when self is {
    Empty ->
      []
    Leaf { value, .. } ->
      [value]
    Node { left, right, .. } -> list.concat(to_list(left), to_list(right))
  }
}

test to_list_1() {
  let items =
    []
  to_list(from_list(items, identity)) == items
}

test to_list_2() {
  let items =
    ["dog"]
  to_list(from_list(items, identity)) == items
}

test to_list_3() {
  let items =
    ["dog", "cat", "mouse"]
  to_list(from_list(items, identity)) == items
}

/// Returns the [Root](#Root) of a given [MerkleTree](#MerkleTree).
pub fn root(self: MerkleTree<a>) -> Root {
  when self is {
    Empty -> Root("")
    Leaf { hash, .. } -> Root(hash)
    Node { root, .. } -> root
  }
}

test root_1() {
  from_list([], identity)
    |> root
    |> to_hash
    |> is_none
}

test root_2() {
  let dog = "dog"
  let mt = from_list([dog], identity)
  root(mt) == from_hash(sha2_256(dog))
}

test root_3() {
  let dog = "dog"
  let cat = "cat"
  let mouse = "mouse"

  let hash =
    "mouse"
      |> sha2_256
      |> bytearray.concat(sha2_256(cat), _)
      |> sha2_256
      |> bytearray.concat(sha2_256(dog), _)
      |> sha2_256

  to_hash(root(from_list([dog, cat, mouse], identity))) == Some(hash)
}

/// Cheap equality of two [MerkleTrees](#MerkleTree) by comparing their root
/// hashes. For large trees, this is much faster than using `==`.
pub fn equals(left: MerkleTree<a>, right: MerkleTree<a>) -> Bool {
  root(left) == root(right)
}

/// Returns a total numbers of elements in the tree.
pub fn size(self: MerkleTree<a>) -> Int {
  when self is {
    Empty -> 0
    Leaf { .. } -> 1
    Node { left, right, .. } -> size(left) + size(right)
  }
}

test size_1() {
  let items =
    []
  size(from_list(items, identity)) == 0
}

test size_2() {
  let items =
    ["dog"]
  size(from_list(items, identity)) == 1
}

test size_3() {
  let items =
    ["dog", "cat", "mouse"]
  size(from_list(items, identity)) == 3
}

/// Returns `True` when the tree has no elements. False otherwise.
pub fn is_empty(self: MerkleTree<a>) -> Bool {
  when self is {
    Empty -> True
    _ -> False
  }
}

test is_empty_1() {
  is_empty(from_list([], identity))
}

test is_empty_2() {
  !is_empty(from_list(["dog"], identity))
}

/// Construct a membership [Proof](#Proof) from an element and a [MerkleTree](#MerkleTree).
///
/// Returns 'None' when the element isn't a member of the tree to begin with.
///
/// Note that the proof is empty (i.e. []) for trees that have a single element.
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
      let try_left =
        do_get_proof(left, item_hash, [Right(root(right)), ..proof])
      let try_right =
        do_get_proof(right, item_hash, [Left(root(left)), ..proof])
      choice([try_left, try_right])
    }
  }
}

test get_proof_1() {
  from_list([], identity)
    |> get_proof("dog", identity)
    |> is_none
}

test get_proof_2() {
  from_list(["dog", "cat", "mouse", "horse", "pig", "bull"], identity)
    |> get_proof("parrot", identity)
    |> is_none
}

test get_proof_3() {
  let mt = from_list(["dog"], identity)
  expect Some(proof) = get_proof(mt, "dog", identity)
  proof == [] && is_member(root(mt), "dog", proof, identity)
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
      let cutoff: Int = len / 2
      let left =
        items
          |> list.take(cutoff)
          |> do_from_list(cutoff, serialise)
      let right =
        items
          |> list.drop(cutoff)
          |> do_from_list(len - cutoff, serialise)
      let root = combine(root(left), root(right))
      Node { root, left, right }
    }
  }
}

/// Construct a 'MerkleTree' from a list of values.
///
/// Note that, while this operation is doable on-chain, it is expensive and
/// preferably done off-chain.
pub fn from_list(items: List<a>, serialise: fn(a) -> ByteArray) -> MerkleTree<a> {
  do_from_list(items, list.length(items), serialise)
}

test from_list_1() {
  from_list([], identity) == Empty
}

test from_list_2() {
  let dog = "dog"
  from_list([dog], identity) == Leaf { value: dog, hash: sha2_256(dog) }
}

test from_3() {
  let dog = "dog"
  let cat = "cat"

  from_list([dog, cat], identity) == Node {
    root: combine(Root(sha2_256(dog)), Root(sha2_256(cat))),
    left: Leaf { value: dog, hash: sha2_256(dog) },
    right: Leaf { value: cat, hash: sha2_256(cat) },
  }
}

test from_list_4() {
  let dog = "dog"
  let cat = "cat"
  let mouse = "mouse"

  let root_hash =
    sha2_256(mouse)
      |> bytearray.concat(sha2_256(cat), _)
      |> sha2_256
      |> bytearray.concat(sha2_256(dog), _)
      |> sha2_256

  root(from_list([dog, cat, mouse], identity)) == from_hash(root_hash)
}

/// Check whether an element is part of a [MerkleTree](#MerkleTree) using only
/// its [root_hash](#root_hash) and a [Proof](#Proof).
///
/// The proof (and verification) is guaranteed to be in log(n) of the size of
/// the tree, which is / why such data-structures are interesting.
pub fn is_member(
  root: Root,
  item: a,
  proof: Proof<a>,
  serialise: fn(a) -> ByteArray,
) -> Bool {
  verify_proof(root, sha2_256(serialise(item)), proof)
}

/// An alternative version of [is_member](#is_member) where the element to
/// check is directly provided as hash. This assumes the hash preimage was
/// produced using same serialization method as for constructing the tree.
///
/// Returns `True` when the `Proof` is valid for the provided element hash
/// digest and tree root. Said differently, returns `True` when the
/// original element is indeed part of the tree. Returns `False` otherwise.
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

test get_proof_is_member_1() {
  let dog = "dog"
  let cat = "cat"
  let mouse = "mouse"
  let mt = from_list([dog, cat, mouse], identity)

  expect Some(dog_proof) = get_proof(mt, dog, identity)
  expect Some(cat_proof) = get_proof(mt, cat, identity)
  expect Some(mouse_proof) = get_proof(mt, mouse, identity)

  let all_members =
    is_member(root(mt), dog, dog_proof, identity)? && is_member(
      root(mt),
      cat,
      cat_proof,
      identity,
    )? && is_member(root(mt), mouse, mouse_proof, identity)?

  let check_sizes =
    (list.length(dog_proof) == 1)? && (list.length(cat_proof) == 2)? && (list.length(
      mouse_proof,
    ) == 2)?

  all_members? && check_sizes?
}

test get_proof_is_member_2() {
  let dog = "dog"
  let cat = "cat"
  let mouse = "mouse"
  let mt = from_list([dog, cat, mouse], identity)

  expect Some(dog_proof) = get_proof(mt, dog, identity)

  !is_member(root(mt), cat, dog_proof, identity)
}

// ----- Internal

fn combine(left: Root, right: Root) -> Root {
  bytearray.concat(left.inner, right.inner)
    |> sha2_256
    |> Root
}
```

## Case study

For an in-depth real-world case study on the application of Merkle Trees within the Cardano blockchain environment, particularly in the context of sidechain to main chain token transfers, refer to the following resource:

[Cardano Sidechain Toolkit - Main Chain Plutus Scripts](https://docs.cardano.org/cardano-sidechains/sidechain-toolkit/mainchain-plutus-scripts/)

This case study provides valuable insights into how Merkle Trees are integrated into blockchain transactions, offering practical examples and detailed workflows.

## Acknowledgments

This library takes the Aiken code from the aiken-lang.

The repository can be found at [https://github.com/aiken-lang/trees](https://github.com/aiken-lang/trees)