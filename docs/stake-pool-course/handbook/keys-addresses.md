---
id: keys-addresses
title: Creating keys and addresses
sidebar_label: Creating keys and addresses
description: "Stake pool course: Creating keys and addresses."
image: ../img/og-developer-portal.png
---

In the Shelley era of Cardano, every stakeholder can have two sets of keys and addresses:

* Payment Keys and addresses: To send and receive transactions
* Stake Keys and addresses: To control protocol participation, create a stake pool, delegate and receive rewards.

:::note
`--mainnet` identifies the Cardano mainnet, for testnets use `--testnet-magic 1097911063` instead.
:::

## Payment key pair

To generate a _payment key pair_:

```sh
cardano-cli address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey
```
This creates two files `payment.vkey` (the _public verification key_) and `payment.skey` (the _private signing key_).

## Stake key pair
To generate a _stake key pair_ :

```sh
cardano-cli stake-address key-gen \
    --verification-key-file stake.vkey \
    --signing-key-file stake.skey
```
## Payment address
Both verification keys (`payment.vkey` and `stake.vkey`) are used to build the address and the resulting `payment address` is associated with these keys.

```sh
cardano-cli address build \
    --payment-verification-key-file payment.vkey \
    --stake-verification-key-file stake.vkey \
    --out-file payment.addr \
    --mainnet
```

## Stake address

To generate a `stake address`:

```sh
cardano-cli stake-address build \
    --stake-verification-key-file stake.vkey \
    --out-file stake.addr \
    --mainnet
```
This address __CAN'T__ receive payments but will receive the rewards from participating in the protocol.


## Query the balance of an address

:::note
Ensure that your node has synced to the current block height which can be checked at [explorer.cardano.org](https://explorer.cardano.org). If it is not, you may see an error referring to the Byron Era.
:::

To query the balance of an address we need a running node and the environment variable `CARDANO_NODE_SOCKET_PATH` set to the path of the node.socket:

```sh
cardano-cli query utxo \
    --address $(cat payment.addr) \
    --mainnet
```
