---
id: overview
title: Development Networks
sidebar_label: Overview
description: Local blockchain networks for faster Cardano development and testing.
image: /img/og/og-developer-portal.png
---

Development networks run locally on your machine, giving you full control over blockchain state, network parameters, and block production without internet dependency or testnet tokens.

> Writing automated tests for your transaction-building code? The Evolution SDK also ships an **in-process devnet emulator** you spin up and tear down inside a test suite — see [Smart Contracts → Testing](/docs/developers/curriculum/smart-contracts/testing#testing-your-off-chain-code) or the [Evolution SDK devnet docs](https://intersectmbo.github.io/evolution-sdk/docs/devnet/getting-started/). The standalone networks below are better when you want a persistent chain to point a frontend or `cardano-cli` at.

## Choosing a development network

| Feature | Yaci DevKit | cardano-testnet |
|---------|-------------|-----------------|
| **Setup** | Docker Compose or NPM | Build from source |
| **Includes** | Indexer, viewer, Ogmios, Kupo, Blockfrost API | Minimal tooling, full customization |
| **Use Case** | Integration testing, SDK development | Protocol testing, custom scenarios |

### Yaci DevKit

Quick-start environment with a built-in indexer, transaction viewer, and Blockfrost-compatible Provider API, the fastest way to get a local chain for integration testing. Ships as Docker Compose or an NPM package for CI. **Learn more**: [Yaci DevKit guide](/docs/developers/curriculum/production/development-networks/yaci-devkit)

### cardano-testnet

A local cluster straight from cardano-node, with full control over genesis files and protocol parameters, epoch length, slot timing, and stake distribution. Use it for protocol-level testing and scenarios that must match mainnet parameters exactly. **Learn more**: [cardano-testnet guide](/docs/developers/curriculum/production/development-networks/cardano-testnet)

## When to use development networks

Reach for a local network when you need fast iteration without testnet confirmation times, deterministic and isolated state, offline development, or custom genesis parameters, including in CI. Once your application is stable, move to public testnets for production-like testing before mainnet deployment.

## Next steps

- **Quick start**: [Set up Yaci DevKit](/docs/developers/curriculum/production/development-networks/yaci-devkit) with Docker Compose
- **Advanced setup**: [Build cardano-testnet](/docs/developers/curriculum/production/development-networks/cardano-testnet) for custom configurations
- **Test on public networks**: [Use testnets](/docs/developers/curriculum/start-building/networks-and-test-ada) for pre-production validation
