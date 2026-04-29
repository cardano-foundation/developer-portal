---
title: Proposals
description: Submit governance proposals on Cardano
---

# Proposals

Governance proposals submit actions for the community to vote on. The deposit is automatically fetched from protocol parameters and refunded to your reward account when the proposal is finalized.

## Submitting a Proposal

```typescript
import { Anchor, GovernanceAction, RewardAccount, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const governanceAction: GovernanceAction.GovernanceAction
declare const rewardAccount: RewardAccount.RewardAccount
declare const anchor: Anchor.Anchor

const tx = await client
  .newTx()
  .propose({
    governanceAction,
    rewardAccount,
    anchor
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

The `govActionDeposit` is deducted automatically during transaction balancing.

## Governance Action Types

| Action                        | Description                                 |
| ----------------------------- | ------------------------------------------- |
| **Protocol Parameter Update** | Modify network parameters                   |
| **Hard Fork Initiation**      | Initiate a hard fork                        |
| **Treasury Withdrawal**       | Withdraw from the treasury                  |
| **No Confidence**             | Express no confidence in the committee      |
| **New Constitution**          | Propose a new constitution                  |
| **Update Committee**          | Change committee membership                 |
| **Info Action**               | Informational proposal (no on-chain effect) |

## Multiple Proposals

Submit multiple proposals in a single transaction by chaining `.propose()`:

```typescript
import { Anchor, GovernanceAction, RewardAccount, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const action1: GovernanceAction.GovernanceAction
declare const action2: GovernanceAction.GovernanceAction
declare const rewardAccount: RewardAccount.RewardAccount
declare const anchor1: Anchor.Anchor
declare const anchor2: Anchor.Anchor

const tx = await client
  .newTx()
  .propose({ governanceAction: action1, rewardAccount, anchor: anchor1 })
  .propose({ governanceAction: action2, rewardAccount, anchor: anchor2 })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Voting](./voting.md) — Vote on submitted proposals
- [DRep Registration](./drep-registration.md) — Register to vote on proposals
