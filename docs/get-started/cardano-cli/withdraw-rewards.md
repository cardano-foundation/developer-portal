---
id: withdraw-rewards
title: Withdraw rewards
sidebar_label: Withdraw rewards
sidebar_position: 5
description: How to withdraw staking rewards from stake address to a payment address.
keywords: [cardano-cli, cli, delegation, rewards, withdrawal, stake, stake addresses, cardano-node, transactions]
---

:::tip
In order to accommodate the integration of the Conway era, which significantly differs from all previous eras, cardano-cli has introduced `<era>` as a top-level command, replacing the previous `<era>` flags. For instance, instead of using era-specific flags like `--babbage-era` with commands such as `cardano-cli transaction build --babbage-era`, users must now utilize the syntax `cardano-cli babbage transaction build <options>`. 
:::

### Query the stake address balance:

Let's check if we have some rewards to withdraw:

```shell
cardano-cli babbage query stake-address-info --address $(cat stake.addr)
[
    {
        "address": "stake_test1ur453z5nxrgvvu9wfyuxut8ss0mrvca4n8ly44tcu8camlqaz98mh",
        "delegationDeposit": 2000000,
        "rewardAccountBalance": 10534638802,
        "stakeDelegation": "pool17xgtj7ayvsaju4clums0mfusla4pmtfm6t4fj6guqqlsvne2mwm",
    }
]
```

Nice! There are some rewards, let's store the `rewardAccountBalance` in a variable for future use:

```shell
rewards="$(cardano-cli conway query stake-address-info --address $(cat stake1.addr) | jq .[].rewardAccountBalance)"
```

### Build the transaction:
To withdraw rewards from the rewards account you must withdraw its entire balance (partial withdrawals are not allowed). Use the flag `--withdrawal` followed by the stake address and its balance using the syntax: `stakeAddress+lovelace`. 

By default, the `build` command considers the transaction to only require 1 witness, however, this type of transaction needs to be signed by `payment.skey`, to pay for the transaction fees, but also by `stake.skey` to prove we control that stake address. So we let the `build` command "know" that the transaciton will carry two signatures using the flag `--witness-override 2`, this has a slight impact on the fee. 

```shell
cardano-cli babbage transaction build \
  --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --output-json | jq -r 'keys[0]') \
  --withdrawal stake_test1ur453z5nxrgvvu9wfyuxut8ss0mrvca4n8ly44tcu8camlqaz98mh+10534638802 \
  --change-address $(cat payment1.addr) \
  --witness-override 2 \
  --out-file tx.raw

> Estimated transaction fee: Coin 180593
```
or using `cat` and the `$rewards` variable from above:

```shell
cardano-cli babbage transaction build \
  --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --output-json | jq -r 'keys[0]') \
  --withdrawal "$(cat stake.addr)+$rewards" \
  --change-address $(cat payment.addr) \
  --witness-override 2 \
  --out-file tx.raw

> Estimated transaction fee: Coin 180593
```

### Signing the transaction

As before, sign the transaction with the `payment.skey`:

```shell
cardano-cli babbage transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

If you inspect the transaction, you'll notice the "withdrawals" field contains the details of the rewards withdrawal:

```shell
cardano-cli conway transaction view --tx-file tx.signed
```
```json
{
    "auxiliary scripts": null,
    "certificates": null,
    "collateral inputs": [],
    "era": "Babbage",
    "fee": "180593 Lovelace",
    "inputs": [
        "5b8e81604aa60f82337986c0db4e0078282309ca054aa2690315451ec47ce1eb#0"
    ],
    "metadata": null,
    "mint": null,
    "outputs": [
        {
            "address": "addr_test1qrpw2fzut0s7mexgl05lmjdajr00lvlvlufg3qamc0d3mmhtfz9fxvxscec2ujfcdck0pqlkxe3mtx07ft2h3c03mh7q72p248",
            "address era": "Shelley",
            "amount": {
                "lovelace": 680164451802
            },
            "network": "Testnet",
            "payment credential key hash": "c2e5245c5be1ede4c8fbe9fdc9bd90deffb3ecff128883bbc3db1dee",
            "reference script": null,
            "stake reference": {
                "stake credential key hash": "eb488a9330d0c670ae49386e2cf083f63663b599fe4ad578e1f1ddfc"
            }
        }
    ],
    "redeemers": {},
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
            "address": "stake_test1ur453z5nxrgvvu9wfyuxut8ss0mrvca4n8ly44tcu8camlqaz98mh",
            "amount": "10534638802 Lovelace",
            "network": "Testnet",
            "stake credential key hash": "eb488a9330d0c670ae49386e2cf083f63663b599fe4ad578e1f1ddfc"
        }
    ],
    "witnesses": [
        {
            "key": "VKey (VerKeyEd25519DSIGN \"842402e9a35b8818d35f556ba59df2929e3bee72c8e9bfdaa1894faed0a3b2d5\")",
            "signature": "SignedDSIGN (SigEd25519DSIGN \"31c84cc7e0b770f76acb3682c7d2e5b13c00405a0fd1fbaf3ff545be42458fb3e89c3da20162ea262a73d35f04e18257c175d8e0849d51922b8185c11920800b\")"
        },
        {
            "key": "VKey (VerKeyEd25519DSIGN \"8d2128537a643b7327fb07ef01fd8cd2f4911e0b3d096a4575d4cd4d73471896\")",
            "signature": "SignedDSIGN (SigEd25519DSIGN \"06fe930ce8d2f63fd62ab1354b2a85283fe4e6fdfc29ef605644c3f92505cd25165c2e40d4b0139240c06c86e06e835eee0d57a6783142ef5138cacad27d4d08\")"
        }
    ]
}
```


### Submitting the transaction

```shell
cardano-cli babbage transaction submit \
  --tx-file tx.signed 

Transaction successfully submitted.
```

If we query the stake address info again, it has been emptied and the funds sent to the payment address. 

```shell
cardano-cli babbage query stake-address-info --address $(cat stake1.addr)
[
    {
        "address": "stake_test1ur453z5nxrgvvu9wfyuxut8ss0mrvca4n8ly44tcu8camlqaz98mh",
        "delegationDeposit": 2000000,
        "rewardAccountBalance": 0,
        "stakeDelegation": "pool17xgtj7ayvsaju4clums0mfusla4pmtfm6t4fj6guqqlsvne2mwm",
    }
]
```