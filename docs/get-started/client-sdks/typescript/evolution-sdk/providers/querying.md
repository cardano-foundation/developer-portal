---
title: Querying
description: Query blockchain data with provider methods
---

# Querying

Providers expose methods to query UTxOs, protocol parameters, delegation information, and datums. All methods work identically across provider types.

## Protocol Parameters

Retrieve current network parameters for fee calculation and transaction constraints:

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const params = await client.getProtocolParameters()

// Fee calculation parameters
console.log("Min fee A:", params.minFeeA)
console.log("Min fee B:", params.minFeeB)

// Transaction limits
console.log("Max tx size:", params.maxTxSize)

// Deposits
console.log("Key deposit:", params.keyDeposit)
console.log("Pool deposit:", params.poolDeposit)

// Script execution costs
console.log("Price memory:", params.priceMem)
console.log("Price steps:", params.priceStep)
```

## UTxO Queries

Query unspent transaction outputs by address, credential, unit, or reference.

### By Address

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Get all UTxOs at address
const utxos = await client.getUtxos(
  Address.fromBech32(
    "addr1qxy8sclc58rsck0pzsc0v4skmqjwuqsqpwfcvrdldl5sjvvhyltp7fk0fmtmrlnykgmhnzcns2msa2cmpvllzgqd2azqhpv8e4"
  )
)

// Calculate total ADA
const totalLovelace = utxos.reduce((sum, utxo) => sum + (utxo.assets.lovelace ?? 0n), 0n)
console.log("Total ADA:", Number(totalLovelace) / 1_000_000)

// List native assets
utxos.forEach((utxo) => {
  Object.entries(utxo.assets).forEach(([unit, amount]) => {
    if (unit !== "lovelace") {
      console.log(`Asset: ${unit}, Amount: ${amount}`)
    }
  })
})
```

### By Credential

Query UTxOs by payment credential instead of full address:

```typescript
import { Credential, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Create credential from key hash
const credential = Credential.keyHash("payment-key-hash-here")

// Query by credential
const utxos = await client.getUtxos(credential)
```

### By Unit

Query UTxOs containing specific native asset:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const policyId = "abc123def456abc123def456abc123def456abc123def456abc123de7890"
const assetName = "MyToken"
const unit = policyId + assetName

const utxosWithToken = await client.getUtxosWithUnit(
  Address.fromBech32(
    "addr1qxy8sclc58rsck0pzsc0v4skmqjwuqsqpwfcvrdldl5sjvvhyltp7fk0fmtmrlnykgmhnzcns2msa2cmpvllzgqd2azqhpv8e4"
  ),
  unit
)

console.log("UTxOs with token:", utxosWithToken.length)
```

### By Reference

Query specific UTxOs by transaction output reference:

```typescript
import { TransactionHash, TransactionInput, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const utxos = await client.getUtxosByOutRef([
  new TransactionInput.TransactionInput({
    transactionId: TransactionHash.fromHex("abc123..."),
    index: 0n
  }),
  new TransactionInput.TransactionInput({
    transactionId: TransactionHash.fromHex("def456..."),
    index: 1n
  })
])

console.log("Found UTxOs:", utxos.length)
```

### By Unit (Single)

Find a single UTxO by unique unit identifier:

```typescript
import { Address, TransactionHash, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const nftUnit = "policyId" + "tokenName"
const utxo = await client.getUtxoByUnit(nftUnit)

console.log("NFT found at:", Address.toBech32(utxo.address))
console.log("Current owner UTxO:", TransactionHash.toHex(utxo.transactionId))
```

## Delegation Queries

Query staking delegation and reward information:

```typescript
import { RewardAddress, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const delegation = await client.getDelegation(RewardAddress.RewardAddress.make("stake1uxy..."))

console.log("Delegated to pool:", delegation.poolId)
console.log("Is delegated:", delegation.poolId !== undefined)
console.log("Rewards:", delegation.rewards)
```

## Datum Resolution

Retrieve datum content by hash:

```typescript
import { Bytes, DatumHash, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

const datumHash = new DatumHash.DatumHash({ hash: Bytes.fromHex("abc123...") })
const datumCbor = await client.getDatum(datumHash)

console.log("Datum CBOR:", datumCbor)
```

## Query Patterns

### Portfolio Balance

Calculate total balance across multiple addresses:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function getPortfolioBalance(addressesBech32: string[]) {
  const balances = await Promise.all(
    addressesBech32.map(async (addressBech32) => {
      const address = Address.fromBech32(addressBech32)
      const utxos = await client.getUtxos(address)
      const lovelace = utxos.reduce((sum, utxo) => sum + utxo.assets.lovelace, 0n)

      return {
        address: addressBech32,
        lovelace,
        ada: Number(lovelace) / 1_000_000
      }
    })
  )

  const totalLovelace = balances.reduce((sum, b) => sum + b.lovelace, 0n)

  return {
    addresses: balances,
    total: {
      lovelace: totalLovelace,
      ada: Number(totalLovelace) / 1_000_000
    }
  }
}
```

### Token Holdings

Find all holders of a specific token:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function getTokenHolders(addresses: string[], tokenUnit: string) {
  const holders = []

  for (const addressBech32 of addresses) {
    const address = Address.fromBech32(addressBech32)
    const utxos = await client.getUtxosWithUnit(address, tokenUnit)

    if (utxos.length > 0) {
      holders.push({
        address: addressBech32,
        amount: BigInt(utxos.length),
        utxoCount: utxos.length
      })
    }
  }

  return holders
}
```

### Delegation Status

Check if addresses are delegated to specific pool:

```typescript
import { PoolKeyHash, RewardAddress, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function checkPoolDelegation(rewardAddresses: string[], targetPoolIdHex: string) {
  const results = await Promise.all(
    rewardAddresses.map(async (rewardAddress) => {
      const delegation = await client.getDelegation(RewardAddress.RewardAddress.make(rewardAddress))

      return {
        rewardAddress,
        delegatedToTarget: delegation.poolId !== null && PoolKeyHash.toHex(delegation.poolId) === targetPoolIdHex,
        currentPool: delegation.poolId,
        isDelegated: delegation.poolId !== null,
        rewards: delegation.rewards
      }
    })
  )

  return results
}
```

### NFT Ownership

Track NFT ownership across collection:

```typescript
import { Address, TransactionHash, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function getNFTOwnership(nftUnits: string[]) {
  const ownership = await Promise.all(
    nftUnits.map(async (unit) => {
      try {
        const utxo = await client.getUtxoByUnit(unit)
        return {
          unit,
          owner: Address.toBech32(utxo.address),
          txHash: TransactionHash.toHex(utxo.transactionId),
          outputIndex: utxo.index
        }
      } catch (error: any) {
        return {
          unit,
          owner: null,
          error: "Not found or burned"
        }
      }
    })
  )

  return ownership
}
```

## Error Handling

Handle query errors gracefully:

```typescript
import { Address, RewardAddress, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

async function safeGetUtxos(addressBech32: string) {
  try {
    const address = Address.fromBech32(addressBech32)
    const utxos = await client.getUtxos(address)
    return { success: true as const, utxos }
  } catch (error: any) {
    console.error("Failed to query UTxOs:", error)
    return { success: false as const, error: error.message }
  }
}

async function safeGetDelegation(rewardAddress: string) {
  try {
    const delegation = await client.getDelegation(RewardAddress.RewardAddress.make(rewardAddress))
    return { success: true as const, delegation }
  } catch (error: any) {
    return { success: false as const, error: error.message }
  }
}
```

## Performance Considerations

Optimize queries for better performance:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Batch queries in parallel
async function batchQuery(addressesBech32: string[]) {
  const results = await Promise.all(addressesBech32.map((addr) => client.getUtxos(Address.fromBech32(addr))))
  return results
}

// Cache protocol parameters
type ProtocolParams = Awaited<ReturnType<typeof client.getProtocolParameters>>
let cachedParams: ProtocolParams | null = null
let cacheTime = 0
const CACHE_DURATION = 300000 // 5 minutes

async function getCachedProtocolParameters() {
  const now = Date.now()
  if (!cachedParams || now - cacheTime > CACHE_DURATION) {
    cachedParams = await client.getProtocolParameters()
    cacheTime = now
  }
  return cachedParams
}
```

## Next Steps

Learn about transaction submission:

- [Submission](./submission.md) - Submit and monitor transactions
- [Use Cases](./use-cases.md) - Complete real-world examples
