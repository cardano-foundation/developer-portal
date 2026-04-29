---
title: Governance
description: Conway-era governance with DReps, voting, and proposals
---

import DocCardList from '@theme/DocCardList';

# Governance

Evolution SDK supports Cardano's Conway-era governance system (CIP-1694). Register as a Delegated Representative (DRep), vote on governance actions, submit proposals, and manage Constitutional Committee credentials — all through the transaction builder.

<DocCardList />

## Governance Roles

| Role                    | Description                                                | Operations                         |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------- |
| **DRep**                | Delegated Representative who votes on behalf of delegators | Register, update, deregister, vote |
| **Committee Member**    | Constitutional Committee member                            | Authorize hot key, resign          |
| **Stake Pool Operator** | Pool operators vote on specific governance actions         | Vote (key-hash only)               |
| **ADA Holder**          | Delegate voting power to a DRep                            | Delegate to DRep                   |

## Quick Example

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

## Script-Controlled Governance

All governance operations support script-controlled credentials. Provide a redeemer when the credential is a script hash:

```typescript
import { Credential, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptDrepCredential: Credential.Credential
declare const governanceScript: any

const tx = await client
  .newTx()
  .registerDRep({
    drepCredential: scriptDrepCredential,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: governanceScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [DRep Registration](./drep-registration.md) — Register, update, and deregister as a DRep
- [Voting](./voting.md) — Cast votes on governance actions
- [Proposals](./proposals.md) — Submit governance proposals
- [Vote Delegation](./vote-delegation.md) — Delegate voting power to a DRep
- [Committee Operations](./committee.md) — Authorize hot credentials and resign
