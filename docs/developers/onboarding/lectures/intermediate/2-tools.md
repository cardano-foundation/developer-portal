---
title: "Set up your tools"
sidebar_label: "Set up your tools"
description: "The compiler for the on-chain half, and the contract project everything else in this track fills."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Set up your tools

Two halves, two sets of tools. The on-chain half needs a **compiler and supporting tooling**, because a contract has to become a program the network can run. The off-chain half needs a **library, a provider, and a way to interact with a wallet**, because your app has to read the chain, build transactions, get them signed, and submit them.

**You only need the first set now.** The next six lectures are the contract and nothing else: you write it, compile it, test it, and finish it. The app comes afterwards, once the contract is done, so the focus stays on the contract's own concepts. The off-chain half then arrives all at once in **[frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)**.

## The on-chain toolchain

You do not write the code the network runs. You write it in a high-level language and **compile** it. Several languages do this for Cardano:

- **[Aiken](https://aiken-lang.org/)** is a language made from scratch to write Cardano contracts. It is a small language with a fast compiler and built-in tests, and it is the easiest place to start.
- **[Scalus](https://scalus.org/)** lets teams who already use Scala write contracts in the language they know.
- Others exist for Haskell, Python and TypeScript teams. The [handbook compares them](/docs/developers/curriculum/smart-contracts/choose-a-language), and **[Builder Tools](/tools)** lists them all.

Different languages, **same output**. They all compile to the same low-level program, and they all describe it in the same file format, the **CIP-57 blueprint**. Your off-chain code reads that file and never needs to know which language made it. So the choice matters for your team, not for the chain.

## The off-chain toolchain, so you know what is coming

Nothing to install here. This is the shape of the off-chain half, so that the choices you make now make sense. Three pieces, each with one job.

**The SDK** builds Cardano transactions for you. Without one, every transaction would cost you a lot of time and a lot of code. There are SDKs for JavaScript, Python, Haskell, Java, Go and more, and **[Builder Tools](/tools)** lists them all.

Nothing in these lectures depends on the one you pick: the contract is the same, the transaction is the same, only the function names change. Every code block that needs an SDK sits in a tab, so you can read the track in whichever one you use, and more will be added over time.

**The provider** reads the chain for you and submits your transactions because your app cannot reach the network on its own unless you run your own Cardano node. Beginner used one already. This track leans on it harder, for two reasons:

- **You read UTxOs that are not yours.** Locked funds sit at a contract's address. Your wallet knows nothing about them, so the provider is the only way to find them.
- **A script transaction has to declare its cost.** Running a validator uses CPU and memory, and the transaction carries the budget it expects to use, written next to the redeemer. You also pay for that budget in the fee. So something has to run the contract first, against your unsigned transaction, to find the real number. Your SDK can do that on your machine, or hand the job to a provider that offers it. Either way the answer arrives before you send anything, which is why a contract that says no usually fails in your app rather than on the chain.

You made a free **[Blockfrost](https://blockfrost.io/)** Preview key during setup. That is the provider. Others are listed in **[Builder Tools](/tools)**, and some of them you can run yourself.

**The wallet** holds the keys and signs. Your app never sees a private key: it hands the finished transaction to the wallet, the wallet asks the user, and the user approves. Here that is **[Lace](https://www.lace.io/)** on Preview.

Keep your Blockfrost key and your Lace wallet where they are. Neither is touched again until **[frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)**, which sets all three of these up in one go.

## Try it

**Set up the contract project.** No contract in it yet, **[the next lecture](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)** writes that. This one gets the project compiling.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

Install Aiken from the **[installation guide](https://aiken-lang.org/installation-instructions)**. It takes about a minute. Then build the contract project **inside the on-chain half**, so it lands where it belongs instead of being moved there afterwards:

```bash
cd on-chain
aiken new my-name/vault
cd vault
```

`aiken new` creates the folder in whichever folder you run it from, and fills it with a working project: `aiken.toml` for the settings and dependencies, and `validators/` for your contracts. "Smart contract" is the general word, and the thing you actually write is a **validator**, which is why that folder has the name it does. **[The next lecture](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)** writes your first one. The name is `{organisation}/{repository}`, the same form as the dependencies you will add later, so `my-name/` is a label you can set to anything and `vault` is what the project is called.

Aiken's commands run in the project you're in, so the next six lectures all run from inside `on-chain/vault/`.

`aiken new` leaves a sample validator behind. You do not need it, and it would end up in your compiled output, so delete it:

```bash
rm validators/placeholder.ak
```

Check that the project works:

```bash
aiken check
```

It compiles and reports `"total": 0` tests, because the project is empty. That is the answer you want here.

Your contracts go in `validators/`.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the tooling differs.

</TabItem>
</Tabs>

Your workspace now has something in the on-chain folder:

```
cardano-vault/
├── on-chain/
│   └── vault/            <- you are here, and stay here until lecture 9
│       ├── aiken.toml
│       └── validators/   <- your contracts
└── off-chain/            <- still empty, filled in lecture 9
```

You are ready to write your first validator. Keep going in the next lecture.

Stuck? The finished code is in the playground. See the **[introduction](/docs/developers/onboarding/lectures/intermediate/introduction#the-playground)**.

## Go deeper

- [Choose a Smart Contract Language](/docs/developers/curriculum/smart-contracts/choose-a-language): Aiken, Scalus and the rest, and why they all compile to the same core.
- [Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools): how to pick an off-chain library.
- [Builder Tools](/tools): every SDK, library and API on the portal.
- [Use a provider](/docs/developers/curriculum/production/use-a-provider): hosted, self-hosted, and local options.
- [Query the chain](/docs/developers/curriculum/start-building/query-the-chain): reading addresses, UTxOs and datums.
- [Testing](/docs/developers/curriculum/smart-contracts/testing): unit tests, property tests, and how far you can get before touching a chain.

Next: **[What a validator is](/docs/developers/onboarding/lectures/intermediate/what-is-a-validator)**.
