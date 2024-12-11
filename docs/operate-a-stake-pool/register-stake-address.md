---
id: register-stake-address
title: Registering a Stake Address
sidebar_label: Registering a Stake Address
description: Registering a Stake Address 
image: ../img/og-developer-portal.png
---

Registering a new stake pool involves two steps - Registering a stake address and registering the the pool metadata. The stake address needs to be registered on the blockchain to be useful and it requires:

* Creating a registration certificate.
* Submitting the certificate to the blockchain with a transaction.

To build the transaction the following information will be collected first:

* `tx-in`: UTXO of the address that pays for the transaction and deposit
* `tx-out`: The transaction output as ADDRESS VALUE
* `invalid-hereafter`: Time that transaction is valid until (in slots)
* `certificate-file`: stake address registration certificate
* `fee`: The fee amount in Lovelace

## `tx-in`:

Query the UTXO of the address that pays for the transaction and deposit:

```
cd $HOME/cardano-testnet/keys

cardano-cli query utxo \
    --address $(cat payment.addr) \
    --testnet-magic 1 > fullUtxo.out
```

The result should look like the following:

```
cat fullUtxo.out
>                            TxHash                                 TxIx      Amount
> ----------------------------------------------------------------------------------------
> b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee     1      1000000000 lovelace
```

so in this case the required UTXO would be `b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee#1`.

## `tx-out`:

This would be `payment.addr` and the amount that has to be paid.  Since we don't know how much the transaction will cost we put it as 1 ADA for the moment - `$(cat payment.addr)+1000000`

## `invalid-hereafter`:

Find out the current slot:
```
currentSlot=$(cardano-cli query tip --testnet-magic 1 | jq -r '.slot')
echo Current Slot: $currentSlot
```

The `invalid-hereafter` value must be greater than the current tip. In this example, we use current slot + 1000 -  `$currentSlot+1000`.

## `certificate`:

Create a stake address registration certificate:

```
cardano-cli stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --out-file stake.cert
```

## `witness-override`:

When calculating the fee for a transaction, the `--witness-count` option indicates the number of keys signing the transaction. You must sign a transaction submitting a stake address registration certificate to the blockchain using the secret key for the payment address spending the input, as well as the secret key for the stake address to register.

## `fee`:

Now, we build the transaction which will return the `tx.raw` transaction file and also the transaction fees:

```
cardano-cli transaction build \
    --tx-in b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee#1 \
    --tx-out $(cat payment.addr)+1000000 \
    --change-address $(cat payment.addr) \
    --testnet-magic 1 \
    --certificate-file stake.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000)) \
    --witness-override 2 \
    --out-file tx.raw
```

The output is the transaction fee in lovelace:
```
Estimated transaction fee: Lovelace 172013
```

Registering the stake address, not only pays transaction fees, but also includes a deposit (which you get back when deregister the key) as indicated in the protocol parameters.

The deposit amount can be found in `protocol.json` under `stakeAddressDeposit`:

```
cardano-cli query protocol-parameters \
    --testnet-magic 1  \
    --out-file protocol.json

stakeAddressDeposit=$(cat protocol.json | jq -r '.stakeAddressDeposit')
echo $stakeAddressDeposit
```

## Build the transaction

Next, the complete transaction output is calculated by subtracting the deposit and transaction fees from the amount we have in our payment address:

```
txOut=$((1000000000-${stakeAddressDeposit}-172013))
echo ${txOut}
```

Now we have all the information in place to build the final transaction file:

```
cardano-cli transaction build-raw \
    --tx-in b64ae44e1195b04663ab863b62337e626c65b0c9855a9fbb9ef4458f81a6f5ee#1 \
    --tx-out $(cat payment.addr)+${txOut} \
    --invalid-hereafter $((${currentSlot} + 1000)) \
    --fee 172013 \
    --certificate-file stake.cert \
    --out-file tx.raw
```

## Sign and Submit the transaction

Sign the transaction with both the payment and stake secret keys:

```
cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file stake.skey \
    --testnet-magic 1 \
    --out-file tx.signed
```

And submit it:

```
cardano-cli transaction submit \
    --tx-file tx.signed \
    --testnet-magic 1 
```
In the next section we will register the pool metadata.

## References 
- [CIP 19 Cardano Addresses](https://cips.cardano.org/cip/CIP-0019)
