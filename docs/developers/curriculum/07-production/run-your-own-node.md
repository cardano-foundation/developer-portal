---
id: run-your-own-node
title: Run Your Own Node
sidebar_label: Run your own node
description: When and how a developer runs a Cardano node for direct chain access, and where to go for full production node operation.
image: /img/og/og-developer-portal.png
---

Applications can reach the chain through a [provider](/docs/developers/curriculum/start-building/query-the-chain#choosing-a-provider) and never choose to run a node. You run your own when you want no third-party dependency, full privacy, no rate limits, or complete control, at the cost of operating the infrastructure yourself.

## The quick path

For development or a read-and-submit backend, a passive (non-block-producing) node is enough:

1. **Install** the node from the release binaries: [Installing cardano-node](/docs/operators/node/installing-cardano-node).
2. **Run** it against your network and let it sync. Mithril makes the initial sync minutes rather than hours: [Running cardano-node](/docs/operators/node/running-cardano).
3. **Query** it with cardano-cli over the node socket: [querying the node](/docs/operators/node/running-cardano#querying-the-node).

From there you can pair the node with an indexer (Kupo, db-sync) and a query layer (Ogmios), or just use cardano-cli. See [Production infrastructure](/docs/developers/curriculum/production/infrastructure) for the full stack and the managed alternatives.

## Running in production

Operating a node as real infrastructure (peer topology, monitoring, hardening, high availability, and, if you run a stake pool, registration and block production) is an operations discipline of its own. The **[Operate a Stake Pool](/docs/operators/)** curriculum covers it end to end: installation, configuration and topology, running, registration, monitoring with Prometheus and Grafana, and security hardening. A developer standing up a node for queries does not need most of it, but it is the place to go when you do.
