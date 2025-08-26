---
id: validity-range-normalization
title: Validity Range Normalization
sidebar_label: Validity Range Normalization
description: Validators, at runtime, are intentionally deprived of direct access to the current time. Instead, they are equipped with information solely about the validity range of a transaction.
---

## Introduction

In the intricate landscape of developing validators for the Cardano protocol, one encounters the
necessity to implement checks that meticulously consider time-related factors. To circumvent the
redundancy of executing smart contract code multiple times, Cardano has devised an approach that
sets it apart from other blockchains. Specifically, validators, at runtime, are intentionally
deprived of direct access to the current time. Instead, they are equipped with information solely
about the validity range of a transaction. This design choice guarantees that a transaction is only
admitted to the chain within its designated validity range. Consequently, smart contracts can
implement checks based on the current time, while maintaining computational purity—wherein functions
exhibit mathematical purity devoid of side-causes or side-effects.

## The Problem

The representation of validity ranges in Plutus introduces a subtle complexity with its lower and
upper bounds, both capable of assuming the extremal values of `-∞` and `+∞`. Additionally, a boolean
flag signifies whether the range is open or closed at each end. This flexibility, however, leads to
multiple representations of the same validity range. For instance, the range `(a, b)` (open on both
ends) is equivalent to the range `[a+1, b-1]` (closed on both ends) if both a and b are finite.
Further complexity arises from the fact that infinite ranges are occasionally represented as closed
on the "open" sides. For example, the always range is (at the time of writing) denoted as `[-∞,
+∞]`, despite the inconsistency with the actual time values that do not include `-∞` or `+∞`.

This ambiguity can potentially result in unintended consequences for validators ill-equipped to
handle these diverse representations. Moreover, as the standard method of communicating the range
may change with any hard fork, long-lived smart contracts must be designed to accommodate various
representations to prevent funds from being indefinitely locked within them.

An example on how to handle every case correctly:

```rust
isTimeValid :: Datum -> POSIXTimeRange -> Bool
isTimeValid datum (Interval (LowerBound (Finite l) False) (UpperBound (Finite u) False)) = ...
isTimeValid datum (Interval (LowerBound NegInf     False) (UpperBound (Finite u) False)) = ...
isTimeValid datum (Interval (LowerBound (Finite l) False) (UpperBound PosInf     False)) = ...
isTimeValid datum (Interval (LowerBound PosInf     False) (UpperBound (Finite u) False)) = ...
...
isTimeValid datum (Interval (LowerBound PosInf True) (UpperBound PosInf True)) = ...
```

## The Solution

In our endeavor to establish best practices, we advocate for the adoption of normalized versions of
validity ranges within the design patterns library. We propose incorporating functions that
facilitate the normalization procedure to ensure consistency in the representation of these ranges.
The recommended formats for normalized validity ranges are as follows:

`[a, b]`: Denotes a closed range if both a and b are finite.  
`(-∞, x]` and `[x, +∞)`: Represents a half-open range on the infinite side, where x is a finite value.  
`(-∞, +∞)`: Signifies an open range on both sides, specifically used for the representation of the
always range, aligning with the standard convention in mathematics.

With this the example above can be implemented in a much cleaner way:

```rust
isTimeValid :: Datum -> POSIXTimeRange -> Bool
isTimeValid datum r =
  case normalizedTimeRange r of
    ClosedRange l u -> ...
    FromNegInf    u -> ...
    ToPosInf    l   -> ...
    Always          -> ...
```
