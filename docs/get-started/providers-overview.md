---
id: providers-overview
title: Providers
sidebar_label: Overview
description: Explore providers for Cardano - managed blockchain infrastructure so you can build without running a node.
image: /img/og/og-developer-portal.png
---

## Choose Your Provider

Providers give you API access to the Cardano blockchain without requiring you to run and maintain your own infrastructure. They handle node operations, data indexing, and provide developer-friendly APIs.

```mermaid
graph LR
    App[Your Application]

    App --> |Uses API| Provider[Provider Infrastructure]

    Provider --> Node[cardano-node]
    Provider --> Indexer[Data Indexer]
    Provider --> API[API Layer]

    Node --> |Syncs| Blockchain[Cardano Blockchain]
    Indexer --> |Queries| Node
    API --> |Serves Data| App

    style App fill:#e1f5ff,stroke:#333,stroke-width:2px
    style Provider fill:#f3e5f5,stroke:#333,stroke-width:3px
    style Node fill:#fff4e6,stroke:#333,stroke-width:1px
    style Indexer fill:#fff4e6,stroke:#333,stroke-width:1px
    style API fill:#fff4e6,stroke:#333,stroke-width:1px
    style Blockchain fill:#e8f5e9,stroke:#333,stroke-width:2px
```

Providers run and maintain Cardano infrastructure so you don't have to. They operate cardano-node, index blockchain data into queryable databases, and expose developer-friendly APIs (REST, WebSocket, gRPC). This means you can query blocks, transactions, UTXOs, submit transactions, and access protocol parameters without managing servers, handling upgrades, or ensuring uptime.

---

## Available Providers

import DocCardList from '@theme/DocCardList';

<DocCardList />
