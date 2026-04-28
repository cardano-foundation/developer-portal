---
title: Redeemer Indexing
description: Deferred redeemer construction for efficient validator input lookup
---

## Abstract

Plutus validators can receive input indices via redeemers for O(1) array lookup instead of O(n) traversal. On-chain traversal is expensive in execution units, so passing indices allows validators to directly access only the inputs they care about.

The challenge: Cardano currently enforces canonical sorting of inputs, and indices depend on this final sorted order. When coin selection or other operations add inputs to the transaction, they insert into the sorted order and shift existing indices.

The solution: **defer redeemer construction** until all inputs are known and sorted.

## Why Index-Based Lookup Matters

Cardano transactions sort inputs lexicographically by `(txHash, outputIndex)`. A validator receives all transaction inputs in this canonical order. Without indices, finding relevant inputs requires traversing the entire list.

Consider a transaction with 15 inputs: 5 contract UTxOs and 10 wallet UTxOs for fees. A naive validator would check all 15 inputs to find the 5 it cares about. With indices in the redeemer, it directly accesses `inputs[3]`, `inputs[7]`, `inputs[12]`, etc.

## The Stake Validator Pattern

A common pattern uses a stake validator as the main coordinator. Spend validators are "dumb" and only verify that the stake validator ran. The stake validator receives all relevant input indices and performs the actual business logic.

The stake validator:
1. Receives indices of contract inputs in its redeemer
2. Directly accesses those inputs via index
3. Validates business logic for all contract inputs in one execution

The spend validators:
1. Simply verify the stake validator ran (withdrawal exists in transaction)
2. Delegate all logic to the stake validator

## The Circular Dependency

The problem: input indices depend on the final sorted order of **all** inputs. But coin selection adds wallet UTxOs after the user specifies script inputs. The indices change.

## Deferred Construction

Instead of building the redeemer immediately, store a **builder function** that will be invoked after coin selection:

```
1. User specifies inputs with redeemer function
2. Builder stores function, doesn't execute
3. User calls build()
4. Builder runs coin selection, adds wallet UTxOs
5. All inputs now known
6. Resolver sorts inputs canonically, computes indices
7. Resolver invokes redeemer function with indices
8. Concrete redeemer returned
```

## Three Modes

### Batch Mode

For validators that need indices of multiple inputs. The function receives all indexed inputs and returns a single redeemer.

Primary use case: stake validator coordinator receiving list of contract input indices.

### Self Mode

For spend validators that need their own index. The function is called once per script UTxO.

Use case: spend validator that looks up its own input by index for validation.

### Static Mode

For redeemers that don't need indices. The data is used directly.

## Indexed Input

Both Batch and Self modes receive indexed inputs containing:

- **Index**: Final 0-based position in canonically sorted transaction inputs
- **UTxO**: The original UTxO data

The UTxO is included because redeemers may need output reference data, not just the index.

## When to Use Each Mode

| Mode | Use Case |
|------|----------|
| **Batch** | Stake validator coordinator with list of contract input indices |
| **Self** | Spend validator needing its own index |
| **Static** | Redeemer doesn't depend on indices |

## Related Topics

- [Deferred Execution](./deferred-execution) - Program storage and fresh state model
- [Transaction Flow](./transaction-flow) - Build phases and state machine
