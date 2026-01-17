---
id: batching
title: Batching and Batchers
sidebar_label: Batching
description: The batching pattern for concurrent state updates and the off-chain actors that make it work.
---

Batching is an architectural pattern that enables concurrent interaction with shared state by collecting multiple user actions and applying them in a single transaction. This page covers both the pattern itself and the off-chain actors (batchers) that execute it.

## What is Batching?

Instead of each user submitting a transaction directly to the blockchain, batching:

1. Collects multiple user actions (orders, deposits, withdrawals)
2. Aggregates them into a single transaction
3. Applies all actions to the shared state at once
4. Distributes results back to users

This transforms the problem from "many users competing for one UTXO" to "one transaction handling many users."

## The Reserve-Step-Apply Pattern

This pattern solves a critical question: how do you ensure all user actions are processed fairly, without allowing the transaction submitter to manipulate the outcome?

Such a pattern could for example use three types of UTXOs:

### Reserve UTXOs

Reserve UTXOs are "slots" that users claim before submitting their action. They guarantee that no user actions are left behind or omitted.

**Why they exist:**
> If users can create steps directly without going through this reserve process, steps will be left behind when there are more steps than a transaction size limit can include. Furthermore, malicious off-chain agents can omit steps by choice because no on-chain validation guards this.

### Step UTXOs

When a user wants to interact with the protocol:

1. They consume a Reserve UTXO
2. They create a Step UTXO containing:
   - Their action details (swap amount, direction, etc.)
   - Required funds
   - Approximate submission time (for ordering)

### Apply Transaction

The Apply transaction:

1. Consumes the State UTXO and all Step UTXOs
2. Validates and processes each step
3. Creates:
   - A new State UTXO with updated state
   - New Reserve UTXOs for the next round
   - Output UTXOs for each user (with their results)

## Deterministic Validation

The key innovation is that validation must be deterministic. The same inputs always produce the same outputs, preventing off-chain manipulation.

The validation follows a pure transition function:

```
f :: (State, [Output]) -> Step -> (State, [Output])
```

Each step is applied iteratively:

1. Check if the step is valid given current state
2. If valid: update state, append success output
3. If invalid: append failure output (return funds to user)
4. Move to next step

When ordering matters (like in a DEX where each swap changes the price), steps are sorted by a deterministic attribute, commonly the approximate submission time from the Reserve phase.

## Timing Phases

To prevent race conditions between Reserve and Apply operations, the pattern uses timing phases controlled by validity intervals:

**Reserve Phase**: Users can consume Reserve UTXOs and create Step UTXOs.

**Apply Phase**: After the Reserve window closes, an Apply transaction processes all Steps and creates new Reserves.

For continuous operation, a binary era system alternates between Era 0 and Era 1, allowing state application every block while maintaining clear separation.

## What is a Batcher?

> Batchers are entities that run nodes on the Cardano network and have the ability to create and submit transactions that invoke the on-chain code (validator scripts) of DEXes.

A batcher is the off-chain "execution layer" that:

- Monitors for user orders (Step UTXOs)
- Aggregates orders into batched transactions
- Computes the deterministic outcome
- Submits the Apply transaction

The on-chain validators ensure batchers can't manipulate outcomes, but batchers handle the operational complexity.

## How It Works: An Example

Alice wants to sell HOSKY tokens for ADA. Bob wants to buy HOSKY with ADA.

**Step 1: Order Submission**

Alice and Bob each:
1. Find/select a batcher (automatically by the DEX or manually)
2. Create a transaction that locks their funds at a script address
3. The script defines the spending conditions (e.g., "receive at least X ADA for these HOSKY tokens")
4. Sign and submit their transactions

**Step 2: Batcher Collects Orders**

The batcher:
1. Monitors the blockchain for new Step UTXOs
2. Collects Alice's and Bob's orders
3. Verifies both orders can be satisfied together

**Step 3: Batch Execution**

The batcher:
1. Builds an Apply transaction that consumes both Step UTXOs, satisfies both spending conditions, and routes tokens appropriately
2. Submits it as a single atomic transaction

The batcher builds the transaction, but users signed off on their conditions. The batcher cannot spend funds without satisfying those conditions.

## Batcher Fees

Batchers charge fees for their service:

| Cost | Description |
|------|-------------|
| **Transaction fees** | Network fees to submit the Apply transaction |
| **Infrastructure** | Nodes, servers, monitoring systems |
| **Operational overhead** | Development, maintenance |

Fees vary based on protocol parameters, infrastructure demands, and competition between batchers.

## Advantages

| Benefit | Explanation |
|---------|-------------|
| **Reduced blockchain load** | A batch of 10 orders is smaller than 10 individual transactions |
| **Lower user fees** | Users share the cost of one transaction |
| **Faster execution** | Batchers can optimize and submit quickly |
| **Scalability** | Concurrency level (c) is configurable per protocol |

## Trade-offs and Risks

Batchers introduce trust assumptions:

| Risk | Description |
|------|-------------|
| **Centralization** | Batchers can stop processing orders |
| **Custodiality** | Control over withdrawal timing |
| **BEV (Batcher Extractable Value)** | Can reorder transactions for profit |
| **Availability** | If batcher goes offline, orders are delayed |
| **Entry barrier** | Often requires significant stake |

### Sandwich Attack Example

> An order comes in to buy 1,000 ADA of Token A with 1% slippage (limit order for 990 ADA of Token A). A batcher could buy Token A first, move the price up, execute the user's order at the markup, then sell Token A for profit.

### Mitigations

- **Deterministic ordering**: Sort by timestamp, validated on-chain
- **Competition**: Multiple batchers reduce single-point-of-failure
- **Economic incentives**: Dishonest batchers lose business and delegated ADA
- **User verification**: Check transactions before signing
- **Timeouts**: Let users cancel orders after a deadline

## Why Cardano Needs Batchers

This is a common question. The answer lies in the accounting models:

**Cardano (UTXO model):** No global state accessible to scripts. Scripts see only the inputs and outputs of the current transaction. Complex logic must happen off-chain.

**Ethereum (Account model):** Global state accessible by smart contracts. Swap contracts can read pool state, compute swaps, and update state on-chain.

Batchers on Cardano fulfill the role that smart contract execution does on Ethereum.

## When to Use Batching

**Good fit:**
- DEXes with pooled liquidity
- Lending protocols with shared pools
- High-volume applications with shared state

**Consider alternatives when:**
- Users need immediate execution
- Decentralization is paramount (see [Transaction Chaining](transaction-chaining))
- State can be naturally partitioned

---

## Next Steps

- [Transaction Chaining](transaction-chaining): A decentralized alternative that doesn't require batchers
- [Contention](contention): Understanding the problem batching solves
