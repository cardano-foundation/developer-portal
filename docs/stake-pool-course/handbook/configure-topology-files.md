---
id: configure-topology-files
title: Configure Topology Files
sidebar_label: Configure topology files
description: "Stake pool course: Learn how to create stake pool keys."
image: ../img/og/og-developer-portal.png
---

Before you start your nodes, you need to prepare the topology files for block-producing and relay nodes.

## Configure the block-producing node

Make the __block-producing__ node to "talk" only to __YOUR__ relay node. Do not forget to configure your firewall also:

    nano mainnet-topology.json

```json
{
  "Producers": [
    {
      "addr": "<RELAY IP ADDRESS>",
      "port": <PORT>,
      "valency": 1
    }
  ]
}
```

## Configure the relay node:

Make your __relay node__ `talk` to your __block-producing__ node and __other relays__ in the network by editing the `topology.json` file:


    nano mainnet-topology.json

```json
{
  "Producers": [
    {
      "addr": "<BLOCK-PRODUCING IP ADDRESS>",
      "port": <PORT>,
      "valency": 1
    },
    {
      "addr": "<IP ADDRESS>",
      "port": <PORT>,
      "valency": 1
    },
    {
      "addr": "<IP ADDRESS>",
      "port": <PORT>,
      "valency": 1
    }
  ]
}
```

## Optionally you can use `topologyUpdater.sh` on your relay nodes from Guild Operators

Until full P2P is live we need to manually add peers in the `topology.json` file on relay nodes. You can automate this by running the `topologyUpdater.sh` script from Guild Operators. With the help of this script, you can also speed up your relay's registrations (currently registration is done twice per day based on your pool registration). If you run `topologyUpdater.sh` every 60 minutes on your relay nodes using cron, then after 3 hours (or 4 runs) your relays will be registered. And most importantly, it can generate a `topology.json` which will contain remote peers. Find more details [here](https://cardano-community.github.io/guild-operators/Scripts/topologyupdater/). 
