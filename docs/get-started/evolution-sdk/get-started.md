---
id: get-started
sidebar_position: 1
title: Get Started with Evolution SDK
sidebar_label: Instantiate Evolution
description: Quick start guide for Evolution SDK
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Get Started with Evolution SDK

Evolution SDK is a highly scalable, production-ready transaction builder & off-chain framework for users and DApps. It provides a TypeScript library for building transactions and designing off-chain code.

In this guide, we will walk you through just 3 easy steps to install the `evolution-sdk` package, instantiate the Evolution SDK library, create/choose a wallet, and build and submit a transaction. The library is capable of much more and is one of the popular tools for building off-chain code for Cardano dApps.

> For more examples and use cases, please refer to the official Evolution SDK [documentation](https://no-witness-labs.github.io/evolution-sdk/).

> Come say hi on [Discord](https://discord.com/invite/eqZDvHvW6k) if you have any questions!

## Installation

<Tabs
defaultValue="pnpm"
values={[
{label: 'pnpm', value: 'pnpm'},
{label: 'npm', value: 'npm'},
{label: 'yarn', value: 'yarn'},
{label: 'bun', value: 'bun'},
]}>
<TabItem value="pnpm">

```bash
pnpm i @evolution-sdk/lucid
```

</TabItem>
<TabItem value="npm">

```bash
npm i @evolution-sdk/lucid
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add @evolution-sdk/lucid
```

</TabItem>
<TabItem value="bun">

```bash
bun i @evolution-sdk/lucid
```

</TabItem>
</Tabs>

:::note

Installing the `lucid` package will automatically export all other Evolution SDK packages as well. For more information on more granular package definitions for lightweight development, please refer to the the Evolution library [installation guide](https://no-witness-labs.github.io/evolution-sdk/install).

:::

## Instantiate Evolution SDK

Evolution SDK can be used with or without a blockchain provider, which allows you to query data and submit transactions. Evolution library supports the `Mainnet`, `Preprod`, `Preview` and `Custom` networks.

### Provider Selection

<Tabs
defaultValue="blockfrost"
values={[
{label: 'Blockfrost', value: 'blockfrost'},
{label: 'Kupmios', value: 'kupmios'},
{label: 'Maestro', value: 'maestro'},
{label: 'Koios', value: 'koios'},
]}>
<TabItem value="blockfrost">

```typescript
import { Lucid, Blockfrost } from "@evolution-sdk/lucid";

const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<projectId>"),
  "Preprod"
);
```

</TabItem>
<TabItem value="kupmios">

```typescript
import { Lucid, Kupmios } from "@evolution-sdk/lucid";

const lucid = await Lucid(
  new Kupmios(
    "http://localhost:1442", // Kupo endpoint
    "http://localhost:1337" // Ogmios endpoint
  ),
  "Preview"
);
```

**or with API Keys**

```typescript
const lucid = await Lucid(
  new Kupmios("http://localhost:1442", "http://localhost:1337", {
    kupoHeader: { "priv-api-key": "<kupo-api-key>" }, // for example: "dmtr-api-key": "<kupo-api-key>"
    ogmiosHeader: { "priv-api-key": "<ogmios-api-key>" },
  }),
  "Preview"
);
```

:::note

Kupmios is a mix of [Ogmios](https://ogmios.dev/) and [Kupo](https://cardanosolutions.github.io/kupo/).

:::

</TabItem>
<TabItem value="maestro">

```typescript
import { Lucid, Maestro } from "@evolution-sdk/lucid";

const lucid = await Lucid(
  new Maestro({
    network: "Preprod", // For MAINNET: "Mainnet" (1)
    apiKey: "<Your-API-Key>", // Get yours by visiting https://docs.gomaestro.org/docs/Getting-started/Sign-up-login
    turboSubmit: false, // Read about paid turbo transaction submission feature at https://docs.gomaestro.org/docs/Dapp%20Platform/Turbo%20Transaction
  }),
  "Preprod" // For MAINNET: "Mainnet" (2)
);
```

</TabItem>
<TabItem value="koios">

```typescript
import { Lucid, Koios } from "@evolution-sdk/lucid";

const lucid = await Lucid(
  new Koios("https://preprod.koios.rest/api/v1"),
  "Preprod"
);
```

**or with a bearer token**

```typescript
const lucid = await Lucid(
  new Koios("<koios-api-url>", "<koios-bearer-token>"),
  "Preprod"
);
```

</TabItem>
</Tabs>
