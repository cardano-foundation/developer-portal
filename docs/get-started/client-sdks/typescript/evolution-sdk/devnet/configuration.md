---
title: Configuration
description: Customize genesis parameters and protocol settings for your devnet
---

# Devnet Configuration

Devnet clusters are fully customizable through genesis configuration. Control initial funding, protocol parameters, block timing, and network behavior to match your testing requirements.

## Genesis Configuration Overview

Genesis configuration defines the initial state of your blockchain: funded addresses, protocol parameters, slot timing, and network settings. The devnet package provides sensible defaults while allowing complete customization.

Every devnet cluster accepts an optional `shelleyGenesis` parameter. When omitted, the cluster uses `DEFAULT_SHELLEY_GENESIS` from the package. For custom requirements, create a modified genesis object based on the defaults.

## Custom Genesis with Funded Addresses

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"
import { Address } from "@evolution-sdk/evolution"

const address = Address.fromSeed("test test test test test test test test test test test test test test test test test test test test test test test sauce", {
  accountIndex: 0,
  networkId: 0
})

const addressHex = Address.toHex(address)

const genesisConfig = {
  ...Config.DEFAULT_SHELLEY_GENESIS,
  slotLength: 0.1,
  epochLength: 100,
  initialFunds: {
    [addressHex]: 1_000_000_000_000
  }
} satisfies Config.ShelleyGenesis

const cluster = await Cluster.make({
  clusterName: "funded-devnet",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: genesisConfig
})

await Cluster.start(cluster)
```

The address now has 1 million ADA available from block 0. The funds appear as a single UTxO that can be queried and spent immediately.

Amounts are specified in lovelace (1 ADA = 1,000,000 lovelace). Use underscores for readability: `1_000_000_000_000` is 1 million ADA.

## Multiple Address Funding

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"
import { Address } from "@evolution-sdk/evolution"

const address1 = Address.toHex(Address.fromSeed("your mnemonic here", {
  accountIndex: 0,
  networkId: 0
}))

const address2 = Address.toHex(Address.fromSeed("your mnemonic here", {
  accountIndex: 1,
  networkId: 0
}))

const genesisConfig = {
  ...Config.DEFAULT_SHELLEY_GENESIS,
  initialFunds: {
    [address1]: 500_000_000_000,
    [address2]: 300_000_000_000
  }
} satisfies Config.ShelleyGenesis

const cluster = await Cluster.make({
  clusterName: "multi-user-devnet",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: genesisConfig
})

await Cluster.start(cluster)
```

## Calculating Genesis UTxOs

After creating a genesis configuration, calculate the resulting UTxOs to verify addresses and amounts.

:::warning
**Genesis UTxOs do NOT appear in Kupo's index** — Kupo reads from block 1, but genesis UTxOs are in block 0. Use `calculateUtxosFromConfig` to derive these UTxOs and pass them via `availableUtxos`. After spending a genesis UTxO, resulting outputs are indexed normally.
:::

```typescript
import { Config, Genesis } from "@evolution-sdk/devnet"
import { Address, TransactionHash } from "@evolution-sdk/evolution"

declare const addressHex: string

const genesisConfig = {
  ...Config.DEFAULT_SHELLEY_GENESIS,
  initialFunds: {
    [addressHex]: 1_000_000_000_000
  }
} satisfies Config.ShelleyGenesis

const genesisUtxos = await Genesis.calculateUtxosFromConfig(genesisConfig)

console.log("Genesis UTxOs:", genesisUtxos.length)
genesisUtxos.forEach((utxo) => {
  console.log("Address:", Address.toBech32(utxo.address))
  console.log("Amount:", utxo.assets.lovelace, "lovelace")
  console.log("TxHash:", TransactionHash.toHex(utxo.transactionId))
  console.log("OutputIndex:", utxo.index)
})
```

## Protocol Parameters

The devnet runs on Conway era and uses three genesis files with distinct parameter sets.

### Genesis Type Definitions

```typescript
import type { Config } from "@evolution-sdk/devnet"

type ShelleyGenesis = Config.ShelleyGenesis
type AlonzoGenesis = Config.AlonzoGenesis
type ConwayGenesis = Config.ConwayGenesis
```

### Modifying Parameters

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"

declare const addressHex: string

const shelleyConfig: Partial<Config.ShelleyGenesis> = {
  ...Config.DEFAULT_SHELLEY_GENESIS,
  protocolParams: {
    ...Config.DEFAULT_SHELLEY_GENESIS.protocolParams,
    minFeeA: 50,
    minFeeB: 200000,
    maxTxSize: 32768
  },
  initialFunds: {
    [addressHex]: 100_000_000_000
  }
}

const alonzoConfig: Partial<Config.AlonzoGenesis> = {
  ...Config.DEFAULT_ALONZO_GENESIS,
  lovelacePerUTxOWord: 34482
}

const cluster = await Cluster.make({
  clusterName: "custom-protocol-devnet",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: shelleyConfig,
  alonzoGenesis: alonzoConfig
})

await Cluster.start(cluster)
```

**ShelleyGenesis.protocolParams:**

- **minFeeA / minFeeB**: Transaction fee coefficient and constant
- **maxTxSize**: Maximum transaction size in bytes
- **maxBlockBodySize**: Maximum block size in bytes
- **keyDeposit / poolDeposit**: Stake credential and pool deposits

**AlonzoGenesis:**

- **lovelacePerUTxOWord**: UTxO cost. Conway runtime converts this to `coinsPerUtxoByte` (÷8). Default 34482 ≈ 4310 lovelace/byte
- **collateralPercentage**: Collateral % for script transactions (default: 150)
- **maxCollateralInputs**: Max collateral inputs (default: 3)

:::info
The devnet runs Conway era. At runtime, the node uses `coinsPerUtxoByte` (from Alonzo's `lovelacePerUTxOWord`), not Shelley's legacy `minUTxOValue`.
:::

## Block Timing and Network Behavior

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"

declare const addressHex: string

const genesisConfig = {
  ...Config.DEFAULT_SHELLEY_GENESIS,
  slotLength: 0.02,
  epochLength: 50,
  activeSlotsCoeff: 1.0,
  initialFunds: {
    [addressHex]: 100_000_000_000
  }
} satisfies Config.ShelleyGenesis

const cluster = await Cluster.make({
  clusterName: "fast-devnet",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: genesisConfig
})

await Cluster.start(cluster)
```

Timing parameters explained:

- **slotLength**: Seconds per slot. Default 1 second matches mainnet. Use 0.02-0.1 for fast testing, 1.0 for realistic behavior.
- **epochLength**: Slots per epoch. Default 432000 (5 days on mainnet). Use 50-100 for rapid epoch transitions in tests.
- **activeSlotsCoeff**: Probability a slot produces a block. Use 1.0 for guaranteed blocks (testing), 0.05 for mainnet-like sparsity.

## Security Parameters

```typescript
import { Config } from "@evolution-sdk/devnet"

declare const addressHex: string

const genesisConfig = {
  ...Config.DEFAULT_SHELLEY_GENESIS,
  securityParam: 10,
  maxKESEvolutions: 120,
  slotsPerKESPeriod: 7200,
  initialFunds: {
    [addressHex]: 100_000_000_000
  }
} satisfies Config.ShelleyGenesis
```

- **securityParam (k)**: Blocks before finality. Lower values (10) allow faster testing of chain reorganizations. Default 2160 matches mainnet.
- **maxKESEvolutions**: Operational certificate validity. Lower for faster key rotation testing.
- **slotsPerKESPeriod**: KES evolution frequency. Affects stake pool testing scenarios.

## Complete Configuration Example

```typescript
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address } from "@evolution-sdk/evolution"

const addr1 = Address.toHex(Address.fromSeed("test wallet one mnemonic here", {
  accountIndex: 0,
  networkId: 0
}))

const addr2 = Address.toHex(Address.fromSeed("test wallet two mnemonic here", {
  accountIndex: 0,
  networkId: 0
}))

const genesisConfig = {
  ...Config.DEFAULT_SHELLEY_GENESIS,

  slotLength: 0.05,
  epochLength: 200,
  activeSlotsCoeff: 1.0,

  initialFunds: {
    [addr1]: 5_000_000_000_000,
    [addr2]: 1_000_000_000_000
  },

  protocolParams: {
    ...Config.DEFAULT_SHELLEY_GENESIS.protocolParams,
    minFeeA: 40,
    minFeeB: 150000,
    maxTxSize: 32768,
    maxBlockBodySize: 131072
  },

  maxKESEvolutions: 60,
  slotsPerKESPeriod: 3600
} satisfies Config.ShelleyGenesis

const cluster = await Cluster.make({
  clusterName: "comprehensive-devnet",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: genesisConfig,
  kupo: {
    enabled: true,
    port: 1442,
    logLevel: "Info"
  },
  ogmios: {
    enabled: true,
    port: 1337,
    logLevel: "info"
  }
})

await Cluster.start(cluster)

const utxos = await Genesis.calculateUtxosFromConfig(genesisConfig)
console.log(`Genesis UTxOs: ${utxos.length}`)
utxos.forEach((utxo, i) => {
  console.log(`Address ${i + 1}: ${utxo.assets.lovelace} lovelace`)
})
```

## Configuration Presets

**Rapid Testing**:

```typescript
{
  slotLength: 0.02,
  epochLength: 50,
  activeSlotsCoeff: 1.0
}
```

**Mainnet Simulation**:

```typescript
{
  slotLength: 1.0,
  epochLength: 21600,
  activeSlotsCoeff: 0.05
}
```

**High-Value Testing**:

```typescript
{
  initialFunds: {
    [addressHex]: 45_000_000_000_000_000
  }
}
```

**Fee Testing**:

```typescript
{
  protocolParams: {
    ...defaults,
    minFeeA: 1000,
    minFeeB: 10000000
  }
}
```

**Size Limit Testing**:

```typescript
{
  protocolParams: {
    ...defaults,
    maxTxSize: 8192,
    maxBlockBodySize: 32768
  }
}
```

## Next Steps

- [Integration](./integration.md) — Build complete workflows using the Evolution SDK client with your funded devnet addresses

## Troubleshooting

**Address format errors**: Ensure addresses are in hexadecimal format, not Bech32. Use `Address.toHex(address)` to convert from an Address object.

**Genesis UTxO not found**: Wait 3-5 seconds after cluster start for full initialization. Query timing matters for fast block configurations.

**Protocol parameter validation**: Some parameter combinations are invalid (e.g., `lovelacePerUTxOWord` too low in Alonzo genesis). Check cardano-node logs if startup fails.

**Address network**: Use `networkId: 0` in `Address.fromSeed()` for testnet-format addresses (`addr_test...`).

**Excessive funds**: While genesis supports arbitrary amounts, extremely large values may cause numeric overflow in some calculations. Stay under 45B ADA (total supply) per address.
