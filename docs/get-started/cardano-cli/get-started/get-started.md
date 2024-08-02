---
id: get-started
title: Get started with Cardano CLI
sidebar_position: 1
sidebar_label: CLI - Get started
keywords: [cardano-cli, cli, keys, addresses, cardano-node]
---

## Setting up environment variables 

### CARDANO_NODE_SOCKET_PATH

Cardano CLI uses the *node-to-client* protocol to communicate with the node. This requires setting an environment variable for the node socket path. Ensure you use the path declared when starting the node.

```shell 
export CARDANO_NODE_SOCKET_PATH=~/node.socket
```

### CARDANO_NODE_NETWORK_ID

Each network has a unique identifier (--mainnet or --testnet-magic NATURAL). This is used by the node-to-client protocol to ensure communication with a node on the desired network. It is useful to set up an environment variable for the network ID. Alternatively, you can provide the flag `--testnet-magic <network-id>` with each command that interacts with the node.  

- **Mainnet**
```shell 
export CARDANO_NODE_NETWORK_ID=mainnet 
```
- **Pre-production testnet**
```shell
export CARDANO_NODE_NETWORK_ID=1
```
- **Preview testnet**
```shell
export CARDANO_NODE_NETWORK_ID=2
```
- **SanchoNet testnet** 
```shell
export CARDANO_NODE_NETWORK_ID=4
```

## Generating keys and addresses

:::info
For a complete overview of Cardano address types, read [CIP-19](https://cips.cardano.org/cips/cip19/).
:::

### Generate a payment key pair and an address

To generate a key pair, run:

```shell
cardano-cli address key-gen \
--verification-key-file payment.vkey \
--signing-key-file payment.skey
```

### Build an address

This address will not have staking rights. It cannot delegate or receive rewards because it does not have a stake part associated with it, only a payment part (see [CIP-19](https://cips.cardano.org/cips/cip19/)).

```shell
cardano-cli address build \
--payment-verification-key-file payment.vkey \
--out-file paymentNoStake.addr
```

```shell
cat paymentNoStake.addr
addr_test1vzdtyyt48yrn2fa3wvh939rat0gyv6ly0ljt449sw8tppzq84xstz
```
:::info
Testnet addresses start with 'addr_test' and mainnet addresses with 'addr'.
:::

### Generate a stake key pair 

```shell
cardano-cli stake-address key-gen \
--verification-key-file stake.vkey \
--signing-key-file stake.skey
```

### Build the address with payment and stake parts

The resulting address will be associated with the **payment** and **stake** credentials:

```shell
cardano-cli address build \
--payment-verification-key-file payment.vkey \
--stake-verification-key-file stake.vkey \
--out-file payment.addr
```

```shell
cat payment.addr
addr_test1qzdtyyt48yrn2fa3wvh939rat0gyv6ly0ljt449sw8tppzrcc3g0zu63cp6rnjumfcadft63x3w8ds4u28z6zlvra4fqy2sm8n
```

### Query the balance of an address 

```shell
cardano-cli query utxo --address $(< paymentNoStake.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
262c7891f932cde390bcc04c25805f3f422c1a5687d5d47f6681e68bb384fe6d     0        10000000000 lovelace + TxOutDatumNone
```
:::tip
- You can get test tokens for **pre-production** and **preview** testnets [using this faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)
- For SanchoNet tokens, go to the [SanchoNet faucet](https://sancho.network/faucet).
:::


