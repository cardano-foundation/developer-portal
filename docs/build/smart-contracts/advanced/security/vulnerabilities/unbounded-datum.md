---
id: unbounded-datum
title: Unbounded datum
sidebar_label: Unbounded datum
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

## 4. Unbounded datum

**Identifier:** `unbounded-datum`

**Property statement:**
Datum for all legit UTxOs locked by the protocol have an upper bound for their size, and the upper bound is low enough to not prevent consumption of the UTxO as an input in a future transaction.

**Test:**
A transaction can successfully lock in the protocol a legit UTxO with a datum such that its consumption in a second transaction fails due to reaching the network resources constraints.

**Impacts:**

- Unspendable outputs
- Protocol halting

**Further explanation:**
A common design pattern that introduces such vulnerability can be observed in the following excerpt:

```rust
data MyDatum = Foo {
  users :: [String],
  userToPkh :: Map String PubKeyHash
}
```

If the protocol allows `MyDatum` to grow indefinitely, eventually memory and CPU usage limits and/or size limits imposed by the Plutus interpreter will be reached, rendering the output unspendable.

Note that although inline datum for the inputs of a transaction do not contribute to its size (unlike a non-inline datum, as it must be attached), they still might contribute to increase the memory and CPU usage depending on the validator's logic.

The recommended design patterns are either to limit the growth of such datum in validators or to split the datum across different outputs.
