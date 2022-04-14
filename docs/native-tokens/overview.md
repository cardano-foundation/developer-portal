---
id: overview
slug: /native-tokens/
title: Discover Native Tokens
sidebar_label: Overview
description: Discover Cardano's native tokens. 
image: ../img/og-developer-portal.png
---

![Cardano Discover Native Tokens](../../static/img/card-native-tokens-title.svg)

:::note
There are currently two ways to make your NFTs:

- For the not-so-tech-savvy through someone else. The [showcase section](../../showcase/?tags=nft) has a few services that offer this.
- For the more tech-savvy on a Cardano node. If you want to have full control over your tokens, you need to mint them **yourself**. And this is what this section is all about.

Minting requires a certain amount of skill in navigating and working with Linux through the terminal and a running Cardano node.

We will not go into how to spin up a Cardano node, but this is covered in the [integrate Cardano category](../get-started/installing-cardano-node).
:::

## What are native tokens/assets?

The Cardano Blockchain has the unique ability to create, interact with, and delete bespoke tokens (or 'assets') natively. In this example, native means that, in addition to sending and receiving the official currency ada, you may interact with custom assets right out of the box - without the use of smart contracts.

Native assets can practically be treated as ada in every sense because the capability is already built-in. Of course, there are some limitations (which we'll discuss later), but you can think of native assets as a way to produce your own custom for the time being.

## What you need to know 
Before we go any further, here's a quick rundown of what you need to know.

### How we interact with the blockchain
Almost all interactions with the Cardano network/blockchain are transaction-based. We can divide interactions into two tiers with this in mind.

![img](../../static/img/nfts/overview_nfts.svg)

The top layer emphasizes a visual approach and covers standard interaction. Sending and receiving ada or tokens, delegating your stake, and voting are all examples of this. Wallets such as the full node Daedalus wallet or the lighter Yoroi wallet can be used to carry out these interactions.

However, if we want to drill down and have more options for interacting and creating "custom" interactions, we must go one step deeper. We'll need a whole node in this layer to send transactions with specified parameters. A full node is often a built binary from the official latest cardano-node repository. There are more options, but we'll concentrate on the Linux version.

So, what kinds of sophisticated transactions can we create with a full node, and how can we do it? Working on the command line and issuing transactions from there is the current method. Stake pool operators must utilize this method of transaction to register their stake pool or make changes to their commitment, among other things. However, we may utilize this method to produce, send, receive, and burn tokens.

In the future, this probably will also be the place where smart contracts are written, tested, and maybe executed if there isn't a visual frontend.

### Constraints when working with tokens

Since we already learned that interaction with the network is almost always a transaction, we need to be aware of a few things enforced through network parameters.

1. A fee must always be paid whether issuing a transaction or sending something. Currently, the cost is determined by the size of the transaction (read: how much "information" gets sent). The size of a transaction can range from a simple "A transmits 2 ada to B" to a considerably more sophisticated transaction with additional metadata.
2. There is a minimum value that must be sent. Currently, the value is set to 1 ada. This means that if we wish to send a token, we must include at least one ada in the transaction. This is to avoid huge amounts of custom tokens from being created and the network being flooded with custom token transactions.
3. We currently (June 2021) have no standard way to define an NFT. There is an [open pull request](https://github.com/cardano-foundation/CIPs/pull/85), however. Most of the current NFTs on Cardano mostly follow the proposed structure, as we will in this section.

Please keep those constraints in mind if you want to work with native assets.

## Difference between "regular" token and NFTs

In terms of technology, there isn't much of a distinction between "regular" tokens/native assets and NFTs. This is due to the fact that both can be produced using the cardano node cli and are native assets.

Unlike fungible native assets, which might consist of millions of interchangeable tokens, an NFT is a single native asset that cannot be re-minted or destroyed, and it exists on the blockchain in perpetuity.
