---
id: scaffolding
title: Project scaffolding
sidebar_label: Scaffolding
description: Start a Cardano dApp from a runnable template instead of a blank directory, with starter templates today and the cardano-init tool on the way.
image: /img/og/og-developer-portal.png
---

## Introduction

Setting up a dApp means wiring together an on-chain language, an off-chain library, a frontend, and a local devnet. Scaffolding does that wiring for you, so you start from a runnable project instead of a blank directory. These are the starting points; [Build your first dApp](/docs/developers/curriculum/dapps/your-first-dapp) walks one through end to end.

## dApp templates

Two minimal, runnable dApp starters, one per SDK, each doing the same thing: connect a wallet, show the balance, and send ADA. Browse them in the [templates gallery](/templates), or start a project from one with [giget](https://github.com/unjs/giget) (it copies a single template folder into a new directory):

```bash
# Evolution + Vite + React
npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/evolution-vite-react my-app

# Mesh + Next.js
npx giget@latest gh:cardano-foundation/developer-portal/examples/templates/mesh-nextjs my-app
```

Then `cd my-app`, `npm install`, set a free [Blockfrost](https://blockfrost.io) key in the env file, and `npm run dev`. Browse the source first if you prefer: [evolution-vite-react](https://github.com/cardano-foundation/developer-portal/tree/staging/examples/templates/evolution-vite-react) and [mesh-nextjs](https://github.com/cardano-foundation/developer-portal/tree/staging/examples/templates/mesh-nextjs).

:::tip Walk one through step by step
[Build your first dApp](/docs/developers/curriculum/dapps/your-first-dapp) takes one of these templates from scaffold to a working wallet payment, explaining each piece (connect, read the balance, send ADA) in even Evolution and Mesh tabs.
:::

See [Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools) for how the SDKs compare.

## More starters

- [Mesh Aiken template](https://github.com/MeshJS/mesh-aiken-template): a full-stack starter pairing the Mesh SDK off-chain with Aiken on-chain, when you want a contract from the start.
- The [bootcamp examples](https://github.com/cardano-foundation/developer-portal/tree/staging/examples/bootcamp) are runnable projects for specific lessons (multisig, vesting, NFTs, Hydra, and more).

## cardano-init

[cardano-init](https://github.com/input-output-hk/cardano-init) aims to unify scaffolding into one tool. You pick the tools for each role (on-chain validators, off-chain transaction building, local devnet, infrastructure, or formal methods) and it generates a complete, runnable monorepo with everything pre-wired, plus a working end-to-end example that builds and passes tests. It offers an interactive setup, a one-shot command line, a dry-run preview, and a web-based configurator.

:::info In active development
cardano-init is an early prototype and not yet ready for use. Its templates, CLI flags, and output are still changing. Track progress at the [cardano-init repository](https://github.com/input-output-hk/cardano-init). This page will be expanded as the tooling matures.
:::
