# Merkle-tree compatibility module

`lib/aiken_merkle_tree/mt.ak` ports the standalone
[`Anastasia-Labs/aiken-merkle-tree` tag `0.0.1`](https://github.com/Anastasia-Labs/aiken-merkle-tree/tree/0.0.1),
commit `0256f166d2c7990bc9455ddabd85f2a1571c5b50`, to Aiken v1.1.24 and stdlib v4.0.0.
The original uses stdlib 1.7.0. This module is not part of `aiken-design-patterns` v1.9.0.

The source credits [`aiken-lang/trees`](https://github.com/aiken-lang/trees) and
Hydra's Plutus Merkle tree. The original standalone project's MIT license is
in `LICENSE.aiken-merkle-tree`; the original tree source's Apache-2.0 license is
in `LICENSE.aiken-lang-trees`.

Changes:

- Updated the stdlib imports and formatting for the pinned compiler.
- Used explicit empty bytearrays for the empty-tree sentinel.
- Exposed `combine`, which the curriculum describes but upstream keeps private.
- Added checked `left_sibling` and `right_sibling` constructors. Aiken v1.1.24
  forbids opaque types in validator redeemers, so `lib/library_proof.ak` converts
  the public Left/Right representation into the original opaque proof and caps
  its path length. No opaque type is exposed as the validator's wire format.
- Included focused regression tests for empty, singleton, odd-sized trees,
  proof direction, and missing elements. The example's tests additionally
  compare the port with the independent hand-written verifier and Mesh builder.

SHA-256 hashing, floor-half tree splitting, ordered child concatenation, and
leaf-to-root Left/Right proof semantics are preserved. The library does not
domain-separate leaves itself. The application serializes each member as one
`00` byte followed by exactly 28 key-hash bytes, while a branch hashes two
32-byte child digests. The verifier enforces these widths.
