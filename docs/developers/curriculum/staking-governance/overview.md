---
id: overview
title: Staking & Governance
sidebar_label: Overview
description: "The developer's view of staking and governance on Cardano: how a dApp delegates stake, claims rewards, registers a DRep, and votes, all as ordinary transactions."
image: /img/og/og-developer-portal.png
---

Staking and governance are two things your users do on Cardano, and a dApp can build all of it. Delegating stake, claiming rewards, registering as a DRep, delegating a vote, and voting on governance actions are **ordinary on-chain transactions**, the same build → sign → submit flow you already know, with a few extra certificate types.

This module is the **developer slice**: how to integrate staking and governance into an application.

:::note Not covered here
- **Running a stake pool** (relays, block producers, KES keys, pool registration, monitoring) is a separate discipline with its own section: [Operate a Stake Pool](/docs/operators/).
- **Participating in governance** as an ADA holder, DRep, or committee member (delegating your vote, browsing actions, the constitution, submitting actions as a human) lives on the participant hub at [cardano.org/governance](https://cardano.org/governance).

This page is about *building* staking and governance features, not operating a pool or participating by hand.
:::

## In this module

- **[Staking](/docs/developers/curriculum/staking-governance/staking)**: Cardano's non-custodial delegation model (no lock-up, no slashing), how rewards and timing work, and how to register, delegate, withdraw, and query stake from a dApp.
- **[Governance](/docs/developers/curriculum/staking-governance/governance)**: what CIP-1694 governance means for developers, and how to register a DRep, delegate voting power, and vote, including the CIP-95 wallet APIs.

## Next steps

- [Staking](/docs/developers/curriculum/staking-governance/staking), start here if you're adding delegation or rewards
- [Governance](/docs/developers/curriculum/staking-governance/governance), add DRep registration, vote delegation, or voting
