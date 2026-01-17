---
id: overview
slug: /build/building-on-eutxo/
title: Building on EUTXO
sidebar_label: Overview
description: Architectural guidance for building applications on Cardano's EUTXO model.
---

This section bridges the gap between understanding what EUTXO is (covered in [Core Concepts](/docs/learn/core-concepts/eutxo)) and writing smart contracts (covered in [Smart Contracts](/docs/build/smart-contracts/overview)). Before diving into code, you need to understand how to architect your application for Cardano's unique model.

## Why This Section Matters

Cardano's Extended UTXO (EUTXO) model is fundamentally different from account-based blockchains like Ethereum. The patterns and architectures that work on Ethereum often don't translate directly to Cardano. Understanding these differences upfront will save you significant development time and help you build more efficient, scalable applications.

## The Evolution: Bitcoin to Ethereum to Cardano

To understand EUTXO, it helps to see how blockchain accounting models have evolved.

### Bitcoin: The UTXO Model

Bitcoin introduced the concept of tracking funds via Unspent Transaction Outputs (UTXOs). Each transaction consumes some inputs and produces new outputs, with each output representing a bundle of value and a declaration of who can spend it.

**Benefits:**
- Simple and secure to validate (compare total in vs total out)
- Easy to validate transactions in parallel
- Highly deterministic (outcome known before submission)

**Limitation:** No access to global state, making smart contracts difficult.

### Ethereum: The Account Model

Ethereum chose a different approach: tracking global account balances. The ledger state is a mapping from address to balance. Smart contracts can store and access global state, enabling complex applications like DEXes and lending protocols.

**The cash vs bank account analogy:** The difference between UTXO and accounts is like the difference between cash in your pocket and the balance in your bank account. With cash (UTXO), you hand over specific bills and get specific change back. With a bank account, the balance just gets updated.

**Benefits:**
- Access to global state enables complex smart contracts
- Composability between contracts

**Trade-offs:**
- Every transaction must be processed sequentially (can't easily parallelize)
- Transaction ordering matters, enabling MEV (Miner Extractable Value) and front-running
- Outcomes can be unpredictable (state might change between submission and execution)

### Cardano: The Extended UTXO Model

Cardano chose to extend the UTXO model rather than adopt accounts. EUTXO preserves the benefits of Bitcoin's model while adding programmability:

- **Datum**: Arbitrary data attached to a UTXO (script state)
- **Redeemer**: User-provided arguments when spending
- **Validator**: Script that determines if a UTXO can be spent

**Benefits of EUTXO:**
- **Determinism**: Know exactly what will happen before submission
- **No MEV**: Reordering transactions has no impact on outcomes
- **Parallel validation**: UTXOs can be verified independently
- **Lower fees**: No failed transactions consuming gas

**Trade-off:** Requires different architectural thinking for applications with shared state.

## The Key Insight

> You can't just port Ethereum contracts to Cardano. EUTXO requires different thinking about state management.

On Ethereum, multiple users can interact with the same contract in the same block because the global state is updated sequentially. On Cardano, if multiple transactions try to spend the same UTXO, only one succeeds per block.

This isn't a limitation to work around. It's a design choice that brings determinism and security. The question becomes: how do you architect applications that work well with this model?

## What You'll Learn

| Topic | Description |
|-------|-------------|
| [Contention](contention) | Understanding the concurrency problem and solution categories |
| [Batching](batching) | The Reserve-Step-Apply pattern and off-chain batchers |
| [Transaction Chaining](transaction-chaining) | Ordering transactions in the mempool without batchers |

## When to Use This Section

**Read this section if you're building:**
- DEXes or AMMs with shared liquidity pools
- Lending protocols with global state
- Any application where multiple users interact with shared data
- Applications that need high throughput

**You can skip ahead if you're building:**
- Simple token minting or transfers
- Vesting contracts (no shared state between users)
- NFT marketplaces with per-listing UTXOs
- Applications where each user has independent state

---

## Next Steps

Start with [Understanding Contention](contention) to learn why shared state creates challenges and what solution categories exist. Then explore the specific patterns that match your use case.
