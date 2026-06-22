---
id: scaffolding
title: Project scaffolding
sidebar_label: Scaffolding
description: Start a Cardano dApp from a runnable template instead of a blank directory, with starter templates today and the cardano-init tool on the way.
image: /img/og/og-developer-portal.png
---

## Introduction

Setting up a dApp means wiring together an on-chain language, an off-chain library, a frontend, and a local devnet. Scaffolding does that wiring for you, so you start from a runnable project instead of a blank directory.

## Starter templates

Templates you can clone today:

- [Mesh Aiken template](https://github.com/MeshJS/mesh-aiken-template): a full-stack starter pairing the Mesh SDK off-chain with Aiken on-chain, ready to build on.
- [Evolution SDK Vite and React example](https://github.com/IntersectMBO/evolution-sdk/tree/main/examples/with-vite-react): a frontend starter that wires the Evolution SDK into a Vite and React app.

See [Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools) for how these libraries compare.

## cardano-init

[cardano-init](https://github.com/input-output-hk/cardano-init) aims to unify scaffolding into one tool. You pick the tools for each role (on-chain validators, off-chain transaction building, local devnet, infrastructure, or formal methods) and it generates a complete, runnable monorepo with everything pre-wired, plus a working end-to-end example that builds and passes tests. It offers an interactive setup, a one-shot command line, a dry-run preview, and a web-based configurator.

:::info In active development
cardano-init is an early prototype and not yet ready for use. Its templates, CLI flags, and output are still changing. Track progress at the [cardano-init repository](https://github.com/input-output-hk/cardano-init). This page will be expanded as the tooling matures.
:::
