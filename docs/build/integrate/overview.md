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

- **[Connect a wallet](/docs/build/integrate/connect-a-wallet)**: let users link their browser wallet (CIP-30). The starting point for any dApp.
- **[Sign in with wallet](/docs/build/integrate/wallet-authentication/overview)**: passwordless authentication by proving wallet ownership (CIP-8 message signing).
- **[Listen for payments](/docs/build/integrate/payments/listening-for-payments/overview)**: detect and confirm ADA arriving at an address.

For building and submitting the transactions behind these flows, see [your first transaction](/docs/first-steps/your-first-transaction) and [lock and spend](/docs/build/smart-contracts/lock-and-spend).

## Build DeFi

- **[DeFi on Cardano](/docs/build/integrate/defi)**: DEXes, AMMs, liquidity pools, impermanent loss, and the eUTXO-specific patterns (order batching, pool sharding) that make DeFi work here.
- **[Oracles](/docs/build/integrate/oracles/overview)**: bring real-world data (prices, events) on-chain; the infrastructure DeFi depends on.

## AI agents

- **[AI agents on Cardano](/docs/build/integrate/ai-agents/overview)**: autonomous agents that hold wallets, make payments, and log decisions on-chain, including the [Masumi](/docs/build/integrate/ai-agents/masumi) agent economy.

## Exchanges & infrastructure

For exchanges, custodians, and back-end services that integrate at a lower level:

- **[Exchange integrations](/docs/build/integrate/exchange-integrations)**: accounting, address management, and transaction handling for custodial platforms.
- Lower-level components for custom integrations:
  - [cardano-node](https://github.com/IntersectMBO/cardano-node): the node, aggregating consensus, ledger, and networking.
  - [cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync): follows the chain and writes it into PostgreSQL for querying.
  - [cardano-graphql](https://github.com/cardano-foundation/cardano-graphql): a typed, queryable API for Cardano.
  - [cardano-rosetta](https://github.com/cardano-foundation/cardano-rosetta-java): a Cardano implementation of the Mesh (Rosetta) exchange-integration API.
  - [cardano-addresses](https://github.com/IntersectMBO/cardano-addresses): mnemonic creation, seed conversion, and address derivation.
  - See also the [Cardano components overview](/docs/get-started/infrastructure/node/cardano-components).

## What's next

- New to dApps? Start with [Connect a wallet](/docs/build/integrate/connect-a-wallet).
- Building a protocol? Read [DeFi on Cardano](/docs/build/integrate/defi), then [Oracles](/docs/build/integrate/oracles/overview).
