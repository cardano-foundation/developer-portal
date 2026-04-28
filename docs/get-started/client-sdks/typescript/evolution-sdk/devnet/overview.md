---
title: Devnet
description: Local Cardano development network with Docker
---

import DocCardList from '@theme/DocCardList';

# Devnet

The Evolution SDK provides a complete local Cardano development network powered by Docker. Spin up a full Cardano node with optional Kupo and Ogmios services for testing applications in a controlled environment.

<DocCardList />

## What is Devnet?

Devnet creates an isolated Cardano blockchain running entirely on your local machine. It manages Docker containers for cardano-node, Kupo (UTxO indexer), and Ogmios (JSON/WebSocket API), giving you full control over network configuration, genesis parameters, and initial funds.

Unlike testnet or mainnet, devnet provides instant block production, customizable genesis state, and complete privacy. Test transaction flows, smart contracts, and wallet integration without consuming real assets or waiting for block confirmations.

## When to Use Devnet

**Development Workflows**: Test applications against a pristine blockchain state without network latency or rate limits. Reset state instantly by recreating the cluster.

**Automated Testing**: Run integration tests in CI/CD pipelines with reproducible blockchain environments. Each test suite gets a clean network state.

**Smart Contract Development**: Deploy and test Plutus scripts with controlled genesis UTxOs. Debug transaction failures in isolation.

**Protocol Exploration**: Experiment with custom protocol parameters (fees, slot timing, Plutus cost models) to understand behavior without risking real funds.

## Why Use Devnet?

- **Instant Setup**: Launch a complete Cardano network in seconds
- **Custom Genesis**: Fund any address with any amount of ADA at network creation
- **Fast Blocks**: Configure slot timing from 20ms to match your testing needs
- **Full Control**: Start, stop, restart, and reset network state at will
- **Offline Testing**: No internet required once Docker images are pulled
- **Reproducible State**: Deterministic genesis configuration for consistent test results

### What about Yaci DevKit?

Yaci DevKit is a standalone CLI tool for running a local Cardano network. It includes a web-based block explorer, Blockfrost-compatible REST APIs, and a 3-node cluster mode for rollback simulation.

DevNet takes a different approach — it's a library, not a service. Genesis configuration, cluster lifecycle, and UTxO queries are TypeScript code inside your project. There's no separate tool to install or manage, and genesis UTxOs are deterministic and pre-computable from your config without querying the chain.

The tradeoff: Yaci DevKit gives you visual tooling and broader SDK compatibility out of the box. DevNet gives you a code-first workflow where your local blockchain lives inside your test suite. Both run standard cardano-node instances, so blockchain behavior is identical.

See [Configuration](./configuration) for genesis-as-code examples and [Integration](./integration) for a complete test workflow from cluster start to confirmed transaction.

## How Devnet Works

Devnet orchestrates three Docker containers:

1. **cardano-node**: Produces blocks and validates transactions using a custom genesis configuration
2. **Kupo** (optional): Indexes UTxOs and provides fast lookups via HTTP API
3. **Ogmios** (optional): Exposes JSON-RPC and WebSocket interfaces for blockchain queries

The SDK handles image pulling, container lifecycle, network creation, and health checks. You interact through simple async APIs that abstract Docker complexity.

## Quick Example

```typescript
import { Cluster } from "@evolution-sdk/devnet";

const cluster = await Cluster.make({
  clusterName: "my-devnet",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: {
    slotLength: 0.1,
    initialFunds: {
      "addr_test1_hex_address": 1_000_000_000_000
    }
  }
});

await Cluster.start(cluster);

console.log("Devnet running on port", 3001);

await Cluster.stop(cluster);
await Cluster.remove(cluster);
```

## Prerequisites

- **Docker**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop) or Docker Engine
- **Node.js**: Version 18 or higher

Verify Docker is running:

```bash
docker --version
```

## Next Steps

- [Getting Started](./getting-started) — Create your first devnet cluster and run basic operations
- [Configuration](./configuration) — Customize genesis parameters, protocol settings, and network behavior
- [Integration](./integration) — Build complete workflows with Evolution SDK client for transactions
