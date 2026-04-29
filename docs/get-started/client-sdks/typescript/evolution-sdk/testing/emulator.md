---
title: Emulator
description: Use devnet as a local blockchain emulator for testing
---

# Emulator

Evolution SDK's devnet acts as a local blockchain emulator — a complete Cardano node with Kupo and Ogmios running in Docker. No external services needed for development and testing.

## How It Works

Devnet provides:
- A local Cardano node producing blocks
- Kupo for UTxO indexing and querying
- Ogmios for protocol parameter queries and transaction submission
- Configurable genesis with pre-funded addresses
- Fast block times (20-100ms) for rapid testing

## Quick Start

```typescript
import { Cluster, Config } from "@evolution-sdk/devnet"

const cluster = await Cluster.make({
  clusterName: "my-emulator",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: {
    ...Config.DEFAULT_SHELLEY_GENESIS,
    slotLength: 0.1,
    initialFunds: {
      "your_address_hex": 1_000_000_000_000
    }
  },
  kupo: { enabled: true, port: 1442 },
  ogmios: { enabled: true, port: 1337 }
})

await Cluster.start(cluster)
// ... run tests ...
await Cluster.stop(cluster)
await Cluster.remove(cluster)
```

## Advantages Over External Testnets

| Feature | Devnet Emulator | Public Testnet |
|---------|----------------|----------------|
| **Speed** | Millisecond confirmations | 20+ second confirmations |
| **Cost** | Free, no faucet needed | Requires testnet ADA |
| **Isolation** | Fresh state per test | Shared with other users |
| **Availability** | Always available offline | Dependent on network |
| **Configuration** | Custom parameters | Fixed by network |

## Next Steps

- [Devnet Getting Started](../devnet/getting-started.md) — Full devnet setup guide
- [Devnet Integration](../devnet/integration.md) — Complete integration workflows
- [Integration Tests](./integration-tests.md) — Test patterns with devnet
