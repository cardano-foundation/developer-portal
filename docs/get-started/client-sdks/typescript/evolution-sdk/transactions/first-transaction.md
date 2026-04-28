---
title: Your First Transaction
description: Complete walkthrough of building, signing, and submitting a simple payment transaction on Cardano using Evolution SDK.
---

# Your First Transaction

Building a Cardano transaction involves three clear stages: construction (specifying outputs and constraints), signing (cryptographically authorizing with your wallet), and submission (broadcasting to the network). Evolution SDK makes this workflow type-safe—each stage returns a builder that only exposes valid operations for that phase.

This guide walks through a complete payment transaction from client setup to on-chain confirmation. You'll learn the fundamental pattern that applies to all Evolution SDK transactions, regardless of complexity.

## Complete Example

Here's a full transaction workflow—configure once, then build, sign, and submit:

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

// 1. Configure your client
const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })

// 2. Build transaction
const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()

// 3. Sign with your wallet
const signed = await tx.sign()

// 4. Submit to network
const txHash = await signed.submit()
console.log("Transaction submitted:", txHash)
```

## Breaking It Down

### Stage 1: Client Configuration

Set up your connection to the network. This happens once—you'll reuse the client throughout your application:

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
```

### Stage 2: Building the Transaction

Chain operations to specify what the transaction should do. Call `.build()` when ready to finalize:

```ts
const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build()
```

The builder handles UTxO selection, fee calculation, and change outputs automatically.

### Stage 3: Signing

Authorize the transaction with your wallet's private keys:

```ts
const signed = await tx.sign()
```

### Stage 4: Submission

Broadcast the signed transaction to the blockchain and get the transaction hash:

```ts
const txHash = await signed.submit()
console.log("Transaction hash:", txHash)
```

## What Happens Under the Hood

Evolution SDK handles several complex operations automatically:

- **UTxO Selection**: Chooses inputs from your wallet that cover the payment amount plus fees
- **Fee Calculation**: Computes minimum required fees based on transaction size and protocol parameters
- **Change Output**: Creates a change output sending excess value back to your wallet
- **Balance Checking**: Validates you have sufficient funds before building
- **Witness Creation**: Generates cryptographic signatures during signing

You focus on what to send—Evolution SDK handles how to send it correctly.

## Next Steps

- [Simple Payment](./simple-payment) - Common payment patterns and examples
- [Multi-Output](./multi-output) - Send to multiple addresses in one transaction
- [Wallets](../wallets) - Different wallet types and configuration
- [Querying](../querying) - Check transaction status and balances
