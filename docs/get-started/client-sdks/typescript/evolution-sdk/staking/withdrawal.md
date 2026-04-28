---
title: Rewards Withdrawal
description: Withdraw accumulated staking rewards
---

# Rewards Withdrawal

Staking rewards accumulate each epoch and must be explicitly withdrawn to your wallet. The `withdraw` operation claims rewards from a registered stake credential.

## Basic Withdrawal

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
console.log("Available rewards:", delegation.rewards, "lovelace")

const tx = await client
  .newTx()
  .withdraw({
    stakeCredential,
    amount: delegation.rewards
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Zero-Amount Withdrawal (Validator Trigger)

Use `amount: 0n` to trigger a stake validator without actually withdrawing rewards. This is the **coordinator pattern** used by some DeFi protocols:

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
  .withdraw({
    stakeCredential: scriptStakeCredential,
    amount: 0n,
    redeemer: Data.constr(0n, []),
    label: "coordinator-trigger"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

This pattern is useful for validators that need to run stake-level checks as part of a larger transaction.

## Script-Controlled Withdrawal

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
declare const rewardAmount: bigint

const tx = await client
  .newTx()
  .withdraw({
    stakeCredential: scriptStakeCredential,
    amount: rewardAmount,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Deregistration](./deregistration) — Withdraw before deregistering
- [Delegation](./delegation) — Change pool delegation
- [Querying Delegation](../querying/delegation) — Check reward balance
