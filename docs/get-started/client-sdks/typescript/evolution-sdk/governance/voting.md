---
title: Voting
description: Cast governance votes on proposals
---

# Voting

DReps, Constitutional Committee members, and Stake Pool Operators can vote on governance actions. Evolution SDK's `vote` operation submits voting procedures in a transaction.

## Casting a Vote

Build a `VotingProcedures` object with a voter, the governance action to vote on, and your vote (yes/no/abstain):

```typescript
import { DRep, GovernanceAction, TransactionHash, VotingProcedures, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const drep: DRep.DRep
const voter = new VotingProcedures.DRepVoter({ drep })

declare const govActionTxHash: TransactionHash.TransactionHash
const govActionId = new GovernanceAction.GovActionId({
  transactionId: govActionTxHash,
  govActionIndex: 0n,
})

const procedure = new VotingProcedures.VotingProcedure({
  vote: VotingProcedures.yes(),
  anchor: null,
})

const votingProcedures = VotingProcedures.singleVote(voter, govActionId, procedure)

const tx = await client.newTx().vote({ votingProcedures }).build()
const signed = await tx.sign()
await signed.submit()
```

### Vote Options

| Function | Meaning |
| --- | --- |
| `VotingProcedures.yes()` | Vote in favor |
| `VotingProcedures.no()` | Vote against |
| `VotingProcedures.abstain()` | Explicitly abstain |

## Voter Types

| Voter                        | Credential Type                | Script-Controlled? |
| ---------------------------- | ------------------------------ | ------------------ |
| **DRep**                     | Key hash or script hash        | Yes                |
| **Constitutional Committee** | Hot credential (key or script) | Yes                |
| **Stake Pool Operator**      | Pool key hash                  | No (key-hash only) |

## Script-Controlled Voting

```typescript
import { Data, VotingProcedures, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const votingProcedures: VotingProcedures.VotingProcedures
declare const votingScript: any

const tx = await client
  .newTx()
  .vote({
    votingProcedures,
    redeemer: Data.constr(0n, []),
    label: "drep-vote"
  })
  .attachScript({ script: votingScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

The builder automatically detects script-controlled voters and will fail if a redeemer is required but not provided.

## Next Steps

- [DRep Registration](./drep-registration) — Register before voting
- [Proposals](./proposals) — Submit governance actions to vote on
- [Vote Delegation](./vote-delegation) — Delegate voting power
