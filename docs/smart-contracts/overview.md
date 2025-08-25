---
id: overview
slug: /smart-contracts/
title: Smart Contracts
sidebar_label: Overview
description: Learn how to create smart contracts on Cardano.
image: /img/og/og-developer-portal.png
--- 

![Smart Contracts](../../static/img/card-smart-contracts-title.svg)

## What are smart contracts?

Smart contracts are digital agreements defined in code that automate and enforce the terms of a contract without the need for intermediaries, enabling secure and transparent transactions on a blockchain. By leveraging predetermined conditions defined within the smart contract code, the state of a contract can only be updated in a way that follows the rules defined in that contract.

On the Cardano blockchain, the compiled code of smart contracts is stored on, and distributed across, the decentralised network. It is not possible to modify the rules of an existing smart contract, nor is it possible to decompile the stored smart contract code from its compiled state into the original source code.

## Introduction

As mentioned in the [general overview](/docs/get-started/), smart contracts on Cardano work a bit differently from how they do on other blockchains. The key to understanding smart contracts is to first understand the [eUTXO](/docs/get-started/technical-concepts/core-blockchain-fundamentals#extended-unspent-transaction-output-eutxo) model.

Smart contracts are more or less just a piece of code that you write to validate the movement of UTXOs locked in your contract's address. You will lock UTXOs at the address of your script and then the UTXOs can only ever be spent/moved if your script allows the transaction spending it to do so.

## Conceptual overview

Smart contracts consist of on-chain and off-chain components:

- The on-chain component (validator-script) is a script used to validate that each transaction containing any value locked by the script (UTXOs residing on the script's address) conforms to the rules of the contract. Specialised tools and languages are required for creating these scripts.
- The off-chain component is a script or application that is used to generate transactions that conform to the rules of the contract. These can be created in almost any language.

Important to note here is that smart contracts heavily rely on the datum attached to a UTXO, using it as part of the contract instance "state" to be used in further transactions. If no datum is attached to a UTXO residing on the contract's address, it can end up being locked there forever.

### On-Chain (Validator scripts)

Validator scripts are executed automatically when a UTXO residing at the address of the script is attempted to be moved by a transaction. These scripts take a transaction as its input and then outputs either true or false depending on whether the transaction is valid or not according to your rules/logic as defined in the script - thus blocking or allowing a transaction to succeed. If you are moving multiple UTXOs residing on the same script address, the validator-script will run once for each UTXO. This script execution happens on the Cardano node validating your transaction.

This means that in order for the validator-script to execute, a transaction must first move a UTXO to the address of the contract; the address is derived from the contract mathematically. You do not need to upload your contract to the chain, although that is also possible using reference scripts.

You might think of this initial transaction where you move a UTXO to the script address to be the initialisation of a contract instance. Each UTXO residing on the address of the contract can thus be seen as an instance of the contract. Note that there is no restriction on the UTXOs being sent to the script address: anyone can send a UTXO containing no datum, or a 'fake' datum.

### Off-Chain

The off-chain part is needed in order to locate UTXOs that are locked in your contract and generate transactions that are valid for moving them.

For contracts that require multiple steps to complete, it is common to encode the state of a contract inside of a datum using a specific schema of your own design that is then attached to each transaction. You would then create a 'thread' of UTXOs by designing a validator such that it only allows moving the UTXO to the script address so that the value of the UTXO remains locked in the new UTXO, but with a new datum/state.

## Technical overview

Smart contracts are validator scripts that enforce custom logic when UTXOs are spent. Think of them as parameterized mathematical functions that return true or false to determine transaction validity.

### Understanding Validators: The Mathematical Model

Validators work like mathematical functions with three inputs:

```
Script: f(datum, redeemer, context) = true | false
```

Consider the analogy of a simple function: `f(x) = x * a + b`

- **Script** is the function definition (`x * a + b`) - your validation logic
- **Datum** contains the parameters (`a` and `b`) - configuration data set when the UTXO is created
- **Redeemer** provides the argument (`x`) - user input provided when spending
- **Context** gives access to transaction details for validation

### The Three Script Arguments

#### Datum: Contract State

Data attached to UTXOs when they're created, carrying contract state between transactions. Datums enable complex state machines by preserving information that subsequent transactions can read and modify.

#### Redeemer: User Input  

Data provided by users when spending UTXOs. Redeemers drive state transitions by supplying the inputs needed to transform the current state (datum) into a new state.

#### Context: Transaction Information

Comprehensive information about the spending transaction, including inputs, outputs, signatures, fees, and other transaction properties. This allows scripts to make assertions about transaction structure and participants.

**Available Context Properties:**

| Property         | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| **inputs**       | Outputs to be spent                                            |
| **reference inputs** | Inputs used for reference only, not spent                       |
| **outputs**      | New outputs created by the transaction                          |
| **fees**         | Transaction fees                                               |
| **minted value** | Minted or burned value                                         |
| **certificates** | Digest of certificates contained in the transaction             |
| **withdrawals**  | Used to withdraw rewards from the stake pool                    |
| **valid range**  | A range of time in which the transaction is valid               |
| **signatories**  | A list of transaction signatures                                |
| **id**           | Transaction identification                                     |

### Script Purposes and Types

Scripts validate different operations depending on their purpose:

**Spending Scripts (spend)** - Validate UTXO consumption. These are the most common scripts and the only ones that receive datum information.

**Minting Scripts (mint)** - Control token creation and destruction through minting policies.

**Certificate Scripts (publish)** - Validate delegation and stake pool certificates.

**Withdrawal Scripts (withdraw)** - Control stake reward withdrawals.

**Governance Scripts (vote/propose)** - Validate governance votes and constitutional constraints on proposals.

**Native Scripts** - Cardano's "original" scripting language that predates Plutus, providing simple multisig and time-lock functionality through a minimal domain-specific language with constructs like "all-of", "any-of", and "after/before" time constraints.

### Deterministic Validation

Validators are fully deterministic - their execution depends only on the transaction context. This predictability allows you to verify transaction outcomes before submission, unlike systems where network conditions can affect execution.

## Contract Workflows

Understanding how scripts work in practice helps bridge the conceptual model with real implementation.

### Basic Contract Example

Let's trace through a simple secret-word contract that demonstrates the datum/redeemer relationship:

**Step 1: Create the Validator**
Write a script that validates permission to spend a UTxO from its address by comparing the hash of the redeemer provided in a transaction against the datum of the UTxO its trying to spend (locked UTxO):

```
validator(datum, redeemer, context):
  return hash(redeemer) == datum
```

**Step 2: Lock Funds**
Create a transaction that sends Ada to the script address with `datum = Hash("secret")`. This locks the funds under your validation logic.

**Step 3: Unlock Funds**
To spend the locked UTXO, provide `redeemer = "secret"`. The validator will hash the redeemer and compare it to the stored datum, allowing the transaction if they match.

This example illustrates the mathematical function model: `f("secret") = hash("secret") == Hash("secret")` returns `true`.

:::note
This is a simplified example. Real validators can implement any validation logic - not just hash comparisons.
:::

### Stateful Contracts

For contracts requiring multiple transactions, datums carry state between interactions:

**Example**: A simple counter that tracks the number of times it's been used:

```
validator(datum, redeemer, context):
  new_count = datum.count + 1
  return output_datum.count == new_count
```

Each transaction reads the current count from the datum, increments it, and ensures the output contains the updated count. This creates a chain of state transitions across multiple transactions.

## Takeaways

- Think of validators as mathematical functions that receive three inputs (datum, redeemer, context) and return true/false to allow/deny transactions.

- Datums carry contract state between transactions, while redeemers provide the inputs to drive state changes.

- Validators are predictable meaning the same inputs always produce the same result, allowing you to verify transaction outcomes before submission.

- Smart contracts require both on-chain validators and off-chain code to construct valid transactions. The off-chain component is equally critical for user experience.

## Programming languages

Cardano introduced smart contracts in 2021 and supports the development and deployment of smart contracts using multiple different languages.

:::tip
Writing well-designed smart contracts requires you to have a solid understanding of how Cardano works in general. So, make sure that everything on this page makes sense before you start creating contracts. Many topics are described in more detail on the [Technical Concepts](/docs/get-started/technical-concepts/overview) page as well.
:::

- [Aiken](smart-contract-languages/aiken) - for on-chain validator scripts only: a language & toolchain favouring developer experience.
- [OpShin](smart-contract-languages/opshin) - a programming language for generic Smart Contracts based on Python.
- [Plinth](smart-contract-languages/plinth) - a platform to write full applications that interact with the Cardano blockchain.
- [Plu-ts](smart-contract-languages/plu-ts) - Typescript-embedded smart contract programming language and a transaction creation library.
- [Scalus](smart-contract-languages/scalus) - a unified development platform for building Cardano DApps using Scala 3 for both on-chain smart contracts and off-chain logic.  
- [Marlowe](smart-contract-languages/marlowe) - a domain-specific language, it covers the world of financial contracts.
