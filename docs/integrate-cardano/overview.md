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
- [Overview](docs/operate-a-stake-pool/node-operations/cardano-components.md) of the different Cardano components.
- [cardano-node](https://github.com/IntersectMBO/cardano-node) is the top level for the node and aggregates the other components from other packages: consensus, ledger and networking, with configuration, CLI, logging and monitoring.
- [cardano-wallet](https://github.com/cardano-foundation/cardano-wallet) helps you manage ada. You can use it to send and receive payments on the Cardano blockchain via a http and cli interface.
- [cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync) follows the Cardano chain and takes information from the chain and an internally maintained copy of ledger state. Data is then extracted from the chain and inserted into a PostgreSQL database. 
- [cardano-graphql](https://github.com/cardano-foundation/cardano-graphql) a cross-platform, typed, and queryable API for Cardano.
- [cardano-rosetta](https://github.com/cardano-foundation/cardano-rosetta-java) a multi-platform implementation of [Rosetta](https://www.rosetta-api.org) for Cardano, targeting the version defined in the [API docs](https://cardano-foundation.github.io/cardano-rosetta-java/api). 
- [cardano-addresses](https://github.com/IntersectMBO/cardano-addresses) provides mnemonic (backup phrase) creation, and conversion of a mnemonic to seed for wallet restoration, and address derivation functionalities.

## Tutorials
- [Explore Cardano wallets](creating-wallet-faucet) - learn how to create a Cardano wallet, receive test ada and create basic transactions.
- [Multi-witness transactions](multi-witness-transactions-cli) - learn how to create transactions with multiple inputs and one output.
- [Listening for ada payments](listening-for-payments/overview) - learn different approaches to detect and confirm ada payments in your applications.
- [Testnet Faucet](testnet-faucet) - a service that provides test ada (tAda) to users of the Cardano testnets. 
- [Sample queries](https://iohk.zendesk.com/hc/en-us/articles/4402395914009-Sample-cardano-rosetta-queries) for cardano-rosetta.
- [Sample queries](https://iohk.zendesk.com/hc/en-us/articles/900000906566-Sample-cardano-graphql-queries) for cardano-graphql.

---

## Explore More

import DocCardList from '@theme/DocCardList';

<DocCardList />
