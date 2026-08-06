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
2. **What a validator is** — a yes/no gatekeeper that guards a locked UTxO.
3. **Datum & redeemer** — the data you hand a contract.
4. **Validator purposes** — spend, mint, withdraw, under one script hash.
5. **On-chain tools** — write a validator and compile it.
6. **Off-chain SDKs** — drive the contract from code, and run the whole thing.

Those six build the machine. The next five are what you build with it:

7. **Handling time: vesting** — funds that can't move before a date, enforced without the contract ever reading a clock.
8. **Multi validators: a gift card** — one script guarding two different actions at once, and minting from a contract.
9. **Modifying state: an oracle** — changing data that's already on the chain.
10. **Reference inputs & reference scripts** — publish a contract once, and let one contract read another's data without consuming it.
11. **Testing** — tracing, unit tests, property-based tests and offline scenario tests.

Lectures 1 to 6 build **one worked example**: a vault that locks funds and only releases them to the owner who signs. You'll compile it, then lock and unlock real test ADA in the browser. The later lectures each add a small contract beside it in the same project.

## The playground

Your contract runs **on the chain**. What runs in your browser is **one small app** that drives it: connect a wallet, lock funds at the validator's address, then unlock them again. Later you will also put a deadline on funds and update an oracle. The app builds transactions and gives them to your wallet. The network runs the contract and answers yes or no. That split is lecture 1, and you will see it again in every lecture after it.

As in the Beginner track, the contracts and the app code you'll read are imported straight from this project, so what you read is exactly what runs.

It needs a little more than the Beginner playground did, for two reasons. Your app now has to read UTxOs that are not in your wallet, the ones sitting at a contract's address. And before it sends anything, it has to work out what running the validator will cost. A wallet cannot do either of these, so you need a **[provider](/docs/developers/onboarding/lectures/beginner/providers-and-explorers)**. Get a free **[Blockfrost](https://blockfrost.io/)** Preview key. You will also set up **collateral** in the wallet. Collateral is a deposit that the network only takes if a script fails unexpectedly.

You'll need **[Lace](https://www.lace.io/)** on **Preview** with a little test ADA, [same as in Beginner](/docs/developers/onboarding/lectures/beginner/wallets-keys-addresses). Then grab the example (no need to clone the whole repo):

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/intermediate intermediate
```

Inside it are the two halves from lecture 1: an `on-chain/` folder holding the contracts, and an `off-chain/` folder holding the app. Start the app:

<Tabs groupId="offchain">
<TabItem value="mesh" label="Mesh" default>

```bash
cd intermediate/off-chain/mesh
npm install
cp .env.example .env      # paste your Blockfrost Preview key
npm run dev
```

</TabItem>
<TabItem value="evolution" label="Evolution">

An [Evolution](https://no-witness-labs.github.io/evolution-sdk/) version is coming soon. The idea is identical, only the library calls differ.

</TabItem>
</Tabs>

Open the printed URL **in the browser where Lace is installed**, and leave it running for the rest of the track. The compiled contracts are already included, so the app runs even if you have no contract toolchain installed.

You will still want one early. From lecture 2 onwards, most lectures end with a contract you can compile and test in a few seconds. In lecture 5 you compile the vault yourself and choose your language.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Install it from the **[Aiken installation guide](https://aiken-lang.org/installation-instructions)**. It takes about a minute. If you would rather read first, every exercise also works if you only predict the answer.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

Ready? Start with **[On-chain vs off-chain](/docs/developers/onboarding/lectures/intermediate/on-chain-vs-off-chain)**.
