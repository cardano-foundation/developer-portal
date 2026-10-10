---
title: "On-chain vs off-chain"
sidebar_label: "On-chain vs off-chain"
description: "What a dApp is made of, and the line between off-chain code that builds transactions and an on-chain contract that enforces the rules."
---

# On-chain vs off-chain

Welcome to the Intermediate track. In Beginner you moved value around. Now you will make the chain **enforce rules** about how that value moves. That is a **smart contract**.

## What a dApp is

An app built on a blockchain is called a **dApp**, short for decentralized application. A few separate pieces make one up:

- **A frontend**: the page people see and click.
- **Off-chain code**: normally part of that same page. It reads the chain and builds the transactions.
- **A [provider](/docs/developers/onboarding/lectures/beginner/providers-and-explorers)**: how the dApp reads the chain, and how it gets a finished transaction out to the network.
- **A wallet**: holds the keys and signs. On the web it is usually a browser extension, like the Lace you installed in Beginner.
- **A smart contract**: the rule the network enforces.

You built the first four in Beginner, and **[a transaction, step by step](/docs/developers/onboarding/lectures/beginner/providers-and-explorers#a-transaction-step-by-step)** shows them working together. The smart contract is what this track adds.

Two of those pieces do completely different jobs:

- **Off-chain** is the code that runs **in your browser or on a server** (your app, plus an off-chain SDK). It reads the chain, **builds transactions**, and asks the wallet to sign them. This is the same work you did for the [send](/docs/developers/onboarding/lectures/beginner/utxos-and-transactions) and [mint](/docs/developers/onboarding/lectures/beginner/tokens-fungible-and-nfts) transactions in Beginner. It **prepares**.
- **On-chain** is the **smart contract (logic) and data that lives on the blockchain**. A Cardano smart contract is code that runs on the blockchain and checks whether the transaction is allowed. It either **approves or rejects** the transaction. It **enforces**.

The apps you built [in Beginner](/docs/developers/onboarding/lectures/beginner/introduction) had only off-chain code.

Think of applying for a permit to build something. Your app is the person applying: it decides what it wants to build, fills in every field, and hands the form in. The contract is the officer who reads the form and either approves it or rejects it. The person can ask for anything, and the officer decides what is allowed.

```mermaid
flowchart LR
    subgraph OFF["Off-chain: runs on your machine"]
        App["your app + SDK<br/>builds the transaction"] --> Wallet["wallet<br/>signs it"]
    end

    subgraph ON["On-chain: runs on the network"]
        Chain[("Cardano<br/>network")] -->|runs the contract| Validator{"validator<br/>yes / no"}
        Validator -->|yes| Done["recorded on the chain"]
        Validator -->|no| Rejected["rejected, nothing changes"]
    end

    Wallet -->|submits| Chain
```

As soon as the transaction is sent, control passes to the chain, and the validator makes the final decision. The contract cannot ask your app for more information, and your app cannot change the answer.

## Who does what

Split any Cardano app along that line and it becomes much easier to understand:

| Off-chain (your server/browser) | On-chain (the network) |
|---|---|
| Read the chain: which UTxOs exist, what's locked where | - |
| Decide what _should_ happen | Check whether it's **allowed** |
| Pick the inputs, build the outputs, balance the fee | - |
| Attach the datum and the redeemer | Read the datum and the redeemer |
| Collect the wallet's signature | See which signatures are on the transaction |
| Submit | Answer **yes** or **no** |

Almost every line is on the left.

## Why the split exists

The chain has to reach the **same answer for everyone, forever**. A node checking your transaction today and a node checking that same block ten years from now must both decide the same way. If they did not, they would disagree about who owns what. So a contract may only look at things that are **written down**: the transaction itself, the outputs it spends, and the validity window it declares.

That single requirement explains most of what feels strange at first:

- **A contract cannot call an API**, read a price feed, or fetch anything. Two nodes asking the same server could get two different answers.
- **A contract cannot read a clock.** This is why time became a **slot window** that you declare in advance, back in [Time on Cardano](/docs/developers/onboarding/lectures/beginner/time-on-cardano).
- **A contract keeps no variables of its own between runs.** This does not mean nothing is saved. On Cardano, state lives **on the UTxOs** rather than inside the contract, and everything the validator needs to know must reach it through the transaction context. The next two lectures show how.
- **A contract cannot start anything.** Nothing on Cardano happens because a contract decided to act. Someone has to build a transaction first.

You get something valuable in return: your transactions are **deterministic**. A validator only ever looks at information that is local to the transaction and cannot change once it is written, so running it twice gives the same answer twice, on your machine and on every node. That is why your app can run the contract before sending anything, and know whether the contract approves the transaction and what running it will cost.

That is a promise about the **contract's answer**, not about the transaction getting in. Somebody else may spend the same UTxO first, and then the ledger refuses yours before the contract is even consulted. So the guarantee is: **if** your transaction is accepted, it does exactly what you predicted. Not that it is certain to be accepted.

There is a practical reason for the split as well. Everything on-chain is stored by every node and re-checked forever, so moving the transaction building there too would grow the chain faster than most people could afford to keep up with, and a chain only a few can verify is not decentralized.

## Where the contract runs, and what it can do

**The contract does not run on your computer.** You write it, compile it, and read it in your editor, so it is easy to think of it as part of your app. Your app carries the compiled contract **inside the transaction**, and the **network** runs it when that transaction is checked. The answer is the same for everyone, forever.

**The contract cannot _do_ anything.** Every movement of value in this track is done by a **transaction your off-chain code built**. All the contract ever adds is a yes or a no.

## Try it

**Make the folder you will work in for the rest of the track:**

```bash
mkdir cardano-vault
cd cardano-vault
mkdir on-chain
mkdir off-chain
```

:::note Which terminal, and where you are
These commands work as written on macOS and Linux, and in **PowerShell** on Windows. If you use the older Windows `cmd` prompt, one command later in the track differs: `rm` is `del`.

If a command ever answers **"no such file or directory"**, run `pwd` and check which folder you are standing in.
:::

```
cardano-vault/
├── on-chain/      <- the rules. Compiled, hashed, enforced by every node.
└── off-chain/     <- the app. Runs on your machine and builds transactions. Enforces nothing.
```

The next lecture puts a contract project in `on-chain/` and leaves you working inside it. `off-chain/` stays empty until **[frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)**, which is the one place in the track you change folder again.

Keep the name or pick your own, and read `cardano-vault/` as "wherever you put it".

Code in `off-chain/` can be wrong, or replaced. The network does not care, because it checks every transaction against what is in `on-chain/`.

For the vault you are about to build, the split runs like this. Off-chain builds a transaction that sends ADA to the contract's address, which locks it. Later, off-chain builds a second transaction that tries to spend it back, so on-chain, the validator runs and answers yes or no, and only a "yes" allows the spend.

Stuck? The finished code is in the playground. See the **[introduction](/docs/developers/onboarding/lectures/intermediate/introduction#the-playground)**.

## Go deeper

- [Smart Contracts (overview)](/docs/developers/curriculum/smart-contracts/overview): the on-chain/off-chain split in full.
- [Lock and Spend](/docs/developers/curriculum/smart-contracts/lock-and-spend): the lock-then-spend flow end to end.
- [Cardano for Ethereum developers](/docs/developers/cardano-for-ethereum-developers): the account-model habits that don't carry over: no `msg.sender`, no contract storage, no execution order.
- [The Extended UTXO Model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo): the ledger model that makes this split possible.

Next: **[Set up your tools](/docs/developers/onboarding/lectures/intermediate/tools)**.
