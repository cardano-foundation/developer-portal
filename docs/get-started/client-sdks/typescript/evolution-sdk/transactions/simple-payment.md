---
title: Simple Payment
description: Send a simple payment transaction on Cardano
---

# Simple Payment

Sending value from one address to another is the most fundamental blockchain operation. Evolution SDK makes it straightforward: specify the recipient and amount, then build, sign, and submit.

This guide covers common payment patterns—from basic ADA transfers to payments including native tokens. You'll see how to structure amounts, handle multiple assets, and follow best practices for production applications.

## Basic ADA Payment

The simplest transaction sends only lovelace (ADA's smallest unit). 1 ADA = 1,000,000 lovelace:

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

// Send 2 ADA
const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()

const signed = await tx.sign()
const hash = await signed.submit()
console.log("Transaction hash:", hash)
```

## Working with ADA Amounts

Use these common conversions for clarity:

```ts
// Common ADA amounts in lovelace
const oneADA = 1_000_000n
const halfADA = 500_000n
const tenADA = 10_000_000n

// Calculate dynamically
const amount = 2.5
const lovelace = BigInt(amount * 1_000_000)

console.log(lovelace) // 2500000n
```

## Payments with Native Tokens

Include native tokens (custom tokens or NFTs) alongside ADA. The `assets` object takes any asset by its policy ID + asset name:

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

// Send 2 ADA plus 100 tokens
const policyId = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1"
const assetName = "" // empty for fungible tokens
let assets = Assets.fromLovelace(2_000_000n)
assets = Assets.addByHex(assets, policyId, assetName, 100n)

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

The policy ID + asset name is concatenated into a single hex string.

## Common Patterns

### Using Named Variables

Make your code more readable with descriptive variable names:

```ts
const recipientAddress = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const paymentAmount = 5_000_000n // 5 ADA

const tx = await client
  .newTx()
  .payToAddress({
    address: recipientAddress,
    assets: Assets.fromLovelace(paymentAmount)
  })
  .build()
```

### Environment-Based Amounts

Adjust transaction values based on network or configuration:

```ts
const isMainnet = process.env.NETWORK === "mainnet"
const amount = isMainnet ? 5_000_000n : 1_000_000n

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(amount)
  })
  .build()
```

## Best Practices

Follow these guidelines for safe, reliable payments:

- **Test on testnet first** - Always verify transaction logic on preprod or preview networks before mainnet
- **Validate addresses** - Check address format and network match before building transactions
- **Review fees** - Inspect calculated fees in the built transaction before signing
- **Secure credentials** - Use environment variables for mnemonics and API keys, never hardcode
- **Start small** - Test with minimal amounts when deploying new payment logic

## Next Steps

- [Your First Transaction](./first-transaction) - Complete walkthrough with detailed explanations
- [Multi-Output](./multi-output) - Send to multiple recipients in one transaction
- [Querying](../querying) - Check balances and transaction status
- [Assets](../assets) - Working with native tokens and NFTs
