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

```
{
    "type": "PlutusScriptV2",
    "description": "",
    "cborHex": "5907ac5907a901000032323322323232323232323232323233223232323232222323253353232325335333573466e1c009205401c01b101c13357389210b65787065637465642034320001b3333573466e1cd55cea80224000466442466002006004646464646464646464646464646666ae68cdc39aab9d500c480008cccccccccccc88888888888848cccccccccccc00403403002c02802402001c01801401000c008cd405c060d5d0a80619a80b80c1aba1500b33501701935742a014666aa036eb94068d5d0a804999aa80dbae501a35742a01066a02e0446ae85401cccd5406c08dd69aba150063232323333573466e1cd55cea801240004664424660020060046464646666ae68cdc39aab9d5002480008cc8848cc00400c008cd40b5d69aba15002302e357426ae8940088c98c80c0cd5ce01981801709aab9e5001137540026ae854008c8c8c8cccd5cd19b8735573aa004900011991091980080180119a816bad35742a004605c6ae84d5d1280111931901819ab9c03303002e135573ca00226ea8004d5d09aba2500223263202c33573805e05805426aae7940044dd50009aba1500533501775c6ae854010ccd5406c07c8004d5d0a801999aa80dbae200135742a00460426ae84d5d1280111931901419ab9c02b028026135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d55cf280089baa00135742a00860226ae84d5d1280211931900d19ab9c01d01a018375a00a6666ae68cdc39aab9d375400a9000100c11931900c19ab9c01b018016101713263201733573892010350543500017135573ca00226ea800448c88c008dd6000990009aa80b111999aab9f0012500a233500930043574200460066ae880080508c8c8cccd5cd19b8735573aa004900011991091980080180118061aba150023005357426ae8940088c98c8050cd5ce00b80a00909aab9e5001137540024646464646666ae68cdc39aab9d5004480008cccc888848cccc00401401000c008c8c8c8cccd5cd19b8735573aa0049000119910919800801801180a9aba1500233500f014357426ae8940088c98c8064cd5ce00e00c80b89aab9e5001137540026ae854010ccd54021d728039aba150033232323333573466e1d4005200423212223002004357426aae79400c8cccd5cd19b875002480088c84888c004010dd71aba135573ca00846666ae68cdc3a801a400042444006464c6403666ae7007806c06406005c4d55cea80089baa00135742a00466a016eb8d5d09aba2500223263201533573803002a02626ae8940044d5d1280089aab9e500113754002266aa002eb9d6889119118011bab00132001355013223233335573e0044a010466a00e66442466002006004600c6aae754008c014d55cf280118021aba200301213574200222440042442446600200800624464646666ae68cdc3a800a40004642446004006600a6ae84d55cf280191999ab9a3370ea0049001109100091931900819ab9c01301000e00d135573aa00226ea80048c8c8cccd5cd19b875001480188c848888c010014c01cd5d09aab9e500323333573466e1d400920042321222230020053009357426aae7940108cccd5cd19b875003480088c848888c004014c01cd5d09aab9e500523333573466e1d40112000232122223003005375c6ae84d55cf280311931900819ab9c01301000e00d00c00b135573aa00226ea80048c8c8cccd5cd19b8735573aa004900011991091980080180118029aba15002375a6ae84d5d1280111931900619ab9c00f00c00a135573ca00226ea80048c8cccd5cd19b8735573aa002900011bae357426aae7940088c98c8028cd5ce00680500409baa001232323232323333573466e1d4005200c21222222200323333573466e1d4009200a21222222200423333573466e1d400d2008233221222222233001009008375c6ae854014dd69aba135744a00a46666ae68cdc3a8022400c4664424444444660040120106eb8d5d0a8039bae357426ae89401c8cccd5cd19b875005480108cc8848888888cc018024020c030d5d0a8049bae357426ae8940248cccd5cd19b875006480088c848888888c01c020c034d5d09aab9e500b23333573466e1d401d2000232122222223005008300e357426aae7940308c98c804ccd5ce00b00980880800780700680600589aab9d5004135573ca00626aae7940084d55cf280089baa0012323232323333573466e1d400520022333222122333001005004003375a6ae854010dd69aba15003375a6ae84d5d1280191999ab9a3370ea0049000119091180100198041aba135573ca00c464c6401866ae7003c0300280244d55cea80189aba25001135573ca00226ea80048c8c8cccd5cd19b875001480088c8488c00400cdd71aba135573ca00646666ae68cdc3a8012400046424460040066eb8d5d09aab9e500423263200933573801801200e00c26aae7540044dd500089119191999ab9a3370ea00290021091100091999ab9a3370ea00490011190911180180218031aba135573ca00846666ae68cdc3a801a400042444004464c6401466ae7003402802001c0184d55cea80089baa0012323333573466e1d40052002200723333573466e1d40092000200723263200633573801200c00800626aae74dd5000a4c240022440042440029210350543100112323001001223300330020020011"
}
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

Let's lock 10 ADA in the script. 

### Prepare the Datum:

To do this, we must create a transaction that sends 10 ADA to the script address and attach a datum. This particular script does not care about the content of the Datum, so we will use Haskell's unit data type.

The unit data type is represented by (). It is a special type that has only one value, also written as (). This type is analogous to void in other programming languages, but it is a proper type with a single value. 

We can create the file `datum.json` with the following content:

```
{"constructor":0,"fields":[]}
```

### Submit the the transaction to lock the funds:

When building the transaction, it is important to use the `--tx-out-inline-datum-file` flag immediately after the `--tx-out` option to which the datum should be attached. The order of these options matters.

```
cardano-cli transaction build \
--tx-in $(cardano-cli conway query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
--tx-out $(< script.addr)+10000000 \
--tx-out-inline-datum-file datum.json \
--change-address $(< payment.addr) \
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
cardano-cli query utxo --address $(< script.addr) --output-json
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
--tx-in $(cardano-cli conway query utxo --address $(< script.addr) --output-json | jq -r 'keys[0]') \
--tx-in-collateral $(cardano-cli conway query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
--tx-in-script-file fortytwotyped.plutus \
--tx-in-inline-datum-present \
--tx-in-redeemer-value 57 \
--change-address $(< payment.addr) \
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
--tx-in $(cardano-cli conway query utxo --address $(< script.addr) --output-json | jq -r 'keys[0]') \
--tx-in-collateral $(cardano-cli conway query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
--tx-in-script-file fortytwotyped.plutus \
--tx-in-inline-datum-present \
--tx-in-redeemer-value 42 \
--change-address $(< payment.addr) \
--out-file unlock.tx
```

Lets break down the command:

- `--tx-in $(cardano-cli conway query utxo --address $(< script.addr) --output-json | jq -r 'keys[0]')`

We use the first UTxO on the script address as input for the transaction. So we are trying to spend the locked funds. 

- `--tx-in-collateral $(cardano-cli conway query utxo --address $(< payment.addr)`  
  `--output-json | jq -r 'keys[0]')`

Since we are running a Plutus script, we must provide a collateral. We use the first utxo of payment address. 

- `--tx-in-script-file fortytwotyped.plutus`

We supply the script file. 

- `--tx-in-inline-datum-present`

We need to supply a datum. When we locked the funds a few steps above we put the datum inline with *--tx-out-inline-datum-file datum.json* this allows us to not supply the datum when trying to spend the funds from the script, instead we are telling the node that the utxo on the script address has the inline datum and the node should get the datum from there. 

- `--tx-in-redeemer-value 42`

We pass the Integer 42 as redeemer

- `--change-address $(< payment.addr)`

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
cardano-cli query utxo --address $(< script.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```

and the payment address shows the expected utxo **74c856f90276315a14bd2bd35b3a2f803b763a1bdfa2648ec30a85a129048131#0** with the funds
we unlocked from the script. 

```
cardano-cli query utxo --address $(< payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
4c31734468d4f5957328f8fcbb612201c2f774b4ef2bde09b0c6e12cb7ce3f10     1        89522687 lovelace + TxOutDatumNone
74c856f90276315a14bd2bd35b3a2f803b763a1bdfa2648ec30a85a129048131     0        9699223 lovelace + TxOutDatumNone
c0e5fe9a87290b137d0acc995f13493eb423f831c8edaa54e6c86f381a31caf3     1        5898934190 lovelace + TxOutDatumNone
```









 
 