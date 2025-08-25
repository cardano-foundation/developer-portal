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

**Transaction outputs** include an address (like a lock) and a value. The cryptographic signature acts as the key to unlock the output.

**Transaction inputs** are outputs from previous transactions, containing a pointer to the previous output and the cryptographic signature to unlock it.

Each UTXO can only be consumed once and as a whole which introduces the concept of 'change', just like cash transactions where you can't split a bill into smaller pieces.

In summary, transactions consume unspent outputs from previous transactions, and produce new outputs that can be used as inputs for future transactions. Users' wallets manage these UTXOs and initiate transactions involving the UTXOs owned by the user. Every node maintains a record of all currently unspent transaction outputs (UTXOs), called the UTXO set. In technical terms, this is the chainstate, which is stored in the data directory of every node and updated with each new block.

### Cardano's EUTXO Innovation

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

### Key Advantages for Developers

**Predictable Fees**: Transaction costs can be calculated precisely off-chain before submission and avoid gas spikes.

**Deterministic Validation**: Transaction success depends only on the transaction itself and its inputs. If inputs are available when validated, the transaction is guaranteed to succeed. This contrasts with account-based models, where a transaction can fail mid-script execution. This can never happen in the EUTXO model.

**Parallelization**: Transactions can be processed in parallel as long as they don't consume the same inputs, offering superior scalability.

**Local State**: Unlike account-based models where every transaction affects global state, EUTXO validation occurs locally, preventing many classes of errors and attacks.

### Important Development Considerations

The UTXO model's graph structure is fundamentally different from the account-based model used by existing smart-contract enabled blockchains. As a result, **design patterns that work for DApps on account-based blockchains do not translate directly to Cardano**. New design patterns are utilized because the underlying representation of data is different.

To maximize parallelism and scaling benefits, it is essential to build DApps and solutions using multiple UTXOs. This approach splits logic across different branches, similar to how Bitcoin services split wallets into sub-wallets for better performance.

## TPS vs. eUTxO

Which is better, high transactions per second or eUTxO?  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/wDmLVMmevNQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Transactions

Learn what is inside the guts of a Cardano transaction. We show how unsigned and signed transactions look like, and we cover how signing works.  
<iframe width="100%" height="325" src="https://www.youtube.com/embed/OSNf1MgAbII" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Transaction Fees

Understand how transaction fees are calculated on Cardano. Brief coverage of the topics reserve and treasury.  
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

#### Payment and Delegation Components

Shelley addresses contain two distinct parts:

**Payment Part**: Controls fund ownership. Spending requires a witness (signature or script validation) proving control over this component.

**Delegation Part**: Controls stake rights associated with funds. This can be:

- A stake key hash (direct delegation)
- A pointer to an on-chain stake registration certificate (compact representation)
- Empty (enterprise addresses with no stake rights)

**Mangled addresses** allow payment and delegation parts to be controlled by different entities, enabling separation of fund control and staking rights.

### Address Types

Cardano supports 11 different address types across three main categories:

#### Shelley Address Types

**Base Addresses** directly specify the staking key controlling stake rights. The staking rights can be exercised by registering the stake key and delegating to a stake pool. Base addresses can be used in transactions without prior stake key registration.

**Pointer Addresses** indirectly specify staking keys by referencing a location on the blockchain where a stake key registration certificate exists. Pointers are considerably shorter than stake key hashes. If the referenced certificate is lost due to rollback, pointer addresses remain valid for payments but lose stake participation rights.

**Enterprise Addresses** carry no stake rights, allowing users to opt out of proof-of-stake participation. Exchanges and organizations holding ada on behalf of others often use these to demonstrate they don't exercise stake rights. These addresses can still receive, hold, and send native tokens.

**Reward Account Addresses** distribute rewards for proof-of-stake participation. They use account-style (not UTXO-style) accounting, cannot receive funds via transactions, and have a one-to-one correspondence with registered staking keys.

#### Legacy Byron Addresses

Byron addresses are legacy addresses from Cardano's Byron era, using CBOR encoding and Base58 representation. They have no stake rights and are maintained for backward compatibility.

#### Technical Overview

**Shelley Addresses** (8 types):

- Types 0-3: Base addresses with different key/script credential combinations
- Types 4-5: Pointer addresses referencing on-chain certificates
- Types 6-7: Enterprise addresses with no delegation rights

**Stake Addresses** (2 types):

- Types 14-15: Reward addresses for stake distribution

**Byron Addresses** (1 type):  

- Type 8: Legacy addresses from the Byron era

For complete technical specifications including binary format details, see [CIP-19](https://cips.cardano.org/cip/CIP-19).

### Specialized Address Types

#### Pointer Addresses

Learn and dive into CPS-0002 which focuses on Pointer Addresses.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/XKgmP1r_GSA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

#### Franken Addresses

Franken Addresses are a way to register additional pledge to a pool without registering a second owner on the blockchain.
<iframe width="100%" height="325" src="https://www.youtube.com/embed/KULzovfWn-M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>
