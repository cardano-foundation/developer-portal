---
id: aiken
title: Aiken
sidebar_label: Aiken
description: Aiken
image: /img/aiken-logo.png
--- 

## Introduction

[Aiken](https://github.com/aiken-lang/aiken) is a new programming language and toolchain for developing smart contracts on the Cardano blockchain. It takes inspiration from many modern languages such as Gleam, Rust, and Elm which are known for friendly error messages and an overall excellent developer experience. 

The language is exclusively used for creating the on-chain validator-scripts. You will need to write your off-chain code for generating transactions in another language such as Rust, Haskell, Javascript, Python etc.

:::caution

Aiken is a still a work in progress and is NOT recommended for use in production.

:::

## Getting started

Visit the [Get started with Aiken](/docs/get-started/aiken) to install Aiken from Source or Nix Flakes.

A comprehensive guide for getting started with Aiken can be found on the [aiken-lang.org](https://aiken-lang.org) website. For more details about the project you might also want to visit the  [Aiken git repository](https://github.com/aiken-lang/aiken).


### Example contract

This is a basic validator written in Aiken

```aiken
use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/string
use aiken/transaction.{ScriptContext}
use aiken/transaction/credential.{VerificationKey}
 
pub type Datum {
  owner: Hash<Blake2b_224, VerificationKey>,
}
 
pub type Redeemer {
  msg: ByteArray,
}
 
pub fn spend(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
  let must_say_hello = string.from_bytearray(redeemer.msg) == "Hello, World!"
 
  let must_be_signed =
    list.has(context.transaction.extra_signatories, datum.owner)
 
  must_say_hello && must_be_signed
}
```

### Testing

Tests can be created directly in Aiken and execute them on-the-fly using the "aiken check" command.

Below is an example of how such tests can be defined:

```aiken
use aiken/interval.{Finite, Interval, IntervalBound, PositiveInfinity}
 
test must_start_after_succeed_when_lower_bound_is_after() {
  let range: ValidityRange =
    Interval {
      lower_bound: IntervalBound { bound_type: Finite(2), is_inclusive: True },
      upper_bound: IntervalBound { bound_type: PositiveInfinity, is_inclusive: False },
    }
 
  must_start_after(range, 1)
}
 
test must_start_after_suceed_when_lower_bound_is_equal() {
  let range: ValidityRange =
    Interval {
      lower_bound: IntervalBound { bound_type: Finite(2), is_inclusive: True },
      upper_bound: IntervalBound { bound_type: PositiveInfinity, is_inclusive: False },
    }
 
  must_start_after(range, 2)
}
 
test must_start_after_fail_when_lower_bound_is_after() {
  let range: ValidityRange =
    Interval {
      lower_bound: IntervalBound { bound_type: Finite(2), is_inclusive: True },
      upper_bound: IntervalBound { bound_type: PositiveInfinity, is_inclusive: False },
    }
 
  !must_start_after(range, 3)
}
```


## Links
- [Aiken User-Manual](https://aiken-lang.org/)
- [Aiken Github Repository](https://github.com/aiken-lang/aiken).

