---
title: Deregistration
description: Deregister stake credentials and reclaim deposit
---

# Deregistration

Deregistering a stake credential removes it from the chain and refunds the deposit you paid during registration. Withdraw all accumulated rewards before deregistering — rewards are lost after deregistration.

## Basic Deregistration

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = await client.address()
const stakeCredential = address.stakingCredential!

const tx = await client.newTx().deregisterStake({ stakeCredential }).build()

const signed = await tx.sign()
await signed.submit()
```

## Withdraw and Deregister Together

Best practice: withdraw rewards and deregister in the same transaction to avoid losing rewards:

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = await client.address()
const stakeCredential = address.stakingCredential!
const delegation = await client.getWalletDelegation()
const rewardBalance = delegation.rewards

const tx = await client
  .newTx()
  .withdraw({ stakeCredential, amount: rewardBalance })
  .deregisterStake({ stakeCredential })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Script-Controlled Deregistration

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptStakeCredential: Credential.Credential
declare const stakeScript: any

const tx = await client
  .newTx()
  .deregisterStake({
    stakeCredential: scriptStakeCredential,
    redeemer: Data.constr(0n, []),
    label: "deregister-script-stake"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Registration](./registration.md) — Re-register if needed
- [Withdrawal](./withdrawal.md) — Withdraw rewards before deregistering
