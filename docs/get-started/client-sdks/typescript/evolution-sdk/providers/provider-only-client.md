---
title: Provider-Only Client
description: Query blockchain data without wallet configuration
---

# Provider-Only Client

A provider-only client gives you blockchain access without wallet configuration. Use it to query any address, fetch protocol parameters, and submit pre-signed transactions.

## When to Use

Provider-only clients are ideal when you need blockchain data but not wallet-specific operations:

**Use provider-only client for:**

- Blockchain explorers querying multiple addresses
- Transaction submission services
- Protocol parameter monitoring
- Generic datum resolution
- Multi-address portfolio tracking

**Use read-only client instead for:**

- Building unsigned transactions for specific user
- Backend transaction building in dApps
- Wallet-specific UTxO queries
- User delegation information

## Basic Setup

Create a client with only provider configuration:

```typescript
import {
  Address,
  Assets,
  Bytes,
  DatumHash,
  RewardAddress,
  Transaction,
  TransactionHash,
  TransactionInput,
  mainnet,
  Client,
} from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Query any address
const utxos = await client.getUtxos(
  Address.fromBech32(
    "addr1qxy8sclc58rsck0pzsc0v4skmqjwuqsqpwfcvrdldl5sjvvhyltp7fk0fmtmrlnykgmhnzcns2msa2cmpvllzgqd2azqhpv8e4"
  )
)
console.log("Found UTxOs:", utxos.length)

// Get protocol parameters
const params = await client.getProtocolParameters()
console.log("Min fee A:", params.minFeeA)
```

## Available Methods

Provider-only clients expose all provider methods directly:

```typescript
import {
  Address,
  Bytes,
  DatumHash,
  RewardAddress,
  Transaction,
  TransactionHash,
  TransactionInput,
  mainnet,
  Client,
} from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Protocol parameters
const params = await client.getProtocolParameters()

// UTxO queries - use Address.fromBech32 for addresses
const address = Address.fromBech32(
  "addr1qxy8sclc58rsck0pzsc0v4skmqjwuqsqpwfcvrdldl5sjvvhyltp7fk0fmtmrlnykgmhnzcns2msa2cmpvllzgqd2azqhpv8e4"
)
const utxos = await client.getUtxos(address)
const utxosWithAda = await client.getUtxosWithUnit(address, "lovelace")
const utxosByRefs = await client.getUtxosByOutRef([
  new TransactionInput.TransactionInput({
    transactionId: TransactionHash.fromHex("abc123def456..."),
    index: 0n
  })
])

// Delegation
const delegation = await client.getDelegation(RewardAddress.RewardAddress.make("stake1uxy..."))

// Datum resolution
const datum = await client.getDatum(new DatumHash.DatumHash({ hash: Bytes.fromHex("datum-hash-here") }))

// Transaction operations
const signedTxCbor = "84a300..."
const signedTx = Transaction.fromCBORHex(signedTxCbor)
const txHash = await client.submitTx(signedTx)
const confirmed = await client.awaitTx(txHash)

const unsignedTxCbor = "84a300..."
const unsignedTx = Transaction.fromCBORHex(unsignedTxCbor)
const evaluated = await client.evaluateTx(unsignedTx)
```

## Querying Multiple Addresses

Portfolio tracker for multiple addresses:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function getPortfolioBalance(addressesBech32: string[]) {
  const results = await Promise.all(
    addressesBech32.map(async (addressBech32) => {
      const utxos = await client.getUtxos(Address.fromBech32(addressBech32))
      const lovelace = utxos.reduce((sum, utxo) => sum + utxo.assets.lovelace, 0n)
      return { address: addressBech32, lovelace }
    })
  )

  return results
}

const portfolio = await getPortfolioBalance([
  "addr1qxy8sclc58rsck0pzsc0v4skmqjwuqsqpwfcvrdldl5sjvvhyltp7fk0fmtmrlnykgmhnzcns2msa2cmpvllzgqd2azqhpv8e4"
])
```

## Transaction Submission Service

Accept signed transactions and submit to blockchain:

```typescript
import { Transaction, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

export async function submitTransaction(signedTxCbor: string) {
  try {
    const signedTx = Transaction.fromCBORHex(signedTxCbor)
    const txHash = await client.submitTx(signedTx)
    const confirmed = await client.awaitTx(txHash, 5000)
    return { success: true, txHash, confirmed }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

## Protocol Parameter Monitoring

Track network parameters for fee estimation or protocol changes:

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function monitorProtocolParameters() {
  const params = await client.getProtocolParameters()
  return {
    minFeeA: params.minFeeA,
    minFeeB: params.minFeeB,
    maxTxSize: params.maxTxSize,
    maxValSize: params.maxValSize,
    keyDeposit: params.keyDeposit,
    poolDeposit: params.poolDeposit,
    priceMem: params.priceMem,
    priceStep: params.priceStep
  }
}

setInterval(async () => {
  const params = await monitorProtocolParameters()
  console.log("Current parameters:", params)
}, 3600000) // Every hour
```

## Limitations

Provider-only clients cannot perform wallet-scoped operations:

```typescript
// Cannot sign - no private key
client.signTx("84a400...") // Error: signTx not available

// Cannot get own address - no wallet
client.address() // Error: address not available

// Cannot query wallet-scoped UTxOs without address context
client.getWalletUtxos() // Error: getWalletUtxos not available

// CAN query any address
const utxos = await client.getUtxos(Address.fromBech32("addr1..."))

// CAN submit pre-signed transactions
const signedTx = Transaction.fromCBORHex("84a400...")
const txHash = await client.submitTx(signedTx)
```

## Upgrading to Read-Only Client

Add address context to a provider-only client using `.withAddress()`:

```typescript
import { Address, Assets, mainnet, Client } from "@evolution-sdk/evolution"

// Start with provider only
const providerClient = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Later, add address context for a specific user
const readOnlyClient = providerClient
  .withAddress("addr1qxy8g0m3dnvxpk6dlh40u9vgc8m6hyqyjf6qn6j6t47wnhvcpqp0aw50nln8nyzfh6fjp6sxgajx5q0c6p73xqf2qhvq5pzqsh")

// Now can build transactions for this address
const builder = readOnlyClient.newTx()
builder.payToAddress({
  address: Address.fromBech32(
    "addr1qxh7f8gxv43dxz7k2vf6x5cxj5f5mk5mmqfk5u7qp7t2nvw9pqp0aw50nln8nyzfh6fjp6sxgajx5q0c6p73xqf2qhvqwlx8f7"
  ),
  assets: Assets.fromLovelace(5000000n)
})

const result = await builder.build()
```

## Environment Configuration

Switch between environments:

```typescript
import { mainnet, preprod, Client } from "@evolution-sdk/evolution"

const env = (process.env.NODE_ENV || "development") as "development" | "production"

const client =
  env === "production"
    ? Client.make(mainnet).withKupmios({
        ogmiosUrl: process.env.OGMIOS_URL!,
        kupoUrl: process.env.KUPO_URL!
      })
    : Client.make(preprod).withBlockfrost({
        baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
        projectId: process.env.BLOCKFROST_PREPROD_PROJECT_ID!
      })
```

## Comparison with Read-Only Client

| Feature                 | Provider-Only Client           | Read-Only Client                                                     |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------- |
| **Configuration**       | Provider only                  | Provider + address                                                   |
| **Creation**            | `Client.make(chain).withBlockfrost(...)` | `Client.make(chain).withBlockfrost(...).withAddress(address)` |
| **Query any address**   | `getUtxos(anyAddress)`         | `getUtxos(anyAddress)`                                               |
| **Query own address**   | Not available                  | `getWalletUtxos()`                                                   |
| **Build transactions**  | `newTx()` with manual context  | `newTx()` returns unsigned tx                                        |
| **Sign transactions**   | Not available                  | Not available                                                        |
| **Submit transactions** | `submitTx(signedCbor)`         | `submitTx(signedCbor)`                                               |
| **Use case**            | Generic queries, multi-address | Backend building for specific user                                   |

## Next Steps

Learn more about provider capabilities:

- [Querying](./querying.md) - Master all query methods
- [Submission](./submission.md) - Transaction submission patterns
- [Use Cases](./use-cases.md) - Real-world examples
