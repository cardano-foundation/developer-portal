---
title: Avoid Redundant Validation
description: Reduce on-chain costs by centralizing common validation logic in a withdrawal script using the withdraw-zero trick on Cardano.
displayed_sidebar: bootcampSidebar
slug: 05-avoid-redundant-validation
---

# Lesson #05: Avoid Redundant Validation

A common question from the previous lessons: why use a withdrawal script for minting and state updates instead of validating directly in the spending validator? Every UTXO spent from a spending validator triggers validation, so why not put the logic there?

> Source code: [GitHub](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/05-avoid-redundant-validation)

## A Transaction with Multiple Script Validation

Consider a complex transaction involving multiple script validations: minting tokens, spending multiple script UTXOs, and withdrawing funds. Each action may require its own set of checks.

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

Enforcing common checks in every script causes redundant validation: the same logic executes multiple times, increasing transaction costs and script size.

## How Can We Do Better?

![Centralized Validation via Withdrawal Script](./img/cardano05-01.png)

Centralize common checks in a single script that executes once. All other scripts delegate to it, eliminating duplicate logic while preserving all necessary validations.

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

The `WithdrawalCheck` script performs common validations once, checking conditions for all other scripts in the transaction.

## Example: Continue from Lesson 4

Assume Lesson 4's withdrawal script contains all common validation logic. Instead of duplicating those checks in spending and minting validators, delegate to the withdrawal script:

### Spending

```rs
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

```rs
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

Delegating validation to a withdrawal script is a common Cardano smart contract pattern. While you could delegate to a spending or minting validator instead, withdrawal scripts have a distinct advantage.

### Clean trigger

Spending validation triggers when a UTXO is spent, and minting validation triggers when a token is minted. Both require an actual on-chain action. A withdrawal script, by contrast, can be triggered by withdrawing 0 lovelace (the [`withdraw 0 trick`](https://aiken-lang.org/fundamentals/common-design-patterns#forwarding-validation--other-withdrawal-tricks)). This triggers validation cleanly without affecting the transaction's logic or state.

## Simplified Explanation

### Why Avoid Redundant Validation?
When multiple scripts participate in a transaction, repeating the same checks in each one wastes execution budget and increases fees. Centralizing common checks in one script runs them once.

### How Delegation Works
A withdrawal script acts as the central validator:

- **Spending Validator**: Checks that the withdrawal script is present in the transaction
- **Minting Validator**: Also checks for the withdrawal script
- **Withdrawal Script**: Runs all shared validation logic once

### The Withdraw-Zero Trick
The withdrawal script triggers via the `withdraw 0 trick`: withdrawing 0 lovelace activates validation without affecting transaction state. This approach is widely adopted for its simplicity.

### Key Benefits
- **Efficiency**: Common checks execute once instead of per-script
- **Lower Fees**: Reduced execution budget means lower transaction costs
- **Maintainability**: Validation logic lives in one place

## Source Code Walkthrough

This section walks through the project files so you can see how the delegation pattern is organized in practice. If you are coming from a Web2 background, think of this as examining the middleware architecture of a backend service.

### Project Structure

```
05-avoid-redundant-validation/
├── validators/
│   ├── withdraw.ak    # Shared middleware - all common validation lives here
│   ├── spend.ak       # Spending validator - delegates to withdraw.ak
│   └── mint.ak        # Minting validator - delegates to withdraw.ak
├── aiken.toml         # Project manifest (like package.json)
├── aiken.lock         # Dependency lockfile (like bun.lockb)
└── plutus.json        # Compiled output (like a dist/ build artifact)
```

### Web2 Mental Model

If you have built Express.js or Hono middleware chains, this pattern will feel familiar:

| Cardano Concept | Web2 Equivalent |
|---|---|
| `withdraw.ak` (withdrawal script) | Shared middleware function (e.g., `authMiddleware`) |
| `spend.ak` / `mint.ak` delegating to withdrawal | Route handlers calling `next()` through the middleware chain |
| Withdraw-zero trick | A no-op trigger -- like calling a health-check endpoint solely to activate middleware side effects |
| Centralizing validation in one script | The DRY principle -- write auth checks once, apply everywhere |

In Express terms, instead of copy-pasting authentication checks into every route handler, you extract them into a middleware function and attach it to your router. That is exactly what `withdraw.ak` does for on-chain validation.

### How the Files Work Together

```mermaid
graph LR
    S["spend.ak"] -- "delegates to" --> W["withdraw.ak"]
    M["mint.ak"] -- "delegates to" --> W
    W -- "runs all shared checks" --> V{"Validation\nResult"}
    V -- "pass" --> TX["Transaction\nSucceeds"]
    V -- "fail" --> F["Transaction\nFails"]

    style W fill:#DDA0DD,stroke:#333,stroke-width:2px,color:#000
    style S fill:#E0E0E0,stroke:#333,stroke-width:2px,color:#000
    style M fill:#87CEEB,stroke:#333,stroke-width:2px,color:#000
    style TX fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style F fill:#FFB6B6,stroke:#333,stroke-width:2px,color:#000
```

As the diagrams earlier in this lesson illustrate, without delegation every validator would independently repeat the same checks. With delegation, `spend.ak` and `mint.ak` each contain a single guard: "is the withdrawal script present in this transaction?" If yes, they pass. All real validation logic executes once inside `withdraw.ak`.

### `withdraw.ak` -- The Shared Middleware

This is the central validator where all common checks live. It receives the transaction context and validates conditions like owner signatures, expiration, and any other shared business rules. In the diagrams above, this corresponds to the purple "Withdrawal Script" node that receives all the common validation arrows.

### `spend.ak` -- The Spending Delegate

The spending validator's only job is to confirm that `withdraw.ak` is participating in the transaction. It calls `withdrawal_script_validated(tx.withdrawals, delegated_withdrawal_script_hash)` and returns the result. Think of it as a route handler whose entire body is `return authMiddleware(req)`.

### `mint.ak` -- The Minting Delegate

Identical delegation pattern to `spend.ak`, but for minting operations. It checks that the withdrawal script is present and lets the central validator handle the real logic. This means adding new minting rules only requires changes in `withdraw.ak`, not in every minting validator.

### `aiken.toml` and `aiken.lock`

These serve the same role as `package.json` and a lockfile in a Node.js project. `aiken.toml` declares the project name, version, and dependencies (such as the `cocktail` library that provides `withdrawal_script_validated`). `aiken.lock` pins exact dependency versions for reproducible builds.

### `plutus.json`

The compiled output produced by `aiken build`. This JSON file contains the compiled bytecode for all three validators and their type information. Off-chain TypeScript code reads this file to construct transactions. The next lesson covers this file in detail.

## Source code

The source code for this lesson is available on [GitHub](https://github.com/cardano-foundation/developer-portal/tree/staging/bootcamp-codes/05-avoid-redundant-validation).