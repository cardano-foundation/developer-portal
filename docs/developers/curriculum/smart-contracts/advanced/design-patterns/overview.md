---
id: overview
title: Design Patterns
sidebar_label: Overview
description: Common design patterns for Cardano smart contracts with Aiken implementations
---

This section covers common design patterns and data structures for building efficient and secure Cardano smart contracts, all with Aiken implementations and code examples.

These are reference material, not a sequential read: reach for a pattern when you hit the problem it solves. They are about **efficiency and architecture**, which is a different concern from the [security vulnerabilities](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/overview) (what can go wrong) and [optimization](/docs/developers/curriculum/smart-contracts/advanced/optimization) (making a single validator cheaper). The most broadly useful idea here is the principle below.

## Avoid redundant validation

When several scripts run in one transaction (multiple spends, a mint, a withdrawal) and each independently validates the same conditions, you pay for those checks once *per script*: more execution units, higher fees, and duplicated logic that can drift out of sync between validators.

The fix is **validation delegation**. Put the shared checks in a single validator and have every other script merely confirm that this central validator ran in the same transaction. The common logic then executes once, no matter how many scripts are involved.

The cleanest validator to centralize into is a **withdrawal (stake) validator**, triggered by the **withdraw-zero trick**: include a withdrawal of 0 lovelace from the script's reward account. That fires the withdrawal script without touching stake rewards, consuming a UTXO, or minting a token, so each spending or minting script only has to check `tx.withdrawals` for the central script's hash. The full implementation (central validator, delegating spend/mint scripts, and the off-chain withdraw-0) is the [Stake Validator](../stake-validator) pattern.

Reach for it when multiple scripts in a protocol share validation and cost matters; skip it when the scripts are genuinely independent, or when one self-contained extra script is simpler than the indirection.

## Design Patterns Library

The patterns below come from the [Anastasia Labs aiken-design-patterns](https://github.com/Anastasia-Labs/aiken-design-patterns) library (v1.5.0). This is a ready-to-use Aiken library that provides production-grade implementations of common on-chain patterns, so developers can import and use them directly without the overhead of reimplementing the base logic themselves.

| Pattern | Description |
|---------|-------------|
| [Stake Validator](../stake-validator) | Delegate computations to staking scripts using the "withdraw zero trick" for optimized validation |
| [UTxO Indexers](../utxo-indexers) | Efficient one-to-one and one-to-many mappings between inputs and outputs with O(1) lookups |
| [Transaction Level Minting Policy](../tx-level-minter) | Couple spend and mint endpoints for single-execution validation logic |
| [Validity Range Normalization](../validity-range-normalization) | Standardize validity range handling to eliminate redundancies |
| [Merkelized Validator](../merkelized-validator) | Delegate logic to external withdrawal scripts to stay within size limits |
| [Parameter Validation](../parameter-validation) | Verify script instances are derived from specific parameterized scripts |
| [Linked List](../linked-list) | On-chain linked list for storing arbitrarily large collections across UTxOs |

## Data Structures

The data structures below are standalone Aiken implementations from separate repositories. They are not part of the `aiken-design-patterns` library but serve as reference implementations that demonstrate how to use these structures on-chain.

| Data Structure | Description |
|----------------|-------------|
| [Merkle Tree](../merkle-tree) | Merkle tree for efficient data verification and proof of membership |
| [Trie](../trie) | Distributed trie for scalable on-chain key-value storage across UTxOs |
