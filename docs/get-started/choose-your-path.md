---
id: choose-your-path
title: Choose Your Path
sidebar_label: Choose Your Path
description: Understand the two main approaches to building on Cardano - self-hosted infrastructure or managed services.
image: /img/og/og-developer-portal.png
---

## Two Paths to Building on Cardano

There are **two main approaches** to building on Cardano, each with different trade-offs:

```mermaid
graph TB
    Start[Your Application] --> Choice{Choose Your Path}

    Choice -->|Path 1: CLI & Node| CLI[cardano-cli]
    CLI --> Node[cardano-node]
    Node --> Chain1[Cardano Blockchain]

    Choice -->|Path 2: SDKs| SDK[SDK]
    SDK --> Provider[Provider]
    Provider --> Chain2[Cardano Blockchain]

    style Start fill:#e1f5ff,stroke:#333,stroke-width:2px
    style Choice fill:#fff9c4,stroke:#333,stroke-width:2px
    style CLI fill:#fff4e6,stroke:#333,stroke-width:2px
    style Node fill:#fff4e6,stroke:#333,stroke-width:2px
    style SDK fill:#f3e5f5,stroke:#333,stroke-width:2px
    style Provider fill:#f3e5f5,stroke:#333,stroke-width:2px
    style Chain1 fill:#e8f5e9,stroke:#333,stroke-width:2px
    style Chain2 fill:#e8f5e9,stroke:#333,stroke-width:2px
```

### Path 1: CLI & Node

**Components:** cardano-cli + cardano-node

- Direct, low-level interaction with the blockchain
- Full control over your infrastructure
- Requires running a node
- Involved transaction building with CLI commands

### Path 2: SDKs

**Components:** [SDKs](/docs/get-started/high-level-sdks-overview) + [Providers](/docs/get-started/providers-overview)

- Developer-friendly libraries that abstract blockchain complexity
- Connect to providers (managed services like Blockfrost/Koios or self-hosted like Ogmios)
- Focus on application logic, not low-level operations
- Modern language support (JavaScript, Python, C#, etc.)

:::tip Choosing Your Path
Both paths are valid choices depending on your needs:

**Path 1 (cardano-cli + cardano-node)** gives you:

- Complete control over your infrastructure
- Deep understanding of how Cardano works
- No dependency on third-party services
- Required for stake pool operations

**Path 2 (SDKs + Providers)** gives you:

- Faster time to market
- Lower operational overhead
- Modern developer experience
- Focus on application logic

Many developers start with Path 2 for rapid development and later explore Path 1 to understand the underlying mechanisms.
:::
