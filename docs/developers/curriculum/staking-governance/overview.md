---
id: overview
title: Staking & Governance
sidebar_label: Overview
description: "The developer's module for staking and governance: concept pages for each system, then practice pages that register, delegate, withdraw, vote, and propose as ordinary transactions."
---

You can already build transactions and manage native tokens. This module adds what an ADA holder's *stake* can do from your application: back the network's security (staking) and steer the protocol's evolution (governance). Everything here is the same build → sign → submit flow you know, with a few extra certificate types, and a dApp can build all of it.

The module runs concept before practice, twice:

- **[Staking](/docs/developers/curriculum/staking-governance/staking)**: the staking concept. Cardano's non-custodial delegation model, how rewards and timing work, and the lifecycle every integration follows.
- **[Delegate and withdraw](/docs/developers/curriculum/staking-governance/delegate-and-withdraw)**: practice. Register a stake credential, delegate it to a pool, and withdraw rewards.
- **[Manage stake](/docs/developers/curriculum/staking-governance/manage-stake)**: practice. Query delegation and rewards, deregister cleanly, and the combined certificate flow that bridges into governance.
- **[Governance](/docs/developers/curriculum/staking-governance/governance)**: the governance concept. Why CIP-1694 shapes the platform you build on, the three bodies, the seven action types, and ratification.
- **[DReps & vote delegation](/docs/developers/curriculum/staking-governance/drep-and-delegation)**: practice. Register a DRep, key- or script-based, and delegate voting power.
- **[Vote & propose](/docs/developers/curriculum/staking-governance/vote-and-propose)**: practice. Cast votes on live actions and put actions of your own on-chain.
- **[Governance operations](/docs/developers/curriculum/staking-governance/governance-operations)**: the appendix. Committee credentials, governance-state queries, CIP-95, and the handover to smart contracts.

:::note Not covered here
- **Running a stake pool** (relays, block producers, KES keys, pool registration, monitoring) is a separate discipline with its own section: [Operate a Stake Pool](/docs/operators/).
- **Participating in governance** as an ADA holder, DRep, or committee member (delegating your vote, browsing actions, the constitution, submitting actions as a human) lives on the participant hub at [cardano.org/governance](https://cardano.org/governance).

This module is about *building* staking and governance features, not operating a pool or participating by hand.
:::

## Next steps

- Start with [Staking](/docs/developers/curriculum/staking-governance/staking), or jump straight to [Delegate and withdraw](/docs/developers/curriculum/staking-governance/delegate-and-withdraw) if you already know the model
- The module ends by handing over to [Smart Contracts](/docs/developers/curriculum/smart-contracts/overview), where the script credentials met here get their validation logic
