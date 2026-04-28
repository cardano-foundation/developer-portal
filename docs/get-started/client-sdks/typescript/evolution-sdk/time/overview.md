---
title: Time
description: Working with time on Cardano
---

import DocCardList from '@theme/DocCardList';

# Time

Cardano uses a slot-based time system. Each slot has a fixed duration (typically 1 second on mainnet), and transactions reference slots for validity ranges. Evolution SDK handles the conversion between Unix timestamps and slots automatically.

<DocCardList />

## Key Concepts

| Concept            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| **Slot**           | A numbered time unit on the blockchain               |
| **Unix Time**      | Milliseconds since epoch (standard POSIX time)       |
| **Validity Range** | Time window during which a transaction is valid      |
| **Slot Config**    | Network-specific mapping between slots and Unix time |

## How It Works

When you call `.setValidity({ from, to })`, you provide Unix timestamps in milliseconds. The transaction builder converts these to slots using the network's slot configuration:

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const now = BigInt(Date.now())

// Set validity: valid from now, expires in 5 minutes
// await client.newTx()
//   .setValidity({ from: now, to: now + 300_000n })
//   ...
```

## Next Steps

- [Slots](./slots) — Slot-based time and conversion
- [POSIX Time](./posix) — Unix timestamp utilities
- [Validity Ranges](./validity-ranges) — Set transaction time constraints
