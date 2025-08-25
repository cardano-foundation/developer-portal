---
id: core-blockchain-fundamentals
title: Core Blockchain Fundamentals
sidebar_label: Core Blockchain Fundamentals
description: Learn the core blockchain fundamentals behind Cardano including EUTXO, transactions, addresses, and fees.
image: /img/og/og-getstarted-technical-concepts.png
---

## Introduction to Cardano: the big picture

Learn fundamental terms like blockchain, consensus, decentralization delegation and incentives. Understand the big picture of Cardano and why stake pools are so important.

Developing Cardano is no small feat. There is no other project that has ever been built to these parameters, combining peer reviewed cryptographic research with an implementation in highly secure Haskell code.

This is not the copy and paste code seen in so many other blockchains. Instead, Cardano was designed with input from a large global team including leading experts and professors in the fields of computer programming languages, network design and cryptography.

We are extremely proud of Cardano, which required a months-long meticulous and painstaking development process by our talented engineers.

If you haven't seen it yet, watch the legendary whiteboard video from 2017. Some details are a bit outdated, but it is still worth seeing to understand what Cardano is and where Cardano came from.

<iframe width="100%" height="325" src="https://www.youtube.com/embed/Ja9D0kpksxw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<iframe width="100%" height="325" src="https://www.youtube.com/embed/zJUJG6V0Y1o" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br/><br/>

## Extended Unspent Transaction Output (EUTXO)

Cardano is an Unspent Transaction Output (UTXO)-based blockchain, which utilizes a different accounting model for its ledger from other account-based blockchains like Ethereum. Cardano implements an innovative Extended Unspent Transaction Output (EUTXO) model to support multi-assets and smart contracts while maintaining the core advantages of the UTXO approach.

### Understanding the UTXO Foundation

In a UTXO model, the movement of assets is recorded as a directed graph where transactions consume some UTXOs and create new ones. Think of UTXOs like physical cash - if you have $50, it might be composed of different bill combinations, but the total remains the same. Similarly, your wallet balance is the sum of all unspent UTXOs from previous transactions.

**Transaction outputs** include an address (spending conditions) and a value (assets). Each output has a unique identifier composed of the transaction hash that created it plus its position within that transaction.

**Transaction inputs** reference previous outputs using this unique identifier: the transaction hash and output index. To spend an input, you must provide witnesses (signatures or script validations) that satisfy the spending conditions.

Each UTXO can only be consumed once and as a whole which introduces the concept of 'change', just like cash transactions where you can't split a bill into smaller pieces.

### Atomic Transactions and Genesis Bootstrap

Transactions are atomic operations - either all changes are applied successfully, or none are applied at all. This all-or-nothing approach ensures consistency and prevents partial state updates that could corrupt the ledger.

This creates an interesting bootstrapping question: if inputs reference previous outputs, where do the first outputs come from? The answer is the **genesis configuration** - an initial agreed-upon state that creates the first UTXOs without requiring inputs.

### UTXO Set Management

Every node maintains a complete record of all currently unspent transaction outputs (UTXOs), called the UTXO set or chainstate. This is stored locally and updated with each new block. Your wallet balance is the sum of all UTXOs you control, and wallet software manages these UTXOs to construct new transactions.

### Cardano's EUTXO Innovation

EUTXO extends the basic UTXO model in two critical ways:

1. Instead of restricting addresses to simple public key signatures, EUTXO allows addresses to contain complex logic in the form of scripts that determine spending conditions.

2. Outputs can carry arbitrary data (datum) in addition to addresses and values, enabling scripts to maintain and access local state of a UTxO.

The EUTXO model combines:

- Smart Contracts (Validator scripts) that define arbitrary validation logic for different conditions like spending, minting, withdrawing etc.
- Datums: Data stored/attached to outputs (UTxO) to carry state
- Redeemers: User-supplied arguments passed to scripts during validation
- Context: Transaction information available to scripts during validation

<iframe width="100%" height="325" src="https://www.youtube.com/embed/bfofA4MM0QE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

:::info
Deep dive into [Cardano's EUTXO accounting model here](https://ucarecdn.com/3da33f2f-73ac-4c9b-844b-f215dcce0628/EUTXOhandbook_for_EC.pdf).
:::

### eUTxO Advantages for Developers

**Parallelization**: Transactions can be processed in parallel as long as they don't consume the same inputs, offering superior scalability. The level of concurrency is limited only by the degree of contention for shared UTXOs.

**Local State**: Unlike account-based models where every transaction affects global state, EUTXO validation occurs locally, preventing many classes of errors and attacks.

**Predictable Fees**: Transaction costs can be calculated precisely off-chain before submission. Unlike other blockchains where network activity can influence gas costs, Cardano's fees are deterministic and fixed at transaction creation time.

**Deterministic Validation**: Transaction success depends only on the transaction itself and its inputs. Users can predict locally (off-chain) how their transaction will impact the ledger state without encountering unexpected validation failures, fees, or state updates. If inputs are available when validated, the transaction is guaranteed to succeed. This contrasts with account-based models, where a transaction can fail mid-script execution.

### Important Development Considerations

The UTXO model's graph structure is fundamentally different from the account-based model used by existing smart-contract enabled blockchains. As a result, **design patterns that work for DApps on account-based blockchains do not translate directly to Cardano**. New design patterns are utilized because the underlying representation of data is different.

#### Concurrency and State Management

To maximize parallelism and scaling benefits, developers must architect DApps using multiple UTXOs rather than relying on single shared state. This fundamental shift requires:

**Multiple UTXOs Design**: Smart contracts should split their on-chain state across many UTXOs rather than concentrating it in a single location. This increases concurrency by allowing multiple users to interact with different parts of the contract simultaneously.

**Avoiding Contention**: Since each UTXO can only be spent once, multiple users trying to access the same UTXO creates contention. Proper design distributes interactions across different UTXOs to minimize this bottleneck.

**Parallelization Strategy**: By splitting logic across different branches, applications can achieve greater parallelism. This approach is similar to how Bitcoin services split wallets into sub-wallets for better performance.

The key insight is that **single on-chain state patterns from account-based systems will not achieve concurrency on Cardano**. Instead, developers embrace the EUTXO model's strengths by designing for distributed state and parallel execution from the ground up.

## TPS vs. eUTxO

Which is better, high transactions per second or eUTxO?  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/wDmLVMmevNQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Transactions

Cardano transactions are deterministic by design, meaning their behavior and outcomes can be predicted before execution. This predictability extends to validation results, fees, and ledger state changes.

### Transaction Validation

Transaction validation on Cardano uses scripts (pieces of code) that implement pure functions returning True or False. Script validation occurs for several actions:

- **Spending UTXOs**: Scripts validate whether UTXOs can be consumed
- **Minting tokens**: Policy scripts control token creation
- **Reward withdrawal**: Scripts govern stake reward claims
- **Certificate applications**: Scripts validate delegation and registration certificates

Each transaction specifies all arguments passed to scripts during validation, including user-provided redeemers that serve different purposes depending on the script logic.

### Deterministic Outcomes

The predictable nature of Cardano transactions is ensured by several key factors:

- Scripts always terminate and return consistent results for the same inputs
- Transactions fix all arguments passed to the script interpreter
- All required script validations are specified in the transaction
- Cryptographic signatures prevent transaction tampering
- EUTXO model ensures deterministic ledger state updates

Whether scripts succeed or fail, the outcome and associated ledger changes are predictable for any given transaction.

### Transaction Anatomy and CBOR Format

At the lowest level, Cardano transactions are binary data encoded using CBOR (Concise Binary Object Representation), a format similar to "binary JSON" that provides compact serialization while maintaining structure.

#### CBOR and Cardano Specifications

CBOR allows Cardano to define precise transaction formats in the ledger specifications using CDDL (Concise Data Definition Language). Each Cardano era has its own specification document that defines the exact structure transactions must follow - any deviation causes rejection.

Understanding CBOR becomes crucial when debugging transaction failures, as blockchain explorers typically show processed data rather than the raw transaction structure that nodes actually validate.

#### Transaction Structure

A complete transaction consists of four main components:

```
transaction = [
  transaction_body,      // Core transaction data
  transaction_witness_set, // Signatures and scripts  
  validity_flag,         // Transaction validity
  auxiliary_data         // Metadata (optional)
]
```

**Transaction Body** contains:

- **Inputs** (field 0): References to UTXOs being spent
- **Outputs** (field 1): New UTXOs being created  
- **Fee** (field 2): Transaction cost in lovelace
- **Script Data Hash** (field 11): Hash of redeemers and datums for script validation
- **Collateral** (field 13): UTXOs spent if script validation fails
- **Other fields**: Time validity, minting, certificates, etc.

**Transaction Witness Set** contains:

- **Signatures** (field 0): Cryptographic proofs of authorization
- **Plutus Scripts** (field 3): Smart contract code being executed
- **Plutus Data** (field 4): Unhashed datums referenced in the transaction
- **Redeemers** (field 5): Arguments passed to script execution

#### Implications

**Input Ordering**: Inputs are automatically sorted lexicographically by (transaction_id, index), not by the order you specify. This affects redeemer indexing.

**Script Data Hash**: Any change to redeemers, datums, or protocol parameters requires recalculating this hash. Transaction libraries handle this automatically.

**Two-Phase Validation**: Phase 1 validates basic transaction structure, Phase 2 executes scripts. If Phase 2 fails, collateral is consumed as penalty.

For complete technical specifications and debugging tools, see the [Cardano Ledger Specifications](https://github.com/IntersectMBO/cardano-ledger) and [Lace Anatomy](https://laceanatomy.com/) for decoding raw transactions.

### Validity Intervals and Time

Smart contract execution on Cardano is fully deterministic, which raises an interesting challenge: how to handle time-dependent logic? Since asking for "current time" would break determinism, Cardano uses **validity intervals** to introduce time constraints.

#### How Validity Intervals Work

Transactions can specify a time window during which they're considered valid:

- **Lower bound**: Transaction valid only after this time
- **Upper bound**: Transaction expires after this time

These intervals are checked during Phase 1 validation, before script execution. This means validators can assume the transaction is within the specified time bounds, enabling deterministic time-based logic.

#### Practical Applications

**Time-locked contracts**: Record a deadline in the datum and check that the transaction's lower bound exceeds that deadline.

**Auction deadlines**: Set an upper bound so bids can only be placed before the auction ends.

### Transaction Latency vs Finality

Understanding the difference between when a transaction appears on-chain versus when it becomes permanent is crucial for dApp development.

**Latency**: Time for a transaction to appear in a block (~20 seconds average block time).

**Finality**: Time for a transaction to become immutable and irreversible. This depends on:

- Network conditions and adversarial stake proportion
- Number of confirmations required (Risk tolerance of your application)

For most applications, waiting 6-20 confirmations provides really strong finality guarantees. High-value transactions may require more confirmations, while small transactions might accept fewer.

<iframe width="100%" height="325" src="https://www.youtube.com/embed/OSNf1MgAbII" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Transaction Fees

Transaction fees on Cardano are deterministic and predictable, calculated using a simple linear formula based on transaction size and computational resources required. This approach ensures users can calculate exact fees before submitting transactions, avoiding the unpredictable fee spikes seen on other blockchains.

### Fee Structure and Formula

Cardano uses a straightforward fee calculation: **fee = a × size(tx) + b**

Where:

- **a**: Protocol parameter reflecting the cost per byte of transaction data
- **b**: Fixed base fee applied to every transaction regardless of size  
- **size(tx)**: Transaction size in bytes

### Protocol Parameters and Economic Security

Both parameters `a` and `b` serve crucial economic and security purposes:

**Parameter `a`** covers the resource costs of processing and storing larger transactions. As transaction size increases, more computational and storage resources are required, making this scaling factor essential for covering operational costs.

**Parameter `b`** provides a base security layer against economic attacks, particularly Distributed Denial-of-Service (DDoS) attacks. By requiring a minimum fee regardless of transaction size, it becomes prohibitively expensive for attackers to flood the network with millions of small transactions.

### Fee Distribution Model

Unlike many blockchains where fees go directly to block producers, Cardano uses a unique pooled distribution system. Transaction fees are collected and distributed among all stake pools that produced blocks during an epoch, regardless of which specific pool processed each transaction. This approach promotes network stability and fair reward distribution.

### Economic Attack Prevention

The fee structure prevents economic attacks where system operator costs exceed user fees. Without proper fee alignment, users could impose costs on operators without paying proportionally, potentially leading to reduced participation and system instability. Cardano's parameters are designed to ensure fees cover both processing and long-term storage costs.

<iframe width="100%" height="325" src="https://www.youtube.com/embed/lpSIpPWp7H8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Guaranteed Transaction Delivery

How dropped transactions happen on cardano and how to ensure we always deliver them into blocks.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/gm-phCUGEoY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Addresses

Cardano addresses are used as destinations to send ada on the blockchain. Understanding their structure and types is fundamental to working with the Cardano ecosystem.

<iframe width="100%" height="325" src="https://www.youtube.com/embed/NjPf_b9UQNs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Address Construction and Structure

Cardano addresses are blake2b-224 hash digests of relevant verifying/public keys concatenated with metadata. They are binary sequences consisting of a one-byte header and variable-length payload:

- **Header**: Contains address type information (bits 7-4) and network tags (bits 3-0) distinguishing mainnet from testnet
- **Payload**: The raw or encoded data containing the actual address information

#### Encoding Formats

**Shelley addresses** use Bech32 encoding with human-readable prefixes:

- `addr` for mainnet addresses
- `addr_test` for testnet addresses  
- `stake` for mainnet reward addresses
- `stake_test` for testnet reward addresses

**Byron addresses** use Base58 encoding for backward compatibility, making them easily distinguishable from newer addresses.

#### Key Types and Their Purposes

Cardano uses two main types of Ed25519 keys, each serving distinct purposes:

**Payment Keys**: Used to sign transactions involving fund transfers, minting tokens, and interacting with smart contracts. The payment verification (public) key is used to derive addresses that can receive and send ada and native tokens.

**Stake Keys**: Used to sign staking-related transactions including stake address registration, delegation to stake pools, and reward withdrawals. Stake keys enable participation in Cardano's proof-of-stake consensus mechanism.

#### Payment and Delegation Components

Shelley addresses contain two distinct parts:

**Payment Part**: Controls fund ownership. Spending requires a witness (signature or script validation) proving control over this component. This is typically derived from a payment verification key.

**Delegation Part**: Controls stake rights associated with funds. This can be:

- A stake key hash (direct delegation)
- A pointer to an on-chain stake registration certificate (compact representation)
- Empty (enterprise addresses with no stake rights)

**Franken addresses** allow payment and delegation parts to be controlled by different entities, enabling separation of fund control and staking rights.

Franken Addresses are a way to register additional pledge to a pool without registering a second owner on the blockchain.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/KULzovfWn-M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Address Types

Cardano supports different address types across categories:

#### Shelley Address Types

**Base Addresses** directly specify the staking key controlling stake rights. The staking rights can be exercised by registering the stake key and delegating to a stake pool. Base addresses can be used in transactions without prior stake key registration.

**Enterprise Addresses** carry no stake rights, allowing users to opt out of proof-of-stake participation. Exchanges and organizations holding ada on behalf of others often use these to demonstrate they don't exercise stake rights. These addresses can still receive, hold, and send native tokens.

**Reward Account Addresses** distribute rewards for proof-of-stake participation. They use account-style (not UTXO-style) accounting, cannot receive funds via transactions, and have a one-to-one correspondence with registered staking keys.

**Pointer Addresses** indirectly specify staking keys by referencing a location on the blockchain where a stake key registration certificate exists. Pointers are considerably shorter than stake key hashes. If the referenced certificate is lost due to rollback, pointer addresses remain valid for payments but lose stake participation rights.

Learn and dive into CPS-0002 which focuses on Pointer Addresses.

<iframe width="100%" height="325" src="https://www.youtube.com/embed/XKgmP1r_GSA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

#### Legacy Byron Addresses

Byron addresses are legacy addresses from Cardano's Byron era, using CBOR encoding and Base58 representation. They have no stake rights and are maintained for backward compatibility.

**Important Limitation**: Byron addresses are **not allowed in transactions that contain Plutus scripts**. This means smart contracts will never encounter Byron addresses during validation. If you're working with dApps, ensure all addresses are Shelley-era addresses to avoid transaction failures.

For complete technical specifications including binary format details, see [CIP-19](https://cips.cardano.org/cip/CIP-19).
