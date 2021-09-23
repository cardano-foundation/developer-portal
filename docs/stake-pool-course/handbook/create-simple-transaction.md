---
id: create-simple-transaction
title: Create Simple Transaction
sidebar_label: Create simple transaction
description: "Stake pool course: Learn how to create simple transaction."
image: ./img/og-developer-portal.png
---

Creating a transaction requires various steps:

* Get the protocol parameters
* Calculate the fee
* Define the time-to-live (TTL) for the transaction
* Build the transaction
* Sign the transaction
* Submit the transaction

## Get protocol parameters

Get the protocol parameters and save them to `protocol.json` with:

```sh
cardano-cli query protocol-parameters \
  --mainnet \
  --out-file protocol.json
```

## Get the transaction hash and index of the **UTXO** to spend:

```sh
cardano-cli query utxo \
  --address $(cat payment.addr) \
  --mainnet
```

## Draft the transaction

Create a draft for the transaction and save it in tx.draft

:::note
For `--tx-in` we use the following syntax: `TxHash#TxIx` where `TxHash` is the transaction hash and `TxIx` is the index; for `--tx-out` we use: `TxOut+Lovelace` where `TxOut` is the hex encoded address followed by the amount in `Lovelace`. For the transaction draft --tx-out, --invalid-hereafter and --fee can be set to zero.
:::note

    cardano-cli transaction build-raw \
    --tx-in 4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99#4 \
    --tx-out $(cat payment2.addr)+0 \
    --tx-out $(cat payment.addr)+0 \
    --invalid-hereafter 0 \
    --fee 0 \
    --out-file tx.draft

## Calculate the fee

A simple transaction needs one input, a valid UTXO from `payment.addr`, and two outputs:

* Output1: The address that receives the transaction.
* Output2: The address that receives the change of the transaction.

Note that to calculate the fee you need to include the draft transaction
```sh
    cardano-cli transaction calculate-min-fee \
    --tx-body-file tx.draft \
    --tx-in-count 1 \
    --tx-out-count 2 \
    --witness-count 1 \
    --byron-witness-count 0 \
    --mainnet \
    --protocol-params-file protocol.json
```

## Calculate the change to send back to payment.addr

all amounts must be in Lovelace:

    expr <UTXO BALANCE> - <AMOUNT TO SEND> - <TRANSACTION FEE>

For example, if we send 10 ada from a UTxO containing 20 ada, the change to send back to `payment.addr` after paying the fee is: 9.832035 ada
```sh
expr 20000000 - 10000000 - 167965
9832035
```

## Determine the TTL (time to Live) for the transaction

To build the transaction we need to specify the **TTL (Time to live)**, this is the slot height limit for our transaction to be included in a block, if it is not in a block by that slot the transaction will be cancelled. So TTL = slot + N slots. Where N is the amount of slots you want to add to give the transaction a window to be included in a block.

Query the tip of the blockchain:

    cardano-cli query tip --mainnet

Look for the value of `slotNo`
```json
    {
        "blockNo": 16829,
        "headerHash": "3e6f59b10d605e7f59ba8383cb0ddcd42480ddcc0a85d41bad1e4648eb5465ad",
        "slotNo": 369200
    }
```
Calculate your TTL, for example:  369200 + 200 slots = 369400

## Build the transaction

We write the transaction in a file, we will name it `tx.raw`.
```sh
    cardano-cli transaction build-raw \
    --tx-in 4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99#4 \
    --tx-out $(cat payment2.addr)+10000000 \
    --tx-out $(cat payment.addr)+9832035 \
    --invalid-hereafter 369400 \
    --fee 167965 \
    --out-file tx.raw
```

## Sign the transaction

Sign the transaction with the signing key **payment.skey** and save the signed transaction in **tx.signed**
```sh
    cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --mainnet \
    --out-file tx.signed
```

## Submit the transaction
```sh
    cardano-cli transaction submit \
    --tx-file tx.signed \
    --mainnet
```

## Check the balances

We must give it some time to get incorporated into the blockchain, but eventually, we will see the effect:
```sh
cardano-cli query utxo \
--address $(cat payment.addr) \
--mainnet

    >                            TxHash                                 TxIx         Amount
    > ----------------------------------------------------------------------------------------
    > b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee     1         9832035 lovelace

cardano-cli query utxo \
--address $(cat payment2.addr) \
--mainnet

    >                            TxHash                                 TxIx         Amount
    > ----------------------------------------------------------------------------------------
    > b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee     0         10000000 lovelace
```

:::note
`--mainnet` identifies the Cardano mainnet, for testnets use `--testnet-magic 1097911063` instead.
:::note
