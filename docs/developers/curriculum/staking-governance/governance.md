---
id: governance
title: Governance
sidebar_label: Governance
description: "What CIP-1694 on-chain governance means for developers: the three governance bodies, the seven action types, and the ratification lifecycle your tooling reads."
---

Cardano's on-chain governance ([CIP-1694](https://cips.cardano.org/cip/CIP-1694), the Voltaire era) lets ADA holders propose, vote on, and enact protocol changes. For developers, the key fact is that **governance actions are ordinary on-chain transactions**: DRep registration, vote delegation, and votes use the same wallets, providers, and transaction builders you already use, with a few extra certificate and procedure types.

This page is the concept: why governance shapes what you build, who decides, what can be decided, and how a decision becomes protocol reality. Three practice pages then build it: [DReps & vote delegation](/docs/developers/curriculum/staking-governance/drep-and-delegation), [Vote & propose](/docs/developers/curriculum/staking-governance/vote-and-propose), and [Governance operations](/docs/developers/curriculum/staking-governance/governance-operations). Taking part in governance as a person, delegating your vote in a wallet, browsing actions, and reading the constitution, lives on the participant hub at [cardano.org/governance](https://cardano.org/governance).


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

## Next steps

- [DReps & vote delegation](/docs/developers/curriculum/staking-governance/drep-and-delegation): register a DRep (key- or script-based) and delegate voting power
- [Vote & propose](/docs/developers/curriculum/staking-governance/vote-and-propose): cast votes on live actions and author each of the seven types
- [Governance operations](/docs/developers/curriculum/staking-governance/governance-operations): committee credentials, state queries, and CIP-95
