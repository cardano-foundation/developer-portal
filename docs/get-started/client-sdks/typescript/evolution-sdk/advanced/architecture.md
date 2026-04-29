---
title: Architecture
description: How the transaction builder works internally
---

# Architecture

Evolution SDK's transaction builder uses a **deferred execution pattern**. Operations like `payToAddress`, `collectFrom`, and `mintAssets` don't execute immediately — they accumulate as a list of programs that run together when you call `.build()`.

## Build Phases

When `.build()` is called, the transaction goes through a state machine of phases. The exact order depends on whether scripts are involved:

**Simple transactions (no scripts):**
Selection → Change Creation → Fee Calculation → Balance → Complete

**Script transactions:**
Selection → Collateral → Change Creation → Fee Calculation → Balance → Evaluation → (re-balance if needed) → Complete

| Phase | Purpose |
|-------|---------|
| **Selection** | Choose UTxOs from the wallet to cover outputs + fees |
| **Collateral** | Select collateral UTxOs (script transactions only) |
| **Change Creation** | Compute change outputs for leftover value |
| **Fee Calculation** | Calculate transaction fees based on size and script costs |
| **Balance** | Verify inputs equal outputs + fees |
| **Evaluation** | Execute Plutus scripts and compute execution units |
| **Fallback** | Handle edge cases (insufficient change, etc.) |
| **Complete** | Assemble the final transaction |

## Deferred Execution

```typescript
// These don't execute immediately — they record operations
const builder = client.newTx()
  .payToAddress({ ... })
  .collectFrom({ ... })
  .mintAssets({ ... })

// This executes all programs and runs the build phases
const tx = await builder.build()
```

This design enables:
- **Composition** — Combine builders with `.compose()`
- **Redeemer indexing** — Compute correct indices after coin selection
- **Optimization** — The builder sees all operations before making decisions

## Three Build Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `.build()` | `Promise<SignBuilder>` | Standard async/await |
| `.buildEffect()` | `Effect<SignBuilder, Error>` | Effect-based composition |
| `.buildEither()` | `Promise<Either<Error, SignBuilder>>` | Explicit error handling |

## Build Options

Customize the build process:

```typescript
.build({
  coinSelection: "largest-first",  // or custom function
  changeAddress: customAddress,     // Override change address
  availableUtxos: utxos,           // Override available UTxOs
  evaluator: customEvaluator,      // Custom script evaluator
  debug: true,                     // Enable debug logging
  setCollateral: 5_000_000n,       // Collateral amount
  slotConfig: { ... },             // Custom time configuration
})
```

## Next Steps

- [Error Handling](./error-handling.md) — Effect-based error patterns
- [Performance](./performance.md) — Coin selection and optimization
- [Custom Providers](./custom-providers.md) — Implement a provider
