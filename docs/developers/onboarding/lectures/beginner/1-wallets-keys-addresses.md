---
title: "Wallets, keys & addresses"
sidebar_label: "Wallets, keys & addresses"
description: "Your account and identity on Cardano, what a wallet, a key, and an address actually are."
---

# Wallets, keys & addresses

Your account on Cardano is a **wallet**. It comes with two things worth understanding: **keys** and **addresses**.

A **wallet** is your account _and_ your identity in one. The surprising part: your coins aren't "in" the wallet, they live on the blockchain. What the wallet actually holds is your **keys**, the secret that lets you approve (sign) moving that money(tokens). That's why reinstalling the app with your recovery phrase brings your funds back, they were never inside the app.

A **key** is just a secret "hash". Signing with it proves an action is really from you, like a signature that can't be forged.

An **address** is like an **"email" for money**: a public string you give people so they can send you funds (ADA or tokens). Share it freely, knowing your address lets people pay you, nothing more.

:::tip The one rule
Share your **address** freely. Never share your **recovery phrase** or private keys with anyone.
:::

## Try it

Let's make a real wallet on Cardano's free **Preview** test network, where coins have no value.

1. Install **[Lace](https://www.lace.io/)** and create a wallet (write down the recovery phrase).
2. Switch it to the **Preview** network in its settings.
3. Copy your **address** (it starts with `addr_test1...`).
4. Paste your address into the **[Cardano faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)** and request test ADA for Preview.
5. Wait a minute, then paste your address into the **[Cardano explorer for Preview](https://explorer.cardano.org/preview)** and search.

You'll see _your_ address holding the test ADA, read straight from the blockchain. Keep this wallet, you'll reuse it in the next lectures.

## Wallets your app controls

So far the wallet is **yours**, held in Lace, and you approve each action by hand. But sometimes the **app itself** needs a wallet, a key it can sign with, **without a human clicking approve**.

This is _not_ the same as a smart contract. A contract is a **rule** the chain enforces when someone spends funds locked at a script; it can't hold a key, sign, pay a fee, or start a transaction on its own. So whenever your backend has to **act on-chain by itself**, it needs a wallet, for example to:

- **Pay fees for your users** ("gasless" flows), your backend's wallet covers the fee and collateral so the user doesn't have to.
- **Run an automated agent**, a bot or keeper that builds and submits transactions on a schedule or when some off-chain event happens, a contract can't wake itself up.
- **Sign as the service itself**, for example holding one key of a multi-signature treasury, or an oracle signing the data it publishes.

How it works: your backend **loads a key it already has** (for example from an environment variable or a secrets manager), and an off-chain SDK like Mesh or Evolution uses it to build and sign transactions, no browser, no popup. It's just a wallet, the same keys and address idea from above, held by your server instead of a person. (You'll meet this wallet again in the Intermediate track.)

:::warning Your backend now holds the keys
An app-controlled wallet is **custodial**: whoever runs the server controls the funds. Guard those keys like a vault, never commit them to git, keep them in a secrets manager, and use a throwaway **Preview** wallet while you're learning.
:::

## Go deeper

- [Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys)
- [Addresses](/docs/developers/curriculum/fundamentals/core-concepts/addresses)

Next: **[UTxOs & transactions](/docs/developers/onboarding/lectures/beginner/utxos-and-transactions)**.
