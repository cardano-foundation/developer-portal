---
id: get-started
title: Get started with Cardano CLI
sidebar_position: 1
sidebar_label: Get started with CLI
keywords: [cardano-cli, cli, keys, addresses, cardano-node]
---

## Setting up environment variables 

### CARDANO_NODE_SOCKET_PATH
Cardano CLI uses the _node-to-client_ protocol to communicate with the node, this requires setting up an environment variable for the node socket path. Make sure to use the path declared when starting the node.

```bash 
export CARDANO_NODE_SOCKET_PATH=~/node.socket
```

### CARDANO_NODE_NETWORK_ID

Each network has a unique identifier (--mainnet or --testnet-magic NATURAL), this is used by the node-to-client protocol to make sure we are talking to a node on the desired network. It is very useful to 
setup an environment variable for the network id, the alternative is to provide the flag `--testnet-magic <network-id>` on each command that interact with the node.    

- **Mainnet**
```bash 
export CARDANO_NODE_NETWORK_ID=mainnet 
```
- **Pre-production**
```bash
export CARDANO_NODE_NETWORK_ID=1
```
- **Preview**
```bash
export CARDANO_NODE_NETWORK_ID=2
```
- **Sanchonet** 
```bash
export CARDANO_NODE_NETWORK_ID=4
```

# Generate keys and addresses

:::info
For a complete view about types of addresses in Cardano, please read https://cips.cardano.org/cips/cip19/
:::

## Generating a payment key pair and an address

To generate a key pair, run:

```bash
cardano-cli address key-gen \
--verification-key-file payment.vkey \
--signing-key-file payment.skey
```

## Building an address

This address will not have staking rights. It cannot delegate or receive rewards because it does not have a
stake part associated to it. Only has a payment part (see https://cips.cardano.org/cips/cip19/)

```bash
cardano-cli address build \
--payment-verification-key-file payment.vkey \
--out-file paymentNoStake.addr
```

```bash
cat paymentNoStake.addr
addr_test1vzdtyyt48yrn2fa3wvh939rat0gyv6ly0ljt449sw8tppzq84xstz
```
:::info
Testnet addresses start with "addr_test" and mainnet addresses with "addr"
:::

## Generating a stake key pair 

```bash
cardano-cli stake-address key-gen \
--verification-key-file stake.vkey \
--signing-key-file stake.skey
```

## Build and address with payment and stake parts:

The resulting address will be associated to the **payment** and the **stake** credentials:

```bash
cardano-cli address build \
--payment-verification-key-file payment.vkey \
--stake-verification-key-file stake.vkey \
--out-file payment.addr
```

```bash
cat payment.addr
addr_test1qzdtyyt48yrn2fa3wvh939rat0gyv6ly0ljt449sw8tppzrcc3g0zu63cp6rnjumfcadft63x3w8ds4u28z6zlvra4fqy2sm8n
```

## Query the balance of an address 

```bash
cardano-cli query utxo --address $(cat paymentNoStake.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
262c7891f932cde390bcc04c25805f3f422c1a5687d5d47f6681e68bb384fe6d     0        10000000000 lovelace + TxOutDatumNone
```
:::tip
- You can get test tokens for **pre-production** and **preview** testnets via https://docs.cardano.org/cardano-testnet/tools/faucet/
- For Sanchonet tokens, go to https://sancho.network/faucet
:::


