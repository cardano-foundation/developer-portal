---
title: Installation
description: How to install Evolution SDK
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

Evolution SDK is a pure TypeScript library with zero runtime dependencies on Cardano Multiplatform Library (CML). This means lighter bundle sizes, better IDE support, and tree-shakeable exports—you only ship what you use. It works seamlessly with modern build tools and supports both Node.js and browser environments.

Install it for any Cardano project: dApps, wallets, transaction tools, or when migrating from other SDKs like Lucid.

## Quick Install

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
npm install @evolution-sdk/evolution
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn add @evolution-sdk/evolution
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @evolution-sdk/evolution
```

</TabItem>
</Tabs>

## Requirements

- **Node.js**: 18.0.0 or higher
- **TypeScript**: 5.0.0 or higher (for TypeScript projects)
- **ESM Support**: Modern bundlers with ES module support

## Monorepo Setup

If you're using Evolution SDK in a monorepo with pnpm workspaces:

```bash
pnpm add @evolution-sdk/evolution
```

The SDK works seamlessly with pnpm's workspace structure and maintains type safety across packages.

## Browser Usage

For browser environments, ensure your build tool supports:

- ES2020+ target
- Dynamic imports
- BigInt support

Most modern frameworks (React, Vue, Svelte) bundle Evolution SDK without issues.

## Verify Installation

Test that everything is working:

```ts
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: "your-project-id"
  })
  .withSeed({
    mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    accountIndex: 0
  })

console.log("Evolution SDK loaded successfully!")
```

## Next Steps

- [Create a wallet](../wallets)
- [Connect a provider](../clients/providers)
- [Build your first transaction](./getting-started)
