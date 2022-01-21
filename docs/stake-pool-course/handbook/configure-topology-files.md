---
id: configure-topology-files
title: Configure Topology Files
sidebar_label: Configure topology files
description: "Stake pool course: Learn how to create stake pool keys."
image: ./img/og-developer-portal.png
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

Until fully P2P is live we need to put peers manually in `topology.json` file on relays, to automatize this you can run `topologyUpdater.sh` script from Guild Operators. With this script help, you can speed up your relays registrations too, currently registration is done twice per day based on your pool registration. If you run `topologyUpdater.sh` every 60 minutes on your relays using cron then after 3 hours(or 4 runs) your relays will be registered. And most importnat you can generate `topology.json` which will contain remote peers. Find more details [here](https://cardano-community.github.io/guild-operators/Scripts/topologyupdater/). 
