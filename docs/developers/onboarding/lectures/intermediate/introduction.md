---
title: "Intermediate: smart contracts"
sidebar_label: "Introduction"
description: "Smart contracts from scratch: on-chain vs off-chain, validators, datum and redeemer, the tools to write and run them, then vesting, gift cards, oracles and testing."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Intermediate: smart contracts

You finished Beginner, so you can move value around Cardano. This track makes the chain **enforce rules** about how that value moves. That is what a smart contract is. We build up from the ideas to a real contract you compile and run yourself.

:::note Coming from Ethereum?
"Smart contract" means something different here. On Cardano, it is not a deployed program with storage that you call and that then acts. It is a **rule that answers yes or no** to a transaction your app has already built. State still exists, but it lives in the **datum** on a UTxO rather than inside the contract. **[Cardano for Ethereum developers](/docs/developers/cardano-for-ethereum-developers)** covers how Ethereum and Cardano development differ. This track teaches it from scratch.
:::

## What you'll be able to do

After this track you'll be able to:

- Understand how Cardano dApps work under the hood and how you can build your own.
- Read and write Cardano smart contracts.
- Build transactions to interact with smart contracts.
- Connect to a protocol from your website.
- Understand how to work with time, redeemers, datums, and reference scripts.
- Test your contracts properly.
- Understand the architectural choices and implementations of 4 different protocols (vault, vesting, gift card, and oracle).

## The lectures

1. **[On-chain vs off-chain](/docs/developers/onboarding/lectures/intermediate/on-chain-vs-off-chain)**: what a dApp is made of, and the line between your code and the network's rules.
2. **[Set up your tools](/docs/developers/onboarding/lectures/intermediate/tools)**: install the compiler and start a brand new project for the next six lectures.
3. **[What a validator is](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)**: what a validator is, how it works, and what you get when you compile one.
4. **[Datum & redeemer](/docs/developers/onboarding/lectures/intermediate/datum-and-redeemer)**: the data you hand a contract.
5. **[The transaction context](/docs/developers/onboarding/lectures/intermediate/transaction-context)**: everything else a contract can look at before it decides.
6. **[Testing](/docs/developers/onboarding/lectures/intermediate/testing)**: tracing, unit tests and property-based tests.
7. **[Parameters](/docs/developers/onboarding/lectures/intermediate/parameters)**: a value built into the contract itself, before it has an address.
8. **[Validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)**: spend and mint, under one script hash.
9. **[Off-chain and frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)**: derive the address, build every transaction, prove them offline, then connect a wallet and drive the vault from a page in the browser.

Lectures 10 to 12 each start from an idea and walk the same path, from the idea to the design to the code. Lecture 13 is a feature rather than a use case, and it is what lets contracts share code and data:

10. **[Handling time](/docs/developers/onboarding/lectures/intermediate/handling-time)** (vesting): funds that can't move before a date, enforced without the contract ever reading a clock.
11. **[Multi validators](/docs/developers/onboarding/lectures/intermediate/multi-validators)** (a gift card): one script guarding two different actions at once, minting and spending.
12. **[Modifying state](/docs/developers/onboarding/lectures/intermediate/modifying-state)** (an oracle): changing data that's already on the chain.
13. **[Reference inputs & reference scripts](/docs/developers/onboarding/lectures/intermediate/reference-inputs-and-scripts)**: publish a contract once, and let one contract read another's data without consuming it.

## The projects you'll build

Four contracts, and you write all of them: a **vault** that releases funds only to the owner who signs, a **vesting** contract that holds funds until a date, a **gift card** whose token is the key to the funds behind it, and an **oracle** that publishes a value and keeps changing it.

The vault is the long one: lectures 1 to 9 build it a step at a time, one concept per lecture. Lectures 2 to 8 are on-chain only, so you write the validator, compile it and test it with no app yet, and lecture 9 is where you connect it to a website. That order is deliberate: the contract is where the thinking is, and the app that drives it follows from it.

## What you need

Four things. If you finished Beginner, the first is already done.

- **A wallet on the test network.** **[Lace](https://www.lace.io/)** on **Preview**, with a little test ADA, [same as in Beginner](/docs/developers/onboarding/lectures/beginner/wallets-keys-addresses).
- **Collateral set aside in that wallet.** Collateral is a deposit the network only takes if a script fails unexpectedly. It is a one-time setup in the wallet, and **[frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)** explains what it is for. In Lace, see the [Lace FAQ](https://www.lace.io/faq).
- **A provider key.** Your app now has to read UTxOs that are not in your wallet, the ones sitting at a contract's address, and work out what running a validator will cost before it sends anything. A wallet cannot do either, so you need a **[provider](/docs/developers/onboarding/lectures/beginner/providers-and-explorers)**. Get a free **[Blockfrost](https://blockfrost.io/)** Preview key.
- **A compiler for contracts.** You write the vault from lecture 3 onwards, so you need the toolchain for the language you pick:

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Install it from the **[Aiken installation guide](https://aiken-lang.org/installation-instructions)**. It takes about a minute.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## The playground {#the-playground}

Everything in these lectures is also finished and working in one example project, which we call the **playground**. It has every contract in the track, plus a small browser app that drives them: connect a wallet, mint and lock funds, unlock them again, put a deadline on funds, update an oracle, etc.

You do not need it to follow the lectures. It is here for two reasons:

- **To see where you are going.** Run it once now, and the rest of the track is you rebuilding the first part of it yourself.
- **To get unstuck.** Every exercise solution is provided in the playground's code.

Download it, and start the app:

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/intermediate playground
```

<Tabs groupId="offchain">
<TabItem value="mesh" label="Mesh" default>

```bash
cd playground/vault/off-chain/mesh
npm install
cp .env.example .env      # then paste your Blockfrost Preview key into it
npm run dev
```

</TabItem>
<TabItem value="evolution" label="Evolution">

An [Evolution](https://github.com/IntersectMBO/evolution-sdk) version is coming soon. The idea is identical, only the library calls differ.

</TabItem>
</Tabs>

Inside the folder, one directory per contract, and the code you read in these lectures is imported straight from it:

```
playground/
├── vault/          the vault, and its app                  lectures 3-9, 13
│   ├── on-chain/aiken/
│   └── off-chain/mesh/
├── vesting/        handling time                           lecture 10
│   ├── on-chain/aiken/
│   └── off-chain/mesh/
├── giftcard/       multi validators                        lecture 11
│   └── on-chain/aiken/
└── oracle/         modifying state, reference inputs       lectures 12-13
    ├── on-chain/aiken/
    └── off-chain/mesh/
```

**Each folder is a project in its own right.** Its contract and the app that drives it sit side by side, and nothing in it reaches into a sibling, so you can open one, run it, and take it apart without the other three in your way. 

The cost of that separation is that every app is separately installed and separately configured. Each `off-chain/mesh/` wants its own `npm install`, its own `.env`, and its own wallet connection. The `.env.example` files are identical, so once you have filled one in you can copy it across:

```bash
cp vault/off-chain/mesh/.env vesting/off-chain/mesh/.env
```

You never write code in these folders. Every lecture has you build in your own workspace, and the matching folder here is the answer sheet. What you do run from `playground/` are the apps: the vault's in lecture 9, the vesting one in lecture 10, and the oracle one in lecture 12. Each contract is a separate project here, while in your own workspace all five live together in `on-chain/vault/`. That makes no difference to the compiler, which is why the hashes match.

Once `npm run dev` is running, open the printed URL **in the browser where Lace is installed**. Connect, set up collateral, then **Lock 5 ADA** and **Unlock** it again. The **Mint & lock** button does the same thing but also creates a token under the contract's own policy, which is what **[validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)** is about.

Ready? Start with **[On-chain vs off-chain](/docs/developers/onboarding/lectures/intermediate/on-chain-vs-off-chain)**.
