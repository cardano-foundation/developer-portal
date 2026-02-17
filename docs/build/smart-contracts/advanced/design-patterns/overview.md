---
id: overview
title: Design Patterns
sidebar_label: Overview
description: Common design patterns for Cardano smart contracts with Aiken implementations
---

This section covers common design patterns and data structures for building efficient and secure Cardano smart contracts, all with Aiken implementations and code examples.

## Design Patterns Library

The patterns below come from the [Anastasia Labs aiken-design-patterns](https://github.com/Anastasia-Labs/aiken-design-patterns) library (v1.5.0). This is a ready-to-use Aiken library that provides production-grade implementations of common on-chain patterns, so developers can import and use them directly without the overhead of reimplementing the base logic themselves.

| Pattern | Description |
|---------|-------------|
| [Stake Validator](stake-validator) | Delegate computations to staking scripts using the "withdraw zero trick" for optimized validation |
| [UTxO Indexers](utxo-indexers) | Efficient one-to-one and one-to-many mappings between inputs and outputs with O(1) lookups |
| [Transaction Level Minting Policy](tx-level-minter) | Couple spend and mint endpoints for single-execution validation logic |
| [Validity Range Normalization](validity-range-normalization) | Standardize validity range handling to eliminate redundancies |
| [Merkelized Validator](merkelized-validator) | Delegate logic to external withdrawal scripts to stay within size limits |
| [Parameter Validation](parameter-validation) | Verify script instances are derived from specific parameterized scripts |
| [Linked List](linked-list) | On-chain linked list for storing arbitrarily large collections across UTxOs |

## Data Structures

The data structures below are standalone Aiken implementations from separate repositories. They are not part of the `aiken-design-patterns` library but serve as reference implementations that demonstrate how to use these structures on-chain.

| Data Structure | Description |
|----------------|-------------|
| [Merkle Tree](merkle-tree) | Merkle tree for efficient data verification and proof of membership |
| [Trie](trie) | Distributed trie for scalable on-chain key-value storage across UTxOs |
