---
title: Performance
description: Optimize transaction building and UTxO management
---

# Performance

Evolution SDK provides several configuration options to optimize transaction building for different use cases.

## Coin Selection Algorithms

| Algorithm          | Strategy                                 | Status    |
| ------------------ | ---------------------------------------- | --------- |
| `"largest-first"`  | Select largest UTxOs first, fewer inputs | Available |
| `"random-improve"` | Random selection with improvement        | Planned   |
| Custom function    | Your own selection logic                 | Available |

The default algorithm is `"largest-first"`. You can also provide a custom coin selection function:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32(
      "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
    ),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build({ coinSelection: "largest-first" })
```

## UTxO Optimization (Unfrack)

The `unfrack` option optimizes your wallet's UTxO structure during transaction building:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build({
    unfrack: {
      tokens: {
        /* token bundling options */
      },
      ada: {
        /* ADA consolidation/subdivision options */
      }
    }
  })
```

## Debug Mode

Enable debug logging to inspect the build process:

```typescript
.build({ debug: true })
```

This logs progress and state at each build phase, helping diagnose issues with coin selection, balancing, and script evaluation.

## Next Steps

- [Architecture](./architecture) — Build phases and pipeline
- [Custom Providers](./custom-providers) — Provider implementation
