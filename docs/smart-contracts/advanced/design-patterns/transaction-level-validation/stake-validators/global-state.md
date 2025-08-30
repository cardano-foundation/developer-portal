---
id: global-state
title: Global State Validators
sidebar_label: Global State Validators
description: Facilitates true global state based DApps on Cardano. 
---

Since the release of smart contracts on Cardano, smart contract developers have struggled with the constraints of the local state based DApp architecture.

Here we propose a design pattern that facilitates true global state based DApps on Cardano.

Keep in mind that this is not supposed to be some production dream global state panacea. Just a fun black magic proof of concept that lets you design some interesting Dapps that
simply are not possible without global state.

## Global State utilizing the account component of our hybrid UTxO / Account based ledger

You can use a stake script to store 1 bit of "global state", so you can use a list of `n` stake scripts to store `n` bits of global state. Scripts must be executed for register
and deregister in Conway (right now only deregistration requires script execution, registration can be done by anyone) so you can use the scripts to enforce conditions on the
transition of the global state (the n bit sequence). All the stake scripts controlling the registration and deregistration for the stake credentials associated with the `n` bits
of global state must defer their logic to a single independent stake validator that is responsible for validating transitions of the global state (determining whether a given user
transaction that registers / deregisters some number of the stake scripts ie flips some number of the bits is valid). This validator manages the global state.

For a simple 1 bit example:

We design a smart contract that succeeds if the number of DEX orders processed in the given block is even and fails if it is odd. In this case the global state is just 1
boolean that tracks whether the current number of genius yield orders processed is even or odd. We enforce that all orders are counted by adding new validation logic the to the DEX
order minting contract that enforces either a register or deregister of that stake credential occurs in the tx (ie we enforce the bit is flipped).

For the 1 bit example above checking is trivial:

Two redeemers:
Register and deregister
Construction 1 tx with each redeemer transactions; submit those two tx at the same time
The branch for register controls the validator logic if the number of orders is even and deregister controls the logic if the number of orders is odd
Since we know the bit is either set or not set, one of those two tx will go through (make sure both tx contain a common input so both can’t go through)
For the n bit sequence we use the final bit to store a lock. If the final bit is set, none of the other bits can be modified. You can extend this locking by adding locks to control specific subsequences of bits instead of the whole bit sequence.

You can check if a lock is set without flipping it by using delegate (instead of deregister which flips it)
Delegate can only be done if the script is registered (ie bit is set).

Benchmarked a bit sequence of 36.
The benchmark was for a simple global state validator where the bit set is used to store a counter of total transactions with a minting policy, where each bit set represents 1 unique tx that executed the minting policy in the block. The mint policy just enforces that atleast one of the stake credentials in the list is registered in the tx (ie atleast one bit gets set).

In practice, working with the bit set as an integer is very hard. Because it reintroduces concurrency issues.
When you set bits, you can just submit n of the same transactions that only differ in that they at different bits, and exactly one will go through. When you try start working with the bit set as an integer, then each user tx has to change a large chunk of the bit sequence. That means you have to submit a huge number of transactions to account for the possible permutations of the bits you are trying to modify.

That’s why our naive implementation uses the bit set to represent integers as sum of bits (36 bits allows a global state integer with the max value of 36). We're sure the community will be able to figure out unique ways to do other operations and mutate the state more efficiently.
We worked on this with the intention of demonstrating the value of expanding the account model component of our hybrid ledger. We hope to get the developer community and ledger team to see the practical utility of such expansion to support payment on demand global state in the same way the withdraw zero trick got them to see the value of script execution not correlated to ledger actions.
This all works because any number of independent transactions can operate on the same reward account (staking script) in the same block (register deregister and other operations)
