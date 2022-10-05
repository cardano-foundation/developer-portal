---
id: generate-stake-pool-keys
title: Generate Stake Pool Keys
sidebar_label: Generate stake pool keys
description: "Stake pool course: Generate stake pool keys."
image: ../img/og/og-developer-portal.png
---

## Stake key pair

Now let us create our _stake key pair_ :

```sh
cardano-cli stake-address key-gen \
    --verification-key-file stake.vkey \
    --signing-key-file stake.skey
```

## Stake address

Finally, we can create our stake address. This address **CAN'T** receive payments but will receive the rewards from participating in the protocol. We will save this address in the file `stake.addr`

```sh
cardano-cli stake-address build \
    --stake-verification-key-file stake.vkey \
    --out-file stake.addr \
    --testnet-magic 1097911063
```

This created the file stake.addr, let's check its content:

```sh
cat stake.addr
> stake_test1ur975g2x22jllzjxnekvqj5d0thdut0aydz8ydwy4pvtg3gy0s7xn
```

## Regenerate payment address

Now that we have a stake address, it is time to regenerate a payment address. This time we use both the stake verification key and payment verification key to build the address. With this, both addresses will be linked together and associated with one another.

```sh
cardano-cli address build \
    --payment-verification-key-file payment.vkey \
    --stake-verification-key-file stake.vkey \
    --out-file paymentwithstake.addr \
    --testnet-magic 1097911063
```
