---
title: Staking
description: Stake delegation, rewards, and credential management
---

import DocCardList from '@theme/DocCardList';

# Staking

Evolution SDK provides complete staking operations — register stake credentials, delegate to pools and DReps, withdraw rewards, and deregister. All operations support both key-based and script-controlled stake credentials.

<DocCardList />

## Staking Lifecycle

1. **Register** — Create a stake credential on-chain (requires a deposit)
2. **Delegate** — Assign your stake to a pool and/or DRep
3. **Earn** — Accumulate rewards each epoch
4. **Withdraw** — Claim accumulated rewards
5. **Deregister** — Remove credential and reclaim deposit (optional)

## Quick Example

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential
declare const poolKeyHash: any

const tx = await client
  .newTx()
  .registerStake({ stakeCredential })
  .delegateToPool({ stakeCredential, poolKeyHash })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Conway Era Features

The Conway era introduced new delegation capabilities:

- **Vote delegation** — Delegate voting power to a DRep separately from stake
- **Combined certificates** — Register + delegate in a single certificate
- **Script-controlled staking** — Use Plutus scripts for stake operations

## Next Steps

- [Registration](./registration) — Register stake credentials on-chain
- [Legacy Registration](./legacy-registration) — Pre-Conway registration, withdrawal scripts, and coordinator pattern
- [Delegation](./delegation) — Delegate to pools and DReps
- [Withdrawal](./withdrawal) — Claim accumulated staking rewards
- [Deregistration](./deregistration) — Remove credentials and reclaim deposit
- [Stake Pool Operations](./pools) — Register and retire stake pools
