---
id: mithril-relay
title: Setting up a Mithril relay
sidebar_label: Setting up a Mithril relay
description: Set up a Mithril relay node to bridge your signer and the Mithril aggregator while keeping your block producer isolated.
image: /img/og/og-developer-portal.png
---

The Mithril relay is a forward proxy that often runs on the Cardano relay machine and routes traffic between the Mithril signer (running on the block producer) and the external Mithril aggregator. It can also run on a separate host if desired. It ensures the block producer stays isolated from the public internet, preserving the standard stake pool security model.

:::important

The Mithril relay is required for the **production** deployment model on `mainnet`.

:::

## Overview

Setting up the relay involves four stages:

1. **Build Squid from source** -- download, compile, and install the Squid proxy on the Cardano relay machine.
2. **Configure the Squid proxy** -- set up Squid as a forward proxy that accepts traffic from the block producer's internal IP, routes HTTPS requests to `mithril.network` hosts, anonymizes all headers, and denies everything else.
3. **Install the service** -- create a dedicated `squid` system user, set up a `systemd` service unit, and enable it to start on boot.
4. **Configure the firewall** -- allow incoming traffic on the relay's listening port (recommended: `3132`) from the block producer's internal IP only.

## Key configuration points

The Squid proxy configuration controls which traffic is allowed through the relay:

- **Listening port** -- port `3132` is recommended
- **Source restriction** -- only the internal IP of the block producer is allowed
- **Destination restriction** -- only HTTPS traffic to `.mithril.network` domain hosts is permitted
- **Anonymization** -- the proxy strips and anonymizes request headers to avoid disclosing information about the block producer
- **Caching** -- disabled, since the relay only forwards traffic

After configuring the relay, the Mithril signer on the block producer must be pointed to the relay by setting the `RELAY_ENDPOINT` environment variable (for example, `http://192.168.1.50:3132`).

:::note

For the complete step-by-step instructions, including build commands, configuration files, and service setup, see [Set up the Mithril relay node](https://mithril.network/doc/manual/operate/run-signer-node/#set-up-the-mithril-relay-node) in the Mithril documentation.

:::

## Resources

- [Become a Mithril SPO](https://mithril.network/doc/manual/operate/become-mithril-spo)
- [Run a Mithril signer node](https://mithril.network/doc/manual/operate/run-signer-node)
- [Mithril documentation](https://mithril.network/doc/)
- [GitHub repository](https://github.com/input-output-hk/mithril)
