---
title: Stake Key Registration
description: Register stake credentials on the Cardano blockchain
---

# Stake Key Registration

Before you can delegate or earn rewards, your stake credential must be registered on-chain. Registration requires a deposit (currently 2 ADA on mainnet) which is refunded when you deregister.

## Basic Registration

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

const tx = await client.newTx().registerStake({ stakeCredential }).build()

const signed = await tx.sign()
await signed.submit()
```

The deposit amount (currently 2 ADA) is fetched automatically from protocol parameters.

## Register and Delegate Together

The Conway era introduced combined certificates that register and delegate in one step, saving a certificate fee:

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
declare const drep: any

// Register + delegate to pool in one certificate
const tx = await client
  .newTx()
  .registerAndDelegateTo({
    stakeCredential,
    poolKeyHash
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

You can also combine registration with DRep delegation or both:

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
declare const drep: any

const tx = await client
  .newTx()
  .registerAndDelegateTo({
    stakeCredential,
    poolKeyHash,
    drep
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Script-Controlled Registration

For stake credentials controlled by Plutus scripts, provide a redeemer:

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
  .registerStake({
    stakeCredential: scriptStakeCredential,
    redeemer: Data.constr(0n, []),
    label: "register-script-stake"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Delegation](./delegation.md) — Delegate your registered stake
- [Withdrawal](./withdrawal.md) — Claim accumulated rewards
- [Deregistration](./deregistration.md) — Remove credential and reclaim deposit
