---
id: koios
title: Koios
sidebar_label: Koios
description: Community-driven, open-source Cardano API with REST and GraphQL endpoints.
image: /img/og/og-getstarted-koios.png
---

[Koios](https://koios.rest) provides open-source, elastic API layer for querying Cardano blockchain across mainnet, testnets, and guildnet. Run Koios as a light web service or deploy your own instance with custom endpoints and automatic failover.

## Using Koios API

### API Documentation

Access the full API documentation at [api.koios.rest](https://api.koios.rest). Koios leverages [PostgREST](https://postgrest.org/), enabling vertical and horizontal data filtering with built-in ordering and custom paging. See the [API usage guide](https://api.koios.rest/#overview--api-usage) for details.

Each endpoint provides sample curl commands you can execute directly from your browser for testing.

![Koios API documentation](/img/get-started/koios/1-usage.png)

### Rate Limits

Remote Koios usage includes protective measures against spamming and unintentional denial-of-service. Review the [limits documentation](https://api.koios.rest/#overview--limits) before integration.

## Feature Requests

Report issues or request features on the [Koios Artifacts](https://github.com/cardano-community/koios-artifacts) repository. Discuss in the [Koios Telegram group](https://t.me/+zE4Lce_QUepiY2U1).

## Running Your Own Instance

Run Koios locally to remove API limits, add customization, reduce latency, or contribute to the network. The [guild-operators suite](https://cardano-community.github.io/guild-operators/) provides scripts for deploying gRest instances with full API compatibility.

:::note
Keep `cardano-db-sync` and `postgres` together. Splitting them without proper tuning results in poor performance. PostgREST and HAProxy can run as separate microservices once familiar with deployment.
:::

### Setup Steps

1. **Prepare system**: Install dependencies and create folder structures using the [prereqs script](https://cardano-community.github.io/guild-operators/basics/#pre-requisites)

2. **Install PostgreSQL**: Set up PostgreSQL server with infrastructure-appropriate tuning. See [PostgreSQL guide](https://cardano-community.github.io/guild-operators/Appendix/postgres/)

3. **Set up cardano-node**: Install and sync node to current epoch. See [node installation guide](https://cardano-community.github.io/guild-operators/Build/node-cli/). Optionally install `cardano-submit-api` for transaction submission.

4. **Deploy cardano-db-sync**: Set up dbsync instance (use snapshots rather than syncing from scratch). Follow [dbsync guide](https://cardano-community.github.io/guild-operators/Build/dbsync/) and run as systemd service.

5. **Install gRest**: Run `setup-grest.sh` as detailed [here](https://cardano-community.github.io/guild-operators/Build/grest/#setup). For mainnet deployment:
   ```bash
   ./setup-grest.sh -f -i prmcd -q -b <branch/tag>
   ```

6. **[Optional] Add Ogmios**: Install [Ogmios](https://ogmios.dev) for WebSocket access (requires advanced session management).

### Service Configuration

Default configuration, services, and ports:

| Component | Config | Port | Service Name |
|-----------|--------|------|--------------|
| PostgreSQL | `/etc/postgresql/14/main/postgresql.conf` | 5432 | postgresql |
| Cardano-Node | `/opt/cardano/cnode/files/config.json` | 6000 | cnode |
| Cardano-Submit-API | `/opt/cardano/cnode/files/config.json` | 8090 | cnode-submit-api |
| Cardano-DB-Sync | `/opt/cardano/cnode/files/dbsync.json` | N/A | cnode-dbsync |
| PostgREST | `/opt/cardano/cnode/priv/grest.conf` | 8050 | cnode-postgrest |
| HAProxy | `/opt/cardano/cnode/files/haproxy.cfg` | 8053 | cnode-haproxy |
| Prometheus Exporter | `/opt/cardano/cnode/scripts/getmetrics.sh` | 8059 | cnode-grest_exporter |

**Entry point**: Query endpoints through HAProxy port (enable SSL as described [here](https://cardano-community.github.io/guild-operators/Build/grest/#tls)). Adjust firewall rules to expose only HAProxy port.

### Join Koios Cluster

Participate in the Koios cluster by:

1. Submit PR on [koios-artifacts topology](https://github.com/cardano-community/koios-artifacts/tree/main/topology) with your connectivity information

2. Open ports for Prometheus Exporter, HAProxy, and Cardano-Submit-API to monitoring instances

3. Commit to following version releases (typically Saturday 8am UTC with advance notification)

## Community

Join bi-weekly open meetings (2nd/4th Thursday each month). Follow the [Koios Telegram discussions](https://t.me/+zE4Lce_QUepiY2U1) for updates.

:::note
For Koios client libraries and tools, see [Builder Tools > Koios](/tools?tags=koios).
:::
