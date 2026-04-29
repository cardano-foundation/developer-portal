---
title: Coin Selection
description: UTxO selection algorithms for covering transaction requirements
---

## Abstract

Transactions require UTxOs as inputs to provide assets (ADA and native tokens) for outputs. Coin selection determines which UTxOs from a wallet to spend. The algorithm must cover all required assets while minimizing transaction size and fees. The system implements largest-first selection—choosing UTxOs with the most ADA first until requirements are met.

## Design Philosophy

Transaction costs grow with input count. More inputs mean larger transaction size, which increases fees. The naive approach—randomly selecting UTxOs—produces unpredictable costs and may fragment wallet state further.

The solution operates on first principles: prefer large UTxOs over small ones. A single 100 ADA UTxO is cheaper to spend than ten 10 ADA UTxOs. By sorting UTxOs by value and selecting from largest to smallest, the algorithm minimizes input count naturally.

## Largest-First Algorithm

**Algorithm Steps:**

1. **Sort Phase**: Order all available UTxOs by lovelace value (descending). This ensures large UTxOs are considered first.

2. **Accumulation Phase**: Iterate through sorted UTxOs. For each UTxO:
   - Check if all required assets are already accumulated
   - If yes, stop iteration (sufficient inputs found)
   - If no, add UTxO to selection and update accumulated totals

3. **Verification Phase**: After iteration completes, verify every required asset is covered. If any asset falls short, throw error with specific shortfall details.

**Key Behaviors:**
- Stops immediately when requirements met (no over-selection beyond necessity)
- Handles multi-asset requirements by checking all units every iteration
- Throws descriptive errors identifying specific asset shortfalls
- Maintains input order stability (same wallet state = same selection)

## Multi-Asset Selection

When transactions require native assets (tokens, NFTs), selection must cover both ADA and specific asset units.

**Multi-Asset Principles:**

**Unit Tracking**: Each asset unit (lovelace, specific token policy+name) tracks separately. A UTxO containing 10 ADA and 5 TokenA contributes to both accumulators simultaneously.

**Greedy Coverage**: Selection continues until *all* units meet requirements.

**Efficiency Through Mixing**: UTxOs with multiple needed assets are more valuable than UTxOs with single assets.

**Verification Per Unit**: After selection completes, each required unit verifies independently.

## Function Interface

**Input Parameters:**
- `availableUtxos`: Array of UTxOs that can be spent (wallet's current UTxO set)
- `requiredAssets`: Asset map specifying needed amounts (lovelace + native assets)

**Output:**
- `selectedUtxos`: Array of UTxOs chosen to cover requirements

**Properties:**
- **Deterministic**: Same inputs always produce same output
- **Pure**: No side effects, no state mutation
- **Total**: Either returns valid selection or throws error
- **Minimal**: Returns smallest set that satisfies requirements

## Algorithm Trade-offs

**Largest-First** (Implemented):
- **Optimization**: Minimize input count (fewer inputs = smaller tx)
- **Speed**: O(n log n) for sorting, O(n) for selection
- **Predictability**: Same wallet state always produces same selection
- **Weakness**: May select much more value than needed (large change)
- **Use Case**: Default for most transactions, prioritizes low fees

**Random-Improve** (Not Implemented):
- **Optimization**: Balance input count with change minimization
- **Strategy**: Random selection, then iteratively swap UTxOs to reduce change
- **Use Case**: Privacy-focused transactions

**Optimal** (Not Implemented):
- **Optimization**: Minimize total fees (inputs + change outputs)
- **Use Case**: High-value transactions where fee optimization justifies computation cost

**Custom Functions**: Users can provide their own `CoinSelectionFunction` that implements any strategy.

## Performance Characteristics

**Time Complexity**: O(n log n) for sorting + O(n) for selection = O(n log n) overall, where n is number of available UTxOs.

**Space Complexity**: O(n) for sorted copy of UTxO array + O(m) for selected UTxOs where m ≤ n.

**Best Case**: O(1) when no selection needed (explicit inputs sufficient).

**Worst Case**: O(n log n) when all UTxOs must be considered before finding sufficient assets.

## Related Topics

- [Transaction Flow](./transaction-flow.md) - How coin selection integrates into the build state machine
