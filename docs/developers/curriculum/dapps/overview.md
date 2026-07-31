---
id: overview
title: Build a dApp
sidebar_label: Overview
description: Connect Cardano to your application (wallets, payments, oracles, and AI agents) and build DeFi protocols on the eUTXO model.
---

You arrive from [Smart Contracts](/docs/developers/curriculum/smart-contracts/overview) able to write and test validators. This module is about meeting users where they are: connecting Cardano to web apps, services, and protocols.

It runs as two arcs. The first puts an application in front of users; the second builds the protocols underneath. Two side-tracks branch off, and you can skip both without losing the thread.

## Connect users

The path most applications follow, in order:

- **[Your first dApp](/docs/developers/curriculum/dapps/your-first-dapp)**: assemble a working app end to end from a runnable template, connect a wallet, read a balance, send ADA.
- **[Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet)**: the CIP-30 connector in depth, including the frontend-signs, backend-submits split every production dApp needs.
- **[Wallet authentication](/docs/developers/curriculum/dapps/wallet-authentication)**: passwordless sign-in by proving wallet ownership with a signed message.
- **[Listen for payments](/docs/developers/curriculum/dapps/listen-for-payments)**: the receiving side, detecting and confirming ADA arriving at an address.
- **[Sponsored transactions](/docs/developers/curriculum/dapps/sponsored-transactions)**: multi-party transactions where someone other than the user covers the fee.

For the transactions behind these flows, see [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction) and [lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend).

## Build protocols

What runs underneath an application, where the eUTXO model shapes the design:

- **[DeFi on Cardano](/docs/developers/curriculum/dapps/defi)**: DEXes, AMMs, liquidity pools, lending, and the eUTXO-specific answers to concurrency (order batching, pool sharding, transaction chaining).
- **[Oracles on Cardano](/docs/developers/curriculum/dapps/oracles/overview)**: how off-chain data gets on-chain, the push and pull models, and what each trust choice buys you.
- **[Integrate a price feed](/docs/developers/curriculum/dapps/oracles/pyth)**: the practice, a working Pyth integration in three steps plus the validator patterns that use it.
- **[A price-settled prediction market](/docs/developers/curriculum/dapps/oracles/prediction-market)**: those patterns assembled into one complete oracle-consuming dApp, walked end to end.
- **[On-chain randomness](/docs/developers/curriculum/dapps/oracles/randomness)**: why a validator cannot generate a random number, and the constructions that work anyway.

## Side-track: AI agents

An agent that holds a wallet and acts without a human is the same building blocks driven by different logic, plus the infrastructure an agent economy needs.

- **[AI agents on Cardano](/docs/developers/curriculum/dapps/ai-agents/overview)**: what an autonomous on-chain agent requires.
- **[Agent economy (Masumi)](/docs/developers/curriculum/dapps/ai-agents/masumi)**: identity, escrowed payments, and discovery as a protocol.
- **[MCP access](/docs/developers/curriculum/dapps/ai-agents/mcp)**: giving an AI assistant Cardano tools, and where the signing boundary stays.

## Side-track: Internet of Things

- **[IoT on Cardano](/docs/developers/curriculum/dapps/iot/)**: hands-on workshops that read and write the chain from microcontrollers, from fetching a wallet balance onto a display to minting sensor data on-chain, plus hardware references and troubleshooting.

## Exchanges and custodial services

Integrating at a lower level than a dApp (accounting, address management, transaction handling) is its own guide: [Exchange integrations](/docs/developers/exchange-integrations). The components such an integration builds on are listed in [Cardano components](/docs/developers/curriculum/fundamentals/cardano-components).

## Next steps

- New to dApps? Start with [Your first dApp](/docs/developers/curriculum/dapps/your-first-dapp), a working app assembled end to end.
- Building a protocol? Read [DeFi on Cardano](/docs/developers/curriculum/dapps/defi), then [Oracles](/docs/developers/curriculum/dapps/oracles/overview).
- Ready to launch? [Ship to Production](/docs/developers/curriculum/production/overview) takes the app from testnet to mainnet, and scales it.
