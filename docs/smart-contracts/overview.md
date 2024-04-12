---
id: overview
slug: /smart-contracts/
title: Smart Contracts
sidebar_label: Overview
description: Learn how to create smart contracts on Cardano.
image: /img/og/og-developer-portal.png
--- 

![Smart Contracts](../../static/img/card-smart-contracts-title.svg)

## What are smart contracts?

Smart contracts are digital agreements defined in code that automate and enforce the terms of a contract without the need for intermediaries, enabling secure and transparent transactions on a blockchain. By leveraging predetermined conditions defined within the smart contract code, the state of a contract can only be updated in a way that follows the rules defined in that contract.

On the Cardano blockchain, the compiled code of smart contracts is stored on, and distributed across, the decentralised network. It is not possible to modify the rules of an existing smart contract, nor is it possible to decompile the stored smart contract code from its compiled state into the original source code.

## Introduction

As mentioned in the [general overview](/docs/get-started/), smart contracts on Cardano work a bit differently from how they do on other blockchains. The key to understanding smart contracts is to first understand the [eUTXO](/docs/get-started/technical-concepts/#unspent-transaction-output-utxo) model. 

Smart contracts are more or less just a piece of code that you write to validate the movement of UTXOs locked in your contract's address. You will lock UTXOs at the address of your script and then the UTXOs can only ever be spent/moved if your script allows the transaction spending it to do so. 


## Conceptual overview

Smart contracts consist of on-chain and off-chain components:

- The on-chain component (validator-script) is a script used to validate that each transaction containing any value locked by the script (UTXOs residing on the script's address) conforms to the rules of the contract. Specialised tools and languages are required for creating these scripts.
- The off-chain component is a script or application that is used to generate transactions that conform to the rules of the contract. These can be created in almost any language.

Important to note here is that smart contracts heavily rely on the datum attached to a UTXO, using it as part of the contract instance "state" to be used in further transactions. If no datum is attached to a UTXO residing on the contract's address, it can end up being locked there forever.

### On-Chain (Validator scripts)

Validator scripts are executed automatically when a UTXO residing at the address of the script is attempted to be moved by a transaction. These scripts take a transaction as its input and then outputs either true or false depending on whether the transaction is valid or not according to your rules/logic as defined in the script - thus blocking or allowing a transaction to succeed. If you are moving multiple UTXOs residing on the same script address, the validator-script will run once for each UTXO. This script execution happens on the Cardano node validating your transaction.

This means that in order for the validator-script to execute, a transaction must first move a UTXO to the address of the contract; the address is derived from the contract mathematically. You do not need to upload your contract to the chain, although that is also possible using reference scripts.

You might think of this initial transaction where you move a UTXO to the script address to be the initialisation of a contract instance. Each UTXO residing on the address of the contract can thus be seen as an instance of the contract. Note that there is no restriction on the UTXOs being sent to the script address: anyone can send a UTXO containing no datum, or a 'fake' datum.

### Off-Chain

The off-chain part is needed in order to locate UTXOs that are locked in your contract and generate transactions that are valid for moving them.

For contracts that require multiple steps to complete, it is common to encode the state of a contract inside of a datum using a specific schema of your own design that is then attached to each transaction. You would then create a 'thread' of UTXOs by designing a validator such that it only allows moving the UTXO to the script address so that the value of the UTXO remains locked in the new UTXO, but with a new datum/state.

## Technical overview

Smart contracts are really very simple constructs based on validator-scripts which you now know are just some logic/rules created by you to be enforced by the Cardano nodes when they see a transaction attempting to move a UTXO locked inside of your script's address.

Because the validator script has access to read the transaction context (things like who signed it and which assets are being sent to/from where) and datum of the locked UTXO being moved, you can build some very complex contracts this way. For example, [Marlowe](marlowe) is a good example of this technique used in practice.

More specifically, the validator scripts are passed these three pieces of information as arguments:

- Datum: this is a piece of data attached to the output that the script is locking. This is typically used to carry state.

- Redeemer: this is a piece of data attached to the spending input. This is typically used to provide an input to the script from the spender. For example, your validator can use a function to 'apply' the redeemer contents to the datum and verify that it gets the same result as what the output UTXO datum is set to.

- Context: this is a piece of data that represents information about the spending transaction. This is used to make assertions about the way the output is being sent (such as “Bob signed it”).

The information contained in the context and thus available for your script to read:

| Property         | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| **inputs**       | Outputs to be spent.                                            |
| **reference inputs** | Inputs used for reference only, not spent.                       |
| **outputs**      | New outputs created by the transaction.                          |
| **fees**         | Transaction fees.                                               |
| **minted value** | Minted or burned value.                                         |
| **certificates** | Digest of certificates contained in the transaction.             |
| **withdrawals**  | Used to withdraw rewards from the stake pool.                    |
| **valid range**  | A range of time in which the transaction is valid.               |
| **signatories**  | A list of transaction signatures.                                |
| **redeemers**    | Data used to provide an input to the script from the spender.    |
| **info data**    | A map of datum hashes to their datum value.                      |
| **id**           | Transaction identification.                                     |


### Basic contract workflow

:::note
This is only an example! The validator does not need to rely on hashsums - you can have any logic you want here.
:::

- You create a validator-script that compares the datum in the UTXO being moved from the contract's address to the hash of the redeemer being used in the transaction moving it. This is your on-chain component.

- You create a script, using your language of choice, that creates a transaction moving some amount of ada or other assets to the address of the validator-script. When generating the transaction you specify the datum to be ```Hash("secret")``` making sure that only the hashsum of the word "secret" gets stored on-chain. This is your off-chain component.

- You sign and submit the transaction to a Cardano node either directly or via one of many available API's such as Blockfrost or Dandelion. Now the ada you sent to the contract is locked by your validator.

- The only way for anyone to move this locked ada now is to generate a transaction with the word 'secret' as a redeemer, as the UTXO is locked in the script which will enforce this rule you created where the hashsum of the redeemer must match ```Hash("secret")```. 
Normally, your datum would be more complicated than this, and the person running the contract might not know how it is supposed to work at all, so they would rely on your off-chain component to create the transaction - often this is something you would provide an API for.


### Multi-step contract workflow

Expanding on the basic workflow, imagine that you want to create a contract that required multiple steps. Such a contract might be one that requires 3 different people to agree on who should be able to claim the value locked in a contract instance.

- Your on-chain component, the validator script, would have to encode logic for allowing two different types of actions: moving the contract forward (step), or moving the UTXO and hence its value to any other address (unlock).

- Your off-chain component will need to be able to look at the locked UTXO and decode its datum to see which state the contract is currently in, so that it can correctly generate a transaction for either unlocking the UTXO or driving the contract forward.

:::note
You can also design contracts that never close, but only ever change state, while still allowing funds to be added and withdrawn from the contract.
:::

### Contract instances

When you have contracts designed to run in multiple steps, the UTXO that represents the current state of a specific instance/invocation of that script is something you need to be able to keep track of.

There is no standard for how to do this as of now, but one way to accomplish this is to be to create a minting-policy that only allows minting of thread token NFTs to the script's address, and then use the NFTs as thread-tokens by having the validator script enforce such NFTs be moved with each transaction.

### Real-world use

One of the best known examples of real-world use for this type of smart contract on the Cardano blockchain is [Marlowe](marlowe).

For the datum used in transactions validated by the Marlowe validator-script, a custom domain specific language (DSL) was designed to make it easy for end users to create their own financial contracts. The off-chain component takes care of creating transactions that include the contract DSL in the transaction together with the current state, while the validator makes sure that all state transitions are valid according to the custom Marlowe logic. 

The redeemer sent as part of the state transition transactions contain the 'input' to script, i.e. it specifies what is being applied to the old state in order to create the new state: the datum in the output transaction. The script can apply the input to the old datum locally and see if the result matches that of the output UTXO being created in the transaction currently being evaluated.

Facilitating the actual use of Marlowe also required creating multiple API's, chain indexers and frontends for interacting with such contracts.
Of course not all contracts are as complex, requiring the same amount of infrastructure around them, but it is worth noting that the off-chain components are just as important as the on-chain parts.


## Programming languages

Cardano introduced smart contracts in 2021 and now supports the development and deployment of smart contracts using multiple different languages.

:::tip
Writing well-designed smart contracts requires you to have a solid understanding of how Cardano works in general. So, make sure that everything on this page makes sense before you start creating contracts. Many topics are described in more detail on the [Technical Concepts](/docs/get-started/technical-concepts) page as well.
:::

- [Aiken](aiken) - for on-chain validator scripts only: a language & toolchain favouring developer experience.
- [Marlowe](marlowe) - a domain-specific language, it covers the world of financial contracts.
- [opshin](opshin) - a programming language for generic Smart Contracts based on Python. 
- [Plutus](plutus) - a platform to write full applications that interact with the Cardano blockchain. 
- [plu-ts](plu-ts) - Typescript-embedded smart contract programming language and a transaction creation library. 

