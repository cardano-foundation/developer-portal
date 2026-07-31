---
id: choose-your-tools
title: Choose Your Tools
sidebar_label: Choose your tools
description: Pick an SDK for your language, get a provider key, and give your AI assistant current Cardano context before you write any code.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

You put three things in place before writing code: a **library (SDK)** that builds transactions in your language, a **provider** that connects it to the chain, and current Cardano context for your AI assistant, if you code with one.

None of these lock you in. Every SDK produces transactions against the same ledger rules, so what you learn about UTXOs, datums, and fees carries over if you switch. Providers sit behind one interface in most SDKs, so changing one is a config line.

## Start from a template, or from scratch

If you would rather have something running before you understand it, start from a template. The [templates gallery](/templates) has wallet-connected starters that already wire an SDK, a provider, and a frontend framework together, each with the command that copies it into a new project.

The rest of this page is the setup those templates did for you. Skim it now and come back when you want to change one of the pieces.

## Your language, and its SDK

An SDK handles the parts of Cardano you do not want to reimplement: assembling and balancing a transaction, coin selection, fee calculation, CBOR serialization, key derivation, and talking to a provider. You work in your own language and it produces bytes a node accepts.

The code tabs across this curriculum use **Evolution** and **Mesh**, both TypeScript. That is the only reason they appear here: with one of them installed, every example on the site runs as written. Nothing you learn depends on either one.

Cardano has SDKs in Python (PyCardano), Rust (Whisky), Go (Apollo), C# (Chrysalis), Java, Swift, and more, alongside lower-level serialization libraries. [Builder Tools](/tools/?tags=sdk) lists them by language and by what each one covers.

## Install it

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

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

Anything else installs with its own package manager. Its [Builder Tools](/tools/?tags=sdk) entry links to the repository, where the install line lives.

## How your code reaches the chain

Your SDK does not reach the chain on its own. It sits on top of a **provider**, which runs the node infrastructure and exposes the chain through an API, so you can read UTXOs and submit transactions without operating a node yourself. The full path is your code → SDK → provider → node → chain.

[Query the chain](/docs/developers/curriculum/start-building/query-the-chain#choosing-a-provider) compares the providers on hosting, keys, and rate limits, and shows how to configure one on a client. [Connecting to the chain](/docs/developers/curriculum/production/connecting-to-the-chain) maps the full range, from a hosted API to running the infrastructure yourself.

To follow along you need a key, and Blockfrost has a free tier:

1. Sign up at [blockfrost.io](https://blockfrost.io/).
2. Create a project and select **Preprod**, the network these examples use.
3. Copy the project ID. That is your API key, and it starts with `preprod`.
4. Store it in an env var. Never commit it, and never ship it in client-side code:

   ```bash
   # .env
   BLOCKFROST_API_KEY=preprodYourProjectIdHere
   ```

## Context for your AI assistant

Model training data on Cardano drifts. APIs change, libraries get renamed, and patterns move faster than models are retrained, so an assistant left to its training data writes code against a version of the ecosystem that no longer exists.

[Cardano Dev Skills](https://github.com/cardano-foundation/cardano-dev-skills) is the Cardano Foundation's answer: Markdown skills and bundled documentation refreshed weekly from upstream repositories, usable by any agent that reads Markdown. In Claude Code:

```
/plugin marketplace add cardano-foundation/cardano-dev-skills
/plugin install cardano-dev-skills@cardano-dev-skills
```

Then run `/cardano-context` once per project. [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development) covers other agents, what the skills contain, and the extra context individual SDKs ship on top.

:::tip Beyond writing code
An assistant can also read live chain state and draft transactions for you to sign. [Connect an AI assistant with MCP](/docs/developers/curriculum/dapps/ai-agents/mcp) covers that.
:::

## What you are not choosing yet

- **The language you write smart contracts in.** A separate toolchain, covered in [Smart contracts](/docs/developers/curriculum/smart-contracts/choose-a-language). Every smart contract example in this curriculum is Aiken.
- **Where you run the chain.** Preprod is enough to start. You can also [run a chain yourself](/docs/developers/curriculum/start-building/networks-and-test-ada#run-a-chain-yourself), with block times you set, on the next page.

## Next steps

- [Choose a network](/docs/developers/curriculum/start-building/networks-and-test-ada): pick where your code runs, and get free test ADA to build with
- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): wire the SDK and provider together and send ADA
