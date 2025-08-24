---
id: technical-concepts
title: Get started with the technical concepts
sidebar_label: Technical Concepts
description: Get started with the technical concepts behind Cardano.
image: /img/og/og-getstarted-technical-concepts.png
--- 

To get the most out of the Cardano Developer Portal, you should have programming experience and a basic understanding of blockchain concepts such as [EUTXO](#extended-unspent-transaction-output-eutxo), [transactions](#transactions), [addresses](#addresses), [key derivation](#key-derivation), and [networking](#networking).

## Core Blockchain Fundamentals

### Introduction to Cardano: the big picture

Learn fundamental terms like blockchain, consensus, decentralization delegation and incentives. Understand the big picture of Cardano and why stake pools are so important.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/zJUJG6V0Y1o" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br/><br/>

### Extended Unspent Transaction Output (EUTXO)

Cardano is an Unspent Transaction Output (UTXO)-based blockchain, which utilizes a different accounting model for its ledger from other account-based blockchains like Ethereum. Cardano implements an innovative Extended Unspent Transaction Output (EUTXO) model to support multi-assets and smart contracts while maintaining the core advantages of the UTXO approach.

#### Understanding the UTXO Foundation

In a UTXO model, the movement of assets is recorded as a directed graph where transactions consume some UTXOs and create new ones. Think of UTXOs like physical cash - if you have $50, it might be composed of different bill combinations, but the total remains the same. Similarly, your wallet balance is the sum of all unspent UTXOs from previous transactions.

**Transaction outputs** include an address (like a lock) and a value. The cryptographic signature acts as the key to unlock the output.

**Transaction inputs** are outputs from previous transactions, containing a pointer to the previous output and the cryptographic signature to unlock it.

Each UTXO can only be consumed once and as a whole which introduces the concept of 'change', just like cash transactions where you can't split a bill into smaller pieces.

In summary, transactions consume unspent outputs from previous transactions, and produce new outputs that can be used as inputs for future transactions. Users' wallets manage these UTXOs and initiate transactions involving the UTXOs owned by the user. Every node maintains a record of all currently unspent transaction outputs (UTXOs), called the UTXO set. In technical terms, this is the chainstate, which is stored in the data directory of every node and updated with each new block.

#### Cardano's EUTXO Innovation

EUTXO extends the basic UTXO model in two critical ways:

1. **Arbitrary Logic**: Instead of restricting addresses to simple public key signatures, EUTXO allows addresses to contain complex logic in the form of scripts that determine spending conditions.

2. **Rich Data**: Outputs can carry arbitrary data (datum) in addition to addresses and values, enabling scripts to maintain and access contract state.

The EUTXO model combines:

- **Smart contracts**: Lock UTXOs, ada, native assets, and NFTs
- **Redeemers**: User-supplied data to unlock locked assets
- **Datum**: Contract-specific data relevant to your application  
- **Context**: Transaction metadata available during validation

<iframe width="100%" height="325" src="https://www.youtube.com/embed/bfofA4MM0QE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

:::info
Deep dive into [Cardano's EUTXO accounting model here](https://ucarecdn.com/3da33f2f-73ac-4c9b-844b-f215dcce0628/EUTXOhandbook_for_EC.pdf).
:::

#### Key Advantages for Developers

**Predictable Fees**: Transaction costs can be calculated precisely off-chain before submission - no surprise gas spikes.

**Deterministic Validation**: Transaction success depends only on the transaction itself and its inputs. If inputs are available when validated, the transaction is guaranteed to succeed.

**Parallelization**: Transactions can be processed in parallel as long as they don't consume the same inputs, offering superior scalability.

**Local State**: Unlike account-based models where every transaction affects global state, EUTXO validation occurs locally, preventing many classes of errors and attacks.

This contrasts with account-based models (as used by Ethereum), where a transaction can fail mid-script execution. This can never happen in EUTXO - if all inputs are still present when validated, the transaction is guaranteed to succeed.

#### Important Development Considerations

The UTXO model's graph structure is fundamentally different from the account-based model used by existing smart-contract enabled blockchains. As a result, **design patterns that work for DApps on account-based blockchains do not translate directly to Cardano**. New design patterns are utilized because the underlying representation of data is different.

To maximize parallelism and scaling benefits, it is essential to build DApps and solutions using multiple UTXOs. This approach splits logic across different branches, similar to how Bitcoin services split wallets into sub-wallets for better performance.

### TPS vs. eUTxO

Which is better, high transactions per second or eUTxO?  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/wDmLVMmevNQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Transactions

Learn what is inside the guts of a Cardano transaction. We show how unsigned and signed transactions look like, and we cover how signing works.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/OSNf1MgAbII" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Transaction Fees

Understand how transaction fees are calculated on Cardano. Brief coverage of the topics reserve and treasury.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/lpSIpPWp7H8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Guaranteed Transaction Delivery

How dropped transactions happen on cardano and how to ensure we always deliver them into blocks.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/gm-phCUGEoY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Addresses

Cardano Addresses are used as destinations to send ada on the blockchain. We break them down into their parts and show how they're created.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/NjPf_b9UQNs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

#### Franken Addresses

Franken Addresses are a way to register additional pledge to a pool without registering a second owner on the blockchain.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/KULzovfWn-M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

#### Pointer Addresses

Learn and dive into CPS-0002 which focuses on Pointer Addresses.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/XKgmP1r_GSA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Wallet & Key Management

### Mnemonic seed phrase (BIP39)

BIP39 is the standard for creating a mnemonic seed phrase for wallets. In this video, we break down how it's created from randomness on Cardano.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/5P1jx1ELUHk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Key Derivation

Key Derivation is the process a wallet uses to go from a mnemonic phrase to a whole set of keys and addresses that the wallet controls.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/4tSQBK75CPU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Network & Communication

### Block and transaction propagation

Learn how transactions make it from the mempool into blocks and how blocks move around the network.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/K7c-5S-23dg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Networking

We answer your questions about how nodes on Cardano talk to each other. Learn about TCP Sockets,  mini-protocols and the future of P2P.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/pyhYtLgn1r0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### P2P Networking

Learn about Byron era network, Shelley era network, unidirectional (Half-Duplex) connections, the Topology Updater, manual P2P vs. automatic P2P.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/ek_DK6Qoqrc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Network Congestion

How does network congestion happen? What are mempool errors?
<iframe width="100%" height="325" src="https://www.youtube.com/embed/jxHFGPP1uc0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Assets & Smart Contracts

### NFT

Non-Fungible Tokens on cardano are native assets that represent immutable art or physical things.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/P-wQ0VymzKU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Multisig

What is multisig? And how does it work on Cardano?
<iframe width="100%" height="325" src="https://www.youtube.com/embed/k_ph_V7xkio" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### How to create a FT on Cardano that doesn't completely suck

Learn how to create fungible tokens on Cardano using StakePool Operator Scripts.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/pK7xShX9etI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Consensus & Staking

### Slot Lottery

In this video, we describe exactly how a stake pool on Cardano gets elected to make a block.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/M3Xq1qz3ljU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Slot Battles

On Cardano, slot battles happen when two pools try to make a block in the same slot (at the same time). We break down how the blockchain determines which block should win and what is the "correct" source of truth on the blockchain.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/Cm5pBM7UYa0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Epoch Nonce

The epoch nonce allows you to calculate leaderlogs for your stake pool on Cardano.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/vF82ZalZlcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Governance & Standards

### Cardano Improvement Proposals (CIP)

The [Cardano Improvement Proposal](https://cips.cardano.org/) (CIP) process allows the community to interact with the Cardano Foundation to improve the Cardano ecosystem in a formal way.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/z9wz_WJGGiQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Governance Snapshots

Learn how to take blockchain snapshots for Governance voting purposes.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/NI3_VeLwyxc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>
