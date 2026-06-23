---
id: overview
title: Build a dApp
sidebar_label: Overview
description: Connect Cardano to your application (wallets, payments, oracles, and AI agents) and build DeFi protocols on the eUTXO model.
image: /img/og/og-developer-portal.png
---

![Integrate Cardano](/img/card-integrate-cardano-title.svg)

This module is about meeting users where they are: connecting Cardano to web apps, services, and protocols. Whether you're adding a "connect wallet" button, accepting ADA payments, feeding real-world prices into a contract, or building a full DeFi protocol, the building blocks live here.

## Build a dApp

The front-end path most applications follow:

- **[Your first dApp](/docs/developers/curriculum/dapps/your-first-dapp)**: start here to assemble a working dApp end to end (scaffold, connect, read balance, send), from a runnable Evolution or Mesh template.
- **[Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet)**: let users link their browser wallet (CIP-30). The starting point for any dApp.
- **[Sign in with wallet](/docs/developers/curriculum/dapps/wallet-authentication)**: passwordless authentication by proving wallet ownership (CIP-8 message signing).
- **[Listen for payments](/docs/developers/curriculum/dapps/listen-for-payments)**: detect and confirm ADA arriving at an address.

For building and submitting the transactions behind these flows, see [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction) and [lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend). The same building blocks are what an [autonomous agent](/docs/developers/curriculum/dapps/ai-agents/overview) drives when it holds a wallet and acts without a human in the loop.

## Build DeFi

- **[DeFi on Cardano](/docs/developers/curriculum/dapps/defi)**: DEXes, AMMs, liquidity pools, impermanent loss, and the eUTXO-specific patterns (order batching, pool sharding) that make DeFi work here.
- **[Oracles](/docs/developers/curriculum/dapps/oracles/overview)**: bring real-world data (prices, events) on-chain; the infrastructure DeFi depends on.

## AI agents

- **[AI agents on Cardano](/docs/developers/curriculum/dapps/ai-agents/overview)**: autonomous agents that hold wallets, make payments, and log decisions on-chain, including the [Masumi](/docs/developers/curriculum/dapps/ai-agents/masumi) agent economy.

## Exchanges & infrastructure

For exchanges, custodians, and back-end services that integrate at a lower level:

- **[Exchange integrations](/docs/developers/exchange-integrations)**: accounting, address management, and transaction handling for custodial platforms.
- Lower-level components for custom integrations:
  - [cardano-node](https://github.com/IntersectMBO/cardano-node): the node, aggregating consensus, ledger, and networking.
  - [cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync): follows the chain and writes it into PostgreSQL for querying.
  - [cardano-graphql](https://github.com/cardano-foundation/cardano-graphql): a typed, queryable API for Cardano.
  - [cardano-rosetta](https://github.com/cardano-foundation/cardano-rosetta-java): a Cardano implementation of the Mesh (Rosetta) exchange-integration API.
  - [cardano-addresses](https://github.com/IntersectMBO/cardano-addresses): mnemonic creation, seed conversion, and address derivation.
  - See also the [Cardano components overview](/docs/developers/curriculum/fundamentals/cardano-components).

## Next steps
- New to dApps? Start with [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet).
- Building a protocol? Read [DeFi on Cardano](/docs/developers/curriculum/dapps/defi), then [Oracles](/docs/developers/curriculum/dapps/oracles/overview).
