---
id: register-stake-pool
title: Registering a Pool
sidebar_label: Registering a Pool
description: Generate your pool registration certificate and submit it to the chain.
---

:::info version reference
This document was written in May 2026 with reference to cardano-node and cardano-cli v11
:::

Pool registration requires:

1. A metadata JSON file hosted at a public HTTPS URL
2. A pool registration certificate (signed with cold keys on the air-gapped machine)
3. A delegation certificate (pledging your stake to your own pool)
4. A transaction submitting both certificates

This page assumes you have completed [Generating Wallet Keys](/docs/operators/block-producer/generating-wallet-keys), [Registering a Stake Address](/docs/operators/block-producer/register-stake-address), and [Key Generation](/docs/operators/block-producer/block-producer-keys). You will need your cold keys (`cold.vkey`, `cold.skey`), which live on your air-gapped machine.

## Create pool metadata

```bash
cat > poolMetaData.json << EOF
{
  "name": "Your Pool Name",
  "description": "Your pool description",
  "ticker": "TICK",
  "homepage": "https://yourpool.example.com"
}
EOF
```

- `ticker`: 3–9 characters, A–Z and 0–9 only
- `description`: 255 characters maximum
- `homepage`: your pool's website

Hash the file:

```bash
cardano-cli stake-pool metadata-hash \
    --pool-metadata-file poolMetaData.json \
    --out-file poolMetaDataHash.txt
```

Host `poolMetaData.json` at a public HTTPS URL with no redirects. The URL must be 64 characters or fewer. Verify the hosted file matches your local hash:

```bash
cardano-cli stake-pool metadata-hash \
    --pool-metadata-file <(curl -s -L https://YOUR_METADATA_URL)

cat poolMetaDataHash.txt
```

Both hashes must be identical. If they differ, re-upload the file (extra whitespace or encoding differences are common causes).

:::tip SPO identity — Calidus keys
After registering your pool, consider registering a [Calidus key](/docs/operators/operator-tools/calidus-keys). It lets explorers (Cardanoscan, Cexplorer, AdaStat), governance tools, and APIs verify your SPO identity with a hot key — without ever touching your cold key again.
:::

## Generate the pool registration certificate

Do this on your **air-gapped machine** where `cold.skey` lives.

Fetch current protocol parameters on an online node first:

```bash
cardano-cli query protocol-parameters --out-file protocol.json
minPoolCost=$(jq -r '.minPoolCost' protocol.json)
echo "Minimum pool cost: $minPoolCost lovelace"
```

Transfer `protocol.json`, `vrf.vkey`, `stake.vkey`, and `poolMetaDataHash.txt` to the air-gapped machine, then generate the certificate:

```bash
cardano-cli stake-pool registration-certificate \
    --cold-verification-key-file cold.vkey \
    --vrf-verification-key-file vrf.vkey \
    --pool-pledge 10000000000 \
    --pool-cost 340000000 \
    --pool-margin 0.01 \
    --pool-reward-account-verification-key-file stake.vkey \
    --pool-owner-stake-verification-key-file stake.vkey \
    --single-host-pool-relay relay1.yourpool.example.com \
    --pool-relay-port 3001 \
    --metadata-url https://YOUR_METADATA_URL \
    --metadata-hash $(cat poolMetaDataHash.txt) \
    --out-file pool.cert
```

| Parameter | Notes |
|-----------|-------|
| `--pool-pledge` | Amount in lovelace you commit to keep delegated. Higher pledge improves desirability. |
| `--pool-cost` | Fixed fee per epoch in lovelace taken before margin. Minimum is `minPoolCost` (currently 170 ADA on mainnet). |
| `--pool-margin` | Your variable fee as a fraction (e.g. `0.01` = 1%). |

### Relay address

You can register your relay(s) using either the customary single host method of DNS A or AAAA records, or as multi-host corresponding to a DNS SRV record (supported since cardano-node 10.6). You can't provide both.

#### Single host method

To register using a domain name via a DNS A or AAAA record, use `--single-host-pool-relay DNS_NAME` + `--pool-relay-port PORT` pair per relay. For IP-based relays use `--pool-relay-ipv4`.

:::note Multiple relays
Add one flag pair per relay:
```bash
    --single-host-pool-relay relay1.yourpool.example.com --pool-relay-port 3001 \
    --single-host-pool-relay relay2.yourpool.example.com --pool-relay-port 3001 \
```
:::

#### Multi host method (SRV record)

For added flexibility, you can provide your domain name whose DNS zone file contains SRV records per table below. To register using this method, use `--multi-host-pool-relay` option in the `cardano-cli` command above instead.

This method also provides a mechanism for exposing related decentralised protocols co-deployed with a Cardano node, such as Mithril or Hydra. You only need to specify the records for the services your pool provides.

| Service | Required SRV record |
| ---      | ---    |
| Cardano node | `_cardano._tcp` |
| DMQ node (Mithril protocol) | `_dmq._mithril._cardano_.tcp` |
| Mithril aggregator | `_aggregator._mithril._cardano._tcp` |

:::warning[Important]
The prefix from the second column is not part of the pool registration certificate and is not entered on the CLI. It should only be a part of your DNS record which is looked up when resolving your domain name.
:::

For eg, to specify access to your Cardano node relays, there should be a _cardano._tcp SRV entry in the DNS record for your registration domain `yourpool.example.com`. For details, see [CIP-0155](https://cips.cardano.org/cip/CIP-0155) and current SRV [registry](https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0155/registry.json).

:::note
`--pool-relay-port` is not used with this approach since your SRV record specifies which ports to use.
:::

## Generate the delegation certificate

Also on the **air-gapped machine**, create a delegation certificate that pledges your stake to your pool:

```bash
cardano-cli latest stake-address stake-delegation-certificate \
    --stake-verification-key-file stake.vkey \
    --cold-verification-key-file cold.vkey \
    --out-file deleg.cert
```

Transfer `pool.cert` and `deleg.cert` back to your online machine.

## Submit the certificates

Query the current slot:

```bash
currentSlot=$(cardano-cli query tip | jq -r '.slot')
```

Build the transaction:

```bash
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --invalid-hereafter $(( currentSlot + 1000 )) \
    --witness-override 3 \
    --out-file tx.raw
```

Sign with payment, cold, and stake keys. The cold signing key must be available — bring it from the air-gapped machine for this step only, or sign in two passes using `--signing-key-file` once per key on separate machines:

```bash
cardano-cli conway transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file cold.skey \
    --signing-key-file stake.skey \
    --out-file tx.signed
```

Submit:

```bash
cardano-cli conway transaction submit --tx-file tx.signed
```

## Verify registration

Get your pool ID:

```bash
cardano-cli stake-pool id \
    --cold-verification-key-file cold.vkey \
    --output-format hex \
    > stakepoolid.txt

cat stakepoolid.txt
```

Check it has appeared on-chain:

```bash
cardano-cli query stake-snapshot --stake-pool-id $(cat stakepoolid.txt)
```

A non-empty result means registration was successful. It may take one epoch boundary to appear in tools and explorers. You can also verify on a [block explorer](/docs/developers/curriculum/start-building/networks-and-test-ada).
