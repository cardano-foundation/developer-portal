---
id: overview
slug: /integrate-cardano/
title: Integrate Cardano
sidebar_label: Overview
description: How to integrate Cardano into existing websites and services.
image: /img/og/og-developer-portal.png
--- 


![Integrate Cardano](../../static/img/card-integrate-cardano-title.svg)

## Introduction
Here we show you how to integrate Cardano into existing websites and services. 

## Integration Components
- [Overview](docs/get-started/cardano-node/cardano-components.md) of the different Cardano components.
- [cardano-node](https://github.com/IntersectMBO/cardano-node) is the top level for the node and aggregates the other components from other packages: consensus, ledger and networking, with configuration, CLI, logging and monitoring.
- [cardano-wallet](https://github.com/cardano-foundation/cardano-wallet) helps you manage ada. You can use it to send and receive payments on the Cardano blockchain via a http and cli interface.
- [cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync) follows the Cardano chain and takes information from the chain and an internally maintained copy of ledger state. Data is then extracted from the chain and inserted into a PostgreSQL database. 
- [cardano-graphql](https://github.com/cardano-foundation/cardano-graphql) a cross-platform, typed, and queryable API for Cardano.
- [cardano-rosetta](https://github.com/cardano-foundation/cardano-rosetta) a multi-platform implementation of [Rosetta](https://www.rosetta-api.org) for Cardano, targeting the version defined in the [OpenApi schema](https://github.com/cardano-foundation/cardano-rosetta/blob/master/cardano-rosetta-server/src/server/openApi.json#L4). 
- [cardano-addresses](https://github.com/IntersectMBO/cardano-addresses) provides mnemonic (backup phrase) creation, and conversion of a mnemonic to seed for wallet restoration, and address derivation functionalities.

## Tutorials
- [Explore Cardano wallets](creating-wallet-faucet) - learn how to create a Cardano wallet, receive test ada and create basic transactions.
- [Multi-witness transactions](multi-witness-transactions-cli) - learn how to create transactions with multiple inputs and one output.
- [Listening for ada payments using cardano-cli](listening-for-payments-cli) - how to listen to a specific address using cardano-cli.
- [Listening for ada payments using cardano-wallet](listening-for-payments-wallet) - how to listen to a specific address using cardano-wallet.
- [Testnet Faucet](testnet-faucet) - a service that provides test ada (tAda) to users of the Cardano testnets. 
- [Sample queries](https://iohk.zendesk.com/hc/en-us/articles/4402395914009-Sample-cardano-rosetta-queries) for cardano-rosetta.
- [Sample queries](https://iohk.zendesk.com/hc/en-us/articles/900000906566-Sample-cardano-graphql-queries) for cardano-graphql.

## Exchange Integration
- [Exchange integration overview](https://iohk.zendesk.com/hc/en-us/articles/900000911923-Exchange-integration-overview)
- [Exchange integration guidelines](https://iohk.zendesk.com/hc/en-us/articles/900000919406-Exchange-integration-guidelines)
