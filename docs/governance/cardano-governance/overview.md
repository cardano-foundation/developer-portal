---
id: overview
slug: /governance/cardano-governance/governance-model
title: Introduction to Cardano Protocol Governance
sidebar_label: Overview
sidebar_position: 1
description: Cardano is implementing a decentralized governance model that empowers Ada holders, introduces Delegated Representatives (DReps), leverages Stake Pool Operators (SPOs), and establishes a Constitutional Committee to ensure a democratic decision-making process. 
---

## Cardano's Future Governance Model and Roles
Cardano is advancing towards a decentralized governance model designed to empower community participation and ensure robust decision-making processes. This model is detailed in [CIP-1694](https://github.com/cardano-foundation/CIPs/blob/master/CIP-1694/README.md), which outlines a framework for governance through a tricameral model and a structured decision-making process via seven different types of [governance actions](governance-actions.md). A governance action is a transaction-triggered on-chain event with a time-limited window for execution.

### Ada Holders {#ada-holders}

Ada holders are at the core of Cardano’s governance, wielding critical voting power and the ability to shape the blockchain's future:

- **Delegation of Voting Power**: Ada holders can delegate their voting rights to DReps to aggregate their influence. This delegation process involves creating and issuing a delegation certificate from the Ada holder's stake key to the chosen DRep.
- **Participation as DReps**: Ada holders can register as DReps, locking a deposit of `dRepDeposit`, allowing them to directly partake in the governance process, propose changes, and represent community interests.
- **Submitting Governance Actions**: Any Ada holder can propose governance actions on the blockchain network. To initiate such an action, a deposit of `govActionDeposit` lovelace must be provided. This deposit will be returned once the action reaches its conclusion, either through enactment or expiration.
- **Influence on Network Operations**: By delegating to specific SPOs, Ada holders indirectly influence the operational stability and security of the network and delegate their voting power for SPOs.

Their active involvement ensures that governance remains decentralized and aligned with the interests of the broader community. Each associated stake key can issue two types of delegation certificates, one for a delegation to a stake pool and the other for a delegation to a DRep.

### Delegated Representatives (DReps) {#dreps}

DReps will serve as officials representing Ada holders in the governance system. Every ada holder has the choice to either register themselves as a DRep to represent themselves or others or delegate their voting power to a DRep of their choice. Their primary roles include:

- **Proposing and debating changes to the Cardano protocol**: DReps propose and debate changes to the Cardano protocol, but they also play a crucial communication role. They gather feedback from the community and represent constituent interests during governance discussions.
- **Voting on proposals**: DReps vote on proposals based on the priorities and interests of the Ada holders they represent.
- **Voting power**: DReps' voting power is proportional to the stake delegated to them.

### Stake Pool Operators (SPOs) {#spos}

SPOs are fundamental to the network's operational integrity and will also play a crucial role in governance by:

- **Maintaining network infrastructure**: SPOs ensure the continuous, stable operation of the Cardano network.
- **Participating in governance discussions**: SPOs contribute to governance discussions, particularly on technical aspects and implementation of protocol changes.
- **Voting on governance actions**
- **Implementing approved changes**: SPOs are responsible for upgrading their infrastructure to comply with changes approved through the governance process.
- **Voting power**: SPOs' voting power is based on their active stake.

### Constitutional Committee (CC) {#cc}

The Constitutional Committee will oversee and guide the governance process to adhere to Cardano’s foundational governance principles as defined in the Cardano Constitution. It will:

- **Interpret the Cardano Constitution**: The CC ensures that governance actions align with the Constitution.
- **Provide checks and balances**: The CC offers a system of checks and balances by reviewing the constitutionality of governance actions.
- **Ensure transparency and fairness**: The CC works to maintain a governance process that is transparent, fair, and in line with the overall objectives of the Cardano ecosystem.
- **Voting power**: Each CC member has one vote.

#### Interim Constitutional Committee

During the [bootstrapping phase](https://github.com/cardano-foundation/CIPs/tree/master/CIP-1694#bootstrapping-phase), which we will enter right after the Chang hard fork, an Interim Constitutional Committee will be established to:

- **Support initial governance structures**: Ensure the smooth functioning of governance systems after the bootstrap phase.
- **Transition to a fully established CC**: Provide guidelines and frameworks for a fully-fledged Constitutional Committee.
- **Voting power**: Each member has one vote.

The interim Constitutional Committee will have the power to change protocol parameters and, together with SPOs, initiate hard forks.

 ## Decision Making Process

The governance process will involve:

1. **Off-Chain Discussion**: The majority of discussions and consensus-building about specific governance issues will happen off-chain before any governance action has been submitted to the blockchain. Gathering support for changes will be among the most difficult tasks of proposers. Proposals will undergo thorough discussion in various forums, allowing community members and stakeholders to provide feedback and suggest refinements.
2. **Governance Action Submission**: Any Ada holder can submit a governance action as long as a sufficient ada deposit is provided.
3. **Voting**: Decisions on governance actions will be made through a democratic voting process involving DReps, SPOs, and the CC. The required thresholds that have to be met to ratify a governance action are specified in the governance protocol parameters. A detailed overview of the governance parameters can be found [here](https://github.com/thenic95/cardano-governance/blob/main/Reports/Cardano%20Governance%20Parameter/cardano-governance-parameter-overview.md).
4. **Enactment**: Governance actions are checked for ratification only at the epoch boundary. Once ratified, actions will be enacted at the next epoch boundary. The governance action deposit will be returned once a governance action has been enacted or expired.