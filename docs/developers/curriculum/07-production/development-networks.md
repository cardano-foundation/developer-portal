---
id: development-networks
title: Local Development Networks
sidebar_label: Local Development Networks
description: Run a Cardano network on your own machine, either a standalone cluster you point a frontend at or a programmatic devnet you spin up inside a test suite.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

A **local development network** runs a real Cardano chain on your own machine. You get full control over block production, protocol parameters, and genesis state, with no internet dependency and no faucet. It is the fastest way to iterate, and the only way to test against custom protocol parameters or a deterministic, isolated chain.

## Two ways to run one

There are two ways to get a local chain, and they suit different jobs:

- **Standalone network**: a separate process you start and leave running, then point a frontend, `cardano-cli`, or a provider API at. The chain persists across your app's runs, so it is the one you develop and demo against.
- **Programmatic devnet**: a cluster your code spins up and tears down itself, usually inside a test suite. It is ephemeral, with fresh state every run, which is exactly what you want for automated integration tests.

| | Yaci DevKit | cardano-testnet | Evolution devnet |
| --- | --- | --- | --- |
| **Kind** | Standalone | Standalone | Programmatic (in-process) |
| **Setup** | Docker Compose or NPM | Build from source | `npm install`, runs in your test code |
| **Includes** | Indexer, viewer, Ogmios, Kupo, Blockfrost-compatible API | Minimal tooling, full genesis and parameter control | Node, Kupo, and Ogmios via Docker |
| **Best for** | Integration testing, SDK development, a chain to point a frontend at | Protocol-level testing, custom genesis and era parameters | Automated integration tests over the full build, sign, submit, confirm lifecycle |

## Standalone networks

A standalone network is a process you run and point your application at. Two are commonly used; pick by how much control you need over the chain itself.

### Yaci DevKit

[Yaci DevKit](https://devkit.yaci.xyz/introduction) is the quickest way to get a local chain for app development. It launches a customizable devnet in minutes and bundles everything an SDK needs:

- **Yaci Store**: a lightweight indexer for fast blockchain queries.
- **Yaci Viewer**: a browser UI for exploring transactions and blocks.
- **Ogmios and Kupo**: built in.
- **Blockfrost-compatible API**: point an SDK's Blockfrost provider straight at your local chain.
- **Configurable**: block times, epochs, and network parameters.

Run it with Docker Compose, a standalone CLI zip (Linux x64, macOS arm64), or the NPM package, which is handy in CI. Each path is a few commands: follow the [Docker](https://devkit.yaci.xyz/getting-started/docker), [zip](https://devkit.yaci.xyz/getting-started/zip), or [NPM](https://devkit.yaci.xyz/getting-started/npm) setup guide, and see the [CLI commands](https://devkit.yaci.xyz/commands) reference. Best for integration testing and SDK development.

### cardano-testnet

[cardano-testnet](https://github.com/IntersectMBO/cardano-node) is cardano-node's own local-cluster tool. It hands you full control over genesis files, protocol parameters, epoch length, slot timing, and stake distribution, so it is the choice for protocol-level testing and scenarios that must match mainnet parameters exactly.

It currently ships as part of cardano-node, built from source. After [building cardano-node](/docs/operators/node/installing-cardano-node), build the tool and point two environment variables at your executables:

```bash
cabal build cardano-testnet
export CARDANO_CLI=<path to cardano-cli>
export CARDANO_NODE=<path to cardano-node>
```

Start a cluster and keep it running with `cardano-testnet cardano`. It generates the node configuration and the Shelley, Alonzo, Byron, and Conway genesis files for you, unless you pass a pre-made environment. Useful flags include `--num-pool-nodes`, `--testnet-magic`, `--epoch-length`, `--slot-length`, and `--params-mainnet` (start from current mainnet parameters). For the full flag reference, run `cardano-testnet cardano --help` or see the [cardano-node repository](https://github.com/IntersectMBO/cardano-node).

For repeatable custom networks, generate a sandbox environment, edit it, then run against it:

```bash
rm -rf env                                # start clean
cardano-testnet create-env --output env   # generate genesis + config under env/
# edit env/configuration.yaml, env/*-genesis.json, env/node-data/node*/topology.json
cardano-testnet cardano --node-env env    # run on your custom environment
```

The environment directory holds everything the cluster uses: the SPO, DRep, and genesis keys, per-node `logs/` and `node-data/`, the genesis JSON files at the root, and the node sockets under `socket/`. Once you see `Testnet started`, the chain is producing blocks. To drive it with `cardano-cli`, export its socket path and network magic:

```shell
export CARDANO_NODE_SOCKET_PATH=<output-dir>/socket/node1/sock
export CARDANO_NODE_NETWORK_ID=42
```

`Ctrl+C` shuts the cluster down and kills every node it started.

## Programmatic devnets

Some SDKs can spin up a real local cluster from inside your process: a node with Kupo and Ogmios, millisecond blocks, and pre-funded genesis addresses, then tear it down when you are done. Because the network lives and dies with your code, it is ideal for automated **integration tests**. You run the full build → sign → submit → confirm lifecycle offline, with no faucet and fresh, isolated state every run. (Unit-test the pure parts, such as datum and schema encoding or address parsing, with no chain at all.)

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Evolution ships a devnet emulator in `@evolution-sdk/devnet`. A typical integration test spins the cluster up once, funds a test wallet from genesis, and asserts on confirmation:

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

let cluster: Cluster.Cluster, client: Client.SigningClient, genesisConfig: any

beforeAll(async () => {
  const mnemonic = "test test test ... sauce"
  const addressHex = Address.toHex(await Client.make(preprod).withSeed({ mnemonic, accountIndex: 0 }).address())
  genesisConfig = { ...Config.DEFAULT_SHELLEY_GENESIS, slotLength: 0.02, initialFunds: { [addressHex]: 10_000_000_000_000 } }
  cluster = await Cluster.make({
    clusterName: "test-suite",                 // make this unique to avoid port clashes in parallel runs
    ports: { node: 3001, submit: 3002 },
    shelleyGenesis: genesisConfig,
    kupo: { enabled: true, port: 1442 },
    ogmios: { enabled: true, port: 1337 },
  })
  await Cluster.start(cluster)
  client = Client.make(preprod)
    .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
    .withSeed({ mnemonic, accountIndex: 0 })
}, 180_000)   // cluster startup needs a generous timeout

afterAll(async () => { await Cluster.stop(cluster); await Cluster.remove(cluster) }, 60_000)

it("submits a payment", async () => {
  // genesis UTXOs aren't Kupo-indexed, pass them explicitly on the first transaction
  const genesisUtxos = await Genesis.calculateUtxosFromConfig(genesisConfig)
  const tx = await client
    .newTx()
    .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: Assets.fromLovelace(5_000_000n) })
    .build({ availableUtxos: genesisUtxos })
  const txHash = await (await tx.sign()).submit()
  expect(await client.awaitTx(txHash, 1000)).toBe(true)
})
```

Two gotchas: give cluster startup a generous timeout, and pass genesis UTXOs explicitly via `build({ availableUtxos })` until they are first spent (after which outputs are indexed normally). For the full devnet reference, including genesis configuration, protocol parameters, and the cluster lifecycle, see the [Evolution SDK devnet docs](https://intersectmbo.github.io/evolution-sdk/docs/devnet/getting-started/).

</TabItem>
</Tabs>

Mesh and other SDKs are adding similar in-process devnet capabilities. As they land they slot in as additional tabs here, so this is a natural place to contribute.

## When to use a local network

Reach for a local network when you need fast iteration without testnet confirmation times, deterministic and isolated state, offline development, or custom genesis parameters, including in CI. Once your application is stable, move to public testnets for production-like testing before mainnet. For public testnets and the faucet, see [Networks and test ADA](/docs/developers/curriculum/start-building/networks-and-test-ada).

## Next steps

- [Testing](/docs/developers/curriculum/smart-contracts/testing): unit- and integration-test your validators and off-chain code
- [Going to production](/docs/developers/curriculum/production/going-to-production): reliability and security before mainnet
