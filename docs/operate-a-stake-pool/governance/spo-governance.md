---
id: spo-governance
title: SPO Governance
sidebar_label: SPO Governance (CIP-1694)
description: How stake pool operators participate in Cardano's on-chain governance under CIP-1694.
keywords: [governance, SPO, stake pool, CIP-1694, hard fork, voting, Conway]
---

Cardano's Conway era introduced decentralized on-chain governance via [CIP-1694](https://cips.cardano.org/cip/CIP-1694). Three governance bodies share decision-making power: the **Constitutional Committee (CC)**, **Delegated Representatives (DReps)**, and **Stake Pool Operators (SPOs)**. Each body votes on a different subset of governance actions.

## What SPOs vote on

SPOs vote with their **cold verification key** and require **>51% of active stake** to ratify an action (unless noted).

| Governance action | SPO threshold | Notes |
|---|---|---|
| Motion of no-confidence | 51% | Removes the current CC |
| Update committee / threshold | 51% | Adds, removes, or reweights CC members |
| Hard-fork initiation | 51% | Triggers a protocol upgrade |
| Info | 100% | Advisory only — no on-chain effect |

SPOs **do not** vote on protocol parameter changes, treasury withdrawals, or constitutional amendments — those require DRep and CC approval.

Find out more about the different roles at this dedicated [Governance Actions insight page](https://cardano.org/insights/governance-actions/).

Hard-fork initiation is the most common action requiring SPO votes. When the community is ready to upgrade the network, a hard fork proposal is submitted on-chain and SPOs must cast an explicit yes vote with their cold key to signal readiness. Running the upgraded node software is also required, but does not substitute for the on-chain vote.

## Step 1 — Find active proposals

Query your node for all proposals currently eligible for ratification:

```shell
cardano-cli conway query proposals --all-proposals
```

To filter for only hard-fork proposals:

```shell
cardano-cli conway query proposals --all-proposals \
  | jq '[.[] | select(.proposalProcedure.govAction.tag == "HardForkInitiation")]'
```

For a full governance state dump (includes vote tallies):

```shell
cardano-cli conway query gov-state
```

You can also browse active proposals on [Cardano GovTool](https://gov.tools), [CardanoScan](https://cardanoscan.io/govActions), [Adastat](https://adastat.net/governances) or [CGOV](https://app.cgov.io/).

## Step 2 — Review the proposal

Every governance action must include an **anchor** — a URL pointing to a document describing the rationale, and a hash of that document. Verify the content before voting:

```shell
# Get the anchor URL and hash from the proposal
cardano-cli conway query proposals --all-proposals \
  | jq '.[] | {id: .actionId, url: .proposalProcedure.anchor.url, hash: .proposalProcedure.anchor.dataHash}'

# Download the document and verify its hash
wget <url> -O proposal.jsonld
b2sum -l 256 proposal.jsonld
# Hash must match the dataHash in the proposal
```

## Cold key security

:::danger Your cold key must never touch an internet-connected machine
Your pool's cold signing key (`cold.skey`) is the most sensitive credential you hold. If it is ever on a live system — even briefly — your pool is at risk. There are no exceptions.
:::

Keys must be:

- **Kept off live systems at all times.** Build transactions online, sign them offline, submit the signed result.
- **Encrypted at rest.** Store your cold key on an encrypted data volume (LUKS on Linux, or an encrypted container). A plaintext key on even an offline drive is a single point of failure.
- **Backed up in at least two independent encrypted locations.**

### Recommended: cardano-airgap

[cardano-airgap](/docs/learn/educational-resources/air-gap) is a Nix-built bootable ISO maintained by IntersectMBO. It ships pre-loaded with all Cardano tooling and has **never made a network request** — not during build, not during setup, not ever. It is already the tool of choice for many SPOs and Constitutional Committee members.

Alternatives: the [Frankenwallet](/docs/learn/educational-resources/air-gap) (encrypted bootable USB) or a [manually configured air-gapped machine](/docs/learn/educational-resources/air-gap).

### Signing workflow

1. **Online** — build the unsigned transaction (`vote-tx.raw`)
2. Transfer `vote-tx.raw` to the air-gapped machine via USB
3. **Air-gapped** — sign the transaction (see below)
4. Transfer only `vote-tx.signed` back to the online machine
5. **Online** — submit

## Step 3 — Cast your vote

You will need:
- Your pool's cold verification key (`cold.vkey`) to create the vote
- Your pool's cold signing key (`cold.skey`) to sign the transaction (on the air-gapped machine)
- A funded payment key to cover the transaction fee (~0.2 ADA)

**Create the vote file** (can be done online, uses only the public `cold.vkey`):

```shell
cardano-cli conway governance vote create \
  --yes \
  --governance-action-tx-id "<TX_ID>" \
  --governance-action-index 0 \
  --cold-verification-key-file cold.vkey \
  --out-file spo.vote
```

Replace `--yes` with `--no` or `--abstain` as appropriate.

**Build the unsigned transaction** (online):

```shell
cardano-cli conway transaction build \
  --tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
  --change-address "$(< payment.addr)" \
  --vote-file spo.vote \
  --witness-override 2 \
  --out-file vote-tx.raw
```

**Sign on the air-gapped machine** (cold key never leaves the air gap):

```shell
cardano-cli conway transaction sign \
  --tx-body-file vote-tx.raw \
  --signing-key-file cold.skey \
  --signing-key-file payment.skey \
  --out-file vote-tx.signed
```

**Submit** (back online):

```shell
cardano-cli conway transaction submit --tx-file vote-tx.signed
```

## Step 4 — Verify your vote

After submission, confirm your vote was recorded by querying the proposal:

```shell
cardano-cli conway query proposals \
  --governance-action-tx-id "<TX_ID>" \
  --governance-action-index 0 \
  | jq '.[0].stakePoolVotes'
```

Your pool ID should appear in the `stakePoolVotes` object with your chosen vote.

## Opting out — delegating to alwaysAbstain

By default, an SPO who does not vote on a proposal has their stake counted against ratification. Because the ratification threshold requires more than 51% of active stake to vote **yes**, non-participating SPOs drag the effective participation rate down — the same practical effect as voting no.

If you do not intend to follow governance closely, you can change this behaviour by delegating your reward account to the `alwaysAbstain` DRep. This removes your stake from both the numerator and denominator of the ratification calculation, turning your non-participation into a genuine abstain rather than an implicit no.

:::warning Hard-fork votes still require an explicit on-chain vote
Hard-fork initiation requires SPOs to cast an explicit yes vote with their cold key — the `alwaysAbstain` delegation does not cover it. If you delegate to `alwaysAbstain` and do not vote on a hard-fork proposal, your stake counts as a no vote on that action.
:::

This delegation must be made with the **reward account stake key** — the key registered as `--pool-reward-account-verification-key-file` in your pool registration certificate. Delegating owner stake keys changes the DRep delegation for the stake associated with your pledge, but has no effect on the pool's governance default behaviour.

Create the DRep delegation certificate using the reward account stake key (uses only the public key, so this can be done online):

```bash
cardano-cli conway stake-address vote-delegation-certificate \
    --stake-verification-key-file reward-stake.vkey \
    --drep-always-abstain \
    --out-file drep-abstain.cert
```

Build and submit a transaction including the certificate:

```bash
# Online — build
cardano-cli conway transaction build \
    --tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
    --change-address "$(< payment.addr)" \
    --certificate-file drep-abstain.cert \
    --witness-override 2 \
    --out-file drep-tx.raw

# Air-gapped — sign with the reward account stake key and payment key
cardano-cli conway transaction sign \
    --tx-body-file drep-tx.raw \
    --signing-key-file reward-stake.skey \
    --signing-key-file payment.skey \
    --out-file drep-tx.signed

# Online — submit
cardano-cli conway transaction submit --tx-file drep-tx.signed
```

To reverse the decision, submit a new delegation certificate to a specific DRep or remove the delegation entirely.

## Proving your identity to governance tools

Many governance platforms, voting interfaces, and SPO-aware services need to verify that you are the operator of a given pool before letting you take action. Rather than asking you to sign with your cold key, they use **Calidus keys** — on-chain registered hot keys that act on behalf of your pool.

Register a Calidus key once (using a cold-key signature from your air-gapped machine), then use it freely as a hot key for governance tools, explorer profiles, and dApp interactions — without the cold key ever leaving the air gap.

See [Calidus Keys](../../operator-tools/calidus-keys) for setup instructions.

## Key points

- **One vote per proposal per pool.** Submitting a second vote overwrites the first.
- **Votes expire with the proposal.** Proposals expire after a set number of epochs if the ratification threshold is not met.
- **No vote = implicit no.** Non-participating stake is excluded from the yes count but included in the total, which drags the ratification rate down. Delegate to `alwaysAbstain` to opt out genuinely.
- **Cold key security.** Your cold key is your pool's most sensitive credential. Never expose it on an internet-connected machine.

## Further reading

- [Submitting votes (cardano-cli full reference)](../../../learn/cardano-cli/governance/submit-votes)
- [Governance queries](../../../learn/cardano-cli/governance/gov-queries)
- [CIP-1694 specification](https://cips.cardano.org/cip/CIP-1694)
- [Cardano GovTool](https://gov.tools)
