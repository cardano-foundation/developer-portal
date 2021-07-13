---
id: cardano-components
title: Cardano Components
sidebar_label: Overview
description: This article explains all the different Cardano components and their functions.
image: ./img/og-developer-portal.png
--- 

- [`cardano-node`](https://github.com/input-output-hk/cardano-node#cardano-node-overview) is the core component that is used to participate in a Cardano decentralised blockchain. 
- `cardano-cli` is the Cardano Command Line Interface (CLI). For some time this component is included in [`cardano-node`](https://github.com/input-output-hk/cardano-node#cardano-node-overview).
- [`cardano-wallet`](https://github.com/input-output-hk/cardano-wallet#overview) is the HTTP server and command-line for managing UTxOs and HD wallets in Cardano.
- [`cardano-db-sync`](https://github.com/input-output-hk/cardano-db-sync#cardano-db-sync) is the component that follows the Cardano chain and stores blocks and transactions in PostgreSQL.
- [`cardano-graphql`](https://github.com/input-output-hk/cardano-graphql#overview) is a cross-platform, typed, and queryable API for Cardano.
- [`cardano-rosetta`](https://github.com/input-output-hk/cardano-rosetta#cardano-rosetta) is an implementation of the open standard [Rosetta](https://www.rosetta-api.org/) for Cardano.
- [`cardano-addresses`](https://github.com/input-output-hk/cardano-addresses#overview) is a module that provides mnemonic (backup phrase) creation, and conversion of a mnemonic to seed for wallet restoration, and address derivation functionalities.
- [`cardano-ledger-specs`](https://github.com/input-output-hk/cardano-ledger-specs#cardano-ledger) is the formal specification and executable model of the ledger rules introduced by the Shelley release.
- [`bech32`](https://github.com/input-output-hk/bech32#bech32-command-line) is the Haskell implementation of the Bech32 address format (BIP 0173).
- [`smash`](https://github.com/input-output-hk/smash#smash-overview) is the stake pool metadata aggregation server. It provides off-chain metadata linked to the on-chain registrations of the stake pools.
- [`ouroboros-network`](https://github.com/input-output-hk/ouroboros-network/#ouroboros-network) is a network package which implements the ouroboros family of protocols, multiplexing layer.
