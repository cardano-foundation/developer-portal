---
id: eutxo
title: Extended UTXO Model
sidebar_label: EUTXO Model
description: Understanding Cardano's Extended UTXO (EUTXO) accounting model and how it differs from other blockchains.
image: /img/og/og-getstarted-technical-concepts.png
---

Cardano is an Unspent Transaction Output (UTXO)-based blockchain, which utilizes a different accounting model for its ledger from other account-based blockchains like Ethereum. Cardano implements an innovative Extended Unspent Transaction Output (EUTXO) model to support multi-assets and smart contracts while maintaining the core advantages of the UTXO approach.

## Understanding the UTXO Foundation

In a UTXO model, the movement of assets is recorded as a directed graph where transactions consume some UTXOs and create new ones. Think of UTXOs like physical cash - if you have $50, it might be composed of different bill combinations, but the total remains the same. Similarly, your wallet balance is the sum of all unspent UTXOs from previous transactions.

**Transaction outputs** include an address (spending conditions) and a value (assets). Each output has a unique identifier composed of the transaction hash that created it plus its position within that transaction.

**Transaction inputs** reference previous outputs using this unique identifier: the transaction hash and output index. To spend an input, you must provide witnesses (signatures or script validations) that satisfy the spending conditions.

Each UTXO can only be consumed once and as a whole which introduces the concept of 'change', just like cash transactions where you can't split a bill into smaller pieces.

## Atomic Transactions and Genesis Bootstrap

Transactions are atomic operations - either all changes are applied successfully, or none are applied at all. This all-or-nothing approach ensures consistency and prevents partial state updates that could corrupt the ledger.

This creates an interesting bootstrapping question: if inputs reference previous outputs, where do the first outputs come from? The answer is the **genesis configuration** - an initial agreed-upon state that creates the first UTXOs without requiring inputs.

## UTXO Set Management

Every node maintains a complete record of all currently unspent transaction outputs (UTXOs), called the UTXO set or chainstate. This is stored locally and updated with each new block. Your wallet balance is the sum of all UTXOs you control, and wallet software manages these UTXOs to construct new transactions.

## Cardano's EUTXO Innovation

EUTXO extends the basic UTXO model in two critical ways:

1. Instead of restricting addresses to simple public key signatures, EUTXO allows addresses to contain complex logic in the form of scripts that determine spending conditions.

2. Outputs can carry arbitrary data (datum) in addition to addresses and values, enabling scripts to maintain and access local state of a UTxO.

The EUTXO model combines:

- Smart Contracts (Validator scripts) that define arbitrary validation logic for different conditions like spending, minting, withdrawing etc.
- Datums: Data stored/attached to outputs (UTxO) to carry state
- Redeemers: User-supplied arguments passed to scripts during validation
- Context: Transaction information available to scripts during validation

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/bfofA4MM0QE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

:::info
Deep dive into [Cardano's EUTXO accounting model here](https://ucarecdn.com/3da33f2f-73ac-4c9b-844b-f215dcce0628/EUTXOhandbook_for_EC.pdf).
:::

## eUTxO Advantages for Developers

**Parallelization**: Transactions can be processed in parallel as long as they don't consume the same inputs, offering superior scalability. The level of concurrency is limited only by the degree of contention for shared UTXOs.

**Local State**: Unlike account-based models where every transaction affects global state, EUTXO validation occurs locally, preventing many classes of errors and attacks.

**Predictable Fees**: Transaction costs can be calculated precisely off-chain before submission. Unlike other blockchains where network activity can influence gas costs, Cardano's fees are deterministic and fixed at transaction creation time.

**Deterministic Validation**: Transaction success depends only on the transaction itself and its inputs. Users can predict locally (off-chain) how their transaction will impact the ledger state without encountering unexpected validation failures, fees, or state updates. If inputs are available when validated, the transaction is guaranteed to succeed. This contrasts with account-based models, where a transaction can fail mid-script execution.

**Zero-Knowledge Proof Compatibility**: EUTXO's deterministic nature makes it ideal for zero-knowledge scaling solutions. Since transaction outcomes are deterministic and predictable, you can execute complex computations off-chain and generate proofs against known state. The proof can then be verified on-chain without re-executing the computation. This contrasts with account-based models where global state changes unpredictably, making it difficult to construct valid ZK proofs since the state may change between proof generation and verification.

## TPS vs. eUTxO

Which is better, high transactions per second or eUTxO?
<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/wDmLVMmevNQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Important Development Considerations

The UTXO model's graph structure is fundamentally different from the account-based model used by existing smart-contract enabled blockchains. As a result, **design patterns that work for DApps on account-based blockchains do not translate directly to Cardano**. New design patterns are utilized because the underlying representation of data is different.

### Concurrency and State Management

To maximize parallelism and scaling benefits, developers must architect DApps using multiple UTXOs rather than relying on single shared state. This fundamental shift requires:

### Multiple UTXOs Design

Smart contracts should split their on-chain state across many UTXOs rather than concentrating it in a single location. This increases concurrency by allowing multiple users to interact with different parts of the contract simultaneously.

### Avoiding Contention

Since each UTXO can only be spent once, multiple users trying to access the same UTXO would create contention just like the account-based system on Ethereum and the UTxO model would lose its meaning. Proper design distributes interactions across different UTXOs to minimize this bottleneck.

### Parallelization Strategy

By splitting logic across different branches, applications can achieve greater parallelism. This approach is similar to how Bitcoin services split wallets into sub-wallets for better performance.

The key insight is that **single on-chain state patterns from account-based systems will not achieve concurrency on Cardano**. Instead, developers embrace the EUTXO model's strengths by designing for distributed state and parallel execution from the ground up.

---

## Next Steps

- Learn about [Transactions](/docs/get-started/technical-concepts/transactions) and how they work in the EUTXO model
- Understand [Addresses](/docs/get-started/technical-concepts/addresses) on Cardano
- Build smart contracts using EUTXO: [Smart Contracts Overview](/docs/smart-contracts/)
