---
id: about-cardano
title: About Cardano
sidebar_label: About Cardano
description: About Cardano
image: ./img/og-developer-portal.png
--- 

The Cardano node is the core component that underpins the Cardano network. Ultimately, a blockchain network is just a collection of interconnected nodes, all working together to validate transactions and blocks by means of consensus. The definition of consensus for any given network varies, but for the Cardano network it’s defined by the Ouroboros protocol.

## Understanding Consensus

Consensus is the process by which a majority opinion is reached by everyone who is involved in running the blockchain. Agreement must be made on which blocks to produce, which chain to adopt, and to determine the single state of the network. The consensus protocol determines how individual nodes assess the current state of the ledger system and reach a consensus. It has three main responsibilities; to perform a leader check and decide if a block should be produced, to handle chain selection, and to verify blocks that are produced.

Blockchains create consensus by allowing participants to bundle transactions that others have submitted to the system in _blocks_, and add them to their _chain_ (sequence of blocks). Determining who is allowed to produce a block when, and what to do in case of conflicts, (such as two participants adding different blocks at the same point of the chain), is the purpose of the different consensus protocols. Our ground-breaking proof-of-stake consensus protocol [Ouroboros](https://iohk.io/en/blog/posts/2020/06/23/the-ouroboros-path-to-decentralization/) is proven to have the same security guarantees that proof of work has. Rigorous security guarantees are established by Ouroboros and it was delivered with several peer-reviewed papers that were presented in top-tier conferences and publications in the area of cybersecurity and cryptography. Different [implementations of Ouroboros](https://iohk.io/en/blog/posts/2020/03/23/from-classic-to-hydra-the-implementations-of-ouroboros-explained/) have been developed. For further details on each flavour of Ouroboros, you can read the technical specifications for [Classic](https://iohk.io/en/research/library/papers/ouroborosa-provably-secure-proof-of-stake-blockchain-protocol/), [Byzantine Fault Tolerance (BFT)](https://iohk.io/en/research/library/papers/ouroboros-bfta-simple-byzantine-fault-tolerant-consensus-protocol/), [Genesis](https://iohk.io/en/research/library/papers/ouroboros-genesiscomposable-proof-of-stake-blockchains-with-dynamic-availability/), [Praos](https://iohk.io/en/research/library/papers/ouroboros-praosan-adaptively-securesemi-synchronous-proof-of-stake-protocol/), and more recently the scalability solution [Hydra](https://eprint.iacr.org/2020/299.pdf).

## Stake pools

By running a Cardano node, users participate in and contribute to the network.

A stake pool is a reliable server node that focuses on maintenance and holds the combined stake of various stakeholders in a single entity. Stake pools are responsible for processing transactions and producing new blocks and are at the core of Ouroboros, the Cardano proof-of-stake protocol.

To be secure, Ouroboros requires a good number of ada holders to be online and maintaining sufficiently good network connectivity at any given time. This is why Ouroboros relies on stake pools, entities committed to run the protocol 24/7, on behalf of the contributing ada holders.

While Ouroboros is cheaper to run than a proof of work protocol, running Ouroboros still incurs some costs. Therefore, stake pool operators are rewarded for running the protocol in the form of incentives that come from the transaction fees and from inflation of the circulating supply of ada.

## How Are New Blocks Produced?

The goal of blockchain technology is the production of an independently-verifiable and cryptographically-linked chain of records (blocks). A network of block producers works to collectively advance the blockchain. A consensus protocol provides transparency and decides which candidate blocks should be used to extend the chain.

Submitted valid transactions might be included in any new block. A block is cryptographically signed by its producer (the stake pool) and linked to the previous block in the chain. This makes it impossible to delete transactions from a block, alter the order of the blocks, remove a block from the chain (if it already has a number of other blocks following it), or to insert a new block into the chain without alerting all the network participants. This ensures the integrity and transparency of the blockchain expansion.

### Slots and Epochs

The Cardano blockchain uses the Ouroboros Praos protocol to facilitate consensus on the chain.

Ouroboros Praos divides time into epochs. Each Cardano epoch consists of a number of slots, where each slot lasts for one second. A Cardano epoch currently includes 432,000 slots (5 days). In any slot, zero or more block-producing nodes might be nominated to be the slot leader. On average, one node is expected to be nominated every 20 seconds, for a total of 21,600 nominations per epoch. If randomly elected slot leaders produce blocks, one of them will be added to the chain. Other candidate blocks will be discarded.

### Slot Leader Election

The Cardano network consists of a number of stake pools that control the aggregated stake of their owners and other delegators, also known as stakeholders. Slot leaders are elected randomly from among the stake pools. The more stake the pool controls, the greater the chance it has of being elected as a slot leader to produce a new block that is accepted into the blockchain. This is the concept of proof-of-stake (PoS).

### Transaction Validation

When validating a transaction, a slot leader needs to ensure that the sender has included enough funds to pay for that transaction and must also ensure that the transaction’s parameters are met. Assuming that the transaction meets all these requirements, the slot leader will record it as a part of a new block, which will then be connected to other blocks in the chain.