---
id: testnets-and-devnets
title: Get started with testnets
sidebar_label: Testnets
description: Get started with testnets and devnets
image: ../img/og/og-getstarted-testnets.png
--- 

To make the difference between Cardano mainnet functionality and testnet functionality clearer, we moved the old content of [developers.cardano.org](https://developers.cardano.org) to [testnets.cardano.org](https://testnets.cardano.org) with the launch of this developer portal.
## Cardano testnet
The [Cardano testnet](https://testnets.cardano.org/en/testnets/cardano/overview/) is your playground when testing [Cardano integration](/docs/integrate-cardano/), building with [transaction metadata](/docs/transaction-metadata/), exploring [native tokens](/docs/native-tokens/) or learning how to [operate a stake pool](/docs/operate-a-stake-pool/).

Testnet is an essential part of the development process for Cardano, as it allows developers to test and refine their code before deploying it on the live network, ultimately improving the reliability and security.

### Where to get test ada?

Because the [Cardano testnet](https://docs.cardano.org/cardano-testnet/overview/) is an independent network, separate from the Cardano mainnet, it requires its own token: test ada (tAda).

Test ada is worth nothing. With it you can safely perform all tests free of charge - the reason why you want to develop on the testnet. 

To get free test ada, you need to visit: [Cardano Testnet Faucet.](https://docs.cardano.org/cardano-testnet/tools/faucet)

In depth explanation about Cardano Testnet Faucet can be found [here.](/docs/integrate-cardano/testnet-faucet/)

### What testnet should I use?

#### Preview Testnet

- The preview testnet is a testing environment used to showcase new features and functionality to the Cardano community before they are deployed on the mainnet.
- It allows developers and users to test and provide feedback on new features and changes before they are released to the wider community.
- The preview testnet helps to ensure that new features are user-friendly and meet the needs of the community, ultimately improving the user experience on the mainnet.
- Leads mainnet hard forks by at least 4 weeks. 

You can download the current Cardano blockchain network configuration files for Preview Testnet here: [The Cardano Operations Book > Preview Testnet.](https://book.world.dev.cardano.org/environments.html#preview-testnet)

#### Pre-Production Testnet

- The pre-production testnet is a testing environment used to validate major upgrades and releases before deployment to the mainnet.
- It is a staging area where developers can simulate real-world scenarios and ensure that everything is working as expected before going live.
- The preprod testnet helps to minimize the risk of bugs, security issues, and other problems that could negatively impact the mainnet.
- Hard forks at approximately the same time as mainnet (within an epoch of each other)

You can download the current Cardano blockchain network configuration files for Pre-production Testnet here: [The Cardano Operations Book > Pre-production Testnet.](https://book.world.dev.cardano.org/environments.html#pre-production-testnet)

#### Summary

The pre-production testnet is a more comprehensive testing environment used to validate major upgrades, while the preview testnet is a more targeted testing environment used to showcase new features and gather feedback from the community.

### Where to get a testnet wallet?
- [Daedalus Wallet for Cardano Testnet](https://testnets.cardano.org/en/testnets/cardano/get-started/wallet/) is the testnet version of Daedalus wallet.
- [Nami Wallet](https://namiwallet.io/) is a lightweight wallet developed by Cryptonomic and supports both mainnet and testnet. 
- [Ledger Nano S and Ledger Nano X](https://www.ledger.com/) is a hardware wallets that support both mainnet and testnet.

It's important to note that while all of these wallets support the Cardano testnet, you will need to choose the testnet network option within the wallet when setting it up or switching to testnet.

### Which block explorers can I use for the Cardano testnet?
- [testnet.cardanoscan.io](https://testnet.cardanoscan.io) is a testnet block explorer by [Cardanoscan](https://cardanoscan.io).
- [testnet.cexplorer.io](https://testnet.cexplorer.io/) is a testnet block explorer by [Cexplorer](https://cexplorer.io).

### Which metadata explorers can I use for the Cardano testnet?
- [pool.pm/test/metadata](https://pool.pm/test/metadata) is a testnet metadata explorer by [Pool.pm](https://pool.pm/)
- [bi-testnet.stakepoolcentral.com](https://bi-testnet.stakepoolcentral.com) is a testnet transaction metadata explorer by [CENT](https://cent.stakepoolcentral.com).

### What kind of monitoring tools are available for the testnet?
- [Grafana dashboard](https://monitoring.cardano-testnet.iohkdev.io/grafana/d/Oe0reiHef/cardano-application-metrics-v2?orgId=1&refresh=1m&from=now-7d&to=now) provides many health metrics.
- [Prometheus](/docs/stake-pool-course/handbook/apply-logging-prometheus/#docusaurus_skipToContent_fallback) is used to track the health and performance of Cardano nodes.
