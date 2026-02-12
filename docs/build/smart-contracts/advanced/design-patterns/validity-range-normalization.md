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

## The Solution

In our endeavor to establish best practices, we advocate for the adoption of normalized versions of
validity ranges within the design patterns library. We propose incorporating functions that
facilitate the normalization procedure to ensure consistency in the representation of these ranges.
The recommended formats for normalized validity ranges are as follows:

`[a, b]`: Denotes a closed range if both a and b are finite.  
`(-∞, x]` and `[x, +∞)`: Represents a half-open range on the infinite side, where x is a finite value.  
`(-∞, +∞)`: Signifies an open range on both sides, specifically used for the representation of the
always range, aligning with the standard convention in mathematics.

## Aiken Implementation

The datatype that models validity range in Cardano currently allows for values
that are either meaningless, or can have more than one representations. For
example, since the values are integers, the inclusive flag for each end is
redundant for most cases and can be omitted in favor of a predefined convention
(e.g. a value should always be considered inclusive).

The library presents a custom datatype that essentially reduces the value
domain of the original validity range to a smaller one that eliminates
meaningless instances and redundancies.

The datatype is defined as following:

```rust
pub type NormalizedTimeRange {
  ClosedRange { lower: Int, upper: Int }
  FromNegInf  {             upper: Int }
  ToPosInf    { lower: Int             }
  Always
}
```

The exposed function of the module (`normalize_time_range`), takes a
`ValidityRange` and returns this custom datatype.

### Example Usage

```rust
use aiken_design_patterns/validity_range_normalization.{
  NormalizedTimeRange, normalize_time_range,
}

validator my_validator {
  spend(
    _datum: Option<Datum>,
    _redeemer: Redeemer,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { validity_range, .. } = tx

    when normalize_time_range(validity_range) is {
      ClosedRange { lower, upper } -> {
        // Handle finite range [lower, upper]
        validate_closed_range(lower, upper)
      }
      FromNegInf { upper } -> {
        // Handle range (-∞, upper]
        validate_until(upper)
      }
      ToPosInf { lower } -> {
        // Handle range [lower, +∞)
        validate_from(lower)
      }
      Always -> {
        // Handle unbounded range (-∞, +∞)
        True
      }
    }
  }
}
```

## Example Code

Full working example: [validity-range-normalization.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/validity-range-normalization.ak)
