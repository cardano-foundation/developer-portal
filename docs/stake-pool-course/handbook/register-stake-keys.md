---
id: register-stake-keys
title: Register Stake Address on the Blockchain
sidebar_label: Register stake pool keys
description: "Stake pool course: Learn how to create stake pool keys."
image: ../img/og/og-developer-portal.png
---

Stake address needs to be registered on the blockchain to be useful. Registering keys requires:

* Create a registration certificate.
* Submit the certificate to the blockchain with a transaction.

## Create a registration certificate

```sh
cardano-cli stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --out-file stake.cert
```

## Query the UTXO of the address that pays for the transaction and deposit:

```sh
cardano-cli query utxo \
    --address $(cat payment.addr) \
    --mainnet
```

    >                            TxHash                                 TxIx      Amount
    > ----------------------------------------------------------------------------------------
    > b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee     1      1000000000 lovelace


## Draft transaction & Calculate fees (this doesn't need to be done in multiple steps anymore)

For the transaction, --tx.out need to be more approx. 1 ADA, --invalid-hereafter need to be set close ahead of the current slot. 
First: query the current slotnumber again to add it to --invalid-hereafter: 
```sh
cardano-cli query tip --mainnet
```

```sh
cardano-cli transaction build \
    --alonzo-era \
    --tx-in b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee#1 \
    --tx-out $(cat payment.addr)+1000000 \
    --change-address $(cat payment.addr) \
    --mainnet  \
    --out-file tx.raw \
    --certificate-file stake.cert \
    --invalid-hereafter 987654 \
    --witness-override 2
```
The output is the transaction fee in lovelace:

    > 171485

Registering the stake address, not only pay transaction fees, but also includes a _deposit_ (which you get back when deregister the key) as stated in the protocol parameters:

The deposit amount can be found in the `protocol.json` under `stakeAddressDeposit`, for example in Shelley Mainnet:

```json
"stakeAddressDeposit": 2000000,
```
## (OPTIONAL): Calculate the change to send back to payment address after including the deposit

It is either possible to simply keep the transaction as prepared above and send the minimum of 1 ADA (1000000 Lovelace) to the payment.addr, which will result in two utxos at payment.addr, or you could calculate the exact amount needed to only have one utxo resulting at your payment.addr (and no change). 

    expr 1000000000 - 171485 - 2000000

    > 997828515

Herefore you would need to calculate the expression above and then build the transaction (as stated above) again, but adding the result calculated in the tx-out parameter:

```sh
cardano-cli transaction build \
    --alonzo-era \
    --tx-in b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee#1 \
    --tx-out $(cat payment.addr)+997828515 \
    --change-address $(cat payment.addr) \
    --mainnet  \
    --out-file tx.raw \
    --certificate-file stake.cert \
    --invalid-hereafter 987654 \
    --witness-override 2
```

## Submit the certificate with a transaction:

Sign it:

```sh
cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file stake.skey \
    --mainnet \
    --out-file tx.signed
```

And submit it:

```sh
cardano-cli transaction submit \
    --tx-file tx.signed \
    --mainnet
```

Your stake key is now registered on the blockchain.

:::note
`--mainnet` identifies the Cardano mainnet, for testnets use `--testnet-magic 1097911063` instead.
:::
