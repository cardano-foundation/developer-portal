---
id: overview
title: Start Building
sidebar_label: Overview
description: Set up a Cardano dev environment, pick your tools, and send your first transaction on testnet.
---

This is the hands-on on-ramp. By the end you will have a working environment, your tool of choice installed, and a real transaction submitted to a Cardano testnet, all without spending real ADA. It assumes you have the mental model from [Cardano Fundamentals](/docs/developers/curriculum/fundamentals/overview) and its [Core Concepts](/docs/developers/curriculum/fundamentals/core-concepts/overview); if a concept here is unfamiliar, those pages explain it.

## The path

1. **[Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools)**: pick an SDK for your language, get a provider key, and set up your AI assistant
2. **[Choose a network](/docs/developers/curriculum/start-building/networks-and-test-ada)**: pick where your code runs, from a public testnet with free test ADA to a chain on your own machine with 200ms blocks
3. **[Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development)**: what the Cardano context contains, how to add it to any agent, and the extra context each SDK ships
4. **[Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction)**: build, sign, and submit a payment, then read it back from the chain
5. **[Transaction building](/docs/developers/curriculum/start-building/transaction-building)**: the full builder toolkit, multi-asset outputs, metadata, and patterns beyond a simple payment
6. **[Query the chain](/docs/developers/curriculum/start-building/query-the-chain)**: read UTXOs, addresses, and history through a provider
7. **[Offline testing](/docs/developers/curriculum/start-building/offline-testing)**: test your transaction-building code with no node and no devnet
8. **[When transactions fail](/docs/developers/curriculum/start-building/transaction-failures)**: the failure modes, which ones are retryable, and how to triage them

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Where this leads

Once you can send and query a transaction, you are ready to build real things: [mint native tokens and NFTs](/docs/developers/curriculum/native-tokens/overview), or move on to [smart contracts](/docs/developers/curriculum/smart-contracts/overview).
