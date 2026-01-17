---
id: transaction-chaining
title: Transaction Chaining
sidebar_label: Transaction Chaining
description: An alternative to batching that orders transactions in the mempool without requiring batchers.
---

Transaction chaining is an alternative approach to handling contention that doesn't require batchers. Instead of collecting orders off-chain, transactions are ordered in the mempool before they reach the blockchain.

## What is Transaction Chaining?

> UTXOs are ordered virtually in a "first-come-first-served" manner, creating a virtual chain of transactions without the need for batching.

Instead of:
- Batchers collecting orders
- Submitting a single batched transaction

Transaction chaining:
- Users submit transactions directly
- Each transaction references the specific UTXO it expects to consume
- The mempool maintains the order
- Transactions execute in sequence as blocks are produced

The chain is created and enforced in a publicly visible, immutable, and decentralized way.

## How It Works

**Step 1: Transaction Submission**

A user creates a transaction that:
- References a specific UTXO as input
- Specifies the expected output state
- Gets submitted to the mempool

The mempool verifies the transaction's correctness and associates the user's signature with the state of that particular UTXO.

**Step 2: Chain Formation**

When multiple transactions target the same UTXO:
- They form a chain of dependencies
- Each transaction knows which UTXO it expects
- If that UTXO changes (consumed by an earlier transaction), the later transaction won't execute

```
Mempool: [tx1: (utxo_a -> utxo_b) ; tx2: (utxo_b -> utxo_c) ; tx3: (utxo_c -> utxo_d)]
```

**Step 3: Execution**

As blocks are produced:
- tx1 executes, consuming utxo_a and creating utxo_b
- tx2 can now execute, consuming utxo_b and creating utxo_c
- tx3 executes next
- And so on

**Key property:** A user gets exactly what they ordered, or the transaction doesn't execute. There's no partial execution or unexpected outcomes.

## Benefits Over Batching

| Aspect | Transaction Chaining | Batching |
|--------|---------------------|----------|
| **Centralization** | No batcher needed | Requires trusted batchers |
| **Ordering** | First-come-first-served | Batcher controls order |
| **BEV Risk** | Cannot reorder for profit | Batchers can sandwich |
| **Latency** | Optimistic, lower latency | Must wait for batch window |
| **Throughput** | Can process as blocks form | Batched periodically |

## Trade-offs

Transaction chaining isn't without its own considerations:

| Trade-off | Description |
|-----------|-------------|
| **Failed transactions** | If the expected UTXO was consumed by someone else, your transaction fails. No funds lost, but time wasted. |
| **Complexity** | More complex to implement correctly |
| **Mempool behavior** | Depends on mempool propagation and ordering |
| **High contention** | Under very high load, many transactions may fail |

## Use Cases

Transaction chaining works well for different scenarios:

### Wallet Transactions

Wallets like Typhoon use transaction chaining to let users spend funds that haven't yet been confirmed on-chain.

**Example:**
1. User sends 100 ADA (creates output_a)
2. Before output_a is confirmed, user sends 50 ADA from it
3. The second transaction chains off the first
4. Both execute in sequence when included in blocks

This improves UX by not making users wait for confirmations between transactions.

### Lending Protocol Scaling

Protocols like Liqwid Finance use transaction chaining to scale their systems without relying entirely on batchers.

### Liquidity Aggregation

Transaction chaining can aggregate liquidity from multiple smaller actors:

**Pool Transaction Chaining Example:**

Multiple lenders want to fund a single bond:

1. Lender A creates a pool, minting pool tokens
2. Lender B buys pool tokens (chains off Lender A's transaction)
3. Lender C buys more pool tokens (chains off Lender B's)
4. When full, the pool is matched against the bond offer

```
Mempool: [create_pool ; buy_tokens_1 ; buy_tokens_2 ; match_to_bond]
```

All of this happens without waiting for each transaction to be confirmed in separate blocks.

## Implementation Considerations

### Transaction Dependencies

Each transaction must clearly specify:
- The exact UTXO it expects as input
- What state that UTXO should have
- What the output should look like

### Validity Intervals

Use validity intervals to:
- Expire transactions that wait too long
- Prevent stale transactions from executing unexpectedly

### Retry Logic

Build retry logic for when transactions fail due to UTXO changes:
- Detect the failure quickly
- Find the new UTXO
- Rebuild and resubmit

### User Communication

Users should understand:
- Their transaction might not execute on the first try
- No funds are lost if it fails
- The system will retry automatically

## Emerging Patterns: Intent-Based Transactions

A newer evolution of transaction chaining involves "intents" rather than explicit transactions.

**Traditional approach:** "Consume UTXO_A, create UTXO_B with these exact parameters"

**Intent-based approach:** "I want outcome X and am willing to pay up to Y"

With intents:
- Users specify goals, not implementation details
- "Solvers" or "sequencers" find the best way to achieve those goals
- Multiple intents can be combined and optimized

**Sequencers vs Batchers:**
> Sequencers are ecosystem-wide, cross-application transaction bundlers that enable more complex interactions and greater optimizations due to their enhanced scope.

Where batchers typically serve a single protocol, sequencers can optimize across multiple protocols, potentially finding better execution paths.

This is an evolving area of research and development in the Cardano ecosystem.

## When to Use Transaction Chaining

**Good fit:**
- Applications prioritizing decentralization
- Lower-volume protocols where contention is manageable
- Wallet-level transaction sequencing
- Protocols that can tolerate some failed transactions

**Consider batching instead when:**
- Very high volume with significant contention
- Users expect immediate guaranteed execution
- Protocol can support trusted batchers

## Combining Approaches

Many production systems combine transaction chaining with other patterns:

- **Transaction chaining + batching:** Chain transactions within a batch window
- **Transaction chaining + state splitting:** Chain across multiple state partitions
- **Transaction chaining + retry systems:** Automatically retry failed chains

---

## Summary

Transaction chaining provides a decentralized alternative to batching by ordering transactions in the mempool. It trades the centralization risks of batchers for the complexity of managing transaction chains and handling failures gracefully.

The right choice depends on your protocol's priorities: if decentralization and MEV resistance matter more than guaranteed execution, transaction chaining is worth exploring.

---

## Further Reading

- [Contention](contention): Understanding the problem transaction chaining solves
- [Batching](batching): The alternative pattern with different trade-offs
