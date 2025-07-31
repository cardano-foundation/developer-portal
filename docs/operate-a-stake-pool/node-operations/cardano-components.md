---
id: cardano-components
title: Cardano Components
sidebar_label: Cardano components
sidebar_position: 1
description: This article explains all the different Cardano components and their functions.
image: /img/og/og-getstarted-cardano-components.png
--- 

The Cardano blockchain is powered by a flock of inter-connected nodes. The [`cardano-node`](https://github.com/IntersectMBO/cardano-node) is the software capable of running as a core block producer, as a relay or as a local entry-point to the network. The node itself is made out of several inter-connected component parts:

- [`The settlement layer`](https://github.com/IntersectMBO/cardano-ledger#cardano-ledger): a multi-era ledger implementation derived from a set of formal specifications. This is where the core Cardano entities are defined as well as the rules for using them. This is the bedrock on top of which all other components build upon.

- [`The consensus layer`](https://github.com/IntersectMBO/ouroboros-consensus#ouroboros-consensus): an implementation of the consensus layer of the Ouroboros family of protocols. If you've heard about _"The Hard-Fork Combinator"_, this is where you can find it. For a high-level − albeit technical − introduction, have a look at [The Abstract Nature of The Consensus Layer](https://iohk.io/en/blog/posts/2020/05/28/the-abstract-nature-of-the-consensus-layer/).

- [`The networking layer`](https://github.com/IntersectMBO/ouroboros-network/#ouroboros-network): a peer-to-peer networking stack geared towards Proof-of-Stake systems. This includes a framework for writing typed protocols with supports for pipelining, multiplexing and various protections against adversarial peers.

- [`The scripting layer`](https://github.com/IntersectMBO/plutus#plutus-core): also known as _Plutus_, it is a scripting language embedded in the Cardano ledger to provide smart-contract capabilities to the network. At its core, it is a typed Lambda-Calculus which acts as low-level interpreted assembly code.
