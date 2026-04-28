---
title: Script Evaluation
description: Plutus script execution and ExUnits calculation for transaction validation
---

## Abstract

Cardano transactions can include Plutus validators—programs written in UPLC (Untyped Plutus Core) that verify spending conditions, minting policies, or governance actions. Before submitting a transaction, the builder must execute these validators to calculate ExUnits (execution units: memory and CPU steps). ExUnits determine script execution costs, which contribute to transaction fees.

## Design Philosophy

Plutus validators execute on-chain during transaction validation. Nodes run the UPLC code with the transaction context (inputs, outputs, redeemers, datums) and reject transactions if validators fail or exceed execution limits. The evaluation phase predicts this on-chain execution off-chain, determining how much memory and CPU time each validator will consume.

This prediction serves two purposes: fee accuracy and submission safety. Fees depend on transaction size, which includes ExUnits in redeemer witness entries. Accurate ExUnits mean accurate fees—underestimated ExUnits produce transactions that are rejected by nodes. Overestimated ExUnits waste user funds on excessive fees.

## Evaluation Flow

**Phase Steps:**

1. **Redeemer Check**: Verify transaction contains redeemers (scripts). If redeemers map is empty, skip evaluation.

2. **Evaluation Status Check**: Determine if all redeemers already have non-zero ExUnits. If yes, skip re-evaluation to prevent infinite loops.

3. **Evaluator Resolution**: Retrieve evaluator from build options. Evaluator can come from explicit `BuildOptions.evaluator` or provider's `evaluateTx` method.

4. **Transaction Assembly**: Build the complete transaction CBOR including inputs (sorted canonically), outputs, fees, collateral, and redeemers with placeholder ExUnits.

5. **Context Preparation**: Assemble evaluation context containing cost models (protocol parameters), execution limits (max memory/steps), and slot configuration.

6. **Evaluator Invocation**: Call evaluator's `evaluate` method with transaction CBOR, additional UTxOs, and evaluation context.

7. **Result Matching**: Map evaluation results back to redeemers in transaction state. Results identify redeemers by `(tag, index)` pairs.

8. **ExUnits Update**: Write ExUnits from evaluation results into redeemer entries.

9. **Fee Recalculation Trigger**: Route to fee calculation phase. Updated ExUnits change transaction size.

## Evaluator Interface

The evaluator exposes a single `evaluate` method:

**Input Parameters:**

- **`tx`**: Complete transaction CBOR encoded as hex string.
- **`additionalUtxos`**: Array of UTxOs including both selected inputs being spent and reference inputs.
- **`context`**: Evaluation context with protocol parameters, execution limits, and slot configuration.

**Output:**

Array of `EvalRedeemer` objects, each containing:
- `redeemer_tag`: Type of redeemer (`"spend"`, `"mint"`, `"cert"`, `"reward"`)
- `redeemer_index`: Position in transaction
- `ex_units`: Computed execution units (`{mem: number, steps: number}`)

## Provider-Based Evaluation

The default evaluation strategy uses blockchain providers (Ogmios, Blockfrost, Koios, Maestro):

**How It Works:**

1. Transaction builder serializes the transaction to CBOR
2. Evaluator sends CBOR + UTxOs to provider's evaluation endpoint
3. Provider runs validators using its own UPLC interpreter
4. Provider returns ExUnits per redeemer in provider-specific format
5. Evaluator parses provider response into standard `EvalRedeemer` format
6. Builder updates redeemer ExUnits from results

**Advantages:**
- No local UPLC dependencies (lighter bundle size)
- Provider maintains interpreter updates (always protocol-compliant)
- Works across all platforms (web, Node.js, mobile)

**Trade-offs:**
- Network latency (round-trip to provider)
- Provider dependency (requires connectivity)
- Privacy consideration (provider sees transaction structure)

## Custom UPLC Evaluation

Advanced users can provide custom evaluators for local UPLC execution:

**Custom Evaluator Benefits:**

- **No Network Dependency**: Executes entirely locally (offline support)
- **Privacy**: Transaction structure never leaves local environment
- **Performance**: No network latency, instant evaluation
- **Control**: Custom cost models or execution tracing
- **Testing**: Deterministic evaluation for unit tests

## ExUnits Invalidation

When transaction structure changes, previous ExUnits become invalid.

**Why Invalidation Is Necessary:**

Validators execute with transaction context: inputs, outputs, redeemers, datums. When reselection adds UTxOs, the input set changes. A validator that checks "input at index 2" now sees a different UTxO. Previously computed ExUnits assumed old input set.

**When Invalidation Occurs:**

- **Reselection**: Coin selection adds more UTxOs to cover fees or minUTxO shortfall
- **Input Changes**: Any operation that modifies the selected inputs array
- **Output Changes**: Operations that add/remove outputs affecting validator logic
- **Not on Fee Changes**: Fee updates alone don't invalidate

## Evaluation Context

**Cost Models**: CBOR-encoded arrays defining operation costs for PlutusV1, PlutusV2, and PlutusV3.

**Execution Limits**: Protocol enforces per-transaction limits:
- `maxTxExSteps`: Maximum CPU steps for all scripts combined
- `maxTxExMem`: Maximum memory units for all scripts combined

**Slot Configuration**: Time-based validators use slot numbers for timelock logic.

## Performance Considerations

**Provider Evaluation**: Network latency dominates (50-500ms typical). Provider-side execution is fast (1-10ms per validator), but round-trip time adds overhead.

**Local UPLC Evaluation**: Execution time depends on validator complexity and UPLC interpreter performance. Aiken UPLC (Rust-based WASM) typically evaluates in 1-20ms per validator.

**Re-evaluation Cost**: Each balance attempt re-evaluates. If transaction requires 3-5 balance attempts (common with complex scripts), evaluation runs 3-5 times.

## Related Topics

- [Transaction Flow](./transaction-flow) - How script evaluation integrates into the build state machine
