---
title: Migration from Lucid
description: Guide for migrating from Lucid Evolution
sidebar_position: 9
---

# Migration from Lucid

Lucid Evolution provides solid functionality, but Evolution SDK takes it further with enhanced type safety through Effect-TS, better composability, and modular provider switching. The core concepts remain the same—you're still building, signing, and submitting transactions—but the API is restructured for a better developer experience.

This guide helps you transition your existing Lucid code. The migration is straightforward for most use cases: update imports, restructure client initialization, and adjust a few method calls. You'll find the patterns familiar, just with stronger compile-time guarantees.

Migrate when you need better type safety, want to leverage Effect patterns, or are starting a new feature where you can adopt the new SDK without rewriting everything at once.

## Key API Changes

The main differences you'll encounter:

| Aspect                   | Change                                 |
| ------------------------ | -------------------------------------- |
| **Imports**              | Deno URLs → npm package                |
| **Client creation**      | Separate calls → unified config object |
| **Transaction building** | Same chainable pattern                 |
| **Error handling**       | try/catch → Effect Result types        |
| **Provider setup**       | Implicit → explicit config             |

## Updating Your Code

### Client Initialization

**Before (Lucid):**

```typescript
import { Lucid } from "https://deno.land/x/lucid/mod.ts"

const lucid = await Lucid.new(blockfrostProvider, "Preprod")
```

**Evolution SDK:**

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: "your-project-id"
  })
  .withSeed({
    mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    accountIndex: 0
  })
```

### Building Transactions

**Lucid:**

```typescript
lucid.newTx().payToAddress("addr...", { lovelace: 2000000n }).complete()
```

**Evolution SDK:**

```ts
const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32(
      "addr_test1qzrf9g3ea6hdc5vfujgrpjc0c0xq3qqkz8zkpwh3s6nqzhgey8k3eq73kr0gcqd7cyy75s0qqx0qqx0qqx0qqx0qx7e8pq"
    ),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()
```

### Smart Contract Interactions

**Lucid:**

```typescript
const tx = await lucid
  .newTx()
  .collectFrom(scriptUtxos, redeemer)
  .attachSpendingValidator(validator)
  .complete()
```

**Evolution SDK:**

```typescript
const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, []),
    label: "my-spend"  // Optional debug label (new!)
  })
  .attachScript({ script: validatorScript })
  .build()
```

Key differences:
- `collectFrom` takes a named object instead of positional args
- `attachSpendingValidator` → `attachScript` (one method for all script types)
- Optional `label` field for debugging script failures
- Redeemer uses `Data.constr()` instead of Lucid's Data class

### Querying

**Lucid:**

```typescript
const utxos = await lucid.utxosAt(address)
const utxoWithUnit = await lucid.utxoByUnit(unit)
```

**Evolution SDK:**

```typescript
const utxos = await client.getUtxos(address)
const utxoWithUnit = await client.getUtxoByUnit(unit)
const walletUtxos = await client.getWalletUtxos()  // New: wallet-specific
```

### Datum Construction

**Lucid:**

```typescript
import { Data } from "lucid-evolution"
const datum = Data.to(new Constr(0, [42n]))
```

**Evolution SDK:**

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

// Option 1: Raw PlutusData
const datum = Data.constr(0n, [Data.int(42n)])

// Option 2: Type-safe with TSchema (recommended)
const MyDatum = TSchema.Struct({ value: TSchema.Integer })
const Codec = Data.withSchema(MyDatum)
const datum = Codec.toData({ value: 42n })
```

## Common Patterns

Here are the typical changes you'll make throughout your codebase:

| Lucid                          | Evolution SDK                                 |
| ------------------------------ | --------------------------------------------- |
| `Lucid.new(provider, network)` | `client(network).withBlockfrost(...).withSeed(...)` |
| `.payToAddress(addr, assets)`  | `.payToAddress({ address, assets })`          |
| `.complete()`                  | `.build()`                                    |
| `.signWithWallet()`            | `tx.sign()`                                   |
| `.submit()`                    | `signed.submit()`                             |
| try/catch errors               | Effect Result types                           |

Evolution SDK uses staged capability assembly and explicit method parameters for better type inference and clearer intent.

## Migration Strategy

:::info
**You don't have to migrate everything at once.** Evolution SDK can coexist with Lucid in the same project. Start with one module, test on preprod, then gradually expand.
:::

1. Install `@evolution-sdk/evolution` alongside Lucid (they can coexist)
2. Update one module at a time, starting with simpler transaction flows
3. Test thoroughly on testnet before touching mainnet code
4. Gradually expand to more complex features once comfortable

## What Stays the Same

The blockchain fundamentals haven't changed:

- UTxO model and transaction structure
- Address formats and validation
- Signing and key management concepts
- Network parameters and protocol rules

You're learning a new API for familiar concepts, not relearning Cardano itself.

## Next Steps

- [Getting Started](./getting-started.md) - Build your first Evolution SDK transaction
- [Wallets](../wallets/overview.md) - Wallet types and key management
- [Transactions](../transactions/overview.md) - Advanced transaction building
- [API Reference](https://no-witness-labs.github.io/evolution-sdk/) - Complete API documentation
