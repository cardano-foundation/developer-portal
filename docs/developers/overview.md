---
id: overview
slug: /developers/
title: Welcome to the Cardano Developer Portal
sidebar_label: Start Here
description: Start here. The Cardano Developer Portal is a hands-on curriculum that takes you from blockchain fundamentals to production dApps.
image: /img/og/og-getstarted-overview.png
---

![Cardano Get Started](/img/card-get-started-title.svg)

Welcome to the Cardano Developer Portal. This is the place to learn how to build on Cardano, organized as a **curriculum** of seven modules that build on each other, from first principles to production. Work through them in order, or jump to whatever you need.

:::tip Building with an AI assistant?
Give it current Cardano context first so it answers from today's APIs, not stale training data: [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development).
:::

## The curriculum

Each module builds on the last, taking you from understanding Cardano to shipping and running a real application.

| # | Module | What you'll learn |
|---|---|---|
| 1 | **[Learn the Fundamentals](/docs/developers/curriculum/fundamentals/overview)** | What a blockchain is, cryptography, Ouroboros consensus, the platform's architecture, and the eUTXO ledger (addresses, wallets and keys, transactions, fees) |
| 2 | **[Start Building](/docs/developers/curriculum/start-building/overview)** | Pick your tools, get test ADA, build/sign/submit transactions, attach metadata, and query the chain |
| 3 | **[Mint Tokens & NFTs](/docs/developers/curriculum/native-tokens/overview)** | Mint fungible tokens and NFTs |
| 4 | **[Staking & Governance](/docs/developers/curriculum/staking-governance/overview)** | Delegate stake, claim rewards, and integrate CIP-1694 governance in your app |
| 5 | **[Write Smart Contracts](/docs/developers/curriculum/smart-contracts/overview)** | Validators, datum/redeemer/context, writing and testing on-chain code, design patterns, and security |
| 6 | **[Build a dApp](/docs/developers/curriculum/dapps/overview)** | Build DeFi on the eUTXO model, connect a browser wallet (CIP-30), authenticate users, and bring real-world data on-chain with oracles |
| 7 | **[Ship to Production](/docs/developers/curriculum/production/overview)** | A pre-mainnet checklist, scaling (Hydra, Mithril), infrastructure and providers, and secure key handling |

When you're ready to build something specific, **Module 6 (Build a dApp)** covers [payments](/docs/developers/curriculum/dapps/listen-for-payments), [AI agents](/docs/developers/curriculum/dapps/ai-agents/overview), and a hands-on [Internet of Things](/docs/developers/curriculum/dapps/iot/) workshop, and there's a standalone [Exchange integrations](/docs/developers/exchange-integrations) guide for custodial platforms.

## Where to start

- **New to blockchain?** Begin with [Cardano Fundamentals](/docs/developers/curriculum/fundamentals/overview).
- **Want to build something right away?** Jump to [Start Building](/docs/developers/curriculum/start-building/overview).
- **Coming from Ethereum?** Read [Cardano for Ethereum developers](/docs/developers/curriculum/fundamentals/cardano-for-ethereum-developers) first. The mental model differs in important ways.

## What is Cardano?

Cardano is a collection of [open-source](https://en.wikipedia.org/wiki/Open_source), patent-free protocols, a platform to store, transform, and manage value, identity, and governance. It is built on peer-reviewed research: the development followed academic rigor producing more than 100 papers, including [“Ouroboros: A Provably Secure Proof-of-Stake Blockchain Protocol”](https://eprint.iacr.org/2016/889.pdf), one of the most cited security papers of 2015–2019.

A few things that make Cardano different, and worth understanding early:

- **The [eUTXO model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo).** State and value live in unspent transaction outputs, not account balances. This shapes everything from determinism to how you design DeFi.
- **[Native tokens](/docs/developers/curriculum/native-tokens/overview).** Tokens (including ADA) live on the ledger as first-class citizens. You send them in a standard transaction; no token smart contract to write or exploit.
- **[Smart contracts](/docs/developers/curriculum/smart-contracts/overview) are validators.** They approve or reject transactions rather than executing actions imperatively, a direct consequence of the eUTXO model.

## Why build on Cardano?

- **Predictable costs.** Deterministic fees with no gas auctions. You know a transaction's cost and outcome before you submit it.
- **Secure by design.** A proof-of-stake chain built with high-assurance, formally-specified methods; native assets and determinism remove whole classes of attacks.
- **Energy-efficient.** Proof of stake consumes a fraction of the energy of proof of work.

When you're ready, start with [Cardano Fundamentals](/docs/developers/curriculum/fundamentals/overview).
