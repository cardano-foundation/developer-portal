---
id: build-on-cardano
title: What You Can Build On Cardano
sidebar_label: Build on Cardano
description: build on Cardano
image: ./img/og-developer-portal.png
---

The Cardano blockchain is a third-generation blockchain that solves the main problems of the three elements of any blockchain system:

* Scalability. It is represented by the number of transactions per second, requirement for network resources, and data scaling.
* Interoperability.  The ability to see and access information across various blockchain systems
* Sustainability.

You can use Cardano to create:
* Metadata transactions
* Stake pool
* Smart contracts

## Metadata transactions

[Transaction metadata](../transaction-metadata/overview) is the process of inserting and storing data on the Cardano blockchain. You can insert different types of data such as numerical data and written details to be validated and giving all support to transactions. Please check the following resources for more information:

* [Transaction Metadata docs](https://docs.cardano.org/projects/cardano-node/en/latest/reference/tx-metadata.html)
* [Watch the metadata workshop](https://www.crowdcast.io/e/metadata),
* [Check out Workshop Maybe’s mini-csk on transaction metadata](https://youtu.be/Qmx7Pv_bsxw),
* [Review the workshop presentation](https://docs.google.com/presentation/d/1ursHchJiBP5ZVuXcW2uVJMmzXjlJk_di65CKmAplEy4/edit)

## Stake Pool

You run your own stake pool and start getting rewards. Check the [stake pool operation](../stake-pool-operation/overview) section.

## Smart contracts

The main programming language that Cardano uses is [Haskell](https://forum.cardano.org/t/why-cardano-chose-haskell-and-why-you-should-care/43085). You can watch the video [Why Cardano uses Haskell](https://www.youtube.com/watch?v=0_0GdDkPRxM) to get a better understanding. Cardano blockchain enables you to create smart contracts using different smart contract languages. This section will guide you through [Plutus](https://github.com/input-output-hk/plutus) and [Marlowe](https://github.com/input-output-hk/marlowe).

## Plutus

Some parts of a Plutus contract run on the blockchain, on-chain code compiled with the Plutus compiler, and other parts run off-chain, compiled via Haskell compiler, and both parts are written in Haskell. To start writing code on Plutus, you need to go to the [Plutus playground editor](https://playground.plutus.iohkdev.io/tutorial/index.html).

:::note where to start
The best way to learn is with practice so you should attend all lectures and run all examples within the [**Plutus Pioneer Program**](https://github.com/input-output-hk/plutus-pioneer-program). Also you can go through all current [**Plutus use cases**](https://github.com/input-output-hk/plutus-use-cases).
:::

### Video Tutorials

* [Cardano Plutus Smart Contract Guessing Game Tutorial](https://www.youtube.com/watch?v=wNXKiQanLTc)
* [Plutus Pioneer Program - Lecture 1](https://youtu.be/IEn6jUo-0vU)
* [Plutus Pioneer Program - Lecture 2](https://youtu.be/E5KRk5y9KjQ)
* [Plutus Pioneer Program - Lecture 3](https://youtu.be/Lk1eIVm_ZTQ)
* [Plutus Pioneer Program - Lecture 4](https://youtu.be/6Reuh0xZDjY)
* [Plutus Pioneer Program - Lecture 5](https://youtu.be/6VbhY162GQA)

### Guides

* [The starter Plutus Application Backend (PAB) example](https://github.com/input-output-hk/plutus-starter)
* [Compiling and testing a Plutus app in the Plutus Playground](https://docs.cardano.org/projects/plutus/en/latest/plutus/tutorials/plutus-playground.html)
* [Writing a basic Plutus app in the Plutus Playground](https://docs.cardano.org/projects/plutus/en/latest/plutus/tutorials/basic-apps.html)
* [Using Plutus Transaction](https://docs.cardano.org/projects/plutus/en/latest/plutus/tutorials/plutus-tx.html)
* [Writing basic validator scripts](https://docs.cardano.org/projects/plutus/en/latest/plutus/tutorials/basic-validators.html)
* [Writing basic forging policies](https://docs.cardano.org/projects/plutus/en/latest/plutus/tutorials/basic-forging-policies.html)
* [Property-based testing of Plutus contracts](https://docs.cardano.org/projects/plutus/en/latest/plutus/tutorials/contract-testing.html)

### Previous Online Course and Book, 2019

* [Free Smart Contracts Tutorial - Marlowe programming language](https://www.udemy.com/course/plutus-reliable-smart-contracts/)
* [Plutus: Writing reliable smart contracts](https://leanpub.com/plutus-smart-contracts)

## Marlowe

Marlowe is built on top of the Plutus Platform for writing financial smart contracts. [Marlowe playground editor][https://alpha.marlowe.iohkdev.io/]. To start building with Marlowe, you can check the [simple escrow contract](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/escrow-ex.html).

Marlowe has [six ways of building contracts](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/marlowe-step-by-step.html):
1. Pay
2. Let
3. If
4. When
5. Assert
6. Close

### Video Tutorials

* [Marlowe playground](https://www.youtube.com/watch?v=1ps7Qxbw0Eg)
* [Building A Smart Contract On Cardano - Marlowe Playground Example Walk-through Part 1](https://www.youtube.com/watch?v=UQK-o3BPy28&t=669s)
* [Marlowe Playground Example Smart Contract P2 - Cardano Smart Contracts](https://www.youtube.com/watch?v=MLpJ4D8_n6I)

### Guides

  * [Marlowe in Blockly](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/playground-blockly.html)
  * [Marlowe embedded in Haskell](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/embedded-marlowe.html)
  * [Marlowe embedded in JavaScript](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/javascript-embedding.html)
  * [Marlowe data types](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/marlowe-data.html)
  * [The Marlowe model](https://docs.cardano.org/projects/plutus/en/latest/marlowe/tutorials/marlowe-model.html)

### Previous Online Course, 2019

[Free Smart Contracts Tutorial - Marlowe programming language](https://www.udemy.com/course/marlowe-programming-language/)
