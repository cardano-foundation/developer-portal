---
id: local-testing
title: Local Testing
sidebar_label: Local testing
description: "Speed up your feedback loop: simulate the ledger in memory with an emulator, or run a private devnet on your own machine."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

On Preprod, every attempt costs a 20-second confirmation, faucet funds, and public visibility. Most of what goes wrong in transaction code needs none of that to catch: you selected the wrong UTXO, wrote the datum in the wrong shape, forgot a required signer, or set a validity window that has already passed. You can run the whole loop locally instead, in one of two ways: simulate the ledger in memory, or run a real private chain.

| Option | What runs | Use it for |
|---|---|---|
| [In-memory emulator](#the-in-memory-emulator) | A simulated ledger in your test process | Unit tests and CI: submit, evaluate scripts, and assert on state in milliseconds |
| [Programmatic devnet](#programmatic-devnets) | A real node in Docker, started by your tests | Integration tests over the full build, sign, submit, confirm lifecycle |
| [Standalone devnet](#local-devnets) | A real node you leave running | A chain to develop and demo against, and to point a frontend at |

The public testnets stay the final rehearsal, with real traffic and real timing ([Choose a network](/docs/developers/curriculum/start-building/networks-and-test-ada)). This page is about your transaction code; for testing validator logic itself, see [Testing](/docs/developers/curriculum/smart-contracts/testing) in the smart contracts module.

The two SDKs in this curriculum divide the ground as mirror images: Mesh ships the in-memory emulator and drives Yaci DevKit when it needs a real chain; Evolution ships its own devnet.

## The in-memory emulator

`ScalusEmulator` (`@meshsdk/scalus-emulator`) is an in-memory ledger that accepts submissions and evolves. It comes from [Scalus](https://scalus.org), a Cardano development platform whose ledger implementation compiles to JavaScript; Mesh wraps it in its fetcher, submitter, and evaluator interfaces, so the `MeshTxBuilder` code you wrote in [Transaction building](/docs/developers/curriculum/start-building/transaction-building) runs against it unchanged, where a real provider would go. Submitted transactions are validated under real ledger rules and mutate the emulator's state: scripts are evaluated, fees are charged, and a transaction with an expired validity window is rejected, all in your test process.

```typescript
import { SLOT_CONFIG_NETWORK, unixTimeToEnclosingSlot, MeshTxBuilder } from "@meshsdk/core";
import { ScalusEmulator } from "@meshsdk/scalus-emulator";

const provider = new ScalusEmulator(
  [
    {
      input: { txHash: "0000000000000000000000000000000000000000000000000000000000000000", outputIndex: 0 },
      output: { address, amount: [{ unit: "lovelace", quantity: "1000000000" }] },
    },
  ],
  SLOT_CONFIG_NETWORK["preview"],
);
await provider.setSlot(unixTimeToEnclosingSlot(Date.now(), SLOT_CONFIG_NETWORK["preview"]));

const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider, evaluator: provider });
const txHex = await txBuilder
  .txOut(address, [{ unit: "lovelace", quantity: "5000000" }])
  .changeAddress(address)
  .selectUtxosFrom(await provider.fetchAddressUTxOs(address))
  .complete();
const txHash = await provider.submitTx(await wallet.signTx(txHex));

// the ledger moved: the next fetch reflects the spend, minus fees
const after = await provider.fetchAddressUTxOs(address);
```

Seed it with initial UTXOs and a slot configuration: `SLOT_CONFIG_NETWORK` gives you a public network's timing, and `setSlot` positions the clock, which is what makes validity-window tests meaningful. The emulator validates ledger rules but it is not a node: there is no networking, no real confirmation timing, and no provider API surface. When those matter, move down the table to a [programmatic devnet](#programmatic-devnets).

## Local devnets

A **local devnet** is a private Cardano network running entirely on your own machine. It runs the same node software and enforces the same ledger rules as the public networks, but nothing is inherited: block time, epoch length, era, protocol parameters, and the initial balances are all yours to configure.

That control is what a devnet is for. With 200-millisecond blocks, a test suite that takes minutes against Preprod finishes in seconds. With a short epoch length, rewards and epoch-boundary logic that would take days to observe on a testnet arrive in minutes. Rollbacks, custom protocol parameters, and specific eras can all be arranged on demand, which no public network offers. A devnet also works offline, needs no faucet, and keeps your work private until you choose to deploy it. The trade-off is realism: a network only you use has none of the traffic and contention of a shared one, so validate on Preprod once your application stabilizes.

There are two ways to run one, suited to different jobs:

- **Standalone devnet**: a process you start and leave running, then point a frontend, `cardano-cli`, or a provider API at. State persists across your app's runs, so this is the one you develop and demo against.
- **Programmatic devnet**: a cluster your test code starts and tears down itself. Fresh state on every run makes it the right shape for automated integration tests.

| | Yaci DevKit | Evolution devnet |
| --- | --- | --- |
| **Kind** | Standalone | Programmatic (Docker) |
| **Setup** | Docker Compose, zip, or NPM | `npm install`, runs in your test code |
| **Includes** | Indexer, viewer, Ogmios, Kupo, Blockfrost-compatible API | Node, Kupo, and Ogmios via Docker |
| **Best for** | Integration testing, SDK development, a chain to point a frontend at | Automated integration tests over the full build, sign, submit, confirm lifecycle |

### Yaci DevKit

[Yaci DevKit](https://devkit.yaci.xyz/introduction) is the quickest way to a standalone devnet. Alongside the node it bundles an indexer (Yaci Store), a browser viewer for transactions and blocks, Ogmios and Kupo, and a **Blockfrost-compatible API**, so an SDK configured for Blockfrost connects to your devnet unchanged. Run it with [Docker Compose](https://devkit.yaci.xyz/getting-started/docker), a [standalone zip](https://devkit.yaci.xyz/getting-started/zip), or the [NPM package](https://devkit.yaci.xyz/getting-started/npm), which is handy in CI.

You create the chain from the DevKit's shell, and that is where you set its pace:

```shell
devnet:default> create-node -o --start --block-time 0.2 --epoch-length 60
```

`--block-time` and `--slot-length` accept sub-second values, `--epoch-length` (in slots) brings epoch boundaries and rewards around in seconds instead of days, `--era` selects `conway` or `babbage`, and `--enable-multi-node` runs several block producers so you can test that your code survives a rollback. The devnet starts with 20 addresses funded from a well-known test mnemonic, and `topup` funds any other address; the [CLI commands](https://devkit.yaci.xyz/commands) reference covers the rest.

Connect your SDK through the Blockfrost-compatible endpoint:

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

### Programmatic devnets

Some SDKs launch a real local cluster from your test code: a node with Kupo and Ogmios in Docker containers that your code starts, funds from genesis, and removes when the suite ends. Because the network lives and dies with the test run, every run gets fresh, isolated state, and the full build → sign → submit → confirm lifecycle runs offline with no faucet in the loop.

Evolution ships this as `@evolution-sdk/devnet`. An integration test spins the cluster up once, funds a wallet from genesis, and asserts on confirmation:

```typescript
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address, Assets, Client } from "@evolution-sdk/evolution"

const mnemonic = "test test test ... sauce"
const addressHex = Address.toHex(Address.fromSeed(mnemonic, { accountIndex: 0, networkId: 0 }))
const genesisConfig = { ...Config.DEFAULT_SHELLEY_GENESIS, slotLength: 0.1, initialFunds: { [addressHex]: 10_000_000_000_000 } }

const cluster = await Cluster.make({
  clusterName: "test-suite",
  ports: { node: 3001, submit: 3002 },
  shelleyGenesis: genesisConfig,
  kupo: { enabled: true, port: 1442 },
  ogmios: { enabled: true, port: 1337 },
})
await Cluster.start(cluster)

const client = Client.make(Cluster.getChain(cluster))
  .withKupmios({ kupoUrl: "http://localhost:1442", ogmiosUrl: "http://localhost:1337" })
  .withSeed({ mnemonic, accountIndex: 0 })

// genesis UTXOs aren't Kupo-indexed until first spent, so pass them explicitly
const genesisUtxos = await Genesis.calculateUtxosFromConfig(genesisConfig)
const tx = await client.newTx()
  .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: Assets.fromLovelace(5_000_000n) })
  .build({ availableUtxos: genesisUtxos })
const txHash = await (await tx.sign()).submit()
await client.awaitTx(txHash, 1000)
```

The genesis object is where the chain's behaviour lives: `slotLength: 0.1` gives 100-millisecond slots, which is why `awaitTx` returns in the time a test can afford. Spread `Config.DEFAULT_SHELLEY_GENESIS` and override what you need. Give cluster startup a generous timeout (it launches Docker containers), keep `clusterName` unique to avoid port clashes in parallel runs, and tear it down with `Cluster.stop` and `Cluster.remove` when the suite ends. For the full reference see the [Evolution SDK devnet docs](https://intersectmbo.github.io/evolution-sdk/docs/devnet/getting-started/).

Mesh ships no cluster of its own; its integration tests drive a Yaci devnet through `YaciProvider` ([above](#yaci-devkit)).

## Next steps

- [When transactions fail](/docs/developers/curriculum/start-building/transaction-failures): the failure modes these tests catch before a network does
- [Testing](/docs/developers/curriculum/smart-contracts/testing): unit- and integration-test the validators themselves
- [Going to production](/docs/developers/curriculum/production/going-to-production): reliability and security before mainnet
