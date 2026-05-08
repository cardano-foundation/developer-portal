---
id: hardware-requirements
title: Minimum hardware requirements to run a stake pool
sidebar_label: Hardware requirements
description: Minimum hardware requirements to run a stake pool
image: ../img/og-developer-portal.png
---
The latest technical specifications and supported platforms can be found on the [Cardano Node release page](https://github.com/IntersectMBO/cardano-node/releases).

:::info version reference
As of May 2026 the following specifications are recommended on Mainnet:
:::

- Servers: 1 for block producer node + at least 2 for relay nodes
- CPU: An Intel or AMD x86 processor with two or more cores at 2GHz or faster
- 24GB of RAM when running with the InMemory backend, 8GB when running with the OnDisk backend (pending confirmation)
- Storage: 250GB of free storage (350GB recommended for future growth)
- Operating system: see the [releases page](https://github.com/IntersectMBO/cardano-node/releases/latest) for supported platforms
- Broadband: a good network connection with about 1 GB of bandwidth per hour on a public IP4 address
- [Air-gapped environment](/docs/learn/educational-resources/air-gap) for key security

For testnet pools, some requirements are smaller:
- Memory: 4GB of RAM
- Storage: 20GB of free storage
- Air-gapped environment not required

