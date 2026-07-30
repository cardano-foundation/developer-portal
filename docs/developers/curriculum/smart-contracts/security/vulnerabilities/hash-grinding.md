---
id: hash-grinding
title: Hash Grinding on Ordering
sidebar_label: Hash grinding
description: "Why on-chain hashes are grindable, and how an attacker biases placement or selection in structures that order elements by a hash they control."
---

> An advanced, emerging class. Grounded in Cardano's deterministic validation and demonstrated by on-chain proof-of-work such as [Fortuna](https://github.com/aiken-lang/fortuna).

**Identifier:** `hash-grinding`

**Property statement:**
No placement, ordering, or selection that matters for security is derived from a hash of data the transaction author can influence.

**Test:**
An attacker chooses transaction contents so that a hash-derived position or outcome lands where they want.

**Impact:**

- Biased placement in on-chain data structures (denial of service)
- Rigged "random" selection

**Further explanation:**
A validator has no source of randomness. It sees only data the transaction author chose, and its execution is deterministic. So any value derived from a hash of attacker-influenceable input, the transaction hash, an output reference, a datum field, a token name, can be **ground**: the author re-tries transaction contents until the hash comes out favorable. This is not expensive. Cardano's own proof-of-work token, Fortuna, is a living demonstration that grinding on-chain hashes at scale is cheap; its entire mechanism is nonce grinding.

The vulnerability appears when a hash decides **placement or order** in an on-chain structure:

- a bucket in a sharded or distributed map,
- a position in a sorted or linked association list,
- a path in a Merkle Patricia trie,
- the winner of a "random" selection, raffle, or sortition.

An attacker grinds the input to force a chosen location: cluster many entries into one branch to bloat its proofs and push transactions into execution-unit or size limits (a denial of service against everyone who must traverse it), engineer adjacency to attack a specific neighbor, or win a draw that was supposed to be fair.

Prevent it by never treating an author-influenced on-chain hash as randomness. Use a commit-reveal scheme or a verifiable random function (VRF) for randomness, make placement independent of attacker-controlled hashes, or bound the blast radius (cap per-bucket size, and require inclusion proofs the attacker cannot cheaply densify).
