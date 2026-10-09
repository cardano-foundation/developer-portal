---
id: evaluation-and-grinding
title: Evaluation and Grinding
sidebar_label: Evaluation and grinding
description: "Two advanced classes where the attacker controls something the validator assumed was fixed: which checks actually run, and how a hash comes out."
---

Both entries here exploit the same property that makes Cardano validation predictable. Execution is deterministic and the transaction author picks the inputs, so an author can work out in advance which branches will run and what any hash will evaluate to, then choose inputs that suit them. A check placed on a branch that gets skipped never runs, and a decision derived from an attacker-influenced hash can simply be ground until it comes out favorably.

## Lazy Evaluation Traps

> A language-level footgun in Plutus Core evaluation; see the [Aiken language tour](https://aiken-lang.org/language-tour/control-flow) on control flow.

**Identifier:** `evaluation-order`

**Property statement:**
Every check that must run to keep the validator safe is actually forced, not placed on a branch that can be skipped.

**Test:**
A transaction passes validation because a required check sat on a short-circuited or untaken branch and never executed.

**Impact:**

- Required checks silently skipped
- A validator that succeeds when it should have failed

**Further explanation:**
Plutus Core, which Aiken compiles to, is lazy in a few places that matter for validators. The boolean operators `&&` and `||` **short-circuit**: the second operand runs only if the first did not already decide the result. `if/else` and `when` evaluate only the branch that is taken. And an `error` or `fail` fires only when it is actually forced. Aiken is otherwise strict, but these control-flow constructs keep the lazy behavior.

The trap is a required check placed where it can be skipped. A necessary assertion in the right operand of `||` never runs when the left operand is already `True`. A guard inside a branch that is not taken never fires. A `fail` you expected to stop a bad transaction sits on a side that is never forced. In each case the validator returns success while a check you thought was protecting it did nothing.

Idiomatic Aiken avoids most of this: the `and { ... }` and `or { ... }` blocks list all conditions explicitly, and `expect` and `fail` are strict where the code path is taken. The exposure is real for hand-written Plutus, Plutarch, or UPLC, and for misjudged operand order in any language. Prevent it by never putting a required predicate or a security-relevant `fail` on a branch that can be short-circuited away, forcing every check that must run (a statement-level `expect`/`fail`, or listing conditions explicitly), and ordering operands so cheap, non-security guards go first and the checks that must always run are never the ones skipped.

## Hash Grinding on Ordering

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
