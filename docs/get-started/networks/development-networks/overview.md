---
id: overview
title: Development Networks
sidebar_label: Overview
description: Local blockchain networks for faster Cardano development and testing.
image: /img/og/og-developer-portal.png
---

Development networks run locally on your machine, giving you full control over blockchain state, network parameters, and block production without internet dependency or testnet tokens.

## Choosing a development network

| Feature | Yaci DevKit | cardano-testnet |
|---------|-------------|-----------------|
| **Setup** | Docker Compose or NPM | Build from source |
| **Includes** | Indexer, viewer, Ogmios, Kupo, Blockfrost API | Minimal tooling, full customization |
| **Use Case** | Integration testing, SDK development | Protocol testing, custom scenarios |

### Yaci DevKit

Quick-start development environment with built-in indexer, transaction viewer, and Provider API compatibility.

Use Yaci DevKit to:
- Get started quickly with Docker Compose
- Test integrations requiring Blockfrost API compatibility
- Access blockchain data through lightweight indexer
- Develop with Ogmios and Kupo integration
- Run in CI/CD pipelines (NPM package)

**Learn more**: [Yaci DevKit guide](/docs/get-started/networks/development-networks/yaci-devkit)

### cardano-testnet

Lightweight local cluster from cardano-node with full customization over genesis files and network parameters.

Use cardano-testnet to:
- Customize genesis files and on-chain parameters
- Test protocol-level behavior
- Create specific network scenarios
- Match mainnet parameters exactly
- Control epoch length, slot timing, and stake distribution

**Learn more**: [cardano-testnet guide](/docs/get-started/networks/development-networks/cardano-testnet)

## When to use development networks

Development networks are ideal when you need:
- Fast iteration without waiting for testnet block confirmations
- Deterministic blockchain state for testing
- Offline development without internet dependency
- Custom network parameters or genesis configuration
- Automated testing in CI/CD pipelines

Once your application is stable, move to public testnets for production-like testing before mainnet deployment.

## Next steps

- **Quick start**: [Set up Yaci DevKit](/docs/get-started/networks/development-networks/yaci-devkit) with Docker Compose
- **Advanced setup**: [Build cardano-testnet](/docs/get-started/networks/development-networks/cardano-testnet) for custom configurations
- **Test on public networks**: [Use testnets](/docs/get-started/networks/testnets) for pre-production validation
