---
title: "Lectures"
sidebar_label: "Introduction"
description: "A guided, hands-on path to learning Cardano development, from the basics to high-quality smart contracts."
---

# Lectures

The Lectures are a guided, hands-on path to learning Cardano development. Each lecture try to explain one idea in plain language with a real-world comparison, and ends with something you can **run and see** for yourself. They come in three modules, take them in order.

## The three modules

### Beginner: the base of Cardano

The core ideas you need before building anything: wallets, UTxOs, transactions, tokens, and the tools you use to read the chain (providers and explorers). After this you'll understand how Cardano works and be ready to build.

**[Start the Beginner module](/docs/developers/onboarding/lectures/beginner/introduction)**

### Intermediate: smart contracts

Smart contracts from scratch: on-chain vs off-chain, what a validator is, datum and redeemer, the languages you write them, and the off-chain SDKs that drive them. After this you'll be able to **write and understand** a smart contract. 

### Advanced: high-quality smart contracts

Going from "it works" to "it's safe": common vulnerabilities, design patterns, testing, optimization, and getting to production. After this you'll be able to write **secure, high-quality** contracts.

## What you need

Most lectures have two kinds of hands-on.

**To read and explore (no install).** A modern browser and a wallet, we use **[Lace](https://www.lace.io/)** switched to the **Preview** test network, plus free test ADA from the **[faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)**. Preview coins have no real value, so you can experiment safely.

**To run the code snippets.** Some lectures show real, tested code you can run:

- **[Node.js](https://nodejs.org/) latest**, it runs the TypeScript examples directly.
- **[git](https://git-scm.com/)** to get the example projects, they live under `examples/onboarding/` in the [developer-portal repo](https://github.com/cardano-foundation/developer-portal).
- Then, in an example folder, run `npm install` and `npm test`.

**Sometimes optional.**

- A free **[Blockfrost](https://blockfrost.io/)** Preview API key, for lectures that query the live chain.
- **[Aiken](https://aiken-lang.org/)**, for the Intermediate and Advanced lectures that compile on-chain code.

The code you see in a lecture is imported straight from those tested example projects, so **what you read is exactly what runs**, and it stays working.

Ready? Start with the **[Beginner](/docs/developers/onboarding/lectures/beginner/introduction)** module.
