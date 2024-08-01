---
id: plutus-scripts
title: Plutus scripts
sidebar_label: CLI - Plutus scripts
sidebar_position: 4
description: Transactions involving plutus scripts. 
keywords: [scripts, plutus scripts, cardano, cardano-node, cardano-cli]
---

This tutorial covers the basics of using the Cardano CLI to create transactions that involve executing Plutus scripts. Please checkout [Plutus user guide](https://plutus.cardano.intersectmbo.org/docs/) to learn how to write Plutus scrtipts.


## Basic validator plutus script

For this tutorial we borrowed a simple validator script from the [Plutus Pioneer Program](https://iog-academy.gitbook.io/plutus-pioneers-program-fourth-cohort). We will use the [FortyTwoTyped.hs](https://github.com/input-output-hk/plutus-pioneer-program/blob/fourth-iteration/code/Week02/lecture/FortyTwoTyped.hs) script. You can download the serialized script form [this link](https://github.com/input-output-hk/plutus-pioneer-program/blob/fourth-iteration/code/Week02/assets/fortytwotyped.plutus).  


:::note FortyTwoTyped.hs

The relevant part of this Plutus script is:

```
-- This validator succeeds only if the redeemer is 42
--              Datum  Redeemer        ScriptContext
mk42Validator :: () -> Integer -> PlutusV2.ScriptContext -> Bool
mk42Validator _ r _ = traceIfFalse "expected 42" $ r == 42
```

The type signature of **mk42Validator**  tells us that it takes three arguments and returns a Bool: 

```
mk42Validator :: () -> Integer -> PlutusV2.ScriptContext -> Bool
```

As hinted by the comment line, these three arguments correspond to **Datum, Redeemer and Script Context**. 

On the function definition we see that it does not care about the Datum and the Script Context and only cares about the redeemer.

```
mk42Validator _ r _ = traceIfFalse "expected 42" $ r == 42
```

The underscores (`_`) in the datum and script context positions mean that the function will accept anything for these values and completely ignore them in the function body. The function does not use these values. In the end, the result only depends on the redeemer value `r`. The script succeeds when the correct redeemer is provided (`r == 42`) and fails with any other redeemer value.
:::

So, the general plan for using this script is:

1. Lock some funds in the script address. 
2. Attempt to spend the locked funds. The script will only permit the spending if the correct redeemer is provided.

### Get the compiled script.

Compiling the script is out of the scope of this tutorial, we can get the compiled version with:

```
wget https://raw.githubusercontent.com/input-output-hk/plutus-pioneer-program/fourth-iteration/code/Week02/assets/fortytwotyped.plutus
```

### Build the script address:

```
cardano-cli address build \
--payment-script-file fortytwotyped.plutus \
--out-file script.addr
```

```
cat script.addr
addr_test1wzqvkn6myu8ay080wdsju4s4mzuzgwwv9rxsz2xuc8ycaus9zk46q
```

## Lock funds in the script address

### Prepare the Datum:

Let's lock 10 ADA in the script. To do this, we must create a transaction that sends 10 ADA to the script address. To later spend funds from the script, 
we must supply a Datum (an arbitrary piece of data). This particular script does not care about the content of the Datum, so we will use Haskell's 
unit data type.

The unit data type is represented by (). It is a special type that has only one value, also written as (). This type is analogous to void in other programming languages, but it is a proper type with a single value. 

We can create the file `datum.json` with the following content:

```
{"constructor":0,"fields":[]}
```

### Submit the the transaction to lock the funds:

When building the transaction, it is important to use the `--tx-out-inline-datum-file` flag immediately after the `--tx-out` option to which the datum should be attached. The order of these options matters.

```
cardano-cli transaction build \
--tx-in $(cardano-cli conway query utxo --address $(cat payment.addr) --output-json | jq -r 'keys[0]') \
--tx-out $(cat script.addr)+10000000 \
--tx-out-inline-datum-file datum.json \
--change-address $(cat payment.addr) \
--out-file lock.tx

>Estimated transaction fee: Coin 171969
```

Sign the transaction with the payment.skey

```
cardano-cli transaction sign \
--tx-file lock.tx `\
-signing-key-file payment.skey \
--out-file lock.tx.signed
```

Submit the transaction

```
cardano-cli transaction submit \
--tx-file lock.tx.signed 

>Transaction successfully submitted.
```

### Query the utxos in the script address

```
cardano-cli query utxo --address $(cat script.addr) --output-json
{
    "4c31734468d4f5957328f8fcbb612201c2f774b4ef2bde09b0c6e12cb7ce3f10#0": {
        "address": "addr_test1wzqvkn6myu8ay080wdsju4s4mzuzgwwv9rxsz2xuc8ycaus9zk46q",
        "datum": null,
        "inlineDatum": {
            "constructor": 0,
            "fields": []
        },
        "inlineDatumhash": "923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec",
        "referenceScript": null,
        "value": {
            "lovelace": 10000000
        }
    }
}
```

Perfect, we have locked 10 ada on the script address, the only way to spend it is by executing the script providing the correct redeeemer. 

### Attempt to spend the funds passing the wrong redeemer:

We could say that failing is the primarily duty of a Plutus script. Let's check that our script fails if we pass the wrong redeemer. 

```
cardano-cli transaction build \
--tx-in $(cardano-cli conway query utxo --address $(cat script.addr) --output-json | jq -r 'keys[0]') \
--tx-in-collateral $(cardano-cli conway query utxo --address $(cat payment.addr) --output-json | jq -r 'keys[0]') \
--tx-in-script-file fortytwotyped.plutus \
--tx-in-inline-datum-present \
--tx-in-redeemer-value 57 \
--change-address $(cat payment.addr) \
--out-file unlock.tx
```
We will explain this command in detail below, for now lets focus on the fact that we are passing the Integer **57** as redeemer using the flag 
`--tx-in-redeemer-value 57`. When we hit Enter, the `build` command will try to construct the transaction body, running the script in the process. 

```
Command failed: transaction build  Error: The following scripts have execution failures:
the script for transaction input 0 (in ascending order of the TxIds) failed with: 
The Plutus script evaluation failed: An error has occurred:
The machine terminated because of an error, either from a built-in function or from an explicit use of 'error'.
Script debugging logs: expected 42
PT5
```

The script failed to run. It threw the programmed error message "expected 42" and the [error code (PT5)](https://plutus.cardano.intersectmbo.org/docs/troubleshooting#error-codes) at `build` time. This indicates that the script failed because we passed the wrong redeemer.

If we really wanted, we could use `build-raw` to construct the same transaction and bypass this failure on `build`. However, we would get the same error on `submit`. This transaction can never make it to the chain because it is being rejected by the local node.

### Attempt to spend the funds passing the correct redeemer:

Let's re-use the `build` command from above, this time we pass the correct redeemer value `--tx-in-redeemer-value 42`. 

```
cardano-cli transaction build \
--tx-in $(cardano-cli conway query utxo --address $(cat script.addr) --output-json | jq -r 'keys[0]') \
--tx-in-collateral $(cardano-cli conway query utxo --address $(cat payment.addr) --output-json | jq -r 'keys[0]') \
--tx-in-script-file fortytwotyped.plutus \
--tx-in-inline-datum-present \
--tx-in-redeemer-value 42 \
--change-address $(cat payment.addr) \
--out-file unlock.tx
```

Lets break down the command:

- `--tx-in $(cardano-cli conway query utxo --address $(cat script.addr) --output-json | jq -r 'keys[0]')`

We use the first UTxO on the script address as input for the transaction. So we are trying to spend the locked funds. 

- `--tx-in-collateral $(cardano-cli conway query utxo --address $(cat payment.addr)`  
  `--output-json | jq -r 'keys[0]')`

Since we are running a Plutus script, we must provide a collateral. We use the first utxo of payment address. 

- `--tx-in-script-file fortytwotyped.plutus`

We supply the script file. 

- `--tx-in-inline-datum-present`

We need to supply a datum. When we locked the funds a few steps above we put the datum inline with *--tx-out-inline-datum-file datum.json* this allows us to not supply the datum when trying to spend the funds from the script, instead we are telling the node that the utxo on the script address has the inline datum and the node should get the datum from there. 

- `--tx-in-redeemer-value 42`

We pass the Integer 42 as redeemer

- `--change-address $(cat payment.addr)`

If sucesfull, the 10 ada locked on the script will be sent to payment.addr. Note that we will pay the transactin fee from this UTXO so payment address should receive a little under 10 ada. 

- `--out-file unlock.tx`

We save the transaction body as `unlock.tx`.

When running the command we get 

```
Estimated transaction fee: Coin 300777
```

This time, the node validated the transaction and successfully ran the script. The transaction should succeed if we provide the correct witness for the collateral. Let's do that.


```
cardano-cli transaction sign \
--tx-file unlock.tx \
--signing-key-file payment.skey \
--out-file unlock.tx.signed 
```
```
cardano-cli transaction submit -\
-tx-file unlock.tx.signed

> Transaction successfully submitted.
```

For tracking purposes, lets find our transaction id

```
cardano-cli transaction txid --tx-file unlock.tx.signed 
74c856f90276315a14bd2bd35b3a2f803b763a1bdfa2648ec30a85a129048131
```

Query the UTXOs on both addresses. The script address is now empty

```
cardano-cli query utxo --address $(cat script.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```

and the payment address shows the expected utxo **74c856f90276315a14bd2bd35b3a2f803b763a1bdfa2648ec30a85a129048131#0** with the funds
we unlocked from the script. 

```
cardano-cli query utxo --address $(cat payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
4c31734468d4f5957328f8fcbb612201c2f774b4ef2bde09b0c6e12cb7ce3f10     1        89522687 lovelace + TxOutDatumNone
74c856f90276315a14bd2bd35b3a2f803b763a1bdfa2648ec30a85a129048131     0        9699223 lovelace + TxOutDatumNone
c0e5fe9a87290b137d0acc995f13493eb423f831c8edaa54e6c86f381a31caf3     1        5898934190 lovelace + TxOutDatumNone
```









 
 