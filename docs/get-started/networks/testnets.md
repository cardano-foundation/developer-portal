---
id: testnets
title: Testnets
sidebar_label: Testnets
description: Get started with testnets and devnets
image: /img/og/og-getstarted-testnets.png
---

Cardano testnets let you safely test integrations, build applications, mint tokens, and operate stake pools without spending real ada. Each testnet serves a specific purpose in the development lifecycle.

:::tip
For mainnet configuration and other networks, see the [Networks Overview](/docs/get-started/networks/overview).
:::

## Choosing a testnet

| Network | Network Magic | Purpose | Hard Fork Timing | Epoch Length | Best For |
|---------|--------------|---------|------------------|--------------|----------|
| **Preview** | `2` | Test upcoming features | 4+ weeks before mainnet | Standard (5 days) | Early testing, learning new features |
| **Preprod** | `1` | Pre-production validation | Same time as mainnet | Standard (5 days) | Final validation before mainnet |
| **Guild** | Custom | Rapid development | Flexible | 1 hour | Quick iteration, integration testing |

### Preview testnet

Preview showcases new Cardano features before mainnet deployment. Use Preview to:
- Test upcoming protocol features early
- Provide feedback on new functionality
- Learn new capabilities before they go live

Hard forks on Preview lead mainnet by at least 4 weeks, giving you time to prepare.

**Get configuration files:**

Direct download: [Cardano Operations Book - Preview](https://book.world.dev.cardano.org/environments.html#preview-testnet)

```bash
curl -O -J "https://book.world.dev.cardano.org/environments/preview/{config,db-sync-config,submit-api-config,topology,byron-genesis,shelley-genesis,alonzo-genesis,conway-genesis}.json"
```

### Preprod testnet

Preprod mirrors mainnet as closely as possible. Use Preprod to:
- Validate your application before mainnet deployment
- Test against production-like conditions
- Perform final integration testing

Hard forks on Preprod occur within one epoch of mainnet, making it ideal for final validation.

**Get configuration files:**

Direct download: [Cardano Operations Book - Preprod](https://book.world.dev.cardano.org/env-preprod.html)

```bash
curl -O -J "https://book.world.dev.cardano.org/environments/preprod/{config,db-sync-config,submit-api-config,topology,byron-genesis,shelley-genesis,alonzo-genesis,conway-genesis}.json"
```

### Guild network

Guild Network is a community-maintained testnet optimized for rapid testing with 1-hour epochs. Use Guild to:
- Iterate quickly during development
- Test epoch boundary logic without waiting days
- Access historical data across multiple hard forks (10K+ epochs)

**Important:** Faucet access is manual. Request funds in the [Guild Operators support channel](https://t.me/guild_operators_official).

**Get configuration files:** [Guild Operators GitHub](https://github.com/cardano-community/guild-operators/tree/alpha/files)

## Getting started

### 1. Get a testnet wallet

Choose a wallet that supports your target testnet:

**Light wallets (Browser/Mobile):**
- [Lace](https://www.lace.io/) - IOG wallet supporting Preview, Preprod, and Sancho
- [Eternl](https://eternl.io/) - Supports Preview, Preprod, and Sancho
- [Yoroi Nightly](https://chromewebstore.google.com/detail/yoroi-nightly/poonlenmfdfbjfeeballhiibknlknepo) - Emurgo wallet for Preview, Preprod, and Sancho
- [Typhon](https://testnet.typhonwallet.io/#/wallet/access) - StricaHQ wallet for Preprod

**Hardware wallets:**
- [Ledger Nano S/X](https://www.ledger.com/) - Supports Preview and Preprod

**Developer tools:**
- [cardano-wallet](/docs/build/integrate/payments/listening-for-payments/cardano-wallet) - HTTP API for programmatic access

:::note
Configure your wallet for the testnet network during setup or switch networks in settings.
:::

### 2. Get test ada

Test ada (tAda) has no real-world value but lets you test freely on testnets.

**For Preview and Preprod:**
Visit the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet) for automated tAda distribution.

**For Guild Network:**
Request tAda manually in the [Guild Operators support channel](https://t.me/guild_operators_official).

### 3. Use a block explorer

Monitor your testnet transactions:

- **Preview**: [explorer.cardano.org/preview](https://explorer.cardano.org/preview)
- **Preprod**: [explorer.cardano.org/preprod](https://explorer.cardano.org/preprod)

## Next steps

- [Build your first transaction](/docs/get-started/infrastructure/cardano-cli/basic-operations/simple-transactions)
- [Mint native tokens](/docs/build/native-tokens/minting)
- [Operate a stake pool](/docs/operate-a-stake-pool/)
- [Integrate Cardano](/docs/build/integrate/overview)
