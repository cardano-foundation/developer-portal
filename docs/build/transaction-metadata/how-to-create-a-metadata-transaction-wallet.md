---
id: how-to-create-a-metadata-transaction-wallet
title: How to create a metadata transaction using cardano-wallet
sidebar_label: cardano-wallet
description: How to create a metadata transaction using `cardano-wallet`
image: /img/og/og-developer-portal.png
---

:::note
This guide assumes that you have a basic understanding of `cardano-wallet` and `cardano-cli`, how to use it and that you have installed it into your system. Otherwise, we recommend reading [Installing cardano-node](docs/operate-a-stake-pool/node-operations/installing-cardano-node.md), [Running cardano-node](docs/operate-a-stake-pool/node-operations/running-cardano.md), [Get started with Cardano CLI](/docs/get-started/cardano-cli/basic-operations/get-started) and [Using cardano-wallet](/docs/get-started/cardano-wallet/using-cardano-wallet) guides first.

This guide also assumes that you have `cardano-node` and `cardano-wallet` running in the background and connected to one of the `testnet` networks.
:::

## Setup

To create a transaction metadata using the `cardano-wallet`, you must first create a wallet if you haven't already.

** Generate mnemonic seed **

```bash
cardano-wallet recovery-phrase generate
```

** Create Wallet with the generated mnemonic seed **

```bash
curl --request POST \
  --url http://localhost:1337/v2/wallets \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "test_cf_1",
    "mnemonic_sentence": ["shift", "badge", "heavy", "action", "tube", "divide", "course", "quality", "capable", "velvet", "cart", "marriage", "vague", "aware", "maximum", "exist", "crime", "file", "analyst", "great", "cabbage", "course", "sad", "apology"],
    "passphrase": "test123456"
}' | jq
```

Now that you have a wallet, we can now retrieve a **wallet address**:

```bash
curl --request GET \
  --url 'http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce/addresses?state=unused' | jq '.[0]["id"]'
```

Now that you have a **wallet address**, you can now request for some `tAda` funds from the [Cardano Testnet Faucet](https://developers.cardano.org/docs/integrate-cardano/testnet-faucet/).

Once you have some funds, we can now create the sample metadata that we want to store into the blockchain.

Now let's say that the `JSON` shape we decided on for our **To-Do List** application is the following:

```json
{
    "1337": {
        "name": "hello world",
        "completed": 0
    }
}
```

:::note

Based on our theoretical **To-Do List** application, this `JSON` shape could be a way to insert / update entries into our list. We choose an arbitrary number (`1337`) as the key, and we are basically saying that all metadata that will be inserted with that key is related to the **To-Do List** application data. Although we don't have control over what will be inserted with that metadata key since **Cardano** is an open platform.

:::

Now that we have our `JSON` data, we can create a transaction and embed the metadata into the transaction. Ultimately storing it into the **Cardano** blockchain forever.

## JSON Format

`cardano-wallet` has special requirements in terms of the `JSON` format of the payload that it accepts. Here are some examples: 

```json
{
    "0": {
        "string": "cardano"
    },
    "1": {
        "int": 14
    },
    "2": {
        "bytes": "2512a00e9653fe49a44a5886202e24d77eeb998f"
    },
    "3": {
        "list": [
            {
                "int": 14
            }
        ]
    },
    "4": {
        "map": [
            {
                "k": {
                    "string": "key"
                },
                "v": {
                    "string": "value"
                }
            }
        ]
    }
}
```

So we will have to convert our `JSON` metadata payload to the format the `cardano-wallet` accepts:

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

## Submit to blockchain

Once we have the accepted format, we can now finally submit the metadata to the blockchain.

First, let's retrieve another **unused wallet address** from our wallet: 

```bash
curl --request GET \
  --url 'http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce/addresses?state=unused' | jq '.[0]["id"]'
```

Now we will send `1,000,000 lovelace` to our own wallet while attaching the metadata in the transaction, ultimately storing it into the blockchain forever.

```bash
curl --request POST \
  --url http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce/transactions \
  --header 'Content-Type: application/json' \
  --data '{
    "passphrase": "test123456",
    "payments": [
        {
            "address": "addr_test1qpg2eglv9gf2rksvdj53t6ajfgzkycaadlt2fatjyn4etpze0592agqpwraqajx2dsu2sxj64uese5s4qum293wuc00q6hnhqq",
            "amount": {
                "quantity": 1000000,
                "unit": "lovelace"
            }
        }
    ],
    "metadata": {
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
}'
```

Congratulations, you are now able to submit **Cardano** transactions with metadata embedded into them. 🎉🎉🎉

Up next, we discuss how to retrieve metadata that we have stored in the **Cardano** blockchain. **@TODO**

