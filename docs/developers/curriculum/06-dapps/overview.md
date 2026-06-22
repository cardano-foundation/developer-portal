---
id: overview
title: DeFi & Integrations
sidebar_label: Overview
description: Connect Cardano to your application (wallets, payments, oracles, and AI agents) and build DeFi protocols on the eUTXO model.
image: /img/og/og-developer-portal.png
---

![Integrate Cardano](/img/card-integrate-cardano-title.svg)

This module is about meeting users where they are: connecting Cardano to web apps, services, and protocols. Whether you're adding a "connect wallet" button, accepting ADA payments, feeding real-world prices into a contract, or building a full DeFi protocol, the building blocks live here.

## Build a dApp

The front-end path most applications follow:

- **[Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet)**: let users link their browser wallet (CIP-30). The starting point for any dApp.
- **[Sign in with wallet](/docs/developers/curriculum/dapps/wallet-authentication)**: passwordless authentication by proving wallet ownership (CIP-8 message signing).
- **[Listen for payments](/docs/developers/integrations/payments/listening-for-payments/overview)**: detect and confirm ADA arriving at an address.

For building and submitting the transactions behind these flows, see [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction) and [lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend).

## Build DeFi

- **[DeFi on Cardano](/docs/developers/curriculum/dapps/defi)**: DEXes, AMMs, liquidity pools, impermanent loss, and the eUTXO-specific patterns (order batching, pool sharding) that make DeFi work here.
- **[Oracles](/docs/developers/curriculum/dapps/oracles/overview)**: bring real-world data (prices, events) on-chain; the infrastructure DeFi depends on.

## AI agents

- **[AI agents on Cardano](/docs/developers/integrations/ai-agents/overview)**: autonomous agents that hold wallets, make payments, and log decisions on-chain, including the [Masumi](/docs/developers/integrations/ai-agents/masumi) agent economy.

## Exchanges & infrastructure

For exchanges, custodians, and back-end services that integrate at a lower level:

- **[Exchange integrations](/docs/developers/integrations/exchange-integrations)**: accounting, address management, and transaction handling for custodial platforms.
- Lower-level components for custom integrations:
  - [cardano-node](https://github.com/IntersectMBO/cardano-node): the node, aggregating consensus, ledger, and networking.
  - [cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync): follows the chain and writes it into PostgreSQL for querying.
  - [cardano-graphql](https://github.com/cardano-foundation/cardano-graphql): a typed, queryable API for Cardano.
  - [cardano-rosetta](https://github.com/cardano-foundation/cardano-rosetta-java): a Cardano implementation of the Mesh (Rosetta) exchange-integration API.
  - [cardano-addresses](https://github.com/IntersectMBO/cardano-addresses): mnemonic creation, seed conversion, and address derivation.
  - See also the [Cardano components overview](/docs/developers/curriculum/fundamentals/cardano-components).

## What's next

- New to dApps? Start with [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet).
- Building a protocol? Read [DeFi on Cardano](/docs/developers/curriculum/dapps/defi), then [Oracles](/docs/developers/curriculum/dapps/oracles/overview).
