---
id: relay-node-configuration
title: Relay Node Configuration
sidebar_label: Relay Configuration
description: How to configure a Cardano relay node for stake pool operation.
image: ../img/og-developer-portal.png
---

A relay node accepts connections from the network and forwards blocks and transactions to your block producer. It has a public IP address; your block producer does not.

Before continuing, complete [Installing cardano-node](/docs/get-started/infrastructure/node/installing-cardano-node) and download your network's configuration files as described in [Running cardano-node](/docs/get-started/infrastructure/node/running-cardano).

:::tip Test on preprod first
Run through the full setup on the [Pre-Production testnet](/docs/get-started/networks/testnets) before touching mainnet. Swap `mainnet` for `preprod` in every path and URL below.
:::

## Relay topology

Your relay connects outward to:
- Your **block producer** — as a private `localRoots` entry, never advertised
- **Bootstrap peers** — trusted relays from founding organizations, used for initial sync (Praos mode)
- The **wider network** — via ledger peer discovery once synced

Example relay topology for mainnet:

```json
{
  "localRoots": [
    {
      "accessPoints": [
        { "address": "YOUR-BLOCK-PRODUCER-IP", "port": 6000 }
      ],
      "advertise": false,
      "hotValency": 1,
      "warmValency": 2,
      "trustable": false
    }
  ],
  "bootstrapPeers": [
    { "address": "backbone.cardano.iog.io",               "port": 3001 },
    { "address": "backbone.mainnet.emurgornd.com",         "port": 3001 },
    { "address": "backbone.mainnet.cardanofoundation.org", "port": 3001 }
  ],
  "publicRoots": [
    {
      "accessPoints": [
        { "address": "relays-new.cardano-mainnet.iohk.io", "port": 3001 }
      ],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 128908821
}
```

Key points:
- **`advertise: false`** on the block producer entry — its address must never be shared with the network.
- **`useLedgerAfterSlot`** should match the value in the official `topology.json` for your network. Do not set it to `-1` on a relay.
- For preprod, use the bootstrap peers and `useLedgerAfterSlot` value from the [downloaded preprod topology](https://book.play.dev.cardano.org/environments/preprod/topology.json).

See [Topology](/docs/get-started/infrastructure/node/topology) for full field documentation, Genesis mode configuration, and peer connection targets.

## Mithril relay (optional, required for Mithril signing)

:::note
This section only applies if you are running a Mithril signer on your block producer to participate in Mithril snapshot certification. It is not required to operate a stake pool.
:::

The Mithril relay is a Squid forward proxy that runs on the Cardano relay machine. It routes traffic between the Mithril signer on your block producer and the external Mithril aggregator, keeping the block producer isolated from the public internet.

Key configuration points:

- **Listening port** — `3132` is recommended
- **Source restriction** — only the block producer's internal IP is allowed to connect
- **Destination restriction** — only HTTPS traffic to `*.mithril.network` is permitted
- **Header anonymization** — request headers are stripped to avoid disclosing information about the block producer
- **Caching** — disabled; the proxy only forwards traffic

After setting up the proxy, point the Mithril signer on the block producer at it by setting `RELAY_ENDPOINT=http://<relay-internal-ip>:3132` in the signer's environment.

For the complete setup including build commands, Squid configuration, and the systemd service unit, see [Set up the Mithril relay node](https://mithril.network/doc/manual/operate/run-signer-node/#set-up-the-mithril-relay-node) in the Mithril documentation.

**Further reading:**
- [Become a Mithril SPO](https://mithril.network/doc/manual/operate/become-mithril-spo)
- [Run a Mithril signer node](https://mithril.network/doc/manual/operate/run-signer-node)
