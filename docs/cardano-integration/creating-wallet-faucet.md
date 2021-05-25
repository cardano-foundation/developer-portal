---
id: creating-wallet-faucet
title: Exploring Cardano Wallets and the Faucet
sidebar_label: Exploring Cardano Wallets and the Faucet
description: This article explains how you can create different kinds of Cardano Wallets and how you can recieve some tADA(test ADA) from the faucet.
image: ./img/og-developer-portal.png
--- 

### Overview 

In this guide, we will show you how to create a **Cardano** wallet, receive some `tADA` (**test ADA**) in the `testnet` network and send basic example transactions. We will explore tools like `cardano-cli` and `cardano-wallet` on how they can help with these functionalities.

:::note
This guide assumes you have installed `cardano-node` and `cardano-cli` into your system. If not you can refer to [Installing cardano-node](/docs/cardano-integration/installing-cardano-node) guide for instructions on how to do that.

It is also recommended to read [Running cardano-node](/docs/cardano-integration/running-cardano) guide before proceeding.
:::

### Cardano Wallets 

So you installed your `cardano-node` and got it running, you probably even tried to query some simple blockchain data (If you read [Running cardano-node](/docs/cardano-integration/running-cardano) guide). But how do you actually create a **Cardano** wallet, receive and send some `ADA` or `tADA` tokens?

First we have to look at the applications we can use to create wallets.

- [Daedalus](https://daedaluswallet.io/) : **Daedalus Wallet** is the official **Cardano** full-node wallet, which is a [GUI (Graphical User Interface)](https://en.wikipedia.org/wiki/Graphical_user_interface) application for the Desktop (**Linux**, **MacOS**, **Windows**). That means that users will get to use a nice (UI) user-interface, buttons and layout to interact with the **Cardano** blockchain.

    A full-node wallet basically means that it has to synchronize and download the blockchain first before users are able to send transactions and interact with the wallet.
    
    It is open-source mainly being developed by [InputOutputGlobal](https://iohk.io/), the development company behind the **Cardano** protocol and also one of the three foundational entities of the **Cardano** project.

- [Yoroi](https://yoroi-wallet.com/#/) : **Yoroi Wallet** is the official **Cardano** light-wallet, It is available as a **mobile application** and as a **browser extension**. 
  
  A light-wallet means that users will not be forced to download the entire blockchain, Instead **Yoroi** hosts a backend server and downloads the blockchain data for the user without the user exposing sensitive data(**Private Keys**) to the server and ultimately maintaining security. This achieves a faster experience for the user due to the fact the user will not have to wait for minutes to hours before being able to use the wallet.

  It is open-source mainly being developed by [Emurgo](https://emurgo.io), A company based in [Japan](https://en.wikipedia.org/wiki/Japan) which focuses on Business and Enterprise adoption of the **Cardano** blockchain. It is also one of the three foundational entities of the **Cardano** project.

- [cardano-wallet](https://github.com/input-output-hk/cardano-wallet) : `cardano-wallet` is a [CLI (Command Line Interface)](https://en.wikipedia.org/wiki/Command-line_interface) application that provides **Cardano** wallet functionalities both via command-line parameters or via a [Web API](https://en.wikipedia.org/wiki/Web_API). 

 It is the wallet-backend that **Daedalus** wallet uses under-the-hood so it is also open-source, one of the many Haskell-based **Cardano** software components being written by [InputOutputGlobal](https://iohk.io/).

 You can find `cardano-wallet` **REST API** documentation here: [https://input-output-hk.github.io/cardano-wallet/api/edge/](https://input-output-hk.github.io/cardano-wallet/api/edge/)

- [cardano-cli](https://github.com/input-output-hk/cardano-node) : `cardano-cli` is also a [CLI (Command Line Interface)](https://en.wikipedia.org/wiki/Command-line_interface) application that provides **Cardano** wallet functionalities. But `cardano-cli` purpose is geared more towards general **Cardano** functionalities like generating **keys**, building and submitting **transactions**, managing **stake pools** certificates, simple blockchain queries like wallet address **UTXO** and more.

    It is part of the `cardano-node` project repository, so if you [compile and install](/docs/cardano-integration/installing-cardano-node) `cardano-node` you should also have `cardano-cli` as-well. It is one of the many Haskell-based **Cardano** software components being written by [InputOutputGlobal](https://iohk.io/).

:::warning
Always download the wallets from official sources. There are many fake wallets, malicious software pretending to be **Cardano** wallets that could potentially steal your tokens / assets.
:::

### Creating a wallet

As mentioned before, in this guide we will only be focusing on the `cardano-cli` and `cardano-wallet` since they provide some programmability which is important when we are talking about **Cardano** integrations for different kinds of use-cases.

:::note
Please make sure your `cardano-node` is synchronizing and connected to the `testnet` network before proceeding.
:::

#### Creating a wallet with `cardano-cli`

:::note
In this section, We will use the path `/home/user/cardano` to store all the `cardano-cli` related files as an example, please replace it with the directory you have choosen to store the files.

In a production environment, it might not be a good idea to store wallets / keys in a public server unless you know what you are doing.
:::

First, lets create a directory to store all our `keys` like so:

```bash
mkdir -p /home/user/cardano/keys
```

Make sure we are inside the `keys` directory `cd /home/user/cardano/keys`.

Next, we generate our **payment key-pair** using `cardano-cli`:

```bash
cardano-cli address key-gen \
--verification-key-file /home/user/cardano/keys/payment.vkey \
--signing-key-file /home/user/cardano/keys/payment.skey
```

`cardano-cli address key-gen` : generates a **payment key-pair**.

`--verification-key-file` : points to the path where you want to save the `vkey` file.

`--signing-key-file` : points to the path where you want to save the `skey` file.

You should now have two files in your `keys` directory like so: 

```bash
/home/user/cardano/keys/
├── payment.skey
└── payment.vkey

0 directories, 2 files
```

Lets try to understand what are these keys used for in a very high-level overview that is relevant to our topic:

- `.vkey` / **Public Verification Key** : Is used to derive a **Cardano** wallet address, a wallet address is basically the hash string value that you share to other users to provide them a way to send `ADA` / `tADA` or other assets in the **Cardano** blockchain into your wallet.
    ***The verification key file should look something like this***:
    ```json
    {
        "type": "PaymentVerificationKeyShelley_ed25519",
        "description": "Payment Verification Key",
        "cborHex": "582056a29cba161c2a534adae32c4359fda6f90a3f6ae6990491237b28c1caeef0c4"
    }
    ```

- `.skey` / **Private Signing Key** : Is used to sign / approve transactions for your wallet. As you can imagine, it is very important to not expose this file and must be kept secure.

    ***The signing key file should look something like this***:
    ```json
    {
        "type": "PaymentSigningKeyShelley_ed25519",
        "description": "Payment Signing Key",
        "cborHex": "58208c61d557e1b8ddd82107fa506fab1b1565ec76fe96e8fb19a922d5460acd5a5b"
    }
    ```

Since we now have our **payment key-pair**, the next step would be to generate a **wallet address** for the `testnet` network like so:

```bash
cardano-cli address build \
--payment-verification-key-file /home/user/cardano/keys/payment.vkey \
--out-file /home/user/cardano/keys/payment.addr \
--testnet-magic 1097911063
```

`cardano-cli address build` : Generates a **wallet address** from a `vkey` file.

`--payment-verification-key-file` : The path to the `vkey` file to be used for the derivation.

`--out-file` : The path to save the wallet address file.

`--testnet-magic` : The **NetworkMagic** of the network that where you want to use the wallet address.

You should now have `payment.vkey`, `payment.skey` and `payment.addr` in your `keys` directory. It should look something like this:

```bash
/home/user/cardano/keys/
├── payment.addr
├── payment.skey
└── payment.vkey

0 directories, 3 files
```

The `payment.addr` file contains the derived **wallet address** from your `vkey` file. It should look something like this:

```
addr_test1vz95zjvtwm9u9mc83uzsfj55tzwf99fgeyt3gmwm9gdw2xgwrvsa5
```

:::note
 If you want to create a wallet address to be used on `mainnet`, please use the `--mainnet` flag instead of `--testnet-magic 1097911063`. If you want to learn more about the different **Cardano** blockchain networks, please read the [Running cardano-node](/docs/cardano-integration/running-cardano#mainnet--production) guide.

 You can derive more than one **wallet address** from a **Public Verification Key** for more advanced use-cases using `cardano-addresses` component. Which we discuss in more details here: ***@TODO: link to article***

  - `mainnet` addresses are **prefixed** with the string value `addr1`. 
  - `testnet` addresses are **prefixed** with the string value `addr_test1`. 
:::

#### Querying the wallet **UTXO** with `cardano-cli`

Now that we have a **wallet address**, we can then query the **UTXO** of the address like so: 

```bash
cardano-cli query utxo \
--mary-era \
--testnet-magic 1097911063 \
--address $(cat /home/user/cardano/keys/payment.addr)
```

`cardano-cli query utxo` : Queries the wallet address **UTXO**.

`--mary-era` : Specifies that we want to query using the **Mary Era** rules.

`--testnet-magic 1097911063` : Specifies that we want to query the `testnet` **Cardano** network.

`--address $(cat /home/user/cardano/keys/payment.addr)` : The **wallet address** string value that we want to query, In this case we read the contents of `/home/user/cardano/keys/payment.addr` using the `cat` command and we pass that value to the `--address` flag. That means you could also directly paste the **wallet address** value like so: 
```
--address addr_test1vz95zjvtwm9u9mc83uzsfj55tzwf99fgeyt3gmwm9gdw2xgwrvsa5
```

You should see something like this:

```
    TxHash                                 TxIx        Amount
-----------------------------------------------------------------
```


Now you might find it odd that there is not much information in the output, but that is totally normal as there is no available **UTXO** in the specific **wallet address** that we have queried just yet as it is a new wallet.