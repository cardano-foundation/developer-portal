---
id: governance
title: Governance
sidebar_label: Governance
description: What Cardano's CIP-1694 on-chain governance means for developers, and how to register a DRep, delegate voting power, vote, propose, and manage committee credentials, with Evolution, Mesh, CIP-95, and cardano-cli.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Cardano's on-chain governance ([CIP-1694](https://cips.cardano.org/cip/CIP-1694), the Voltaire era) lets ADA holders propose, vote on, and enact protocol changes. For developers, the key fact is that **governance actions are ordinary on-chain transactions**: DRep registration, vote delegation, and votes use the same wallets, providers, and transaction builders you already use, with a few extra certificate and procedure types.

This page is the developer integration view: how to build governance features (DRep registration, vote delegation, voting, and proposing) into a dApp or wallet with the SDKs and cardano-cli. Taking part in governance as a person, delegating your vote in a wallet, browsing actions, and reading the constitution, lives on the participant hub at [cardano.org/governance](https://cardano.org/governance), which this page links out to where relevant.

## Why governance matters to developers

Governance isn't just a user feature; it shapes the platform you build on:

- **Protocol parameters affect your code.** Transaction size limits, execution-unit budgets, min-UTXO values, and fees are all governance-controlled. A parameter change can affect your contracts, so design with margin and watch proposals that touch technical parameters.
- **Hard forks can change Plutus.** Upgrades may add Plutus versions with new capabilities: the Chang hard fork introduced Plutus V3 with built-ins for governance. Older scripts keep working, but new features may need the newer version.
- **The treasury funds development.** The on-chain treasury (over a billion ADA) is allocated by governance vote, a direct, on-chain alternative to grants you can propose into.
- **Your users participate.** If you build a wallet or dApp, your users are governance participants; they may expect to register a DRep, delegate a vote, or vote through your interface.

## The three governance bodies

CIP-1694 distributes power across three bodies as checks and balances:

- **Constitutional Committee (CC)**: verifies that actions comply with the Cardano Constitution (a constitutional court, not a decision-maker on merit).
- **Delegated Representatives (DReps)**: the primary voice of ADA holders; anyone can register as a DRep or delegate their vote to one.
- **Stake Pool Operators (SPOs)**: vote on specific action types (notably hard forks and certain parameters).

Different action types require different combinations of these bodies, with the [thresholds and lifecycle](#ratification-and-lifecycle) below. The constitution and the broader participant model live at [cardano.org/governance](https://cardano.org/governance).

## The seven governance action types

| Action | CC | DReps | SPOs |
|---|---|---|---|
| No confidence | - | Yes | Yes |
| New committee / threshold | - | Yes | Yes |
| Constitution update | Yes | Yes | - |
| Hard fork initiation | Yes | Yes | Yes |
| Protocol parameter change | Yes | Yes | * |
| Treasury withdrawal | Yes | Yes | - |
| Info action (non-binding) | - | Yes | Yes |

`*` SPOs vote on specific parameter groups only. Each type has its own voting thresholds (themselves governance-controlled).

## Ratification and lifecycle

Each action type is ratified by meeting a different mix of voting thresholds across the three bodies. The fractions below are the Conway defaults (themselves governance-controlled, set in the [Conway genesis](https://book.world.dev.cardano.org/environments/mainnet/conway-genesis.json)); a dash means that body does not vote on that type.

| Governance action | CC | DReps | SPOs |
|---|---|---|---|
| Motion of no-confidence | - | 0.67 | 0.51 |
| Update committee / threshold (normal) | - | 0.67 | 0.51 |
| Update committee / threshold (no-confidence) | - | 0.60 | 0.51 |
| New constitution or guardrails script | 2/3 | 0.75 | - |
| Hard-fork initiation | 2/3 | 0.60 | 0.51 |
| Protocol parameters (network / economic / technical) | 2/3 | 0.67 | - |
| Protocol parameters (governance group) | 2/3 | 0.75 | - |
| Treasury withdrawal | 2/3 | 0.67 | - |
| Info (non-binding) | 2/3 | 1 | 1 |

Changing a **security-relevant** protocol parameter (block and transaction sizes, fees, `utxoCostPerByte`, `govActionDeposit`, and similar) needs an extra SPO vote at 0.51, even for groups SPOs do not normally vote on.

A proposed action then runs a fixed lifecycle, which is what your tooling reads when it shows an action's status:

1. **Live for `govActionLifetime` epochs** (6 on mainnet); bodies vote during this window.
2. **Ratified** once it meets the thresholds for its type, and added to the enactment set at the epoch boundary.
3. **Enacted** at the next epoch boundary, when the change takes effect.
4. **Expired** if it never reaches its thresholds within its lifetime.

Most action types also carry a pointer to the last enacted action of the same kind, so an action ratifies against the state it was proposed against (treasury withdrawals and info actions are exempt). The deposit is returned to the proposer's reward account once the action leaves the live state.

## Before you start

The Evolution snippets below assume a client set up once from a provider and a wallet (same as for [staking](/docs/developers/curriculum/staking-governance/staking#before-you-start)):

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })
```

Mesh snippets assume a connected `wallet` and a `txBuilder`. Every operation below is **also available in [cardano-cli](/docs/developers/curriculum/staking-governance/cardano-cli/register-drep)**: the cli covers the deep ceremonies (key-based vs multisig vs Plutus DReps, authoring each action type, committee cold/hot keys), linked from each section.

## Register as a DRep

Becoming a DRep is a registration certificate with a refundable deposit (`drepDeposit`, currently 500 ADA) and an optional anchor describing who you are ([CIP-119](https://cips.cardano.org/cip/CIP-0119) metadata).

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Anchor, Credential } from "@evolution-sdk/evolution"

declare const drepCredential: Credential.Credential
declare const anchor: Anchor.Anchor

// Register (add `anchor` to attach metadata)
const tx = await client.newTx().registerDRep({ drepCredential, anchor }).build()
const signed = await tx.sign()
await signed.submit()
```

Update metadata with `updateDRep({ drepCredential, anchor })` and step down with `deregisterDRep({ drepCredential })` (the deposit is refunded). The deposit is fetched from protocol parameters automatically.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const dRep = await wallet.getDRep()
const anchorUrl = "" // optional metadata anchor
const anchorHash = await getMeshJsonHash(anchorUrl)

txBuilder
  .drepRegistrationCertificate(dRep.dRepIDCip105, { anchorUrl, anchorDataHash: anchorHash })
  .selectUtxosFrom(await wallet.getUtxos())
  .changeAddress(await wallet.getChangeAddress())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

See the [Mesh governance guide](https://meshjs.dev/apis/txbuilder/governance).

</TabItem>
</Tabs>

For the cardano-cli flow, including key-based, multisig (simple-script), and Plutus-script DReps, see [Register as a DRep](/docs/developers/curriculum/staking-governance/cardano-cli/register-drep).

## Delegate your vote

Voting power delegation is **separate from and independent of stake delegation**. You can delegate stake to one pool and your vote to a different DRep, and change either without affecting the other. There are also two built-in options for holders who don't want to pick a DRep: **Abstain** (not counted) and **No Confidence** (counts against the committee). In the Conway era, every holder must choose a governance delegation to remain eligible for staking rewards.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Credential, DRep } from "@evolution-sdk/evolution"

declare const stakeCredential: Credential.Credential
declare const drepKeyHash: any

// Delegate to a specific DRep
const tx = await client
  .newTx()
  .delegateToDRep({ stakeCredential, drep: DRep.fromKeyHash(drepKeyHash) })
  .build()

// Or a built-in option:
//   drep: DRep.alwaysAbstain()
//   drep: DRep.alwaysNoConfidence()
```

To register stake and delegate the vote in one step, use `registerAndDelegateTo({ stakeCredential, drep })`; to do stake + vote together, see [Staking](/docs/developers/curriculum/staking-governance/staking#delegate-stake-and-vote-together).

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const rewardAddress = (await wallet.getRewardAddresses())[0]

txBuilder
  .voteDelegationCertificate({ dRepId }, rewardAddress)
  .selectUtxosFrom(await wallet.getUtxos())
  .changeAddress(await wallet.getChangeAddress())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
</Tabs>

cardano-cli: a `vote-delegation-certificate` with `--drep-key-hash`, `--drep-script-hash`, `--always-abstain`, or `--always-no-confidence`, see [Delegate votes to a DRep](/docs/developers/curriculum/staking-governance/cardano-cli/delegate-to-a-drep).

## Vote on an action

Registered DReps (and CC members and SPOs, for their action types) cast Yes / No / Abstain votes against a specific governance action, identified by the transaction that created it and its index.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { DRep, GovernanceAction, TransactionHash, VotingProcedures } from "@evolution-sdk/evolution"

declare const drep: DRep.DRep
const voter = new VotingProcedures.DRepVoter({ drep })

declare const govActionTxHash: TransactionHash.TransactionHash
const govActionId = new GovernanceAction.GovActionId({
  transactionId: govActionTxHash,
  govActionIndex: 0n,
})

const procedure = new VotingProcedures.VotingProcedure({
  vote: VotingProcedures.yes(),   // or .no() / .abstain()
  anchor: null,
})

const votingProcedures = VotingProcedures.singleVote(voter, govActionId, procedure)

const tx = await client.newTx().vote({ votingProcedures }).build()
const signed = await tx.sign()
await signed.submit()
```

The voter can be a DRep, a Constitutional Committee hot credential, or an SPO pool key hash. DRep and CC voters may be script-controlled; the builder detects this and requires a redeemer.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const dRep = await wallet.getDRep()

txBuilder
  .vote(
    { type: "DRep", drepId: dRep.dRepIDCip105 },
    { txHash: "aff2909f...c0867cc", txIndex: 0 }, // the governance action id
    { voteKind: "Yes" },
  )
  .selectUtxosFrom(await wallet.getUtxos())
  .changeAddress(await wallet.getChangeAddress())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
</Tabs>

cardano-cli: build a vote file with `governance vote create` (`--yes/--no/--abstain`, the action id, and your DRep / CC-hot / SPO-cold key), then submit it with `--vote-file`, see [Submitting votes](/docs/developers/curriculum/staking-governance/cardano-cli/submit-votes).

## Submit a proposal

Anyone can submit any of the seven action types on-chain with a deposit (`govActionDeposit`, refunded to your reward account after the vote).

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Anchor, GovernanceAction, RewardAccount } from "@evolution-sdk/evolution"

declare const governanceAction: GovernanceAction.GovernanceAction
declare const rewardAccount: RewardAccount.RewardAccount
declare const anchor: Anchor.Anchor

const tx = await client
  .newTx()
  .propose({ governanceAction, rewardAccount, anchor })
  .build()

const signed = await tx.sign()
await signed.submit()
```

Chain multiple `.propose(...)` calls to submit several actions in one transaction. The deposit is deducted automatically during balancing.

</TabItem>
</Tabs>

Authoring each action type (treasury withdrawal, parameter update with the guardrails script, constitution update, committee changes, no-confidence, hard fork, info) is detailed for cardano-cli in [Submitting governance actions](/docs/developers/curriculum/staking-governance/cardano-cli/create-governance-actions).

## Committee operations

Constitutional Committee members use a **cold/hot credential model**: the cold credential identifies the seat and stays offline; an authorized hot credential does the day-to-day voting. If the hot key is compromised, authorize a new one (it overrides the old); if the cold key is compromised, the only recourse is to resign.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Anchor, Credential } from "@evolution-sdk/evolution"

declare const coldCredential: Credential.Credential
declare const hotCredential: Credential.Credential
declare const anchor: Anchor.Anchor

// Authorize a hot credential
const authTx = await client.newTx().authCommitteeHot({ coldCredential, hotCredential }).build()

// Resign the seat
const resignTx = await client.newTx().resignCommitteeCold({ coldCredential, anchor }).build()
```

</TabItem>
</Tabs>

For the cardano-cli key ceremonies (key-based and multisig cold/hot keys, the authorization certificate), see [Constitutional committee](/docs/developers/curriculum/staking-governance/cardano-cli/constitutional-committee).

## Query governance state

To show proposals, DRep info, voting power, or committee state in a UI, query the chain. With cardano-cli, `query gov-state`, `query proposals`, `query drep-state`, `query drep-stake-distribution`, and `query committee-state` cover it, see [Governance queries](/docs/developers/curriculum/staking-governance/cardano-cli/gov-queries). API providers (Blockfrost, Koios, Maestro) expose the same data over HTTP; see the [API providers](/docs/developers/curriculum/production/api-providers/overview) reference.

## Browser wallet APIs (CIP-95)

For a browser dApp, [CIP-95](https://cips.cardano.org/cip/CIP-0095) extends the [wallet connector](/docs/developers/curriculum/dapps/connect-a-wallet) with governance methods, so you can read what you need to build governance transactions:

```typescript
const dRepKey = await wallet.getPubDRepKey()                 // the user's DRep ID key
const stakeKeys = await wallet.getRegisteredPubStakeKeys()    // registered stake keys
```

See [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet) for the CIP-95 methods on the wallet API.

## Governance in your validators

Plutus V3 added governance **script purposes**: a validator can run as a `Voting` or `Proposing` script, letting a contract participate in governance under script control. See the `ScriptPurpose` list in [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context#the-scriptpurpose). All the SDK governance operations above also support script-controlled credentials: pass a `redeemer` and `attachScript({ script })`, exactly as for [script-controlled stake](/docs/developers/curriculum/staking-governance/staking#script-controlled-stake-and-the-coordinator-pattern).

## Next steps

- [Staking](/docs/developers/curriculum/staking-governance/staking), the other delegation stake credentials carry
- [Governance via cardano-cli](/docs/developers/curriculum/staking-governance/cardano-cli/register-drep), the deep CLI ceremonies for DReps, votes, actions, and committee keys
- [cardano.org/governance](https://cardano.org/governance), the participant hub: delegate your vote, become a DRep, and read the constitution
