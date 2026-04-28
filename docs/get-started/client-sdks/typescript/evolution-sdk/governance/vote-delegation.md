---
title: Vote Delegation
description: Delegate your governance voting power to a DRep
---

# Vote Delegation

In the Conway era, ADA holders can delegate their governance voting power to a Delegated Representative (DRep). This is separate from stake pool delegation — you can delegate stake to one pool and voting power to a different DRep.

## Delegate to a DRep

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

## Built-in DRep Options

Instead of delegating to a specific DRep, you can choose a built-in option:

| Option                 | Effect                                                       |
| ---------------------- | ------------------------------------------------------------ |
| **AlwaysAbstain**      | Your voting power doesn't count toward any vote              |
| **AlwaysNoConfidence** | Your power always counts as "no confidence" in the committee |

```typescript
import { Credential, DRep, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential

const tx = await client
  .newTx()
  .delegateToDRep({
    stakeCredential,
    drep: DRep.alwaysAbstain()
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Delegate Stake and Voting Together

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

## Register and Delegate in One Step

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
  .registerAndDelegateTo({
    stakeCredential,
    drep: DRep.fromKeyHash(drepKeyHash)
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Delegation](../staking/delegation) — Pool delegation
- [DRep Registration](./drep-registration) — Become a DRep
- [Voting](./voting) — How DReps cast votes
