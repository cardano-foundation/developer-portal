---
id: simple-transactions
title: Simple transactions
sidebar_position: 2
description: how to create simple transactions with build and build-raw commands.
keywords: [cardano-cli, cli, keys, addresses, cardano-node, transactions]
---

:::tip
In order to accommodate the integration of the Conway era, which significantly differs from all previous eras, cardano-cli has introduced `<era>` as a top-level command, replacing the previous `<era>` flags. For instance, instead of using era-specific flags like `--babbage-era` with commands such as `cardano-cli transaction build --babbage-era`, users must now utilize the syntax `cardano-cli babbage transaction build`. 
:::

# Simple transactions

Transactions in Cardano involve consuming one or multiple Unspent Transaction Outputs (UTxOs) and generating one or multiple new UTxOs. The most basic transaction type entails transferring ada from one address to another. It's essential to ensure that all transactions are "well-balanced," meaning that the sum of Outputs and Transaction Fees equals the sum of Inputs. This balance ensures the integrity and validity of the transaction. Unbalanced transactions are rejected by the local node. 

Creating a transaction using the CLI follows a three-step process:

- **Build:** Construct the transaction with relevant details.
- **Sign:** Authenticate the transaction with appropriate signatures.
- **Submit:** Send the signed transaction to the network for processing.

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
`cardano-cli` provides two options for constructing transactions: `transaction build-raw` and `transaction build` commands. The key difference between these methods lies in their offline and online capabilities, as well as the degree of manual or automatic processing involved.

- `build-raw` enables offline transaction building, eliminating the need for connection to a running node. However, this method requires manual calculation of fees and balancing the transaction.
- `build` command automatically calculates fees and balances the transaction, but it necessitates an established connection to a running node.

When building a transaction, it's essential to specify the following elements:

- **Inputs:** These are one or multiple Unspent Transaction Outputs (UTxOs) being utilized.
- **Outputs:** This denotes the addresses where the funds will be sent. It includes specifying the amount in lovelace for each recipient, including any change that needs to be returned to ourselves.
- **Transaction Fee:** This is the fee the transaction will pay to be processed on chain.

## Building transactions with `build-raw` command

To create a transaction using `build-raw`, you will need the protocol parameters.  These parameters are necessary for calculating the transaction fee at a later stage. Querying the protocol parameters requires a running node:

```bash
cardano-cli babbage query protocol-parameters --out-file pparams.json
```

You also need to know the Inputs (UTxOs) you will use, a UTxO is identified by  **transaction hash** `TxHash` and **transaction index** `TxIx` with the syntax `TxHash#TxIx`. Obviously, you can only use UTxOs controlled by your `payment.skey`. 

To query the UTxOs associated to your `payment.addr`, run:

```bash
cardano-cli babbage query utxo --address $(cat payment.addr)

                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891     0        9994790937 lovelace + TxOutDatumNone
```

In this example, the address has one UTxO associated to it. It holds 9,994,790,937 lovelace (9,994.790937 ada). 

Assume you want to send 1,000,000 lovelace (1,000 ada) from `payment.addr` to a `payment2.addr`.  This transaction will have 1 input and 2 outputs: 

- The single input is the UTxO that the transaction will consume, in this case `e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0`; 
- The first output corresponds to the 1000 ada we are sending to `payment2.addr` 
- The second output corresponds to the change of the transaction. We are sending the difference (8994790937 lovelace) to `payment.addr`   

At this stage you do not need to worry about the transaction fees. Save the transaction body in the `tx.draft` file:

```shell
cardano-cli babbage transaction build-raw \
  --tx-in e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0 \
  --tx-out addr_test1vzuztsedkqanfm7elu9nshfr4gh2gl0aj4djmayav2t7x8ch3pg30+1000000000 \
  --tx-out addr_test1qp39w0fa0ccdc4gmg87puydf2kxt5mgt0vteq4a22ktrcssg7ysmx64l90xa0k4z25wpuejngya833qeu9cdxvveynfscsskf5+8994790937 \
  --fee 0 \
  --protocol-params-file pparams.json \
  --out-file tx.draft
```

`cardano-cli` can handle nesting of commands, for example we can use `cat` within cardano-cli to read the addresses directly from the file.


```shell
cardano-cli babbage transaction build-raw \
  --tx-in e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0 \
  --tx-out "$(cat payment2.addr)+1000000000" \
  --tx-out "$(cat payment.addr)+8994790937" \
  --fee 0 \
  --protocol-params-file pparams.json \
  --out-file tx.draft
```

Let's explore the `tx.draft` file created. It is a text envelope, the "type" field says that it is an **Unwitnessed Babbage era transaction**. Unwitnessed means that it has not been signed yet. The "cborHex" field encodes all the details of transaction:

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
### Calculating transaction fees and balancing the transaction
:::info
In Cardano, transaction fees are deterministic, meaning that you can know in advance how much a transaction will cost. 
:::

In order for a transaction to be processed by the network, it must include fees. These fees need to be specified within the transaction body. To determine the exact cost of the transaction, we utilize the `transaction calculate-min-fee` command. This command requires the `tx.draft` and `pparams.json` files as inputs. Within this command, you will need to specify the details of the transaction, such as the total number of inputs, the number of outputs, and the required number of signatures for the transaction. In this particular scenario, only one witness is necessary, the signature of `payment.skey`

```shell
cardano-cli babbage transaction calculate-min-fee \
  --tx-body-file tx.draft \
  --protocol-params-file pparams.json \
  --tx-in-count 1 \
  --tx-out-count 2 \
  --witness-count 1 
```

Running the command returns the fee that needs to be paid:

```shell
173993 Lovelace
```

With that, you can now recalculate the change that needs to go to `payment.addr`, do that with a simple operation: `Change = originalBalance - amountSent - Fee`

```shell
echo $((9994790937 - 1000000000 - 173993))
8994616944
```
Re-run `transaction build-raw`, include the fee and adjust the change (the second tx-out). This transaction body will be now complete, and by convention it is saved into `tx.raw` file: 

```shell
cardano-cli babbage transaction build-raw \
  --tx-in e29e96a012c2443d59f2e53c156503a857c2f27c069ae003dab8125594038891#0 \
  --tx-out $(cat payment2.addr)+1000000000 \
  --tx-out $(cat payment.addr)+8994616944 \ 
  --fee 173993 \
  --protocol-params-file pparams.json \
  --out-file tx.raw
```

### Signing the transaction

Sign the transaction with the `transaction sign` command. You must sign with the `payment.skey` that controls the UTxO you are trying to spend. This time we produce the `tx.signed` file: 

```shell
cardano-cli babbage transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--testnet-magic 2 \
--out-file tx.signed
```

Inspecting `tx.signed` with `transaction view`  shows that the `"witnesses"` field is no longer empty, now it carries the signature.  

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

Submitting the transaction means sending it to the blockchain for processing by the stake pools and eventual inclusion in a block. While building and signing a transaction can be done without a running node, submitting the transaction requires an active connection to a running node. We use the `tx.signed` file:

```shell
cardano-cli babbage transaction submit \
  --tx-file tx.signed 
Transaction successfully submitted.
```

## Building transactions with `build` command

Utilizing the `build` command for transaction construction offers a much simpler process, note that it requires an active connection to the node to obtain the protocol parameters in real time, it uses the parameters to automatically calculate the fee to be paid. `build` also offers the  `--change-address` flag, which helps us to automatically balance the transaction, sending the change to the specified address. 

To illustrate, let's send 500 ADA (500000000 lovelace) to the `payment2.addr`.

Query the UTxOs of the input address:

```shell
cardano-cli query utxo --address $(cat payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
c57f25ebf9cf1487b13deeb8449215c499f3d61c2836d84ab92a73b0bbaadd38     1        8994616944 lovelace + TxOutDatumNone
```

Build the transaction:

```shell
cardano-cli babbage transaction build \
  --tx-in c57f25ebf9cf1487b13deeb8449215c499f3d61c2836d84ab92a73b0bbaadd38#1 \
  --tx-out $(cat payment2.addr)+500000000 \
  --change-address $(cat payment.addr) \
  --out-file tx.raw
```
Running this command returns the cost of the transaction fee:
```shell
Estimated transaction fee: Lovelace 167041
```

Inspecting `tw.raw` with `transaction view` shows that the transaction body already includes the fee and the transaction is already balanced.

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

As before, sign the transaction with the `payment.skey`:

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
You can parse `cardano-cli` json outputs with `jq` to have programatic workflows, for example to parse the output of `query utxo` to obtain the first UTXO associated to payment address and use it as input (--tx-in) in `transaction build`: 

```
cardano-cli babbage transaction build \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --output-json | jq -r 'keys[0]') \
--tx-out $(cat payment.addr)+500000000 \
--change-address $(cat payment.addr) \
--out-file tx.raw
```
:::