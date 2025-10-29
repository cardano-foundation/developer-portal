---
id: 05-avoid-redundant-validation
title: Avoid Redundant Validation
sidebar_label: 05 - Avoid Redundant Validation
description: Key contract best practice - reduce redundant validation logics being run onchain.
---

Do you have a question about the previous lessons - why have we performed even minting and state update in spending validators with withdrawal script? We know that every time we spend a UTxO from a spending validator would trigger checks, why can't I validate the counter update in the spending validator directly?

## A Transaction with Multiple Script Validation

Imagine there is a complex transaction that involves multiple script validations. For example, a transaction that mints tokens, unlocking multiple script UTxOs, and withdraws funds. Each of these actions may require its own set of checks and validations.

```mermaid
graph TB
    %% Layout subgraph for labels at top with horizontal alignment
    subgraph Checks[" Common Validations "]
        direction LR
        C1["C1: Check if owner signature exists"] ~~~ C2["C2: Check if not expired"] ~~~ C3["C3: Any other common checks"]
    end
    
    %% Remove the connecting lines between checks
    linkStyle 0 stroke-width:0px
    linkStyle 1 stroke-width:0px
    
    %% Connect checks to components with dotted lines
    Checks -.-> A1
    Checks -.-> A2
    Checks -.-> A3
    Checks -.-> M
    Checks -.-> W

    %% Inputs on left
    A1[Script Input 1] --> TX
    A2[Script Input 2] --> TX
    A3[Script Input 3] --> TX
    
    %% Center transaction
    TX((Transaction))
    
    %% Mint on top
    M[Token Minting] --> TX
    
    %% Withdraw at bottom
    W[Withdrawal Script] --> TX
    
    %% Clear styling with bright colors and black text
    style TX fill:#FFA07A,stroke:#333,stroke-width:2px,color:#000
    style M fill:#87CEEB,stroke:#333,stroke-width:2px,color:#000
    style W fill:#DDA0DD,stroke:#333,stroke-width:2px,color:#000
    style A1 fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style A2 fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style A3 fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style C1 fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    style C2 fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    style C3 fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    
    %% Positioning
    classDef default text-align:center
```

If we enforced all the common checks in each of the scripts, we would end up with redundant validations that are executed multiple times, leading to inefficiencies and increased transaction costs.

## How can we do better?

We can avoid redundant validations by centralizing the common checks in a single script, which is executed only once. This way, we can ensure that all the necessary validations are performed without duplicating the logic across multiple scripts.

```mermaid
graph TB
    %% Layout subgraph for labels at top with horizontal alignment
    subgraph Checks[" Common Validations "]
        direction LR
        C1["C1: Check if owner signature exists"] ~~~ C2["C2: Check if not expired"] ~~~ C3["C3: Any other common checks"]
    end
    
    %% Add spacing
    WithdrawalCheck[" Check for Withdrawal Script Validating "]
    
    %% Organize layout with invisible connections for spacing
    Checks ~~~ WithdrawalCheck
    
    %% Connect validation flows
    Checks -.-> W
    WithdrawalCheck -.-> A1
    WithdrawalCheck -.-> A2
    WithdrawalCheck -.-> A3
    WithdrawalCheck -.-> M

    %% Inputs on left with consistent arrows
    A1[Script Input 1] --> TX
    A2[Script Input 2] --> TX
    A3[Script Input 3] --> TX
    
    %% Transaction and other components
    TX((Transaction))
    M[Token Minting] --> TX
    W[Withdrawal Script] --> TX
    
    %% Styling
    style TX fill:#FFA07A,stroke:#333,stroke-width:2px,color:#000
    style M fill:#87CEEB,stroke:#333,stroke-width:2px,color:#000
    style W fill:#DDA0DD,stroke:#333,stroke-width:2px,color:#000
    style A1 fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style A2 fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style A3 fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style C1 fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    style C2 fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    style C3 fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    style WithdrawalCheck fill:#FFFFFF,stroke:#333,stroke-width:1px,color:#000
    
    %% Remove visible connections between check boxes
    linkStyle 0 stroke-width:0px
    linkStyle 1 stroke-width:0px
    linkStyle 2 stroke-width:0px
```

In the architecture above, we have a single `WithdrawalCheck` script that performs the common validations. This script is executed once, and it checks the conditions for all the other scripts involved in the transaction.

## Example: Continue from Lesson 4

Let's assume we have all the common logics checked in the lesson 4's withdrawal script. Rather than copy pasting all checks from withdrawal script to the spending and minting validators, we can do this instead to avoid redundant validations:

### Spending

```aiken
use aiken/crypto.{ScriptHash}
use cardano/transaction.{OutputReference, Transaction}
use cocktail.{withdrawal_script_validated}

validator spending_logics_delegated(
  delegated_withdrawal_script_hash: ScriptHash,
) {
  spend(
    _datum_opt: Option<Data>,
    _redeemer: Data,
    _input: OutputReference,
    tx: Transaction,
  ) {
    withdrawal_script_validated(
      tx.withdrawals,
      delegated_withdrawal_script_hash,
    )
  }

  else(_) {
    fail @"unsupported purpose"
  }
}
```

### Minting

```aiken
use aiken/crypto.{ScriptHash}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{withdrawal_script_validated}

validator minting_logics_delegated(
  delegated_withdrawal_script_hash: ScriptHash,
) {
  mint(_redeemer: Data, _policy_id: PolicyId, tx: Transaction) {
    withdrawal_script_validated(
      tx.withdrawals,
      delegated_withdrawal_script_hash,
    )
  }

  else(_) {
    fail @"unsupported purpose"
  }
}
```

## Why delegate to withdrawal script?

You might notice that we are delegating the validation to the withdrawal script. This is a common pattern in Cardano smart contracts, where a withdrawal script is used to perform common validations for multiple scripts.

However, validation delegation can happen in different ways. For example, you can delegate all checks to a spending or minting validator as well, why would we prefer withdrawal script most of the time?

### Clean trigger

Recall that spending validation is triggered when a UTxO is spent, and minting validation is triggered when a token is minted. By delegating to a withdrawal script, we can ensure that the common validations are performed only once, regardless of how many scripts are involved in the transaction.

And the withdrawal script can be triggered by withdrawing 0 lovelace, aka the community call it [`withdraw 0 trick`](https://aiken-lang.org/fundamentals/common-design-patterns#forwarding-validation--other-withdrawal-tricks). It is a clean way to trigger the validation without affecting the transaction's logic or state.

## Simplified Explanation

### Why Avoid Redundant Validation?

When multiple scripts are involved in a transaction, repeating the same checks in each script leads to inefficiencies and higher costs. Instead, centralizing common checks in a single script ensures that validations are performed only once, saving resources and simplifying logic.

### Centralized Validation

By using a single script, such as a withdrawal script, we can delegate common checks to it. This script acts as a central validator for all other scripts in the transaction.

### Example Flow

Imagine a transaction with multiple scripts:

- **Minting Script**: Handles token creation.
- **Spending Script**: Manages UTxO spending.
- **Withdrawal Script**: Performs common checks.

Instead of duplicating checks in each script, the withdrawal script validates all common conditions, ensuring efficiency.

### Delegation in Practice

Here’s how delegation works:

- **Spending Validator**: Delegates validation to the withdrawal script.
- **Minting Validator**: Also delegates validation to the withdrawal script.

This approach reduces redundancy and keeps the logic clean and maintainable.

### Clean Trigger with Withdrawal Script

The withdrawal script can be triggered using the `withdraw 0 trick`, which allows validation without affecting the transaction state. This method is widely used for its simplicity and effectiveness.

### Key Benefits

- **Efficiency**: Reduces redundant checks.
- **Cost-Effective**: Lowers transaction fees.
- **Maintainability**: Simplifies script logic.

By following this pattern, developers can create smarter and more efficient Cardano contracts.
