---
id: guild-ops-suite
title: Get Started with Guild Operators Tools
sidebar_label: Guild Operators Suite
description: Get Started with Guild Operators Tools
image: ./img/og-developer-portal.png
---

## Guild Operators Suite

The Guild-Operators suite is a collection of tools and scripts for easy setup, management, and monitoring of Cardano stake pool(s), alongwith token/keys management. It's the result of a community collaboration effort between long-time active community members to simplify frequent tasks required to be performed by operators. Since detailed documentation for the suite is hosted [here][guild-website] , we will try to provide a quick run-through of tools involved and a high-level overview of stes to get you going.

### Tools

#### CNTools

CNTools is like a swiss army knife for pool operators to simplify typical operations. It is a bash GUI menu-driven tool to create and manage wallets, sending ada and tokens, and about every pool operation needed. In addition to this, the tool has been extended with additional features and improvements since its first official release together with the Cardano Shelley MainNet launch in July 2020. You can find more information about CNTools [here](https://cardano-community.github.io/guild-operators/Scripts/cntools/).  
![img](../../static/img/get-started/guild-ops-suite/guild_cntools.png)  

#### gLiveView

Guild LiveView, or gLiveView, is a local bash CLI monitoring tool that offers an intuitive UI to monitor the node status. It connects to the locally running node using the provided EKG/Prometheus node endpoints to gather and display node metrics, network info, etc in real-time. The tool automatically detects if the node is launched as a relay or block producer and adapts output accordingly. You can find further details about gLiveView [here](https://cardano-community.github.io/guild-operators/Scripts/gliveview/).  
![img](../../static/img/get-started/guild-ops-suite/guild_gliveview.png)  

#### Topology Updater
Topology Updater was created as a temporary solution to allow stake pool relays to auto-discover peers on network and pair them together. While P2P implementation took backseat due to priorities, this script has become one of the essentials to avoid manually reaching out to friends and request to add individual nodes to topology files. You can check more information about the tool [here](https://cardano-community.github.io/guild-operators/Scripts/topologyupdater/).  
![img](../../static/img/get-started/guild-ops-suite/guild_topologyupdater.png)  

#### Guild Network and Support for other networks

Guild Network is a short (30-minute epoch) network - similar to testnet, but completely community run. It is useful to testing/playing around with things on sandbox, and also testing out usable-features before being released to other networks. Each of the tool in the repo already has support for this network, alongwith mainnet, testnet and staging.  

#### Others..

There are other smaller-scale utility scripts that include building of core components from source for individual components, setting up environment pre-requisites, etc. You can read about details as you navigate through homepage starting [here][guild-website].  

:::note
    Please ensure to read the disclaimers on guild website before continuing
:::

### Setting Up Pre-Requisites..

For installing OS Packages, dependencies, setting up a [sample directory structure](https://cardano-community.github.io/guild-operators/basics/#folder-structure) used as an example template input (customisable) for guild tools, fetching of configuration, genesis artifacts, downloading tool scripts, etc , you can use the commands below. The script does have quite a few options (you can use `-h` to check any optional components/arguments you'd want to include).  

``` bash
mkdir "$HOME/tmp";cd "$HOME/tmp"
curl -sS -o prereqs.sh https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/prereqs.sh
chmod 755 prereqs.sh
./prereqs.sh
. "$HOME"/.bashrc
```

### Build of Node/DBSync components

We assume you'd have already seen the guide [here](../../docs/get-started/installing-cardano-node.md). There are similar build scripts/instructions available for building different cardano-node, cardano-db-sync, offline-metadata-tools and setting up postgres+postgREST with dbsync) on guild documentations. You can navigate instructions for each of them [here](https://cardano-community.github.io/guild-operators/build/). The instructions will also deploy these as a systemd service, which is recommended to avoid manually managing services.  

### Customise configuration

Now that you've set-up your OS dependencies and built/installed node binaries, it's time for you to customise your configuration, paths, names, etc for your node. You can use [env](https://cardano-community.github.io/guild-operators/Scripts/env/) file to modify these. Each line contains default value, and a simple explaination about what variable means.  

### Contributions/Feedback..

Issue/PRs are welcome on the [github repository][guild-github].  

### Support Requests

We do have [telegram channel for support requests][guild-tg] , but note that we intend to have support channel only for baseline skillset highlighted on [homepage][guild-website].  

[guild-github]: https://github.com/cardano-community/guild-operators
[guild-website]: https://cardano-community.github.io/guild-operators
[guild-tg]: https://t.me/guild_operators_official
