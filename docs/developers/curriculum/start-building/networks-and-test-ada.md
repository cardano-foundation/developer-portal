---
id: networks-and-test-ada
title: Networks & Test ADA
sidebar_label: Networks & test ADA
description: Choose a Cardano network, get free test ADA from the faucet, and find a block explorer.
---

Before you build anything, pick a network and get some test ADA. You never need real ADA to develop: the **testnets** mirror mainnet using test ADA (tAda) that has no value, and a **faucet** hands it out for free.

## Choose a network

| Network | Network magic | Purpose | Currency |
|---|---|---|---|
| **Mainnet** | `764824073` | Production; live, real-value apps | Real ADA |
| **Preprod** | `1` | Final validation; mirrors mainnet closely (hard-forks within an epoch of mainnet) | Test ADA |
| **Preview** | `2` | Test upcoming features (hard-forks 4+ weeks before mainnet) | Test ADA |
| **Local devnet** | custom | Fast offline iteration, CI, custom scenarios | Test ADA |

Network magic is the identifier each network advertises during the node handshake. Mainnet's `764824073` is a fixed historical value; the public testnets use small numbers.

**Use Preprod** for most development: it behaves like mainnet. Use **Preview** to try features before they reach mainnet. There is also **SanchoNet** for governance testing ([sancho.network](https://sancho.network)).

:::important
Only deploy to mainnet after thorough testnet testing. Mainnet transactions use real ADA and cannot be reversed.
:::

## Get test ADA

Test ADA (tAda) has no real-world value but lets you transact freely.

- **Preview and Preprod**: request it from the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet). Paste your wallet address, click "Request funds", and it arrives within a minute or two.
- **Guild network** (1-hour epochs, for rapid epoch-boundary testing): request manually in the [Guild Operators channel](https://t.me/guild_operators_official).

You will need a testnet address first, which your wallet or SDK generates ([Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys) explains how). Testnet addresses start with `addr_test`.

### Testnet wallets

- **Light wallets**: most Cardano browser and mobile wallets support the testnets. Switch the network to Preview or Preprod in settings, and browse wallets at [cardano.org/apps](https://cardano.org/apps).
- **Hardware**: supported through a browser wallet extension on Preview and Preprod.
- **Programmatic**: SDKs (see [Choose your tools](/docs/developers/curriculum/start-building/choose-your-tools)) or the [cardano-wallet](/docs/developers/curriculum/dapps/listen-for-payments) HTTP API

## Block explorers

Inspect your transactions, addresses, and blocks at [explorer.cardano.org](https://explorer.cardano.org/), which aggregates the major Cardano explorers and supports deeplinks. Pick the URL for your network:

| Network | Explorer |
|---|---|
| Mainnet | [explorer.cardano.org](https://explorer.cardano.org/) |
| Preprod | [explorer.cardano.org/preprod](https://explorer.cardano.org/preprod) |
| Preview | [explorer.cardano.org/preview](https://explorer.cardano.org/preview) |

## Develop locally (optional)

For offline, deterministic iteration you can run a local network instead of a public testnet. See [Local development networks](/docs/developers/curriculum/production/development-networks) for the options (Yaci DevKit and cardano-testnet) and how to set them up.

## Next steps

- [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction): now build, sign, and submit one
- [Set up your AI assistant](/docs/developers/curriculum/start-building/ai-assisted-development): optionally give your AI coding assistant current Cardano context first
