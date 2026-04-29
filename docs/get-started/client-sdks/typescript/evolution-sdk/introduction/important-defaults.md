---
title: Important Defaults
description: Non-obvious behaviors you should know about before building
sidebar_position: 5
---

# Important Defaults

Evolution SDK ships with sensible defaults that handle complexity for you. But if you don't know they exist, they can be surprising. This page documents the most important implicit behaviors.

## Transaction Builder Defaults

### Automatic Coin Selection

When you call `.build()`, the SDK automatically selects UTxOs from your wallet to cover the transaction's requirements. You don't need to manually pick inputs.

```typescript
// You write this:
const tx = await client.newTx()
  .payToAddress({ address, assets: Assets.fromLovelace(5_000_000n) })
  .build()

// The builder automatically:
// 1. Queries your wallet's UTxOs
// 2. Selects the largest UTxOs first (largest-first algorithm)
// 3. Covers the payment amount + fees + min UTxO for change
```

**Override:** Pass `availableUtxos` to `.build()` to provide your own UTxO set.

### Automatic Fee Calculation

Fees are calculated automatically based on transaction size, script execution costs, and current protocol parameters. You never set fees manually.

**Override:** Use `FeeValidation.assertValidFee()` after building to verify fees are within expected bounds.

### Automatic Collateral Selection

For transactions involving Plutus scripts, the builder automatically selects collateral UTxOs. Collateral is required by the protocol in case script execution fails.

**Override:** Not typically needed — the builder handles this correctly.

### Automatic Script Evaluation

When you attach a script and provide a redeemer, the builder evaluates the script to compute execution units (memory + CPU). This happens during `.build()`.

```typescript
// You provide:
.collectFrom({ inputs: scriptUtxos, redeemer: Data.constr(0n, []) })
.attachScript({ script: validatorScript })

// The builder automatically:
// 1. Evaluates the script with the redeemer
// 2. Computes exact execution units (memory + CPU)
// 3. Sets execution budgets on the redeemer
// 4. Includes execution costs in fee calculation
```

### Automatic Redeemer Indexing

After coin selection changes the input order, redeemer indices must be recalculated. The builder does this automatically — you never manually set redeemer indices.

### Fresh State Per Build

:::info
Builders are **safe to reuse**. Each `.build()` call creates independent state — no contamination from previous builds.
:::

```typescript
const template = client.newTx()
  .payToAddress({ address, assets })

// Safe: each build() creates independent state
const tx1 = await template.build()
const tx2 = await template.build() // No contamination from tx1
```

## Encoding Defaults

### CBOR: Aiken-Compatible by Default

`UPLC.applyParamsToScript()` uses Aiken-compatible CBOR encoding (indefinite-length arrays/maps) by default. If you're using a different Plutus toolchain, you may need different options.

```typescript
// Default: Aiken encoding
UPLC.applyParamsToScript(script, params)

// For CML-compatible encoding:
UPLC.applyParamsToScript(script, params, CBOR.CML_DATA_DEFAULT_OPTIONS)
```

### Scripts Are Double-CBOR Encoded

Compiled Plutus scripts from Aiken/Plutarch are typically double-CBOR encoded (flat bytes → CBOR bytes → CBOR bytes). The SDK handles this automatically, but if you're working with raw script bytes, be aware of the encoding level.

```typescript
// Check encoding level
const level = UPLC.getCborEncodingLevel(scriptHex)
// "double" | "single" | "none"
```

## Provider Defaults

### Protocol Parameters Fetched Automatically

The builder fetches protocol parameters from your provider during `.build()`. Parameters are used for fee calculation, min UTxO requirements, and cost model selection.

### Network Is Set at Client Creation

The network (mainnet, preprod, preview) is fixed when you create the client. All operations use this network — there's no per-transaction network override.

```typescript
import { preprod, mainnet, Client } from "@evolution-sdk/evolution"

// Network is locked to preprod for all operations
const client = Client.make(preprod).withBlockfrost({...})
```

## Error Defaults

### Errors Are Tagged

All SDK errors have a `_tag` field for pattern matching. This is an Effect convention — use it instead of `instanceof`:

```typescript
catch (e: any) {
  if (e._tag === "EvaluationError") { /* script failed */ }
  if (e._tag === "CoinSelectionError") { /* insufficient funds */ }
}
```

### Build Returns Promise by Default

`.build()` returns a `Promise`. For Effect-based error handling, use `.buildEffect()`. For Either-based, use `.buildEither()`.

## Next Steps

- [Getting Started](./getting-started.md) — Build your first transaction
- [Common Patterns](../common-patterns.md) — Copy-paste recipes
- [Error Handling](../advanced/error-handling.md) — All error types and debugging
- [Architecture](../architecture/transaction-flow.md) — How the build pipeline works
