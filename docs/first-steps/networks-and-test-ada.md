---
id: networks-and-test-ada
title: Networks & Test ADA
sidebar_label: Networks & test ADA
description: Choose a Cardano network, get free test ADA from the faucet, and find a block explorer.
image: /img/og/og-developer-portal.png
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

You will need a testnet address first, which your wallet or SDK generates ([Keys & Wallets](/docs/value/wallets-and-keys) explains how). Testnet addresses start with `addr_test`.

### Testnet wallets

- **Light wallets**: [Lace](https://www.lace.io/), [Eternl](https://eternl.io/), [Yoroi Nightly](https://chromewebstore.google.com/detail/yoroi-nightly/poonlenmfdfbjfeeballhiibknlknepo) (Preview/Preprod/Sancho), [Typhon](https://testnet.typhonwallet.io/) (Preprod)
- **Hardware**: [Ledger](https://www.ledger.com/) (Preview/Preprod)
- **Programmatic**: SDKs (see [Choose your tools](/docs/first-steps/choose-your-tools)) or the [cardano-wallet](/docs/build/integrate/payments/listening-for-payments/cardano-wallet) HTTP API

## Block explorers

Inspect your transactions, addresses, and blocks:

| Explorer | Mainnet | Preprod | Preview |
|---|---|---|---|
| [Cexplorer](https://cexplorer.io) | cexplorer.io | preprod.cexplorer.io | preview.cexplorer.io |
| [Cardanoscan](https://cardanoscan.io) | cardanoscan.io | preprod.cardanoscan.io | preview.cardanoscan.io |
| [Adastat](https://adastat.net) | adastat.net | preprod.adastat.net | preview.adastat.net |

[explorer.cardano.org](https://explorer.cardano.org/) links to all of them and supports deeplinks.

## Using cardano-cli? Set your network

The CLI selects a network via an environment variable:

```bash
export CARDANO_NODE_NETWORK_ID=2      # 1 = preprod, 2 = preview, 4 = sanchonet, "mainnet" = mainnet
export CARDANO_NODE_SOCKET_PATH=~/node.socket
```

If you run your own node, download the network's config and genesis files (example for preprod):

```bash
curl -O -J "https://book.world.dev.cardano.org/environments/preprod/{config,topology,byron-genesis,shelley-genesis,alonzo-genesis,conway-genesis}.json"
```

All environments are listed in the [Cardano Operations Book](https://book.world.dev.cardano.org/environments.html). Running a node is optional for app development, most developers use a [provider](/docs/first-steps/choose-your-tools#get-a-provider) instead.

## Develop locally (optional)

For offline, deterministic iteration you can run a local network instead of a public testnet. See [Local development networks](/docs/get-started/networks/development-networks/overview) for the options (Yaci DevKit and cardano-testnet) and how to set them up.

## Next steps

- [Choose your tools](/docs/first-steps/choose-your-tools): pick an SDK and get a provider key
- [Your first transaction](/docs/first-steps/your-first-transaction): build, sign, and submit
