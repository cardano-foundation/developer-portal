---
id: overview
title: Stake Pool Operation
sidebar_label: Overview
description: Stake Pool Operation
image: ./img/og-developer-portal.png
---

![Cardano Operate a Stake Pool](../../static/img/card-stake-pool-course-title.svg)

This section covers the following:

* [How to promote a stake pool](../stake-pool-operation/marketing-stake-pool)
* [Stake pool course](../stake-pool-course/overview)
* How to secure your stake pool

## What is a stake pool

A stake pool is a Cardano node that runs along with other nodes within the Cardano blockchain network to participate in all important aspects such as validating blocks, generating new blocks and keeping the network secure. A stake pool is similar to a mining pool that includes the pooling of hash-rate in PoW blockchain systems. However, a stake pool is only available on PoS blockchains. A staking pool allows one or multiple ada holders to combine their staking power to increase the chances of earning rewards. When you create a staking pool, you participate in the process of verifying and validating new blocks to have a higher possibility of receiving the block rewards.

## Prerequisites

As a first step, a stake pool operator should [install a Cardano node](../cardano-integration/installing-cardano-node) and then start to [generate the stake pool registration certificate](https://docs.cardano.org/getting-started/operating-a-stake-pool/creating-keys-and-certificates)

For the hardware requirements, you need the following:
* 8 GB of RAM
* A network connection with 1 GB of bandwidth per hour
* A public IP4 address

For more information, you can read the article [A guide to becoming a stake pool operator](https://forum.cardano.org/t/a-guide-to-becoming-a-stake-pool-operator/36505).

## Why to create a stake pool

Basically, a stake pool operator (SPO) has the full responsibility in managing a stake pool that is created by him or together with different stakeholders that have decided to join the stake pool. The rewards of generating/validating new blocks will be split between many participants of the pool. This will allow stakeholders to delegate their stake to a stake pool in order to get a passive income without being responsible for the technical implementation and maintenance of setting up and running a stake pool.

Setting up and maintaining a stake pool needs time and different experiences from promoting their pool to being technically under the control of the running pool. Each time the stake pool is selected and generates a block that is added to the Cardano blockchain network, it earns rewards. These rewards are then shared between the stake pool operator and stake pool delegators.

## General metrics for SPOs

There are several metrics for running a stake pool that are covered in this section.

### Server uptime

If your stake pool is not online at the moment of minting a block, then your pool will not get rewards, so always be sure to stay online. Users who are delegating their stake to your pool can check if it has missed blocks by analyzing the luck metric over time. If this metric is lower than 100% that means your pool is missing blocks. In summary, if your pool is minting every block assigned to it, the luck metric will be close to 100%. The luck metric measures how many blocks a stake pool should generate. For example, if a prediction shows that a stake pool will generate 8 blocks, but during an epoch it generates 15, then the stake pool is considered lucky with a high luck metric that will attract more stake delegation.

### Fees

Fees are an important factor for your stake pool because to attract more stake delegators, you need to provide reasonable fees.
There are different types of fees that you can customize:
Fixed fee, is a pool's reward earned every 5 days. It is a fee that your stake pool gets for managing and maintaining the pool. The lowest possible fixed fee is 340 ADA.
Pool's margin, is the share that your stake pool gets from the total rewards before dividing them between stake delegators.

Note that users usually select a pool with the highest ranking or lowest fee. To find out more about the calculation of reward, please refer to the article [explanation of the reward calculation](https://docs.cardano.org/core-concepts/pledging-and-delegation-options).

### Stake and saturation

Users can always check the stake value before deciding to delegate their stake to your pool. It shows how much ADA has been delegated to your pool. The total amount of ADA that can be staked by a pool, the saturation limit, is around 64m ADA. It is critical to understand this point as a stake pool with a total stake higher than the network saturation limit will result in reducing rewards. When your stake pool reaches the maximum staking amount, it will be considered a saturated pool. After that, all stake delegators receive lower rewards than before saturation.  This fact motivates users to delegate to another stake pool with a smaller stake than yours to promote decentralization.

## Stake Pool Course
A walk through how to set up manage and maintain your stake pool to ensure optimal performance and profitability.

[Start today with the stake pool course](../stake-pool-course/overview).

## Marketing

A marketing approach for your stake pool with best practices of other SPOs.

[Promote your stake pool](../stake-pool-operation/marketing-stake-pool).

## Security
*FIXME* Content placeholder. Security above comforts and everything else.

## Resources

* [About stake pools, operators, and owners](https://docs.cardano.org/getting-started/operating-a-stake-pool/about-stake-pools)
* [Creating a stake pool](https://docs.cardano.org/getting-started/operating-a-stake-pool/creating-a-stake-pool)
* [Guidelines for operating large stake pools](https://docs.cardano.org/getting-started/guidelines-for-large-spos)
* [Establishing connectivity between core and relay nodes](https://docs.cardano.org/getting-started/operating-a-stake-pool/node-connectivity)
* [Operational certificates and keys](https://docs.cardano.org/getting-started/operating-a-stake-pool/creating-keys-and-certificates)
* [Public stake pools and metadata management](https://docs.cardano.org/getting-started/operating-a-stake-pool/public-stake-pools)
* [SMASH metadata management](https://docs.cardano.org/getting-started/operating-a-stake-pool/SMASH)
* [Stake pool performance](https://docs.cardano.org/getting-started/operating-a-stake-pool/performance)
* [Stake pool ranking](https://docs.cardano.org/getting-started/operating-a-stake-pool/ranking)
