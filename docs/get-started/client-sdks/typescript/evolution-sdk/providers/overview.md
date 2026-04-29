---
title: Providers
description: Blockchain data access and transaction submission through provider APIs
---

import DocCardList from '@theme/DocCardList';

# Providers

Providers give your application access to blockchain data and transaction submission capabilities. The Evolution SDK supports multiple provider types, each connecting to different Cardano infrastructure.

<DocCardList />

## What is a Provider?

A provider handles communication with the Cardano blockchain. It allows you to query UTxOs, protocol parameters, delegation information, and submit transactions without needing direct node access.

The SDK abstracts provider differences through a unified interface. Choose your provider based on infrastructure preferences, feature requirements, and deployment environment.

## Quick Start

Create a provider-only client to query blockchain data:

```typescript
import { Address, Transaction, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Query protocol parameters
const params = await client.getProtocolParameters()
console.log("Min fee A:", params.minFeeA)

// Query any address
const utxos = await client.getUtxos(Address.fromBech32("addr1..."))
console.log("UTxOs found:", utxos.length)

// Submit pre-signed transaction
const signedTx = Transaction.fromCBORHex("84a300...") // Signed transaction
const txHash = await client.submitTx(signedTx)
```

## Available Providers

| Provider       | Infrastructure | Best For                           |
| -------------- | -------------- | ---------------------------------- |
| **Blockfrost** | Hosted API     | Production apps, rapid development |
| **Kupmios**    | Ogmios + Kupo  | Self-hosted, full control          |
| **Maestro**    | Hosted API     | Advanced features, analytics       |
| **Koios**      | Community API  | Decentralized infrastructure       |

See [Provider Types](./provider-types.md) for detailed comparison and configuration.

## Provider-Only Client vs Read-Only Client

Understanding the difference helps choose the right architecture:

| Feature                 | Provider-Only Client      | Read-Only Client            |
| ----------------------- | ------------------------- | --------------------------- |
| **Configuration**       | Provider only             | Provider + wallet address   |
| **Query ANY address**   | Yes                       | Yes                         |
| **Query OWN address**   | No (no wallet configured) | Yes (`getWalletUtxos()`)    |
| **Build transactions**  | No (no wallet address)    | Yes (unsigned transactions) |
| **Sign transactions**   | No                        | No                          |
| **Submit transactions** | Yes (if has signed CBOR)  | Yes (if has signed CBOR)    |

**Provider-Only Client** is for generic blockchain queries and transaction submission when you don't need a specific wallet address.

**Read-Only Client** is for building unsigned transactions for a specific user address (backend transaction building pattern).

## Use Cases

**Provider-Only Client:**

- Blockchain explorers querying multiple addresses
- Transaction submission services
- Protocol parameter monitoring
- Generic datum resolution
- Multi-address portfolio tracking

**Read-Only Client:**

- Backend transaction building for dApps
- Building unsigned transactions for user addresses
- Wallet-specific UTxO management
- User-specific delegation queries

## Next Steps

Start with [Provider Types](./provider-types.md) to choose the right provider for your application, or jump to [Provider-Only Client](./provider-only-client.md) to begin querying the blockchain.
