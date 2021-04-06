---
id: ouroboros-protocol
title: Ouroboros Protocol
sidebar_label: Ouroboros Protocol
description: Ouroboros Protocol
image: ./img/og-developer-portal.png
--- 

## Consensus

Blockchains require an agreement mechanism between the participants of the network on how to add new transactions to the ledger and its state at any given moment. This mechanism is known as a consensus protocol.

The goal of the consensus protocol is to ensure that only one chain is adopted and followed, otherwise, the system would collapse immediately.

## The Proof-of-work consensus algorithm <a id="ade6"></a>

Bitcoin implemented a Proof-of-work consensus algorithm. In this protocol, for a new block to be added to the blockchain, the node that attempts it must provide a proof-of-work, which is expressed by the solution of a mathematical puzzle. This process is known as mining.

The node that solves the puzzle gets the right to create the new block and is rewarded for it.

This scheme puts all nodes into a race against each other, and since only one node is rewarded, wastes a lot of computational power and energy.

Such waste has raised concerns about the Bitcoin’s environmental impact. Currently, the Bitcoin mining process consumes as much energy as countries like the Netherlands or Iceland.

Apart from the environmental concerns, the rewards scheme of the proof-of-work algorithm has also led to the centralization of the Bitcoin network. Up to 75% of the Bitcoin network computing power is located in China. And a single player, Bitmain, controls over 40% of the network hash rate.

The underlying problem is that Bitcoin makes a clear distinction between the actual users of the network and the miners. Owning Bitcoins does not grant you any control over the network, nor any power over the decisions on the evolution of it. The system is controlled by a small pool of developers and miners.

### Ouroboros, a Proof-of-stake consensus algorithm. <a id="9e48"></a>

In Ouroboros, there is no race between stakeholders to produce a block. Instead, a slot leader is randomly selected, proportionally to the amount of tokens he owns \(the stake\), to get the opportunity to produce a new block.

So it is not hashing power what gives you the opportunity to produce a new block \(and get rewarded for it\), it is your stake what increases your chances to be elected.

Since there is no race to mine a block, there is no waste of energy or computational resources. In that sense, Ouroboros is a more efficient and cheaper protocol to run than Bitcoin’s proof-of-work, while keeping all the security guarantees.

### What if you are not online? \(Stake pools\) <a id="7855"></a>

To produce a block you have to be online, but asking everyone to be online at every moment is impractical and unrealistic. This is why Ouroboros introduces the figure of _Stake Delegation_. As stakeholder, you can delegate your stake to a third party to act on your behalf whenever you are elected slot leader. Such delegates are known as _staking pools_. They are members of the community that commit to run the protocol on your behalf and to be online close to 100% of the time.

An important thing to notice is that you only delegate your rights to participate in the protocol, not your actual funds. Your ADA are still secure and under your control in your wallet, and funds are not locked, you can still make transactions.

### What about the incentives? <a id="9175"></a>

Stakeholders that issue blocks are incentivized to participate in the protocol by collecting transaction fees. But Ouroboros does not incentivize stakeholders to invest computational resources to issue blocks. Rather, availability and transaction verification are prefered.

Rewards come from two sources: transaction fees and funds drawn from the Ada Reserve.

In Ouroboros, incentives are not block-dependant, instead, rewards from an epoch are collected in a pool and distributed among the stakeholders and stake pools that participated during these slots proportional to their stake.

In the case of stake pools, those get a fraction of the rewards to cover operational costs and a profit margin. The rest is distributed among the pool members, including the pool owners, proportionally to the stake that they contributed to the pool.

To participate in the protocol, you can choose a staking pool or choose to act on your own at any moment creating your own stake pool.

### What if for some reason there is a fork? <a id="4d6a"></a>

Given that stakeholders are not always online, they come and go \(a.k.a. dynamic availability\), and sometimes they are offline for long periods, it is important for them to be able to resynchronize with the correct chain when they come back online.

The key feature of Ouroboros Genesis is that thanks to a unique chain selection rule, it allows new or re-joining parties to synchronize to the “good chain” with only a trusted copy of the genesis block. This makes the protocol secure against the so-called “long-range attack”.

### Self-produced randomness <a id="82e5"></a>

Making the slot leader selection fair and secure **\(staking procedure\)** requires a good source of randomness.

Ouroboros protocol \(specifically Ouroboros Praos and Ouroboros Genesis\) incorporates a Global Random Oracle feature that produces new and fresh randomness at every epoch.

This is achieved by the implementation of a Verifiable Random Function. When evaluated with the key of a stakeholder, It returns a random value which is stored in every new block produced. The hashing of all values from the previous epoch becomes the random seed for the staking procedure. The blockchain itself becomes its source of new randomness.

This is why the protocol is named Ouroboros, the snake that eats its own tail.

### Promoting decentralization <a id="5128"></a>

Finally, the Ouroboros incentives mechanism promotes the decentralization of the system in a better way than Proof-of-work does. Because Ouroboros considers two key scenarios:

In one hand, a staking pool can only act as a delegate if it represents a certain number of stakeholders whose aggregate stake exceeds a given threshold, for example, 0.1% of all the stake in the blockchain. This prevents a fragmentation attack, where someone tries to affect the performance of the protocol by increasing the delegates population.

At the same time, when the aggregate stake of a stake pool grows beyond a certain threshold, rewards become constant. This makes that particular stake pool less attractive since stakeholders would not be maximizing their rewards. For example, if the threshold is set to 1%, a stake pool with a stake of 2% would gain the same rewards as other that has a stake of only 1%.

All these functionalities make Ouroboros the best proof of stake ledger protocol to date. And its only implementation is currently in the Cardano blockchain.

![Ouroboros protocol](https://github.com/cardano-foundation/stake-pool-school-handbook/tree/3abbeae984eb17aab3778e922956e72ae1cd702a/.gitbook/assets/ouroborosprotocol-blueprint-vertical.jpg)

## How it works <a id="9621"></a>

1. **Time** is divided into epochs and slots and begins at Genesis. At most one block is produced in every slot. Only the slot leader can sign a block for a particular slot.
2. **Register:** The first thing a user needs to do to participate in the protocol is registering to:
3. the network, to synchronize with the ledger;
4. global clock, that indicates the current slot;
5. a global random oracle that produces random values \(v\) and delivers them to the user.
6. **Staking procedure**

3.1 At the beginning of every epoch, the online stakeholders fetch \(from the blockchain\) the **stake distribution** from the last block of 2 epochs ago. For example, if the current epoch is epoch 100, the stake distribution used is the distribution as it was in the last block of epoch 98.

3.2 **Random Oracle**: Is a hashing function that takes the random values “v” \(included in each block by the slot leader for this purpose\) from the first ⅔ slots in previous epoch and hash them together and use it as the random seed to select the slot leaders.

3.3 Stakeholders evaluate with their **secret key** the **Verifiable Random Function \(VRF\)** at every slot. If the output value \(v\) is below a certain threshold, the party becomes slot leader for that block.

1. **Certificate:** The **VRF** produces two outputs: **a random value \(v\)** and a **proof \(π\)** that the slot leader will include in the block he produces to certify that he is the legitimate slot leader for that particular slot.
2. Slot leader performs the following duties
3. Collects the transactions to be included in his block.
4. Includes in his block the random value \(v\) and proof \(π\) obtained from the VRF output.
5. Before broadcasting the block, the slot leader generates a new secret key **\(Key-evolving signature\)**. The public key remains the same, but the secret key is updated in every step and the old key is erased.
6. It is impossible to forge old signatures with new keys. And it is also impossible to derive previous keys from new ones.
7. Finally, the slot leader broadcast the new block to the network.
8. The **rewards** obtained by the slot leaders are calculated at the end of the epoch. Rewards come from transaction fees and funds from the ADA reserve.

**What happens in the case of a fork in the chain?**

A key aspect of the procedure described above is that from time to time, it will produce slots without a slot leader and slots with multiple slot leaders. Meaning that nodes might receive valid chains from multiple sources. To determine which chain to adopt, each party collects all valid chains and applies the Chain Selection Rule. The same thing is done by users that have been offline for a while and need to synchronize with the blockchain.

The node filters all valid chains \(chains whose signatures are consistent with the genesis block and with the keys recorded in the Key Evolving Signature protocol, the variable random function and the global random oracle.

Then applies the Chain Selection Rule: pick the longest chain as long as it grows more quickly \(is denser\) in the slots following the last common block to both competing chains.

This chain selection rule allows for a party that joins the network at any time to synchronize with the correct blockchain, based only on a trusted copy of the genesis block and by observing how the chain grows for a sufficient time.

## Reference material

[Ouroboros: A Provably Secure Proof-of-Stake Blockchain Protocol](https://eprint.iacr.org/2016/889.pdf)

[Ouroboros Praos: An adaptively-secure, semi-synchronous proof-of-stake blockchain](https://eprint.iacr.org/2017/573.pdf)

[Ouroboros Genesis: Composable Proof-of-Stake Blockchains with Dynamic Availability](https://eprint.iacr.org/2018/378.pdf)

## Video: What’s an Ouroboros and how you cook it?

<iframe width="100%" height="325" src="https://www.youtube.com/embed/U92Ks8rucDQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>