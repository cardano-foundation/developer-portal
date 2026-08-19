---
title: "Intermediate: smart contracts"
sidebar_label: "Introduction"
description: "Smart contracts from scratch — on-chain vs off-chain, validators, datum and redeemer, the tools to write and run them, then vesting, gift cards, oracles and testing."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Intermediate: smart contracts

You finished Beginner, so you can move value around Cardano. This track makes the chain **enforce rules** about how that value moves. That is what a smart contract is. We build up from the ideas to a real contract you compile and run yourself.

:::note Coming from Ethereum?
"Smart contract" means something different here. On Cardano it is not a deployed program with storage that you call and that then acts. It is a **rule that answers yes or no** to a transaction your app already built. State still exists, but it lives in the **datum** on a UTxO rather than inside the contract. **[Cardano for Ethereum developers](/docs/developers/cardano-for-ethereum-developers)** covers the rest. This track builds the model from scratch anyway.
:::

## What you'll be able to do

After this track you'll be able to:

- Split any Cardano app into two halves: the part your code prepares, and the part the chain enforces.
- Read a validator and say what it lets through and what it rejects.
- Choose what goes in a datum and what goes in a redeemer, and explain why.
- Write a validator, compile it, and get a script address out of the blueprint.
- Build the transactions that lock funds at that address and unlock them again, collateral included.
- Run a contract you wrote end to end on the test network, and watch it refuse a spend that breaks its rule.
- Put a deadline on funds, mint a token from a contract, and change data that's already on the chain.
- Publish a contract once instead of carrying it in every transaction, and let one contract read another's data without consuming it.
- Test a contract properly before it ever holds anything real.

## The lectures

1. **[On-chain vs off-chain](/docs/developers/onboarding/lectures/intermediate/on-chain-vs-off-chain)** — the two halves: your app prepares and the chain enforces.
2. **[Set up your tools](/docs/developers/onboarding/lectures/intermediate/tools)** — a language and compiler, and the contract project the next six lectures fill.
3. **[What a validator is](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)** — a yes/no gatekeeper that guards a locked UTxO.
4. **[Datum & redeemer](/docs/developers/onboarding/lectures/intermediate/datum-and-redeemer)** — the data you hand a contract.
5. **[The transaction context](/docs/developers/onboarding/lectures/intermediate/transaction-context)** — everything else a contract can look at before it decides.
6. **[Testing](/docs/developers/onboarding/lectures/intermediate/testing)** — tracing, unit tests and property-based tests, so the next two lectures can change the contract safely.
7. **[Parameters](/docs/developers/onboarding/lectures/intermediate/parameters)** — a value built into the contract itself, before it has an address.
8. **[Validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)** — spend and mint, under one script hash.

Those eight are the contract, and nothing after them changes it. The ninth is the other half, all at once:

9. **[Off-chain and frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)** — derive the address, build every transaction, prove them offline, then connect a wallet and drive the vault from a page in the browser.

The last four are what you build with the machine:

10. **Handling time: vesting** — funds that can't move before a date, enforced without the contract ever reading a clock.
11. **Multi validators: a gift card** — one script guarding two different actions at once, and minting from a contract.
12. **Modifying state: an oracle** — changing data that's already on the chain.
13. **Reference inputs & reference scripts** — publish a contract once, and let one contract read another's data without consuming it.

## You write the vault, one lecture at a time

Lectures 1 to 9 build **one worked example**: a vault that locks funds and only releases them to the owner who signs. You do not read it, you write it.

**The contract comes first, and it comes alone.** Lectures 2 to 8 are on-chain only: you write the validator, compile it, test it and finish it, with no app yet. The whole off-chain half is lecture 9. That is deliberate. The contract is where the thinking is, and it changes with every idea in the track, while the app that drives it is nearly the same code every time.

Lectures 1 and 2 set up your workspace, `cardano-vault/`, with a half for each side, and leave you inside the contract project at `on-chain/vault/`. You stay there through lecture 8, so every Aiken command is the short kind: `aiken check`, `aiken add`, `aiken build`, with no paths to get wrong. Lecture 9 steps back up to the root, and that is the last folder change in the track. In between, each lecture explains one idea and has you add it to your contract: a validator that says yes to everybody, then the datum and redeemer, then the rule itself, then tests to hold it still, then a backup key, and finally a **mint** purpose so the vault can create its own token.

Each step is a few lines and one command, and each one ends with a clean `aiken check`. From **[testing](/docs/developers/onboarding/lectures/intermediate/testing)** onwards it also ends with a passing test suite, which is what makes the two lectures after it safe: both change a contract that already works.

The four lectures after that work differently. Those contracts arrive finished, and the exercises have you break one and write the missing rule back.

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

Everything in these lectures is also finished and working in one example project, which we call the **playground**. It has every contract in the track, plus a small browser app that drives them: connect a wallet, mint and lock funds, unlock them again, put a deadline on funds, update an oracle.

You do not need it to follow the lectures. It is here for two reasons:

- **To see where you are going.** Run it once now, and the rest of the track is you rebuilding the first part of it yourself.
- **To get unstuck.** Every exercise says the same thing at the end: the finished code is here.

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

Open the printed URL **in the browser where Lace is installed**. Connect, set up collateral, then **Lock 5 ADA** and **Unlock** it again. The **Mint & lock** button does the same thing but also creates a token under the contract's own policy, which is what **[validator purposes](/docs/developers/onboarding/lectures/intermediate/validator-purposes)** is about.

Inside the folder, one directory per contract, and the code you read in these lectures is imported straight from it:

```
playground/
├── vault/          the contract you are about to write     lectures 3-9, 13
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

Lectures 10 to 13 work directly in these folders, with `playground/` as the folder you run from: a different workspace, named on every command. Lectures 1 to 9 do not: there you build your own, and `playground/vault/` is the answer sheet.

Ready? Start with **[On-chain vs off-chain](/docs/developers/onboarding/lectures/intermediate/on-chain-vs-off-chain)**.
