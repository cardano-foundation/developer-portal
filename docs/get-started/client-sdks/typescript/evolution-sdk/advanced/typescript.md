---
title: TypeScript Tips
description: Advanced TypeScript patterns for Evolution SDK
---

# TypeScript Tips

Evolution SDK leverages TypeScript's type system for safety and developer experience. Here are key patterns to know.

## Type Inference from Schemas

TSchema definitions infer their TypeScript types automatically:

```typescript
import { TSchema } from "@evolution-sdk/evolution"

const MySchema = TSchema.Struct({
  amount: TSchema.Integer,
  recipient: TSchema.ByteArray,
  metadata: TSchema.UndefinedOr(TSchema.ByteArray)
})

type MyType = typeof MySchema.Type
// { amount: bigint; recipient: Uint8Array; metadata: Uint8Array | undefined }
```

## Branded Types

Core types like `Address`, `TransactionHash`, and `PolicyId` are branded — they're structurally identical to their base types but won't accidentally mix:

```typescript
import { Address } from "@evolution-sdk/evolution"

const addr = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
// Type: Address.Address (not just any object)
```

## Client Type Narrowing

The client type narrows based on configuration:

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

// Provider-only client (no wallet) — can query but not sign
const queryClient = Client.make(preprod)
  .withBlockfrost({ baseUrl: "https://cardano-preprod.blockfrost.io/api/v0", projectId: process.env.BLOCKFROST_API_KEY! })

// Signing client (wallet + provider) — full capabilities
const signingClient = Client.make(preprod)
  .withBlockfrost({ baseUrl: "https://cardano-preprod.blockfrost.io/api/v0", projectId: process.env.BLOCKFROST_API_KEY! })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })
```

## Effect Integration

The SDK provides both Promise and Effect APIs:

```typescript
import { Effect } from "effect"

// Promise API — standard async/await
// const tx = await client.newTx().payToAddress({...}).build()

// Effect API — composable error handling
// const program = client.newTx().payToAddress({...}).buildEffect()
// Effect.runPromise(program)
```

## Namespace Imports

The SDK uses namespace exports for tree-shaking optimization:

```typescript
import { Address, Assets, Data } from "@evolution-sdk/evolution"

// Each namespace provides related functions
// Address.fromBech32(), Address.toHex(), Address.toBytes()
// Assets.fromLovelace(), Assets.merge(), Assets.addByHex()
// Data.constr(), Data.map(), Data.toCBORHex()
```

## Next Steps

- [Error Handling](./error-handling) — Effect error patterns
- [TSchema](../encoding/tschema) — Type-safe schema definitions
- [Architecture](./architecture) — SDK internals
