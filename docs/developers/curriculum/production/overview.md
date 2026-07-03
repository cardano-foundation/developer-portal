---
id: overview
title: Scaling & Production
sidebar_label: Overview
description: How Cardano scales, at Layer 1 and with Hydra at Layer 2, and how to take a dApp from working on testnet to running in production.
---

This module answers two questions every serious project reaches: **how does Cardano scale**, and **how do I take my dApp to production**. The first is about throughput and architecture; the second is about reliability, security, and infrastructure. Both build on everything in the earlier modules.

## How Cardano scales

Scaling isn't one thing. Cardano scales at several layers, and the right approach depends on your workload.

### Layer 1: the base chain

The base chain has bounded capacity per block, so on Layer 1 you scale by **using blocks efficiently** rather than by sending more independent transactions at a shared piece of state. Because the [eUTXO model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo) makes a UTXO spendable only once per block, high-contention designs (like a single shared pool) need the concurrency patterns covered in [DeFi on Cardano](/docs/developers/curriculum/dapps/defi#the-eutxo-design-challenge): **order batching** (many user intents executed in one transaction) and **pool sharding** (state split across many UTXOs so transactions run in parallel). You can also drop the confirmation wait between dependent transactions with [transaction chaining](/docs/developers/curriculum/production/transaction-chaining), spending each transaction's outputs before it settles. At the protocol level, the [Ouroboros roadmap](/docs/developers/curriculum/fundamentals/consensus-and-ouroboros) includes Leios (input endorsers) aimed at substantially higher throughput.

### Layer 2: Hydra

When you need **near-instant, near-free, high-frequency** transactions, gaming, micropayments, real-time interactions, you move them off the base chain into a [Hydra](/docs/developers/curriculum/production/hydra) Head: a state channel where a known set of participants transact thousands of times per second, settling back to Layer 1 only to open and close. You pay L1 cost once to open and once to close; everything inside is fast and free.

| Need | Reach for |
|---|---|
| More throughput against shared state on L1 | [Order batching / pool sharding](/docs/developers/curriculum/dapps/defi#the-eutxo-design-challenge) |
| Submit many dependent transactions without waiting for confirmation | [Transaction chaining](/docs/developers/curriculum/production/transaction-chaining) |
| Instant, free, high-frequency transactions among known parties | [Hydra (Layer 2)](/docs/developers/curriculum/production/hydra) |
| Higher base-layer throughput (future) | Ouroboros Leios ([roadmap](/docs/developers/curriculum/fundamentals/consensus-and-ouroboros)) |

## Taking a dApp to production

Working on testnet is not the same as running in production. Two pages cover the rest:

- **[Going to production](/docs/developers/curriculum/production/going-to-production)**: the checklist before you ship to mainnet: testing, security, reliable transactions, optimization, and key safety.
- **[Production infrastructure](/docs/developers/curriculum/production/infrastructure)**: the stack that serves your dApp the chain: managed APIs vs running your own node, indexers, and how to choose.

## Next steps

- [Hydra](/docs/developers/curriculum/production/hydra): build on Cardano's Layer 2
- [Going to production](/docs/developers/curriculum/production/going-to-production): ship to mainnet with confidence
