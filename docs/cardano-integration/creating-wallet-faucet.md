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

- [Daedalus](https://daedaluswallet.io/) : **Daedalus Wallet** is the official **Cardano** full-node wallet, which is a [GUI (Graphical User Interface)](https://en.wikipedia.org/wiki/Graphical_user_interface) application for the Desktop (**Linux**, **MacOS**, **Windows**). That means that users will get to use a nice UI (User Interface), buttons and layout to interact with the **Cardano** blockchain.

    A full-node wallet basically means that it has to synchronize and download the blockchain first before users are able to send transactions and interact with the wallet.
    
    It is open-source mainly being developed by [InputOutputGlobal](https://iohk.io/), the development company behind the **Cardano** protocol and also one of the three foundational entities of the **Cardano** project.

- [Yoroi](https://yoroi-wallet.com/#/) : **Yoroi Wallet** is the official **Cardano** light-wallet, It is available as a **mobile application** and as a **browser extension**. 
  
  A light-wallet means that users will not be forced to download the entire blockchain, Instead **Yoroi** has a backend server and downloads the blockchain data for the user without the user exposing sensitive data(**Private Keys**) to the server and ultimately maintaining security. This achieves a faster experience for the user due to the fact the user will not have to wait for hours before being able to use the wallet.

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

:::important
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
--verification-key-file /home/user/cardano/keys/payment1.vkey \
--signing-key-file /home/user/cardano/keys/payment1.skey
```

`cardano-cli address key-gen` : generates a **payment key-pair**.

`--verification-key-file` : points to the path where you want to save the `vkey` file.

`--signing-key-file` : points to the path where you want to save the `skey` file.

You should now have two files in your `keys` directory like so: 

```bash
/home/user/cardano/keys/
├── payment1.skey
└── payment1.vkey

0 directories, 2 files
```

Lets try to understand what are these keys are used for in a very high-level overview that is relevant to our topic:

- `.vkey` / **Public Verification Key** : Is used to derive a **Cardano** wallet address, a wallet address is basically the hash string value that you share to other users to provide them a way to send `ADA` / `tADA` or other assets in the **Cardano** blockchain into your wallet.

    **The verification key file should look something like this**:
    ```json
    {
        "type": "PaymentVerificationKeyShelley_ed25519",
        "description": "Payment Verification Key",
        "cborHex": "582056a29cba161c2a534adae32c4359fda6f90a3f6ae6990491237b28c1caeef0c4"
    }
    ```

- `.skey` / **Private Signing Key** : Is used to sign / approve transactions for your wallet. As you can imagine, it is very important to not expose this file to the public and must be kept secure.

    **The signing key file should look something like this**:
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
--payment-verification-key-file /home/user/cardano/keys/payment1.vkey \
--out-file /home/user/cardano/keys/payment1.addr \
--testnet-magic 1097911063
```

`cardano-cli address build` : Generates a **wallet address** from a `vkey` file.

`--payment-verification-key-file` : The path to the `vkey` file to be used for the derivation.

`--out-file` : The path to save the wallet address file.

`--testnet-magic` : The **NetworkMagic** of the network that where you want to use the wallet address.

You should now have `payment1.vkey`, `payment1.skey` and `payment1.addr` in your `keys` directory. It should look something like this:

```bash
/home/user/cardano/keys/
├── payment1.addr
├── payment1.skey
└── payment1.vkey

0 directories, 3 files
```

The `payment1.addr` file contains the derived **wallet address** from your `vkey` file. It should look something like this:

```
addr_test1vz95zjvtwm9u9mc83uzsfj55tzwf99fgeyt3gmwm9gdw2xgwrvsa5
```

:::note
 You can derive more than one **wallet address** from a **Public Verification Key** for more advanced use-cases using `cardano-addresses` component. Which we discuss in more details here: ***@TODO: link to article***

  - `mainnet` addresses are **prefixed** with the string value `addr1`. 
  - `testnet` addresses are **prefixed** with the string value `addr_test1`. 


 If you want to create a wallet address to be used on `mainnet`, please use the `--mainnet` flag instead of `--testnet-magic 1097911063`. You can learn more about the different **Cardano** blockchain networks [here](/docs/cardano-integration/running-cardano#mainnet--production).
:::

#### Querying the wallet **UTXO** with `cardano-cli`

Now that we have a **wallet address**, we can then query the **UTXO** of the address like so: 

```bash
cardano-cli query utxo \
--mary-era \
--testnet-magic 1097911063 \
--address $(cat /home/user/cardano/keys/payment1.addr)
```

`cardano-cli query utxo` : Queries the wallet address **UTXO**.

`--mary-era` : Specifies that we want to query using the **Mary Era** rules.

`--testnet-magic 1097911063` : Specifies that we want to query the `testnet` **Cardano** network.

`--address $(cat /home/user/cardano/keys/payment1.addr)` : The **wallet address** string value that we want to query, In this case we read the contents of `/home/user/cardano/keys/payment1.addr` using the `cat` command and we pass that value to the `--address` flag. That means you could also directly paste the **wallet address** value like so: 
```
--address addr_test1vz95zjvtwm9u9mc83uzsfj55tzwf99fgeyt3gmwm9gdw2xgwrvsa5
```

You should see something like this:

```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```


Now you might find it odd that there is not much information in the result given by the command, but that is totally normal as there are no available **UTXO** in the specific **wallet address** that we have queried just yet as it is a new wallet.

Our next step is to request some `tADA` from the **Cardano Testnet Faucet**. **@TODO**

Once you requested some `tADA` from the **Cardano Testnet Faucet** we can then run the query again and you should see something like this:

```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85     0        1000000000 lovelace
```

This result tells us that there is one **UTXO (unspent transaction output)** with the amount of 1,000,000,000 `lovelaces` in our specific **wallet address**, that means our wallet has a balance of `1,000 tADA`. 

The result also specifies that the **UTXO** **transaction id** (`TxHash` / `TxId`) is `cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85` with the **transaction index** of `0`.

:::note
In the `mainnet` or `testnet`, the `lovelace` is the unit used to represent `ADA` in **transactions** and **UTXO**. 

Where `1 ADA` is equal to `1,000,000 lovelace`, so moving forward we will be using `lovelace` instead of `ADA` / `tADA`.

You can also use the `TxHash` to view the complete transaction via the **Cardano Blockchain Explorer** for the relevant network. You can check the specific transaction for the example **UTXO** here: [f3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85](https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85)

To learn more about **UTXO (unspent transaction output)** and how transactions work for the **UTXO Model**, we recommend watching this [lecture](https://youtu.be/EoO76YCSTLo?list=PLJ3w5xyG4JWmBVIigNBytJhvSSfZZzfTm&t=1854) by [Dr. Lars Brünjes](https://iohk.io/en/team/lars-brunjes), Education Director at [InputOutputGlobal](https://iohk.io).
:::

### Creating simple transactions

To have a clearer understanding of how sending transactions work using `cardano-cli`, first lets create another wallet like so:

**Generate payment key-pair**
```bash
cardano-cli address key-gen \
--verification-key-file /home/user/cardano/keys/payment2.vkey \
--signing-key-file /home/user/cardano/keys/payment2.skey 
```

**Generate wallet address**
```bash
cardano-cli address build \
--payment-verification-key-file /home/user/cardano/keys/payment2.vkey \
--out-file /home/user/cardano/keys/payment2.addr \
--testnet-magic 1097911063
```

Once complete you should have the following directory structure:

```bash
/home/user/cardano/keys
├── payment1.addr
├── payment1.skey
├── payment1.vkey
├── payment2.addr
├── payment2.skey
└── payment2.vkey

0 directories, 6 files
```

Querying the **UTXO** for the second wallet `payment2.addr` should give you a familiar result:

```bash
cardano-cli query utxo \
--mary-era \
--testnet-magic 1097911063 \
--address $(cat /home/user/cardano/keys/payment2.addr)
```

**UTXO Result**
```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```

Again, this is to be expected as the `payment2.addr` wallet address and keys has just recently been generated. So we expect that no one has sent any `tADA` to this wallet yet.

In this example, we now have two wallets. We can call them `payment1` and `payment2`. Now remember that we requested some `tADA` from the faucet for `payment1` wallet, and thats how we have the following:

`payment1` **wallet**: `1,000,000,000 lovelace`

```
UTXO
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85     0        1000000000 lovelace
```

`payment2` **wallet**: `0 lovelace`
```
UTXO
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```

Now let's say we want to send `250,000,000 lovelace` to `payment2` **wallet**, how can we achieve that?

We start by storing the current on-chain protocol parameters to a **JSON** file:

**Query Protocol Parameters**
```bash
cardano-cli query protocol-parameters \
  --testnet-magic 1097911063 \
  --mary-era \
  --out-file /home/user/cardano/protocol.json
```
This will produce a **JSON** file that looks something like this:
```json
{
    "poolDeposit": 500000000,
    "protocolVersion": {
        "minor": 0,
        "major": 4
    },
    "minUTxOValue": 1000000,
    "decentralisationParam": 0,
    "maxTxSize": 16384,
    "minPoolCost": 340000000,
    "minFeeA": 44,
    "maxBlockBodySize": 65536,
    "minFeeB": 155381,
    "eMax": 18,
    "extraEntropy": {
        "tag": "NeutralNonce"
    },
    "maxBlockHeaderSize": 1100,
    "keyDeposit": 2000000,
    "nOpt": 500,
    "rho": 3.0e-3,
    "tau": 0.2,
    "a0": 0.3
}
```


**Create draft transaction**

Next, we create a draft transaction like so:

```bash
cardano-cli transaction build-raw \
--tx-in cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85#0 \
--tx-out $(cat /home/user/cardano/keys/payment2.addr)+0 \
--tx-out $(cat /home/user/cardano/keys/payment1.addr)+0 \
--mary-era \
--fee 0 \
--out-file /home/user/cardano/tx.draft
```

`cardano-cli transaction build-raw` : This tells `cardano-cli` to build a raw transaction.

`--tx-in` : This specifices the **UTXO** input that the transaction will use, you can add as many **UTXO** input as you want by adding multiple `--tx-in` in the `cardano-cli` arguments as long as they have a unique `TxHash` and `TxIdx` within all your inputs.

`--tx-out` : This specifies the target **wallet address**, **assets** and **quantity** to be sent to. You can add as many **UTXO** outputs as you want as long as the total **UTXO** input can satisfy the **assets** and **quantity** specified by the output.

`--fee` : This specifies the fee amount of the transaction in `lovelace`.

`--out-file` : This is the path to the transaction file that will be generated.

In this case, we are just built a draft transaction to calculate how much fee would the transaction need. We can do that by executing the following command: 

```bash
cardano-cli transaction calculate-min-fee \
--tx-body-file /home/user/cardano/tx.draft \
--tx-in-count 1 \
--tx-out-count 2 \
--witness-count 1 \
--testnet-magic 1097911063 \
--protocol-params-file /home/user/cardano/protocol.json
```

You should see something like this for the output: 

```bash
174169 Lovelace
```

You will notice that we use the `protocol.json` we queried awhile ago to calculate the transaction fee:
```
--protocol-params-file /home/user/cardano/protocol.json
```

That is because the transaction fee calculation results changes depending on the on-chain protocol parameters.

The `--witness-count 1` basically tells `cardano-cli` that there will be only `1` **signing key** required for this transaction to be valid. Since the **UTXO** input involved in this transaction will only be coming from `payment1` wallet, so that means we indeed only need `1` key to sign the transaction.

We can then finally build the real transaction like so:

```bash
cardano-cli transaction build-raw \
--tx-in cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85#0 \
--tx-out $(cat /home/user/cardano/keys/payment2.addr)+250000000 \
--tx-out $(cat /home/user/cardano/keys/payment1.addr)+749825831 \
--mary-era \
--fee 174169 \
--out-file /home/user/cardano/tx.draft
```

To recap, We want to send `250,000,000 lovelace` from `payment1` wallet to `payment2` wallet. Our `payment1` wallet had the following **UTXO**:

```
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85     0        1000000000 lovelace
```

So we will use the `TxHash` `cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85` and `TxId` `0` as our `--tx-input`. 

```bash
--tx-in cf3cf4850c8862f2d698b2ece926578b3815795c9e38d2f907280f02f577cf85#0
```

We then tell `cardano-cli` that we the destination of the `250,000,000 lovelace` is the **wallet address** of `payment2`.

```bash
--tx-out $(cat /home/user/cardano/keys/payment2.addr)+250000000
```

Now, we still have `750000000 lovelace` as the change amount, so we will simply send it back to ourselves like so:

```bash
--tx-out $(cat /home/user/cardano/keys/payment1.addr)+749825831
```

Now an important question you might ask here is that, why is the amount `749825831 lovelace`? Well remember that we calculated the fee to be `174169 lovelace` and someone has to shoulder the transaction fee, so we decide that `payment` should pay for the fee with the change `lovelace` amount. So we calculate that `750000000 - 174169 = 749825831` and so the total change would be `749825831 lovelace`.

We then specify the transaction fee like so:

```
--fee 174169
```

And then we specify where we will save the transaction file:

```
--out-file /home/user/cardano/tx.draft
```

Now that we have the transaction file, we must sign the transaction in-order to prove that we are the owner of the input **UTXO** that was used.

```bash
cardano-cli transaction sign \
--tx-body-file /home/user/cardano/tx.draft \
--signing-key-file /home/user/cardano/keys/payment1.skey \
--testnet-magic 1097911063 \
--out-file /home/user/cardano/tx.signed
```

`--signing-key-file /home/user/cardano/keys/payment1.skey` : This argument tells the `cardano-cli` that we will use `payment1.skey` to sign the transaction.

Finally, we submit the transaction to the blockchain!

```bash
cardano-cli transaction submit \
--tx-file /home/user/cardano/tx.signed \
--testnet-magic 1097911063 
```
:::important
If you have waited too long to sign and submit the transaction, the fees might've changed during that time and therefore the transaction might get rejected by the network. To solve this, you simply have to **recalculate the fees, rebuild the transaction, sign it and submit it**!
:::

Checking the balances of both wallets `payment1` and `payment2`:

```bash
# payment1 wallet UTXO
❯ cardano-cli query utxo --mary-era --testnet-magic 1097911063 --address $(cat ~/cardano/keys/payment1.addr)

                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
63eeeb7e43171aeea0b3d53c5a36236cf9af92d5ee39e99bfadfe0237c46bd91     1        749825303 lovelace

# payment2 wallet UTXO
❯ cardano-cli query utxo --mary-era --testnet-magic 1097911063 --address $(cat ~/cardano/keys/payment2.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
63eeeb7e43171aeea0b3d53c5a36236cf9af92d5ee39e99bfadfe0237c46bd91     0        250000000 lovelace
```

As we can, `payment2` now has a **UTXO** with the amount of `250,000,000 lovelace` with the change returned to `payment1` and has generated a new **UTXO** with the amount of `749,825,303 lovelace` as-well.

Congratulations, You have created and sent your first **Cardano** transaction! 🎉🎉🎉
### Cardano Wallet
### Cardano Testnet Faucet
**@TODO**



