---
id: mithril-signer-configuration
title: Mithril Signer Configuration
sidebar_label: Mithril Signer Configuration
description: Configure a Mithril signer on your block producer to sign certified snapshots of the Cardano blockchain state.
image: /img/og/og-developer-portal.png
---

The Mithril signer is the component that signs snapshots of the blockchain state. It runs on the block producer because it needs access to the pool's `operational certificate` and `KES secret key`, which it uses to compute your `PoolId`, prove pool ownership, and participate in the multi-signature process.

:::important

The Mithril signer must **never** connect directly to the internet. In the **production** deployment (required on `mainnet`), all outbound traffic goes exclusively through the Mithril relay. See [Setting up a Mithril relay](/docs/operate-a-stake-pool/relay-configuration/mithril-relay) for more details.

:::

## Overview

Setting up the signer involves four stages:

1. **Prerequisites** -- ensure the Cardano node is fully synchronized and running a [compatible version](https://github.com/input-output-hk/mithril/blob/main/networks.json), with active KES keys. The signer requires read access to the node's database directory and read/write access to the node socket.
2. **Installation** -- download the pre-built `mithril-signer` binary or build it from source, then register it as a `systemd` service running as the same user as the Cardano node.
3. **Credential configuration** -- create an environment file at `/opt/mithril/mithril-signer.env` pointing to your `KES secret key`, `operational certificate`, Cardano node database, node socket, and `cardano-cli` path.
4. **Connecting the pipeline** -- set the `RELAY_ENDPOINT` variable to your internal Mithril relay address (for example, `http://192.168.1.50:3132`). The signer sends signatures through the relay, which forwards them to the Mithril aggregator.

## Key operational details

- The signer is lightweight: less than `5%` CPU and under `200 MB` of memory during normal operation
- It sends a new signature roughly every `10 minutes` and a new registration every `5 days`
- On first launch, a pre-loading phase runs with higher CPU usage for approximately `5 hours`
- When KES keys are rotated, update `KES_SECRET_KEY_PATH` and `OPERATIONAL_CERTIFICATE_PATH` in the environment file if needed, then restart the service

:::note

For the complete step-by-step instructions, including build commands, environment file examples, and service configuration, see [Set up the Mithril signer node](https://mithril.network/doc/manual/operate/run-signer-node#set-up-the-mithril-signer-node) in the Mithril documentation.

:::

## Resources

- [Become a Mithril SPO](https://mithril.network/doc/manual/operate/become-mithril-spo)
- [Run a Mithril signer node](https://mithril.network/doc/manual/operate/run-signer-node)
- [Mithril documentation](https://mithril.network/doc/)
- [GitHub repository](https://github.com/input-output-hk/mithril)
