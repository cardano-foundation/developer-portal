---
id: self-hosting
title: Self-Hosting
sidebar_label: Self-hosting
description: "Serve your application the chain from infrastructure you run: a Dolos data node, a node with Ogmios and Kupo, or a full node, with Demeter as the managed variant of the same architecture."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Self-hosting serves the same [two workflows](/docs/developers/curriculum/production/connecting-to-the-chain) as a hosted query API, read state and submit transactions, from infrastructure you run. You take it on for privacy (nobody sees your queries), independence (no third-party outage or rate limit in your path), or trust (validating the chain yourself instead of believing an operator).

It comes in three shapes, and they are not steps on one ladder but different trades of trust against operations. Each tab below is a complete path: start it, check it, point your SDK at it.

| Shape | Processes | Trust model | Resources |
| --- | --- | --- | --- |
| **Data node** (Dolos) | One | Trusts the relays it syncs from | A few GB of RAM, one ledger copy |
| **Node + Ogmios + Kupo** | Three | Trustless: your node validates everything | A full node plus two light services |
| **Full node** (+ your choice of serving layer) | One, then more | Trustless | Real storage, memory, and uptime commitment |

## Run it

<Tabs groupId="stack">
<TabItem value="dolos" label="Data node (Dolos)" default>

**What it is.** [Dolos](https://docs.txpipe.io/dolos) is a [data node](/docs/developers/curriculum/production/connecting-to-the-chain#data-nodes): a single lightweight Rust process that syncs the ledger directly from Cardano relays and serves it over several APIs, replacing the node + indexer + API stack for read-and-submit workloads. It trusts the relays you configure and cannot produce blocks; in exchange it is the smallest self-hosted footprint there is.

**Start it.** Install Dolos and sync it against your network; the [TxPipe quickstart](https://docs.txpipe.io/dolos) covers installation and initial configuration. Then enable the API your SDK already speaks, **Mini-Blockfrost**, in `dolos.toml` and start Dolos:

```toml
[serve.minibf]
listen_address = "[::]:3000"
permissive_cors = true
```

Dolos exposes each API on its own port, enabled selectively: Mini-Blockfrost (REST, a [subset of the Blockfrost API](https://docs.txpipe.io/dolos/apis/minibf)), Mini-Kupo (Kupo-style UTXO queries), UTxO RPC (gRPC), and the Ouroboros node-to-client socket for tools that expect a node (such as cardano-cli).

**Check it.** Port 3000 now serves Blockfrost-shaped responses from your local copy of the ledger, no API key required:

```sh
curl -s localhost:3000/blocks/latest | jq
```

**Point your SDK at it.** Every major transaction builder has a Blockfrost provider; point its base URL at your Dolos instance (the SDK's network must match the network Dolos is syncing):

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "http://localhost:3000",
    projectId: "dolos"   // Mini-Blockfrost doesn't check the key; any value works
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";

const provider = new BlockfrostProvider("http://localhost:3000");

const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  submitter: provider,
});
```

</TabItem>
</Tabs>

**Size it.** Not every workload needs the full chain, so Dolos stores only what you configure: **ledger-only** (current state, enough to build and submit), **sliding window** (recent history with configurable retention), or **full archive** (everything, for explorers and historical queries). Check the [Mini-Blockfrost endpoint list](https://docs.txpipe.io/dolos/apis/minibf) covers your queries before swapping it in for a hosted API.

</TabItem>
<TabItem value="kupmios" label="Node + Ogmios + Kupo">

**What it is.** The trustless read-and-submit stack: your own cardano-node validates the chain, [Ogmios](https://ogmios.dev) translates its [node interface](/docs/developers/curriculum/production/connecting-to-the-chain#node-interfaces) into WebSocket JSON, and [Kupo](https://github.com/CardanoSolutions/kupo) indexes the UTXOs matching patterns you configure (by address, policy ID, and more) with fast sync and low resource use. Together they are the **Kupmios** backend both SDKs support directly.

**Start it.** The Ogmios repository ships a Docker Compose file that orchestrates the node and Ogmios together:

```sh
git clone --depth 1 https://github.com/CardanoSolutions/ogmios.git
cd ogmios
docker compose up
```

For source builds or non-Docker installation, see [ogmios.dev/getting-started](https://ogmios.dev/getting-started); Kupo's [manual](https://cardanosolutions.github.io/kupo/) covers adding the indexer with your match patterns.

**Check it.** Ogmios serves a dashboard at [localhost:1337](http://localhost:1337) and a health endpoint:

```sh
curl -H 'Accept: application/json' http://localhost:1337/health
```

The fields that matter are `networkSynchronization` (1.0 means fully synced) and `lastKnownTip`; the rest are connection and runtime metrics for the dashboard.

**Point your SDK at it.**

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod).withKupmios({
  ogmiosUrl: "ws://localhost:1337",
  kupoUrl: "http://localhost:1442"
})
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { OgmiosProvider } from "@meshsdk/core"

// Mesh has no single Kupmios provider: OgmiosProvider submits and evaluates,
// pair it with Kupo queries for indexed reads
const ogmios = new OgmiosProvider("ws://localhost:1337")
```

</TabItem>
</Tabs>

**Go deeper.** Ogmios exposes the node's mini-protocols themselves (chain-sync, mempool monitoring, state queries) at [ogmios.dev/mini-protocols](https://ogmios.dev/mini-protocols); [the network protocol beneath the APIs](/docs/developers/curriculum/production/network-protocol) explains what those are.

</TabItem>
<TabItem value="node" label="Full node">

**What it is.** A passive (non-block-producing) [cardano-node](/docs/developers/curriculum/production/connecting-to-the-chain#the-full-node) of your own: the most trustless access there is, and the foundation the other shapes replace or build on. For development or a read-and-submit backend it is enough on its own, queried over its socket.

```text
cardano-node (mainnet), rough requirements:
  Storage:   ~180 GB (growing ~15 GB/year)
  RAM:       16+ GB (24 GB recommended)
  CPU:       4+ cores
  Sync:      hours to days from genesis (minutes with a Mithril snapshot)
  Uptime:    must stay running to serve queries
```

**Start it.**

1. **Install** the node from the release binaries: [Installing cardano-node](/docs/operators/node/installing-cardano-node).
2. **Run** it against your network and let it sync. A certified [Mithril](/docs/operators/operator-tools/mithril) snapshot makes the initial sync minutes rather than hours: [Running cardano-node](/docs/operators/node/running-cardano).

**Check it.** Query it with cardano-cli over the node socket: [querying the node](/docs/operators/node/running-cardano#querying-the-node).

**Serve your app from it.** A bare node has no application API, so pair it with a serving layer: Ogmios and Kupo (the neighboring tab, pointed at this node), a [custom indexer](/docs/developers/curriculum/production/indexing-and-analytics), or a full self-hosted query API ([blockfrost-backend-ryo or a Koios gRest instance](/docs/developers/curriculum/production/use-a-provider#the-same-apis-self-hosted)).

**Running it as real infrastructure** (peer topology, monitoring, hardening, high availability, and, if you run a stake pool, registration and block production) is an operations discipline of its own; the [Operate a Stake Pool](/docs/operators/) curriculum covers it end to end. A developer standing up a node for queries does not need most of it, but it is the place to go when you do.

</TabItem>
</Tabs>

## The managed variant: Demeter

[Demeter](https://demeter.run) hosts this page's architecture as a [managed platform](/docs/developers/curriculum/production/connecting-to-the-chain#managed-platforms): node access, indexers (db-sync, Kupo, Mumak), and node interfaces (Ogmios, submit API, UTxO RPC, Blockfrost RYO) provisioned as cloud services across mainnet, preprod, and preview. You get the self-hosted shapes without the operations, at the price of reintroducing a platform operator into your trust model. It fits when you want stack-level control (your own Kupo patterns, your own Ogmios session) but not the servers.

Create an account at [demeter.run](https://demeter.run) and see the [Demeter documentation](https://docs.demeter.run) for service setup; wiring an SDK to a hosted Kupmios with the platform's API keys is shown in [Query the chain](/docs/developers/curriculum/start-building/query-the-chain#choosing-a-provider).

## Next steps

- [Custom indexing & analytics](/docs/developers/curriculum/production/indexing-and-analytics): shape your own index instead of adopting a fixed one
- [The network protocol beneath the APIs](/docs/developers/curriculum/production/network-protocol): what the node interfaces translate, one layer further down
- [Going to production](/docs/developers/curriculum/production/going-to-production): the checklist that decides between these shapes and a hosted API
