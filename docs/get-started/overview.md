---
id: overview
slug: /get-started/
title: Welcome to the Cardano Developer Portal
sidebar_label: Start Here
description: Start here. The Cardano Developer Portal is a hands-on curriculum that takes you from blockchain fundamentals to production dApps.
image: /img/og/og-getstarted-overview.png
---

![Cardano Get Started](/img/card-get-started-title.svg)

Welcome to the Cardano Developer Portal. This is the place to learn how to build on Cardano, organized as a **curriculum** of seven modules that build on each other, from first principles to production. Work through them in order, or jump to whatever you need.

> Looking for a wallet rather than building? Head to [Cardano Apps](https://cardano.org/apps/). Everything here covers what you can do **today** on **mainnet**.

## The curriculum

Each module builds on the last, taking you from understanding Cardano to shipping and running a real application.

| # | Module | What you'll learn |
|---|---|---|
| 1 | **[Cardano Fundamentals](/docs/foundations/overview)** | What a blockchain is, cryptography, Ouroboros consensus, the platform's architecture, and the eUTXO ledger (addresses, wallets and keys, transactions, fees) |
| 2 | **[Start Building](/docs/first-steps/overview)** | Pick your tools, get test ADA, build/sign/submit transactions, attach metadata, and query the chain |
| 3 | **[Native Tokens & NFTs](/docs/native-tokens/overview)** | Mint fungible tokens and NFTs (native, no smart contract required) |
| 4 | **[Smart Contracts](/docs/build/smart-contracts/overview)** | Validators, datum/redeemer/context, writing and testing on-chain code, design patterns, and security |
| 5 | **[Build a dApp](/docs/build/integrate/connect-a-wallet)** | Build DeFi on the eUTXO model, connect a browser wallet (CIP-30), authenticate users, and bring real-world data on-chain with oracles |
| 6 | **[Staking & Governance](/docs/build/staking-governance/overview)** | Delegate stake, claim rewards, and integrate CIP-1694 governance in your app |
| 7 | **[Going to Production](/docs/build/scaling/going-to-production)** | A pre-mainnet checklist, scaling (Hydra, Mithril), infrastructure and providers, and secure key handling |

When you're ready to build something specific, the **Integrations** guides cover [Payments](/docs/build/integrate/payments/listening-for-payments/overview), [AI Agents](/docs/build/integrate/ai-agents/overview), and [Internet of Things](/docs/build/iot-on-cardano/), and there's a dedicated [Exchange Integrations](/docs/build/integrate/exchange-integrations) track for custodial platforms.

## Where to start

- **New to blockchain?** Begin with [Cardano Fundamentals](/docs/foundations/overview).
- **Want to build something right away?** Jump to [Start Building](/docs/first-steps/overview).
- **Coming from Ethereum?** Read [Cardano for Ethereum developers](/docs/foundations/cardano-for-ethereum-developers) first. The mental model differs in important ways.

## What is Cardano?

Cardano is a collection of [open-source](https://en.wikipedia.org/wiki/Open_source), patent-free protocols, a platform to store, transform, and manage value, identity, and governance. It is built on peer-reviewed research: the development followed academic rigor producing more than 100 papers, including [“Ouroboros: A Provably Secure Proof-of-Stake Blockchain Protocol”](https://eprint.iacr.org/2016/889.pdf), one of the most cited security papers of 2015–2019.

A few things that make Cardano different, and worth understanding early:

- **The [eUTXO model](/docs/value/eutxo).** State and value live in unspent transaction outputs, not account balances. This shapes everything from determinism to how you design DeFi.
- **[Native tokens](/docs/native-tokens/overview).** Tokens (including ADA) live on the ledger as first-class citizens. You send them in a standard transaction; no token smart contract to write or exploit.
- **[Smart contracts](/docs/build/smart-contracts/overview) are validators.** They approve or reject transactions rather than executing actions imperatively, a direct consequence of the eUTXO model.

## Why build on Cardano?

- **Predictable costs.** Deterministic fees with no gas auctions. You know a transaction's cost and outcome before you submit it.
- **Secure by design.** A proof-of-stake chain built with high-assurance, formally-specified methods; native assets and determinism remove whole classes of attacks.
- **Energy-efficient.** Proof of stake consumes a fraction of the energy of proof of work.
- **Funded ecosystem.** Cardano's on-chain treasury funds community projects. You can [propose your project for funding](/docs/community/funding).

When you're ready, start with [Cardano Fundamentals](/docs/foundations/overview).
