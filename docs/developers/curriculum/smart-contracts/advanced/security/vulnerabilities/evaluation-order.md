---
id: evaluation-order
title: Lazy Evaluation Traps
sidebar_label: Evaluation order
description: "How short-circuiting boolean operators can skip a required check or a deferred failure in a validator."
---

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
