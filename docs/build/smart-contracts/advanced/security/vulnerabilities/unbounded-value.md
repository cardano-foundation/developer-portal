---
id: unbounded-value
title: Unbounded Value
sidebar_label: Unbounded Value
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `unbounded-value`

**Property statement:**
Values of all legit UTxOs locked by the protocol have an upper bound for their size, and the upper bound is low enough to not prevent consumption of the UTxO as an input in a future transaction.

**Test:**
A transaction can successfully lock in the protocol a legit UTxO with a value large enough to make its consumption fail due to an unexpected number of tokens or reaching the network resources constraints.

**Impact:**

- Unspendable outputs
- Protocol halting

**Further explanation:**
Typically, a large value could make a transaction fail in three ways:

**Scenario 1:** if a script expects an exact or bounded number of tokens in some of its inputs, the transaction will fail if more tokens are present in those inputs. For instance, in the case where a validator script contains code similar to `let [(cs,tn,amt)] = flattenValue (input.value)`, if a previous transaction had locked an output with any token other than ADA, a subsequent transaction consuming that output would fail.

**Scenario 2:** if an input UTxO has N native tokens in the value, then just by passing on the input values to the output and adding some M additional tokens, the transaction might fail due to exceeding the transaction size limit. The most common pattern where this becomes a problem are script logics that require the ongoing addition of distinct tokens to the UTxOs locked by scripts. Note that values held by UTxOs only contribute to the size of the transaction when being part of the outputs of the transaction, but not when they are part of the inputs.

**Scenario 3:** if the input UTxO contains a lot of different native tokens and the script logic is such that it must go through and process them, then the transaction might fail due to execution resources (XU limits) being breached. This is the hardest scenario to identify, as it becomes a problem in scripts where unexpected tokens are not taken into account, being easy to forget about them. For instance, if a script had to fold through the value of an input looking for a specific combination of asset class and amount, it would be problematic if that input contained a large amount of asset classes.
A common case where this problem arises is when the logic of the scripts allow the presence and addition of foreign tokens (i.e. tokens not expected by the protocol).

This problem can be prevented with higher constrains around output values. This is, it is not enough to just check that the expected tokens are included in the locked outputs, but it also should be explicitely checked that only the expected tokens are present, disallowing for any extra tokens.

Also, resource consumption monitoring tests should be implemented, and transactions involving maximum expected flows of value should be covered by those tests.
