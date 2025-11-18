---
id: overview
slug: /operate-a-stake-pool/
title: Operate a Stake Pool
sidebar_label: Overview
description: Operate a Cardano stake pool.
image: /img/og/og-developer-portal.png
---

![Cardano Operate a Stake Pool](../../static/img/card-operate-a-stake-pool-title.svg)

There are excellent guidelines available on how to set up cardano-node as a stake pool. You may even set one up without any prior Linux experience or concern for best practices. Simply copy and paste the commands from the instructions into your shell.

Unfortunately, simply getting your node up and running is insufficient. You must be able to manage, update, and safeguard it. To do so, you must first comprehend what you are doing [in one of the testnets](/docs/get-started/networks/testnets/overview). Consider this category an entry point into the Cardano Pool Operator Community.

## What are the prerequisites for persons who wish to learn how to run a stake pool?

- Knowledge of how to manage a server. You must be familiar with the operating system of your choosing in order to administer, maintain, and secure your server.
- This includes a thorough understanding of how networks operate, as well as how to backup and restore data.
- Experienced in interpreting documentation and implementing best practices.
- Understand Cardano, blockchain, wallets, and key pairs on a fundamental level.

## What if I don't meet the requirements?

If you don't meet all of the qualifications, you'll need a strong desire to study and the understanding that you won't be able to learn everything in a few weeks.

We observed people who had no prior knowledge of Linux, shells, or networking, but who were committed and had enough time to properly deal with it, and who now manage a profitable stake pool. It isn't for everyone, and it isn't going to be simple. Here are a few resources to get you started:

- [Start playing around with Linux](https://ubuntu.com/tutorials/command-line-for-beginners#1-overview).
- [Have a look at nix and NixOS](https://nixos.org).
- [Stake pool operator forum](https://forum.cardano.org/c/staking-delegation/156).

## Choose security over comfort

Best practices should always be a key consideration when running a stake pool. Security isn't something you can turn on or off or change in a configuration file. It is both an attitude and a way of life, therefore consider following the [security related topics with stake pool operators](https://forum.cardano.org/c/staking-delegation/stake-pool-security/157) on the Cardano Forum. Make sure to fully understand [Cardano Key Pairs](basics/cardano-key-pairs) in the basic category.

## Learn the basics

The basic category starts with learning about [relay and block producer topology](basics/stake-pool-networking), what the [hardware requirements](basics/hardware-requirements) are, which [keys are available](basics/cardano-key-pairs), which are hot and sensitive, and which you should never save on a server, no matter how convenient it is.  

:::tip info
If you would like to do a deep dive on technical concepts please visit [Consensus & Staking](/docs/operate-a-stake-pool/basics/consensus-staking) and [Core Concepts](../learn/core-concepts/)
:::

## Stake pool operator resources

- [Guild Operators](https://cardano-community.github.io/guild-operators), famous for their [CNTools](https://cardano-community.github.io/guild-operators/#/Scripts/cntools) and top-notch content.
- [CNCLI](https://github.com/cardano-community/cncli) is a collection of utilities to enhance and extend cardano-cli.
- [Jormanager](https://bitbucket.org/muamw10/jormanager/src/develop/) a Cardano stake pool management software.
- [Stake Pool Operator Scripts](https://github.com/gitmachtl/scripts) a collection of scripts to manage your stake pool step-by-step.
- [Coin Cashew Guides](https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node) for stake pool operators.
- [RaspberryPi with Docker](https://github.com/speedwing/cardano-staking-pool-edu) Full guide to build and run both testnet and mainnet Cardano stake pool with Docker on Raspberry Pi. [Youtube Playlist](https://www.youtube.com/playlist?list=PLBhbLwOuj0DfTnneuG3vyoDHY7Dv_aiyq)
- [TOPO Guide](https://es-kb.topopool.com/primeros-pasos). A friendly and complete guide to create a stake pool in Spanish
- [Cardano Course](https://cardano-course.gitbook.io/cardano-course/), a cardano-node and cardano-cli course by IOG.

## Stake pool operator channels

[**t.me/CardanoStakePoolWorkgroup**](https://t.me/CardanoStakePoolWorkgroup)  
Best practice workgroup on Telegram for stake pool operators. This group is hectic. A good resource to search for answers.

[**Cardano Forum - SPO**](https://forum.cardano.org/c/staking-delegation/156)  
If you care about well structured, long format discussions, visit the stake pool operator categories on [forum.cardano.org](https://forum.cardano.org/c/staking-delegation/156).
