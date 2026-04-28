---
title: 'Tutorial: Token Airdrop'
description: Distribute tokens to many recipients using batched transactions and chaining
---

# Tutorial: Token Airdrop

Distribute tokens to dozens or hundreds of recipients efficiently. This tutorial covers batching payments to stay within transaction size limits and chaining batches for sequential submission.

## What You'll Build

- A **batch payment function** that sends to multiple recipients in one transaction
- A **chunking strategy** to split large recipient lists into transaction-sized batches
- **Transaction chaining** so batches submit sequentially without waiting for confirmations

## Prerequisites

- A Blockfrost API key ([get one free](https://blockfrost.io))
- Tokens already in your wallet (or see [Minting Tokens](../smart-contracts/minting) to create them)
- Familiarity with [multi-output transactions](./multi-output) and [transaction chaining](./chaining)

## Step 1: Define the Recipient List

```typescript
import { Address, Assets } from "@evolution-sdk/evolution"

interface Recipient {
  address: Address.Address
  lovelace: bigint
}

// Your airdrop recipients
const recipients: Recipient[] = [
  { address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"), lovelace: 5_000_000n },
  { address: Address.fromBech32("addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"), lovelace: 10_000_000n },
  // ... potentially hundreds more
]
```

## Step 2: Chunk Into Batches

A single Cardano transaction has a max size (~16KB). Each output adds ~60-100 bytes, so you can fit roughly **20-30 recipients per transaction**. Chunk the list:

```typescript
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

const BATCH_SIZE = 25 // conservative — adjust based on output size
const batches = chunk(recipients, BATCH_SIZE)
// e.g., 100 recipients → 4 batches of 25
```

:::info
**Why 25?** Each output needs ~80 bytes for address + amount. With overhead, 25 outputs keeps you well under the 16KB limit. If outputs include native tokens, reduce the batch size (tokens add ~50-100 bytes each).
:::

## Step 3: Build and Submit Batches

### Simple Approach: Sequential Submission

Wait for each batch to confirm before submitting the next:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const batches: Recipient[][]

async function submitBatches() {
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]

    // Build multi-output transaction
    let builder = client.newTx()
    for (const recipient of batch) {
      builder = builder.payToAddress({
        address: recipient.address,
        assets: Assets.fromLovelace(recipient.lovelace),
      })
    }

    const tx = await builder.build()
    const signed = await tx.sign()
    const txHash = await signed.submit()

    console.log(`Batch ${i + 1}/${batches.length} submitted:`, txHash)

    // Wait for confirmation before next batch
    await client.awaitTx(txHash, 3000)
    console.log(`Batch ${i + 1} confirmed`)
  }
}
```

### Fast Approach: Transaction Chaining

Don't wait for confirmations — chain batches using `chainResult()`:

```typescript
import { Address, Assets, TransactionHash, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const batches: Recipient[][]

async function chainedAirdrop() {
  const txHashes: TransactionHash.TransactionHash[] = []

  // Get initial UTxOs
  let availableUtxos = await client.getWalletUtxos()

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]

    let builder = client.newTx()
    for (const recipient of batch) {
      builder = builder.payToAddress({
        address: recipient.address,
        assets: Assets.fromLovelace(recipient.lovelace),
      })
    }

    // Build with available UTxOs from previous batch
    const signBuilder = await builder.build({ availableUtxos })
    const signed = await signBuilder.sign()
    const txHash = await signed.submit()

    txHashes.push(txHash)
    console.log(`Batch ${i + 1}/${batches.length} submitted:`, txHash)

    // Chain: use remaining UTxOs + new outputs for next batch
    const chainResult = signBuilder.chainResult()
    availableUtxos = [...chainResult.available]
  }

  // Wait for last batch to confirm (all prior batches will be confirmed too)
  const lastHash = txHashes[txHashes.length - 1]
  await client.awaitTx(lastHash, 3000)
  console.log("All batches confirmed!")

  return txHashes
}
```

:::warning
**Submit in order.** Each chained transaction depends on outputs from the previous one. If batch 2 arrives at the node before batch 1, it gets rejected. The sequential `for` loop ensures correct ordering.
:::

## Step 4: Airdrop with Native Tokens

Distribute tokens (not just ADA) — each recipient gets tokens + min ADA:

```typescript
import { Address, Assets } from "@evolution-sdk/evolution"

interface TokenRecipient {
  address: Address.Address
  lovelace: bigint
  policyId: string    // 56 hex chars
  assetName: string   // hex-encoded token name
  quantity: bigint
}

function buildTokenOutput(recipient: TokenRecipient): { address: Address.Address; assets: Assets.Assets } {
  let assets = Assets.fromLovelace(recipient.lovelace) // min ADA for UTxO
  assets = Assets.addByHex(assets, recipient.policyId, recipient.assetName, recipient.quantity)
  return { address: recipient.address, assets }
}

// Use in the batch loop:
// builder = builder.payToAddress(buildTokenOutput(recipient))
```

:::info
When distributing native tokens, each output needs **more ADA** for the min UTxO requirement (tokens increase UTxO size). Use at least 2 ADA per output with tokens. The builder calculates the exact minimum automatically.
:::

## Common Pitfalls

| Problem | Cause | Fix |
| --- | --- | --- |
| "Transaction too large" | Too many outputs per batch | Reduce `BATCH_SIZE` (try 15-20) |
| "Insufficient funds" | Not enough ADA for all outputs + fees | Ensure wallet has total amount + fees for all batches |
| Batch 2 rejected | Submitted before batch 1 | Use sequential loop, not parallel |
| "Min UTxO not met" | Output has too little ADA | Increase lovelace per output (2+ ADA with tokens) |
| Chaining fails | availableUtxos not updated | Pass `chainResult.available` to next build |

## Next Steps

- [Multi-Output Transactions](./multi-output) — Basic multi-recipient patterns
- [Transaction Chaining](./chaining) — How chainResult works
- [Minting Tokens](../smart-contracts/minting) — Mint tokens before distributing
- [Tutorial: Mint an NFT](../smart-contracts/mint-nft) — Mint + send in one transaction
