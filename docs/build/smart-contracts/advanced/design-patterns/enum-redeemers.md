---
id: enum-redeemers
title: Enum Data Mapping Functions
sidebar_label: Enum Data Mapping Functions
description: Explores the implementation of PlutusTypeEnum Redeemers for efficient data encoding.
---

## Introduction

In the Cardano blockchain ecosystem, smart contract UTxOs often come equipped with redeemers, which
are crucial components indicating the purpose or cause of the transaction. These redeemers may carry
additional data to facilitate computations within the validator function. However, in many
scenarios, a straightforward enumeration suffices:

```rust
data AuctionRedeemer = Initializing | Bidding | Closing

PlutusTx.makeLift ''AuctionRedeemer
PlutusTx.makeIsDataIndexed ''AuctionRedeemer [('Initializing, 0), ('Bidding, 1), ('Closing, 2)]
```

The problem and solution described in this document, of course, also applies to other onchain data
structures, but most frequently it appears in relation to redeemers. The same techniques apply for
other data mapping as well, it is not spcific to redeemers.

## The Challenge

Typically, the generated data conversion functions associate `AuctionRedeemer` values with Plutus
data constructors such as `Constr 0 []`, `Constr 1 []`, or `Constr 2 []`. While semantically sound,
this mapping incurs a bit more complexity and cost than necessary. A more streamlined approach would
involve a simpler mapping, directly converting these cases to their corresponding `Integer` values
of `0`, `1`, and `2`.

## A Simpler Approach

To address this, our library introduces a set of new mapping code that streamlines the
implementation process, making it as straightforward as the original Plutus, Plutarch, and Aiken
versions.

## Benefits of the Solution

By adopting this approach, we aim to simplify and optimize the mapping functions specifically
tailored for these cases. This not only reduces unnecessary complexity but also lowers the
associated costs of standard mapping functions.

## Conclusion

This enhancement offers a cleaner and more efficient solution, diminishing the complexity and cost
of standard mapping functions for these specific use cases. Users can now benefit from a
straightforward implementation that aligns with the simplicity of the original versions.
