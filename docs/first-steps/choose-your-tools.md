---
id: choose-your-tools
title: Choose Your Tools
sidebar_label: Choose your tools
description: Pick a Cardano SDK for your language and get a provider key, the two choices you make before building.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

You make two choices before building: a **library (SDK)** that builds, signs, and submits transactions for you, and a **provider** that connects your code to the chain. An SDK abstracts away the hard parts, transaction building, CBOR serialization, UTXO selection, fee calculation, address derivation, so you work in your own language.

## Pick an SDK

Choose by your language. For TypeScript, the two actively-recommended SDKs are **Evolution** and **Mesh**; the rest of this curriculum's hands-on tabs use them.

| Language | Recommended | Notes |
|---|---|---|
| **TypeScript / JavaScript** | **Evolution SDK** (recommended), **Mesh SDK** | Evolution is the modern, type-safe default; Mesh is a strong alternative with a large guide ecosystem |

Building in another language? Cardano has community SDKs for **Python, Rust, Go, Java, C#, Swift**, and more, plus low-level serialization libraries. Browse them by language and filter by what they do in [**Builder Tools**](/tools/?tags=sdk).

:::tip Why Evolution first?
Evolution SDK is a modern, type-safe TypeScript library, the next generation of Cardano developer experience, with first-class provider support and clean error handling. Mesh is an excellent alternative, especially if you want its ready-made guides and React components. You can't go wrong with either.
:::

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

`cardano-cli` ships with the node. Install it from the [cardano-node releases](/docs/get-started/infrastructure/node/installing-cardano-node), or skip local setup entirely by using a provider with an SDK.

</TabItem>
</Tabs>

Other languages: `pip install pycardano`, `cargo add whisky`, `go get github.com/Salvionied/apollo`, `dotnet add package Chrysalis`. Find the full list in [Builder Tools](/tools/?tags=sdk).

## Get a provider

A **provider** runs the node infrastructure and exposes the chain through an API, so you can query UTXOs and submit transactions without running your own node. For getting started, **Blockfrost** is the fastest path (hosted, free tier, ~5 minutes):

1. Sign up at [blockfrost.io](https://blockfrost.io/).
2. Create a project and select your network (**Preprod** for this guide).
3. Copy the project ID (your API key; it starts with `preprod`).
4. Store it in an env var, never commit it or ship it in client-side code:

   ```bash
   # .env
   BLOCKFROST_API_KEY=preprod_xxxxxxxxxxateofyourprojectid
   ```

Other providers (for production or self-hosting): **Kupmios** (self-hosted Ogmios + Kupo), **Maestro** (hosted, advanced analytics), **Koios** (community-run, no key). Compare them in [Query the chain › choosing a provider](/docs/first-steps/query-the-chain#choosing-a-provider), and see [API providers](/docs/get-started/infrastructure/api-providers/overview) and [Demeter](/docs/get-started/infrastructure/demeter) for managed infrastructure.

## Next steps

- [Your first transaction](/docs/first-steps/your-first-transaction): wire the SDK and provider together and send ADA
