---
id: kes-agent
title: KES Agent
sidebar_label: KES Agent
description: Run the KES agent to keep your KES signing key out of persistent storage and achieve forward secrecy on your block producer.
image: ../img/og-developer-portal.png
---

By default, `cardano-node` reads the KES signing key directly from disk. The KES agent is a separate process that holds the signing key in mlocked RAM instead — it never touches persistent storage. When the agent evolves the key at the start of each KES period, the previous evolution is deleted from memory. An attacker who later compromises the host cannot recover past signing keys.

Requires `cardano-node` 10.7.1 or later.

:::note System hardening
For the forward secrecy guarantee to hold, the signing key must not reach disk through other paths. Before running the KES agent, disable swap, hibernation, and core dumps on the block producer host. See the [KES agent guide](https://github.com/input-output-hk/kes-agent/blob/main/doc/guide.markdown) for full hardening recommendations.
:::

## Setup

Install `kes-agent` and `kes-agent-control` from the [kes-agent releases](https://github.com/input-output-hk/kes-agent/releases).

The agent needs `cold.vkey` on the block producer to validate op certs before activating new keys. Transfer it from the air-gapped machine — it is a public key and safe to copy to the block producer.

Start the agent — it exposes two Unix domain sockets, one for the node and one for management:

```bash
kes-agent run \
  --service-address       /run/kes-agent/service.socket \
  --control-address       /run/kes-agent/control.socket \
  --cold-verification-key /etc/cardano/cold.vkey \
  --genesis-file          /etc/cardano/shelley-genesis.json
```

For production, run it as a systemd service. A unit file template is available in the [kes-agent repository](https://github.com/input-output-hk/kes-agent/tree/main/systemd).

## Key generation workflow

**On the block producer**, ask the agent to generate a new KES key. Only the verification key is written to disk — the signing key stays in mlocked RAM:

```bash
kes-agent-control \
  --control-address /run/kes-agent/control.socket \
  gen-staged-key \
  --kes-verification-key-file kes.vkey
```

Transfer `kes.vkey` to the air-gapped machine, then follow [Deployment](/docs/operate-a-stake-pool/block-producer/deployment) to issue the op cert and transfer `node.cert` back to the block producer. The agent validates the cert against `cold.vkey` and activates the staged key.

## Node configuration

Replace `--shelley-kes-key` with `--shelley-kes-agent-socket` in your systemd unit:

```ini
ExecStart=/usr/local/bin/cardano-node run \
  --config        /etc/cardano/config.json \
  --topology      /etc/cardano/topology.json \
  --database-path /var/lib/cardano/db \
  --socket-path   /run/cardano/node.socket \
  --host-addr     0.0.0.0 \
  --port          6000 \
  --shelley-kes-agent-socket        /run/kes-agent/service.socket \
  --shelley-vrf-key                 /run/secrets/vrf.skey \
  --shelley-operational-certificate /run/secrets/node.cert
```

## KES rotation

1. Run `gen-staged-key` on the block producer to generate a new key in the agent
2. Transfer `kes.vkey` to the air-gapped machine
3. Follow [Deployment](/docs/operate-a-stake-pool/block-producer/deployment) to issue a new op cert and transfer `node.cert` back
4. The agent activates the new key automatically on receipt of the cert — no restart needed

The signing key never touches disk at any point in this process.

## Multi-agent setups

The KES agent supports backup agents and SSH socket forwarding for high-availability deployments where the agent runs on a separate host from the block producer. See the [KES agent guide](https://github.com/input-output-hk/kes-agent/blob/main/doc/guide.markdown) for linear, ring, and web topologies.
