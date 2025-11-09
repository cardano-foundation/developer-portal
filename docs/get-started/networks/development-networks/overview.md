---
id: overview
title: Development Networks
sidebar_label: Overview
description: Local blockchain networks for faster Cardano development and testing.
image: /img/og/og-developer-portal.png
---

Development networks let you run a local Cardano blockchain instance on your machine. Instead of connecting to testnet for every test, you can emulate the network locally with full control over the network state. This gives you a customizable environment for fast iteration during development.

## What They Provide

With a development network, you control the entire blockchain. You can create UTxOs without faucets, set network parameters exactly as needed, adjust genesis configuration and stake distribution to match your testing requirements. Since everything runs locally, you can develop offline without the internet too.

The iteration speed is faster than using public testnets. There's no waiting for block confirmations or dealing with the network itself. You get control over block production, which makes debugging much easier when something goes wrong or edge case testing with rollbacks.

## When to Use Them

Development networks are particularly useful when you're building and testing smart contracts locally or iterating quickly on transaction logic. They're great for testing edge cases without worrying about testnet token availability, and for developing integrations that need deterministic blockchain state.

Once your application is stable, you can move to public testnets for production-like testing before mainnet deployment.

## Available Tools

Cardano offers purpose-built development networks that provide these capabilities out of the box. Choose the one that best fits your workflow and requirements.

import DocCardList from '@theme/DocCardList';

<DocCardList />

