---
id: defi-kernel
title: DeFi Kernel
sidebar_label: DeFi Kernel
description: An open standard for permissionless, composable, and discoverable DeFi on Cardano, with a shared chain-wide order book.
---

[DeFi Kernel](https://defikernel.org/) is an open community standard for publishing financial intent on Cardano. The idea is a single order book the size of the whole chain: any participant can write an order, any participant can fill it, with no batcher, no administrator, and no permission required. Think of it as a neutral substrate, the way the Linux kernel is for operating systems, that every Cardano DeFi application can build on, share liquidity through, and compose with atomically.

It is not a DEX or a lending protocol. It is the layer those can sit on so they share one liquidity pool instead of each bootstrapping their own.

## The three rules

A contract is DeFi-Kernel-compatible if it satisfies three properties. There is no committee, whitelist, or token gate. Conform to the rules and your contract inherits the ecosystem's liquidity, users, and tooling.

- **Permissionless.** Users sign and submit their own transactions directly to a node. No off-chain operator sits between intent and settlement, so no one can censor a fill or front-run a maker. The contract validates, and that is the whole stack.
- **Composable.** Every compatible contract publishes its datum schema in the open, so any other contract or wallet can read it and chain transactions across protocols. A swap, a loan repayment, and an option exercise can settle in one transaction with one signature.
- **Discoverable.** Orders must be findable by anyone running a node, through beacon tokens, deterministic addresses, or another on-chain tagging mechanism. The UTxO set itself is the order book, with no central indexer to trust.

## Why it matters for your dApp

Bootstrapping liquidity is the hardest part of launching a DeFi app. On the kernel you do not start from zero: a compatible contract inherits the chain-wide order book on day one, and every order becomes a building block that composes with every other. Capital flows across applications instead of pooling in silos.

## Build on it

The standard, the brief, and a live registry of compatible contracts (covering DEX, lending, options, and synthetics protocols) live at [defikernel.org](https://defikernel.org/). To make a contract discoverable to the ecosystem, open a pull request against the [DeFi Kernel Registry](https://github.com/DeFiKernel-Cardano/DeFi-Kernel-Registry-for-Cardano) with your script hashes and datum schema.
