---
id: exchange-integrations
title: Exchange Integrations
sidebar_label: Exchange Integrations
description: Guide for integrating Cardano with exchanges.
image: /img/og/og-developer-portal.png
---

## Overview

This guide is for exchanges, custodians, and other entities interested in or currently listing ADA or Cardano native tokens. It outlines the main available components for integration purposes, providing step-by-step instructions and best practices.

## Understanding Cardano's Accounting Model

Cardano utilizes the Extended UTXO (eUTXO) model for its accounting system, which extends the UTXO design to support multi-assets and smart contracts.
In this model, each transaction consists of inputs and outputs, where inputs represent unspent outputs from previous transactions. This ensures that all assets recorded on the ledger are represented as unspent outputs, enabling efficient and secure transaction processing.

## Integration Components

- [**cardano-rosetta-java**](https://github.com/cardano-foundation/cardano-rosetta-java): Cardano Rosetta Java is a lightweight Java implementation of the Coinbase Mesh API (formerly Rosetta) for the Cardano blockchain. This implementation follows the [Mesh API specification](https://docs.cdp.coinbase.com/mesh/docs/api-reference/) and is compatible with the [Mesh CLI](https://docs.cdp.coinbase.com/mesh/docs/mesh-cli/), while including specific extensions to accommodate Cardano's unique features. _(Recommended for exchanges)_
  - Employs standardized APIs commonly used across blockchain platforms, promoting ease of understanding and implementation.
  - Handles tracking, building, and submitting transactions, providing all functionality needed for exchange operations.
  - All-in-one package with Cardano node, Submit API, Mesh API, and Yaci-Store indexer with Postgres database—streamlining your Cardano integration workflow.
:::note
Rosetta specificaition does not include transaction signing capabilites. This is done  in a separate offline service for best security partices using any signing libraries available. Sampel example using [CSL](https://github.com/Emurgo/cardano-serialization-lib/blob/master/doc/getting-started/singing_rosetta_tx.ts).  
For creating addresses, [cardano-addresses](https://github.com/IntersectMBO/cardano-addresses) provides mnemonic (backup phrase) creation, and conversion of a mnemonic to seed for wallet restoration, and address derivation functionalities. This can also be achieved using other libraries like [cardano-serialization-lib](https://github.com/Emurgo/cardano-serialization-lib)
:::
- [**cardano-graphql**](https://github.com/cardano-foundation/cardano-graphql): GraphQL API for querying blockchain data.
  - GraphQL layer to access all blockchain data, runs on top of cardano-db-sync indexer.
  - Provides access to staking and all blockchain transaction data, easy to query using GraphQL language.

- [**cardano-wallet**](https://github.com/cardano-foundation/cardano-wallet): Backend service providing APIs for wallet operations.
  - All-in-one solution for integration: address creation, automatic coin selection, transaction building, signing, and submission.
  - Great solution for smaller exchanges.
:::note
Does not support offline transaction signing; all keys are exposed online.
:::
- [**cardano-db-sync**](https://github.com/IntersectMBO/cardano-db-sync): Syncs blockchain data to a PostgreSQL database.
  - PostgreSQL database with the entire blockchain schema, queried with SQL.
  - Used with an indexer for GraphQL APIs.

- [**cardano-node**](https://github.com/IntersectMBO/cardano-node): The core component for participating in the Cardano decentralized blockchain.

- [**Cardano token registry**](https://developers.cardano.org/docs/native-tokens/cardano-token-registry/): Local metadata server to manage off-chain token metadata for native assets on Cardano.

## Wallet Management

### Address Handling
- Generate deposit addresses for customers using [cardano-address](https://github.com/IntersectMBO/cardano-addresses).
- Monitor addresses for deposits and manage withdrawals via hot and cold wallets.

## Transaction Handling

### Creation and Submission
- Supported tools: cardano-wallet, cardano-rosetta-java, and [cardano-serialization-lib](https://github.com/Emurgo/cardano-serialization-lib).

### Fee Calculation
The formula for calculating minimal fees for a transaction (tx) is:

```text
a * size(tx) + b
```

Where:
- `a` and `b` are protocol parameters.
- `size(tx)` is the transaction size in bytes.

### Monitoring
- Track transaction confirmations using blockchain querying tools such as cardano-rosetta-java and cardano-graphql.

## Native Assets

### Support for Native Assets
- [Native assets](https://developers.cardano.org/docs/get-started/cardano-cli/native-assets/) are first-class citizens in Cardano's ecosystem, living within the UTXO model.

### Min-ADA Requirements
- Each UTXO containing native assets must also hold a minimum ada amount. Factors include asset count, policy IDs, and name lengths.

## Explorers

All available explorers can be found [here](https://explorer.cardano.org).

## Handling Upgrades

### Upgrade Process
- **Docker:**
  - Stop the containers.
  - Use the new docker-compose file to start the container again.
  - The volumes will ensure that any synced blockchain data will be maintained.

- **Binaries:**
  - Build the new binary versions or use pre-built binaries.
  - Stop the service, swap in the new binary, start the service.
  - Make sure all [configuration files](https://book.world.dev.cardano.org/environments.html) and any command line arguments are up to date.

### Reliability of Upgrades
Adopting a multi-environment strategy is essential for ensuring reliable and safe upgrades. Deploying changes first to a staging or pre-production environment allows for thorough validation before promotion to production.  
Implementing Infrastructure as Code (IaC) alongside CI/CD pipelines significantly reduces the risk of human error and enables consistent, repeatable deployments.  
To further enhance uptime and availability, it's recommended to maintain multiple instances of critical components. This ensures that a fully functional stack remains available during upgrades, minimizing or eliminating service interruptions. 

### Testing Environment
Running a dedicated testnet environment is highly recommended for exchanges to ensure robust testing and validation, especially when dealing with complex logic or preparing for events like hard forks.  
Testnets offer a safer and more flexible space to simulate real-world scenarios without risking production stability. They also require significantly less hardware and offer faster sync times compared to mainnet, making them ideal for continuous integration and testing workflows.  
There are two testnet environments:
- **Preprod:** Configuration is the same as mainnet (5 days per epoch).
- **Preview:** Configured to have one day per epoch.

Faucets for [Test ADA](https://docs.cardano.org/cardano-testnets/tools/faucet)


### Compatibility
- Follow the Cardano [compatibility matrix](https://docs.cardano.org/developer-resources/release-notes/comp-matrix) for version alignment.

## Compliance and Regulatory Considerations

### Transaction Monitoring
- Ensure compliance with KYC/AML requirements.

### Audit Trails
- Maintain logs for deposit and withdrawal transactions.

## Support and Resources

- [Network configurations](https://book.world.dev.cardano.org/environments.html) 