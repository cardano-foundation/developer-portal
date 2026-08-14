---
id: networks-and-test-ada
title: Choose a Network
sidebar_label: Choose a network
description: Pick the network your code runs against, from a public testnet to a private local devnet, and get free test ADA to use it.
---

Every Cardano network runs the same node software and ledger rules, so code you develop against a testnet behaves the same on mainnet. The networks themselves are kept strictly separate: addresses carry a network tag (testnet addresses start with `addr_test`), so a testnet transaction can never land on mainnet by accident. What differs between them is how fast they run, who can see your activity, and what mistakes cost. Development moves through them in order: devnets and testnets to find things out, mainnet to launch. You never need real ADA to develop; the testnets use test ADA (tAda), which has no value and is free from a faucet.

| Network | What it is | Use it for |
|---|---|---|
| **[Local devnet](/docs/developers/curriculum/start-building/local-testing#local-devnets)** | Private, fully configurable network on your own machine | Fast iteration, CI, offline work, and conditions the public networks can't provide |
| **Preview** | Public testnet that receives protocol upgrades weeks before mainnet | Upcoming features; its 1-day epochs also make staking and reward testing faster |
| **Preprod** | Public testnet running mainnet's current protocol and parameters | Day-to-day development and final pre-launch validation |
| **Mainnet** | The production network; transactions spend real ADA and are irreversible | Launching, after testnet validation |

Mainnet produces a block roughly every 20 seconds and the public testnets match it, so they give you real operating conditions: real confirmation times, other participants' transactions in the same blocks, and activity that anyone can inspect. A local devnet trades that realism for control and privacy. You set the block time, epoch length, and protocol parameters, and nothing you do leaves your machine; keep the default parameters and the ledger validates your transactions exactly as the public networks would. Develop on Preprod by default, and move to a [local devnet](/docs/developers/curriculum/start-building/local-testing#local-devnets) when confirmation times slow your loop. Devnets and the tests that need no chain at all are both covered in [Local testing](/docs/developers/curriculum/start-building/local-testing).

Some tools identify networks by number ("network magic") rather than name: Preprod is `1` and Preview is `2`, as in cardano-cli's `--testnet-magic 1`, while mainnet tooling takes `--mainnet`.

## Get test ADA

Request tAda for Preprod or Preview from the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet): paste your wallet address, click "Request funds", and it arrives within a minute or two. You need a testnet address first, which your wallet or SDK generates ([Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys)). The faucet rate-limits per address and asks that you return unused tAda when a project ends.

A [local devnet](/docs/developers/curriculum/start-building/local-testing#local-devnets) needs no faucet: you define the starting balances in its genesis configuration, so funds exist the moment the chain starts.

### Testnet wallets

Most Cardano browser and mobile wallets support both testnets: switch the network to Preprod or Preview in settings ([cardano.org/apps](https://cardano.org/apps) lists them). Hardware devices work through the same browser extensions. When building programmatically, your SDK generates and manages addresses itself (see [Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools)).

## Block explorers

Inspect transactions, addresses, and blocks at [explorer.cardano.org](https://explorer.cardano.org/), which aggregates the major Cardano explorers and supports deeplinks. Append the network for the testnets: [/preprod](https://explorer.cardano.org/preprod) or [/preview](https://explorer.cardano.org/preview).

## Next steps

- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): now build, sign, and submit one
- [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development): what the Cardano context contains, and how to add it to any agent
