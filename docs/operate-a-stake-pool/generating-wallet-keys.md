---
id: generating-wallet-keys
title: Generating wallet keys (Faucet for tADA)
sidebar_label: Generating wallet keys
description: Generating wallet keys (Faucet for tADA)
image: ../img/og-developer-portal.png
---
Once the relay nodes in our last section are in sync with our chosen [testnet network](docs/get-started/testnets-and-devnets.md), it's time to configure one of these relays into a block producing node. In this section we will create wallet keys which are needed to register a pool and run the block producer.

A wallet address is needed to pay the pool deposit, to pay transaction costs of the network, and for staking to a pool. So it's a combination of payment keys and stake keys. 

Let's first create a directory to store all the keys.

```
mkdir -p $HOME/cardano-testnet/keys
cd $HOME/cardano-testnet/keys
```

:::important
Due to security reasons, for the Mainnet these keys should be generated and stored on an [air-gapped system](/docs/get-started/air-gap.md), but since we are working on a testnet, we can generate and keep them on the block producing node.
:::

## Generating Payment Keys

Create a new payment key pair: `payment.skey` & `payment.vkey`

```
cardano-cli address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey
```

- `cardano-cli address key-gen`: generates a payment key-pair.
- `--verification-key-file`: points to the path where you want to save the `vkey` file.
- `--signing-key-file`: points to the path where you want to save the `skey` file.

- **.vkey / Public Verification Key** : Is used to derive a Cardano wallet address, a wallet address is basically the hash string value that you share to other users to provide them a way to send ada / tAda or other assets in the Cardano blockchain into your wallet.
- **.skey / Private Signing Key** : Is used to sign / approve transactions for your wallet. As you can imagine, it is very important to not expose this file to the public and must be kept secure.

## Generating Stake Keys

Create a new stake address key pair: stake.skey & stake.vkey

```
cardano-cli stake-address key-gen \
    --verification-key-file stake.vkey \
    --signing-key-file stake.skey
```

Create your stake address from the stake address verification key and store it in `stake.addr`:

```
cardano-cli stake-address build \
    --stake-verification-key-file stake.vkey \
    --out-file stake.addr \
    --testnet-magic 1
```
## Generating Wallet Keys

The next step would be to generate a wallet address for the payment key `payment.vkey` which will delegate to the stake address `stake.vkey`:

```
cardano-cli address build \
    --payment-verification-key-file payment.vkey \
    --out-file payment.addr \
    --testnet-magic 1
```

- `cardano-cli address build` : Generates a wallet address from a vkey file.
- `--payment-verification-key-file` : The path to the vkey file to be used for the derivation.
- `--out-file` : The path to save the wallet address file.
- `--testnet-magic` : The NetworkMagic of the network that where you want to use the wallet address. In this case it is 1.

The `payment.addr` file contains the derived wallet address from your `vkey` file. It should look something like this:

```
addr_test1vqe09nt0rxgwn83upxuhqzs4aqrzdjqmhrh5l4g5hh4kc6qsncmku
```

The wallet is currently empty, so if we check its balance now:

```
cardano-cli query utxo \
    --address $(cat payment.addr)\
    --testnet-magic 1
```

we should get something like this:

```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```

The next step is to fund the payment address.

## Testnets faucet

Since the Cardano testnets are independent networks, separate from the Cardano mainnet, they require their own tokens.

The faucet is a web-based service that provides test ada to users of the Cardano testnets. While these tokens have no "real world" value, they enable users to experiment with Cardano testnet features, without having to spend real ada on the Mainnet.

To apply for Testnets faucet please follow the instructions on the webpage below and choose the Pre-Production Testnet.

[Cardano Docs - Testnets faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)

Once the test ADA are transferred and you run the above query utxo again, you should see something like this:

```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
531f4bec36af503654c3c6fa34ecf07e5c29f67da8e2b84c8923b8c735b011c9     0        10000000000 lovelace + TxOutDatumNone
```

Now the pool wallet and stake keys are ready and we can go to the next step of creating the pool keys.

## References 
- [CIP 19 Cardano Addresses](https://cips.cardano.org/cip/CIP-0019)
