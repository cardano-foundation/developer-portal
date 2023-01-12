---
id: monitoring-gLiveView
title: Monitoring with gLiveView
sidebar_label: Monitoring with gLiveView
description: "Monitoring the Node (gLiveView)"
image: ../img/og/og-developer-portal.png
---
Guild LiveView, often known as gLiveView, is a local bash CLI monitoring utility with an easy-to-use interface for monitoring node status. It connects to the locally running node via the specified EKG/Prometheus node endpoints to collect and show node metrics, network information, and other information in real time. The program recognizes whether the node is being used as a relay or a block producer and adjusts the output accordingly. 

To install gLiveView:


1. Download the latest Guild LiveView script files, type:

```shell
curl -s -o gLiveView.sh https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/gLiveView.sh
curl -s -o env https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/env
```

2. To set file permissions on the `gLiveView.sh` file that you downloaded in step 1, type:

```shell
chmod 755 gLiveView.sh
```

For most setups, it's enough to set `CNODE_PORT` in the `env` file.



:::note
Detailed guide and more information can be found on [Guild Operators Page](https://cardano-community.github.io/guild-operators/Scripts/gliveview/)
:::
