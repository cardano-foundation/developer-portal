---
id: overview
title: Cardano Metadata Registry
sidebar_label: Overview
---

Disclaimer: This instruction was written in june 2021 and content may be subject to change in the future.

## What are Native Tokens / Assets?

The Cardano Blockchain features a very unique ability to create, interact and destroy custom tokens (or so called 'assets') in a native way.
Native in this case means besides sending, and recieving the 'official currency' ada you are also able to interact with custom assets out of the box - without the need for smart contracts.

The functionality is already built in and native assets can almost be treated like ada in every way. There are some constraints (which we will cover later) but for now you can imagine native assets as a possibility to generate your own, custom 

## What you need to know 
Here's a brief overview what you need to know before we dive in any deeper.

### How we interact with the blockchain
Pretty much every interaction with the Cardano network / blockchain comes down to a transaction. With this in mind we can break interactions down into two layers.

![img](../../static/img/nfts/overview_nfts.svg)

The top layer is more focused on a visual approach and covers regular interaction. 
This includes sending and recieving ada or tokens, delegation your stake or voting. All of those interactions can be done through wallets like the full node Daedalus wallet or the more lightweight Yoroi wallet.

But if we want to drill down and have more possibilites to interact and make more "custom" interactions we need to go one layer below. 
In this layer we need a full node to issue transactions with custom parameters. 
A full node is - most of the time - a compiled binary of the official latest cardano-node repository. There are alternatives out there but we'll focus on the linux version.

So what kind of advanced transactions can we build with a full node and how?
The current way is to work with the command line and issue your transactions from there. 
Stake pool operators need to use this way of making transactions to - for example - register their stake pool or make adjustments to their pledge etc.
But we can also use this way to create, send, recieve or burn token.

In the future this probably will also be the place where smart contracts are written, tested and maybe exectured if there isn't a visual frontend.

### Constraints when working with tokens

Since we already learnt that interaction with the network is almost always a transaction we need to be aware of a few things which are enforced through network parameters.

1. Issuing a transaction and sending something always requires a fee to be paid. 
As of now the fee depends on the size of the transaction (read: how much "information" gets sent). The size varies from a simple transaction like "A sends 2 ADA to B" to much more complex transaction which may have additional metadata attached to them.
2. There is a minimum value which needs to be sent. The value is currently set to 1 ada. This means if we want to send token we at least need to include 1 ADA to the transaction. This is to prevent creating large sums of custom tokens and spamming the network with custom token transactions.

Keep those constraints in mind if you want to work with native assets

## Difference between "regular" token and NFTs

Native assets can be created with a transaction issued through the cardano node cli.
The transaction gets supplied by additional parameters (which we will go through in more detail in the [Minting native assets](minting)) section.

## Minting NFTs
Minting NFTs takes the same approach like minting "regular" tokens with a little twist. 
We need to solve two problems:
1. We need to make a token really "non-fungible"
2. We need to attach more information to the token, such as maybe an link to an image (most of the time an IPFS hash) or other details and attributes we want our token to have.

So - how to make a token really "non-fungible" there should be only one version of it and we need to make sure it can't be re-minted.
How do we achieve such a thing?

Minting policies offer an option to define time constraints. Those constraints get evaluated if a transaction is issued. If the evaluation fails, the transaction fails.
We can - for example - specify who can mint an token before a given point in time (described by a certain block number) or after. 


