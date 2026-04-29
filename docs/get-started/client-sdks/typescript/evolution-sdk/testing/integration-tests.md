---
title: Integration Tests
description: Test full transaction workflows with devnet
---

# Integration Tests

Integration tests run against a local devnet cluster, validating the full transaction lifecycle — build, sign, submit, and confirm. Use `@effect/vitest` or standard `vitest` with extended timeouts.

## Test Setup Pattern

```typescript title="test/integration.test.ts"
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

describe("Transaction Tests", () => {
  let cluster: Cluster.Cluster
  let client: Client.SigningClient
  let genesisConfig: any

  beforeAll(async () => {
    const mnemonic =
      "test test test test test test test test test test test test test test test test test test test test test test test sauce"

    const wallet = Client.make(preprod)
      .withSeed({ mnemonic, accountIndex: 0 })

    const addressHex = Address.toHex(await wallet.address())

    genesisConfig = {
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

    client = Client.make(preprod)
      .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
      .withSeed({ mnemonic, accountIndex: 0 })
  }, 180_000)

  afterAll(async () => {
    await Cluster.stop(cluster)
    await Cluster.remove(cluster)
  }, 60_000)

  it("should submit simple payment", async () => {
    // Genesis UTxOs are NOT indexed by Kupo — must provide them explicitly
    const genesisUtxos = await Genesis.calculateUtxosFromConfig(genesisConfig)

    const signBuilder = await client
      .newTx()
      .payToAddress({
        address: Address.fromBech32(
          "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
        ),
        assets: Assets.fromLovelace(5_000_000n)
      })
      .build({ availableUtxos: genesisUtxos })

    const submitBuilder = await signBuilder.sign()
    const txHash = await submitBuilder.submit()
    const confirmed = await client.awaitTx(txHash, 1000)

    expect(confirmed).toBe(true)
  }, 30_000)
})
```

## Key Patterns

**Extended timeouts**: Cluster startup needs 180s, individual tests need 30-60s.

**Genesis UTxOs**: Genesis UTxOs are NOT indexed by Kupo. Use `Genesis.calculateUtxosFromConfig()` and pass via `build({ availableUtxos })` for first transactions. Once genesis UTxOs are spent, subsequent outputs are indexed normally.

**Unique cluster names**: Use timestamps to avoid port conflicts when running tests in parallel.

## Next Steps

- [Emulator](./emulator.md) — More on devnet as emulator
- [Devnet](../devnet/overview.md) — Devnet configuration and lifecycle
