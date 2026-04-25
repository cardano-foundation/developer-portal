---
title: Hello Cardano
description: Learn how to build applications on Cardano, end-to-end, from smart contracts to front-end applications using Aiken and Mesh SDK.
displayed_sidebar: bootcampSidebar
---

# Hello Cardano

This course takes you from zero to building full-stack applications on Cardano. Through 10 hands-on lessons, you will write smart contracts with [Aiken](https://aiken-lang.org/), build transactions with the [Mesh SDK](https://meshjs.dev/), and deploy working applications on the Cardano blockchain.

By the end of this course, you will have practical experience with wallets, transactions, smart contract development, testing, and Layer 2 scaling.

## Prerequisites

- **TypeScript**: Basic familiarity with TypeScript is expected. The course focuses on Cardano concepts, not language fundamentals.
- **Node.js v24+**: Required for running lesson code. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node versions.
- **No blockchain experience required**: Each lesson builds on the previous one, starting from the basics.

## Course Outline

### Lesson 1: Hello World
Set up the Mesh SDK, create a wallet with `MeshWallet`, and send your first lovelace transaction using `MeshTxBuilder`.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/01-wallet-send-lovelace)

### Lesson 2: Multi-signature Transactions
Build multi-signature transactions to mint tokens using native scripts and set up a NextJS frontend to interact with the Cardano blockchain.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/02-multisig)

### Lesson 3: Aiken Contracts
Learn Aiken smart contract fundamentals, including minting, spending, and withdrawal validators with transaction context.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/03-aiken-contracts)

### Lesson 4: Contract Testing
Test Aiken smart contracts using mock transactions, the mocktail library, and dynamic failure case generation with `aiken check`.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/04-contract-testing)

### Lesson 5: Avoid Redundant Validation
Reduce on-chain costs by centralizing common validation logic in a withdrawal script using the withdraw-zero pattern.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/05-avoid-redundant-validation)

### Lesson 6: Interpreting Blueprint
Interpret CIP-57 Plutus blueprints from Aiken contracts and generate TypeScript off-chain code using the Mesh SDK.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/06-interpreting-blueprint)

### Lesson 7: Vesting Contract
Build a vesting smart contract that locks funds and allows the beneficiary to withdraw after a lockup period.
[Source code](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/07-vesting)

### Lesson 8: Plutus NFT Contract
Create a Plutus NFT contract with multiple validators, oracle tokens, and automatically incremented indexes for non-fungibility.

### Lesson 9: End-to-End Hydra
Explore Hydra, Cardano's Layer 2 scaling solution, through an end-to-end tutorial on state channels between two participants.

### Lesson 10: Web3 Services
Integrate wallet-as-a-service and transaction sponsorship to onboard users seamlessly into your Cardano application.

## Tools and Resources

- **[Aiken](https://aiken-lang.org/)**: A language for writing efficient Cardano smart contracts.
- **[Mesh SDK](https://meshjs.dev/)**: A TypeScript SDK for building transactions and interacting with the Cardano blockchain.
- **[Blockfrost](https://blockfrost.io/)**: A blockchain API provider for querying the Cardano network.
- **[Cardano Preprod Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)**: Get test lovelace for development.

## Source Code

All source code for this course is available on [GitHub](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes).

## Get Started

Begin with [Lesson 1: Hello World](./01-wallet-send-lovelace) to set up your environment and send your first transaction.
