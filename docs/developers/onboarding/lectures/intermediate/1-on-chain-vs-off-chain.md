---
title: "On-chain vs off-chain"
sidebar_label: "On-chain vs off-chain"
description: "Every Cardano app has two halves: off-chain code that builds transactions, and an on-chain contract that enforces the rules."
---

# On-chain vs off-chain

Welcome to the Intermediate track. In Beginner you moved value around. Now you will make the chain **enforce rules** about how that value moves. That is a **smart contract**.

One idea has to be clear before any code, because the rest of the track is built on it. The apps you built [in Beginner](/docs/developers/onboarding/lectures/beginner/introduction) had only one half: your code. Add a smart contract and there is a second half. The two do completely different jobs.

- **Off-chain** is the code that runs **on your computer or server** (your app, plus an off-chain SDK). It reads the chain, **builds transactions**, and asks the wallet to sign them. This is the same work you did for the [send](/docs/developers/onboarding/lectures/beginner/utxos-and-transactions) and [mint](/docs/developers/onboarding/lectures/beginner/tokens-fungible-and-nfts) transactions in Beginner. It **prepares**.
- **On-chain** is the **smart contract that lives on the blockchain**. It is a rule that runs when someone tries to spend locked funds, and it either **approves or rejects** the transaction. It **enforces**.

Think of applying for a permit to build something. Your app is the person applying: it decides what it wants to build, fills in every field, and hands the form in. The contract is the officer who reads the form and either approves it or rejects it. The person can ask for anything, and the officer decides what is allowed. Notice what the officer never does. They do not decide what to build, and they do not build it themselves. They only decide yes or no.

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

Read it from left to right. Everything in the left box is your side of the line. It is work your code does before anything is final. As soon as the transaction is sent, control passes to the chain, and the validator makes the final decision. Notice that no arrow comes back. The contract cannot ask your app for more information, and your app cannot change the answer.

## Who does what

Split any Cardano app along that line and it becomes much easier to understand:

| Off-chain (your code, your machine) | On-chain (the contract, the network) |
|---|---|
| Read the chain: which UTxOs exist, what's locked where | - |
| Decide what _should_ happen | Check whether it's **allowed** |
| Pick the inputs, build the outputs, balance the fee | - |
| Attach the datum and the redeemer | Read the datum and the redeemer |
| Collect the wallet's signature | See which signatures are on the transaction |
| Submit | Answer **yes** or **no** |

Almost every line is on the left. The next section explains why.

## Why the split exists

The chain has to reach the **same answer for everyone, forever**. A node checking your transaction today and a node checking that same block ten years from now must both decide the same way. If they did not, they would disagree about who owns what. So a contract may only look at things that are **written down**: the transaction itself, the outputs it spends, and the validity window it declares.

That single requirement explains most of what feels strange at first:

- **A contract cannot call an API**, read a price feed, or fetch anything. Two nodes asking the same server could get two different answers.
- **A contract cannot read a clock.** This is why time became a **slot window** that you declare in advance, back in [Time on Cardano](/docs/developers/onboarding/lectures/beginner/time-on-cardano).
- **A contract keeps no variables of its own between runs.** This does not mean nothing is saved. On Cardano, state lives **on the UTxOs** rather than inside the contract, and everything the validator needs to know must reach it through the transaction. The next two lectures show how.
- **A contract cannot start anything.** Nothing on Cardano happens because a contract decided to act. Someone has to build a transaction first.

You get something valuable in return. Because nothing is measured at the moment of checking, your app can have the contract run **before sending the transaction** and already know what it will answer. A spend the contract would refuse is caught then, and never has to be sent.

That is a promise about the **contract's answer**, not about the transaction getting in. Somebody else may spend the same UTxO first, and then the ledger refuses yours before the contract is even consulted. So the guarantee is: **if** your transaction is accepted, it does exactly what you predicted. Not that it is certain to be accepted.

## Two things that surprise newcomers

**The contract does not run on your computer.** You write it, compile it, and read it in your editor, so it is easy to think of it as part of your app. It is not. Your app carries the compiled contract **inside the transaction**, and the **network** runs it when that transaction is checked. The answer is the same for everyone, forever.

**The contract cannot _do_ anything.** It never sends funds, never updates a balance, and never changes data on its own. Every movement of value in this track is done by a **transaction your off-chain code built**. All the contract ever adds is a yes or a no. All the action is off-chain, and all the enforcement is on-chain. Remember that sentence, because the rest of this track repeats it in different forms.

## Try it

**Make the folder you will work in for the rest of the track.** It holds the two halves of this lecture, one each, and you fill them yourself:

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

Both are empty. The next lecture puts a contract project in `on-chain/` and leaves you working inside it. `off-chain/` stays empty until **[frontend integration](/docs/developers/onboarding/lectures/intermediate/frontend-integration)**, which is the one place in the track you change folder again.

Keep the name or pick your own, and read `cardano-vault/` as "wherever you put it".

Which half a file belongs in is always worth knowing. Code in `off-chain/` can be wrong, or replaced. The network does not care, because it checks every transaction against what is in `on-chain/`. Code in `on-chain/` is the part the network enforces.

For the vault you are about to build, the split runs like this. Off-chain builds a transaction that sends ADA to the contract's address, which locks it. Later, off-chain builds a second transaction that tries to spend it back, so on-chain, the validator runs and answers yes or no, and only a "yes" allows the spend. Every contract you write follows this shape.

Stuck? The finished code is in the playground — see the **[introduction](/docs/developers/onboarding/lectures/intermediate/introduction#the-playground)**.

## Go deeper

- [Smart Contracts (overview)](/docs/developers/curriculum/smart-contracts/overview) — the on-chain/off-chain split in full.
- [Lock and Spend](/docs/developers/curriculum/smart-contracts/lock-and-spend) — the lock-then-spend flow end to end.
- [Cardano for Ethereum developers](/docs/developers/cardano-for-ethereum-developers) — the account-model habits that don't carry over: no `msg.sender`, no contract storage, no execution order.
- [The Extended UTXO Model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo) — the ledger model that makes this split possible.

Next: **[Set up your tools](/docs/developers/onboarding/lectures/intermediate/tools)**.
