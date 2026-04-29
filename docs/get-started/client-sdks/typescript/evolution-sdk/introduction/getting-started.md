---
title: Getting Started
description: Quick start guide to your first Evolution SDK transaction
sidebar_position: 4
---

# Getting Started

Evolution SDK is a type-safe, composable toolkit for building Cardano applications. With Effect-TS at its core, you get compile-time safety, composable operations, and a unified API that works consistently across all features.

This guide walks you through building your first transaction—from creating a client to submitting on-chain. You'll learn the essential pattern that applies to everything in Evolution SDK: configure once, compose freely.

Perfect for developers new to the SDK or those migrating from other Cardano libraries looking for a working foundation to build upon.

## Choose Your Setup

This guide uses **Blockfrost** + **seed phrase** for the quickest path. If your setup is different, jump to the right guide:

| Your Setup | Guide |
| --- | --- |
| **Backend / server-side** | This page (Blockfrost + seed phrase) |
| **Frontend / dApp** | [API Wallets](../wallets/api-wallet.md) (CIP-30 browser wallet) |
| **Self-hosted infra** | [Kupmios Provider](../providers/provider-types.md) (Ogmios + Kupo) |
| **Local development** | [Devnet](../devnet/getting-started.md) (Docker-based local chain) |
| **Multiple providers** | [Provider Types](../providers/provider-types.md) (compare all options) |

## Key Concept: Provider + Wallet = Client

Before diving in, understand the two halves of a client:

- **Provider** — reads from the blockchain (query UTxOs, protocol parameters, submit transactions). Think of it as your connection to the network.
- **Wallet** — signs transactions (holds keys or connects to a browser extension). Without a wallet, you can build but not sign.

A **signing client** has both: it can build, sign, and submit. A **read-only client** has only a provider + address: it can build unsigned transactions but cannot sign. See [Client Architecture](../clients/architecture.md) for full details.

This guide creates a signing client. If you're building a frontend dApp where the user's browser wallet signs, see [API Wallets](../wallets/api-wallet.md) instead.

## Prerequisites

- Node.js 18+ or browser environment with ES modules support
- Basic TypeScript knowledge
- A Cardano testnet wallet with some tADA (get from [faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/))

:::info
This guide uses **preprod testnet**. Never use real mainnet funds while learning. Get free test ADA from the [Cardano faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/).
:::

## Your First Transaction

### 1. Installation

```bash
npm install @evolution-sdk/evolution
```

### 2. Create a Wallet

Instantiate a wallet using your seed phrase or private keys:

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withSeed({
    mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    accountIndex: 0
  })
```

See [Creating Wallets](../wallets/overview.md) for all wallet types.

### 3. Attach a Provider

Connect to the blockchain via a provider:

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({
    mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    accountIndex: 0
  })
```

Learn more in [Clients](../clients/overview.md) and [Providers](../clients/providers.md).

### 4. Build a Transaction

Construct your first payment:

```ts
const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32(
      "addr_test1qzrf9g3ea6hdc5vfujgrpjc0c0xq3qqkz8zkpwh3s6nqzhgey8k3eq73kr0gcqd7cyy75s0qqx0qqx0qqx0qqx0qx7e8pq"
    ),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()
```

Details in [Transactions](../transactions/overview.md).

### 5. Sign & Submit

Sign with your wallet and send to the network:

```ts
const signed = await tx.sign()
const hash = await signed.submit()
console.log("Transaction submitted:", hash)
```

## What's Next?

- **[Common Patterns](../common-patterns.md)** - Quick recipes for frequent tasks
- **[API Overview](../api-overview.md)** - Find the right module by task
- **[Clients](../clients/overview.md)** - Connect to different blockchains and providers
- **[Wallets](../wallets/overview.md)** - Explore all wallet types and key management
- **[Transactions](../transactions/overview.md)** - Build complex multi-output transactions
- **[Querying](../querying/overview.md)** - Query UTxOs and blockchain state
- **[API Reference](https://no-witness-labs.github.io/evolution-sdk/)** - Full API documentation

## Need Help?

Check out [Addresses](../addresses/overview.md), [Assets](../assets/overview.md), and [Advanced](../advanced/overview.md) for deeper topics.
