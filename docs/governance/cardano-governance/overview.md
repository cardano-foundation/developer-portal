---
id: overview
slug: /governance/cardano-governance/governance-model
title: Introduction to Cardano Protocol Governance
sidebar_label: Overview
sidebar_position: 1
description: Cardano features a live, fully decentralized governance model that empowers Ada holders, Delegated Representatives (DReps), Stake Pool Operators (SPOs), and a Constitutional Committee to ensure a democratic decision-making process. 
---

# Cardano Protocol Governance

Cardano operates on a fully decentralized governance model designed to empower community participation and ensure robust, transparent decision-making. Detailed in [CIP-1694](https://github.com/cardano-foundation/CIPs/blob/master/CIP-1694/README.md), this framework utilizes a tricameral (three-body) model to oversee the network. 

Any proposed change to the network is submitted as a **governance action**, a transaction-triggered on-chain event with a time-limited window for voting and execution.

## The Tricameral Governance Model

Cardano’s governance relies on three distinct governing bodies working together to balance power, represent the community, and protect the network. 

### 1. Ada Holders & Delegated Representatives (DReps) {#dreps}
Ada holders are the core of Cardano’s governance. Because every Ada holder has voting power, they have the ultimate say in shaping the blockchain's future. 

* **Delegation:** Ada holders can delegate their voting rights to Delegated Representatives (DReps) to aggregate their influence. This is similar to delegating stake to a stake pool, but it specifically directs voting power.
* **Becoming a DRep:** Any Ada holder can register to become a DRep. By locking a refundable deposit, they can actively debate proposals, gather community feedback, and vote on behalf of the Ada holders who have delegated to them.
* **Submitting Actions:** Any Ada holder can propose a governance action on-chain by providing a refundable deposit.

### 2. Stake Pool Operators (SPOs) {#spos}
SPOs are fundamental to the network's operational integrity and security. Alongside producing blocks, they play a crucial role in governance:
* **Voting on Technical Changes:** SPOs vote on specific governance actions, particularly those that impact the technical operation of the network, such as hard forks.
* **Implementing Upgrades:** Once a technical change is approved through governance, SPOs are responsible for upgrading their node infrastructure to comply with the new rules.

### 3. The Constitutional Committee (CC) {#cc}
The Constitutional Committee oversees the governance process to ensure that all approved actions adhere to the foundational principles defined in the Cardano Constitution. 
* **Providing Checks and Balances:** The CC does not create proposals; rather, it reviews the constitutionality of submitted governance actions.
* **Community Elected:** The CC is a community-elected body, ensuring that the oversight of the network remains in the hands of the Cardano ecosystem.

---

## Governance Actions

A governance action is how changes are formally proposed and executed on Cardano. To maintain a structured decision-making process, CIP-1694 defines seven specific types of governance actions:

1. **Motion of no-confidence**
2. **Update to the Constitutional Committee and/or threshold**
3. **Update to the Constitution**
4. **Hard-Fork Initiation**
5. **Protocol Parameter Update**
6. **Treasury Withdrawals**
7. **Info Action**

*For a detailed explanation of each action type and its specific voting thresholds, please visit the [Governance Actions](governance-actions.md) page.*

---

## The Decision-Making Process

The life cycle of a governance decision generally follows these steps:

1. **Off-Chain Discussion:** Long before a vote happens on-chain, proposals undergo rigorous debate in community forums, Intersect working groups, and social channels. Building consensus off-chain is highly recommended before submitting an action.
2. **On-Chain Submission:** An Ada holder submits the formal governance action to the blockchain, alongside a required Ada deposit.
3. **Voting:** DReps, SPOs, and the CC vote on the action. The required voting thresholds depend on the specific type of governance action. 
4. **Enactment:** Actions are checked for ratification at the end of an epoch. If the required thresholds are met, the action is ratified and enacted at the next epoch boundary, and the initial deposit is returned.

---

## A Brief History of Cardano Governance

Cardano’s transition to fully decentralized governance was a phased, meticulously planned process:

* **SanchoNet (2023):** Launched as a public testnet, SanchoNet allowed the community, developers, and SPOs to safely experiment with the earliest CIP-1694 features.
* **Chang Hard Fork (2024):** The first phase of the governance rollout, the Chang hard fork laid the technical foundation for decentralized governance and initiated the bootstrapping phase.
* **Plomin Hard Fork (January 2025):** Originally known as Chang Phase 2 (and renamed in honor of community member Matthew Plomin), this milestone upgrade finalized the transition. It removed the training wheels, fully activating on-chain governance, enabling all action types, and granting Ada holders total control over the protocol's evolution. 

---

## Get Involved

Governance is live, and your voice matters. You can participate right now by connecting your wallet to community governance platforms like [Cardano GovTool](https://gov.tools/). From there, you can view active proposals, register as a DRep, or delegate your voting power to a DRep who aligns with your vision for Cardano.

---

## Learn More

import DocCardList from '@theme/DocCardList';

<DocCardList />