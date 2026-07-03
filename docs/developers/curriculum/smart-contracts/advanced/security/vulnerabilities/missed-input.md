---
id: missed-input
title: Missed Input Validation
sidebar_label: Missed input
description: "How a redeemer-supplied index that is not bound to the spent input lets an attacker slip an unvalidated input past a global validator."
---

> Concerns the utxo-indexer pattern documented by [Anastasia Labs design patterns](https://github.com/Anastasia-Labs/design-patterns).

**Identifier:** `missed-input`

**Property statement:**
Every script input is provably validated: each spend binds its redeemer index to its own output reference, and the global validator checks that the indices cover the complete set of relevant inputs.

**Test:**
A transaction spends a script input that is never referenced by the indexed validation, so its rules are never enforced.

**Impact:**

- Inputs spent without their validation running
- Value leaked from the protocol

**Further explanation:**
The **utxo-indexer** pattern makes global validation cheap. Instead of every input independently scanning the whole transaction (which is O(n²) as inputs grow), a single validator, a minting policy or a withdraw-zero staking script, validates the transaction once, and each spend input simply defers to it. The redeemer carries indices that pair each input to its corresponding output, so the global validator does O(1) lookups at the claimed positions rather than searching.

The pattern has two footguns, both variants of trusting the indices without binding them to reality:

- A spend validator that only checks "the global validator ran" (the staking script is present in the withdrawals, or the policy is in the mint field) without confirming that **its own input** is part of the index set the global validator processed. An attacker attaches an extra input at the same script address that the indices never reference. The global validator validates the inputs it was pointed at; the extra one rides along, spent with no rules enforced.
- A global validator that trusts the redeemer indices without checking they cover **every** relevant input, with no gaps, no duplicates, and a count that matches. Indices that quietly skip an input let that input escape validation.

This is closely related to [double satisfaction](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/double-satisfaction), where the pairing between inputs and outputs is what breaks. Prevent it by having each spend assert that its redeemer index points at its own output reference (using the script context's own-input information), and by having the global validator validate the complete input set, confirming that the input and output at each claimed index are really there.
