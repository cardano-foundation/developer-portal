---
id: deregister-stake-addreess
title: Deregister stake address
sidebar_label: Deregister stake address
sidebar_position: 6
description: How to deregister a stake address.
keywords: [cardano-cli, cli, deregistration, deregister, rewards, withdrawal, stake, stake addresses, cardano-node, transactions]
---

:::tip
To integrate the Conway era, which differs significantly from previous eras, `cardano-cli` has introduced `<era>` as a top-level command, replacing the former `<era>` flags. For example, instead of using era-specific flags like `--babbage-era` with commands such as `cardano-cli transaction build --babbage-era`, users must now utilize the syntax `cardano-cli babbage transaction build <options>`. 
:::

:::caution
The process outlined below involves transferring funds from the payment address associated with the stake address we plan to deregister. This is followed by withdrawing rewards over several consecutive epochs until the rewards are negligible. Only then do we deregister the stake address. This ensures that all earned rewards are collected.
:::

![Deregister stake address](/img/cli/deregister-stake-address.png)

At Epoch N:

1. Generate a new payment address that is not associated with a stake address or is associated with a non-registered stake address.
2. Transfer all funds from the original payment address to the new payment address.
3. Withdraw any rewards from the original stake address and transfer them to the new payment address.
4. Ensure that the original payment address and stake address are now empty.

At the Beginning of Epoch N+1:

5. Withdraw rewards received in the original stake address from block production activities of Epoch N-1 and transfer them to the new payment address.

Subsequent Epochs:

6. Repeat step 5 in each subsequent epoch until the rewards are negligible.

Final step:

7. Deregister the stake address submitting a **stake address deregistration certificate**. We withdraw the last rewards from the stake address and collect the deposit back on the same transaction. 


### Generate the Stake address deregistration certificate

Here we only show step 7, previous steps can be performed following the corrsponding tutorial for that particular workflow. To generate the **stake address deregistration certificate** we run:

```
cardano-cli babbage stake-address deregistration-certificate \
--stake-verification-key-file stake.vkey \
--out-file dereg.cert
```
As most of the CLI-produced artificats it is in a text envelope format, with the `cborHex` field encoding the details of the certificate: 

```
cat dereg.cert
```
```json
{
    "type": "CertificateShelley",
    "description": "Stake Address Deregistration Certificate",
    "cborHex": "82018200581c521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e"
}
```

### Query information required for the transaction:

We will submit the deregistration certificate, withdraw the last rewards from the stake address and collect the stake address deposit on the same transaction, let's query all the information we will need for our transaciton:

#### Get the stake address balance 

This is required for withdrawing the rewards still available on `stake.addr`

```
cardano-cli babbage query stake-address-info --address $(< stake.addr)
```
```json
[
    {
        "address": "stake_test1upfpm2244k8jf00l357t3adp2hzfsuqrwqvleheqjj08uhswme5cn",
        "delegation": "pool17navl486tuwjg4t95vwtlqslx9225x5lguwuy6ahc58x5dnm9ma",
        "delegationDeposit": 2000000,
        "rewardAccountBalance": 291385529
    }
]
```
and use the syntax `stake_address+balance` with the `--withdrawal` option when building the transaction, for example: 
`--withdrawal  stake_test1upfpm2244k8jf00l357t3adp2hzfsuqrwqvleheqjj08uhswme5cn+291385529`


#### Get the utxo from new-payment.addr 

Steps 1 and 2 suggest creating a new payment address and transfer funds to it. On the transaction below, we'll use `new_payment.addr` to pay for the transaction fees.

```
cardano-cli babbage query utxo --address $(< payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
77b95d3c0031f918d2dcd796352d123dd3fec9f8599377ef96f1ee0e488f5ec1     0        9997495621 lovelace + TxOutDatumNone
```
#### Get the stake address deposit amount

```
cardano-cli babbage query protocol-parameters | jq .stakeAddressDeposit

> 2000000
```


### Build sign and submit the transaction

Here we use the information from the above queries to build the transaction: 

```
cardano-cli babbage transaction build \
--tx-in 77b95d3c0031f918d2dcd796352d123dd3fec9f8599377ef96f1ee0e488f5ec1#0 \
--change-address addr_test1vp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeuegh55grh \
--withdrawal stake_test1upfpm2244k8jf00l357t3adp2hzfsuqrwqvleheqjj08uhswme5cn+291385529 \
--certificate-file dereg.cert \
--witness-override 2 \
--out-file tx.raw
```

Of course, we could use command substitution and run all the queries within `build`, so this is equivalent:

```
cardano-cli babbage transaction build \
--tx-in "$(cardano-cli babbage query utxo --address "$(< new-payment.addr)" --output-json | jq -r 'keys[0]')" \
--change-address "$(< new-payment.addr)" \
--withdrawal "$(< stake.addr)+$(cardano-cli babbage query stake-address-info --address "$(< stake.addr)" | jq -r .[].rewardAccountBalance)" \
--certificate-file dereg.cert \
--witness-override 2 \
--out-file tx.raw
```
```
Estimated transaction fee: Coin 180505
```

Inspect the transaction before signing:

```
cardano-cli babbage transaction view --tx-file tx.raw
```
```json
{
    "auxiliary scripts": null,
    "certificates": [
        {
            "stake address deregistration": {
                "keyHash": "521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e"
            }
        }
    ],
    "collateral inputs": [],
    "era": "Babbage",
    "fee": "180505 Lovelace",
    "inputs": [
        "77b95d3c0031f918d2dcd796352d123dd3fec9f8599377ef96f1ee0e488f5ec1#0"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1vp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeuegh55grh",
            "address era": "Shelley",
            "amount": {
                "lovelace": 10290700645
            },
            "network": "Testnet",
            "payment credential key hash": "4b6ba33d919c784e52677bcfe7caf5c2458d8184c0717ae55c459e65",
            "reference script": null,
            "stake reference": null
        }
    ],
    "redeemers": [],
    "reference inputs": [],
    "required signers (payment key hashes needed for scripts)": null,
    "return collateral": null,
    "total collateral": null,
    "update proposal": null,
    "validity range": {
        "lower bound": null,
        "upper bound": null
    },
    "withdrawals": [
        {
            "address": "stake_test1upfpm2244k8jf00l357t3adp2hzfsuqrwqvleheqjj08uhswme5cn",
            "amount": "291385529 Lovelace",
            "network": "Testnet",
            "stake credential key hash": "521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e"
        }
    ],
    "witnesses": []
}
```
Confirm that the keyHash for the stake address deregistration is correct with: 

```
cardano-cli babbage stake-address key-hash --stake-verification-key-file stake.vkey 
521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e
```
All good! Ready to sign the transaction: 

```
cardano-cli babbage transaction sign \
  --tx-file tx.raw \
  --signing-key-file new-payment.skey \
  --signing-key-file stake.skey \
  --out-file tx.signed
```

And submit it to the chain:

```
cardano-cli babbage transaction submit --tx-file tx.signed 
Transaction successfully submitted.
```
To confirm, we query the balance of `new-payment.addr`, rewards are withdrawn and deposit has been returned:

```
cardano-cli babbage query utxo --address $(< new-payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
c09bf08fdf6ae655d8ba7c5e9f44b5cbe11b6bb9621eabb9b1b08c1b27b987eb     0        10290700645 lovelace + TxOutDatumNone
```

If we query the stake address info, we get `[]`, meaning that the deregistration has been sucessful:

```
cardano-cli babbage query stake-address-info --address $(< stake.addr)
[]
```