---
id: overview
slug: /operate-a-stake-pool/
title: Operate a Stake Pool
sidebar_label: Overview
description: Operate a Cardano stake pool.
image: ./img/og-developer-portal.png
---

![Cardano Operate a Stake Pool](../../static/img/card-operate-a-stake-pool-title.svg)

There are excellent guides on how to get `cardano-node` as a stake pool up and running. You could even get one up without much Linux knowledge or worrying about best practices. Just copy the commands from the instructions and paste them into your shell.

Unfortunately, getting your node just up and running is not enough. You need to be able to maintain it, update it and keep it safe. To achieve this, you have to understand what you are doing. 

After you have mastered these basics, you also have to market your stake pool well to make it a success.

## What requirements should people meet who want to learn how to operate a stake pool? 
- Server administration skills. You need to know how to operate, maintain and secure your server with the operating system of your choice. 
- This includes a good understanding of how networks work, how to backup and restore systems.
- Familiar with reading documentation and adopting best practices.
- Have a basic understanding of Cardano, blockchain, wallets and key pairs. 

## What if I don't meet the requirements?
If you don't meet all of of the requirements, you need a strong will to learn and expect that you won't know it all in a few weeks. 

We saw people who had no idea about Linux, shells, networking, but they had commitment and enough time to deal with it properly and they run a successful stake pool today. It's not for everyone and it won't be easy. A few links to get you started:
- [Start playing around with Linux](https://ubuntu.com/tutorials/command-line-for-beginners#1-overview).
- [Have a look at nix and NixOS](https://nixos.org).
- [Choose security over comfort](#choose-security-over-comfort).
- [Complete the stake pool course](#stake-pool-course).
- [Stake pool operator forum](https://forum.cardano.org/c/staking-delegation/156).

## Choose security over comfort
When operating a stake pool, best practices should always be a top priority. Security is not a switch you can flip or a setting you make in a configuration file. It is a mindset and a lifestyle. 
- [Discuss security related topics with stake pool operators](https://forum.cardano.org/c/staking-delegation/stake-pool-security/157).

Learn to understand which keys there are, which are hot, sensitive and which you should never store on a server, even if it is convenient. 
- [Read about Cardano key pairs](cardano-key-pairs).


## Stake pool course
A walk through how to set up manage and maintain your stake pool to ensure optimal performance and profitability.
- [Start today with the stake pool course](../stake-pool-course/).

## Marketing your stake pool
If you are a stake pool operator, you may have already noticed that it is not enough to have a technically flawless stake pool running. 

You also have to build your pool around a brand that manages to attract enough stake (delegators) within the Cardano community. 
- [Read here for a few ideas on how you can do that](marketing-stake-pool).

## Stake pool operator resources
- [Guild Operators](https://cardano-community.github.io/guild-operators), famous for their [CNTools](https://cardano-community.github.io/guild-operators/#/Scripts/cntools) and top-notch content. 
- [Topology Updater](https://cardano-community.github.io/guild-operators/#/Scripts/topologyupdater) is intended to be a temporary solution to allow everyone to activate their relay nodes without having to postpone and wait for manual topology completion requests.
- [CNCLI](https://github.com/AndrewWestberg/cncli) is a collection of utilities to enhance and extend cardano-cli. 
- [Jormanager](https://bitbucket.org/muamw10/jormanager/src/develop/) a Cardano stake pool management software. 
- [Stake Pool Operator Scripts](https://github.com/gitmachtl/scripts) a collection of scripts to manage your stake pool step-by-step. 
- [Coin Cashew Guides](https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node) for stake pool operators.
- [Pool Veterinary](http://pool.vet) will help you see if your Cardano stake pool is working and find out why it may not be.
- [SPOCRA](https://members.spocra.io) includes the Stake Pool installation guide from the registered trade guild - Stake Pool Operator Collective Representation Assembly
