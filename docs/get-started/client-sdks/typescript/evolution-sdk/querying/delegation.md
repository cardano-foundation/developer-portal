---
title: Query Delegation
description: Query stake delegation status and accumulated rewards
---

# Query Delegation

Check which pool a stake credential is delegated to and how many rewards have accumulated.

## Query Wallet Delegation

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const delegation = await client.getWalletDelegation()

console.log("Pool:", delegation.poolId)
console.log("Rewards:", delegation.rewards)
```

## Query by Reward Address

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const rewardAddress: any

const delegation = await client.getDelegation(rewardAddress)

console.log("Pool:", delegation.poolId)
console.log("Rewards:", delegation.rewards)
```

## Delegation Response

```typescript
interface Delegation {
  poolId: PoolKeyHash | null // Current pool delegation (null = not delegated)
  rewards: bigint // Accumulated rewards in lovelace
}
```

## Next Steps

- [Staking](../staking/overview.md) — Register, delegate, and withdraw
- [Withdrawal](../staking/withdrawal.md) — Claim your accumulated rewards
