---
title: "Environment"
sidebar_label: "Environment"
description: The example project, tools, wallet, test network, and provider you need to run the atomic swap.
---

# Environment

Let's get your environment ready to run the example. Here's each piece, what it is, and why you need it. Nothing here touches real money, you'll work on a free test network the whole time.

## Get the example

You'll run a ready-made project, not write it from scratch. Grab just this example:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/atomic-swap atomic-swap
cd atomic-swap
```

Inside you'll find `on-chain/aiken` (the contract), `off-chain/mesh` (the off-chain code and the web app), and a README. The commands on the next pages run from these folders.

Prefer the whole portal repo instead? Clone it and open the example folder:

```bash
git clone https://github.com/cardano-foundation/developer-portal.git
cd developer-portal/examples/onboarding/atomic-swap
```

## The tools

### Necessary

To run the example, you only need Node.js:

- **[Node.js](https://nodejs.org/)** (version 20 or newer) and a package manager (npm). The off-chain code and the web app are a normal JavaScript project, `npm install` pulls in the Cardano SDK (this example uses [Mesh](https://github.com/MeshJS/mesh), the library that builds Cardano transactions and talks to your wallet) and everything else.

### Optional

These are optional, only if you want to go beyond just running it:

- **[Aiken](https://aiken-lang.org/)** the language this example's smart contract is written in. You do **not** need it to run the tutorial, the contract is already compiled to a file (`plutus.json`) that ships with the example. Install it with [`aikup`](https://aiken-lang.org/installation-instructions) only if you want to change or recompile the contract yourself, which the [On-chain](/docs/developers/onboarding/tutorial/on-chain) page walks through.
- **A code editor** any editor works, but something like [VS Code](https://code.visualstudio.com/) with a TypeScript and an Aiken extension gives you syntax highlighting and autocomplete, which makes reading along smoother.

## A wallet

A **wallet** is an app that holds your secret keys and lets you approve (sign) transactions, think of it as your account. Install a browser wallet and switch it to a **test network**. Popular ones are **[Lace](https://www.lace.io/)**, **[Eternl](https://eternl.io/)**, and **[Typhon](https://typhonwallet.io/)**; this tutorial's app connects to **Lace**, so use that one here.

:::warning Switch your wallet to Preview first
Lace starts on **Mainnet** (real funds). This tutorial runs entirely on the **Preview** test network, so open your wallet's network settings and select **Preview** before you start (for Lace, see the [Lace FAQ](https://www.lace.io/faq)). On the wrong network nothing will work, you won't see your test ADA, the app won't find any offers, and connecting misbehaves.
:::

One wallet is enough. A real swap is between two people, but in this tutorial you'll play both sides yourself from a single wallet, so there's nothing to juggle. (Want to run a genuine two-party trade with a second wallet? See [Go further: a real two-party swap](/docs/developers/onboarding/tutorial/frontend#go-further-a-real-two-party-swap).)

## A test network and some test coins

You'll work on a **test network**, a full copy of Cardano meant for practice, where the coins have no real value. This tutorial uses the network called **Preview**.

Every transaction costs a small fee paid in ADA (Cardano's coin), so your wallet needs a little test ADA. Get it for free from the [Cardano faucet](https://docs.cardano.org/cardano-testnets/tools/faucet), a website that sends free test coins to any address you paste in. Copy your wallet's address and paste it there to receive the test ADA.

See [Networks and test ADA](/docs/developers/curriculum/start-building/networks-and-test-ada) if you want the full rundown.

## Set up collateral in your wallet

Some steps here run a smart contract (minting a token, doing a swap). Cardano asks every smart-contract transaction to point at a bit of **collateral**: a small amount of ADA your wallet sets aside, only ever spent if a transaction fails a final safety check. Think of it as a refundable deposit, in normal use it's never touched.

You do this once per wallet, after it has some test ADA. Wallets set collateral in slightly different places, so check your wallet's own guide for the steps. For Lace, see the [Lace FAQ](https://www.lace.io/faq). If you skip this, the app will stop with *"wallet has no collateral UTxO"* when you try to mint or swap.

## A way to reach the blockchain (a provider)

Your app can't talk to the Cardano network directly, it needs a service that reads data from the chain (like "what tokens are at this address?") and delivers your transactions to the network. That service is called a **provider**.

This example is set up to use **[Blockfrost](https://blockfrost.io/)**, a hosted provider (nothing to run yourself). Sign up, create a **Preview** project, and copy the API key (it's free). That's the key you'll paste into the app's environment file later.

You're not locked into Blockfrost, though. The SDK works with several providers, and switching is a small code change (swap `BlockfrostProvider` in the code for the one you want):

- **Hosted** (nothing to run yourself): **[Blockfrost](https://blockfrost.io/)** (used here), **[Maestro](https://www.gomaestro.org/)**, or **[Demeter](https://demeter.run/)**.
- **Self-hosted** (you run it, for full control): **[Kupo](https://github.com/CardanoSolutions/kupo)**, **[Ogmios](https://github.com/CardanoSolutions/ogmios)**, or **[Dolos](https://github.com/txpipe/dolos)**.
- **Local** (a whole test network on your own machine): **[Yaci DevKit](https://github.com/bloxbean/yaci-devkit)**.

See [Use a provider](/docs/developers/curriculum/production/use-a-provider) and [Query the chain](/docs/developers/curriculum/start-building/query-the-chain) to go deeper.

---

Got all of that? Next, take a look at the contract: the [on-chain rules](/docs/developers/onboarding/tutorial/on-chain).
