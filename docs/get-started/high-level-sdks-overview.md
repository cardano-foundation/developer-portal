---
id: high-level-sdks-overview
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

    style App fill:#e1f5ff,stroke:#333,stroke-width:2px
    style SDK fill:#f3e5f5,stroke:#333,stroke-width:3px
    style TxBuilder fill:#fff4e6,stroke:#333,stroke-width:1px
    style Wallet fill:#fff4e6,stroke:#333,stroke-width:1px
    style Contract fill:#fff4e6,stroke:#333,stroke-width:1px
    style Data fill:#fff4e6,stroke:#333,stroke-width:1px
    style Provider fill:#e8f5e9,stroke:#333,stroke-width:2px
    style Blockchain fill:#e8f5e9,stroke:#333,stroke-width:2px
```

SDKs abstract away the complexity of blockchain operations: transaction building, CBOR serialization, UTxO selection, fee calculation, address derivation, and protocol parameter management. This lets you build Cardano applications using modern languages like JavaScript, Python, TypeScript, and C# without needing to understand low-level blockchain internals.

---

## Available SDKs

import DocCardList from '@theme/DocCardList';

<DocCardList />
