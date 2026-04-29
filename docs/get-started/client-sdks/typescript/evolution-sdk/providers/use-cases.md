---
title: Use Cases
description: Real-world provider patterns and complete examples
---

# Use Cases

Practical patterns and complete examples showing how to use providers in real applications.

## Blockchain Explorer

Query and display address information:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface AddressInfo {
  address: string
  lovelace: bigint
  ada: number
  utxoCount: number
}

export async function exploreAddress(addressBech32: string): Promise<AddressInfo> {
  const utxos = await client.getUtxos(Address.fromBech32(addressBech32))
  const lovelace = utxos.reduce((sum, utxo) => sum + utxo.assets.lovelace, 0n)

  return {
    address: addressBech32,
    lovelace,
    ada: Number(lovelace) / 1_000_000,
    utxoCount: utxos.length
  }
}
```

## Portfolio Tracker

Track balances across multiple addresses:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface WalletBalance {
  address: string
  lovelace: bigint
  ada: number
  tokens: Array<{ unit: string; amount: bigint }>
}

interface Portfolio {
  wallets: WalletBalance[]
  total: {
    lovelace: bigint
    ada: number
  }
}

export async function trackPortfolio(addressesBech32: string[]): Promise<Portfolio> {
  const wallets = await Promise.all(
    addressesBech32.map(async (addressBech32) => {
      const utxos = await client.getUtxos(Address.fromBech32(addressBech32))
      let lovelace = 0n
      const tokenMap = new Map<string, bigint>()

      utxos.forEach((utxo) => {
        lovelace += utxo.assets.lovelace
      })

      const tokens = Array.from(tokenMap.entries()).map(([unit, amount]) => ({ unit, amount }))

      return {
        address: addressBech32,
        lovelace,
        ada: Number(lovelace) / 1_000_000,
        tokens
      }
    })
  )

  const totalLovelace = wallets.reduce((sum, wallet) => sum + wallet.lovelace, 0n)

  return {
    wallets,
    total: {
      lovelace: totalLovelace,
      ada: Number(totalLovelace) / 1_000_000
    }
  }
}
```

## Transaction Submission API

Backend API endpoint for transaction submission:

```typescript
import { Transaction, TransactionHash, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface SubmissionResponse {
  success: boolean
  txHash?: string
  confirmed?: boolean
  error?: string
}

export async function handleSubmission(signedTxCbor: string): Promise<SubmissionResponse> {
  try {
    const signedTx = Transaction.fromCBORHex(signedTxCbor)
    const txHash = await client.submitTx(signedTx)

    console.log("Transaction submitted:", txHash)

    const confirmed = await client.awaitTx(txHash, 5000)

    return {
      success: true,
      txHash: TransactionHash.toHex(txHash),
      confirmed
    }
  } catch (error: any) {
    console.error("Submission failed:", error)

    return {
      success: false,
      error: error.message
    }
  }
}
```

Express.js integration example:

```typescript
import express from "express"
const app = express()
app.use(express.json())

app.post("/api/submit", async (req, res) => {
  const { txCbor } = req.body

  if (!txCbor) {
    return res.status(400).json({
      error: "Missing txCbor in request body"
    })
  }

  const result = await handleSubmission(txCbor)

  if (result.success) {
    res.json(result)
  } else {
    res.status(500).json(result)
  }
})
```

## Token Distribution Tracker

Track token distribution across holders:

```typescript
import { Address, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface TokenHolder {
  address: string
  amount: bigint
  percentage: number
}

interface Distribution {
  totalSupply: bigint
  holders: TokenHolder[]
  uniqueHolders: number
}

export async function trackDistribution(addresses: string[], tokenUnit: string): Promise<Distribution> {
  const holders: TokenHolder[] = []
  let totalSupply = 0n

  for (const addressBech32 of addresses) {
    const address = Address.fromBech32(addressBech32)
    const utxos = await client.getUtxosWithUnit(address, tokenUnit)

    if (utxos.length > 0) {
      const amount = BigInt(utxos.length)
      totalSupply += amount
      holders.push({ address: addressBech32, amount, percentage: 0 })
    }
  }

  holders.forEach((holder) => {
    holder.percentage = totalSupply > 0n ? Number((holder.amount * 10000n) / totalSupply) / 100 : 0
  })

  holders.sort((a, b) => Number(b.amount - a.amount))

  return {
    totalSupply,
    holders,
    uniqueHolders: holders.length
  }
}
```

## NFT Collection Tracker

Track NFT ownership and rarity:

```typescript
import { Address, TransactionHash, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface NFTOwnership {
  tokenId: string
  unit: string
  owner: string | null
  txHash?: string
  outputIndex?: bigint
}

export async function trackNFTCollection(policyId: string, tokenNames: string[]): Promise<NFTOwnership[]> {
  const ownership = await Promise.all(
    tokenNames.map(async (tokenName) => {
      const unit = policyId + tokenName

      try {
        const utxo = await client.getUtxoByUnit(unit)

        return {
          tokenId: tokenName,
          unit,
          owner: Address.toBech32(utxo.address),
          txHash: TransactionHash.toHex(utxo.transactionId),
          outputIndex: utxo.index
        }
      } catch (error) {
        return {
          tokenId: tokenName,
          unit,
          owner: null
        }
      }
    })
  )

  return ownership
}

export async function getCollectionStats(policyId: string, tokenNames: string[]) {
  const ownership = await trackNFTCollection(policyId, tokenNames)

  const owned = ownership.filter((nft) => nft.owner !== null)
  const burned = ownership.filter((nft) => nft.owner === null)

  const uniqueOwners = new Set(owned.map((nft) => nft.owner).filter(Boolean))

  return {
    totalSupply: tokenNames.length,
    owned: owned.length,
    burned: burned.length,
    uniqueOwners: uniqueOwners.size,
    ownership
  }
}
```

## Staking Pool Delegator Tracker

Track delegators to a specific stake pool:

```typescript
import { PoolKeyHash, RewardAddress, mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface Delegator {
  rewardAddress: string
  poolId: PoolKeyHash.PoolKeyHash | null
  rewards: bigint
}

export async function trackPoolDelegators(
  rewardAddresses: string[],
  targetPoolId: PoolKeyHash.PoolKeyHash
): Promise<Delegator[]> {
  const delegators = await Promise.all(
    rewardAddresses.map(async (rewardAddress) => {
      try {
        const delegation = await client.getDelegation(RewardAddress.RewardAddress.make(rewardAddress))

        return {
          rewardAddress,
          poolId: delegation.poolId,
          rewards: delegation.rewards
        }
      } catch (error) {
        return null
      }
    })
  )

  return delegators.filter(
    (d) => d !== null && d.poolId !== null && PoolKeyHash.toHex(d.poolId) === PoolKeyHash.toHex(targetPoolId)
  ) as Delegator[]
}

export async function getPoolStats(rewardAddresses: string[], targetPoolId: PoolKeyHash.PoolKeyHash) {
  const delegators = await trackPoolDelegators(rewardAddresses, targetPoolId)
  const totalRewards = delegators.reduce((sum, d) => sum + d.rewards, 0n)

  return {
    totalDelegators: delegators.length,
    totalRewards,
    totalRewardsAda: Number(totalRewards) / 1_000_000
  }
}
```

## Protocol Parameter Monitor

Monitor network parameters for changes:

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

const client = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

interface ParameterSnapshot {
  timestamp: Date
  minFeeA: number
  minFeeB: number
  maxTxSize: number
  keyDeposit: bigint
  poolDeposit: bigint
}

export async function captureParameters(): Promise<ParameterSnapshot> {
  const params = await client.getProtocolParameters()

  return {
    timestamp: new Date(),
    minFeeA: params.minFeeA,
    minFeeB: params.minFeeB,
    maxTxSize: params.maxTxSize,
    keyDeposit: params.keyDeposit,
    poolDeposit: params.poolDeposit
  }
}

export class ParameterMonitor {
  private snapshots: ParameterSnapshot[] = []
  private intervalId: NodeJS.Timeout | null = null

  start(intervalMs: number = 3600000) {
    this.intervalId = setInterval(async () => {
      const snapshot = await captureParameters()
      this.snapshots.push(snapshot)

      console.log("Parameter snapshot:", snapshot)

      if (this.snapshots.length > 1) {
        const previous = this.snapshots[this.snapshots.length - 2]
        this.detectChanges(previous, snapshot)
      }
    }, intervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private detectChanges(prev: ParameterSnapshot, curr: ParameterSnapshot) {
    if (prev.minFeeA !== curr.minFeeA) {
      console.log("Fee A changed:", { from: prev.minFeeA, to: curr.minFeeA })
    }

    if (prev.poolDeposit !== curr.poolDeposit) {
      console.log("Pool deposit changed:", { from: prev.poolDeposit, to: curr.poolDeposit })
    }
  }
}
```

## Multi-Provider Fallback

Implement provider failover for reliability:

```typescript
import { Address, Transaction, TransactionHash, mainnet, Client } from "@evolution-sdk/evolution"

interface ProviderClient {
  getUtxos: (address: Address.Address) => Promise<any>
  submitTx: (tx: Transaction.Transaction) => Promise<TransactionHash.TransactionHash>
  getProtocolParameters: () => Promise<any>
}

class ProviderWithFallback {
  private clients: ProviderClient[]
  private currentIndex = 0

  constructor(clients: ProviderClient[]) {
    this.clients = clients
  }

  private async withFallback<T>(operation: (client: ProviderClient) => Promise<T>): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < this.clients.length; i++) {
      const client = this.clients[this.currentIndex]

      try {
        const result = await operation(client)
        return result
      } catch (error) {
        console.error(`Provider ${this.currentIndex} failed:`, error)
        lastError = error as Error
        this.currentIndex = (this.currentIndex + 1) % this.clients.length
      }
    }

    throw lastError
  }

  async getUtxos(address: Address.Address) {
    return this.withFallback((client) => client.getUtxos(address))
  }

  async submitTx(tx: Transaction.Transaction) {
    return this.withFallback((client) => client.submitTx(tx))
  }

  async getProtocolParameters() {
    return this.withFallback((client) => client.getProtocolParameters())
  }
}

const resilientProvider = new ProviderWithFallback([
  Client.make(mainnet).withBlockfrost({
      baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
      projectId: process.env.BLOCKFROST_PROJECT_ID!
    }),
  Client.make(mainnet).withMaestro({
      baseUrl: "https://mainnet.gomaestro-api.org/v1",
      apiKey: process.env.MAESTRO_API_KEY!
    })
])

const address = Address.fromBech32(
  "addr1qxy8sclc58rsck0pzsc0v4skmqjwuqsqpwfcvrdldl5sjvvhyltp7fk0fmtmrlnykgmhnzcns2msa2cmpvllzgqd2azqhpv8e4"
)
const utxos = await resilientProvider.getUtxos(address)
```

## Next Steps

Now that you understand provider use cases:

- [Provider Types](./provider-types.md) - Choose the right provider
- [Querying](./querying.md) - Master query methods
- [Submission](./submission.md) - Transaction submission patterns
