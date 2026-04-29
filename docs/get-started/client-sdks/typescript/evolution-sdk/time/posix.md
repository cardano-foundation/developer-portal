---
title: POSIX Time
description: Unix timestamp handling for Cardano transactions
---

# POSIX Time

Evolution SDK uses Unix timestamps in milliseconds (bigint) for all time-related operations. The `UnixTime` type represents milliseconds since the Unix epoch (January 1, 1970).

## Getting Current Time

```typescript
const now = BigInt(Date.now())

const deadline = BigInt(new Date("2025-12-31T23:59:59Z").getTime())
```

## Common Conversions

```typescript
const fiveMinutes = 5n * 60n * 1000n
const oneHour = 60n * 60n * 1000n
const oneDay = 24n * 60n * 60n * 1000n

const now = BigInt(Date.now())
const expiresIn5Min = now + fiveMinutes
const expiresIn1Hour = now + oneHour
```

## Usage in Transactions

Time values are passed to `.setValidity()` as Unix milliseconds. The builder converts them to slots automatically:

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const now = BigInt(Date.now())

// Transaction valid for the next 10 minutes
// const tx = await client.newTx()
//   .setValidity({ from: now, to: now + 600_000n })
//   ...
```

## Next Steps

- [Slots](./slots.md) — How Unix time maps to slots
- [Validity Ranges](./validity-ranges.md) — Setting time constraints on transactions
