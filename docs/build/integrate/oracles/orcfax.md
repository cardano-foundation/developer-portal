---
id: orcfax
title: Orcfax
sidebar_label: Orcfax
description: Decentralized oracle service for publishing real-world data to Cardano smart contracts.
image: /img/og/og-developer-portal.png
---

## What is Orcfax?

[Orcfax](https://orcfax.io) is a decentralized oracle service designed to publish data about real-world events to the Cardano blockchain. Orcfax data is made available to on-chain smart contracts in Cardano's native eUTXO format using the Orcfax Protocol.

Orcfax collects and validates facts about the real world using multiple redundant nodes that are run as a decentralized network. The solution archives standards-compliant audit log packages for the entire oracle publication workflow, allowing users to "trust but verify" that Orcfax is delivering authentic and accurate data.

![Orcfax Workflow](/img/orcfax-workflow.png)

The diagram above illustrates Orcfax's complete workflow: from real-world events through triangulated data collection, stake-based validation, and fact statement publication on Cardano using Plutus v2, to archival on Arweave with complete audit trails, delivering authentic fact statements that can be independently verified.

## What Orcfax Provides

**Exchange Rate Feeds**: Current exchange rate (CER) feeds for various currency pairs, with plans to expand to diverse types of real-world facts.

**Cardano Native Token (CNT) Feeds**: Token pair pricing using DEX liquidity pool aggregation across multiple decentralized exchanges.

![Virtual Liquidity Pooling](/img/orcfax-virtual-liquidity-pooling.jpg)

Virtual liquidity pooling aggregates prices from multiple DEXes into a single fair price, removing the risk of low-liquidity DEXes skewing prices.

**Verification & Audit Logs**: Standards-compliant audit log packages for the entire oracle publication workflow, enabling verification of data authenticity and accuracy.

**Orcfax Explorer**: User-friendly dashboard for navigating all published data with complete audit trails. Explore feeds at [explorer.orcfax.io](https://explorer.orcfax.io).

## Publication Models

Orcfax feeds support two distinct publication models:

**Heartbeat Model**: Data is published at regular intervals that can be parameterized according to integrator needs. Can be enhanced with deviation monitoring that triggers additional publications when specified thresholds are met.

**On-Demand Model**: Data is collected, validated, and published whenever requested by smart contracts, providing complete flexibility and control over when data is made available.

## Network Support

Orcfax supports Cardano mainnet and testnet environments.

## Getting Started

Visit [docs.orcfax.io](https://docs.orcfax.io) for:
- Developer manual for consuming and verifying oracle feeds
- Integration guides and example contracts
- Feed definitions and technical specifications

Explore available feeds on the [Orcfax Explorer](https://explorer.orcfax.io).

---

**Related**: [Charli3](/docs/integrate-cardano/charli3) | [Oracles Overview](/docs/integrate-cardano/oracles-overview)
