---
id: development-networks
title: Local Development Networks
sidebar_label: Local development networks
description: Run a Cardano network on your own machine, either a standalone cluster you point a frontend at or a programmatic devnet you spin up inside a test suite.
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

- **Yaci Store**: a lightweight indexer for fast blockchain queries (also a standalone production indexer, see [Indexing & analytics](/docs/developers/curriculum/production/indexing-and-analytics)).
- **Yaci Viewer**: a browser UI for exploring transactions and blocks.
- **Ogmios and Kupo**: built in.
- **Blockfrost-compatible API**: point an SDK's Blockfrost provider straight at your local chain.
- **Configurable**: block times, epochs, and network parameters.

Run it with Docker Compose, a standalone CLI zip (Linux x64, macOS arm64), or the NPM package, which is handy in CI. Each path is a few commands: follow the [Docker](https://devkit.yaci.xyz/getting-started/docker), [zip](https://devkit.yaci.xyz/getting-started/zip), or [NPM](https://devkit.yaci.xyz/getting-started/npm) setup guide, and see the [CLI commands](https://devkit.yaci.xyz/commands) reference. Best for integration testing and SDK development.

Both SDKs drive a running Yaci devnet from code. Mesh has a first-class `YaciProvider` (`new YaciProvider("http://localhost:8080/api/v1/")`, or no argument for [Mesh's hosted devnet](https://cloud.meshjs.dev/yaci)); pass an admin URL and it can fund addresses and read devnet config programmatically (`addressTopup`, `getDevnetInfo`). Because Yaci's Store API is **Blockfrost-compatible**, Evolution points its Blockfrost provider straight at it:

```typescript
// Mesh
const provider = new YaciProvider("http://localhost:8080/api/v1/")

// Evolution (Yaci's API speaks Blockfrost)
const client = Client.make(preprod).withBlockfrost({ baseUrl: "http://localhost:8080/api/v1", projectId: "" })
```

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

Two gotchas: give cluster startup a generous timeout, and pass genesis UTXOs explicitly via `build({ availableUtxos })` until they are first spent (after which outputs are indexed normally). For the full devnet reference, including genesis configuration, protocol parameters, and the cluster lifecycle, see the [Evolution SDK devnet docs](https://intersectmbo.github.io/evolution-sdk/docs/devnet/getting-started/).

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh has no in-process node cluster like Evolution's. For **integration tests** it drives a real local chain through a [Yaci devnet](#yaci-devkit) (via `YaciProvider`, above); for **unit tests** it uses in-memory mocks that need no chain at all, covered in [Testing without a chain](#testing-without-a-chain) below.

</TabItem>
</Tabs>

Beyond the SDKs, IntersectMBO maintains the [cardano-node-emulator](https://github.com/IntersectMBO/cardano-node-emulator) for developers working directly in Haskell or PlutusTx. It takes the same in-process approach, emulating the ledger inside a Haskell program with no node to run, for fast, deterministic contract tests. It is Haskell-only and built from source; see the repository for setup.

## Testing without a chain

Not every test needs a network. Testing your off-chain code without a node splits into three jobs: **mock the data source** so a builder has UTXOs and parameters to work with, **compute script execution budgets** offline, and **assert the shape** of the transaction you built. All three run in milliseconds in CI.

Mesh ships a dedicated tool for each, below. Evolution covers the same ground differently: pure encoding round-trips through its schema codecs (`Codec.toCBORHex` / `fromCBORHex`, no node) for unit tests, plus the in-process [devnet](#programmatic-devnets) above for anything that needs a real chain. It has no in-memory mock-provider or transaction-assertion analog. (For testing the validator itself, on-chain, see [Testing](/docs/developers/curriculum/smart-contracts/testing).)

### Mock the data source (OfflineFetcher)

`OfflineFetcher` is an in-memory provider you populate with fixtures, then build and query against exactly like a real one. Construct it with a network, seed it with `addUTxOs([...])`, `addProtocolParameters({...})`, and `addAccount(...)`, and pass it anywhere a provider goes:

```typescript
import { OfflineFetcher, MeshTxBuilder } from "@meshsdk/core";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

const fetcher = new OfflineFetcher("preprod");
fetcher.addProtocolParameters({ minFeeA: 44, minFeeB: 155381 /* ... */ });
fetcher.addUTxOs([
  {
    input: { txHash: "abc123...", outputIndex: 0 },
    output: { address: "addr_test1...", amount: [{ unit: "lovelace", quantity: "100000000" }] },
  },
]);

const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
  networkId: 0,
  walletAddressType: AddressType.Base,
  fetcher,
  mnemonic: ["test", "test", /* ...24 words */],
});

const tx = await new MeshTxBuilder({ fetcher })
  .txOut("addr_test1...", [{ unit: "lovelace", quantity: "5000000" }])
  .changeAddress(await wallet.getChangeAddressBech32())
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete();
```

Persist a populated fetcher with `fetcher.toJSON()` and rebuild it with `OfflineFetcher.fromJSON(json)`, so a fixture is a checked-in file, not setup code.

### Evaluate script budgets offline (OfflineEvaluator)

`OfflineEvaluator` computes Plutus execution units offline. Pair it with an `OfflineFetcher` that holds the script UTxO and collateral, then call `evaluateTx(txCbor)`. It returns one budget per redeemer:

```typescript
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { OfflineFetcher, MeshTxBuilder } from "@meshsdk/core";

const fetcher = new OfflineFetcher("preprod");
// ... addUTxOs (script UTxO + collateral), addProtocolParameters

const evaluator = new OfflineEvaluator(fetcher, "preprod");

const unsignedTx = await new MeshTxBuilder({ fetcher, evaluator })
  .spendingPlutusScript("V3")
  // ... build the spend
  .complete();

const costs = await evaluator.evaluateTx(unsignedTx);
// [{ index: 0, tag: "SPEND", budget: { mem: 508703, steps: 164980381 } }]
```

The same mock supplies both data and budgets, so script tests run with no node and assert on `mem`/`steps` in CI.

### Assert the shape of a built tx (TxTester)

`TxTester` checks what a transaction *is* without submitting it. Parse a tx with `TxParser`, call `toTester()`, then chain filters and assertions and read the verdict with `success()` / `errors()`:

```typescript
import { TxParser, MeshValue } from "@meshsdk/core";
import { CSLSerializer } from "@meshsdk/core-csl";

const txParser = new TxParser(new CSLSerializer(), fetcher);
await txParser.parse(txHex, utxos);
const txTester = txParser.toTester();

txTester
  .outputsAt("addr_test1qz...")
  .outputsValue(MeshValue.fromAssets([{ unit: "lovelace", quantity: "5000000" }]));
txTester.tokenMinted(policyId, "MeshToken", 1);
txTester.validAfter(now).validBefore(now + 60 * 60 * 1000);
txTester.keySigned(keyHash);

console.log(txTester.success(), txTester.errors());
```

You assert that your *builder* produced the outputs, mint, validity window, and signers you intended, without submitting anything.

## When to use a local network

Reach for a local network when you need fast iteration without testnet confirmation times, deterministic and isolated state, offline development, or custom genesis parameters, including in CI. Once your application is stable, move to public testnets for production-like testing before mainnet. For public testnets and the faucet, see [Networks and test ADA](/docs/developers/curriculum/start-building/networks-and-test-ada).

## Next steps

- [Testing](/docs/developers/curriculum/smart-contracts/testing): unit- and integration-test your validators and off-chain code
- [Going to production](/docs/developers/curriculum/production/going-to-production): reliability and security before mainnet
