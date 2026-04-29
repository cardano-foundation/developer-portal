---
title: Committee Operations
description: Authorize hot credentials and resign from the Constitutional Committee
---

# Committee Operations

The Constitutional Committee is a group of members who verify that governance actions are consistent with the constitution. Committee operations use a cold/hot credential model to keep the primary signing key secure while allowing routine voting.

## What Committee Members Do

Constitutional Committee members review governance proposals and vote on whether each one is constitutional. Their votes are required alongside DRep and SPO votes for most governance actions to pass. The committee does not propose actions itself — it acts as a constitutional check on proposals submitted by others.

## Cold vs Hot Credentials

| | Cold Credential | Hot Credential |
| --- | --- | --- |
| **Purpose** | Identifies the committee member on-chain | Used for day-to-day voting |
| **Storage** | Kept offline or in secure hardware | Available on a signing machine |
| **Usage** | Authorize/revoke hot credentials, resign | Cast votes on governance actions |
| **Exposure** | Rarely used, minimal attack surface | Regularly used, higher exposure |
| **If compromised** | Committee seat is at risk | Revoke and authorize a new hot credential |

:::warning
The cold credential controls the committee seat. If it is compromised, the only recourse is resignation. Keep it in cold storage or a hardware security module.
:::

## Authorize a Hot Credential

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

const tx = await client
  .newTx()
  .authCommitteeHot({ coldCredential, hotCredential })
  .build()

const signed = await tx.sign()
await signed.submit()
```

You can re-authorize a different hot credential at any time by submitting a new `authCommitteeHot` transaction. The previous hot credential is automatically revoked.

## Resign from Committee

```typescript
import { Anchor, Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const coldCredential: Credential.Credential
declare const anchor: Anchor.Anchor

const tx = await client
  .newTx()
  .resignCommitteeCold({ coldCredential, anchor })
  .build()

const signed = await tx.sign()
await signed.submit()
```

Resignation takes effect immediately. Once resigned, the cold credential can no longer authorize hot credentials or participate in governance.

## Script-Controlled Committee

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const coldCredential: Credential.Credential
declare const hotCredential: Credential.Credential
declare const committeeScript: any

const tx = await client
  .newTx()
  .authCommitteeHot({
    coldCredential,
    hotCredential,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: committeeScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

Script-controlled credentials allow multi-sig or on-chain logic to govern committee operations, adding an extra layer of security for the cold credential.

## Next Steps

- [Voting](./voting.md) — Cast votes on governance actions
- [Proposals](./proposals.md) — Submit governance actions for the community to vote on
- [DRep Registration](./drep-registration.md) — Register as a Delegated Representative
