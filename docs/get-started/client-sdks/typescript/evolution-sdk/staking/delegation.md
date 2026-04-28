---
title: Delegation
description: Delegate stake to pools and voting power to DReps
---

# Delegation

Once your stake credential is registered, you can delegate your stake to earn rewards from a pool and delegate your voting power to a DRep for governance participation.

## Delegate to a Pool

Assign your stake to a stake pool to earn rewards:

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

const tx = await client.newTx().delegateToPool({ stakeCredential, poolKeyHash }).build()

const signed = await tx.sign()
await signed.submit()
```

## Delegate Voting Power to a DRep

In the Conway era, delegate your governance voting power to a Delegated Representative:

```typescript
import { Credential, DRep, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential
declare const drepKeyHash: any

const tx = await client
  .newTx()
  .delegateToDRep({
    stakeCredential,
    drep: DRep.fromKeyHash(drepKeyHash)
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

### Special DRep Options

```typescript
import { Credential, DRep, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential

// Always abstain from voting
const tx1 = await client
  .newTx()
  .delegateToDRep({
    stakeCredential,
    drep: DRep.alwaysAbstain()
  })
  .build()

// Always vote no confidence
const tx2 = await client
  .newTx()
  .delegateToDRep({
    stakeCredential,
    drep: DRep.alwaysNoConfidence()
  })
  .build()
```

## Delegate Both Stake and Voting

```typescript
import { Credential, DRep, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential
declare const poolKeyHash: any
declare const drepKeyHash: any

const tx = await client
  .newTx()
  .delegateToPoolAndDRep({
    stakeCredential,
    poolKeyHash,
    drep: DRep.fromKeyHash(drepKeyHash)
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Script-Controlled Delegation

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptStakeCredential: Credential.Credential
declare const poolKeyHash: any
declare const stakeScript: any

const tx = await client
  .newTx()
  .delegateToPool({
    stakeCredential: scriptStakeCredential,
    poolKeyHash,
    redeemer: Data.constr(0n, []),
    label: "delegate-script-stake"
  })
  .attachScript({ script: stakeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Withdrawal](./withdrawal) — Claim accumulated rewards
- [Vote Delegation](../governance/vote-delegation) — More on DRep delegation
- [Registration](./registration) — Register before delegating
