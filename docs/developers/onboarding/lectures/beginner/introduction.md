---
title: "Beginner: Cardano's Fundamentals"
sidebar_label: "Introduction"
description: "Cardano's fundamentals for newcomers: the core ideas you need before building anything, each with something you can run and see."
---

# Beginner: Cardano's Fundamentals

New to Cardano? Start here. This track covers the handful of ideas you need before building anything, and each one comes with something you can **run and see** for yourself.

No blockchain background needed. Some of these ideas will be new, but we build each one up from scratch with everyday comparisons, so if you've written software before, you'll pick them up quickly.

:::note Coming from Ethereum?
You already know blockchains, but Cardano's model (the **eUTxO** ledger) works quite differently from the EVM's accounts and contracts, so this track is still worth a skim. If you'd rather jump straight to the differences, start with **[Cardano for Ethereum developers](/docs/developers/curriculum/fundamentals/cardano-for-ethereum-developers)**, then come back here for the hands-on.
:::

## What you'll be able to do

After this track you'll be able to:

- Set up a wallet on Cardano's free test network and fund it.
- Read a real transaction and see where the value came from and where it went.
- Tell the kinds of tokens apart (including NFTs) and know how they're made.
- Understand how the chain measures time, and put a deadline on a transaction.
- Look up anything on-chain, both the way an app does it and the way a person does it.

## The lectures

1. **[Wallets, keys & addresses](/docs/developers/onboarding/lectures/beginner/wallets-keys-addresses)** — your account and identity on Cardano.
2. **[UTxOs & Transactions](/docs/developers/onboarding/lectures/beginner/utxos-and-transactions)** — how value is stored and moved, and how to build a transaction in code with an SDK.
3. **[Time on Cardano](/docs/developers/onboarding/lectures/beginner/time-on-cardano)** — slots, and why "now" doesn't exist on-chain.
4. **[Native scripts & metadata](/docs/developers/onboarding/lectures/beginner/native-scripts-and-metadata)** — simple on-chain rules and durable transaction notes, no smart contract needed.
5. **[Tokens: fungible & NFTs](/docs/developers/onboarding/lectures/beginner/tokens-fungible-and-nfts)** — custom assets, with a native script as their minting policy.
6. **[Providers & explorers](/docs/developers/onboarding/lectures/beginner/providers-and-explorers)** — how you and your app read the chain.

Each lecture has a **Try it** you can finish in a few minutes and a **Go deeper** link into the handbook when you want the full detail.

## The playground

From lecture 2 onwards you run real transactions on Cardano's free test network. They all live in **one small app**, with every example in this track wired to its own button, grouped by lecture. There's nothing to write: the code each lecture shows you is imported straight from this app's `src/` folder, so what you read is exactly what runs.

You'll need **[Lace](https://www.lace.io/)** on the **Preview** network with a little test ADA, which is what [lecture 1](/docs/developers/onboarding/lectures/beginner/wallets-keys-addresses) sets up. Then grab the app (no need to clone the whole repo) and start it:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/mesh lectures-mesh
cd lectures-mesh
npm install
npm run dev
```

Open the printed URL **in the browser where Lace lives**, and just leave it running for the rest of the track. Each lecture tells you which button to click, and every button prints an **explorer link** so you can see what you just did on-chain. _(Coming back later? `npm run dev` in that folder is all it takes.)_

Ready? Start with **[Wallets, keys & addresses](/docs/developers/onboarding/lectures/beginner/wallets-keys-addresses)**.
