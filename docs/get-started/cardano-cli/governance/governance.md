---
id: cardano-governance
title: Cardano governance
sidebar_label: CLI - Governance 
sidebar_position: 5
description: Overview ov cardano governance across ledger eras. 
keywords: [governance, update proposals, cardano, cardano-node]
---

## Update proposals

Currently (Babbage era), and until the Conway era ushers in participatory governance, Cardano operates under a **federated governance** mechanism. This framework enables the updating of protocol parameters, including the addition of new features, through an update proposal process. Only the holders of the genesis delegate keys have the authority to submit and vote on proposals.

## Cardano ledger eras

Cardano has undergone various ledger era upgrades – Byron, Shelley, Allegra, Mary, Alonzo, and the current Babbage era. Each era has introduced new functionalities to the network. The upcoming era, Conway, is planned to introduce decentralized governance, implementing [CIP-1694](https://cips.cardano.org/cip/CIP-1694) functionality.

| Era     | Key features | Consensus | Protocol versions (major/minor) | Hard fork event   | Date |
| ------- | -------------| ----------| :-----------------------------: | ----------------- | --- |
| Byron   | Proof of stake | Ouroboros Classic<br/>PBFT | 0.0<br/>1.0  | Genesis Byron reboot |  | 
| Shelley | Decentralized block production | TPraos |  2.0 | Shelley HF | | 
| Allegra | Token locking | TPraos| 3.0 | Allegra HF |  |
| Mary    | Native tokens | TPraos| 4.0 | Mary HF    |  |
| Alonzo  | Plutus smart contracts| TPraos| 5.0<br/>6.0 | Alonzo HF<br/>Alonzo intra-era |  | 
| Babbage | PlutusV2<br/>Reference inputs<br/>Inline datums<br/>Reference scripts<br/>Removal of the "d" parameter | Praos | 7.0<br/>8.0 | Vasil<br/>Valentine intra-era (SECP) |  |
| Conway  | Decentralized governance | Praos | 9.0<br/>10.0 | Chang HF Bootstrap<br/>Full governance |  |

Transitioning from one era to the next is triggered by an **update proposal** that updates the protocol version.

### Byron era update proposals

![Byron update proposals](/img/cli/upbyron.png)

The general mechanism for updating protocol parameters in Byron is as follows:

1. **Update proposal is registered.** An update proposal starts with a transaction that proposes new values for some protocol parameters or a new protocol version. This kind of transaction can only be initiated by a genesis key via its delegate.
2. **Accumulating votes.** Genesis key delegates **vote** for or against the proposal. The proposal must accumulate a sufficient number of votes before it can be confirmed. The threshold is determined by the **minThd** field of the [softfork Rule protocol parameter](https://github.com/input-output-hk/cardano-ledger/blob/2a0abd500b9e01efe6dc47146fa8b805ef9ef307/eras/byron/ledger/impl/src/Cardano/Chain/Update/SoftforkRule.hs#L24).
3. **Confirmed (enough votes).** The system records the 'SlotNo' of the slot in which the required threshold of votes was met. At this point, 2k slots (two times the security parameter k) need to pass before the update is stably confirmed and can be _endorsed_. Endorsements for proposals that are not yet stably confirmed are not invalid but rather silently ignored.
4. **Stably-confirmed.** The last required vote is 2k slots deep. Ready to accumulate endorsements. A block whose header's protocol version number is that of the proposal is interpreted as an **endorsement**. In other words, the nodes are ready for the upgrade. Once the number of endorsers satisfies a threshold (same as for voting), the confirmed proposal becomes a **candidate proposal**.
5. **Candidate.** Enough nodes have endorsed the proposal. At this point, further 2k slots need to pass before the update becomes a stable candidate and can be adopted.
6. **Stable candidate.** The last required endorsement is 2k slots deep.

If there is no stable candidate proposal, then no changes occur. Everything is retained, including a candidate proposal whose threshold-satisfying endorsement was not yet stable and will be adopted in the subsequent epoch unless it gets surpassed in the meantime.

A 'null' update proposal is one that neither increases the protocol version nor the software version. Such update proposals are considered invalid according to the Byron specification.

### Update proposals in Shelley and subsequent eras

The update mechanism in Shelley is simpler than in Byron. There is no distinction between votes and proposals. To 'vote' for a proposal, a genesis delegate submits the exact same proposal via a regular transaction signed by the delegate key. Additionally, there is no separate endorsement step:

![Shelley update proposals](/img/cli/upshelley.png)

The procedure is as follows:

1. **Register the proposal.** During each epoch, a genesis key can submit (via its delegates) zero, one, or many proposals; each submission overrides the previous one. Proposals can be explicitly marked for future epochs; in that case, they are simply not considered until that epoch is reached.
2. **Voting.** There is no explicit voting, to vote for a proposal, other delegate key holders must submit the exact same proposal to the chain. The window for submitting proposals ends 6k/f slots before the end of the epoch, where *k* is the security parameter and *f* is the _active slot coefficient_.
3. **Quorum.** At the end of the epoch, if the majority of nodes, determined by the **Quorum** specification constant (which must exceed half the total number of nodes), have most recently submitted the identical proposal, it becomes adopted.
4. **Update.** The update is applied at the epoch boundary.

Changing the values of the protocol parameters and global constants can be done via an update proposal.

Changing the values of the global constants always requires a software update, including an increase in the protocol version. An increase in the major version indicates a hard fork, while the minor version indicates a soft fork (meaning old software can validate but not produce new blocks).

On the other hand, updating protocol parameters can be done without a software update.

Until the Conway era is released, only **genesis delegate key** holders can submit and vote on proposals. From time to time, you will find it useful to deploy a local or private testnet. In that case, you will need to use the governance commands to upgrade your network to the desired era.

Example of a protocol parameter update proposal updating `nOpt` (the desired number of pools):

:::note
Only **genesis delegate key** holders can create this type of update proposals. 
This applies to mainnet and testnets running in any pre-Conway era.  
If you are running a private testnet, you can use this feature to update your testnet parameters.
:::

```shell
cardano-cli babbage governance action create-protocol-parameters-update \
  --genesis-verification-key-file genesis-keys/non.extended.shelley.delegate.vkey \
  --number-of-pools 1000 \
  --out-file updateNOpt.proposal
```

Build, sign, and submit the transaction: 

```shell
balance=$(cardano-cli query utxo --address $(< payment.addr) --out-file /dev/stdout | jq '. | .[keys[0]].value.lovelace')
fee=1000000
change=$(($balance - $fee))

cardano-cli babbage transaction build-raw \
  --fee $fee \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --out-file /dev/stdout | jq -r 'keys[0]' \
  --tx-out $(< payment.addr)+$change \
  --update-proposal-file updateNOpt.proposal \
  --out-file updateNOpt.tx.raw

cardano-cli conway transaction sign \
  --tx-body-file updateNOpt.tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file genesis-keys/non.extended.shelley.delegate.skey \ 
  --out-file updateNOpt.tx.signed

cardano-cli conway transaction submit --tx-file updateNOpt.tx.signed
```

## Conway era update proposals

The Conway ledger era introduces a new governance framework to Cardano, marking a significant evolution in how decisions about the protocol are made. Building on the foundations laid in previous eras, Conway empowers Cardano with a decentralized governance model where decision-making is accessible to stakeholders. Key features include the introduction of *Delegated Representatives (DReps)*, the *Constitutional Committee*, and an decision making role for *Stake Pool Operators* (SPOs). These entities collaborate through a formalized voting system to vote on governance actions that can be proposed by any ada holder. These governance bodies are in charge of treasury funds, adding or removing members from the constitutional committee, making updates to the Cardano Constitution and changes to protocol parameters. Conway era makes Cardano more resilient and 100% community-driven.

The process for submitting and voting protocol update proposals undergoes significant changes in the Conway era. First, Genesis delegations and MIR certificates are eliminated. In `DState`, the fields associated with these features are no longer included, and `DelegEnv` no longer contains the fields it had in the Shelley era, effectively rendering the genesis keys obsolete. 

### Governance actions

In the Conway ledger era, any ada holder can submit a Governance action, which is the on-chain method to put a proposal to the consideration of the three governance bodies. There are 7 types of governance actions:

| Governance Action | Description |
| ----------------- | ----------- |
| NoConfidence      | A motion to create a state of no-confidence in the current constitutional committee |
| UpdateCommittee   | Changes to the members of the constitutional committee and/or to its signature threshold and/or terms |
| NewConstitution   | A modification to the off-chain Constitution and/or the proposal policy script |
| TriggerHF         | Triggers a non-backwards compatible upgrade of the network; requires a prior software upgrade |
| ChangePParams     | A change to one or more updatable protocol parameters, excluding changes to major or minor protocol versions ("hard forks") |
| TreasuryWdrl      | Movements from the treasury |
| Info              | An action that has no effect on-chain, other than an on-chain record |

### Ratification thresholds

Each type of governance action requires meeting a different mix of voting thresholds to be ratified. The table below depicts the thresholds as set on the [Conway genesis file](https://book.world.dev.cardano.org/environments/mainnet/conway-genesis.json):

| Governance action type                                               | CC   | DReps    | SPOs     |
|:---------------------------------------------------------------------|:-----|:---------|:---------|
| 1. Motion of no-confidence                                           | \-   | 0.67     | 0.51     |
| 2<sub>a</sub>. Update committee/threshold (_normal state_)           | \-   | 0.67     | 0.51     |
| 2<sub>b</sub>. Update committee/threshold (_state of no-confidence_) | \-   | 0.60     | 0.51     |
| 3. New Constitution or Guardrails Script                             | 2/3  | 0.75     | \-       |
| 4. Hard-fork initiation                                              | 2/3  | 0.60     | 0.51     |
| 5<sub>a</sub>. Protocol parameter changes, network group             | 2/3  | 0.67     | \-       |
| 5<sub>b</sub>. Protocol parameter changes, economic group            | 2/3  | 0.67     | \-       |
| 5<sub>c</sub>. Protocol parameter changes, technical group           | 2/3  | 0.67     | \-       |
| 5<sub>d</sub>. Protocol parameter changes, governance group          | 2/3  | 0.75     | \-       |
| 6. Treasury withdrawal                                               | 2/3  | 0.67     | \-       |
| 7. Info                                                              | 2/3  | 1        | 1        |

Some parameters (from different groups) are relevant to security properties of the system. Any proposal attempting to change such a parameter requires an additional
vote of the SPOs, with the threshold 0.51

* `maxBlockBodySize`
* `maxTxSize`
* `maxBlockHeaderSize`
* `maxValueSize`
* `maxBlockExecutionUnits`
* `txFeePerByte`
* `txFeeFixed`
* `utxoCostPerByte`
* `govActionDeposit`
* `minFeeRefScriptCostPerByte`

### Hash Protection

`NoConfidence`, `UpdateCommittee`, `NewConstitution`, `TriggerHF`, and `ChangePParams` actions all require a reference to the last enacted governance action that modified the same state in order to be enacted. Among these, `NoConfidence` and `UpdateCommittee` modify the same state, while the others—`NewConstitution`, `TriggerHF`, and `ChangePParams`—each modify their own independent states. In contrast, `TreasuryWdrl` and `Info` do not require such a reference, as they do not affect the state in conflicting or non-commutative ways. This ensures that the final state after enactment matches the intended state at the time the proposal was submitted, and a proposal's eligibility for enactment may change based on other proposals being enacted.

### Votes and Proposals

#### Proposals

To propose a governance action, a `Proposal` needs to be submitted in a transaction. Beside the proposed governance action, it requires:

- potentially a **pointer** to the previous action [See Hash Protection](#hash-protection),
- potentially a **pointer** to the proposal policy (the guardrial script for `ChangePParams` and `TreasuryWdrl`),
- a **deposit**, which will be returned to **returnAddr**, and
- an **anchor**, providing further information about the proposal.


#### Votes
A vote is **Yes**, **No** or **Abstain**,  to be cast, a vote must include additional details such as the voter's role (e.g., CC, DRep, or SPO) and their `credential`, along with the specific governance action ID being voted on. Optionally, an anchor may be provided to give context or explain the reasoning behind the vote.


### Governance Action lifecycle

1. A proposed governance action has a lifespan of 6 epochs, as defined by the protocol parameter "govActionLifetime": 6 in the [Conway genesis file](https://book.world.dev.cardano.org/environments/mainnet/conway-genesis.json).
2. During this period, governance bodies can vote on the proposal. If the action reaches the end of its lifespan without being ratified, it automatically expires.

![](/img/cli/conwayup.png)

3. At every epoch boundary within the Governance action lifetime, proposals and votes are snapshotted. The _DRepPulserState_ snapshot includes: 
  - SPOs, DReps, CC members, 
  - their votes (yes, no, abstain), 
  - stake distribution 'Mark' 
  - delegation map. 
4. The system will use the _DRepPulserState_ snapshot to calculate the DReps and SPOs _votingStakeDistribution_. This computation is expensive to run, therefore it is not executed at the epoch boundary, intead, the **DRep Pulser** performs this computation gradually with every `TICK` during the first **4k/f** slots. 
5. The **Hardfork-combinator** requires to "know" about a potential hardfork 6k/f slots before the epoch change. To meet this requiterement, if the _votingStakeDistribution_ is not finished by the time we reach that point, the computation is forced to complete.
6. On the first `TICK` that occures within the **last 6k/f** slots of the epoch (2 stability windows), the system _solidifies_ the next epoch protocol parameters, see [_solidifyNextEpochPParams_](https://github.com/IntersectMBO/cardano-ledger/blob/a00b723cd93658e67d21f40c771fad80c463d9c4/eras/shelley/impl/src/Cardano/Ledger/Shelley/Rules/Tick.hs#L180C1-L195C6). The RATIFY and ENACT rules are executed at this point to deterimne the _enactState_. If a governance action has enough votes (meets the thresholds for its type), it is said to be **Ratified** and it is added to the _enactState_.
7. At the next epoch boundary, the system **applies** the _enactState_.
8. A governance action **Expires** if it does not accumulate enough votes during it's lifetime. Its last chance to be ratified is when the _DRepPulser_ talies the votes on the epoch following its expiration. 







 