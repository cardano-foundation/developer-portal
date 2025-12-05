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

```rust
// Expensive O(n) search
find_input_with_token(inputs, my_token)  // Searches entire list
```

This becomes costly as transaction size grows due to limited execution budgets.

## The Solution: Redeemer Indexing

Leverage Cardano's deterministic script evaluation - all inputs to validators are known at transaction construction time:

1. **Off-chain**: Build transaction, find indices of relevant inputs/outputs
2. **Off-chain**: Include indices in redeemer
3. **On-chain**: Use `list.at(index)` for O(1) access, verify element meets criteria

```rust
// Efficient O(1) access
expect Some(input) = inputs |> list.at(input_index)
expect input meets criteria
```

## Pattern Variants

The library provides three main patterns based on your needs:

### 1. Singular UTxO Indexer (One-to-One or One-to-Many)

For single input processing. Use when spending one UTxO at a time.

**One-to-one** - map one input to one output:

```rust
use aiken_design_patterns/singular_utxo_indexer

validator my_validator {
  spend(
    _datum: Option<Datum>,
    redeemer: MyRedeemer,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { inputs, outputs, .. } = tx

    singular_utxo_indexer.one_to_one(
      fn(input, output) {
        // Validate this input against this output
        validate_pair(input, output)
      },
      redeemer.input_index,
      redeemer.output_index,
      own_ref,
      inputs,
      outputs,
      double_satisfaction_prevented: True,  // Reminder to handle this!
    )
  }
}
```

**One-to-many** - map one input to multiple outputs:

```rust
singular_utxo_indexer.one_to_many(
  fn(input, outputs_list) {
    // Validate this input against all these outputs
    all_outputs_valid(input, outputs_list)
  },
  input_index,
  output_indices,
  own_ref,
  inputs,
  outputs,
  double_satisfaction_prevented: True,
)
```

### 2. Multi UTxO Indexer (Multiple Inputs)

For batch processing multiple script UTxOs. Combines with [stake validator](stake-validator) pattern for transaction-level validation.

**Variants:**

- `withdraw_no_redeemer` - Filter inputs by script address only
- `withdraw_with_redeemer` - Filter and validate specific redeemers
- One-to-many versions for each

**Example with stake validator:**

```rust
// Spending validator - minimal check
use aiken_design_patterns/stake_validator

validator spending {
  spend(...) {
    stake_validator.spend_minimal(stake_script_hash, tx)
  }
}

// Staking validator - batch validation
use aiken_design_patterns/multi_utxo_indexer

validator staking {
  withdraw(
    redeemer: Pairs<Int, Int>,  // [(input_idx, output_idx), ...]
    stake_cred: Credential,
    tx: Transaction,
  ) {
    multi_utxo_indexer.withdraw_no_redeemer(
      fn(input_idx, input, output_idx, output) {
        // Validate each input-output pair
        validate_transfer(input, output)
      },
      redeemer,  // Index pairs
      stake_cred,
      tx,
    )
  }
}
```

### 3. Multi UTxO Indexer One-to-Many

For mapping multiple inputs where each can have multiple corresponding outputs:

```rust
use aiken_design_patterns/multi_utxo_indexer_one_to_many

validator staking {
  withdraw(
    redeemer: Pairs<Int, List<Int>>,  // [(in_idx, [out_idx1, out_idx2, ...]), ...]
    stake_cred: Credential,
    tx: Transaction,
  ) {
    multi_utxo_indexer_one_to_many.withdraw_no_redeemer(
      fn(in_idx, input, out_idxs, outputs) {
        // One input can map to multiple outputs
        validate_split(input, outputs)
      },
      redeemer,
      stake_cred,
      tx,
    )
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

```rust
// ❌ Vulnerable - same output can satisfy multiple inputs
one_to_one(validate, 0, 0, ...)  // Input 0 → Output 0
one_to_one(validate, 1, 0, ...)  // Input 1 → Output 0 (same!)
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

**Multi indexer one-to-many:**

- [multi-utxo-indexer-one-to-many.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/validators/examples/multi-utxo-indexer-one-to-many.ak)
- [Library implementation](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/multi-utxo-indexer-one-to-many.ak)

## Related Patterns

- [Stake Validator](stake-validator) - Multi-indexers work best with stake validators
- [Double Satisfaction](../security/vulnerabilities/double-satisfaction) - Vulnerability to protect against
