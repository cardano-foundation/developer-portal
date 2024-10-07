---
id: stake-address-registration
sidebar_position: 3
title: Stake address registration
sidebar_label: Stake address registration
description: Register stake address on-chain
keywords: [cardano-cli, cli, keys, stake addresses, register, cardano-node, transactions]
---

:::tip
To integrate the Conway era, which differs significantly from previous eras, `cardano-cli` has introduced `<era>` as a top-level command, replacing the former `<era>` flags. For example, instead of using era-specific flags like `--babbage-era` with commands such as `cardano-cli transaction build --babbage-era`, users must now utilize the syntax `cardano-cli babbage transaction build <options>`. 
:::

## Registering a stake address

To participate in the protocol, such as delegating stake to a stake pool to earn rewards or, in the upcoming Conway era, delegating stake to a delegate representative, you must first register your stake credentials on the chain. This registration is accomplished by submitting a **stake address registration certificate** within a transaction. The process includes paying a deposit, the amount of which is determined by the `stakeAddressDeposit` protocol parameter. You can get the deposit back when you submit a **stake address deregistration certificate**.

Delegating to a stake pool also involves submitting a certificate to the chain, in this case, a **stake address delegation certificate**.

You can easily generate such certificates with `cardano-cli`. The corresponding commands can be found under `cardano-cli babbage stake-address`:

```shell
cardano-cli babbage stake-address
Usage: cardano-cli babbage stake-address
                                           ( key-gen
                                           | key-hash
                                           | build
                                           | registration-certificate
                                           | deregistration-certificate
                                           | stake-delegation-certificate
                                           )
```

## Generating the stake address registration certificate

Query the protocol parameters to find out the amount of lovelace required as a deposit for registering a stake address, in this case, it is 2000000 lovelace (two ada):

```shell
cardano-cli babbage query protocol-parameters | jq .stakeAddressDeposit
2000000
```

To generate the registration certificate, run:

```shell
cardano-cli stake-address registration-certificate \
  --stake-verification-key-file stake.vkey \
  --out-file registration.cert
```

The 'cborHex' field encodes the details of the certificate:

```shell
cat registration.cert
{
    "type": "CertificateShelley",
    "description": "Stake Address Registration Certificate",
    "cborHex": "82008200581c521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e"
}
```

## Submitting the stake address registration certificate in a transaction

To submit the registration certificate, you need to build, sign, and submit a transaction. You can use either the `build` or `build-raw` commands. In any case, you need to use the `--certificate-file` flag to include the `registration.cert` in the transaction body.

It's important to note that when using `build`, the deposit is automatically included, and the transaction is balanced accordingly. However, when using `build-raw`, you must manually include the deposit. Below, you'll find examples of both methods.

### Using the `build` command

```shell
cardano-cli babbage transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file registration.cert \
  --out-file tx.raw
```
:::note 
With the `build` command, you don't need to worry about the transaction fees and deposit, it handles it automatically:
:::

Inspecting the `tx.raw` file reveals that this transaction includes the certificate, and is ready to be signed and submitted. 

```shell
cardano-cli babbage transaction view --tx-file tx.raw
```
```json
{
    "auxiliary scripts": null,
    "certificates": [
        {
            "stake address registration": {
                "keyHash": "521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e"
            }
        }
    ],
    "collateral inputs": [],
    "era": "Babbage",
    "fee": "166733 Lovelace",
    "inputs": [
        "055c758abcc64653f106a55c42d4ff23d6b96e46b73c42a4f830a0aee2ffab11#0"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1qp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeue2jrk54ttv0yj7llrfuhr66z4wynpcqxuqeln0jp9y70e0qvjewan",
            "address era": "Shelley",
            "amount": {
                "lovelace": 9997668118
            },
            "network": "Testnet",
            "payment credential key hash": "4b6ba33d919c784e52677bcfe7caf5c2458d8184c0717ae55c459e65",
            "reference script": null,
            "stake reference": {
                "stake credential key hash": "521da955ad8f24bdff8d3cb8f5a155c49870037019fcdf20949e7e5e"
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

### Using the `build-raw` command

Using the `build-raw` command involves a slightly more intricate process. Similarly to the steps outlined in [simple transactions](docs/get-started/cardano-cli/get-started/simple-transactions.md), you should calculate the fee yourself, and handle the deposit accordingly.

Query the balance of the `payment.addr`:

```shell
cardano-cli babbage query utxo --address $(< paymentstake.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
0690c70f117281627fc128ede51b1fe762c2bbc15c2e3d4eff2101c9d2613cd8     0        9999834851 lovelace + TxOutDatumNone
```

:::tip
You can leverage `jq` by having `cardano-cli` return the output in JSON:

```shell
cardano-cli babbage query utxo --address $(< paymentstake.addr) --output-json
{
  "0690c70f117281627fc128ede51b1fe762c2bbc15c2e3d4eff2101c9d2613cd8#0": {
    "address": "addr_test1qp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeue2jrk54ttv0yj7llrfuhr66z4wynpcqxuqeln0jp9y70e0qvjewan",
    "datum": null,
    "datumhash": null,
    "inlineDatum": null,
    "referenceScript": null,
    "value": {
      "lovelace": 9999834851
    }
  }
}
```
Using `jq` to parse that JSON  
```shell
cardano-cli babbage query utxo --address $(< payment.addr) --output-json | jq -r .[].value.lovelace
9999834851
```
:::

Query the protocol parameters: 

```shell
cardano-cli babbage query protocol parameters --out-file pparams.json
```

Draft the transaction to calculate its transaction fee: 

```shell
cardano-cli babbage transaction build-raw \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --tx-out $(< payment.addr)+"$(cardano-cli babbage query utxo --address $(< payment.addr) --out-file /dev/stdout | jq -r .[].value.lovelace)" \
  --fee 0 \
  --certificate-file registration.cert \
  --out-file tx.draft
```

Calculate the transaction fee, it is useful to assign the output to a variable (`fee`):

```shell
cardano-cli babbage transaction calculate-min-fee \
  --tx-body-file tx.draft \
  --protocol-params-file pparams.json \
  --tx-in-count 1 \
  --tx-out-count 1 \
  --witness-count 1

>171089 Lovelace
```

Calculate the change of the transaction. Note that the deposit is not explicitly included, instead, you should deduct the deposit amount (2000000 lovelace) from the change __Change = currentBalance - fee - deposit__:

Query the protocol parameters to get the deposit amount: 

```shell
cardano-cli babbage query protocol-parameters | jq .stakeAddressDeposit
2000000
```
Query the current balance of `payment.addr`:


```shell
cardano-cli babbage query utxo --address $(< payment.addr) --output-json | jq -r .[].value.lovelace
9999834851
```

```shell
change=$((9999834851 - 171089 - 2000000))
```

Build the transaction: 

```shell
cardano-cli babbage transaction build-raw \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --tx-out $(< payment.addr)+$change \
  --fee 171089 \
  --certificate-file registration.cert \
  --out-file tx.raw
```
## Sign and submit the transaction

```shell
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed
```
```shell
cardano-cli transaction submit \
  --tx-file tx.signed 
```


