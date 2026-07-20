---
id: validity-range-normalization
title: Validity Range Normalization
sidebar_label: Validity range normalization
description: Normalize a transaction's validity range to one canonical form so a validator handles every equivalent representation safely.
---

## Introduction

Cardano validators cannot read the current time directly. To keep execution deterministic, a validator sees only the transaction's validity range, the slot window in which the transaction may be included. The ledger admits the transaction only inside that window, so a validator can enforce time-based rules while staying pure, with no side-effects and no dependence on a live clock.

## The Problem

Plutus can represent the same validity range in more than one way. Each bound can be finite or infinite (`-∞`, `+∞`), and a flag marks whether the end is open or closed. So `(a, b)` (open on both ends) equals `[a+1, b-1]` (closed on both ends) when `a` and `b` are finite, and infinite ranges are sometimes written closed on the infinite side (the always-range is denoted `[-∞, +∞]` even though real times never include the infinities).

A validator that does not handle every representation can behave incorrectly on the ones it did not expect. And because the encoding can change at a hard fork, a long-lived contract that assumes one form risks locking funds forever when the form shifts.

## The Solution

Normalize the range to a single canonical form before checking it. The design-patterns library does this, reducing every equivalent range to one representation:

- `[a, b]`: a closed range when both bounds are finite.
- `(-∞, x]` and `[x, +∞)`: half-open on the infinite side, with `x` finite.
- `(-∞, +∞)`: open on both sides, used for the always-range, matching the mathematical convention.

## Aiken Implementation

Cardano's validity-range type allows values that are either meaningless or redundant: because the bounds are integers, the inclusive/exclusive flag is unnecessary once you fix a convention (treat every bound as inclusive). This module maps the range onto a smaller datatype that drops the redundant flag and rules out the meaningless cases. `normalize_time_range` takes a `ValidityRange` and returns it:

```aiken
pub type NormalizedTimeRange {
  ClosedRange { lower: Int, upper: Int }
  FromNegInf  {             upper: Int }
  ToPosInf    { lower: Int             }
  Always
  InvalidRange
}
```

### Example Usage

```aiken
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
      InvalidRange -> {
        // Handle invalid range (e.g. lower >= upper)
        False
      }
    }
  }
}
```

## Example Code

Full working example: [validity-range-normalization.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/validity-range-normalization.ak)
