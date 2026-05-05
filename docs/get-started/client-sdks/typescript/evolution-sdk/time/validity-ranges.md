---
title: Validity Ranges
description: Set time constraints on transactions
---

# Validity Ranges

Validity ranges define the time window during which a transaction can be included in a block. This is essential for time-locked smart contracts, deadline-based escrows, and any logic that depends on the current time.

## Setting Validity

Use `.setValidity()` with Unix timestamps in milliseconds:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const now = BigInt(Date.now())

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .setValidity({
    from: now,
    to: now + 300_000n
  })
  .build()
```

## Parameters

| Field  | Type                  | Description                                               |
| ------ | --------------------- | --------------------------------------------------------- |
| `from` | `UnixTime` (optional) | Transaction valid after this time (validityIntervalStart) |
| `to`   | `UnixTime` (optional) | Transaction expires after this time (TTL)                 |

Both are optional — you can set just one bound:

```typescript
// Only set expiry
.setValidity({ to: now + 600_000n })

// Only set start time
.setValidity({ from: now })

// Both bounds
.setValidity({ from: now, to: now + 300_000n })
```

## Why Validity Matters

**For regular transactions**: Setting a TTL prevents old transactions from being submitted after conditions have changed.

**For smart contracts**: Plutus validators can inspect the validity range to enforce time-based conditions like deadlines or vesting schedules. The validator sees the range, not the exact current time — it knows the transaction was submitted within the specified window.

## Next Steps

- [Smart Contracts](../smart-contracts/spending.md) — Time-locked script spending
- [POSIX Time](./posix.md) — Unix timestamp utilities
- [Slots](./slots.md) — Slot-based time
