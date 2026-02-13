---
id: merkelized-validator
title: Merkelized Validator
sidebar_label: Merkelized Validator
description: Delegate logic to external withdrawal scripts to stay within size limits
---

## Introduction

There are very tight execution budget constraints imposed on Plutus script evaluation; this, in combination with the fact that a higher execution budget
equates to higher transaction fees for end-users makes it such that ex-unit optimization is an extremely important component of smart contract development on Cardano.

Often the most impactful optimization techniques involve trade-offs between ex-units and script size. This results in a tight balancing act where you want to minimize the
ex-units while keeping the script below the ~16kb limit (script size that you can store as a reference script is limited by transaction size limit). Powerful ExUnit
optimizations such as unrolling recursion, inlining functions and preferring constants over variables all can drastically reduce ExUnit consumption at the cost of increasing
script size.

We can take advantage of reference scripts and the withdraw-zero trick to separate the logic (and code) of our validator across a number of stake scripts (which we provide as reference inputs). Then our main validator simply checks for the presence of the associated staking script in the redeemers (and verifies that the redeemer to the scripts are as expected) where necessary to execute the branch of logic.

This is useful because with reference scripts this essentially gives us the ability to create scripts with near infinite size which means optimization strategies that involve increasing script size to reduce mem / CPU (ie loop unrolling) now are available to us at nearly zero cost.

Consider a batching architecture, with a very large `processOrders` function. Normally it would not be feasible to perform recursion unrolling / inlining optimizations with such a function since it would quickly exceed the max script size limit; however, with this design pattern we simply move `processOrders` into its own validator script which we can fill with 16kb of loop unrolling and other powerful optimizations which increase script size in order to reduce ExUnits. We provide this new script as a reference script when executing our main validator. Then in our main validator we verify that the `processOrders` validator was executed with the expected redeemer (`input_arg` must match the arguments we want to pass to `processOrders`) after which we have access to the result of the optimized `processOrders` function applied to our inputs.

## Aiken Implementation

Since transaction size is limited in Cardano, some scripts benefit from a solution which allows them to delegate parts of their validations. This becomes more prominent in cases where such validations can greatly benefit from optimization solutions that trade computation resources for script sizes (e.g. table lookups can take up more space so that costly computations can be averted).

This design pattern offers an interface for off-loading such validations into an external observer/withdrawal script, so that the sizes of the scripts themselves can stay within the limits of Cardano.

:::note
Be aware that total size of reference scripts is currently limited to 200KiB (204800 bytes), and they also impose additional fees in an exponential manner. See [here](https://github.com/IntersectMBO/cardano-ledger/issues/3952) and [here](https://github.com/CardanoSolutions/ogmios/releases/tag/v6.5.0) for more info.
:::

### Key Types

Datatype for the redeemer of the "computation staking validator" to represent input argument(s) and output value(s). As a simple example, a summation logic where it adds all its inputs together can work with a redeemer of type `ComputationRedeemer<List<Int>, Int>`, and a valid redeemer data would be:

```aiken
let valid_summation_io =
  ComputationRedeemer {
    input_arg: [1, 2, 3, 4, 5],
    result: 15,
  }
```

The library defines two redeemer types for the staking scripts:

```aiken
/// Datatype for redeemer of the "computation staking validator" to represent
/// input argument(s) and output value(s).
pub type ComputationRedeemer<a, b> {
  input_arg: a,
  result: b,
}

/// Datatype for a delegated validation. Compared to `ComputationRedeemer`, this
/// datatype only carries input argument(s), and simply validates whether the
/// computation passes.
pub type ValidationRedeemer<a> {
  input_arg: a,
}
```

### Delegating Computation: `delegated_compute`

Given an arbitrary `Data` as input, this function expects to find a `Withdraw` script purpose in `redeemers` for `staking_validator`, with a redeemer of type `ComputationRedeemer<Data, Data>`, which will be coerced into your custom datatypes using your provided `Data` validators (`input_data_coercer` and `output_data_coercer`).

The given input argument must be identical to the one provided to the withdrawal validator. It returns the coerced result.

```aiken
pub fn delegated_compute(
  function_input: a,
  staking_validator: ScriptHash,
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  redeemer_index: Int,
  input_data_coercer: fn(Data) -> a,
  output_data_coercer: fn(Data) -> b,
) -> b
```

### Delegating Validation: `delegated_validation`

Similar to `delegated_compute`, with the difference that no values are expected to be returned by the staking script:

```aiken
pub fn delegated_validation(
  function_input: a,
  staking_validator: ScriptHash,
  redeemers: Pairs<ScriptPurpose, Redeemer>,
  redeemer_index: Int,
  input_data_coercer: fn(Data) -> a,
) -> Bool
```

### Withdrawal Script Wrappers

For defining the staking scripts that carry out the computation or validation:

**`computation_withdrawal_wrapper`** - Helper function for defining your "computation stake validator." The resulting stake validator will carry out the provided `function`'s logic, and `redeemer` must contain the input(s) and expected output(s):

```aiken
pub fn computation_withdrawal_wrapper(
  redeemer: ComputationRedeemer<a, b>,
  function: fn(a) -> b,
) -> Bool
```

**`validation_withdrawal_wrapper`** - Helper function for defining your delegated validation. The resulting stake validator will carry out the provided `validation`'s logic with given input(s) through its redeemer:

```aiken
pub fn validation_withdrawal_wrapper(
  redeemer: ValidationRedeemer<a>,
  validation: fn(a) -> Bool,
) -> Bool
```

### Full Example

Here is a complete example showing both the spending validator (which delegates) and the staking scripts (which perform the actual logic):

```aiken
use aiken/builtin
use aiken/crypto.{ScriptHash}
use aiken_design_patterns/merkelized_validator.{
  ComputationRedeemer, ValidationRedeemer,
}
use aiken_design_patterns/utils.{sum_of_squares}
use cardano/address.{Credential}
use cardano/transaction.{OutputReference, Transaction}

pub type ExampleSpendRedeemer {
  withdraw_redeemer_index: Int,
  second_integer: Int,
}

/// Definition of a custom validator for spending transactions, utilizing both
/// `delegated_compute` and `delegated_validation`.
validator spending_example(
  summation_stake_validator: ScriptHash,
  forty_two_stake_validator: ScriptHash,
) {
  spend(
    m_x: Option<Int>,
    r: ExampleSpendRedeemer,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(x) = m_x
    let sum =
      [x, r.second_integer]
        |> merkelized_validator.delegated_compute(
            staking_validator: summation_stake_validator,
            redeemers: tx.redeemers,
            redeemer_index: r.withdraw_redeemer_index,
            input_data_coercer: fn(d: Data) -> List<Int> {
              expect ints: List<Int> = d
              ints
            },
            output_data_coercer: builtin.un_i_data,
          )
    merkelized_validator.delegated_validation(
      function_input: sum,
      staking_validator: forty_two_stake_validator,
      redeemers: tx.redeemers,
      redeemer_index: r.withdraw_redeemer_index,
      input_data_coercer: builtin.un_i_data,
    )
  }

  else(_) {
    fail
  }
}

/// Definition of a custom validator for withdrawal transactions. We are using
/// `ComputationRedeemer<List<Int>, Int>` to showcase how multiple inputs and/or
/// outputs can be incorporated.
///
/// Result of compiling this validator and acquiring its hash, should be used as
/// the `summation_stake_validator` parameter of the spending script above.
validator summation_staking_script {
  withdraw(
    redeemer: ComputationRedeemer<List<Int>, Int>,
    _own_credential: Credential,
    _tx: Transaction,
  ) {
    let ints <- merkelized_validator.computation_withdrawal_wrapper(redeemer)
    sum_of_squares(ints)
  }

  else(_) {
    fail
  }
}

/// Result of compiling this validator and acquiring its hash, should be used as
/// the `forty_two_stake_validator` parameter of the spending script above.
validator forty_two_staking_script {
  withdraw(
    redeemer: ValidationRedeemer<Int>,
    _own_credential: Credential,
    _tx: Transaction,
  ) {
    let num <- merkelized_validator.validation_withdrawal_wrapper(redeemer)
    num == 42
  }

  else(_) {
    fail
  }
}
```

## Example Code

Full working example: [merkelized-validator.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/validators/examples/merkelized-validator.ak)

Library implementation: [merkelized_validator module](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/merkelized-validator.ak)

Additional sample: [aiken-delegation-sample](https://github.com/keyan-m/aiken-delegation-sample/blob/main/validators/main-contract.ak)
