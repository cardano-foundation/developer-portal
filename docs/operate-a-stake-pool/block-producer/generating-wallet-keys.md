---
id: generating-wallet-keys
title: Generating Wallet Keys
sidebar_label: Generating Wallet Keys
description: Generate the payment and stake keys needed to register a Cardano stake pool.
image: ../img/og-developer-portal.png
---

:::info version reference
This document was written in May 2026 with reference to cardano-node and cardano-cli v11
:::

A stake pool registration requires a funded wallet address. The address is a combination of a payment key (pays fees and deposits) and a stake key (receives rewards and anchors the pool registration).

:::warning Mainnet key management
These pages show the raw `cardano-cli` approach, which is appropriate for testnet. For mainnet, never generate payment or stake keys on an internet-connected machine. Production options:

- **[cardano-addresses](https://github.com/IntersectMBO/cardano-addresses) with a GPG-encrypted mnemonic on an air-gapped machine** — most secure; fully offline, hardware-independent, recoverable from mnemonic
- **Hardware wallet** (Ledger or Trezor via [cardano-hw-cli](https://github.com/vacuumlabs/cardano-hw-cli)) — keys never leave the device; convenient for signing transactions
:::

Make sure `CARDANO_NODE_SOCKET_PATH` and `CARDANO_NODE_NETWORK_ID` are set before running any `cardano-cli` commands. See [Running cardano-node](/docs/get-started/infrastructure/node/running-cardano#querying-the-node).

## Generate payment keys

```bash
mkdir -p $HOME/pool-keys
cd $HOME/pool-keys

cardano-cli address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey
```

## Generate stake keys

```bash
cardano-cli stake-address key-gen \
    --verification-key-file stake.vkey \
    --signing-key-file stake.skey
```

Build the stake address:

```bash
cardano-cli stake-address build \
    --stake-verification-key-file stake.vkey \
    --out-file stake.addr
```

## Build the payment address

The payment address combines your payment key with your stake key so that ADA sent to it accrues rewards to your stake address:

```bash
cardano-cli address build \
    --payment-verification-key-file payment.vkey \
    --stake-verification-key-file stake.vkey \
    --out-file payment.addr
```

## Fund the address

Query the balance:

```bash
cardano-cli query utxo --address $(cat payment.addr)
```

On testnet, use the [Cardano faucet](https://docs.cardano.org/cardano-testnet/tools/faucet) to get test ADA. Select the Pre-Production testnet and paste your `payment.addr`.

Once funded, the balance query should show something like:

```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
531f4bec36af503654c3c6fa34ecf07e5c29f67da8e2b84c8923b8c735b011c9     0        10000000000 lovelace
```

Next: [Register your stake address](/docs/operate-a-stake-pool/block-producer/register-stake-address).
