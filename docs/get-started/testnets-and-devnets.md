---
id: testnets-and-devnets
title: Get started with testnets
sidebar_label: Testnets
description: Get started with testnets and devnets
image: /img/og/og-getstarted-testnets.png
--- 

To make the difference between Cardano mainnet functionality and testnet functionality clearer, we moved the old content of [developers.cardano.org](https://developers.cardano.org) to [testnets.cardano.org](https://testnets.cardano.org) with the launch of this developer portal.
## Cardano testnets
The [Cardano testnets](https://testnets.cardano.org/en/testnets/cardano/overview/) are your playgrounds when testing [Cardano integration](/docs/integrate-cardano/), building with [transaction metadata](/docs/transaction-metadata/), exploring [native tokens](/docs/native-tokens/) or learning how to [operate a stake pool](/docs/operate-a-stake-pool/).

The Testnets are an essential part of the development process for Cardano, as they allow developers to test and refine their code before deploying it on the live network, ultimately improving the reliability and security.

### What testnet should I use?

#### Preview Testnet

- The Preview Testnet is a testing environment used to showcase new features and functionality to the Cardano community before they are deployed on the Mainnet.
- It allows developers and users to test and provide feedback on new features and changes before they are released to the wider community.
- The Preview Testnet helps to ensure that new features are user-friendly and meet the needs of the community, ultimately improving the user experience on the Mainnet.
- Leads Mainnet hard forks by at least 4 weeks. 

You can download the current Cardano blockchain network configuration files for Preview Testnet here: [The Cardano Operations Book > Preview Testnet.](https://book.world.dev.cardano.org/environments.html#preview-testnet)

#### Guild Network

- Guild Network is a community maintained public testnet network that is primarily useful for 'quick' testing for development/integrations, as it runs short 1-hour epochs.
- The primary use-case for this network is often short-term scope-specific testing, it has gone through previous forks on cardano chain with minimal data to ensure we do have different data objects across older forks. The faucet distribution for this network is manual and available with members across timezones based on request in [support](https://t.me/guild_operators_official) channel.
- The timeline for forks lead Mainnet but are flexible depending on community needs that could be discussed on [github](https://github.com/cardano-community/guild-operators/) (unless specific conditions require testing beforehand), and is useful for testing data against longer history (over 10K epochs).

You can download the current Cardano blockchain network configuration files for Guild Network [here](https://github.com/cardano-community/guild-operators/tree/alpha/files)

#### Pre-Production Testnet

- The Pre-Production Testnet is a testing environment used to validate major upgrades and releases before deployment to the Mainnet.
- It is a staging area where developers can simulate real-world scenarios and ensure that everything is working as expected before going live.
- The preprod testnet helps to minimize the risk of bugs, security issues, and other problems that could negatively impact the Mainnet.
- Hard forks at approximately the same time as Mainnet (within an epoch of each other)

You can download the current Cardano blockchain network configuration files for Pre-Production Testnet here: [The Cardano Operations Book > Pre-Production Testnet.](https://book.world.dev.cardano.org/environments.html#pre-production-testnet)

#### Summary

The Pre-Production Testnet is a more comprehensive testing environment used to validate major upgrades, while the Preview Testnet is a more targeted testing environment used to showcase new features and gather feedback from the community.

### Where to get a testnet wallet?
- [Daedalus Wallet for Cardano Testnet](https://testnets.cardano.org/en/testnets/cardano/get-started/wallet/) is the Pre-Production and Preview versions of Daedalus wallet.
- [Nami Wallet](https://namiwallet.io/) is a lightweight wallet developed by Cryptonomic and supports both Pre-Production and Preview testnets.
- [Eternl Wallet](https://eternl.io/) is a another lightweight wallet supporting both testnets with both single- and multiple-address wallets.
- [Ledger Nano S and Ledger Nano X](https://www.ledger.com/) are hardware wallets that support both Pre-Production and Preview testnets.
- [Cardano-wallet](/docs/integrate-cardano/listening-for-payments-wallet) is a convenient way of using the cardano-wallet HTTP Application Programming Interface.

It's important to note that while all of these wallets support Cardano testnets, you will need to choose the testnet network option within the wallet when setting it up or switching to testnet.

### Where to get test ada?

Because the [Cardano testnets](https://docs.cardano.org/cardano-testnet/overview/) are independent networks, separate from the Cardano mainnet, they requires their own token: test ada (tAda).

Test ada is worth nothing. With it you can safely perform all tests free of charge - the reason why you want to develop on the testnets. 

To get free test ada for Preprod or Preview, you need to visit: [Cardano Testnet Faucet.](https://docs.cardano.org/cardano-testnet/tools/faucet)

In depth explanation about Cardano Testnet Faucet can be found [here.](/docs/integrate-cardano/testnet-faucet/)

### Which block explorers can I use for the Cardano testnets?
- [testnet.cardanoscan.io](https://testnet.cardanoscan.io) is a Pre-Production and Preview block explorer by [Cardanoscan](https://cardanoscan.io).
- [testnet.cexplorer.io](https://testnet.cexplorer.io/) is a Pre-Production and Preview block explorer by [Cexplorer](https://cexplorer.io).

### Which metadata explorers can I use for the Cardano testnets?
- [pool.pm/test/metadata](https://pool.pm/test/metadata) is a testnet metadata explorer by [Pool.pm](https://pool.pm/)
- [bi-testnet.stakepoolcentral.com](https://bi-testnet.stakepoolcentral.com) is a testnet transaction metadata explorer by [CENT](https://cent.stakepoolcentral.com).

### What kind of monitoring tools are available for the testnets?
- [Grafana dashboard](https://monitoring.cardano-testnet.iohkdev.io/grafana/d/Oe0reiHef/cardano-application-metrics-v2?orgId=1&refresh=1m&from=now-7d&to=now) provides many health metrics.
- [Prometheus](/docs/stake-pool-course/handbook/apply-logging-prometheus/#docusaurus_skipToContent_fallback) is used to track the health and performance of Cardano nodes.
