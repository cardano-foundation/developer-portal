---
id: block-producer-keys
title: Key Generation
sidebar_label: Key Generation
description: Generating the cold, KES, and VRF keys for a Cardano block producer on an air-gapped machine.
image: ../img/og-developer-portal.png
---

:::info version reference
This document was written in May 2026 with reference to cardano-node and cardano-cli v11
:::

A block producer requires three key pairs and an operational certificate:

| Key | Purpose | Where it lives |
|-----|---------|----------------|
| Cold key (`cold.skey` / `cold.vkey`) | Authorizes pool registration and KES rotation | Air-gapped machine only — never transferred |
| KES key (`kes.skey` / `kes.vkey`) | Signs blocks; rotated every ~90 days | Block producer |
| VRF key (`vrf.skey` / `vrf.vkey`) | Proves slot leadership | Block producer |
| Operational certificate (`node.cert`) | Binds KES key to cold key for the node | Block producer |

:::danger Cold key security
The cold signing key (`cold.skey`) must be generated and used exclusively on your air-gapped machine. It must never exist on any internet-connected computer. If your cold key is compromised, an attacker can re-register your pool to their reward address.
:::

For background on what these keys do, see [Cardano Key Pairs](/docs/operate-a-stake-pool/basics/cardano-key-pairs).

## Step 1 — Generate all keys on the air-gapped machine

Run all of the following on your **air-gapped machine**.

### Cold keys

```bash
cardano-cli node key-gen \
  --cold-verification-key-file cold.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter cold.counter
```

### KES keys

```bash
cardano-cli node key-gen-KES \
  --verification-key-file kes.vkey \
  --signing-key-file kes.skey
```

### VRF keys

```bash
cardano-cli node key-gen-VRF \
  --verification-key-file vrf.vkey \
  --signing-key-file vrf.skey
```

## Step 2 — Determine the current KES period

The operational certificate must be issued for the correct KES period. You need the current slot number from an online node to calculate it.

On your **online relay or another synced node**, run:

```bash
slotsPerKESPeriod=$(jq -r '.slotsPerKESPeriod' /etc/cardano/shelley-genesis.json)
currentSlot=$(cardano-cli query tip | jq -r '.slot')
kesPeriod=$(( currentSlot / slotsPerKESPeriod ))
echo "Current KES period: $kesPeriod"
```

Transfer this number to your air-gapped machine (write it down or copy it on a USB drive).

Next, follow [Deployment](/docs/operate-a-stake-pool/block-producer/deployment) to issue the op cert and securely copy credentials to the block producer.

## KES key rotation

KES keys expire after 90 days on mainnet (62 days on preprod). When they expire the node stops minting blocks. Set a calendar reminder well before expiry.

To rotate:

1. Generate new KES keys on the air-gapped machine (repeat Step 1 above for KES only)
2. Get the current KES period from an online node (Step 2 above)
3. Follow the [Deployment — op cert and transfer](/docs/operate-a-stake-pool/block-producer/deployment) steps to issue a new cert and copy it to the block producer
4. Send `SIGHUP` to reload credentials without a full restart: `pkill -HUP cardano-node`

:::caution Counter must be strictly increasing
The `cold.counter` file tracks how many op certs have been issued. Never copy an old counter back — an op cert with a lower counter than what the chain has seen will be rejected. The counter increments automatically each time you run `issue-op-cert`.
:::

For a more secure KES key deployment that keeps the signing key out of persistent storage entirely, see [KES Agent](/docs/operate-a-stake-pool/block-producer/kes-agent).
