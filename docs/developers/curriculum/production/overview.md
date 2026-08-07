---
id: overview
title: Ship to Production
sidebar_label: Overview
description: "Take a dApp from testnet to mainnet and scale it: the production checklist, chain-access infrastructure from hosted APIs to your own node, custom indexing, and Cardano's scaling options from transaction chaining to Hydra."
---

You arrive here with a working application from [Build a dApp](/docs/developers/curriculum/dapps/overview): a wallet connects, transactions build and submit, contracts validate on a testnet. This module covers what stands between that and a service real users rely on, in two arcs: **Ship**, then **Scale**.

## Ship

Shipping is readiness plus infrastructure. The readiness half is a checklist; the infrastructure half is a decision you make once, with the concepts to make it well:

- **[Going to production](/docs/developers/curriculum/production/going-to-production)**: the pre-mainnet checklist: testing, security, reliable transactions, optimization, key safety, and the staging path through the testnets.
- **[Connecting to the chain](/docs/developers/curriculum/production/connecting-to-the-chain)**: the concept map of chain access: what query APIs, node interfaces, indexers, data nodes, full nodes, and managed platforms each are, which of them are genuine alternatives to each other, and the axes to choose by.
- **[Use a provider](/docs/developers/curriculum/production/use-a-provider)**: the hosted path in practice: Blockfrost, Koios, and Maestro, set up with one identical skeleton.
- **[Self-hosting](/docs/developers/curriculum/production/self-hosting)**: the self-run path in practice: a Dolos data node, a node with Ogmios and Kupo, or a full node, with Demeter as the managed variant.
- **[Custom indexing & analytics](/docs/developers/curriculum/production/indexing-and-analytics)**: when your application needs its own slice of the chain, or answers over its full history.
- **[The network protocol beneath the APIs](/docs/developers/curriculum/production/network-protocol)**: an appendix on the wire protocol everything above abstracts, and how to speak it directly.

## Scale

Scaling isn't one thing. Cardano scales at several layers, and the right approach depends on your workload.

### Layer 1: the base chain

The base chain has bounded capacity per block, so on Layer 1 you scale by **using blocks efficiently** rather than by sending more independent transactions at a shared piece of state. Because the [eUTXO model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo) makes a UTXO spendable only once per block, high-contention designs (like a single shared pool) need the concurrency patterns covered in [DeFi on Cardano](/docs/developers/curriculum/dapps/defi#the-eutxo-design-challenge): **order batching** (many user intents executed in one transaction) and **pool sharding** (state split across many UTXOs so transactions run in parallel). You can also drop the confirmation wait between dependent transactions with [transaction chaining](/docs/developers/curriculum/production/transaction-chaining), spending each transaction's outputs before it settles. At the protocol level, proposed upgrades to Ouroboros (Leios, input endorsers) aim at substantially higher base-layer throughput.

### Layer 2: Hydra

When you need **near-instant, near-free, high-frequency** transactions, gaming, micropayments, real-time interactions, you move them off the base chain into a [Hydra](/docs/developers/curriculum/production/hydra) Head: a state channel where a known set of participants transact thousands of times per second, settling back to Layer 1 only to open and close. You pay L1 cost once to open and once to close; everything inside is fast and free.

| Need | Reach for |
|---|---|
| More throughput against shared state on L1 | [Order batching / pool sharding](/docs/developers/curriculum/dapps/defi#the-eutxo-design-challenge) |
| Submit many dependent transactions without waiting for confirmation | [Transaction chaining](/docs/developers/curriculum/production/transaction-chaining) |
| Instant, free, high-frequency transactions among known parties | [Hydra (Layer 2)](/docs/developers/curriculum/production/hydra) |
| Higher base-layer throughput (future) | Ouroboros Leios (proposed protocol upgrade) |

## Where the curriculum ends

This is the last module. Past it, the paths lead outward: running Cardano infrastructure as a discipline of its own ([Operate a Stake Pool](/docs/operators/)), starting the next project from a runnable [template](/templates), and the [developer community](/docs/community/cardano-developer-community) where the ecosystem builds.

## Next steps

- [Going to production](/docs/developers/curriculum/production/going-to-production): start the Ship arc with the checklist
- [Connecting to the chain](/docs/developers/curriculum/production/connecting-to-the-chain): understand the infrastructure before you pick it
