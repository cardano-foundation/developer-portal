---
title: Integration
description: Complete workflows combining devnet with Evolution SDK client
---

# Devnet Integration with Evolution SDK

Devnet provides the blockchain infrastructure. The Evolution SDK client provides transaction building and submission. Together, they enable complete end-to-end testing workflows without external dependencies.

## Overview

A typical integration workflow follows this pattern:

1. Generate wallet addresses for your test scenario
2. Create devnet genesis configuration funding those addresses
3. Start devnet cluster with Kupo and Ogmios
4. Create Evolution SDK client connected to the devnet services
5. Query protocol parameters and genesis UTxOs
6. Build, sign, and submit transactions
7. Await confirmation and verify results
8. Clean up devnet resources

## Complete Workflow: Devnet to Transaction

```typescript
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address, Assets, TransactionHash, Client } from "@evolution-sdk/evolution"

const MNEMONIC = "test test test test test test test test test test test test test test test test test test test test test test test sauce"

async function completeWorkflow() {
  const senderAddress = Address.fromSeed(MNEMONIC, { accountIndex: 0, networkId: 0 })
  const senderAddressHex = Address.toHex(senderAddress)

  console.log("Sender address:", Address.toBech32(senderAddress))

  const genesisConfig = {
    ...Config.DEFAULT_SHELLEY_GENESIS,
    slotLength: 0.1,
    epochLength: 100,
    initialFunds: {
      [senderAddressHex]: 1_000_000_000_000
    }
  }

  const cluster = await Cluster.make({
    clusterName: "integration-example",
    ports: { node: 3001, submit: 3002 },
    shelleyGenesis: genesisConfig,
    kupo: { enabled: true, port: 1442, logLevel: "Info" },
    ogmios: { enabled: true, port: 1337, logLevel: "info" }
  })

  await Cluster.start(cluster)

  await new Promise((resolve) => setTimeout(resolve, 8000))

  const client = Client.make(Cluster.getChain(cluster))
    .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
    .withSeed({ mnemonic: MNEMONIC, accountIndex: 0 })

  const params = await client.getProtocolParameters()
  console.log("Protocol parameters:", {
    minFeeA: params.minFeeA,
    minFeeB: params.minFeeB,
    maxTxSize: params.maxTxSize
  })

  const genesisUtxos = await Genesis.calculateUtxosFromConfig(genesisConfig)
  console.log("Genesis UTxOs:", genesisUtxos.length)

  const receiverAddress = Address.fromBech32(
    "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
  )

  const signBuilder = await client
    .newTx()
    .payToAddress({
      address: receiverAddress,
      assets: Assets.fromLovelace(10_000_000n)
    })
    .build({ availableUtxos: genesisUtxos })

  const submitBuilder = await signBuilder.sign()
  const txHash = await submitBuilder.submit()

  const confirmed = await client.awaitTx(txHash, 1000)
  console.log("Transaction confirmed:", confirmed)

  await Cluster.stop(cluster)
  await Cluster.remove(cluster)
}

completeWorkflow().catch(console.error)
```

## Understanding the Integration Points

**Genesis to UTxO**: The `calculateUtxosFromConfig` function converts genesis configuration into queryable UTxO objects. These UTxOs can be used as transaction inputs immediately after cluster start.

**Critical: Genesis UTxOs and Kupo**: Genesis UTxOs do NOT appear in Kupo's index. Kupo reads chain events starting from the first block, but genesis UTxOs are created in the genesis block itself (block 0), which has no transaction events. You MUST use `calculateUtxosFromConfig` to derive genesis UTxOs and explicitly inject them into your transaction builder using the `availableUtxos` parameter. Once you spend a genesis UTxO in a transaction, the resulting outputs WILL be indexed by Kupo and can be queried normally.

**Provider Configuration**: The client's provider configuration points to the devnet's Kupo and Ogmios services. This enables all blockchain queries (UTxOs, protocol parameters, tip) to target the local network.

**Network Magic**: Both devnet genesis and client configuration must use matching network identifiers. The default network magic `0` works for most testing.

## Provider-Only Queries

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"
import { Address, Client } from "@evolution-sdk/evolution"

const cluster = await Cluster.make({
  clusterName: "query-example",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: {
    ...Config.DEFAULT_SHELLEY_GENESIS,
    initialFunds: {
      address_hex_here: 100_000_000_000
    }
  },
  kupo: { enabled: true, port: 1442 },
  ogmios: { enabled: true, port: 1337 }
})

await Cluster.start(cluster)
await new Promise((resolve) => setTimeout(resolve, 6000))

const providerClient = Client.make(Cluster.getChain(cluster))
  .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })

const utxos = await providerClient.getUtxos(
  Address.fromBech32(
    "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
  )
)
console.log("UTxOs at address:", utxos.length)

const params = await providerClient.getProtocolParameters()
console.log("Max transaction size:", params.maxTxSize)

await Cluster.stop(cluster)
await Cluster.remove(cluster)
```

## Testing Patterns

### Integration Test Setup

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import { Cluster, Config } from "@evolution-sdk/devnet"
import { Address, Assets, Client } from "@evolution-sdk/evolution"

describe("Transaction Tests", () => {
  let cluster: Cluster.Cluster
  let client: Client.SigningClient

  beforeAll(async () => {
    const mnemonic =
      "test test test test test test test test test test test test test test test test test test test test test test test sauce"

    const addressHex = Address.toHex(Address.fromSeed(mnemonic, { accountIndex: 0, networkId: 0 }))

    const genesisConfig = {
      ...Config.DEFAULT_SHELLEY_GENESIS,
      slotLength: 0.02,
      epochLength: 50,
      initialFunds: { [addressHex]: 10_000_000_000_000 }
    }

    cluster = await Cluster.make({
      clusterName: "test-suite-" + Date.now(),
      ports: { node: 3001, submit: 3002 },
      shelleyGenesis: genesisConfig,
      kupo: { enabled: true, port: 1442 },
      ogmios: { enabled: true, port: 1337 }
    })

    await Cluster.start(cluster)
    await new Promise((resolve) => setTimeout(resolve, 8000))

    client = Client.make(Cluster.getChain(cluster))
      .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
      .withSeed({ mnemonic, accountIndex: 0 })
  }, 180_000)

  afterAll(async () => {
    await Cluster.stop(cluster)
    await Cluster.remove(cluster)
  }, 60_000)

  it("should submit simple payment", async () => {
    const signBuilder = await client
      .newTx()
      .payToAddress({
        address: Address.fromBech32(
          "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
        ),
        assets: Assets.fromLovelace(5_000_000n)
      })
      .build()

    const submitBuilder = await signBuilder.sign()
    const txHash = await submitBuilder.submit()
    const confirmed = await client.awaitTx(txHash, 1000)

    expect(confirmed).toBe(true)
  }, 30_000)
})
```

## Multi-Wallet Scenarios

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"
import { Address, Assets, TransactionHash, Client } from "@evolution-sdk/evolution"

async function multiWalletExample() {
  const addr1Hex = Address.toHex(Address.fromSeed("wallet one mnemonic here", { accountIndex: 0, networkId: 0 }))
  const addr2Hex = Address.toHex(Address.fromSeed("wallet two mnemonic here", { accountIndex: 0, networkId: 0 }))

  const genesisConfig = {
    ...Config.DEFAULT_SHELLEY_GENESIS,
    slotLength: 0.1,
    initialFunds: {
      [addr1Hex]: 500_000_000_000,
      [addr2Hex]: 300_000_000_000
    }
  }

  const cluster = await Cluster.make({
    clusterName: "multi-wallet",
    ports: { node: 3001, submit: 3002 },
    shelleyGenesis: genesisConfig,
    kupo: { enabled: true, port: 1442 },
    ogmios: { enabled: true, port: 1337 }
  })

  await Cluster.start(cluster)
  await new Promise((resolve) => setTimeout(resolve, 8000))

  const client1 = Client.make(Cluster.getChain(cluster))
    .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
    .withSeed({ mnemonic: "wallet one mnemonic here", accountIndex: 0 })

  const client2 = Client.make(Cluster.getChain(cluster))
    .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
    .withSeed({ mnemonic: "wallet two mnemonic here", accountIndex: 0 })

  const wallet2Address = await client2.address()
  const signBuilder = await client1
    .newTx()
    .payToAddress({
      address: wallet2Address,
      assets: Assets.fromLovelace(50_000_000n)
    })
    .build()

  const txHash = await signBuilder.sign().then((b) => b.submit())
  await client1.awaitTx(txHash, 1000)

  const wallet2Utxos = await client2.getWalletUtxos()
  const receivedUtxo = wallet2Utxos.find(
    (u) => TransactionHash.toHex(u.transactionId) === TransactionHash.toHex(txHash)
  )

  if (receivedUtxo) {
    console.log("Wallet 2 received:", receivedUtxo.assets.lovelace, "lovelace")
  }

  await Cluster.stop(cluster)
  await Cluster.remove(cluster)
}
```

## Long-Running Development Sessions

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"

async function startDevSession() {
  const cluster = await Cluster.make({
    clusterName: "dev-session",
    ports: { node: 3001, submit: 3002 },
    shelleyGenesis: {
      ...Config.DEFAULT_SHELLEY_GENESIS,
      slotLength: 0.1,
      initialFunds: {
        your_address_hex_here: 1_000_000_000_000
      }
    },
    kupo: { enabled: true, port: 1442, logLevel: "Info" },
    ogmios: { enabled: true, port: 1337, logLevel: "info" }
  })

  await Cluster.start(cluster)

  console.log("Devnet running")
  console.log("Ogmios: http://localhost:1337")
  console.log("Kupo: http://localhost:1442")
  console.log("Node: localhost:3001")
  console.log("Press Ctrl+C to stop")

  process.on("SIGINT", async () => {
    console.log("Stopping devnet...")
    await Cluster.stop(cluster)
    await Cluster.remove(cluster)
    console.log("Devnet stopped")
    process.exit(0)
  })

  await new Promise(() => {})
}

startDevSession().catch(console.error)
```

## Troubleshooting Integration Issues

**"Cannot connect to provider"**: Ensure sufficient wait time after `Cluster.start()`. Kupo and Ogmios need 6-8 seconds to initialize completely. Increase wait time for slower systems.

**"UTxO not found"**: Remember that genesis UTxOs are NOT indexed by Kupo. Always use `calculateUtxosFromConfig` and provide them via `availableUtxos` parameter when building your first transaction.

**"Transaction submission failed"**: Verify network magic matches between genesis configuration and client. Mismatched magic causes address validation failures.

**"Fee estimation error"**: Ensure protocol parameters are accessible through the provider. Query `client.getProtocolParameters()` before building transactions to verify connectivity.

**Port conflicts**: If Kupo/Ogmios won't start, check for port conflicts. Use different ports or stop conflicting services.

**Slow confirmation**: With fast devnet configuration (20-100ms slots), transactions confirm in milliseconds. With realistic timing (1 second slots), expect normal confirmation delays.

## Next Steps

You now have complete devnet integration knowledge:

- Start clusters with custom genesis
- Connect Evolution SDK clients to devnet services
- Build, sign, and submit transactions
- Query blockchain state through provider APIs
- Test multi-wallet and multi-party scenarios

For production deployment, replace devnet provider configuration with mainnet or testnet endpoints while keeping the same client APIs.
