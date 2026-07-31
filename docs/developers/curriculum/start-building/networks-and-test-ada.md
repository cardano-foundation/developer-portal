---
id: networks-and-test-ada
title: Choose a Network
sidebar_label: Choose a network
description: Pick where your code runs, from a chain on your own machine with 200ms blocks to a public testnet, and get the free test ADA to use it.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Where your code runs is a trade between how quickly you find out and how much the answer proves. You never need real ADA to develop: the **testnets** mirror mainnet using test ADA (tAda) that has no value, and a **faucet** hands it out for free. You can also skip the public networks entirely and run a chain of your own.

| Where | What runs | Confirmation | What it proves |
|---|---|---|---|
| No chain | in-memory fixtures | microseconds | your code built the transaction you meant |
| **A chain you run** | a real node on your machine | whatever you set it to | the whole build, sign, submit, confirm loop |
| **Public testnet** | real consensus, shared with everyone | ~20 seconds | it survives a real network |
| Mainnet | the same, with real value | ~20 seconds | this is not where you find things out |

The middle two are where development happens, and this page covers both. Start on **Preprod**, and move to a local chain when waiting 20 seconds per confirmation starts to cost you. The top rung, testing with no chain at all, is [Offline testing](/docs/developers/curriculum/start-building/offline-testing).

## Choose a network

| Network | Network magic | Purpose | Currency |
|---|---|---|---|
| **Mainnet** | `764824073` | Production; live, real-value apps | Real ADA |
| **Preprod** | `1` | Final validation; mirrors mainnet closely (hard-forks within an epoch of mainnet) | Test ADA |
| **Preview** | `2` | Test upcoming features (hard-forks 4+ weeks before mainnet) | Test ADA |
| **[Local devnet](#run-a-chain-yourself)** | custom | Fast offline iteration, CI, custom scenarios | Test ADA |

Network magic is the identifier each network advertises during the node handshake. Mainnet's `764824073` is a fixed historical value; the public testnets use small numbers.

**Use Preprod** for most development: it behaves like mainnet. Use **Preview** to try features before they reach mainnet. There is also **SanchoNet** for governance testing ([sancho.network](https://sancho.network)).

:::important
Only deploy to mainnet after thorough testnet testing. Mainnet transactions use real ADA and cannot be reversed.
:::

## Get test ADA

Test ADA (tAda) has no real-world value but lets you transact freely.

- **Preview and Preprod**: request it from the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet). Paste your wallet address, click "Request funds", and it arrives within a minute or two.
- **Guild network** (1-hour epochs, for rapid epoch-boundary testing): request manually in the [Guild Operators channel](https://t.me/guild_operators_official).

You will need a testnet address first, which your wallet or SDK generates ([Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys) explains how). Testnet addresses start with `addr_test`.

A local devnet needs none of this. You write the starting balances into genesis yourself, so the funds are there the moment the chain starts.

### Testnet wallets

- **Light wallets**: most Cardano browser and mobile wallets support the testnets. Switch the network to Preview or Preprod in settings, and browse wallets at [cardano.org/apps](https://cardano.org/apps).
- **Hardware**: supported through a browser wallet extension on Preview and Preprod.
- **Programmatic**: SDKs (see [Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools)) or the [cardano-wallet](/docs/developers/curriculum/dapps/listen-for-payments) HTTP API

## Block explorers

Inspect your transactions, addresses, and blocks at [explorer.cardano.org](https://explorer.cardano.org/), which aggregates the major Cardano explorers and supports deeplinks. Pick the URL for your network:

| Network | Explorer |
|---|---|
| Mainnet | [explorer.cardano.org](https://explorer.cardano.org/) |
| Preprod | [explorer.cardano.org/preprod](https://explorer.cardano.org/preprod) |
| Preview | [explorer.cardano.org/preview](https://explorer.cardano.org/preview) |

## Run a chain yourself

A **local development network** is a real Cardano node on your own machine, and every parameter you would otherwise inherit is yours to set.

Block time is the one you feel immediately. Set it to 200 milliseconds and a confirmation lands before you have switched windows, so a test suite that takes minutes against Preprod finishes in seconds. Beyond speed, it is the only way to arrange conditions a public network will not give you on request: a custom protocol parameter, an epoch boundary every few seconds, a specific era, a rollback, or a genesis address that starts with exactly the balance your test needs. There is no faucet in the loop and no internet dependency at all.

The cost is fidelity. A chain you control is not a chain other people are also using, so once your application is stable, rehearse on Preprod before mainnet.

There are two ways to get one, and they suit different jobs:

- **Standalone network**: a separate process you start and leave running, then point a frontend, `cardano-cli`, or a provider API at. The chain persists across your app's runs, so it is the one you develop and demo against.
- **Programmatic devnet**: a cluster your code starts and tears down itself, usually inside a test suite. It is ephemeral, with fresh state every run, which is exactly what you want for automated integration tests.

| | Yaci DevKit | cardano-testnet | Evolution devnet |
| --- | --- | --- | --- |
| **Kind** | Standalone | Standalone | Programmatic (Docker) |
| **Setup** | Docker Compose, zip, or NPM | Build from source | `npm install`, runs in your test code |
| **Includes** | Indexer, viewer, Ogmios, Kupo, Blockfrost-compatible API | Minimal tooling, full genesis and parameter control | Node, Kupo, and Ogmios via Docker |
| **Best for** | Integration testing, SDK development, a chain to point a frontend at | Protocol-level testing, custom genesis and era parameters | Automated integration tests over the full build, sign, submit, confirm lifecycle |

### Yaci DevKit

[Yaci DevKit](https://devkit.yaci.xyz/introduction) is the quickest way to get a local chain for app development. It launches a customizable devnet in minutes and bundles everything an SDK needs:

- **Yaci Store**: a lightweight indexer for fast blockchain queries (also a standalone production indexer, see [Indexing & analytics](/docs/developers/curriculum/production/indexing-and-analytics)).
- **Yaci Viewer**: a browser UI for exploring transactions and blocks.
- **Ogmios and Kupo**: built in.
- **Blockfrost-compatible API**: point an SDK's Blockfrost provider straight at your local chain.

Run it with Docker Compose, a standalone CLI zip (Linux x64, macOS arm64), or the NPM package, which is handy in CI. Each path is a few commands: follow the [Docker](https://devkit.yaci.xyz/getting-started/docker), [zip](https://devkit.yaci.xyz/getting-started/zip), or [NPM](https://devkit.yaci.xyz/getting-started/npm) setup guide.

You create the chain from the DevKit's own shell, and that is where you set its pace:

```shell
devnet:default> create-node -o --start --block-time 0.2 --epoch-length 60
```

- `--block-time` (`-b`) and `--slot-length` (`-s`) are both one second by default and accept sub-second values, so `0.2` gives you 200-millisecond blocks.
- `--epoch-length` (`-e`) is 500 slots by default. Shorten it and epoch boundaries, rewards, and anything else that only happens once an epoch arrive in seconds instead of days.
- `--era` is `conway` or `babbage`.
- `--enable-multi-node` runs several block producers, which is how you test that your code survives a **rollback**. No public network will arrange one for you on demand.

The devnet starts with 20 addresses already funded from a well-known test mnemonic, and `topup` funds any other address, so there is no faucet to wait on. See the [CLI commands](https://devkit.yaci.xyz/commands) reference for the rest.

Both SDKs drive a running Yaci devnet from code. Mesh has a first-class `YaciProvider` (`new YaciProvider("http://localhost:8080/api/v1/")`, or no argument for [Mesh's hosted devnet](https://cloud.meshjs.dev/yaci)); pass an admin URL and it can fund addresses and read devnet config programmatically (`addressTopup`, `getDevnetInfo`). Because Yaci's Store API is **Blockfrost-compatible**, Evolution points its Blockfrost provider straight at it:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
// Yaci's API speaks Blockfrost
const client = Client.make(preprod).withBlockfrost({ baseUrl: "http://localhost:8080/api/v1", projectId: "" })
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const provider = new YaciProvider("http://localhost:8080/api/v1/")
```

</TabItem>
</Tabs>

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

### A devnet your tests start and stop

Some SDKs launch a real local cluster from your test code: a node with Kupo and Ogmios in Docker containers that your code starts, funds from genesis, and removes when the suite ends. The node is a real one; what is programmatic is the control. Because the network lives and dies with your code, it is ideal for automated **integration tests**. You run the full build → sign → submit → confirm lifecycle offline, with no faucet and fresh, isolated state every run.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Evolution ships a devnet in `@evolution-sdk/devnet`. A typical integration test spins the cluster up once, funds a test wallet from genesis, and asserts on confirmation:

```typescript
import { describe, it, beforeAll, afterAll, expect } from "vitest"
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address, Assets, Client } from "@evolution-sdk/evolution"

let cluster: Cluster.Cluster, client: Client.SigningClient, genesisConfig: any

beforeAll(async () => {
  const mnemonic = "test test test ... sauce"
  const addressHex = Address.toHex(Address.fromSeed(mnemonic, { accountIndex: 0, networkId: 0 }))
  genesisConfig = { ...Config.DEFAULT_SHELLEY_GENESIS, slotLength: 0.02, initialFunds: { [addressHex]: 10_000_000_000_000 } }
  cluster = await Cluster.make({
    clusterName: "test-suite",                 // make this unique to avoid port clashes in parallel runs
    ports: { node: 3001, submit: 3002 },
    shelleyGenesis: genesisConfig,
    kupo: { enabled: true, port: 1442 },
    ogmios: { enabled: true, port: 1337 },
  })
  await Cluster.start(cluster)
  client = Client.make(Cluster.getChain(cluster))
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

The genesis object is where the chain's behaviour lives. `slotLength: 0.02` above is 20-millisecond slots, which is why `awaitTx` returns in the time a test can afford. Spread `Config.DEFAULT_SHELLEY_GENESIS` and override what you need: `slotLength` (seconds per slot, default 1), `epochLength` (slots, default 432,000), `initialFunds` (address hex to lovelace), `activeSlotsCoeff`, `securityParam` (the rollback limit), and `protocolParams` for the fee and size limits.

Two gotchas: give cluster startup a generous timeout, and pass genesis UTXOs explicitly via `build({ availableUtxos })` until they are first spent (after which outputs are indexed normally). For the full reference see the [Evolution SDK devnet docs](https://intersectmbo.github.io/evolution-sdk/docs/devnet/getting-started/).

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh has no cluster of its own. For **integration tests** it drives a real local chain through a [Yaci devnet](#yaci-devkit) (via `YaciProvider`, above); for **unit tests** it uses in-memory mocks that need no chain at all, covered in [Offline testing](/docs/developers/curriculum/start-building/offline-testing).

</TabItem>
</Tabs>

## Next steps

- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): now build, sign, and submit one
- [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development): what the Cardano context contains, and how to add it to any agent
