---
id: governance-actions
slug: /governance/cardano-governance/governance-actions
title: Governance Actions
sidebar_label: Governance Actions
sidebar_position: 2
description: This page outlines the types, eligibility, voting thresholds, and procedures for governance actions within Cardano's CIP-1694 on-chain governance model.
---

## Governance Action Overview

CIP-1694 introduces a comprehensive [on-chain governance model](overview.md) for Cardano, aimed at decentralizing and democratizing decision-making within the ecosystem. This proposal describes various types of governance actions, the voting thresholds required for their ratification, and the roles of different participants in the process.

## Types of Governance Actions

1. **Motion of No-Confidence**: A motion to create a state of no-confidence in the current constitutional committee.
2. **New Constitutional Committee and/or Threshold and/or Terms**: Changes to the members of the constitutional committee and/or its signature threshold and/or terms.
3. **Update to the Constitution or Proposal Policy**: A modification to the Constitution or proposal policy, recorded as on-chain hashes.
4. **Hard Fork Initiation**: Triggers a non-backwards compatible upgrade of the network; requires a prior software upgrade.
5. **Protocol Parameter Changes**: Any change to one or more updatable protocol parameters, excluding changes to major protocol versions ("hard forks").
6. **Treasury Withdrawals**: Withdrawals from the on-chain Cardano treasury.
7. **Info**: Records information on-chain without causing any direct on-chain effects.

## Eligibility for Voting

The governance model described in CIP-1694 involves three primary roles:

1. **Stake Pool Operators (SPOs)**: Responsible for maintaining the network. They have a say in governance actions, particularly those related to the constitutional committee and hard forks. Read more about them [here](overview.md#spos).
2. **Delegated Representatives (DReps)**: Representatives of Ada holders in the governance system, capable of voting on all governance action types. Read more about them [here](overview.md#dreps).
3. **Constitutional Committee (CC)**: Oversees adherence to the Cardano Constitution and ensures the constitutionality of governance actions. Read more about them [here](overview.md#interim-constitutional-committee.

## Voting Thresholds and Participants

The table below outlines the voting thresholds and which roles participate in each type of governance action:

| Governance Action | SPOs | DReps| CC | Voting Threshold |
|-|-|-|-|-|
| Motion of No-Confidence | ✓ | ✓ | x | Majority of DReps and SPOs   |
| New Constitutional Committee and/or Threshold/Terms  | ✓ | ✓ | x | Majority of DReps and SPOs  |
| Update to the Constitution or Proposal Policy | x | ✓ | ✓ | Majority of DReps and CC  |
| Hard-Fork Initiation | ✓ | ✓ | ✓ | Majority of all three roles |
| Protocol Parameter Changes  | x  | ✓  | ✓ | Majority of DReps and CC |
| Treasury Withdrawals  | x | ✓ | ✓ | Majority of DReps and CC  |
| Info | ✓ | ✓ | ✓ | All roles can vote |

### Detailed Technical Breakdown

1. **Motion of No-Confidence**: This action is used to declare a lack of confidence in the current constitutional committee. If the CC is in a state of no-confidence all other governance actions will be dropped and a new CC has to be proposed and voted in by DReps and SPOs. It requires a majority vote from both DReps and SPOs.

  **Relevant Threshold Protocol Parameters**:
    - DReps: `dvt_motion_no_confidence`
    - SPOs: `pvt_motion_no_confidence`

1. **New Constitutional Committee and/or Threshold and/or Terms**: This action involves adding new members to the constitutional committee, adjusting the approval threshold, or changing the terms of existing members. It requires a majority vote from both DReps and SPOs. The applicable voting threshold depends on the current state of the constitutional committee (**no-confidence** or **normal**).

  **Relevant Threshold Protocol Parameters**:
    - DReps: `dvt_committee_normal`, `dvt_committee_no_confidence`
    - SPOs: `pvt_committee_normal`, `pvt_committee_no_confidence` 

3. **Update to the Constitution or Proposal Policy**: Involves amendments to the Constitution or changes to the proposal policy. Requires a majority vote from DReps and the CC.

  **Relevant Threshold Protocol Parameters**:
    - DReps: `dvt_update_to_constitution`
    - CC: `threshold`

1. **Hard-Fork Initiation**: Initiates a hard fork, changing the major protocol version. Requires unanimous approval from all three roles. A prerequisite for this action is the upgrade of the node version by the SPOs.

  **Relevant Threshold Protocol Parameters**:
    - DReps: `dvt_hard_fork_initiation`
    - SPOs: `pvt_hard_fork_initiation`
    - CC: `threshold`

1. **Protocol Parameter Changes**: Adjusts [protocol parameters](https://beta.explorer.cardano.org/en/protocol-parameters/) such as block size or transaction fees. They require a majority vote from DReps and the CC. To change security-relevant protocol parameters, the approval of SPOs is also required. A breakdown of the different groups of protocol parameters (`Network`, `Economic`, `Technical`, `Governance`, `Security`) can be found in [CIP-1694](https://github.com/cardano-foundation/CIPs/tree/master/CIP-1694#protocol-parameter-groups).

  **Relevant Threshold Protocol Parameters**:
    - DReps: `dvt_p_p_network_group`, `dvt_p_p_economic_group`, `dvt_p_p_technical_group`, `dvt_p_p_gov_group`
    - SPOs: `pvt_p_p_security_group`
    - CC: `threshold`

6. **Treasury Withdrawals**: Allocates funds from Cardano's on-chain treasury. Requires a majority vote from DReps and the CC.

  **Relevant Threshold Protocol Parameters**:
    - DReps: `dvt_treasury_withdrawal`
    - CC: `threshold`

1. **Info**: This type of action records information on-chain without causing any direct on-chain effects. The primary use cases for it are gauging the community's sentiment towards a specific topic. The thresholds for the Info action are set at 100% for DReps and SPOs to ensure that no voting falls below the necessary threshold, as any lower setting would make it impossible to achieve a polling threshold.

### Restrictions

Apart from Treasury withdrawals and Info actions, a mechanism is in place to ensure that governance actions of the same type do not accidentally clash. Each governance action must include the governance action ID for the most recently enacted action of its type. This ensures that two actions of the same type can only be enacted simultaneously if they are designed to do so deliberately.

### Prioritization of Enactment

Actions ratified during the current epoch are prioritized for enactment as follows:

1. Motion of no-confidence
2. New committee/threshold
3. Update to the Constitution or proposal policy
4. Hard Fork initiation
5. Protocol parameter changes
6. Treasury withdrawals
7. Info

> Note: Enactment for Info actions is a null action since they do not have any effect on the protocol.

### Order of Enactment

Governance actions are enacted in the order of their acceptance to the chain.

### Lifecycle

Governance actions are checked for ratification only at the epoch boundary. Once ratified, actions are staged for enactment. All submitted governance actions will either:

- Be **ratified**, then **enacted**
- **Expire** after a number of epochs defined by the parameter `gov_action_lifetime`

Deposits are returned immediately upon ratification or expiration. All governance actions are enacted at the epoch boundary following their ratification.

### Content

Each governance action will include the following:

- A deposit amount of lovelaces, as defined by the parameter `gov_action_deposit`
- A reward address to receive the deposit upon repayment
- An anchor for any metadata needed to justify the action
- A hash digest value of the metadata to prevent collisions with other actions of the same type

Each action will include elements specific to its type:

| Governance action type                                | Additional data                                                                                 |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| Motion of no-confidence | None |
| New committee/threshold | Set of verification key hash digests (members to be removed), map of new members and their terms, new `threshold` value |
| Update to the Constitution or proposal policy | Anchor to the Constitution and an optional script hash of the proposal policy |
| Hard-fork initiation | The new (greater) major protocol version |
| Protocol parameters changes | The values of the changed parameters |
| Treasury withdrawal | Map from stake credentials to a positive number of Lovelace |
| Info | None |

> Note: The new major protocol version must be exactly one greater than the current version. No duplicate committee members are allowed; each credential pair must be unique. 

Each accepted governance action will be assigned a unique identifier (governance action ID), consisting of the transaction hash that created it and the index within the transaction body that points to it.