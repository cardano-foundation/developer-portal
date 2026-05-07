---
id: overview
slug: /operate-a-stake-pool/
title: Operate a Stake Pool
sidebar_label: Overview
description: Everything you need to set up and run a Cardano stake pool.
image: /img/og/og-developer-portal.png
---

A Cardano stake pool is the infrastructure that produces blocks on behalf of delegators. Running one means operating live servers, managing sensitive cryptographic keys, and participating in network governance. It is not a set-and-forget task.

This section walks you through the full lifecycle in order. Follow the steps sequentially the first time — each one builds on the last.

## The path

| Step | What you'll do |
|------|---------------|
| [1. Before You Start](basics/hardware-requirements) | Understand the requirements, the networking model, the key types, and set up your air-gapped signing machine |
| [2. Install](../get-started/infrastructure/node/installing-cardano-node) | Install `cardano-node` and `cardano-cli` |
| [3. Configure](relay-configuration/relay-node-configuration) | Set up your relay and block producer topology, configure Mithril |
| [4. Run](../get-started/infrastructure/node/running-cardano) | Start your nodes and verify they sync |
| [5. Register Your Pool](block-producer/generating-wallet-keys) | Generate keys, register your stake address, submit your pool certificate |
| [6. Monitor](monitoring/monitoring-overview) | Monitor node health, block production, and KES expiry |
| [7. Security & Hardening](deployment-scenarios/hardening-server) | Harden your servers, secure your key workflow, audit your setup |
| [8. Governance](governance/spo-governance) | Understand your role in on-chain governance and how to vote |

## What you're building

A minimal stake pool has three machines:

```
Internet
   │
   ├── Relay node 1  (public IP, accepts peer connections)
   ├── Relay node 2  (public IP, for redundancy)
   │
   └── Block producer  (no public IP, connected only to your relays)

Air-gapped machine  (never online — used only for cold key operations)
```

The block producer holds your hot KES and VRF keys and mints blocks. Your cold key — the one that authorizes pool registration and rotation — stays on the air-gapped machine and never touches any networked computer.

## Before you dive in

A few things that catch new operators off guard:

- **You need a second machine for cold key operations.** This is not optional. If your cold key is on an internet-connected machine, your pool is at risk. See [Air Gap Environment](/docs/learn/educational-resources/air-gap) for setup options.
- **Test on a testnet first.** The [Preview or Pre-Production testnets](../get-started/networks/testnets) let you run through the full registration flow without spending real ADA.
- **Pool registration costs a deposit.** Currently 500 ADA, returned when you retire the pool.
- **KES keys must be rotated** before they expire (~90 days on mainnet). Missing rotation means your node stops minting blocks.

## Community resources

- [Guild Operators](https://cardano-community.github.io/guild-operators) — CNTools, gLiveView, and extensive operator documentation
- [CoinCashew SPO Guide](https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node) — detailed setup walkthrough
- [Stake Pool Operator Scripts](https://github.com/gitmachtl/scripts) — step-by-step scripts for pool management
- [SPO Telegram workgroup](https://t.me/CardanoStakePoolWorkgroup) — active community for operators
- [Cardano Forum — SPO](https://forum.cardano.org/c/staking-delegation/156) — long-form discussions
