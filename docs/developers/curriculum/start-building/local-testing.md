---
id: local-testing
title: Local Testing
sidebar_label: Local testing
description: Test your transaction code at the right level of realism, from in-memory mocks to a private devnet you control, before anything reaches a public network.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Most of what goes wrong in transaction-building code goes wrong before anything is submitted: you selected the wrong UTXO, wrote the datum in the wrong shape, forgot a required signer, or set a validity window that has already passed. All of it is catchable on your own machine. One question decides your setup: how real does the test need to be?

| Approach | What runs | Use it for |
|---|---|---|
| [Mocks and assertions](#mocks-and-assertions) | Nothing; fixture data in memory | Unit tests: did I build the transaction I meant? |
| [In-memory emulator](#the-in-memory-emulator) | A simulated ledger in your test process | Submitting and asserting on state changes and script evaluation, still with no node |
| [Programmatic devnet](#programmatic-devnets) | A real node in Docker, started by your tests | Integration tests over the full build, sign, submit, confirm lifecycle |
| [Standalone devnet](#local-devnets) | A real node you leave running | A chain to develop and demo against, and to point a frontend at |

Each rung down the table is more real and catches what the rung above cannot; each rung up is faster and cheaper. Above all of them sit the public testnets, with real traffic and real confirmation times ([Choose a network](/docs/developers/curriculum/start-building/networks-and-test-ada)). This page is about your transaction code; for testing validator logic itself, see [Testing](/docs/developers/curriculum/smart-contracts/testing) in the smart contracts module.

The two SDKs in this curriculum divide this ground as mirror images: Mesh ships the mocks, assertions, and emulator, and borrows Yaci DevKit when it needs a real chain; Evolution skips chainless tooling and ships its own devnet.

## Mocks and assertions

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

Two companions extend what a mock can check. [`OfflineEvaluator`](https://meshjs.dev/providers/offline-evaluator) computes Plutus execution units with no node: pair it with an `OfflineFetcher` holding the script UTXO and collateral, call `evaluateTx(txCbor)`, and it returns one `mem`/`steps` budget per redeemer, so script budgets are assertable in CI. `TxTester` checks what a transaction *is* without submitting it: parse a built transaction with `TxParser`, call `toTester()`, then chain assertions on outputs, minted tokens, validity window, and signers, and read the verdict with `success()` and `errors()`. Together they verify that your builder produced the transaction you meant.

Evolution covers this rung differently. Its unit-test story is pure encoding round-trips through its schema codecs (`Codec.toCBORHex` / `Codec.fromCBORHex`), which catch datum and schema mistakes where they are made. It ships no mock provider and no transaction assertions; anything past encoding runs against its [devnet](#programmatic-devnets).

## The in-memory emulator

The tools above never submit. `ScalusEmulator` (`@meshsdk/scalus-emulator`) goes one step further: an in-memory ledger that accepts submissions and evolves. The emulator itself comes from [Scalus](https://scalus.org), a Cardano development platform whose in-memory ledger compiles to JavaScript; Mesh wraps it in its fetcher, submitter, and evaluator interfaces, so it drops into a `MeshTxBuilder` where a real provider would go. Submitted transactions are validated under real ledger rules and mutate the emulator's state: scripts are evaluated, fees are charged, and a transaction with an expired validity window is rejected, all in your test process.

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

Evolution has no equivalent, and the Scalus emulator has no Evolution adapter. One naming trap: Evolution's documentation describes an ["Emulator"](https://intersectmbo.github.io/evolution-sdk/docs/testing/emulator/), but that page is its Docker devnet under another name, a real node in containers, not an in-memory tool like the one above.

For developers working directly in Haskell or PlutusTx, IntersectMBO maintains the [cardano-node-emulator](https://github.com/IntersectMBO/cardano-node-emulator), which emulates the ledger inside your program the same way. It is Haskell-only and built from source; see the repository for setup.

## Local devnets

A **local devnet** is a private Cardano network running entirely on your own machine. It runs the same node software and enforces the same ledger rules as the public networks, but nothing is inherited: block time, epoch length, era, protocol parameters, and the initial balances are all yours to configure.

That control is what a devnet is for. With 200-millisecond blocks, a test suite that takes minutes against Preprod finishes in seconds. With a short epoch length, rewards and epoch-boundary logic that would take days to observe on a testnet arrive in minutes. Rollbacks, custom protocol parameters, and specific eras can all be arranged on demand, which no public network offers. A devnet also works offline, needs no faucet, and keeps your work private until you choose to deploy it. The trade-off is realism: a network only you use has none of the traffic and contention of a shared one, so validate on Preprod once your application stabilizes.

There are two ways to run one, suited to different jobs:

- **Standalone devnet**: a process you start and leave running, then point a frontend, `cardano-cli`, or a provider API at. State persists across your app's runs, so this is the one you develop and demo against.
- **Programmatic devnet**: a cluster your test code starts and tears down itself. Fresh state on every run makes it the right shape for automated integration tests.

| | Yaci DevKit | cardano-testnet | Evolution devnet |
| --- | --- | --- | --- |
| **Kind** | Standalone | Standalone | Programmatic (Docker) |
| **Setup** | Docker Compose, zip, or NPM | Build from source | `npm install`, runs in your test code |
| **Includes** | Indexer, viewer, Ogmios, Kupo, Blockfrost-compatible API | Minimal tooling, full genesis and parameter control | Node, Kupo, and Ogmios via Docker |
| **Best for** | Integration testing, SDK development, a chain to point a frontend at | Protocol-level testing, custom genesis and era parameters | Automated integration tests over the full build, sign, submit, confirm lifecycle |

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

### cardano-testnet

[cardano-testnet](https://github.com/IntersectMBO/cardano-node) is cardano-node's own cluster tool, and the choice when you need protocol-level control: it exposes the full genesis files, protocol parameters, epoch and slot timing, and stake distribution, and can start from current mainnet parameters (`--params-mainnet`). It ships as part of cardano-node and is [built from source](/docs/operators/node/installing-cardano-node). `cardano-testnet cardano` starts a cluster, `create-env` generates an editable sandbox environment for repeatable custom networks, and `cardano-testnet cardano --help` documents the full flag set.

### Programmatic devnets

Some SDKs launch a real local cluster from your test code: a node with Kupo and Ogmios in Docker containers that your code starts, funds from genesis, and removes when the suite ends. Because the network lives and dies with the test run, every run gets fresh, isolated state, and the full build → sign → submit → confirm lifecycle runs offline with no faucet in the loop.

Evolution ships this as `@evolution-sdk/devnet`. An integration test spins the cluster up once, funds a wallet from genesis, and asserts on confirmation:

```typescript
import { Cluster, Config, Genesis } from "@evolution-sdk/devnet"
import { Address, Assets, Client } from "@evolution-sdk/evolution"

const mnemonic = "test test test ... sauce"
const addressHex = Address.toHex(Address.fromSeed(mnemonic, { accountIndex: 0, networkId: 0 }))
const genesisConfig = { ...Config.DEFAULT_SHELLEY_GENESIS, slotLength: 0.02, initialFunds: { [addressHex]: 10_000_000_000_000 } }

const cluster = await Cluster.make({
  clusterName: "test-suite",                 // make this unique to avoid port clashes in parallel runs
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

The genesis object is where the chain's behaviour lives: `slotLength: 0.02` gives 20-millisecond slots, which is why `awaitTx` returns in the time a test can afford. Spread `Config.DEFAULT_SHELLEY_GENESIS` and override what you need. Give cluster startup a generous timeout (it launches Docker containers), and tear it down with `Cluster.stop` and `Cluster.remove` when the suite ends. For the full reference see the [Evolution SDK devnet docs](https://intersectmbo.github.io/evolution-sdk/docs/devnet/getting-started/).

Mesh ships no cluster of its own; its integration tests drive a Yaci devnet through `YaciProvider` ([above](#yaci-devkit)).

## Next steps

- [When transactions fail](/docs/developers/curriculum/start-building/transaction-failures): the failure modes these tests catch before a network does
- [Testing](/docs/developers/curriculum/smart-contracts/testing): unit- and integration-test the validators themselves
- [Going to production](/docs/developers/curriculum/production/going-to-production): reliability and security before mainnet
