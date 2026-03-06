---
id: scaling-node-operations
title: Scaling node operations
sidebar_label: Scaling Node Operations
description: Understanding the Relay and Block Producer topology
image: ../img/og-developer-portal.png
---

Mithril is one of Cardano’s core scaling components, focused on optimization and performance. As the blockchain grows, synchronizing a new node becomes increasingly resource-intensive and can take more than 24 hours. Mithril addresses this by enabling fast, secure bootstrapping of blockchain data without compromising decentralization.

Beyond faster synchronization, Mithril expands how Cardano can be used. By providing cryptographically certified snapshots of the chain state, it allows light clients, such as mobile and web wallets, to verify data without running a full node. The same guarantees support infrastructure providers, exchanges, and explorers that require efficient, independently verifiable access to chain data while reducing operational overhead. Certified snapshots also strengthen disaster recovery and reproducible deployments, and enable bridges and cross-chain applications that depend on secure, verifiable views of Cardano state.

### How it works

Mithril is a protocol that aggregates signatures from stake pools to certify the blockchain state. It uses stake-based threshold multi-signatures to combine individual pool signatures into a single, compact certificate.

These certificates allow the network to produce verifiable snapshots of the blockchain state. Any client can independently verify a snapshot, without relying on a centralized intermediary.

### Using Mithril

Becoming a Mithril signer is the first step for stake pool operators who want to participate. By running a signer alongside a block-producing node, an operator contributes to network-wide state certification and trustless verification.

Participation enables:

- Light wallet security: mobile and web clients can verify the chain securely without relying on centralized infrastructure
- Fast node bootstrapping: nodes can recover or synchronize in minutes using certified snapshots instead of replaying the full chain.

After becoming a signer, operators can strengthen their setup by running a Mithril relay node – it protects the block-producing node, and is highly recommended for production use. The relay distributes certificates and snapshots across the network.

Operators can also use the Mithril decentralized message queue (DMQ) for relay and block-producing nodes (this is currently optional, but will be standardized in the near future) . The DMQ protocol decentralizes the propagation of pool signatures, supporting more efficient and reliable distribution.

### Resource requirements

The Mithril signer is lightweight and runs alongside an existing Cardano node. It uses the pool’s stake to participate in the multi-signature lottery and adds minimal computational and storage overhead compared to standard node operations.

For step-by-step guidance, see the Mithril documentation on becoming an SPO and running a signer node:

- [Become a Mithril SPO](https://mithril.network/doc/manual/operate/become-mithril-spo)
- [Run a Mithril signer node](https://mithril.network/doc/manual/operate/run-signer-node)
- [Mithril documentation](https://mithril.network/doc/)
- [GitHub repository](https://github.com/input-output-hk/mithril)
