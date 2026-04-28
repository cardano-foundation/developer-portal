---
title: Client Basics
description: Learn the basics of creating and using an Evolution SDK client
---

# Client Basics

The Evolution SDK client is your primary interface to the Cardano blockchain. It combines wallet management, provider communication, and transaction building into a single, cohesive API. Once configured, the client handles UTxO selection, fee calculation, and signing—letting you focus on your application logic.

Think of the client as your persistent connection: configure it once with your network, provider, and wallet, then use it throughout your application to build and submit transactions. All operations maintain type safety and composability through Effect-TS.

## Creating a Client

Configure your client with three essential pieces: the network (mainnet/preprod/preview), your blockchain provider, and the wallet for signing:

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

## The Transaction Workflow

Evolution SDK follows a three-stage pattern: build, sign, submit. Each stage returns a new builder with stage-specific methods, preventing invalid operations (like submitting before signing).

### Stage 1: Building

Start with `client.newTx()` and chain operations to specify outputs, metadata, or validity ranges:

```ts
const builder = client.newTx()

builder.payToAddress({
  address: Address.fromBech32(
    "addr_test1qzx9hu8j4ah3auytk0mwcupd69hpc52t0cw39a65ndrah86djs784u92a3m5w475w3w35tyd6v3qumkze80j8a6h5tuqq5xe8y"
  ),
  assets: Assets.fromLovelace(2000000n)
})

const signBuilder = await builder.build()
```

### Stage 2: Signing

Call `.sign()` on the built transaction to create signatures with your wallet:

```ts
const submitBuilder = await signBuilder.sign()
```

### Stage 3: Submitting

Finally, `.submit()` broadcasts the signed transaction to the blockchain and returns the transaction hash:

```ts
const txId = await submitBuilder.submit()
console.log("Transaction submitted:", txId)
```

## Putting It All Together

Here's the complete workflow in a single example—from client creation through transaction submission:

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })

// Build transaction
const builder = client.newTx()
builder.payToAddress({
  address: Address.fromBech32(
    "addr_test1qzx9hu8j4ah3auytk0mwcupd69hpc52t0cw39a65ndrah86djs784u92a3m5w475w3w35tyd6v3qumkze80j8a6h5tuqq5xe8y"
  ),
  assets: Assets.fromLovelace(2000000n)
})

// Build, sign, and submit
const signBuilder = await builder.build()
const submitBuilder = await signBuilder.sign()
const txId = await submitBuilder.submit()

console.log("Transaction ID:", txId)
```

## Next Steps

- [Provider Setup Comparison](./providers) - Choose the right provider
- [Building Transactions](../transactions/first-transaction) - Learn transaction construction
- [Wallets](../wallets) - Explore wallet types
