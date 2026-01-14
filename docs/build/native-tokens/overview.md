---
id: overview
title: Discover Native Tokens
sidebar_label: Overview
description: Discover Cardano's native tokens.
image: /img/og/og-developer-portal.png
---

![Cardano Discover Native Tokens](/img/card-native-tokens-title.svg)

:::note
There are currently two ways to make your NFTs:

- For the less tech-savvy: through someone else. There are various [NFT minting services](https://cardano.org/apps/?tags=nft) in the Cardano ecosystem that offer this.
- Tech-savvy users can issue NFTs on a Cardano node. If you want to have full control over your tokens, you need to mint them **yourself**. And this is what this section is all about.

Minting requires a certain amount of skill in navigating and working with Linux through the terminal and a running Cardano node.

We will not go into how to spin up a Cardano node, but this is covered in the [integrate Cardano category](/docs/get-started/infrastructure/node/installing-cardano-node).
:::

## What are Native Tokens?

Cardano is a **multi-asset ledger**. The blockchain natively supports creating and transferring custom tokens alongside ada. Unlike Ethereum where each token requires a smart contract (ERC-20/ERC-721), Cardano tokens are first-class citizens tracked directly by the ledger.

This means:
- **No smart contracts needed** for basic token operations (minting, sending, burning)
- **Lower fees** since you're not executing contract code for transfers
- **Same security guarantees** as ada, tokens benefit from ledger-level validation

:::tip Conceptual Foundation
Native tokens work within Cardano's [UTXO model](/docs/learn/core-concepts/eutxo). Each UTXO can hold ada plus any number of native tokens bundled together. Understanding UTXOs helps explain why tokens always travel with ada (minimum UTXO requirement) and how minting policies control token creation.

For the full conceptual background, see [Assets & Tokens](/docs/learn/core-concepts/assets).
:::

## Prerequisites

Before minting tokens, you should understand:

- **[Addresses](/docs/learn/core-concepts/addresses)**: Where your tokens will live
- **[Transactions](/docs/learn/core-concepts/transactions)**: How minting transactions work
- **[Transaction Fees](/docs/learn/core-concepts/fees)**: What minting costs

Don't have time to read everything? The minting guides explain concepts as needed, linking back to these pages for deeper understanding.

## What You Need to Know 
Before we go any further, here's a quick rundown of what you need to know.

### How we interact with the blockchain
Almost all interactions with the Cardano network/blockchain are transaction-based. We can divide interactions into two tiers with this in mind.

![img](/img/nfts/overview_nfts.png)

The top layer emphasizes a visual approach and covers standard interaction. Sending and receiving ada or tokens, delegating your stake, and voting are all examples of this. Wallets such as the full node Daedalus wallet or the lighter Yoroi wallet can be used to carry out these interactions.

However, if we want to drill down and have more options for interacting and creating "custom" interactions, we must go one step deeper. We'll need a whole node in this layer to send transactions with specified parameters. A full node is often a built binary from the official latest cardano-node repository. There are more options, but we'll concentrate on the Linux version.

So, what kinds of sophisticated transactions can we create with a full node, and how can we do it? Working on the command line and issuing transactions from there is the current method. Stake pool operators must utilize this method of transaction to register their stake pool or make changes to their commitment, among other things. However, we may utilize this method to produce, send, receive, and burn tokens.

In the future, this probably will also be the place where smart contracts are written, tested, and maybe executed if there isn't a visual frontend.

### Constraints When Working with Tokens

Since interaction with the network is almost always a transaction, be aware of these network-enforced constraints:

1. **Transaction fees** must always be paid. The cost depends on transaction size. More data (metadata, multiple tokens, etc.) means higher fees. See [Transaction Fees](/docs/learn/core-concepts/fees) for how fees are calculated.

2. **Minimum UTXO value**: Every output must contain a minimum amount of ada (roughly 1-1.5 ADA depending on what's in the output). This means tokens always travel together with some ada. See [Minimum Ada Requirement](/docs/learn/core-concepts/assets#minimum-ada-requirement) for details.

3. **NFT metadata standards**: The community has established standards for NFT metadata through [CIP-25](https://cips.cardano.org/cip/CIP-25) and [CIP-68](https://cips.cardano.org/cip/CIP-68) (newer standard with reference tokens).

Keep these constraints in mind when working with native assets.

## Difference Between Fungible Tokens and NFTs

Technically, there isn't much distinction between fungible tokens and NFTs, both are native assets created the same way.

The difference is in how they're used:
- **Fungible tokens**: Millions of interchangeable units
- **NFTs**: Unique tokens with quantity of 1

For a deeper explanation of fungibility and how minting policies enforce uniqueness, see [Fungible vs Non-Fungible Tokens](/docs/learn/core-concepts/assets#fungible-vs-non-fungible-tokens).

---

## Learn More

import DocCardList from '@theme/DocCardList';

<DocCardList />
