---
title: Blockchain Theory
description: Build the conceptual foundation you need to understand Cardano development — from cryptography and consensus to smart contracts, tokens, and governance.
---

# Blockchain Theory

_Adapted from [Cardano Builders](https://cardanobuilders.github.io)._

This course gives web2 developers the conceptual foundation they need before writing their first line of blockchain code. Through 15 lessons organized in 6 modules, you will learn how blockchains work, why Cardano makes the design choices it does, and how familiar web2 concepts map to web3 equivalents.

By the end of this course, you will understand UTXOs, consensus, smart contract validators, native tokens, DeFi primitives, and Cardano governance — all explained through the lens of concepts you already know: REST APIs, databases, JWT, Git, and more.

## Prerequisites

- **Web development experience**: Familiarity with HTTP, REST APIs, databases, and authentication concepts.
- **No blockchain experience required**: Every concept is explained from first principles with web2 analogies.
- **No coding required**: This is a theory course. For hands-on coding, see the [Hello Cardano Course](./practical-overview.md).

## Course Outline

| # | Lesson | Description |
|---|--------|-------------|
| | **Module 1: Foundations** | |
| 1 | [What is a Blockchain?](./theory/01-what-is-blockchain.md) | Distributed ledgers, decentralization, immutability, and the trust problem |
| 2 | [Cryptographic Primitives](./theory/02-cryptographic-primitives.md) | Hash functions, Merkle trees, and digital signatures |
| 3 | [Consensus Mechanisms](./theory/03-consensus-mechanisms.md) | Proof of Work vs Proof of Stake, Cardano's Ouroboros protocol |
| 4 | [The UTXO Model](./theory/04-utxo-model.md) | Extended UTXO vs account model, deterministic transactions |
| | **Module 2: Wallets, Keys & Identity** | |
| 5 | [Wallets, Keys, and Addresses](./theory/05-wallets-keys-addresses.md) | Public/private keys, mnemonic phrases, HD wallets, Cardano address types |
| 6 | [Transactions](./theory/06-transactions.md) | Inputs, outputs, fees, metadata, and the transaction lifecycle |
| | **Module 3: Smart Contracts** | |
| 7 | [Smart Contracts Conceptually](./theory/07-smart-contracts.md) | Validators, on-chain vs off-chain code, Cardano vs Ethereum |
| 8 | [Plutus, Aiken, and Languages](./theory/08-smart-contract-languages.md) | UPLC, Plutus Tx, Aiken, and execution costs |
| 9 | [Datum, Redeemer, and ScriptContext](./theory/09-datum-redeemer-context.md) | The three validator arguments and common contract patterns |
| | **Module 4: Tokens & Digital Assets** | |
| 10 | [Native Tokens and Minting Policies](./theory/10-native-tokens.md) | Policy IDs, minting policies, fungible vs NFT |
| 11 | [DeFi Concepts for Developers](./theory/11-defi-concepts.md) | DEXes, AMMs, liquidity pools, oracles, eUTXO design challenges |
| | **Module 5: Infrastructure & Network** | |
| 12 | [Stake Pools, Delegation, and Network](./theory/12-stake-pools-delegation.md) | Nodes, SPOs, delegation, rewards, and saturation |
| 13 | [Developer Infrastructure](./theory/13-developer-infrastructure.md) | Blockfrost, Koios, Maestro, chain indexers, and testnets |
| | **Module 6: Security & Governance** | |
| 14 | [Blockchain Security](./theory/14-blockchain-security.md) | 51% attacks, smart contract vulnerabilities, formal verification |
| 15 | [Cardano Governance](./theory/15-cardano-governance.md) | CIP-1694, Voltaire, DReps, Constitutional Committee, Intersect |

## Get Started

Begin with [Lesson 1: What is a Blockchain?](./theory/01-what-is-blockchain.md) to understand the fundamental problem that blockchains solve.
