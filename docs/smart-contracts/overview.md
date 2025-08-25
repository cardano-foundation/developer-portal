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

## Introduction

Smart contracts on Cardano work a bit differently from how they do on other blockchains. The key to understanding smart contracts is to first understand the [eUTXO](/docs/get-started/technical-concepts/core-blockchain-fundamentals#extended-unspent-transaction-output-eutxo) model.

Smart contracts are validator scripts that you write to validate the movement of UTXOs locked in your contract's address. You will lock UTXOs at the address of your script and then the UTXOs can only ever be spent/moved if your script allows the transaction spending it to do so.

## Conceptual overview

### Smart Contracts Are Validators, Not Actors

:::tip Mental Model Shift
The most important mental shift when coming to Cardano from other blockchains: **smart contracts cannot take actions**. They can only approve or deny proposed transactions.
:::

A Cardano smart contract cannot:

- "Send tokens" to another address
- "Call another contract"
- Initiate any action on its own

Instead, smart contracts **validate** that transactions do the things you want them to do. Users propose transactions, and contracts either approve or reject them based on the validation logic you define.

### Components

Smart contracts consist of on-chain and off-chain components:

- **On-chain component (validator-script)**: Validates that transactions spending from the contract address follow the contract's rules. This is the immutable logic that runs on every Cardano node.
- **Off-chain component**: Applications that construct valid transactions according to the contract rules. These can be built in any language and handle user interfaces, data fetching, and transaction building.

The off-chain component is equally critical - it's responsible for creating transactions that the on-chain validator will approve.

### On-Chain (Validator scripts)

Validator scripts are executed automatically when a UTXO residing at the address of the script is attempted to be moved by a transaction. These scripts take a transaction as its input and then outputs either true or false depending on whether the transaction is valid or not according to your rules/logic as defined in the script - thus blocking or allowing a transaction to succeed. If you are moving multiple UTXOs residing on the same script address, the validator-script will run once for each UTXO. This script execution happens on the Cardano node validating your transaction. Validator scripts run once per script input in the transaction.

This means that in order for the validator script to execute, a transaction must first move a UTXO to the address of the contract; the address is derived from the contract mathematically. Normally, only the script hash is stored on-chain. With CIP-33 reference scripts, you can include the full script in a UTXO so later transactions can reference it without including the full script code.

You might think of this initial transaction where you move a UTXO to the script address to be the initialisation of a contract instance. Each UTXO residing on the address of the contract can thus be seen as an instance of the contract. Note that there is no restriction on the UTXOs being sent to the script address: anyone can send a UTXO containing no datum, or an arbitrary datum.

### Off-Chain

The off-chain part is needed in order to locate UTXOs that are locked in your contract and generate transactions that are valid for moving them.

For contracts that require multiple steps to complete, it is common to encode the state of a contract inside of a datum using a specific schema of your own design that is then attached to each transaction. You would then create a 'thread' of UTXOs by designing a validator such that it only allows moving the UTXO to the script address so that the value of the UTXO remains locked in the new UTXO, but with a new datum/state.

## Technical overview

Smart contracts are validator scripts that enforce custom logic when UTXOs are spent. Think of them as parameterized mathematical functions that return true or false to determine transaction validity.

### Understanding Validators: The Mathematical Model

Validators work like mathematical functions with three inputs:

```text title="Validator Function Signature"
Script: f(datum, redeemer, context) = success | failure
```

Conceptually, you can think of validators as returning true/false, though under the hood they either succeed (returning unit `()`) or fail (throwing an error).

```mermaid
flowchart TD
    A[Transaction Submitted] --> B{Validator Execution}
    B --> C[Datum: Contract State]
    B --> D[Redeemer: User Input]
    B --> E[Context: Transaction Info]
    C --> F[Validation Logic]
    D --> F
    E --> F
    F --> G{Result}
    G -->|Success| H[Transaction Approved]
    G -->|Failure| I[Transaction Rejected]
    
    style C fill:#e1f5fe
    style D fill:#f3e5f5
    style E fill:#e8f5e8
    style H fill:#c8e6c9
    style I fill:#ffcdd2
```

Consider the analogy of a simple function: `f(x) = x * a + b`

- **Script** is the function definition (`x * a + b`) - your validation logic
- **Datum** contains the parameters (`a` and `b`) - configuration data set when the UTXO is created
- **Redeemer** provides the argument (`x`) - user input provided when spending
- **Context** gives access to transaction details for validation

### The Three Script Arguments

#### Datum: Contract State

Data attached to UTXOs when they're created that "locks" funds under specific conditions. Datums carry contract state between transactions, enabling complex state machines by preserving information that subsequent transactions can read and modify. When someone sends funds to a script address, they attach the datum to define the conditions under which the funds can be spent.

#### Redeemer: User Input  

Data provided by users when spending UTXOs that "unlocks" funds by satisfying the script's conditions. Redeemers drive state transitions by supplying the inputs needed to transform the current state (datum) into a new state. The redeemer must meet the validation logic specified by the script to successfully spend the locked funds.

#### Context: Transaction Information

Comprehensive information about the spending transaction, including inputs, outputs, signatures, fees, and other transaction properties. This allows scripts to make assertions about transaction structure and participants.

**Available Context Properties:**

| Property | Description |
| -------- | ----------- |
| **inputs** | Outputs to be spent |
| **reference inputs** | Inputs used for reference only, not spent |
| **outputs** | New outputs created by the transaction |
| **fee** | Transaction fee |
| **minted value** | Minted or burned value |
| **certificates** | Certificates for delegation, pool operations, governance roles, etc. |
| **withdrawals** | Used to withdraw rewards from stake pools |
| **valid range** | A range of time in which the transaction is valid |
| **signatories** | A list of transaction signatures |
| **required_signers** | Additional required signatures for script validation |
| **txId** | Transaction identification (hash) |
| **votes** | Governance votes (Conway era) |
| **proposal_procedures** | Governance proposals (Conway era) |

### Script Addresses

**Script Address**: A unique address derived from the hash of a smart contract (Plutus script binary). UTXOs sent to script addresses can only be spent when the originating script validates the spending transaction successfully.

**Script Hash Details**: Script addresses are derived from a 28-byte script hash that includes a language tag (`0x01` for PlutusV1, `0x02` for PlutusV2, `0x03` for PlutusV3). This means identical bytecode under different Plutus versions yields different addresses.

:::caution Address Collision
**Important insight**: The same contract code always produces the same address within the same Plutus version. If you deploy the exact same smart contract code that someone else has already deployed, you'll get the same address - and there may already be transaction history there! This is because the address is mathematically derived from the contract code itself.
:::

Unlike regular addresses controlled by private keys, script addresses are controlled by the logic defined in the smart contract code. This means:

- Anyone can send funds to a script address
- Only transactions that satisfy the script's validation logic can spend those funds
- The script executes automatically whenever someone attempts to spend UTXOs from its address
- Multiple developers deploying identical code will interact with the same contract address

### Collateral and Script Execution

**Collateral**: UTXOs that must be provided when executing Plutus scripts to cover potential execution costs if the script fails during validation.

When a transaction includes script execution:

- **Phase 1 Validation**: Basic transaction structure validation (inputs exist, signatures valid, etc.)
- **Phase 2 Validation**: Script execution and validation
- If Phase 2 fails, collateral UTXOs are consumed instead of regular transaction fees

**Collateral Requirements**:

- Must contain only ADA (no native tokens)
- Should be sufficient to cover script execution costs
- With Vasil upgrade: can specify change address to return excess collateral

### Script Purposes and Types

Scripts validate different operations depending on their purpose, as defined in the [Conway era ledger specification](https://github.com/IntersectMBO/cardano-ledger/blob/master/eras/conway/impl/cddl-files/conway.cddl):

**Spend Scripts** - Validate UTXO consumption. These are the most common scripts and the only ones that receive datum information.

**Mint Scripts** - Control token creation and destruction through minting policies.

**Publish Scripts** - Validate certificates including stake delegation, pool registration/retirement, DRep registration, committee changes, and other governance roles.

**Withdraw Scripts** - Control stake reward withdrawals.

**Vote Scripts** - Validate governance votes (introduced in Conway era).

**Propose Scripts** - Validate governance proposals (introduced in Conway era).

**Native Scripts** - Cardano's "original" scripting language that predates Plutus, providing simple multisig and time-lock functionality through a minimal domain-specific language with constructs like "all-of", "any-of", and "after/before" time constraints.

### Deterministic Validation

Validators are fully deterministic - their execution depends only on the transaction context. This predictability allows you to verify transaction outcomes before submission, unlike systems where network conditions can affect execution.

## Contract Workflows

Understanding how scripts work in practice helps bridge the conceptual model with real implementation.

### Basic Contract Example

Let's trace through a simple secret-word contract that demonstrates the datum/redeemer relationship:

**Step 1: Create the Validator**
Write a script that validates permission to spend a UTxO from its address by comparing the redeemer message provided in a transaction against the datum of the UTxO its trying to spend (locked UTxO)

**Step 2: Lock Funds**
Create a transaction that sends Ada to the script address with a datum which contains a field you will want to compare the redeemer value to. This locks the funds under your validation logic.

**Step 3: Unlock Funds**
To spend the locked UTXO, provide a correct redeemer which fulfills the contract logic. The validator compare it to the "stored" datum tied to the UTxO owned by its own address, allowing the transaction if they match.

### Stateful Contracts and State Persistence

For contracts that need to maintain state across multiple transactions, Cardano uses the "spend-and-recreate" pattern:

1. **Spend** the UTXO containing the current state
2. **Recreate** a new UTXO at the same contract address with updated state
3. **Validate** that the state transition follows your contract rules

```mermaid
flowchart LR
    A[UTXO₁<br/>State: count=0] --> B[Transaction]
    B --> C[UTXO₂<br/>State: count=1]
    C --> D[Transaction]
    D --> E[UTXO₃<br/>State: count=2]
    E --> F[...]
    
    B -.->|Validates| G[count₁ = count₀ + 1]
    D -.->|Validates| H[count₂ = count₁ + 1]
    
    style A fill:#e1f5fe
    style C fill:#e1f5fe
    style E fill:#e1f5fe
    style G fill:#fff3e0
    style H fill:#fff3e0
```

**Example**: A simple counter that tracks the number of times it's been used:

```rust title="State Threading Counter Example"
smart_contract_logic(datum, redeemer, context):
  old_count = datum.count
  new_count = old_count + 1
  
  // Ensure the transaction creates a new output at the same script address
  // with the incremented count in its datum
  validate_output_has_incremented_count(context, new_count)
```

This creates a "thread" of UTXOs, each containing the evolved state of your contract. The key insight: **state isn't stored in a contract - it's stored in UTXOs that the contract validates**.

### State Validation and Trust

:::warning State Security
There's a critical security consideration: anyone can send a UTXO to your contract address with any datum they want. The spending validator only "runs" (validates the logic you defin) when UTXOs are tried to be spent, not when they're received.
:::

To ensure state authenticity, many Cardano applications use **state-thread tokens** or **auth tokens** (NFTs) that prove a UTXO's state is legitimate. This is commonly called the **state-thread token pattern**. The pattern works like this:

1. **Minting policy** validates that new state is created correctly and mints an NFT
2. **Spending validator** requires the NFT to be present and passed along to the new state
3. **NFT presence** proves the state was created through proper validation

This bridges minting policies and spending validators to create trustless, validated state management.

## Takeaways

- Think of validators as mathematical functions that receive three inputs (datum, redeemer, context) and return true/false to allow/deny transactions.

- Datums carry contract state between transactions, while redeemers provide the inputs to drive state changes.

- Validators are predictable meaning the same inputs always produce the same result, allowing you to verify transaction outcomes before submission.

- Smart contracts require both on-chain validators and off-chain code to construct valid transactions. The off-chain component is equally critical for user experience.

## Modern Smart Contract Features

Cardano provides several powerful features that make smart contract development more efficient and flexible:

### Reference Inputs ([CIP-31](https://cips.cardano.org/cip/CIP-31))

You can read UTXO data without spending it. This is great for:

- **Oracle feeds**: Multiple contracts can read the same price data simultaneously
- **State queries**: Check contract state without modifying it  
- **Shared resources**: Multiple users can access the same data without conflicts

Instead of the old spend-and-recreate pattern, just reference the UTXO you want to read from.

### Inline Datums ([CIP-32](https://cips.cardano.org/cip/CIP-32))

Store your datum data directly in outputs instead of dealing with hashes. This means:

- No datum hash calculations
- No need to provide separate datum data when spending

Your datum is right there in the output - much simpler to work with.

### Reference Scripts ([CIP-33](https://cips.cardano.org/cip/CIP-33))

Deploy your script once, then reference it from multiple transactions. You get:

- **Smaller transactions**: No need to include full script code every time
- **Lower fees**: Pay for the script once, not per transaction
- **Better throughput**: More transactions fit in each block

:::important Key Characteristics
On Cardano, typically only the **hash** of a validator script is stored on-chain. Optionally, the full script can be included via a **reference script** (CIP-33), allowing later transactions to reference it without resubmitting the code. It is not possible to modify the rules of an existing smart contract, nor is it possible to decompile the stored smart contract code from its compiled state into the original source code.
:::

### Collateral Output ([CIP-40](https://cips.cardano.org/cip/CIP-40))

Transactions that call Plutus smart contracts are required to put up collateral to cover the potential cost of smart contract execution failure.

These features work together to make Cardano smart contracts more practical and cost-effective to deploy and use.

## Programming languages

Cardano introduced smart contracts in 2021 and supports the development and deployment of smart contracts using multiple different languages.

:::tip
Writing well-designed smart contracts requires you to have a solid understanding of how Cardano works in general. So, make sure that everything on this page makes sense before you start creating contracts. Many topics are described in more detail on the [Technical Concepts](/docs/get-started/technical-concepts/overview) page as well.
:::

- [Aiken](smart-contract-languages/aiken/overview) - Most popular smart contract language on Cardano written in Rust like syntax. Specifically designed for on-chain validators only and embraces/treats UTxO model as a first citizen: a language & toolchain favouring developer experience.
- [Plutarch](https://github.com/Plutonomicon/plutarch-plutus) - With Plutarch, you have much more fine gained control of the Plutus Core you generate, without giving up any type information. Not for the faint hearted as it is close to writing UPLC by hand, but will almost always yield highest performance.
- [OpShin](smart-contract-languages/opshin) - Pythonic programming language used for smart contracts.
- [Scalus](smart-contract-languages/scalus) - a modern unified development platform for building Cardano DApps using Scala 3 for both on-chain smart contracts and off-chain logic. Scalus works with JVM and JavaScript too.
- [Plinth](smart-contract-languages/plinth) - "Canonical" smart contract language of Cardano written in Haskell with advanced tooling. Can be used for both on-chain and off-chain.
- [Plu-ts](smart-contract-languages/plu-ts) - Typescript-embedded smart contract programming language and a transaction creation library.

