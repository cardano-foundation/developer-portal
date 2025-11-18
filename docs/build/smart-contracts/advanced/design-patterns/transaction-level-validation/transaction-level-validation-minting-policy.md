---
id: transaction-level-validation-minting-policy
title: Transaction Level Validation via Minting Policies
sidebar_label: Tx Level Validation (Minting)
description: Transaction level validation using minting policies for efficient batch processing of smart contract UTxOs.
---

## Introduction

When crafting transactions to process a single script (smart contract) UTxO, enforcing spending
requirements seems straightforward. However, in high-throughput applications, a more efficient
approach is desired – allowing the processing (spending) of these script UTxOs in a "batch."
Unfortunately, invoking the validator script for each input UTxO in a transaction repeats
pre-processing steps, making it less optimal. To overcome this, the technique of "transaction level
validation" is employed.

For a detailed implementation of transaction level validation using staking validators, refer to the
[Stake Validator Design pattern](stake-validators/stake-validator.md). This document outlines the details of
implementing the same pattern via minting policies.

## The Problem

A batch transaction involves multiple input UTxOs at a specific script address, and spending can
only occur when specific conditions apply (i.e., the validator function does not reject the
transaction). In this scenario, the validator script is executed for each UTxO, and the transaction
fails if any of the scripts reject it.

```mermaid
graph LR
    TX[Transaction]
    subgraph Spending Script
    S1((UTxO 1))
    S2((UTxO 2))
    S3((UTxO 3))
    end
    S1 -->|validates conditions| TX
    S2 -->|validates conditions| TX
    S3 -->|validates conditions| TX
    TX --> A1((Output 1))
    TX --> A2((Output 2))
    TX --> A3((Output 3))

    classDef emphasized fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    classDef regular fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    class TX emphasized
    class S1,S2,S3,A1,A2,A3 regular
```

## The Solution

A more efficient way to perform all the validations is by delegating them to a minting script, which
will only be executed once for the entire transaction.

```mermaid
graph LR
    TX[Transaction]
    subgraph Spending Script
    S1((UTxO 1))
    S2((UTxO 2))
    S3((UTxO 3))
    end
    S1 -->|mints validation token| TX
    S2 -->|mints validation token| TX
    S3 -->|mints validation token| TX
    ST{{Minting policy}} -.-o |validates Business Logic| TX
    TX --> A1((Output 1))
    TX --> A2((Output 2))
    TX --> A3((Output 3))

    classDef emphasized fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    classDef regular fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    class TX,ST emphasized
    class S1,S2,S3,A1,A2,A3 regular
```

The drawback of this approach is that the minted validation tokens must be included in one of the
outputs, potentially consuming unnecessary block space.

A more desirable solution involves burning the validation tokens instead of minting them in the
batch transaction. However, this requires minting and storing the validation tokens in the input
UTxOs beforehand, allowing for pre-validation steps attached to their creation.

```mermaid
graph LR
    TX[Transaction]
    TX --> A1((UTxO \n containing \n validation token))
    MP{{Minting policy}} -.-o |validates token minting| TX

    classDef emphasized fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    classDef regular fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    class TX,MP emphasized
    class A1 regular
```

```mermaid
graph LR
    TX[Transaction]
    subgraph Spending Script
    S1((UTxO 1))
    S2((UTxO 2))
    S3((UTxO 3))
    end
    S1 -->|burns \n validation token| TX
    S2 -->|burns \n validation token| TX
    S3 -->|burns \n validation token| TX
    MP{{Minting policy}} -.-o |validates Business Logic| TX
    TX --> A1((Output 1))
    TX --> A2((Output 2))
    TX --> A3((Output 3))

    classDef emphasized fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    classDef regular fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    class TX,MP emphasized
    class S1,S2,S3,A1,A2,A3 regular
```

## Conclusion

Transaction level validation can be implemented using minting policies. However, if minting
validation tokens is impractical, the recommended approach is to implement transaction level
validation using a staking validator due to lower ExUnits cost compared to minting policy checks,
based on our experience.


:::note
You can find a sample implementation of a tx level minter written in Aiken in this[repository](https://github.com/keyan-m/aiken-delegation-sample/blob/main/validators/spend-logic.ak).
:::