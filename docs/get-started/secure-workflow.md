---
id: secure-workflow
title: Secure Transaction Workflow
sidebar_label: Secure Transaction Workflow
description: Procedures for using private keys separately from the Internet.
image: /img/og/og-security-secure-transaction-workflow.png
--- 

This general guide is written to help Cardano stake pool operators and developers keep to one simple rule:

:::warning

Payment keys can never be stored, even for a moment, on an Internet connected machine.

:::

Therefore we present a secure, standard workflow for this sequence of `cardano-cli` commands for a simple, single transaction for funds transfer:

  - **[Create Simple Transaction](/docs/get-started/create-simple-transaction)** (*insecure* version)

Once you feel comfortable doing a simple transaction securely, you'll also be able to use it to securely execute these more complex transactions as well:

  - [Minting Native Assets](../native-tokens/minting)
  - [Minting NFTs](../native-tokens/minting-nfts)
  - [Registering a Stake Address](/docs/operate-a-stake-pool/register-stake-address)
  - [Registering a Stake Pool](/docs/operate-a-stake-pool/register-stake-pool)

### A model for a secure transaction

All transactions will be done in these 3 steps:

1.  on Internet connected computer:
      - **Assemble** all transaction details (from Cardano node or other query) in a file & save it to a removable device.
2.  in [air gap environment](./air-gap):
      - **Build** information from this file into a signed transaction & save the Tx file back on the same device (note `Tx` = "transaction").
3.  on Internet connected computer:
      - **Upload** the Tx file to your Cardano node and submit it.

Therefore, the payment signing key (the private component of the [Cardano wallet address key pair](../operate-a-stake-pool/cardano-key-pairs#wallet-address-key-pairs)) **never leaves the air gap environment**. This is vital because:

  - A standard assumption in security is that *any* Internet connection on *any* computer creates opportunities for malicious people or programs to copy, view, or modify *anything* unencrypted on that computer.
  - Unlike transactions with cryptocurrency wallet software, in which the wallet's private payment keys are carefully encrypted and securely managed, the payment key (in this documentation, `payment.skey`) used for the raw transactions of development & stake pool operations is *not encrypted*.
  - This means that this file stored anywhere on your Internet connected computer or server, even for an instant, creates an opportunity for the funds at that address (`payment.addr`) to be ***lost***.

## Prerequisites

### Your [air gap environment](./air-gap)

Follow [these instructions](./air-gap) to procure the environment (usually a dedicated "air gap machine") if you haven't already.

### Move any existing keys inside the air gap

Second, if you've been running your applications, token/NFT generation, or stake pool with keys stored on any Internet connected machine (whether desktop or server):

  - Move all those keys onto the air gap host and [securely delete](../get-started/air-gap#install-secure-deletion-tools) the originals.
  - Also, seriously consider whether those resources should be rebuilt due to the exposure of those private keys.

To simplify the commands below, this guide assumes you will store all your keys and addresses *in the same single directory* where you will be building your transactions.

### Dedicate a memory stick to moving your Tx files

Format a memory stick on a machine you believe to be secure, and then (to be on the safe side) format it again on the air gap machine. Some ideas:

  - The objective here is to avoid bringing malicious software from your host computer into the air gap environment, especially via viruses that are designed to propagate by memory sticks.
  - Use a filesystem that will be compatible with your regular Internet connected machine *and* your air gapped Linux environment: the one most likely to be writable by all types of desktop is FAT32.

## Steps of a secure transaction

This is rewritten from page [Create Simple Transactions](/docs/get-started/create-simple-transaction) (only considered secure to run on a testnet) with the following exception:

  - [Determining the TTL (time to Live)](/docs/get-started/create-simple-transaction#determine-the-ttl-time-to-live-for-the-transaction) for the transaction is omitted, along with setting this value in the transaction itself, to simplify the information-gathering step.
  - This poses no security risk since an omitted TTL value allows a Tx file to be used indefinitely *but* submitting that Tx will change the UTxO set so that submitting that transaction again will be impossible.

Also note that in general your "Internet connected machine" and your "Cardano node" will be two separate systems, and you will have to transfer files from one to the other with programs like [`rsync`](https://linux.die.net/man/1/rsync).

  - So if you're running your Cardano node on a home machine (or using the Daedalus node port, for instance), where it says "upload" you only have to copy such files to where you can access them on that node.

### 1\. *Assemble* all transaction details.

On your Internet-connected computer (usually your Cardano node, though you might use query services instead):

#### Get protocol parameters

Get the protocol parameters and save them to `protocol.json` with:

``` sh
cardano-cli query protocol-parameters \
    --mainnet \
    --out-file protocol.json
```

#### Get the transaction hash and index of the **UTXO** to spend:

Here `payment.addr` is the Cardano address you will be paying from, which may be stored on your insecure machine:

``` sh
cardano-cli query utxo \
    --address $(cat payment.addr) \
    --mainnet
```

Copy or redirect the output of this last command to a *scratch file* of your choice.

Then copy both this file and `protocol.json` to the transfer memory stick.

### 2\. *Build* Tx details into a signed transaction.

Attach your transfer memory stick to the air gap host and copy the files to your working directory:

  - `protocol.json`
  - your scratch file

#### Draft the transaction

Create a draft for the transaction and save it in `tx.draft`. Notes:

  - As in the insecure example, `payment2.addr` is the address you're sending a payment *to*, while `payment.addr` (holding the UTxO where the funds are coming *from*), will store the "change" from this transaction.
  - For `--tx-in` we use the following syntax: `TxHash#TxIx` where `TxHash` is the transaction hash and `TxIx` is the index.
  - For `--tx-out` we use: `TxOut+Lovelace` where `TxOut` is the hex encoded address followed by the amount in `Lovelace`.
  - For the transaction draft, the `--tx-out` amounts and `--fee` can be set to zero.
  - The values after `--tx-in` are taken from the output of `cardano-cli query utxo` that you saved in your scratch file.

``` sh
cardano-cli transaction build-raw \
    --tx-in 4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99#4 \
    --tx-out $(cat payment2.addr)+0 \
    --tx-out $(cat payment.addr)+0 \
    --invalid-hereafter 0 \
    --fee 0 \
    --out-file tx.draft
```

#### Calculate the fee

The generally simplest transaction needs one input (a valid UTXO from `payment.addr`) and two outputs:

1. The address that receives the transaction.
2. The address that receives the change of the transaction.

Note that to calculate the fee you need to include the draft transaction:

``` sh
cardano-cli transaction calculate-min-fee \
    --tx-body-file tx.draft \
    --tx-in-count 1 \
    --tx-out-count 2 \
    --witness-count 1 \
    --byron-witness-count 0 \
    --mainnet \
    --protocol-params-file protocol.json
```

#### Calculate the change to send back to `payment.addr`

All amounts must be in Lovelace:

    expr `UTXO BALANCE` - `AMOUNT TO SEND` - `TRANSACTION FEE`

For example, if we send 10 ada from a UTxO containing 20 ada, the change to send back to `payment.addr` after paying the fee is: 9.832035 ada:

``` sh
expr 20000000 - 10000000 - 167965
9832035
```

#### Build the transaction

We write the transaction in a file; we will name it `tx.raw`:

``` sh
cardano-cli transaction build-raw \
    --tx-in 4e3a6e7fdcb0d0efa17bf79c13aed2b4cb9baf37fb1aa2e39553d5bd720c5c99#4 \
    --tx-out $(cat payment2.addr)+10000000 \
    --tx-out $(cat payment.addr)+9832035 \
    --fee 167965 \
    --out-file tx.raw
```

#### Sign the transaction

Sign the transaction with the signing key `payment.skey` and save the signed transaction in `tx.signed`:

``` sh
cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --mainnet \
    --out-file tx.signed
```

Save the `tx.signed` file back on the transfer memory stick, then [safely remove](https://help.ubuntu.com/stable/ubuntu-help/files-removedrive.html.en) the memory stick from the air gap machine.
### 3\. **Upload** and submit the Tx file.

Reattach your transfer memory stick back to the Internet connected computer, then upload the `tx.signed` file to your Cardano node.

#### Submit the transaction

Log into your Cardano node (or prepare Daedalus if using its node) and execute:

``` sh
cardano-cli transaction submit \
    --tx-file tx.signed \
    --mainnet
```

Then check for a successful transaction by whatever means you prefer, e.g. as illustrated in [Check the balances](/docs/get-started/create-simple-transaction#check-the-balances).

## FAQ

### Why can't I use `cardano-cli transaction build`?

This is a convenient command to avoid the ["change" (return UTxO) calculation](../get-started/secure-workflow#calculate-the-change-to-send-back-to-paymentaddr) which requires you to prepare a test transaction, estimate fees, and calculate a final value of the funds to be moved. Instead, `transaction build` sends back "change" to a designated address.

Some consider this so much easier to use that ***all*** transactions should be performed with this command, as discussed here:

  - [Please use `cardano-cli transaction build` instead of `cardano-cli transaction build-raw`](https://forum.cardano.org/t/please-use-cardano-cli-transaction-build-instead-of-cardano-cli-transaction-build-raw/94919)

However, this discussion revealed the undocumented condition that `transaction build` can only be done on a **live** Cardano node. The community in general doesn't know the reasons for this (with some speculation in the thread above), so in the meantime:

  - Using `transaction build` would require, in addition to accumulating the UTxO and balance information from your live Cardano node or network environment to build your transaction, that you also run the `build` command in the networked environment as well and save the unsigned transaction file on your transfer media.
  - This transaction file would then need to be copied from the live environment to the air gap environment, where it would be signed... but in a security paranoid environment the user could never be sure the transaction was not built or modified maliciously outside the air gap.

Therefore this guide suggests *only* assembling transaction *details* outside the air gap, to be applied to `cardano-cli transaction build-raw` inside the air gap, because there is not much more convenience overall in using `transaction build` while perhaps introducing some security risk.

## Other pending topics in secure workflow

These are not directly related to transactions, and will all eventually be addressed in their own pages on the Developer Portal:

  - pool key installation & updates: transferring keys (e.g. VRF and KES) securely from within the air gap to your stake pool block producer
  - making encrypted backups of your private keys (so they can be kept offsite / stored outside your air gap environment)
  - keeping secure (encrypted) records of your stake pool & development resources

For ideas on secure backup & record-keeping, see [Get Started with the Frankenwallet > Making & verifying backups of assets & keys](/docs/operate-a-stake-pool/frankenwallet#making--verifying-backups-of-assets--keys).
