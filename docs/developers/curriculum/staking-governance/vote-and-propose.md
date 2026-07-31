---
id: vote-and-propose
title: Vote & Propose
sidebar_label: Vote & propose
description: "Cast Yes / No / Abstain votes on governance actions and submit proposals of each of the seven action types, with Evolution, Mesh, and cardano-cli."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

With a [registered DRep](/docs/developers/curriculum/staking-governance/drep-and-delegation) (or a committee hot credential or a pool key), what remains is using it: casting votes on live actions, and submitting actions of your own. The [seven action types and their thresholds](/docs/developers/curriculum/staking-governance/governance#the-seven-governance-action-types) are on the concept page; this page is the code.

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
    // optional rationale: { anchorUrl, anchorDataHash }
  )
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Create the vote file, choosing `--yes`, `--no`, or `--abstain` and the governance action id (tx id + index). Sign as a DRep (`--drep-verification-key-file`), a CC member (`--cc-hot-verification-key-file`), or an SPO (`--cold-verification-key-file`):

```bash
cardano-cli latest governance vote create \
  --yes \
  --governance-action-tx-id "df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79" \
  --governance-action-index 0 \
  --drep-verification-key-file drep.vkey \
  --out-file action.vote
```

Include the vote in a transaction with `--vote-file`, sign with the matching credential plus the payment key, and submit:

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --vote-file action.vote \
  --witness-override 2 \
  --out-file vote-tx.raw

cardano-cli latest transaction sign \
  --tx-body-file vote-tx.raw \
  --signing-key-file drep.skey \
  --signing-key-file payment.skey \
  --out-file vote-tx.signed

cardano-cli latest transaction submit --tx-file vote-tx.signed
```

</TabItem>
</Tabs>

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
<TabItem value="mesh" label="Mesh">

```typescript
const rewardAddress = (await wallet.getRewardAddresses())[0]

txBuilder
  .proposal(
    { kind: "InfoAction", action: {} },                       // the governance action
    { anchorUrl: "https://example.com/proposal.jsonld",        // CIP-108 metadata
      anchorDataHash: "a1b1c2d3e4f5..." },
    rewardAddress,                                             // deposit-return reward account
  )
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

`governanceAction` is a discriminated union: swap `InfoAction` for `TreasuryWithdrawalsAction`, `ParameterChangeAction`, `NoConfidenceAction`, `UpdateCommitteeAction`, `NewConstitutionAction`, or `HardForkInitiationAction` (the chaining types take a `govActionId` of the last enacted action of that kind). The deposit defaults to `govActionDeposit`; pass a fourth argument to override. For a Plutus-script proposal, add `proposalScript(cbor, "V3")` and `proposalRedeemerValue(redeemer)`.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Authoring an action produces a proposal: a deposit, a deposit-return stake credential, an [anchor](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0108) (URL + hash), and the action itself. Hash the anchor, create the action (treasury withdrawal shown), then build, sign, and submit:

```bash
cardano-cli hash anchor-data --file-text treasury-withdrawal.jsonld

cardano-cli latest governance action create-treasury-withdrawal \
  --testnet \
  --governance-action-deposit $(cardano-cli latest query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://example.com/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --funds-receiving-stake-verification-key-file stake.vkey \
  --constitution-script-hash fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64 \
  --transfer 50000000000 \
  --out-file treasury.action

cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --proposal-file treasury.action \
  --out-file tx.raw
# then transaction sign + submit as in the sections above
```

Treasury-withdrawal and protocol-parameter actions also reference the guardrails script: add `--proposal-script-file guardrails-script.plutus`, `--tx-in-collateral`, and `--proposal-redeemer-value {}` to the build.

</TabItem>
</Tabs>

### Authoring each action type

Every action takes `--governance-action-deposit`, `--deposit-return-stake-verification-key-file`, `--anchor-url`, `--anchor-data-hash`, and `--out-file`. Types that share state (committee, constitution, hard fork, protocol parameters) also need `--prev-governance-action-tx-id` and `--prev-governance-action-index` once a prior action of that type was enacted; treasury withdrawals and info actions never do.

- **Treasury withdrawal** (`create-treasury-withdrawal`): adds `--funds-receiving-stake-verification-key-file`, `--transfer <lovelace>`, and `--constitution-script-hash`.
- **Protocol-parameter update** (`create-protocol-parameters-update`): the parameter flags being changed, plus `--constitution-script-hash`.
- **Constitution / guardrails** (`create-constitution`): `--constitution-url`, `--constitution-hash`, and `--constitution-script-hash`.
- **Update committee** (`governance action update-committee`): `--add-cc-cold-verification-key-hash <hash>` paired with `--epoch <expiry>`, `--remove-cc-cold-verification-key-hash <hash>`, and `--threshold <fraction>`.
- **No confidence** (`create-no-confidence`): the common flags plus the previous committee-action reference.
- **Hard fork** (`create-hard-fork`): initiates a protocol upgrade.
- **Info** (`create-info`): common flags only, with no on-chain effect.

## Next steps

- [Governance operations](/docs/developers/curriculum/staking-governance/governance-operations): committee credential management, governance-state queries, and the CIP-95 wallet API
