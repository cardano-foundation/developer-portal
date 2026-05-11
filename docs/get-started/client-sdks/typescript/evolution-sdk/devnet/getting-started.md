---
title: Getting Started
description: Create and manage your first local Cardano devnet cluster
---

# Getting Started with Devnet

This guide walks through creating, starting, and managing a local Cardano development network. You'll learn cluster lifecycle operations, container management, and how to integrate Kupo and Ogmios for full blockchain access.

## Installation

```bash
pnpm add @evolution-sdk/devnet @evolution-sdk/evolution
```

The package requires Docker to be running. Verify Docker is available:

```bash
docker --version
```

## Basic Cluster Creation

```typescript
import { Cluster } from "@evolution-sdk/devnet";

const cluster = await Cluster.make({
  clusterName: "my-first-devnet",
  ports: { node: 3001, submit: 3002 }
});

console.log("Cluster created:", cluster.cardanoNode.name);
```

The `make` function returns a cluster configuration containing container references. The cardano-node will bind to port 3001 for peer connections and port 3002 for transaction submission.

## Starting the Cluster

```typescript
import { Cluster } from "@evolution-sdk/devnet";
const cluster = await Cluster.make()

await Cluster.start(cluster);

console.log("Devnet is now producing blocks");

await new Promise(resolve => setTimeout(resolve, 3000));
```

## Checking Container Status

```typescript
import { Cluster, Container } from "@evolution-sdk/devnet";
const cluster = await Cluster.make()

const status = await Container.getStatus(cluster.cardanoNode);

console.log("Container state:", status?.State.Status)
console.log("Container health:", status?.State.Health?.Status)
```

The status object includes full Docker inspect output: state, network settings, mounts, resource usage, and health check results.

## Stopping and Removing

```typescript
import { Cluster } from "@evolution-sdk/devnet";
const cluster = await Cluster.make()

await Cluster.stop(cluster);
console.log("Cluster stopped");

await Cluster.remove(cluster);
console.log("Cluster removed");
```

Stopping containers preserves blockchain state in Docker volumes. Removing deletes containers but keeps named volumes by default. To completely reset state, manually remove volumes using Docker commands.

## Adding Kupo and Ogmios

```typescript
import { Cluster, Container } from "@evolution-sdk/devnet";

const cluster = await Cluster.make({
  clusterName: "full-stack-devnet",
  ports: { node: 3001, submit: 3002 },
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
});

await Cluster.start(cluster);

await new Promise(resolve => setTimeout(resolve, 5000));

if (cluster.kupo) {
  const kupoStatus = await Container.getStatus(cluster.kupo);
  console.log("Kupo status:", kupoStatus?.State.Status);
}

if (cluster.ogmios) {
  const ogmiosStatus = await Container.getStatus(cluster.ogmios);
  console.log("Ogmios status:", ogmiosStatus?.State.Status);
}
```

The log levels control output verbosity:
- **Kupo**: `Debug`, `Info`, `Warning`, `Error`
- **Ogmios**: `debug`, `info`, `notice`, `warning`, `error`

## Individual Container Operations

```typescript
import { Cluster, Container } from "@evolution-sdk/devnet";
const cluster = await Cluster.make()

await Container.stop(cluster.cardanoNode);
console.log("Node stopped, Kupo and Ogmios still running");

const stoppedStatus = await Container.getStatus(cluster.cardanoNode);
console.log("Status:", stoppedStatus?.State.Status);

await Container.start(cluster.cardanoNode);
await new Promise(resolve => setTimeout(resolve, 2000));

const runningStatus = await Container.getStatus(cluster.cardanoNode);
console.log("Status:", runningStatus?.State.Status);
```

## Complete Workflow Example

```typescript
import { Cluster, Container } from "@evolution-sdk/devnet";

async function runDevnetSession() {
  const cluster = await Cluster.make({
    clusterName: "dev-session",
    ports: { node: 3001, submit: 3002 },
    kupo: { enabled: true, port: 1442 },
    ogmios: { enabled: true, port: 1337 }
  });

  try {
    await Cluster.start(cluster);
    console.log("Devnet started");

    await new Promise(resolve => setTimeout(resolve, 5000));

    const nodeStatus = await Container.getStatus(cluster.cardanoNode);
    const kupoStatus = cluster.kupo
      ? await Container.getStatus(cluster.kupo)
      : null;
    const ogmiosStatus = cluster.ogmios
      ? await Container.getStatus(cluster.ogmios)
      : null;

    console.log("Node:", nodeStatus?.State.Status);
    console.log("Kupo:", kupoStatus?.State.Status);
    console.log("Ogmios:", ogmiosStatus?.State.Status);

    console.log("Devnet ready for development");
    console.log("Ogmios: http://localhost:1337");
    console.log("Kupo: http://localhost:1442");

    await new Promise(resolve => setTimeout(resolve, 10000));

  } finally {
    await Cluster.stop(cluster);
    await Cluster.remove(cluster);
    console.log("Devnet stopped and removed");
  }
}

runDevnetSession().catch(console.error);
```

## Next Steps

- [Configuration](./configuration.md) — Customize genesis parameters, fund addresses, and modify protocol settings
- [Integration](./integration.md) — Use the Evolution SDK client to query the blockchain and submit transactions

## Troubleshooting

**Port conflicts**: If ports are already in use, choose different values:

```typescript
ports: { node: 4001, submit: 4002 }
```

**Slow startup**: Initial Docker image pulls can take several minutes. Subsequent starts are fast. The SDK automatically pulls missing images.

**Container won't start**: Check Docker daemon is running and you have sufficient disk space for blockchain data.

**Network errors**: Ensure no firewall rules block localhost ports. The containers bind to 127.0.0.1 by default.
