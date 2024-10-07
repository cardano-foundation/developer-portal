---
id: retrieving-metadata
title: Retrieving your metadata
sidebar_label: Retrieving your metadata
description: We will discuss the many ways to retrieve your metadata from the Cardano blockchain.
image: /img/og/og-developer-portal.png
---

## Overview

There are many ways to retrieve metadata stored in the **Cardano** blockchain. This article discusses the different components and ways that can help us retrieve all kinds of blockchain data.

## Blockfrost

[Blockfrost](/docs/get-started/blockfrost/get-started) provides an **API** to access the **Cardano** blockchain fast and easily. 

To retrieve metadata using **Blockfrost**, we call a specific endpoint for **transaction metadata** that they provide.

** Query 1337 Metadata **

```bash
curl -H 'project_id: <api_key>' https://cardano-mainnet.blockfrost.io/api/v0/metadata/txs/labels/1337 | jq
```

You should see something like this:

```json
[
  {
    "tx_hash": "a54d000ad56cf5b4afe769b5d74b51a5817dc44102c7f8286887e28bf257a2fd",
    "json_metadata": "gimbalabs-poc"
  },
  {
    "tx_hash": "b26cc2323d6212a0396fa4ddb35578648853ef769e2e427d92019d50163f636a",
    "json_metadata": "go build"
  }
]
```

In this example, we query the **Cardano Mainnet** for any metadata under the key `1337`. We see a few of the many metadata that is already inserted into the **Cardano** blockchain under that key. It is now up to your implementation how you want to cache and sort through all the data that lives on-chain. **Blockfrost** provides `paging` and `ordering` parameters.

Please visit their official [documentation](https://docs.blockfrost.io) to know more.

## cardano-db-sync

@TODO

## cardano-graphql

@TODO

## cardano-wallet

:::note

This Section assumes that you have basic understanding of `cardano-wallet`, how to use it and that you have installed it into your system. Otherwise we recommend reading [Installing cardano-node](docs/get-started/cardano-node/installing-cardano-node.md), [Running cardano-node](/docs/get-started/cardano-node/running-cardano.md) and [Exploring Cardano Wallets](/docs/integrate-cardano/creating-wallet-faucet) guides first.

This guide also assumes that you have `cardano-node` and `cardano-wallet` running in the background and connected to one of the `testnet` networks.

:::

To retrieve all the Metadata for the transactions of a selected Wallet you just need to query the wallet transactions, passing as filter '.[].metadata'

```bash
curl --url 'http://localhost:1337/v2/wallets/41263958f6668e06190be661900f7129be78d583/transactions' | jq '.[].metadata'
```

***It is important to note that the `41263958f6668e06190be661900f7129be78d583` string is actually the `wallet.id` of a previously generated wallet.***

The `JSON` returning all Wallet Transactions Metadata will have some format like below (**considering the Metadata created for these transactions has these values**):

```json
{
  "1337": {
    "map": [
      {
        "k": {
          "string": "name"
        },
        "v": {
          "string": "hello world"
        }
      },
      {
        "k": {
          "string": "completed"
        },
        "v": {
          "int": 0
        }
      }
    ]
  }
}
```

A similar command may be used to retrieve the Metadata of a single transaction.


```bash
curl --url 'http://localhost:1338/v2/wallets/41263958f6668e06190be661900f7129be78d583/transactions/fab2e2a42b465d0f86452521521a2853597a58d31c5b29663b7e615cd2b2eb47' | jq '.metadata'
```

`41263958f6668e06190be661900f7129be78d583` string is actually the `wallet.id` of a previously generated wallet.

`fab2e2a42b465d0f86452521521a2853597a58d31c5b29663b7e615cd2b2eb47` string is the `transaction.id`.

The `JSON` returning the single Transaction Metadata will have some format like below (**considering the Metadata created for these transactions has these values**):

```json
{
  "1337": {
    "map": [
      {
        "k": {
          "string": "name"
        },
        "v": {
          "string": "hello world"
        }
      },
      {
        "k": {
          "string": "completed"
        },
        "v": {
          "int": 0
        }
      }
    ]
  }
}
```

## Ogmios

@TODO
