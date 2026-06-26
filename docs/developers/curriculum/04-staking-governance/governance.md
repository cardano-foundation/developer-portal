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
| Motion of no-confidence | - | Yes | Yes |
| Update committee / threshold | - | Yes | Yes |
| New constitution or guardrails script | Yes | Yes | - |
| Hard-fork initiation | Yes | Yes | Yes |
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
| Info action (non-binding) | 2/3 | 1 | 1 |

Changing a **security-relevant** protocol parameter (block and transaction sizes, fees, `utxoCostPerByte`, `govActionDeposit`, and similar) needs an extra SPO vote at 0.51, even for groups SPOs do not normally vote on.

A proposed action then runs a fixed lifecycle, which is what your tooling reads when it shows an action's status:

1. **Live for `govActionLifetime` epochs** (6 on mainnet); bodies vote during this window.
2. **Ratified** once it meets the thresholds for its type, and added to the enactment set at the epoch boundary.
3. **Enacted** at the next epoch boundary, when the change takes effect.
4. **Expired** if it never reaches its thresholds within its lifetime.

Most action types also carry a pointer to the last enacted action of the same kind, so an action ratifies against the state it was proposed against (treasury withdrawals and info actions are exempt). The deposit is returned to the proposer's reward account once the action leaves the live state.

## Before you start

The SDK snippets assume the same provider and wallet setup as [staking](/docs/developers/curriculum/staking-governance/staking#before-you-start): an Evolution `client`, or a Mesh `provider` and `wallet` with a fresh `MeshTxBuilder` per transaction. Each operation below also has a **cardano-cli** tab with the key-based flow, and the deeper cli ceremonies (script and Plutus DReps, authoring each action type, committee key management) continue inline beneath the relevant sections.

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
import { hashDrepAnchor } from "@meshsdk/core"

const dRep = await wallet.getDRep()

// Optional CIP-119 metadata describing the DRep, hashed and anchored on-chain
const anchorUrl = "https://example.com/drep.jsonld"
const anchorMetadata = { /* CIP-119 metadata object */ }
const anchorDataHash = hashDrepAnchor(anchorMetadata)   // hashes the metadata, not the URL

txBuilder
  .drepRegistrationCertificate(dRep.dRepIDCip105, { anchorUrl, anchorDataHash })
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

Update metadata with `drepUpdateCertificate(dRepId, { anchorUrl, anchorDataHash })` and step down with `drepDeregistrationCertificate(dRepId)` (the deposit is refunded). See the [Mesh governance guide](https://meshjs.dev/apis/txbuilder/governance).

</TabItem>
<TabItem value="cli" label="cardano-cli">

Generate the DRep key pair:

```bash
cardano-cli latest governance drep key-gen \
  --verification-key-file drep.vkey \
  --signing-key-file drep.skey
```

Build the registration certificate with the deposit (query `dRepDeposit` from the protocol parameters; 500000000 lovelace here) and an optional metadata anchor:

```bash
cardano-cli latest governance drep registration-certificate \
  --drep-verification-key-file drep.vkey \
  --key-reg-deposit-amt 500000000 \
  --drep-metadata-url https://example.com/drep.jsonld \
  --drep-metadata-hash a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de \
  --out-file drep-reg.cert
```

Build the transaction (`--witness-override 2` covers the payment and DRep signatures), sign with both keys, and submit:

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file drep-reg.cert \
  --witness-override 2 \
  --out-file tx.raw

cardano-cli latest transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file drep.skey \
  --out-file tx.signed

cardano-cli latest transaction submit --tx-file tx.signed
```

</TabItem>
</Tabs>

### Script-based and Plutus DReps

A DRep credential can also be a script hash instead of a key hash. The flow mirrors the key-based path, but the DRep ID is the hash of the script and the transaction carries a witness (multisig) or a redeemer (Plutus) instead of a plain DRep key signature.

For a **simple-script (multisig) DRep**, write a native script (for example `type: atLeast` over the members' DRep key hashes), hash it for the DRep ID, and register against that script hash:

<Tabs groupId="sdk">
<TabItem value="cli" label="cardano-cli" default>

```bash
cardano-cli hash script --script-file drep-multisig.json --out-file drep-multisig.id

cardano-cli latest governance drep registration-certificate \
  --drep-script-hash "$(< drep-multisig.id)" \
  --key-reg-deposit-amt 500000000 \
  --out-file drep-multisig-reg.cert
```

Build with `--certificate-script-file drep-multisig.json`, then collect one `transaction witness` per member and combine them with `transaction assemble`. A **Plutus-script DRep** registers the same way (`--drep-script-hash` from `cardano-cli hash script` on the `.plutus` file), but the transaction supplies collateral and a redeemer rather than script witnesses:

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --tx-in-collateral $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --certificate-file drep.cert \
  --certificate-script-file drep.plutus \
  --certificate-redeemer-value {} \
  --change-address $(< payment.addr) \
  --out-file tx.raw
```

Only the payment key signs; script validity comes from the redeemer, not a DRep key signature.

</TabItem>
</Tabs>

## Delegate your vote

Voting power delegation is **separate from and independent of stake delegation**. You can delegate stake to one pool and your vote to a different DRep, and change either without affecting the other. There are also two built-in options for holders who don't want to pick a DRep: **Abstain** (not counted) and **No Confidence** (counts against the committee). In the Conway era, every holder must choose a governance delegation to remain eligible for staking rewards.

Both delegations attach to your **stake credential**, the part of your address separate from the payment credential. See [Addresses](/docs/developers/curriculum/fundamentals/core-concepts/addresses) for how the two combine.

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
const dRepId = "drep1..."   // a registered DRep (or use { type: "AlwaysAbstain" } / { type: "AlwaysNoConfidence" })
const rewardAddress = (await wallet.getRewardAddresses())[0]

txBuilder
  .voteDelegationCertificate({ dRepId }, rewardAddress)
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
<TabItem value="cli" label="cardano-cli">

Create the vote-delegation certificate from your stake key. Target a registered DRep with `--drep-key-hash` (or `--drep-script-hash`), or pick `--always-abstain` / `--always-no-confidence`:

```bash
cardano-cli latest stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --drep-key-hash $(< drep.id) \
  --out-file vote-deleg.cert
```

Build, sign with the payment and stake keys, and submit:

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file vote-deleg.cert \
  --witness-override 2 \
  --out-file tx.raw

cardano-cli latest transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --out-file tx.signed

cardano-cli latest transaction submit --tx-file tx.signed
```

</TabItem>
</Tabs>

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
<TabItem value="cli" label="cardano-cli">

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
<TabItem value="cli" label="cardano-cli">

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

## Committee operations

Constitutional Committee members use a **cold/hot credential model**: the cold credential identifies the seat and stays offline; an authorized hot credential does the day-to-day voting. If the hot key is compromised, authorize a new one (it overrides the old); if the cold key is compromised, the only recourse is to resign.

Mesh's transaction builder exposes no committee-certificate helpers, so use Evolution or cardano-cli for these.

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
<TabItem value="cli" label="cardano-cli">

A member holds a **cold** credential (offline, the on-chain identity) and a **hot** credential (signs votes); an authorization certificate links them, and a new one overrides the previous.

```bash
# cold key pair + its hash (what an update-committee action references)
cardano-cli latest governance committee key-gen-cold \
  --cold-verification-key-file cc-cold.vkey \
  --cold-signing-key-file cc-cold.skey
cardano-cli latest governance committee key-hash \
  --verification-key-file cc-cold.vkey > cc-key.hash

# hot key pair
cardano-cli latest governance committee key-gen-hot \
  --verification-key-file cc-hot.vkey \
  --signing-key-file cc-hot.skey

# authorize the hot credential
cardano-cli latest governance committee create-hot-key-authorization-certificate \
  --cold-verification-key-file cc-cold.vkey \
  --hot-verification-key-file cc-hot.vkey \
  --out-file cc-authorization.cert
```

Submit the certificate in a transaction signed by the payment and cold keys. To step down, submit a resignation certificate the same way:

```bash
cardano-cli latest governance committee create-cold-key-resignation-certificate \
  --cold-verification-key-file cc-cold.vkey \
  --out-file cc-resign.cert
```

Script-based members use `--cold-script-hash` / `--hot-script-hash` instead of the key files.

</TabItem>
</Tabs>

## Query governance state

To show proposals, DRep info, voting power, or committee state in a UI, query your node:

```bash
cardano-cli latest query gov-state                           # committee, constitution, params, proposals
cardano-cli latest query drep-state --all-dreps              # DRep registration: deposit, expiry, anchor
cardano-cli latest query drep-stake-distribution --all-dreps # voting power per DRep
cardano-cli latest query committee-state                     # members, hot-key auth, expiry, threshold
cardano-cli latest query proposals --all-proposals           # actions eligible for ratification
```

`query constitution` returns the current constitution anchor and guardrails script hash, and `query gov-state | jq -r .nextRatifyState.nextEnactState.prevGovActionIds` gives the last-enacted action IDs you need for the `--prev-governance-action-*` flags. API providers (Blockfrost, Koios, Maestro) expose the same data over HTTP; see the [API providers](/docs/developers/curriculum/production/api-providers/overview) reference.

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
- [cardano.org/governance](https://cardano.org/governance), the participant hub: delegate your vote, become a DRep, and read the constitution
