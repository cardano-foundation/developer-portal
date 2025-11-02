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

    style App fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style Provider fill:#FFFFFF,stroke:#0033AD,stroke-width:3px,color:#000000
    style Node fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style Indexer fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style API fill:#FFFFFF,stroke:#0033AD,stroke-width:1px,color:#000000
    style Blockchain fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
```

Providers run and maintain Cardano infrastructure so you don't have to. They operate cardano-node, index blockchain data into queryable databases, and expose developer-friendly APIs (REST, WebSocket, gRPC). This means you can query blocks, transactions, UTXOs, submit transactions, and access protocol parameters without managing servers, handling upgrades, or ensuring uptime.

---

## Available Providers

import DocCardList from '@theme/DocCardList';

<DocCardList />
