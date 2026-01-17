---
id: contention
title: Understanding Contention
sidebar_label: Contention
description: Understanding the concurrency challenge in EUTXO and the solution categories available.
---

When building applications with shared state on Cardano, you'll encounter the contention problem. This page explains what it is, clears up common misconceptions, and introduces the solution categories covered in this section.

## The Problem

On Cardano, each UTXO can only be spent once. When multiple users try to spend the same UTXO simultaneously, only one transaction succeeds per block. The others fail and must be retried.

> Without a well-thought concurrent framework, there will be a race condition where different dApp users compete to consume the same UTXO. For example, multiple swap transactions want to consume the same liquidity pool UTXO, but only one succeeds per block.

Consider a DEX with a single liquidity pool UTXO. If the DEX becomes popular:

1. User A submits a swap transaction consuming the pool UTXO
2. Users B, C, and D also submit swaps consuming the same UTXO
3. Only one transaction succeeds (say, User A's)
4. Users B, C, and D must find the new pool UTXO and retry
5. The cycle repeats

This creates a poor user experience and limits throughput.

## Definitions

To discuss solutions clearly, we need precise terminology. A useful analogy is chefs in a kitchen:

| Term | Definition | Kitchen Analogy |
|------|------------|-----------------|
| **Concurrency** | Multiple actors making progress without interfering with each other | A single skilled chef working on multiple dishes, switching between them at the right time |
| **Parallelism** | Multiple actors making progress at the same time without interference | Multiple chefs each working at their own station |
| **Contention** | When multiple actors actually interfere with each other | Chefs bumping into each other when reaching for the same ingredient |

Cardano's UTXO model is excellent at parallelism. Independent UTXOs can be validated by different nodes simultaneously. But applications with shared state can face contention when multiple users target the same UTXO.

## Common Misconceptions

Misconceptions about Cardano's concurrency have spread through the ecosystem. Let's address them directly:

| Misconception | Reality |
|--------------|---------|
| "Cardano only allows 1 transaction per block" | Cardano allows hundreds of transactions per block. The limitation is that a specific UTXO can only be spent once per block. |
| "Only one user can interact with a smart contract per block" | Many UTXOs can be locked by the same smart contract. Each can be spent independently. The issue only arises when multiple users target the same specific UTXO. |
| "The only solution is centralization" | Multiple decentralized solutions exist, including batching patterns, transaction chaining, and state splitting. |

## Solution Categories

Several architectural approaches exist for handling contention. Each has trade-offs:

### State Splitting

Divide your state across multiple UTXOs instead of concentrating it in one.

**Example:** Instead of one liquidity pool UTXO, maintain multiple smaller pools. Users interact with different pools, reducing contention.

**Trade-off:** Reduced capital efficiency. A large order might need to access multiple pools. Cross-pool arbitrage opportunities emerge.

**Best for:** Applications where state can be naturally partitioned and capital fragmentation is acceptable.

### Batching

Collect multiple user actions off-chain, then apply them to the state in a single transaction.

**Example:** Users submit swap orders. A batcher collects these orders and executes them all against the pool in one transaction that updates the state once.

**Trade-off:** Requires trusting the batcher (or multiple competing batchers). Introduces latency while orders are collected.

**Best for:** High-volume applications where throughput matters more than immediate execution.

See [Batching](batching) for detailed coverage.

### Transaction Chaining

Order transactions in the mempool before they reach the chain, creating a virtual queue.

**Example:** Each transaction references the UTXO it expects to consume. If that UTXO changes (because another transaction consumed it first), the transaction fails gracefully. The mempool maintains the order.

**Trade-off:** More complex to implement. Failed transactions waste time (though not funds).

**Best for:** Applications that need decentralization without batchers.

See [Transaction Chaining](transaction-chaining) for detailed coverage.

### Lazy Updates

Defer state changes until they're actually needed on-chain.

**Example:** In a voting system, don't update the proposal state with each vote. Instead, accumulate votes as separate UTXOs and only aggregate them when the proposal is finalized.

**Trade-off:** More computation required when state is eventually read.

**Best for:** Applications where writes are frequent but reads are rare.

### Order Book Models

Design your protocol so each user action is a separate UTXO.

**Example:** In a DEX, each limit order is its own UTXO. A matchmaker finds compatible orders and settles them.

**Trade-off:** Contention still exists at the orders closest to current price.

**Best for:** Trading applications that can tolerate this model's complexity.

## Choosing an Approach

There's no universal solution. The right approach depends on your application:

| Application Type | Recommended Starting Point |
|-----------------|---------------------------|
| DEX with pooled liquidity | Batching with multiple batchers |
| Lending protocol | State splitting by asset or region |
| NFT marketplace | Per-listing UTXOs (natural separation) |
| Governance/voting | Lazy updates |
| Limit order exchange | Order book with transaction chaining |

Many production applications combine approaches. A DEX might use batching for swaps but order books for limit orders.

## The Key Insight

> Maximizing concurrency is a skill that needs to be learned: developers need to write code in a way that severely restricts the opportunities for contention.

Don't try to fight the EUTXO model. Design with it. The constraint that UTXOs can only be spent once is what enables Cardano's determinism and security. Your architecture should embrace this rather than work around it.

---

## Next Steps

- [Batching](batching): Learn the Reserve-Step-Apply pattern and understand batchers
- [Transaction Chaining](transaction-chaining): Explore decentralized alternatives to batching
