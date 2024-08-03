---
id: treasury-donation
title: Treasury donation
sidebar_label: Treasury donation
sidebar_position: 7
description: How to make a donation to the treasury.
keywords: [cardano-cli, cli, treasury, donation, cardano-node, transactions]
---

Starting from Conway era, you can make donations to the Treasury. It only takes a transaction to do it. You can use `build` or `build-raw` to construct this type of transaction, the only special thing about this transaction is that is must be submitted on the same epoch it is created, this because the transaction body incudes the field `currentTreasuryValue`, which of course, will be different on the next epoch. 


In the Conway era, you can make donations to the Treasury with a transaction. To construct this transaction, you can use either `build` or `build-raw`. The key requirement for this type of transaction is that it must be submitted within the same epoch it is created. This is because the transaction body includes the field `currentTreasuryValue`, which will change in the next epoch. 

::: info
The examples on this tutorial are created on a local clusters that hardfork to Conway on epoch 0.

The treasury donation is created on epoch 0 so that when querying the treasury value on epoch 1, the only lovelace in the treasury are those comming from the donation. 
:::

## Using build-raw

### Query the protocol-parameters:

```
cardano-cli conway query protocol-parameters --out-file pparams.json
```

### Query the utxos of your address:

```
cardano-cli conway query utxo --address $(< example/utxo-keys/payment1.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
6b3cac1a1b63498452ef36ff114ad4f51e5be00c6fbf7ff7b8dbf380483642aa     0        589993592922 lovelace + TxOutDatumNone
```

### Query the current treasury value:

```
cardano-cli conway query treasury
0
```

### Build the transaction: 

When building the transaction we need to pass the current value of the treasury. Also, we use a fee that is close to the minimum possible fee, We will calculate the acrtual fee in the next step.

```
cardano-cli conway transaction build-raw \
--tx-in 6b3cac1a1b63498452ef36ff114ad4f51e5be00c6fbf7ff7b8dbf380483642aa#0 \
--current-treasury-value 0 \
--treasury-donation  987654321 \
--tx-out $(< example/utxo-keys/payment1.addr)+589993592922 \
--fee  160000 \
--protocol-params-file pparams.json \
--out-file example/transactions/treasury.tx.raw
```

### Calculate the fee:

```
cardano-cli conway transaction calculate-min-fee \
--tx-body-file example/transactions/treasury.tx.raw \
--protocol-params-file pparams.json \
--witness-count 1 \
--output-json
{
    "fee": 166117
}
```

### Calculate the change to balance the transaction:

```
echo $((589993592922 - 166117 - 987654321))
```

### Re-build the transaction with the updated values:

```
cardano-cli conway transaction build-raw \
--tx-in 6b3cac1a1b63498452ef36ff114ad4f51e5be00c6fbf7ff7b8dbf380483642aa#0 \
--current-treasury-value 0 \
--treasury-donation  987654321 \
--tx-out $(< example/utxo-keys/payment1.addr)+589005772484 \
--fee  166117 \
--protocol-params-file pparams.json \
--out-file example/transactions/treasury.tx.raw
```
```
cardano-cli conway transaction sign \
--tx-file treasury.tx.raw \
--signing-key-file payment.skey \
--out-file treasury.tx.signed
```
```
cardano-cli transaction submit \
--tx-file treasury.tx.signed
```

At the epoch transition following our transaction, the treasury will be updated.  

```
cardano-cli conway query treasury 
987654321
```

## Using build

### Build the transaction:

The `build` command automatically queries the `currentTreasuryValue` so there is no need to pass it in a flag. As usual. `--change-address` helps us to automatically balance the transaction.

```
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
--treasury-donation  987654321 \
--change-address $(< payment.addr) \
--out-file treasury.tx.raw
```

### Sign the transaction:

```
cardano-cli conway transaction sign \
--tx-file treasury.tx.raw \
--signing-key-file payment.skey \
--out-file treasury.tx.signed
```

### Submit the transaction:

```
cardano-cli transaction submit \
--tx-file treasury.tx.signed
```

At the epoch transition following our transaction, the treasury will be updated.  

```
cardano-cli conway query treasury 
987654321
```

## Transaction body details:

The transaction body carries the fields `"currentTreasuryValue":` and `"treasuryDonation":`, these are `null` in other transactions, this time the fields have a value. 

```
cardano-cli conway transaction view --tx-file example/transactions/treasury.tx.signed
{
    "auxiliary scripts": null,
    "certificates": null,
    "collateral inputs": [],
    "currentTreasuryValue": 0,
    "era": "Conway",
    "fee": "170209 Lovelace",
    "governance actions": [],
    "inputs": [
        "60026f54b66f4f60bbcdbe0e41cc5faaa0ecbef9489badca96e65c2ee13fc180#0"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1qp36k4sz488z5he0cut7awr5m2fajm9kkqcex5p963zgpgmkksh55zaw47shfy92nyaa3usf6ly7an8gfl8ktdhhv85s6zhl4v",
            "address era": "Shelley",
            "amount": {
                "lovelace": 589005768392
            },
            "network": "Testnet",
            "payment credential key hash": "63ab5602a9ce2a5f2fc717eeb874da93d96cb6b031935025d44480a3",
            "reference script": null,
            "stake reference": {
                "stake credential key hash": "76b42f4a0baeafa17490aa993bd8f209d7c9eecce84fcf65b6f761e9"
            }
        }
    ],
    "redeemers": {},
    "reference inputs": [],
    "required signers (payment key hashes needed for scripts)": null,
    "return collateral": null,
    "total collateral": null,
    "treasuryDonation": 987654321,
    "update proposal": null,
    "validity range": {
        "lower bound": null,
        "upper bound": null
    },
    "voters": {},
    "withdrawals": null,
    "witnesses": [
        {
            "key": "VKey (VerKeyEd25519DSIGN \"3d1f194c060f6f2a056bdee943fd16eb922aad8ce2ef524a53eefeaba60e6f6f\")",
            "signature": "SignedDSIGN (SigEd25519DSIGN \"efda7f8cf55be3ad34ae38119a141f2d1cd0808193207fb7f896c0636a0b8ad3fbea276db7ba516a25ba013837ab0e5cc396cbc615ff0821ff75a17f5a5b6d05\")"
        }
    ]
}
```
