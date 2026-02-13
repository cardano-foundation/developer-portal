---
id: utxo-indexers
title: UTxO Indexers
sidebar_label: UTxO Indexers
description: Efficient input-output mapping with O(1) lookups using redeemer indexing
---

## Overview

UTxO Indexers provide optimized and composable solutions for mapping inputs to outputs in transactions. Instead of expensive linear searches on-chain, indices are computed off-chain and passed via redeemers, enabling O(1) lookups.

## The Problem: Linear Search is Expensive

Without indexing, validators must search through all inputs/outputs to find specific ones:

```aiken
// Expensive O(n) search
find_input_with_token(inputs, my_token)  // Searches entire list
```

This becomes costly as transaction size grows due to limited execution budgets.

## The Solution: Redeemer Indexing

Leverage Cardano's deterministic script evaluation - all inputs to validators are known at transaction construction time:

1. **Off-chain**: Build transaction, find indices of relevant inputs/outputs
2. **Off-chain**: Include indices in redeemer
3. **On-chain**: Use `list.at(index)` for O(1) access, verify element meets criteria

```aiken
// Efficient O(1) access
expect Some(input) = inputs |> list.at(input_index)
expect input meets criteria
```

## Pattern Variants

There are a total of 4 variations available:
- Single, one-to-one indexer
- Single, one-to-many indexer
- Multiple, one-to-one indexer, with ignored redeemers
- Multiple, one-to-one indexer, with provided redeemers

:::note
Neither of the singular UTxO indexer patterns provide protection against the [double satisfaction](https://github.com/Plutonomicon/plutonomicon/blob/b6906173c3f98fb5d7b40fd206f9d6fe14d0b03b/vulnerabilities.md#double-satisfaction) vulnerability, as this can be done in multiple ways depending on the contract. However, they require a dedicated argument as a reminder for the potential requirement of implementing a protection against this vulnerability.
:::

Depending on the variation, the functions you can provide are:
- One-to-one validator for an input and its corresponding output - this is always the validation that executes the most times (i.e. for each output)
- One-to-many validator for an input and all of its corresponding outputs - this executes only once

### 1. Singular UTxO Indexer

#### One-to-one

Helper function to be defined in the spending endpoint of your contract, for appointing an input at `input_index` against an output at `output_index`. By including this in your spending endpoint, you'll get an efficient access to your input, and its corresponding output.

Within the function you pass as `validation_logic`, you have access to the picked input and output.

Apart from `validation_logic`, the only other validation this function performs for you is the equality of the picked input's output reference with the one extracted from `ScriptInfo`.

`double_satisfaction_prevented` is a required `Bool`, which is just a reminder that this function does NOT cover the [double satisfaction](https://github.com/Plutonomicon/plutonomicon/blob/b6906173c3f98fb5d7b40fd206f9d6fe14d0b03b/vulnerabilities.md#double-satisfaction) vulnerability out-of-the-box.

```aiken
use aiken_design_patterns/singular_utxo_indexer
use aiken_design_patterns/utils.{authentic_input_is_reproduced_unchanged}
use cardano/assets
use cardano/transaction.{OutputReference, Transaction}

validator one_to_one(state_token_symbol: assets.PolicyId) {
  spend(
    _datum,
    redeemer: Pair<Int, Int>,
    own_out_ref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { inputs, outputs, .. } = tx

    let
      input,
      output,
    <-
      singular_utxo_indexer.one_to_one(
        input_index: redeemer.1st,
        output_index: redeemer.2nd,
        own_ref: own_out_ref,
        inputs: inputs,
        outputs: outputs,
        double_satisfaction_prevented: True,
      )

    // double_satisfaction_prevented
    authentic_input_is_reproduced_unchanged(
      state_token_symbol,
      None,
      input.output,
      output,
    )
  }

  else(_) {
    fail
  }
}
```

#### One-to-many

Helper function for appointing an input against a set of outputs in a transaction. Similar to `one_to_one`, this function also validates the spent UTxO's output reference matches the one found using the input index.

Here we also have the `double_satisfaction_prevented` argument as a mere reminder that this function does not cover double satisfaction on its own.

```aiken
validator one_to_many(
  _state_token_symbol: assets.PolicyId,
  _state_token_name: assets.AssetName,
) {
  spend(
    _datum,
    redeemer: Pair<Int, List<Int>>,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { inputs, outputs, .. } = tx

    singular_utxo_indexer.one_to_many(
      input_output_validator: fn(_input, _output_index, _output) { True },
      input_collective_outputs_validator: fn(_input, _outputs) { True },
      input_index: redeemer.1st,
      output_indices: redeemer.2nd,
      own_ref: own_ref,
      inputs: inputs,
      outputs: outputs,
      double_satisfaction_prevented: True,
    )
  }

  else(_) {
    fail
  }
}
```

Required validation functions are provided with:
1. `Input` itself, output index, and `Output` itself (this validation is executed for each output)
2. `Input` itself, and the list of all `Output`s (this validation is executed only once)

### 2. Multi UTxO Indexer

#### `one_to_one_no_redeemer`

Helper function for performing spending validation on multiple inputs from a given script, each with a corresponding output. It expects both the input and output indices be in ascending order.

The validation function you should provide has access to the index of the `Input` being validated, the `Input` itself, the index of the `Output` being validated, and the `Output` itself.

#### `one_to_one_with_redeemer`

Another variant with a staking script (i.e. withdraw-0 script) as a coupling element for spending multiple UTxOs from a given spending script. Here the `redeemers` is also traversed to provide the validation logic with the redeemer used for spending each of the UTxOs.

The assumption here is that redeemers carry the staking credential of the withdraw-0 validator, which is the purpose of the additional argument, i.e. coercing the redeemer `Data` into an expected structure, and extracting the staking credential.

**Example with stake validator:**

```aiken
use aiken_design_patterns/multi_utxo_indexer
use aiken_design_patterns/stake_validator
use aiken_design_patterns/utils.{authentic_input_is_reproduced_unchanged}
use cardano/address.{Address, Credential, Script}
use cardano/assets
use cardano/transaction.{Output, OutputReference, Transaction}

pub type ExampleSpendRedeemer {
  withdraw_redeemer_index: Int,
  withdrawal_index: Int,
}

validator example(
  state_token_symbol: assets.PolicyId,
  state_token_name: assets.AssetName,
) {
  spend(
    _datum,
    redeemer: ExampleSpendRedeemer,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { inputs, redeemers, withdrawals, .. } = tx
    expect Output {
      address: Address { payment_credential: Script(own_hash), .. },
      ..
    } = utils.resolve_output_reference(inputs, own_ref)
    let
      r,
      qty,
    <-
      stake_validator.validate_withdraw_with_amount(
        withdraw_script_hash: own_hash,
        redeemers: redeemers,
        withdraw_redeemer_index: redeemer.withdraw_redeemer_index,
        withdrawals: withdrawals,
        withdrawal_index: redeemer.withdrawal_index,
      )
    expect coerced: Pairs<Int, Int> = r
    when coerced is {
      [] -> False
      _ -> qty > 0
    }
  }

  withdraw(redeemer: Pairs<Int, Int>, stake_cred: Credential, tx: Transaction) {
    expect Script(own_script_hash) = stake_cred
    let Transaction { inputs, outputs, .. } = tx
    let
      _input_index,
      input,
      _output_index,
      output,
    <-
      multi_utxo_indexer.one_to_one_no_redeemer(
        indices: redeemer,
        spending_script_hash: own_script_hash,
        inputs: inputs,
        outputs: outputs,
      )
    authentic_input_is_reproduced_unchanged(
      state_token_symbol,
      Some(state_token_name),
      input.output,
      output,
    )
  }

  else(_) {
    fail
  }
}
```

## Key Benefits

1. **O(1) Lookups** - Direct array access instead of linear search
2. **Reduced Execution Costs** - Minimal on-chain computation
3. **Batch Processing** - Handle multiple UTxOs efficiently
4. **Composability** - Works with stake validator pattern

## Important: Double Satisfaction Protection

Singular indexers require manual double satisfaction protection:

```aiken
// Vulnerable - same output can satisfy multiple inputs
one_to_one(validate, 0, 0, ...)  // Input 0 -> Output 0
one_to_one(validate, 1, 0, ...)  // Input 1 -> Output 0 (same!)
```

**Protection strategies:**

1. **Unique output tagging** - Include input OutRef in output datum
2. **Index uniqueness checks** - Verify no duplicate indices in redeemer
3. **Use multi-indexer** - Built-in protection via stake validator

## Example Code

**Singular indexer:**

- [singular-utxo-indexer.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/validators/examples/singular-utxo-indexer.ak)
- [Library implementation](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/singular-utxo-indexer.ak)

**Multi indexer:**

- [multi-utxo-indexer.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/validators/examples/multi-utxo-indexer.ak)
- [Library implementation](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/multi-utxo-indexer.ak)

## Related Patterns

- [Stake Validator](stake-validator) - Multi-indexers work best with stake validators
- [Double Satisfaction](../security/vulnerabilities/double-satisfaction) - Vulnerability to protect against
