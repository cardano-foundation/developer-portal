---
id: introduction-to-cardano
title: (Re)introduction into Cardano
sidebar_label: (Re)introduction into Cardano
description: "Stake pool course: (Re)introduction into Cardano."
image: ./img/og-developer-portal.png
---

Developing Cardano is no small feat. There is no other project that has ever been built to these parameters, combining peer reviewed cryptographic research with an implementation in highly secure Haskell code. 

This is not the copy and paste code seen in so many other blockchains. Instead, Cardano was designed with input from a large global team including leading experts and professors in the fields of computer programming languages, network design and cryptography. 

We are extremely proud of Cardano, which required a months-long meticulous and painstaking development process by our talented engineers.

## Why Cardano?
If you haven't seen it yet, watch the legendary whiteboard video from 2017. Some details are a bit outdated, but it is still worth seeing to understand what Cardano is and where Cardano came from.

<iframe width="100%" height="325" src="https://www.youtube.com/embed/Ja9D0kpksxw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Understanding Consensus

Consensus is the process by which a majority opinion is reached by everyone who is involved in running the blockchain. Agreement must be made on which blocks to produce, which chain to adopt, and to determine the single state of the network. The consensus protocol determines how individual nodes assess the current state of the ledger system and reach a consensus. It has three main responsibilities; to perform a leader check and decide if a block should be produced, to handle chain selection, and to verify blocks that are produced.

Blockchains create consensus by allowing participants to bundle transactions that others have submitted to the system in _blocks_, and add them to their _chain_ (sequence of blocks). Determining who is allowed to produce a block when, and what to do in case of conflicts, (such as two participants adding different blocks at the same point of the chain), is the purpose of the different consensus protocols. Our ground-breaking proof-of-stake consensus protocol [Ouroboros](https://iohk.io/en/blog/posts/2020/06/23/the-ouroboros-path-to-decentralization/) is proven to have the same security guarantees that proof of work has. Rigorous security guarantees are established by Ouroboros and it was delivered with several peer-reviewed papers that were presented in top-tier conferences and publications in the area of cybersecurity and cryptography. Different [implementations of Ouroboros](https://iohk.io/en/blog/posts/2020/03/23/from-classic-to-hydra-the-implementations-of-ouroboros-explained/) have been developed. For further details on each flavour of Ouroboros, you can read the technical specifications for [Classic](https://iohk.io/en/research/library/papers/ouroborosa-provably-secure-proof-of-stake-blockchain-protocol/), [Byzantine Fault Tolerance (BFT)](https://iohk.io/en/research/library/papers/ouroboros-bfta-simple-byzantine-fault-tolerant-consensus-protocol/), [Genesis](https://iohk.io/en/research/library/papers/ouroboros-genesiscomposable-proof-of-stake-blockchains-with-dynamic-availability/), [Praos](https://iohk.io/en/research/library/papers/ouroboros-praosan-adaptively-securesemi-synchronous-proof-of-stake-protocol/), and more recently the scalability solution [Hydra](https://eprint.iacr.org/2020/299.pdf).

## Stake Pools

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

## The Big Picture

Learn fundamental terms like blockchain, consensus, decentralization delegation and incentives. Understand the big picture of Cardano and why stake pools are so important. 

<iframe width="100%" height="325" src="https://www.youtube.com/embed/zJUJG6V0Y1o" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> 
<br/><br/>  

:::tip questions or suggestions?
If you have any questions and suggestions while taking the lessons please feel free to [ask in the Cardano forum](https://forum.cardano.org/c/staking-delegation/setup-a-stake-pool/158) and we will respond as soon as possible. 
:::

## Ouroboros Protocol

### Consensus

Blockchains require an agreement mechanism between the participants of the network on how to add new transactions to the ledger and its state at any given moment. This mechanism is known as a consensus protocol.

The goal of the consensus protocol is to ensure that only one chain is adopted and followed, otherwise, the system would collapse immediately.

### The Proof-of-work consensus algorithm

Bitcoin implemented a Proof-of-work consensus algorithm. In this protocol, for a new block to be added to the blockchain, the node that attempts it must provide a proof-of-work, which is expressed by the solution of a mathematical puzzle. This process is known as mining.

The node that solves the puzzle gets the right to create the new block and is rewarded for it.

This scheme puts all nodes into a race against each other, and since only one node is rewarded, wastes a lot of computational power and energy.

Such waste has raised concerns about the Bitcoin’s environmental impact. Currently, the Bitcoin mining process consumes as much energy as countries like the Netherlands or Iceland.

Apart from the environmental concerns, the rewards scheme of the proof-of-work algorithm has also led to the centralization of the Bitcoin network. Up to 75% of the Bitcoin network computing power is located in China. And a single player, Bitmain, controls over 40% of the network hash rate.

The underlying problem is that Bitcoin makes a clear distinction between the actual users of the network and the miners. Owning Bitcoins does not grant you any control over the network, nor any power over the decisions on the evolution of it. The system is controlled by a small pool of developers and miners.

### Ouroboros, a Proof-of-stake consensus algorithm

In Ouroboros, there is no race between stakeholders to produce a block. Instead, a slot leader is randomly selected, proportionally to the amount of tokens he owns (the stake), to get the opportunity to produce a new block.

So it is not hashing power what gives you the opportunity to produce a new block (and get rewarded for it), it is your stake what increases your chances to be elected.

Since there is no race to mine a block, there is no waste of energy or computational resources. In that sense, Ouroboros is a more efficient and cheaper protocol to run than Bitcoin’s proof-of-work, while keeping all the security guarantees.

### What if you are not online? (Stake pools)

To produce a block you have to be online, but asking everyone to be online at every moment is impractical and unrealistic. This is why Ouroboros introduces the figure of _Stake Delegation_. As stakeholder, you can delegate your stake to a third party to act on your behalf whenever you are elected slot leader. Such delegates are known as _staking pools_. They are members of the community that commit to run the protocol on your behalf and to be online close to 100% of the time.

An important thing to notice is that you only delegate your rights to participate in the protocol, not your actual funds. Your ada are still secure and under your control in your wallet, and funds are not locked, you can still make transactions.

### What about the incentives?

Stakeholders that issue blocks are incentivized to participate in the protocol by collecting transaction fees. But Ouroboros does not incentivize stakeholders to invest computational resources to issue blocks. Rather, availability and transaction verification are prefered.

Rewards come from two sources: transaction fees and funds drawn from the ada Reserve.

In Ouroboros, incentives are not block-dependant, instead, rewards from an epoch are collected in a pool and distributed among the stakeholders and stake pools that participated during these slots proportional to their stake.

In the case of stake pools, those get a fraction of the rewards to cover operational costs and a profit margin. The rest is distributed among the pool members, including the pool owners, proportionally to the stake that they contributed to the pool.

To participate in the protocol, you can choose a staking pool or choose to act on your own at any moment creating your own stake pool.

### What if for some reason there is a fork? 

Given that stakeholders are not always online, they come and go (a.k.a. dynamic availability), and sometimes they are offline for long periods, it is important for them to be able to resynchronize with the correct chain when they come back online.

The key feature of Ouroboros Genesis is that thanks to a unique chain selection rule, it allows new or re-joining parties to synchronize to the “good chain” with only a trusted copy of the genesis block. This makes the protocol secure against the so-called “long-range attack”.

### Self-produced randomness 

Making the slot leader selection fair and secure **(staking procedure)** requires a good source of randomness.

Ouroboros protocol (specifically Ouroboros Praos and Ouroboros Genesis) incorporates a Global Random Oracle feature that produces new and fresh randomness at every epoch.

This is achieved by the implementation of a Verifiable Random Function. When evaluated with the key of a stakeholder, It returns a random value which is stored in every new block produced. The hashing of all values from the previous epoch becomes the random seed for the staking procedure. The blockchain itself becomes its source of new randomness.

This is why the protocol is named Ouroboros, the snake that eats its own tail.

### Promoting decentralization 

Finally, the Ouroboros incentives mechanism promotes the decentralization of the system in a better way than Proof-of-work does. Because Ouroboros considers two key scenarios:

In one hand, a staking pool can only act as a delegate if it represents a certain number of stakeholders whose aggregate stake exceeds a given threshold, for example, 0.1% of all the stake in the blockchain. This prevents a fragmentation attack, where someone tries to affect the performance of the protocol by increasing the delegates population.

At the same time, when the aggregate stake of a stake pool grows beyond a certain threshold, rewards become constant. This makes that particular stake pool less attractive since stakeholders would not be maximizing their rewards. For example, if the threshold is set to 1%, a stake pool with a stake of 2% would gain the same rewards as other that has a stake of only 1%.

All these functionalities make Ouroboros the best proof of stake ledger protocol to date. And its only implementation is currently in the Cardano blockchain.

## How it works 

1. **Time** is divided into epochs and slots and begins at Genesis. At most one block is produced in every slot. Only the slot leader can sign a block for a particular slot.
2. **Register:** The first thing a user needs to do to participate in the protocol is registering to:
    1. a network to synchronize with the ledger
    2. a global clock that indicates the current slot
    3. a global random oracle that produces random values \(v\) and delivers them to the user
3. **Staking procedure**
    1. At the beginning of every epoch, the online stakeholders fetch \(from the blockchain\) the **stake distribution** from the last block of 2 epochs ago. For example, if the current epoch is epoch 100, the stake distribution used is the distribution as it was in the last block of epoch 98.
    2. **Random Oracle**: Is a hashing function that takes the random values “v” \(included in each block by the slot leader for this purpose\) from the first ⅔ slots in previous epoch and hash them together and use it as the random seed to select the slot leaders.
    3. Stakeholders evaluate with their **secret key** the **Verifiable Random Function \(VRF\)** at every slot. If the output value \(v\) is below a certain threshold, the party becomes slot leader for that block.
        1. **Certificate:** The **VRF** produces two outputs: **a random value \(v\)** and a **proof \(π\)** that the slot leader will include in the block he produces to certify that he is the legitimate slot leader for that particular slot.
        2. Slot leader performs the following duties
        3. Collects the transactions to be included in his block.
        4. Includes in his block the random value \(v\) and proof \(π\) obtained from the VRF output.
        5. Before broadcasting the block, the slot leader generates a new secret key **\(Key-evolving signature\)**. The public key remains the same, but the secret key is updated in every step and the old key is erased.
        6. It is impossible to forge old signatures with new keys. And it is also impossible to derive previous keys from new ones.
        7. Finally, the slot leader broadcast the new block to the network.
        8. The **rewards** obtained by the slot leaders are calculated at the end of the epoch. Rewards come from transaction fees and funds from the ada reserve.

**What happens in the case of a fork in the chain?**

A key aspect of the procedure described above is that from time to time, it will produce slots without a slot leader and slots with multiple slot leaders. Meaning that nodes might receive valid chains from multiple sources. To determine which chain to adopt, each party collects all valid chains and applies the Chain Selection Rule. The same thing is done by users that have been offline for a while and need to synchronize with the blockchain.

The node filters all valid chains (chains whose signatures are consistent with the genesis block and with the keys recorded in the Key Evolving Signature protocol, the variable random function and the global random oracle.

Then applies the Chain Selection Rule: pick the longest chain as long as it grows more quickly (is denser) in the slots following the last common block to both competing chains.

This chain selection rule allows for a party that joins the network at any time to synchronize with the correct blockchain, based only on a trusted copy of the genesis block and by observing how the chain grows for a sufficient time.

## Reference material

[Ouroboros: A Provably Secure Proof-of-Stake Blockchain Protocol](https://eprint.iacr.org/2016/889.pdf)

[Ouroboros Praos: An adaptively-secure, semi-synchronous proof-of-stake blockchain](https://eprint.iacr.org/2017/573.pdf)

[Ouroboros Genesis: Composable Proof-of-Stake Blockchains with Dynamic Availability](https://eprint.iacr.org/2018/378.pdf)

## Video: What’s an Ouroboros and how you cook it?

<iframe width="100%" height="325" src="https://www.youtube.com/embed/U92Ks8rucDQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>