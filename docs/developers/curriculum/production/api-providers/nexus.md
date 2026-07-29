---
id: nexus
title: Nexus
sidebar_label: Nexus
description: Nexus is a hosted multi-chain data API (Cardano, Bitcoin, Midnight). Create an API key and make your first request.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Nexus](https://nexus.gerowallet.io) is a **hosted provider** built by the team behind GeroWallet: it runs the node infrastructure and indexers for you and serves the chain over a REST and WebSocket API, so you can put it under your SDK (or call it directly) without running anything yourself. It is **multi-chain** — Cardano, Bitcoin, and Midnight behind one base URL and one auth header — with extras such as market data and a wallet-analytics addon. For where it sits among the alternatives, see [Choosing a provider](/docs/developers/curriculum/start-building/query-the-chain#choosing-a-provider).

## Create an account and API key

Sign up at [nexus.gerowallet.io](https://nexus.gerowallet.io/) and create an API key. Each key is **scoped to one chain and one network** (for example Cardano Preprod), so you create a key per chain and network you call. Your key starts with `nxs_`.

:::warning
Keep your API key secret. Never commit it or embed it in client-side code. Store it in an environment variable on your backend so it cannot leak to users.
:::

## One base URL, network by key

Unlike providers that expose a different host per network, Nexus uses a single base URL and derives the network from your key's scope (a `?network=` query parameter is also accepted):

| | |
| --- | --- |
| Base URL | `https://nexus.gerowallet.io/api` |
| Networks | `CARDANO_MAINNET`, `CARDANO_PREPROD`, `CARDANO_PREVIEW` (plus Bitcoin and Midnight networks) |
| Auth header | `X-Api-Key: nxs_...` |

## Your first request

Nexus is REST: you authenticate with the `X-Api-Key` header and request an endpoint. Most apps reach it through an SDK provider (see [Query the chain](/docs/developers/curriculum/start-building/query-the-chain)), but you can call it directly:

<Tabs>
<TabItem value="curl" label="curl" default>

```bash
export NEXUS_API_KEY=nxs_...
curl -H "X-Api-Key: $NEXUS_API_KEY" "https://nexus.gerowallet.io/api/blocks/latest"
```

</TabItem>
<TabItem value="js" label="JavaScript / TypeScript">

```typescript
import { NexusClient } from "@adlabs/nexus";

const nexus = new NexusClient({ apiKey: process.env.NEXUS_API_KEY! });

const latestBlock = await nexus.cardano.blocks.latest();
console.log(latestBlock);
```

</TabItem>
</Tabs>

A successful call returns JSON:

```json
{
  "hash": "4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a",
  "height": 15243593,
  "slot": 412162133,
  "epoch": 425,
  "tx_count": 1,
  "fees": "592661",
  "confirmations": 1
}
```

The full endpoint reference (Cardano, Bitcoin, Midnight, market data, IPFS) is at [nexus.gerowallet.io/docs](https://nexus.gerowallet.io/docs).

## Using it from an SDK

- **Mesh**: a `NexusProvider` implements Mesh's `IFetcher` / `ISubmitter` / `IEvaluator`, so it drops into a Mesh app in place of any other provider ([MeshJS/providers](https://github.com/MeshJS/providers)).
- **lucid-evolution**: a native `Nexus` provider is available for lucid-evolution apps ([Anastasia-Labs/lucid-evolution#722](https://github.com/Anastasia-Labs/lucid-evolution/pull/722)).
- **Typed client**: [`@adlabs/nexus`](https://github.com/Gero-Labs/nexus-sdk) is a zero-dependency TypeScript client covering the full API (Cardano, Bitcoin, Midnight).

## Beyond the Cardano API

- **Multi-chain**: the same key format and base URL serve **Bitcoin** and **Midnight** endpoints alongside Cardano.
- **Market data**: token prices, DEX pools and swaps, NFT floors, and wallet PnL (Cardano mainnet).
- **WebSocket**: a market-data WebSocket for streaming updates instead of polling.
- **IPFS**: an addon for resolving and pinning off-chain content such as NFT assets.
