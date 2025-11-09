---
id: overview
title: High-Level SDKs
sidebar_label: Overview
description: Explore high-level SDKs for building Cardano dApps - developer-friendly tools that abstract away blockchain complexity.
image: /img/og/og-developer-portal.png
---

## Choose Your SDK

High-level SDKs provide developer-friendly interfaces for building Cardano applications without dealing with low-level blockchain operations. These SDKs handle transaction building, wallet integration, smart contract interactions, and more.

```mermaid
graph TB
    App[Your Application]

    App --> SDK[High-Level SDK]

    SDK --> |Abstracts| TxBuilder[Transaction Building]
    SDK --> |Abstracts| Wallet[Wallet Integration]
    SDK --> |Abstracts| Contract[Smart Contract Interaction]
    SDK --> |Abstracts| Data[Data Serialization]

    TxBuilder --> Provider[Provider API]
    Wallet --> Provider
    Contract --> Provider
    Data --> Provider

    Provider --> Blockchain[Cardano Blockchain]

    style App fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style SDK fill:#FFFFFF,stroke:#0033AD,stroke-width:3px,color:#000000
    style TxBuilder fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style Wallet fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style Contract fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style Data fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style Provider fill:#FFFFFF,stroke:#0033AD,stroke-width:2px,color:#000000
    style Blockchain fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
```

SDKs abstract away the complexity of blockchain operations: transaction building, CBOR serialization, UTxO selection, fee calculation, address derivation, and protocol parameter management. This lets you build Cardano applications using modern languages like JavaScript, Python, TypeScript, and C# without needing to understand low-level blockchain internals.

---

## Available SDKs

import DocCardList from '@theme/DocCardList';

<DocCardList />
