---
id: simple-transactions
title: Simple transactions
sidebar_position: 2
description: how to create simple transactions with build and build-raw commands.
keywords: [cardano-cli, cli, keys, addresses, cardano-node, transactions]
---

:::tip
To integrate the Conway era, which differs significantly from previous eras, `cardano-cli` has introduced `<era>` as a top-level command, replacing the former `<era>` flags. For example, instead of using era-specific flags like `--babbage-era` with commands such as `cardano-cli transaction build --babbage-era`, users now use `cardano-cli babbage transaction build`. 
:::

## Simple transactions

Cardano transactions involve consuming one or more Unspent Transaction Outputs (UTXOs) and generating one or more new UTXOs. The most basic transaction type involves transferring ada from one address to another. It is essential to ensure that all transactions are 'well-balanced', meaning that the sum of outputs and transaction fees equals the sum of inputs. This balance ensures the integrity and validity of the transaction. Unbalanced transactions are rejected by the local node.

Creating a transaction using the CLI follows a three-step process:

- **Build:** construct the transaction with relevant details
- **Sign:** authenticate the transaction with appropriate signatures
- **Submit:** send the signed transaction to the network for processing.

You'll find commands for these tasks under `cardano-cli babbage transaction`

```bash
cardano-cli babbage transaction
Usage: cardano-cli babbage transaction
                                         ( build-raw
                                         | build
                                         | sign
                                         | witness
                                         | assemble
                                         | submit
                                         | policyid
                                         | calculate-min-fee
                                         | calculate-min-required-utxo
                                         | hash-script-data
                                         | txid
                                         | view
                                         )
```                                         

`cardano-cli` provides several options for constructing transactions: `transaction build-raw`, `transaction build`, and `build-estimate`. The key difference between these methods lies in their offline and online capabilities, as well as the degree of manual or automatic processing involved.

- The `build-raw` command enables offline transaction building, eliminating the need for a connection to a running node. However, this method requires manual calculation of fees and balancing the transaction.
- The `build` command automatically calculates fees and balances the transaction, but it necessitates a connection to a running node
- The `build-estimate` command is a command that is useful for estimating the size and fee of a transaction when the CLI is not connected to the node. This command automatically balances a transaction related to the script one would like to execute.

When building a transaction, it's essential to specify the following elements:

- **Inputs:** one or multiple Unspent Transaction Outputs (UTXOs) being utilized
- **Outputs:** the addresses where the funds will be sent, including the amount in lovelace for each recipient and any change that needs to be returned to yourself
- **Transaction fee:** the fee paid for the transaction to be processed on the chain.

## Building transactions with the `build-raw` command

To create a transaction using `build-raw`, you will need the protocol parameters.  These parameters are necessary for calculating the transaction fee at a later stage. Querying the protocol parameters requires a running node:

```bash
cardano-cli babbage query protocol-parameters --out-file pparams.json
```

You also need to know the inputs (UTXOs) you will use. A UTXO is identified by its **transaction hash** (`TxHash`) and **transaction index** (`TxIx`) with the syntax `TxHash#TxIx`. You can only use UTXOs controlled by your `payment.skey`.

To query the UTXOs associated to your `payment.addr`, run:

```bash
cardano-cli babbage query utxo --address $(< payment.addr)

                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891     0        9994790937 lovelace + TxOutDatumNone
```

In this example, the address has one UTXO associated with it. It holds 9,994,790,937 lovelace (9,994.790937 ada). 

Assume you want to send 1,000,000 lovelace (1,000 ada) from `payment.addr` to a `payment2.addr`. This transaction will have one input and two outputs: 

- The single input is the UTXO that the transaction will consume, in this case `e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0`
- The first output corresponds to the 1000 ada we are sending to `payment2.addr` 
- The second output corresponds to the change of the transaction. We are sending the difference (8994790937 lovelace) to `payment.addr`.   

At this stage, you do not need to worry about the transaction fees. Save the transaction body in the `tx.draft` file:

```shell
cardano-cli babbage transaction build-raw \
  --tx-in e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0 \
  --tx-out addr_test1vzuztsedkqanfm7elu9nshfr4gh2gl0aj4djmayav2t7x8ch3pg30+1000000000 \
  --tx-out addr_test1qp39w0fa0ccdc4gmg87puydf2kxt5mgt0vteq4a22ktrcssg7ysmx64l90xa0k4z25wpuejngya833qeu9cdxvveynfscsskf5+8994790937 \
  --fee 0 \
  --protocol-params-file pparams.json \
  --out-file tx.draft
```

`cardano-cli` can handle the nesting of commands. For example, you can use `cat` within `cardano-cli` to read the addresses directly from the file.


```shell
cardano-cli babbage transaction build-raw \
  --tx-in e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0 \
  --tx-out "$(< payment2.addr)+1000000000" \
  --tx-out "$(< payment.addr)+8994790937" \
  --fee 0 \
  --protocol-params-file pparams.json \
  --out-file tx.draft
```

Let's explore the created `tx.draft` file. It is a text envelope. The 'type' field says that it is an **Unwitnessed Babbage era transaction**. 'Unwitnessed' means that it has not been signed yet. The "cborHex" field encodes all transaction details:

```shell
cat tx.draft
{
    "type": "Unwitnessed Tx BabbageEra",
    "description": "Ledger Cddl Format",
    "cborHex": "84a30081825820e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab812559403889100018282581d60b825c32db03b34efd9ff0b385d23aa2ea47dfd955b2df49d6297e31f1a3b9aca008258390062573d3d7e30dc551b41fc1e11a9558cba6d0b7b179057aa55963c4208f121b36abf2bcdd7daa2551c1e6653413a78c419e170d3319924d31b0000000218219e190200a0f5f6"
}
```
Use the `transaction view` command to show the transaction body in a human-readable format:

```shell
cardano-cli babbage transaction view --tx-body-file tx.draft
```

```json
{
    "auxiliary scripts": null,
    "certificates": null,
    "collateral inputs": [],
    "era": "Babbage",
    "fee": "0 Lovelace",
    "inputs": [
        "e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1vzuztsedkqanfm7elu9nshfr4gh2gl0aj4djmayav2t7x8ch3pg30",
            "address era": "Shelley",
            "amount": {
                "lovelace": 1000000000
            },
            "network": "Testnet",
            "payment credential key hash": "b825c32db03b34efd9ff0b385d23aa2ea47dfd955b2df49d6297e31f",
            "reference script": null,
            "stake reference": null
        },
        {
            "address": "addr_test1qp39w0fa0ccdc4gmg87puydf2kxt5mgt0vteq4a22ktrcssg7ysmx64l90xa0k4z25wpuejngya833qeu9cdxvveynfscsskf5",
            "address era": "Shelley",
            "amount": {
                "lovelace": 8994790937
            },
            "network": "Testnet",
            "payment credential key hash": "62573d3d7e30dc551b41fc1e11a9558cba6d0b7b179057aa55963c42",
            "reference script": null,
            "stake reference": {
                "stake credential key hash": "08f121b36abf2bcdd7daa2551c1e6653413a78c419e170d3319924d3"
            }
        }
    ],
    "reference inputs": [],
    "required signers (payment key hashes needed for scripts)": null,
    "return collateral": null,
    "total collateral": null,
    "update proposal": null,
    "validity range": {
        "lower bound": null,
        "upper bound": null
    },
    "withdrawals": null,
    "witnesses": []
}
```

### Calculating transaction fees and balancing a transaction

:::info
In Cardano, transaction fees are [deterministic](https://iohk.io/en/blog/posts/2021/09/06/no-surprises-transaction-validation-on-cardano/), meaning that you can know in advance how much a transaction will cost. 
:::

To process a transaction on the network, it must include fees specified within the transaction body. To calculate the exact cost, use the `transaction calculate-min-fee` command, which takes `tx.draft` and `pparams.json` files as inputs. Within this command, specify details like the total number of inputs, outputs, and the required number of signatures. In this case, only one witness, the `payment.skey` signature, is needed:

```shell
cardano-cli babbage transaction calculate-min-fee \
  --tx-body-file tx.draft \
  --protocol-params-file pparams.json \
  --witness-count 1 
```

Running the command returns the fee that needs to be paid:

```shell
173993 Lovelace
```

With this, recalculate the change that needs to go to `payment.addr` with a simple operation: `Change = originalBalance - amountSent - Fee`:

```shell
echo $((9994790937 - 1000000000 - 173993))
8994616944
```
Re-run `transaction build-raw`, include the fee, and adjust the change (the second tx-out). This completes the transaction body, and conventionally, it is saved into the `tx.raw` file. 

```shell
cardano-cli babbage transaction build-raw \
  --tx-in e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0 \
  --tx-out $(< payment2.addr)+1000000000 \
  --tx-out $(< payment.addr)+8994616944 \ 
  --fee 173993 \
  --protocol-params-file pparams.json \
  --out-file tx.raw
```

### Signing the transaction

Sign the transaction with the `transaction sign` command. You must sign with the `payment.skey` that controls the UTXO you are trying to spend. This time, we produce the `tx.signed` file: 

```shell
cardano-cli babbage transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--testnet-magic 2 \
--out-file tx.signed
```

Inspecting `tx.signed` with `transaction view` reveals that the `"witnesses"` field is no longer empty; it now contains the signature. 

```shell
cardano-cli babbage transaction view --tx-file tx.signed
```
```json
{
    "auxiliary scripts": null,
    "certificates": null,
    "collateral inputs": [],
    "era": "Babbage",
    "fee": "173993 Lovelace",
    "inputs": [
        "e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1vzuztsedkqanfm7elu9nshfr4gh2gl0aj4djmayav2t7x8ch3pg30",
            "address era": "Shelley",
            "amount": {
                "lovelace": 1000000000
            },
            "network": "Testnet",
            "payment credential key hash": "b825c32db03b34efd9ff0b385d23aa2ea47dfd955b2df49d6297e31f",
            "reference script": null,
            "stake reference": null
        },
        {
            "address": "addr_test1qp39w0fa0ccdc4gmg87puydf2kxt5mgt0vteq4a22ktrcssg7ysmx64l90xa0k4z25wpuejngya833qeu9cdxvveynfscsskf5",
            "address era": "Shelley",
            "amount": {
                "lovelace": 8994616944
            },
            "network": "Testnet",
            "payment credential key hash": "62573d3d7e30dc551b41fc1e11a9558cba6d0b7b179057aa55963c42",
            "reference script": null,
            "stake reference": {
                "stake credential key hash": "08f121b36abf2bcdd7daa2551c1e6653413a78c419e170d3319924d3"
            }
        }
    ],
    "reference inputs": [],
    "required signers (payment key hashes needed for scripts)": null,
    "return collateral": null,
    "total collateral": null,
    "update proposal": null,
    "validity range": {
        "lower bound": null,
        "upper bound": null
    },
    "withdrawals": null,
    "witnesses": [
        {
            "key": "VKey (VerKeyEd25519DSIGN \"8e090717d4c91437d3b8c467acc850197485913efdbfb48114a4d6cf0ca2dc02\")",
            "signature": "SignedDSIGN (SigEd25519DSIGN \"897d4774e3da7a9ff92cbfb36ba03443bad0473a449cd65a4855e4e167e6800267d6b38ba836cab05420c3c5a781855ea92e0266be511e96217dd91050abcb06\")"
        }
    ]
}
```
### Submitting the transaction

Submitting the transaction means sending it to the blockchain for processing by the stake pools and eventual inclusion in a block. While building and signing a transaction can be done without a running node, submitting the transaction requires an active connection to a running node. Use the `tx.signed` file:

```shell
cardano-cli babbage transaction submit \
  --tx-file tx.signed 
Transaction successfully submitted.
```

## Building transactions with the `build` command

Using the `build` command for transaction construction simplifies the process significantly. However, it requires an active connection to the node to obtain the protocol parameters in real time. These parameters are then used to automatically calculate the fee to be paid. Additionally, the `build` command offers the `--change-address` flag, which automatically balances the transaction by sending the change to the specified address.

For example, let's send 500 ada (500000000 lovelace) to the `payment2.addr`.

First, query the UTXOs of the input address:

```shell
cardano-cli query utxo --address $(< payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
c57f25ebf9cf1487b13deeb8449215c499f3d61c2836d84ab92a73b0bbaadd38     1        8994616944 lovelace + TxOutDatumNone
```

Build the transaction:

```shell
cardano-cli babbage transaction build \
  --tx-in c57f25ebf9cf1487b13deeb8449215c499f3d61c2836d84ab92a73b0bbaadd38#1 \
  --tx-out $(< payment2.addr)+500000000 \
  --change-address $(< payment.addr) \
  --out-file tx.raw
```
Running this command returns the cost of the transaction fee:

```shell
Estimated transaction fee: Lovelace 167041
```

Inspecting `tx.raw` with `transaction view` reveals that the transaction body already includes the fee, and the transaction is already balanced.

```shell
cardano-cli babbage transaction view --tx-file tx.raw
```

```json
{
    "auxiliary scripts": null,
    "certificates": null,
    "collateral inputs": [],
    "era": "Babbage",
    "fee": "167041 Lovelace",
    "inputs": [
        "c57f25ebf9cf1487b13deeb8449215c499f3d61c2836d84ab92a73b0bbaadd38#1"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1vzuztsedkqanfm7elu9nshfr4gh2gl0aj4djmayav2t7x8ch3pg30",
            "address era": "Shelley",
            "amount": {
                "lovelace": 500000000
            },
            "network": "Testnet",
            "payment credential key hash": "b825c32db03b34efd9ff0b385d23aa2ea47dfd955b2df49d6297e31f",
            "reference script": null,
            "stake reference": null
        },
        {
            "address": "addr_test1qp39w0fa0ccdc4gmg87puydf2kxt5mgt0vteq4a22ktrcssg7ysmx64l90xa0k4z25wpuejngya833qeu9cdxvveynfscsskf5",
            "address era": "Shelley",
            "amount": {
                "lovelace": 8494449903
            },
            "network": "Testnet",
            "payment credential key hash": "62573d3d7e30dc551b41fc1e11a9558cba6d0b7b179057aa55963c42",
            "reference script": null,
            "stake reference": {
                "stake credential key hash": "08f121b36abf2bcdd7daa2551c1e6653413a78c419e170d3319924d3"
            }
        }
    ],
    "reference inputs": [],
    "required signers (payment key hashes needed for scripts)": null,
    "return collateral": null,
    "total collateral": null,
    "update proposal": null,
    "validity range": {
        "lower bound": null,
        "upper bound": null
    },
    "withdrawals": null,
    "witnesses": []
}
```

### Signing the transaction

As previously, sign the transaction with the `payment.skey`:

```shell
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed
```
### Submitting the transaction

```shell
cardano-cli transaction submit \
  --tx-file tx.signed 
Transaction successfully submitted.
```

:::info
You can parse `cardano-cli` JSON outputs with `jq` to create programmatic workflows. For example, you can parse the output of `query utxo` to obtain the first UTXO associated with the payment address and use it as input (`--tx-in`) in `transaction build`:

```
cardano-cli babbage transaction build \
--tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
--tx-out $(< payment.addr)+500000000 \
--change-address $(< payment.addr) \
--out-file tx.raw
```
:::
