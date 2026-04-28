---
title: Unfrack Optimization
description: UTxO structure optimization through strategic bundling and subdivision
---

## Abstract

Cardano UTxOs carry both ADA and native assets (tokens, NFTs). Poorly structured UTxOs create wallet fragmentation—many small UTxOs that increase transaction size and fees. The unfrack optimization addresses this by strategically bundling tokens and subdividing ADA during change creation, producing an optimal UTxO structure that minimizes future transaction costs while maintaining protocol validity constraints.

## Design Philosophy

Unoptimized change outputs create technical debt. A wallet with 50 small UTxOs requires larger transactions (more inputs) to make payments, increasing fees. A wallet with all assets on one UTxO forces users to "break" that UTxO for every transaction, creating change recursively.

The solution operates on first principles: separate concerns (tokens from ADA), group related assets (same-policy tokens), and create spending flexibility (subdivided ADA). When change is created, the system checks if optimization is affordable—if the leftover exceeds minimum requirements for multiple outputs, it distributes intelligently. If not, it consolidates into a single valid output.

## Token Bundling Strategy

Tokens are distributed into bundles based on policy ID and configurability.

**Key Behaviors:**
- Tokens are grouped by policy ID to avoid unnecessary asset mixing
- Each bundle respects `bundleSize` configuration (default: 10 tokens per UTxO)
- MinUTxO is calculated per bundle using CBOR-accurate size estimation
- Same-policy tokens stay together unless count exceeds bundle size

## ADA Distribution Strategy

After token bundles are created with their minimum ADA requirements, remaining ADA follows two core strategies:

**SPREAD**: Distributes remaining ADA evenly across token bundles. Used when:
- Remaining ADA is below `subdivideThreshold` (default: 100 ADA), OR
- Remaining ADA cannot afford a separate valid output (< minUTxO)

**SUBDIVIDE**: Creates multiple ADA-only outputs using percentage-based distribution. Used when:
- Remaining ADA >= `subdivideThreshold`, AND
- Remaining ADA >= minUTxO for standalone output, AND
- Smallest percentage-based amount >= minUTxO

## ADA-Only Scenario

When no tokens exist in change, the decision flow simplifies. Default percentages (50%, 15%, 10%, 10%, 5%, 5%, 5%) provide a logarithmic distribution suitable for typical transaction patterns.

## Configuration Options

**Subdivision Threshold**: Controls when ADA gets split into multiple outputs. Default is 100 ADA—below this, ADA spreads across token bundles; above this, ADA creates separate outputs.

**Subdivision Percentages**: Defines the distribution pattern for ADA-only outputs. Default pattern (50%, 15%, 10%, 10%, 5%, 5%, 5%) creates a logarithmic spread.

**Bundle Size**: Limits tokens per UTxO. Default is 10 tokens per bundle. Smaller sizes create more bundles. Larger sizes consolidate tokens.

**Policy Isolation**: Controls whether tokens of the same policy stay together or separate.

**NFT Grouping**: Determines whether NFTs cluster by policy or mix freely.

These parameters trade off UTxO count against spending efficiency. The defaults favor spending efficiency.

## Affordability Guarantees

All unfrack operations maintain protocol validity through affordability checks:

1. **Pre-Flight Check**: Change creation phase validates that leftover >= minUTxO for single output before attempting unfrack
2. **Per-Bundle MinUTxO**: Each token bundle calculates its minimum using CBOR-accurate size estimation
3. **Subdivision Validation**: Before subdividing ADA, verifies smallest percentage-based amount >= minUTxO
4. **Fallback Path**: If unfrack is unaffordable, falls back to single consolidated change output

This ensures unfrack never creates invalid outputs.

## Integration Points

**Change Creation Phase**: When `BuildOptions.unfrack` is enabled and change outputs need to be created, the builder calls `createUnfrackedChangeOutputs()`.

**Fee Calculation Phase**: After unfrack creates outputs, fees are recalculated based on the new transaction size.

**Build Options**: Users enable unfrack by providing `unfrack` configuration in `BuildOptions`. If omitted, change creation uses simple single-output strategy.

## Related Topics

- [Transaction Flow](./transaction-flow) - How unfrack fits into the build phase state machine
