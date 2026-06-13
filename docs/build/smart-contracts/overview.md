---
id: overview
title: Smart Contracts
sidebar_label: Overview
description: Learn how to create smart contracts on Cardano.
image: /img/og/og-developer-portal.png
---

![Smart Contracts](/img/card-smart-contracts-title.svg)

## What are smart contracts?

Smart contracts are digital agreements defined in code that automate and enforce the terms of a contract without the need for intermediaries, enabling secure and transparent transactions on a blockchain. By leveraging predetermined conditions defined within the smart contract code, the state of a contract can only be updated in a way that follows the rules defined in that contract.

## Introduction

Smart contracts on Cardano work a bit differently from how they do on other blockchains. The key to understanding smart contracts is to first understand the [eUTXO](/docs/value/eutxo) model.

Smart contracts are validator scripts that you write to validate the movement of UTXOs locked in your contract's address. You will lock UTXOs at the address of your script and then the UTXOs can only ever be spent/moved if your script allows the transaction spending it to do so.

## Conceptual overview

### Smart Contracts Are Validators, Not Actors

:::tip Mental Model Shift
The most important mental shift when coming to Cardano from other blockchains: **smart contracts cannot take actions**. They can only approve or deny proposed transactions.
:::

A Cardano smart contract cannot:

- "Send tokens" to another address
- "Call another contract" imperatively
- Initiate any action on its own
- Make network requests or read external data directly
- Generate random numbers
- Loop indefinitely (execution budgets enforce termination)

Instead, smart contracts **validate** that transactions do the things you want them to do. Users propose transactions, and contracts either approve or reject them based on the validation logic you define. These limitations are features, not bugs: they make validators **deterministic** — the same inputs always produce the same result — which is the foundation of Cardano's predictability guarantees.

### Components

Smart contracts consist of on-chain and off-chain components:

- **On-chain component (validator-script)**: Validates that transactions spending from the contract address follow the contract's rules. This is the immutable logic that runs on every Cardano node.
- **Off-chain component**: Applications that construct valid transactions according to the contract rules. These can be built in any language and handle user interfaces, data fetching, and transaction building.

The off-chain component is equally critical - it's responsible for creating transactions that the on-chain validator will approve.

:::tip The lawyer and the judge
Think of off-chain code as the **lawyer drafting a contract** and on-chain code as the **judge reviewing it**. The lawyer does the creative, complex work of figuring out what the agreement should look like; the judge simply checks whether it complies with the rules. This separation is why on-chain execution stays cheap (the chain only runs validation, not construction), why off-chain code can be written in any language, and why you can test the two halves independently.
:::

### On-Chain (Validator scripts)

Validator scripts are executed automatically when a UTXO residing at the address of the script is attempted to be moved by a transaction. These scripts take a transaction as its input and then outputs either true or false depending on whether the transaction is valid or not according to your rules/logic as defined in the script - thus blocking or allowing a transaction to succeed. If you are moving multiple UTXOs residing on the same script address, the validator-script will run once for each UTXO. This script execution happens on the Cardano node validating your transaction. Validator scripts run once per script input in the transaction.

This means that in order for the validator script to execute, a transaction must first move a UTXO to the address of the contract; the address is derived from the contract mathematically. Normally, only the script hash is stored on-chain. With CIP-33 reference scripts, you can include the full script in a UTXO so later transactions can reference it without including the full script code.

### Off-Chain

You might think of this initial transaction where you move a UTXO to the script address to be the initialisation of a contract instance. Each UTXO residing on the address of the contract can thus be seen as an instance of the contract. Note that there is no restriction on the UTXOs being sent to the script address: anyone can send a UTXO containing no datum, or an arbitrary datum.

The off-chain part is needed in order to locate UTXOs that are locked in your contract and generate transactions that are valid for moving them.

## Technical overview

Smart contracts on Cardano are validator scripts that enforce custom logic when interacting with UTXOs "owned" by a script (owned meaning the UTxO sits at the script address). Think of them as parameterized mathematical functions that return true or false to determine transaction validity.

### Understanding Validators: The Mathematical Model

Validators work like mathematical functions with three inputs:

```text title="Validator Function Signature"
Script: f(datum, redeemer, context) = success | failure
```

Conceptually, you can think of validators as returning true/false, though under the hood they either succeed (returning unit `()`) or fail (throwing an error).

```mermaid
graph TB
    subgraph LOCKED[" "]
        UTXO["UTXO at Script Address<br/>Value: 100 ADA"]
        DATUM["Datum<br/>(state data)"]
    end

    TX["Transaction<br/>wants to spend this UTXO"]

    TX -.->|"trying to spend"| UTXO
    TX -->|"provides"| REDEEMER["Redeemer<br/>(spending argument)"]

    SCRIPT["Validator Script asks:<br/>'Is this transaction allowed<br/>to spend this UTXO?'"]

    LOCKED --> SCRIPT
    REDEEMER --> SCRIPT
    TX -.->|"transaction details visible to script"| SCRIPT

    SCRIPT -->|"Yes ✓"| APPROVED["Validation succeeds<br/>UTXO is spent"]
    SCRIPT -->|"No ✗"| REJECTED["Validation fails<br/>UTXO remains locked"]

    style UTXO fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style DATUM fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style TX fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style REDEEMER fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style SCRIPT fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style APPROVED fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style REJECTED fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
```

Consider the analogy of a simple function: `f(x) = x * a + b`

- **Script** is the function definition (`x * a + b`) - your validation logic
- **Datum** contains the parameters (`a` and `b`) - configuration data set when the UTXO is created
- **Redeemer** provides the argument (`x`) - user input provided when spending
- **Context** gives access to transaction details for validation

### The Three Script Arguments

:::tip Deep dive
This is the quick tour. The canonical, in-depth reference for all three arguments — the full transaction context, the `ScriptPurpose`, inline-vs-hash datums, and the design patterns they enable — is **[Datum, redeemer & context](/docs/build/smart-contracts/datum-redeemer-context)**.
:::

#### Datum: Contract State

Data attached to UTXOs and is immutable. Datums carry contract state between transactions, enabling complex state machines by preserving information that subsequent transactions can read and modify. When someone sends UTxOs to a script address, they attach the datum to define the conditions under which the UTxO can be spent. Datum are the extension to the UTxO model and, in a way, stand for the "e" in eUTxO. Unlike the Bitcoin UTxO model, which lacks datums and thus has limited capabilities, the extended UTxO model provides capabilities comparable to an account-based model while maintaining a safer approach to transactions by avoiding global state mutations.

#### Redeemer: User Input

Data provided by users with the transaction for script execution when spending UTXOs that "unlocks" funds by satisfying the script's conditions. Redeemers drive state transitions by supplying the inputs needed to transform the current state (datum) into a new state. The redeemer must meet the validation logic specified by the script to successfully spend the locked funds.

> Recap: The datum is set when the UTxO is created, whereas the redeemer is provided only when spending the UTxO.

#### Script Context: Transaction Information

Logic in smart contracts involves making validations about properties of the transaction — inputs, outputs, signatures, fees, minting, validity range, and more. This lets a script make assertions about the whole transaction's structure, participants, and timing, not just the single UTXO it guards. It is what makes a validator expressive despite being "just" a boolean function.

The full set of context properties, the `ScriptPurpose`, and the common checks validators run against them live in **[Datum, redeemer & context](/docs/build/smart-contracts/datum-redeemer-context#what-does-the-scriptcontext-provide)**.

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

### Script Purposes and Types

Scripts validate different operations depending on their purpose, as defined in the [Conway era ledger specification](https://github.com/IntersectMBO/cardano-ledger/blob/master/eras/conway/impl/cddl/data/conway.cddl):

| Script Type          | Description                                                                                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Spend Scripts**    | Validate UTXO consumption. These are the most common scripts and the only ones that receive datum information.                                                                                                                               |
| **Mint Scripts**     | Control token creation and destruction through minting policies.                                                                                                                                                                             |
| **Publish Scripts**  | Validate certificates including stake delegation, pool registration/retirement, DRep registration, committee changes, and other governance roles.                                                                                            |
| **Withdraw Scripts** | Control stake reward withdrawals.                                                                                                                                                                                                            |
| **Vote Scripts**     | Validate governance votes (introduced in Conway era).                                                                                                                                                                                        |
| **Propose Scripts**  | Validate governance proposals (introduced in Conway era).                                                                                                                                                                                    |
| **Native Scripts**   | Cardano's "original" scripting language that predates Plutus, providing simple multisig and time-lock functionality through a minimal domain-specific language with constructs like "all-of", "any-of", and "after/before" time constraints. |

### Collateral and Script Execution

**Collateral**: UTXOs that must be provided when executing Plutus scripts to cover potential execution costs if the script fails during validation.

#### Transaction Validation Phases

When a transaction includes script execution:

- **Phase 1 Validation**: Basic transaction structure validation (inputs exist, signatures valid, etc.)
- **Phase 2 Validation**: Script execution and validation
- If Phase 2 fails, collateral UTXOs are consumed instead of regular transaction fees

#### Collateral Requirements

- Must contain only ADA (no native tokens)
- Should be sufficient to cover script execution costs
- Collateral amount is determined by the total balance of UTXOs marked as collateral inputs
- With Vasil upgrade: can specify change address to return excess collateral

#### Purpose and Protection

Collateral serves as a monetary guarantee that encourages careful design and testing of smart contracts. Without collateral, malicious actors could exploit the network by flooding it with invalid transactions at little cost. Key protections include:

- **Network Security**: Makes Denial of Service (DoS) attacks prohibitively expensive
- **Node Compensation**: Ensures nodes are compensated for their work if Phase 2 validation fails
- **User Safety**: Collateral is not collected if a transaction succeeds or is invalid at Phase 1
- **Deterministic Costs**: Unlike Ethereum where gas costs vary based on network activity, Cardano's deterministic design allows users to calculate execution costs and collateral requirements in advance

#### Technical Implementation

Phase 2 scripts require a budget of execution units (ExUnits) to quantify resource usage for metrics like memory usage and execution steps. This budget is included in the transaction fee calculation, with collateral providing additional safeguards for script execution failures.

### Deterministic Validation

Validators are fully deterministic - their execution depends only on the transaction context. This predictability allows you to verify transaction outcomes before submission, unlike systems where network conditions can affect execution.

## Contract Workflows

Understanding how scripts work in practice helps bridge the unique UTxO model with a basic example. Let's trace through a simple counter contract that demonstrates the datum/redeemer relationship:

### Step 1: Create the Validator

Write a script that validates state transitions by checking that the redeemer (user action) correctly transforms the current datum (contract state) into the new datum AND that all contract rules are met. For example, a counter validator ensures the count increments by exactly one & that the transaction is signed by the authorized owner to spend the UTxO.

### Step 2: Lock Funds (Initialize State)

Create a transaction that sends a UTxO value to the script address with a datum containing the initial state (e.g., `count: 0`) and any access control information (e.g., the owner's public key hash). This locks the funds under your validation logic and establishes both the contract's starting state and who can interact with it.

### Step 3: Unlock and Update State

To spend the locked UTXO, provide a redeemer that specifies the desired action (e.g., "increment"). The validator compares the input datum (`count: 0`) with the redeemer ("increment") and the output datum (`count: 1`), allowing the transaction only if the state transition is valid (meets all validator requirements, like being transaction being signed by the authorized owner and following the correct state transition - incrementing the count only by 1). This creates a new UTXO with updated state while the old one is consumed/spent.

```mermaid
flowchart LR
    A[UTXO₁<br/>State: count=0] --> B{Validate:<br/>• count₁ = count₀ + 1<br/>• Signed by owner<br/>}
    B -->|✓ Valid| C[UTXO₂<br/>State: count=1]
    B -->|✗ Invalid| G[Transaction Fails]
    C --> D{Validate:<br/>• count₂ = count₁ + 1<br/>• Signed by owner<br/>}
    D -->|✓ Valid| E[UTXO₃<br/>State: count=2]
    D -->|✗ Invalid| H[Transaction Fails]
    E --> F[...]

    style A fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style C fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style E fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style G fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style H fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
```

### Workflow Diagrams

![Continue Counting Tests](./img/overview-1.png)
![Continue Counting Tests](./img/overview-2.png)
![Continue Counting Tests](./img/overview-3.png)
![Continue Counting Tests](./img/overview-4.png)

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

Cardano supports writing validators in several languages, all of which compile to the same on-chain bytecode (UPLC). For most new projects, **[Aiken](/docs/build/smart-contracts/languages/aiken/overview)** is the recommended starting point.

:::tip Pick the right language
See **[Choose a language](/docs/build/smart-contracts/choose-a-language)** for the full comparison and decision guide. In short:

- **[Aiken](/docs/build/smart-contracts/languages/aiken/overview)** — purpose-built for Cardano, Rust-like syntax, fast compilation, small output, built-in testing. The default recommendation.
- **[Plinth](/docs/build/smart-contracts/languages/plinth)** — the "canonical" Haskell language; shares code between on-chain and off-chain.
- **[Plutarch](/docs/build/smart-contracts/languages/plutarch/overview)** — maximum performance, close to writing UPLC by hand.
- **[OpShin](/docs/build/smart-contracts/languages/opshin)** — a subset of Python.
- **[Scalus](/docs/build/smart-contracts/languages/scalus)** — Scala 3 for on-chain and off-chain.
- **[Pebble](/docs/build/smart-contracts/languages/pebble)** — a TypeScript-like DSL.
- **[Marlowe](/docs/build/smart-contracts/languages/marlowe)** — a non-Turing-complete DSL for financial contracts.
:::

## Key takeaways

- **Smart contracts are validators, not programs.** They check whether a transaction is allowed; they do not perform its logic themselves.
- **On-chain code validates; off-chain code constructs.** This separation keeps on-chain execution cheap and lets you write off-chain code in any language and test the two halves independently.
- **Determinism is Cardano's superpower.** You know a transaction's outcome before submitting it, eliminating wasted fees, front-running, and MEV.
- **Script addresses lock UTXOs under programmable rules,** replacing private-key authorization with arbitrary validation logic.
- **The eUTXO model extends UTXOs** with datums, redeemers, and script context — enabling full smart contract functionality while preserving determinism and parallelism.

## What's next

This module builds up from here:

1. **[Datum, redeemer & context](/docs/build/smart-contracts/datum-redeemer-context)** — the three arguments every validator receives, in depth.
2. **[Choose a language](/docs/build/smart-contracts/choose-a-language)** — pick how you'll write validators (Aiken-first).
3. **[Lock and spend](/docs/build/smart-contracts/lock-and-spend)** — build the off-chain transactions that interact with a contract.
4. **[Testing](/docs/build/smart-contracts/testing)** — verify validators with mock transactions before you deploy.
5. **[Security](/docs/build/smart-contracts/security)** — the attack classes to defend against.

---

## Explore all smart contract topics

import DocCardList from '@theme/DocCardList';

<DocCardList />
