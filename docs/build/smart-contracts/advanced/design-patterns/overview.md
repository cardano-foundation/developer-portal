---
id: overview
title: Design Patterns
sidebar_label: Overview
description: Common design patterns for Cardano smart contracts with Aiken implementations
---

A collection of tried and tested design patterns for building efficient and secure Cardano smart contracts. All patterns include Aiken implementations with code examples.

Based on [Anastasia Labs aiken-design-patterns](https://github.com/Anastasia-Labs/aiken-design-patterns) library.

## Available Patterns

| Pattern | Description |
|---------|-------------|
| [Stake Validator](stake-validator) | Delegate computations to staking scripts using the "withdraw zero trick" for optimized validation |
| [UTxO Indexers](utxo-indexers) | Efficient one-to-one and one-to-many mappings between inputs and outputs with O(1) lookups |
| [Transaction Level Minting Policy](tx-level-minter) | Couple spend and mint endpoints for single-execution validation logic |
| [Validity Range Normalization](validity-range-normalization) | Standardize validity range handling to eliminate redundancies |
| [Merkelized Validator](merkelized-validator) | Delegate logic to external withdrawal scripts to stay within size limits |
| [Parameter Validation](parameter-validation) | Verify script instances are derived from specific parameterized scripts |
