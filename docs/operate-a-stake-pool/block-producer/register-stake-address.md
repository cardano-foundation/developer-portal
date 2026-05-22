---
id: register-stake-address
title: Registering a Stake Address
sidebar_label: Registering a Stake Address
description: Register your stake address on-chain before registering a stake pool.
image: ../img/og-developer-portal.png
---

:::info version reference
This document was written in May 2026 with reference to cardano-node and cardano-cli v11
:::

Before registering a pool, the stake address must be registered on-chain. This costs a deposit (currently 2 ADA on mainnet, returned when you deregister) plus transaction fees.

This page assumes you have completed [Generating Wallet Keys](/docs/operate-a-stake-pool/block-producer/generating-wallet-keys) and that `CARDANO_NODE_SOCKET_PATH` and `CARDANO_NODE_NETWORK_ID` are set.

## Create the registration certificate

```bash
cardano-cli stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --out-file stake.cert
```

## Build, sign, and submit the transaction

Query the current slot (used for `--invalid-hereafter`):

```bash
currentSlot=$(cardano-cli query tip | jq -r '.slot')
```

Build the transaction — `transaction build` calculates fees and change automatically:

```bash
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file stake.cert \
    --invalid-hereafter $(( currentSlot + 1000 )) \
    --witness-override 2 \
    --out-file tx.raw
```

:::note
`--witness-override 2` tells the fee estimator that two keys will sign (payment + stake). If you have more signers, adjust accordingly.
:::

Sign with both the payment and stake signing keys:

```bash
cardano-cli conway transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file stake.skey \
    --out-file tx.signed
```

Submit:

```bash
cardano-cli conway transaction submit --tx-file tx.signed
```

Next: [Register your pool](/docs/operate-a-stake-pool/block-producer/register-stake-pool).
