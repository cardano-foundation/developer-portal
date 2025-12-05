---
id: demeter
title: Demeter
sidebar_label: Demeter
description: Cloud-based Cardano infrastructure platform with managed nodes, indexers, and RPC services.
image: /img/og/og-developer-portal.png
---

[Demeter](https://demeter.run) provides managed Cardano infrastructure, handling node operations, indexing, and middleware so you can focus on building applications.

![Demeter Platform Architecture](/img/demeter-platform-architecture.png)

## Available services

Demeter offers managed Cardano services across mainnet, preprod, and preview networks:

**Node Access**: Submit transactions and query blockchain through direct node connectivity

**Indexers**: Query historical ledger data and UTXOs via DB-Sync, Kupo, and Mumak

**RPC Services**: Access blockchain through Ogmios, Submit API, UTxO RPC, and Blockfrost (RYO)

Browse the full service catalog at [demeter.run](https://demeter.run).

## When to use Demeter

```mermaid
graph LR
    App[Your Application]

    App --> Demeter[Demeter Platform]

    Demeter --> Services[Managed Services]
    Services --> Node[Node Access]
    Services --> Indexers[Indexers<br/>DB-Sync, Kupo, Mumak]
    Services --> RPC[RPC Services<br/>Ogmios, Submit API, etc.]

    Node --> Cardano[Cardano Networks]
    Indexers --> Cardano
    RPC --> Cardano

    style App fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
    style Demeter fill:#FFFFFF,stroke:#0033AD,stroke-width:3px,color:#000000
    style Cardano fill:#0033AD,stroke:#0033AD,stroke-width:2px,color:#FFFFFF
```

Use Demeter when you:

- Want managed infrastructure without DevOps overhead
- Need multiple Cardano services (nodes, indexers, RPC)
- Prefer pay-as-you-go over self-hosting
- Build applications or prototypes requiring full service access

For complete infrastructure control or stake pool operations, [run your own node](/docs/get-started/infrastructure/node/cardano-components) instead.

## Getting started

Visit [demeter.run](https://demeter.run) to create an account. See their [documentation](https://docs.demeter.run) for service setup and integration guides.

**Compare with**: [API Providers](/docs/get-started/infrastructure/api-providers/overview) or [Running your own node](/docs/get-started/infrastructure/node/cardano-components)
