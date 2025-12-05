---
id: ogmios
title: Ogmios
sidebar_label: Ogmios
description: WebSocket JSON-RPC bridge interface for cardano-node providing low-level protocol access.
image: /img/og/og-getstarted-ogmios.png
---

[Ogmios](https://ogmios.dev) is a lightweight WebSocket bridge interface for cardano-node, providing JSON/RPC access to [Ouroboros mini-protocols](https://github.com/IntersectMBO/ouroboros-network/tree/master/docs/network-spec).

:::note
For higher-level abstractions, consider [Blockfrost](/docs/get-started/infrastructure/api-providers/blockfrost/overview), [Koios](/docs/get-started/infrastructure/api-providers/koios), or [cardano-graphql](https://github.com/cardano-foundation/cardano-graphql).
:::

## Installation

The easiest way to get started with Ogmios is to use [docker](https://www.docker.com). Since Ogmios requires the presence of a Cardano node, it makes sense to use docker-compose to orchestrate both services. A compose file is available on the Ogmios repository, get it via:

```sh
git clone --depth 1 https://github.com/CardanoSolutions/ogmios.git
cd ogmios
docker-compose up
```

For source builds or non-Docker installation, see [ogmios.dev/getting-started](https://ogmios.dev/getting-started).

## Dashboard

Access the dashboard at [localhost:1337](http://localhost:1337) for real-time runtime metrics visualization.

![Ogmios Dashboard](/img/get-started/ogmios/1-dashboard.gif)

## Query Metrics

The dashboard uses JSON responses from the health endpoint:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="curl"
values={[
{label: 'curl', value: 'curl'},
{label: 'wget', value: 'wget'},
]}>
<TabItem value="curl">

```sh
curl -H 'Accept: application/json' http://localhost:1337/health
```

  </TabItem>
  <TabItem value="wget">

```sh
wget --header='Accept: application/json' -qO- http://localhost:1337/health
```

  </TabItem>
</Tabs>

**Example response:**

```json
{
    "metrics": {
        "totalUnrouted": 1,
        "totalMessages": 30029,
        "runtimeStats": {
            "gcCpuTime": 1233009354,
            "cpuTime": 81064672549,
            "maxHeapSize": 41630,
            "currentHeapSize": 1014
        },
        "totalConnections": 10,
        "sessionDurations": {
            "max": 57385,
            "mean": 7057,
            "min": 0
        },
        "activeConnections": 0
    },
    "startTime": "2021-03-15T16:16:41.470782977Z",
    "lastTipUpdate": "2021-03-15T16:28:36.853115034Z",
    "lastKnownTip": {
        "hash": "c29428f386c701c1d1ba1fd259d4be78921ee9ee6c174eac898245ceb55e8061",
        "blockNo": 5034297,
        "slot": 15520688
    },
    "networkSynchronization": 0.99,
    "currentEra": "Mary"
}
```

## Next steps

Learn how to interact with Ouroboros mini-protocols at [ogmios.dev/mini-protocols](https://ogmios.dev/mini-protocols).
