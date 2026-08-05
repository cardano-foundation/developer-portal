---
id: use-a-provider
title: Use a Provider
sidebar_label: Use a provider
description: "Set up a hosted Cardano query API with one skeleton for Blockfrost, Koios, and Maestro: create access, find your network's endpoint, make a first request, wire your SDK, and know the limits."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

A [query API](/docs/developers/curriculum/production/connecting-to-the-chain#query-apis) is the fastest way to serve your application the chain: someone else runs the node and the indexer, and your SDK points at a URL. The three documented here are directly comparable, they answer the same REST-shaped reads and accept the same transaction submissions, so this page sets all three up with one identical skeleton: create access, find your network's endpoint, make a first raw request, point your SDK at it, and know the limits. Pick one tab and the rest of the curriculum works the same; switching later is a configuration change.

The differences that matter are operational, not functional: who operates it, how access is granted, and how usage is limited. Where they genuinely differ, the tabs say so.

:::warning Keep keys server-side
An API key identifies and bills *you*. Store it in an environment variable on your backend, never commit it, and never ship it in client-side code, where anyone can read it. The [frontend signs, backend submits](/docs/developers/curriculum/dapps/connect-a-wallet#frontend-signs-backend-builds-and-submits) pattern exists partly for this reason.
:::

## Create access

<Tabs groupId="provider">
<TabItem value="blockfrost" label="Blockfrost" default>

Create a free account at [blockfrost.io](https://blockfrost.io/auth/signin). After signing in, create a project: click **+ ADD PROJECT**, name it, and select the network. Each project is scoped to **one network** and gets its own `project_id`, which is your API key (it starts with the network name, e.g. `preprod...`).

</TabItem>
<TabItem value="koios" label="Koios">

Nothing to create for basic use: Koios is a community-run cluster and its **public tier needs no key**. For higher limits, generate a free auth token from your [Koios profile](https://koios.rest/) and send it as a `Authorization: Bearer <token>` header. The same token works across networks.

</TabItem>
<TabItem value="maestro" label="Maestro">

Create a free account at [dashboard.gomaestro.org](https://dashboard.gomaestro.org/). Create a project, selecting **Cardano** and your network, then copy the project's API key from the dashboard. Each project is scoped to one network.

</TabItem>
</Tabs>

## Network endpoints

Each network has its own base URL, and your access is scoped to the network you set it up for (Koios excepted: same token everywhere, different URL per network).

<Tabs groupId="provider">
<TabItem value="blockfrost" label="Blockfrost" default>

| Network | Base URL |
| --- | --- |
| Mainnet | `https://cardano-mainnet.blockfrost.io/api/v0` |
| Preprod | `https://cardano-preprod.blockfrost.io/api/v0` |
| Preview | `https://cardano-preview.blockfrost.io/api/v0` |

</TabItem>
<TabItem value="koios" label="Koios">

| Network | Base URL |
| --- | --- |
| Mainnet | `https://api.koios.rest/api/v1` |
| Preprod | `https://preprod.koios.rest/api/v1` |
| Preview | `https://preview.koios.rest/api/v1` |

</TabItem>
<TabItem value="maestro" label="Maestro">

| Network | Base URL |
| --- | --- |
| Mainnet | `https://mainnet.gomaestro-api.org/v1` |
| Preprod | `https://preprod.gomaestro-api.org/v1` |
| Preview | `https://preview.gomaestro-api.org/v1` |

</TabItem>
</Tabs>

## Your first request

The same request three ways: ask for the chain tip (or latest block) with your key in the provider's auth header. A JSON answer means access, endpoint, and network line up.

<Tabs groupId="provider">
<TabItem value="blockfrost" label="Blockfrost" default>

Authentication is the `project_id` header:

```bash
curl -H "project_id: $BLOCKFROST_PROJECT_ID" \
  https://cardano-preprod.blockfrost.io/api/v0/blocks/latest
```

```json
{
  "time": 1641338934,
  "height": 15243593,
  "hash": "4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a",
  "slot": 412162133,
  "epoch": 425,
  "tx_count": 1,
  "fees": "592661"
}
```

</TabItem>
<TabItem value="koios" label="Koios">

No header needed on the public tier:

```bash
curl https://preprod.koios.rest/api/v1/tip
```

```json
[
  {
    "hash": "3448481b954a5e90adafc8c16784e787e73acb0aaead2ca13902b2172f3047a5",
    "epoch_no": 304,
    "abs_slot": 129752219,
    "block_no": 4997788,
    "block_time": 1785435419
  }
]
```

Koios is built on [PostgREST](https://postgrest.org/), so every endpoint supports column selection, filtering, ordering, and paging through query parameters; the [API usage guide](https://api.koios.rest/#overview--api-usage) covers the syntax.

</TabItem>
<TabItem value="maestro" label="Maestro">

Authentication is the `api-key` header:

```bash
curl -H "api-key: $MAESTRO_API_KEY" \
  https://preprod.gomaestro-api.org/v1/chain-tip
```

The response is the current chain tip: block hash, height, and slot. Responses are cursor-paginated where lists are involved: pass the returned `next_cursor` back as the `cursor` query parameter to fetch the next page.

</TabItem>
</Tabs>

## Point your SDK at it

You will rarely call the REST API directly: the SDK's provider does it behind the [interface](/docs/developers/curriculum/production/connecting-to-the-chain#a-provider-is-an-interface-not-just-a-service) you already use. Configure the one you set up (base URL and network must match your key):

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

// Blockfrost
const bf = Client.make(preprod).withBlockfrost({
  baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
  projectId: process.env.BLOCKFROST_PROJECT_ID!
})

// Koios
const koios = Client.make(preprod).withKoios({ baseUrl: "https://preprod.koios.rest/api/v1" })

// Maestro
const maestro = Client.make(preprod).withMaestro({
  baseUrl: "https://preprod.gomaestro-api.org/v1",
  apiKey: process.env.MAESTRO_API_KEY!
})
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { BlockfrostProvider, KoiosProvider, MaestroProvider } from "@meshsdk/core"

// Blockfrost, network auto-detected from the key prefix
const bf = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID!)

// Koios, pass the network
const koios = new KoiosProvider("preprod")

// Maestro
const maestro = new MaestroProvider({ network: "Preprod", apiKey: process.env.MAESTRO_API_KEY! })
```

</TabItem>
</Tabs>

Every query and submission from [Query the chain](/docs/developers/curriculum/start-building/query-the-chain) runs unchanged on any of the three.

## Limits

<Tabs groupId="provider">
<TabItem value="blockfrost" label="Blockfrost" default>

The free tier is rate-limited per project, with paid tiers above it; current numbers are on [blockfrost.io](https://blockfrost.io/#pricing). Beyond the chain API, the same account gives you an [IPFS gateway](https://blockfrost.dev/docs/start-building/ipfs/) for pinning off-chain content and [webhooks](https://blockfrost.dev/docs/start-building/webhooks/) that push on-chain events to you instead of you polling.

</TabItem>
<TabItem value="koios" label="Koios">

The public tier carries shared rate limits that protect the community cluster; an auth token raises them. Review the [limits](https://api.koios.rest/#overview--limits) before you integrate. Response times can vary by instance, since the cluster is served by independent community operators.

</TabItem>
<TabItem value="maestro" label="Maestro">

Requests per second depend on your subscription plan, and each call also consumes **compute credits** from a tier-dependent allowance (heavier queries cost more). The `X-RateLimit-*` and `X-Maestro-Credits-*` response headers report where you stand. Current tiers are on [gomaestro.org/developer](https://gomaestro.org/developer).

</TabItem>
</Tabs>

## The full references

Each provider's own documentation is the authority on its endpoints:

- **Blockfrost**: [blockfrost.dev](https://blockfrost.dev/), with official SDKs for 15+ languages beyond the Cardano SDK providers above
- **Koios**: [api.koios.rest](https://api.koios.rest/), every endpoint with a runnable sample query
- **Maestro**: [docs.gomaestro.org](https://docs.gomaestro.org/cardano), covering the indexer plus transaction-management extras

## The same APIs, self-hosted

Two of the three are open source end to end, so outgrowing a hosted tier does not mean leaving the API behind:

- **Blockfrost**: the backend ([blockfrost-backend-ryo](https://github.com/blockfrost/blockfrost-backend-ryo)), SDKs, and [OpenAPI spec](https://github.com/blockfrost/openapi) are open source; a Docker image runs your own instance against your own node and db-sync.
- **Koios**: the [guild-operators suite](https://cardano-community.github.io/guild-operators/Build/grest/) deploys a full gRest instance (node, db-sync, PostgREST, HAProxy) with the same API, removing shared rate limits; you can also [contribute the instance back](https://github.com/cardano-community/koios-artifacts/tree/main/topology) to the community cluster.

Running your own serving layer, in these shapes and lighter ones, is the [self-hosting](/docs/developers/curriculum/production/self-hosting) page.

## Harden it for production

One hosted API is a single point of failure, and chatty code hits rate limits. Because every provider implements the same interface, failover and caching are composition, not migration: see [harden your provider](/docs/developers/curriculum/production/going-to-production#harden-your-provider) for the pattern in both SDKs.

## Next steps

- [Self-hosting](/docs/developers/curriculum/production/self-hosting): the same two workflows served from infrastructure you run
- [Going to production](/docs/developers/curriculum/production/going-to-production): the pre-mainnet checklist, including provider hardening
