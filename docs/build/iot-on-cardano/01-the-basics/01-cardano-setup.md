---
id: 01-cardano-setup
title: Cardano Setup
sidebar_label: 01 - Cardano Setup
description: Install Yoroi, switch to the Preprod testnet, create a wallet, and request tADA from the faucet.
---

Set up a Cardano wallet on the Preprod testnet so the workshops have somewhere to send and receive funds. The workshops use [Yoroi](https://yoroi-wallet.com/), but any Cardano wallet that supports Preprod will work.

## Install Yoroi

Yoroi is a browser-extension and mobile wallet for Cardano. Head to the [Yoroi website](https://yoroi-wallet.com/) and install the extension for your browser.

## Create a wallet

After installing the extension, click **Create Wallet** in the extension. You will set a password and be shown a recovery phrase. Back up the recovery phrase somewhere safe - anyone who has it controls the wallet.

- Create a fresh wallet for these workshops; don't reuse a mainnet wallet.
- Write down the recovery phrase and never share it.

## Request tADA

tADA is the testnet version of ADA, used to pay fees on Preprod.

1. **Switch to Preprod.** Open Yoroi → Settings → Switch Network → **Preprod Testnet**. An orange banner at the top confirms you're on Preprod.
2. **Copy your receive address.** Wallet → Receive tab → copy the address (starts with `addr_test1...`).
3. **Hit the faucet.** Go to [docs.cardano.org/cardano-testnets/tools/faucet](https://docs.cardano.org/cardano-testnets/tools/faucet), select **Preprod Testnet** as environment, **Receive test ADA** as action, paste your address, and click **Request funds**.

Within a few seconds, the faucet sends 10,000 tADA to your wallet. That's more than enough for every workshop in this section.

## Sending and Receiving tADA

Now that you have tADA in your wallet, practise sending and receiving - you'll need this flow constantly when testing IoT projects that interact with the chain.

:::tip CardanoThings PingPong wallet
For testing transaction flows on Preprod, send tADA to the CardanoThings **PingPong** wallet - it auto-refunds your transaction (minus the network fee) within ~60 seconds. Perfect for exercising flows without finding a friend with a Preprod wallet.

Address: `addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w`

Preprod-only.
:::

To send tADA: open Yoroi → **Send** tab, paste the recipient address (use the PingPong address above to test), enter an amount, confirm. The transaction takes a few seconds to land.

## Checking Transactions

Once you've sent or received tADA, verify it on a block explorer using the transaction hash.

### What is a transaction hash (txhash)?

A transaction hash (or txhash, transaction ID) is a unique identifier for a single transaction on the chain - a fingerprint. On Cardano they're 64-character hexadecimal strings (no `0x` prefix), e.g.:

```
d4d57c0339eb955c4c5f80d87779bbf6b820aa0387b2349adf2f7c7ce074c909
```

Every Cardano transaction has a unique txhash you can use to look up its details.

### Finding your transaction hash

In Yoroi:

1. Go to the **Transactions** tab.
2. Click any transaction in the list.
3. The transaction details panel includes the txhash (64-char hex string).
4. Copy the txhash.

### Looking up transactions on CardanoScan

Once you have a txhash, look it up on [Preprod CardanoScan](https://preprod.cardanoscan.io/):

1. Go to [preprod.cardanoscan.io](https://preprod.cardanoscan.io/).
2. Paste the txhash into the search bar.
3. The transaction view shows:
   - Sender and receiver addresses
   - Amount transferred
   - Transaction fee
   - Block number and timestamp
   - Status (confirmed / pending)

This is especially useful when testing IoT projects - you can verify that transactions were sent and received as expected.

CardanoScan is the most popular explorer, but several others work too: [Adastat](https://adastat.net/), [Cexplorer](https://cexplorer.io/), [pool.pm](https://pool.pm/). They differ in features and UI but all let you look up transactions, addresses, and other on-chain data.

## Further Resources

- [Yoroi Wallet](https://yoroi-wallet.com/) - install page.
- [Cardano Testnets faucet](https://docs.cardano.org/cardano-testnets/tools/faucet) - get tADA on Preprod.
- [Cardano.org](https://cardano.org/) - official Cardano site.
- [Preprod CardanoScan](https://preprod.cardanoscan.io/) - block explorer for the Preprod testnet.
- [Adastat](https://adastat.net/) - explorer for transactions, addresses, blockchain data.
- [Cexplorer](https://cexplorer.io/) - detailed blockchain explorer (transactions, addresses, epochs).
- [pool.pm](https://pool.pm/) - explorer + NFT viewer.
- [Lido Nation](https://lidonation.com/) - articles and resources on Cardano and blockchain in general.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/01-basics/cardano-setup) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-01](https://github.com/CardanoThings/Workshops/tree/main/Workshop-01).*
