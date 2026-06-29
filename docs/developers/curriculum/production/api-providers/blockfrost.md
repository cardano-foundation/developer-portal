---
id: blockfrost
title: Blockfrost
sidebar_label: Blockfrost
description: Blockfrost is a hosted REST API provider for Cardano. Create a project, get an API key, and make your first request.
image: /img/og/og-getstarted-blockfrost.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Blockfrost](https://blockfrost.io) is a **hosted provider**: it runs the cardano-node and indexer for you and serves the chain over a REST API, so you can put it under your SDK (or call it directly) without running any infrastructure. It is the quickest backend to start with, has a free tier, and its [core is open source](https://github.com/blockfrost/blockfrost-backend-ryo). For where it sits among the alternatives, see [Choosing a provider](/docs/developers/curriculum/start-building/query-the-chain#choosing-a-provider).

## Create an account and project

Create a free account at [blockfrost.io](https://blockfrost.io/auth/signin).

![Blockfrost.io landing page](/img/get-started/blockfrost/getting-started-1_frontend_landing.png)

After signing in, create a project: click **+ ADD PROJECT**, name it, select the network (mainnet, preprod, or preview), and **SAVE**. Each project is scoped to one network and gets its own `project_id`, which is your API key.

![Add Blockfrost project](/img/get-started/blockfrost/getting-started-2_add_project.png)

![Get Blockfrost project_id](/img/get-started/blockfrost/getting-started-3_get_api_key.png)

:::warning
Keep your `project_id` secret. Never commit it or embed it in client-side code. Store it in an environment variable on your backend so it cannot leak to users.
:::

## Cardano networks

Each network has its own endpoint and its own `project_id`:

| Network | Endpoint |
| --- | --- |
| Cardano mainnet | `https://cardano-mainnet.blockfrost.io/api/v0/` |
| Cardano preprod testnet | `https://cardano-preprod.blockfrost.io/api/v0/` |
| Cardano preview testnet | `https://cardano-preview.blockfrost.io/api/v0/` |

## Your first request

Blockfrost is REST: you authenticate with the `project_id` header and request an endpoint. Most apps reach it through an SDK's Blockfrost provider (see [Query the chain](/docs/developers/curriculum/start-building/query-the-chain)), but you can call it directly:

<Tabs>
<TabItem value="curl" label="curl" default>

```bash
export BLOCKFROST_PROJECT_ID_MAINNET=mainnet...
curl -H "project_id: $BLOCKFROST_PROJECT_ID_MAINNET" https://cardano-mainnet.blockfrost.io/api/v0/blocks/latest
```

</TabItem>
<TabItem value="js" label="JavaScript">

```javascript
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

const API = new BlockFrostAPI({ projectId: "YOUR_PROJECT_ID" });

const latestBlock = await API.blocksLatest();
console.log(latestBlock);
```

</TabItem>
</Tabs>

A successful call returns JSON:

```json
{
  "time": 1641338934,
  "height": 15243593,
  "hash": "4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a",
  "slot": 412162133,
  "epoch": 425,
  "slot_leader": "pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2qnikdy",
  "tx_count": 1,
  "fees": "592661"
}
```

Blockfrost has official SDKs for [15+ languages](https://blockfrost.dev/docs/sdks) (JavaScript, Python, Rust, Go, Java, and more). The full endpoint reference is at [blockfrost.dev](https://blockfrost.dev/).

## Beyond the Cardano API

- **IPFS**: Blockfrost also runs an [IPFS gateway](https://blockfrost.dev/docs/start-building/ipfs/) (`https://ipfs.blockfrost.io/api/v0/`) for pinning off-chain content such as NFT assets.
- **Webhooks**: subscribe to on-chain events and receive them via HTTP POST instead of polling, with up to five JSONPath filter conditions per webhook. See the [webhooks docs](https://blockfrost.dev/docs/start-building/webhooks/).
- **Run your own**: the backend ([blockfrost-backend-ryo](https://github.com/blockfrost/blockfrost-backend-ryo)), SDKs, and [OpenAPI spec](https://github.com/blockfrost/openapi) are open source. Run a self-hosted instance from source or the prebuilt Docker image:

```bash
docker run --rm --name blockfrost-ryo -p 3000:3000 \
  -e BLOCKFROST_CONFIG_SERVER_LISTEN_ADDRESS=0.0.0.0 \
  -v $PWD/config:/app/config \
  blockfrost/backend-ryo:latest
```
