---
id: overview
title: Design Patterns
sidebar_label: Overview
description: Simplifying complex smart contract design patterns on the Cardano blockchain
---

This project is dedicated to simplifying complex Plutus smart contract design patterns on the Cardano blockchain through the creation of two distinct libraries:

- [Aiken](https://github.com/Anastasia-Labs/aiken-design-patterns)
- [Plutarch](https://github.com/Anastasia-Labs/plutarch-design-patterns)

These libraries are designed to abstract away some of the more unintuitive and lesser-known design patterns, making them more accessible to developers. Below is an overview of the key features and design patterns these libraries address:

## Key Features

- **Transaction Level Validation**: Abstracts the intricacies of spending validator validation through:
  - Stake Validators using the "withdraw zero" trick.
  - Minting Policies for enhanced control and security.

- **Input/Output Indexing with Redeemers**: Simplifies the management of input/output indexing, streamlining the process of associating redeemers with their respective inputs or outputs.

- **Strict Boolean Validation Checks**: Offers a robust framework for implementing boolean binary operators, ensuring strict validation checks across Plutus, Plutarch, and Aiken.

- **PlutusTypeEnum Redeemers**: Introduces an efficient data encoding method for simple redeemers, utilizing Enums to minimize complexity and optimize performance.

- **Normalization Techniques**: Enhances data integrity and contract reliability through:
  - **TxInfoMint Normalization**: Cleanses txInfoMint data to eliminate 0 lovelace value entries, ensuring cleaner and more accurate data representation.
  - **Validity Range Normalization**: Standardizes the treatment of validity ranges, ensuring consistent and predictable contract behavior.
