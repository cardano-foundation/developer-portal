---
id: choose-your-tools
title: Choose Your Tools
sidebar_label: Choose your tools
description: Pick a Cardano SDK for your language and get a provider key, the two choices you make before building.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

You make two choices before building: a **library (SDK)** that builds, signs, and submits transactions for you, and a **provider** that connects your code to the chain. An SDK abstracts away the hard parts, transaction building, CBOR serialization, UTXO selection, fee calculation, address derivation, so you work in your own language.

## Pick an SDK

An SDK is a library in your own language. Which one you use is up to you and your stack. Browse the full set, by language and by what each one does, in [**Builder Tools**](/tools/?tags=sdk).

Some starting points:

- **TypeScript / JavaScript**: **Evolution** and **Mesh** are two widely used, actively maintained options. This curriculum's hands-on tabs use them so you can copy and run the examples, but the concepts apply to any SDK.
- **Other languages**: Cardano has community SDKs for **Python, Rust, Go, Java, C#, Swift**, and more, plus low-level serialization libraries. Find them in [Builder Tools](/tools/?tags=sdk).
- **A different paradigm**: instead of chaining builder calls, you can describe a transaction declaratively and generate typed clients from the spec. See [declarative transactions](/docs/developers/curriculum/start-building/transaction-building#declarative-transactions).

## Install it

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Requires Node.js 18+, TypeScript 5+, and an ESM project.

```bash
npm install @evolution-sdk/evolution
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```bash
npm install @meshsdk/core
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

`cardano-cli` ships with the node. Install it from the [cardano-node releases](/docs/operators/node/installing-cardano-node), or skip local setup entirely by using a provider with an SDK.

</TabItem>
</Tabs>

Other languages: `pip install pycardano`, `cargo add whisky`, `go get github.com/Salvionied/apollo`, `dotnet add package Chrysalis`. Find the full list in [Builder Tools](/tools/?tags=sdk).

## Get a provider

Your SDK doesn't reach the chain on its own. It sits on top of a **provider**, which runs the node infrastructure and exposes the chain through an API, so you can query UTXOs and submit transactions without running your own node. The full path is: your code → SDK → provider → node → chain. You have several options:

- **Blockfrost**: hosted REST API with a free tier
- **Koios**: community-run, no key required for basic use
- **Maestro**: hosted, with extended analytics and history
- **Kupmios** (self-hosted Ogmios + Kupo): full control and data sovereignty

Compare them in [Query the chain › choosing a provider](/docs/developers/curriculum/start-building/query-the-chain#choosing-a-provider), browse the full list with their capabilities in [Builder Tools](/tools/?tags=api), and see the [API providers reference](/docs/developers/curriculum/production/api-providers/overview) and [Demeter](/docs/developers/curriculum/production/demeter) for managed infrastructure.

A hosted provider is the quickest way to start. With Blockfrost, for example:

1. Sign up at [blockfrost.io](https://blockfrost.io/).
2. Create a project and select your network (**Preprod** for this guide).
3. Copy the project ID (your API key; it starts with `preprod`).
4. Store it in an env var, and never commit it or ship it in client-side code:

   ```bash
   # .env
   BLOCKFROST_API_KEY=preprod_xxxxxxxxxxateofyourprojectid
   ```

## Next steps

- [Networks & test ADA](/docs/developers/curriculum/start-building/networks-and-test-ada): pick a network and get free test ADA to build with
- [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development): optionally give your AI coding assistant current Cardano context before you start writing code
- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): wire the SDK and provider together and send ADA
