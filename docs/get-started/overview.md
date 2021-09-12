---
id: overview
slug: /get-started/
title: Get Started
sidebar_label: Overview
description: Get Started
image: ./img/og-developer-portal.png
--- 
![Cardano Get Started](../../static/img/card-get-started-title.svg)

Welcome to the Cardano Developer Portal. This content is for technical people; if you are looking for a Cardano wallet please head to the [showcase section](../../showcase).

It is noteworthy to mention that the Developer Portal covers everything you can do **today** on the Cardano **mainnet**. 

## What is Cardano? 
Cardano is a collection of [open-source](https://en.wikipedia.org/wiki/Open_source), patent-free protocols. It's a platform that enables you to store, transform, and manage value, identity, and governance. Cardano follows research not opinions or bias.

## How did it start?
Cardano started as a significant research and development project in 2015, and it took almost two years of research to get to a position to start writing code. 

The purpose of Cardano was to ask: How can we build a sustainable financial and social operating system for billions of people? What collections of technologies do we need to bring together to get everything at an affordable cost?

Besides cryptographic research, there was game-theoretic research, identity-management research, and programming-language research. This academic rigor process produced more than 100 academic papers. Most were accepted in cryptography conferences like Eurocrypt and Asiacrypt and went through the standard peer-review process. For example, the paper [“Ouroboros: A Provably Secure Proof-of-Stake Blockchain Protocol”](https://eprint.iacr.org/2016/889.pdf) was one of [the most cited security papers from 2015-2019](https://sweis.medium.com/most-cited-security-papers-from-2015-2019-d21515db3681). 

## What you need to bring
To get the most out of the Cardano Developer Portal, you should  have programming experience and a basic understanding of blockchain concepts of Cardano such as [UTxO](technical-concepts#unspent-transaction-output-utxo), [transactions](technical-concepts#transactions), [addresses](technical-concepts#addresses), [key derivation](technical-concepts#key-derivation), and [networking](technical-concepts#networking). 

If you are unfamiliar with these terms, start with [technical concepts](technical-concepts), and you can complete the [stake pool course](../operate-a-stake-pool/#stake-pool-course) afterward. It will also help you understand basic concepts, even if you don't want to run a stake pool. 

## Cardano is different 
If you have experience with other smart contract platforms and want to start building on Cardano, it is vital to know its differences:

- It makes sense to get your head around the [concept of UTxO](technical-concepts#unspent-transaction-output-utxo) and later [the extended UTxO model](https://iohk.io/en/blog/posts/2021/03/11/cardanos-extended-utxo-accounting-model/).
- [Tokens on Cardano](../native-tokens/) are not built with smart contracts. Instead, tokens are native and live on the ledger. The protocol treats them as first-class citizens, like ada. It is quite different from our peers that don’t have native tokens and need to use a smart contract to send tokens. 
- [Native tokens](../native-tokens/) use the core infrastructure, and the network has to do everything else instead of running a smart contract and calling a method called 'transfer'. On Cardano, you are sending a standard transaction. This removes a layer of extra complexity and the risk of human mistakes, as the ledger handles all token-related functions.
- [Smart contracts](../smart-contracts/) work different on Cardano because of the [eUTxO model](https://iohk.io/en/blog/posts/2021/03/11/cardanos-extended-utxo-accounting-model/). Misconceptions were floating around suggesting [that Cardano only supports one transaction per block](https://sundaeswap-finance.medium.com/concurrency-state-cardano-c160f8c07575).

## What you can do on Cardano today
- You can send and receive [native tokens](../native-tokens/), including ada.
- You can delegate your ada to one of the [existing pools](../../showcase?tags=pooltool) and earn rewards.
- You can [vote with your ada](../fund-your-project/project-catalyst#participate-as-a-voter) to distribute over a billion dollars worth of ada from the treasury to fund community-driven proposals on [Project Catalyst](../fund-your-project/project-catalyst).
- You can earn ada rewards by [voting on proposals](../fund-your-project/project-catalyst#participate-as-a-voter). 
- You can participate in the [Cardano Improvement Proposals](technical-concepts#cardano-improvement-proposals-cip) (CIP) process.
- You can interact with [smart contracts](../smart-contracts/).

## Why build on Cardano?
- Cardano offers a better infrastructure to build products because it is faster, more secure, and cost-effective.
- Cardano offers accurate cost predictability when it comes to transactions. There are no auctions for transaction fees.
- Cardano has an energetic community and more than one million wallets. If you stick to specific standards, we are keen to try out and engage with new products. Participating now makes you a first mover.
- Cardano brings its venture fund. If you build on Cardano you can get [your project funded](../fund-your-project/). Every 6 to 8 weeks, projects can be proposed, discussed, and voted on by the Cardano community.
- Cardano is a proof-of-stake blockchain. By design, it consumes much less energy and computational power.
- Cardano is built with the rigor of high-assurance formal development methods. The consensus mechanism [Ouroboros](https://cardano.org/ouroboros/) was delivered with several peer-reviewed papers presented in top-tier conferences and publications in cybersecurity and cryptography. If you build on Cardano, you build on this foundation.

## What you can build on Cardano today
- You can [integrate Cardano](../integrate-cardano) into existing websites and services.
- You can issue [native tokens](../native-tokens/) and [NFTs](../native-tokens/minting-nfts).
- You can add [metadata to transactions](../transaction-metadata/) to give transactions a story, a background or even an identity. 
- You can prove the existence of a file, text or any other data at a specific point in time with [transaction metadata](../transaction-metadata/). You can even use [transaction metadata](../transaction-metadata/) to validate and verify external physical products and genuine articles.
- You can [setup, manage and maintain a stake pool](../operate-a-stake-pool/) on Cardano.
- You can [create smart contracts](../smart-contracts/).