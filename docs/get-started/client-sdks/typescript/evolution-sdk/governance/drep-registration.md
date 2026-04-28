---
title: DRep Registration
description: Register, update, and deregister as a Delegated Representative
---

# DRep Registration

Delegated Representatives (DReps) vote on governance actions on behalf of ADA holders who delegate to them. Registration requires a deposit and optionally an anchor with metadata.

## Register as a DRep

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const drepCredential: Credential.Credential

const tx = await client.newTx().registerDRep({ drepCredential }).build()

const signed = await tx.sign()
await signed.submit()
```

The deposit amount is fetched automatically from protocol parameters (`drepDeposit`).

## Register with Metadata

Attach an anchor containing a metadata URL and its hash:

```typescript
import { Anchor, Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const drepCredential: Credential.Credential
declare const anchor: Anchor.Anchor

const tx = await client
  .newTx()
  .registerDRep({
    drepCredential,
    anchor
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Update DRep Metadata

```typescript
import { Anchor, Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const drepCredential: Credential.Credential
declare const newAnchor: Anchor.Anchor

const tx = await client
  .newTx()
  .updateDRep({
    drepCredential,
    anchor: newAnchor
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Deregister as a DRep

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const drepCredential: Credential.Credential

const tx = await client.newTx().deregisterDRep({ drepCredential }).build()

const signed = await tx.sign()
await signed.submit()
```

## Constitutional Committee Operations

### Authorize a Hot Credential

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const coldCredential: Credential.Credential
declare const hotCredential: Credential.Credential

const tx = await client.newTx().authCommitteeHot({ coldCredential, hotCredential }).build()

const signed = await tx.sign()
await signed.submit()
```

### Resign from Committee

```typescript
import { Anchor, Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const coldCredential: Credential.Credential
declare const resignationAnchor: Anchor.Anchor

const tx = await client
  .newTx()
  .resignCommitteeCold({
    coldCredential,
    anchor: resignationAnchor
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Voting](./voting) — Cast votes as a DRep
- [Vote Delegation](./vote-delegation) — Delegate voting power to DReps
- [Proposals](./proposals) — Submit governance proposals
