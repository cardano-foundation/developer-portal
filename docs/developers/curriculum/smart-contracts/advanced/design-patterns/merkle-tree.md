---
id: merkle-tree
title: Merkle Tree
sidebar_label: Merkle tree
description: An on-chain Merkle tree for Cardano. Build the tree off-chain and verify membership on-chain from a root hash and a log-sized proof.
---

A **Merkle tree** summarizes a large set of items in a single **root hash**, and lets anyone prove that one item belongs to the set with a proof whose size grows only with the logarithm of the set. On Cardano that is the useful property: a contract stores just the 32-byte root in its datum and verifies membership on-chain from a small proof, while the tree itself is built off-chain. The [aiken-merkle-tree](https://github.com/Anastasia-Labs/aiken-merkle-tree) library packages this for Aiken.

For the hashing fundamentals (why the structure is tamper-evident and why proofs are log-sized), see [Cryptographic primitives](/docs/developers/curriculum/fundamentals/cryptographic-primitives#how-do-merkle-trees-enable-efficient-verification). The recap below is enough to use it.

## How it works

Each leaf holds the hash of one item, each parent holds the hash of its two children, and the single root at the top is a fingerprint of everything below it.

```text
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

1. Hash each item: `Hash(A)`, `Hash(B)`, `Hash(C)`, `Hash(D)`.
2. Concatenate and hash siblings: `Hash(Hash(A) + Hash(B))`, and likewise for C and D.
3. Hash those two together to get the root.

Two properties make it useful on-chain:

- **Tamper-evident.** Changing any leaf cascades new hashes all the way to the root, so the root no longer matches. Any alteration is detectable.
- **Cheap membership proofs.** To prove an item is in the set, you supply only the sibling hashes along its path to the root, about `log2(n)` of them, not the whole tree.

## Verifying membership on-chain

Because building the tree is expensive, you construct it and its proofs **off-chain** and only **verify** on-chain. A spending validator stores the root in its datum and checks a proof supplied in the redeemer:

```aiken
use aiken_merkle_tree/mt.{Proof, Root, is_member}

type MyDatum {
  merkle_root: Root,
}

type MyRedeemer {
  my_proof: Proof<ByteArray>,
  user_data: ByteArray,
}

validator {
  fn spend_validator(datum: MyDatum, redeemer: MyRedeemer, _ctx: ScriptContext) {
    let MyDatum { merkle_root } = datum
    let MyRedeemer { my_proof, user_data } = redeemer
    is_member(merkle_root, user_data, my_proof, identity)
  }
}
```

The library exposes the operations you build on:

- `from_list` / `to_list`: build a tree from a list of serialized items, and back.
- `root`: the tree's root hash; `size` and `is_empty`: its element count and emptiness.
- `get_proof`: build a membership proof for an element (off-chain).
- `is_member`: verify an element against a root and proof (the on-chain check).
- `combine`: hash two child roots into their parent.

The full implementation and the off-chain builder are in the [aiken-merkle-tree repository](https://github.com/Anastasia-Labs/aiken-merkle-tree); it ports the [aiken-lang/trees](https://github.com/aiken-lang/trees) `mt.ak` module, which derives from Hydra's Plutus Merkle tree and uses SHA-256 throughout. (The validator above shows the pattern; check the repository for the current Aiken API.)

## Case study

For a real-world application on Cardano, sidechain-to-main-chain token transfers, see [Cardano Sidechain Toolkit: main-chain Plutus scripts](https://docs.cardano.org/cardano-sidechains/sidechain-toolkit/mainchain-plutus-scripts/), which walks the workflow end to end.

## Related

- [Cryptographic primitives](/docs/developers/curriculum/fundamentals/cryptographic-primitives#how-do-merkle-trees-enable-efficient-verification): the hashing fundamentals behind the tree.
- [Linked list](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/linked-list) and [Trie](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/trie): other on-chain data structures.
