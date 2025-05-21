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
Rosetta specification does not include transaction signing capabilities. This is done  in a separate offline service for best security practices using any signing libraries available. See example using [CSL](https://github.com/Emurgo/cardano-serialization-lib/blob/master/doc/getting-started/singing_rosetta_tx.ts).  
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
Cardano Wallet is currently in maintenance-only mode. The Cardano Foundation is committed to maintaining it for the foreseeable future by upgrading to new versions of the cardano-node, fixing bugs, improving quality and stability of both the code and server stability, plus providing general user support.
:::
- [**cardano-db-sync**](https://github.com/IntersectMBO/cardano-db-sync): Syncs blockchain data to a PostgreSQL database.
  - PostgreSQL database with the entire blockchain schema, queried with SQL.
  - Used with an indexer for GraphQL APIs.

- [**cardano-node**](https://github.com/IntersectMBO/cardano-node): The core component for participating in the Cardano decentralized blockchain.

- [**Cardano token registry**](https://developers.cardano.org/docs/native-tokens/cardano-token-registry/): Local metadata server to manage off-chain token metadata for native assets on Cardano.

## Wallet Management

### Address Handling  
A common and effective approach for exchanges integrating with Cardano involves using individual deposit addresses per customer and managing withdrawals from a centralized wallet. This model enables clear tracking, simplifies auditing, and enhances security and operational control.

The typical workflow is as follows:

- **Address Creation** - The exchange generates a unique deposit address for each customer using [cardano-address](https://github.com/IntersectMBO/cardano-addresses)

- **Deposit Monitoring** - The exchange continuously monitors the blockchain for incoming transactions to these addresses.

- **Customer Account Update** - Upon detecting a deposit, the exchange credits the corresponding customer account in its internal database.

- **Consolidation of Funds** - The exchange periodically moves funds from individual deposit addresses to a centralized withdrawal wallet by creating and submitting a transaction. This consolidation step simplifies fund management and improves operational efficiency.

- **Withdrawals** - When a customer requests a withdrawal, the exchange creates an outgoing transaction from the centralized withdrawal wallet and updates the customer's account in the internal database to reflect the withdrawal.

## Transaction Handling

###  Creation and Submission

Cardano offers multiple tools for transaction creation and submission, each designed to suit different integration architectures. The choice of tool depends on your infrastructure, security model, and level of control required. Most tools also support **fee estimation**, either explicitly or as part of the transaction construction process.

| Tool | Create | Sign | Submit | Notes |
|------|--------|------|--------|-------|
| [`cardano-wallet`](https://github.com/cardano-foundation/cardano-wallet) | ✅ | ✅ | ✅ | Full-featured REST API with built-in fee calculation and UTxO management. |
| [`cardano-rosetta`](https://github.com/cardano-foundation/cardano-rosetta-java) | ✅ | ❌ | ✅ | Rosetta does not handle key management or signing. Transactions must be signed offline. |
| [`cardano-serialization-lib`](https://github.com/Emurgo/cardano-serialization-lib) | ✅ | ✅ | ❌ | Low-level library for custom workflows. Commonly used with `cardano-submit-api` for submission. |
| [`cardano-submit-api`](https://github.com/IntersectMBO/cardano-node/tree/master/cardano-submit-api) | ❌ | ❌ | ✅ | Lightweight API for submitting signed transactions to a Cardano node. |



:::tip
The best practice for exchanges is to use `cardano-rosetta` for transaction construction and submission, and sign the transaction using signing libraries of their choice such as `cardano-serialization-lib`.
:::


### Fee Calculation
The formula for calculating minimal fees for a transaction (tx) is:

```text
a * size(tx) + b
```

Where:
- `a` and `b` are protocol parameters.
- `size(tx)` is the transaction size in bytes.

### Monitoring Transactions

Once transactions are submitted to the Cardano network, exchanges must monitor their status to ensure successful inclusion in a block and confirmation over time. This step is critical for updating customer balances, handling retries, and maintaining overall system integrity.

Several tools and interfaces are available to support transaction monitoring:

| Tool | Monitoring Capability | Notes |
|------|------------------------|-------|
| [`cardano-rosetta-java`](https://github.com/cardano-foundation/cardano-rosetta-java) | ✅ Transaction status and block inclusion | Suitable for exchanges using the [Rosetta API](https://cardano-foundation.github.io/cardano-rosetta-java/api#tag/block) standard. Supports structured responses for [Account Balance](https://cardano-foundation.github.io/cardano-rosetta-java/api#tag/account/POST/account/balance) updates and transaction queries. |
| [`cardano-graphql`](https://github.com/cardano-foundation/cardano-graphql) | ✅ Rich query support for entire blockchain data | Useful for querying confirmations, transaction metadata, and UTxO states using GraphQL. Cross-platform, typed, and queryable API for Cardano.   |
| [`cardano-wallet`](https://github.com/cardano-foundation/cardano-wallet) | ✅ Built-in tracking for submitted transactions | Automatically tracks transaction state, confirmation depth, and balances. Exposes these via a REST API. |

Additional considerations:

- **Confirmation depth**: For customer-facing actions like crediting a deposit, exchanges typically wait for a configurable number of block confirmations (e.g., 20–30 blocks)

## Native Assets

Cardano supports **native assets** that can be stored and transferred directly in UTxOs alongside ADA. These assets can be **fungible** (tokens) or **non-fungible** (NFTs), and are handled **natively by the ledger** without smart contracts.

:::tip
Native assets follow the same transaction and validation rules as ADA and are treated as first-class citizens in the Cardano ledger.
:::

#### Why This Matters for Exchanges

- **No smart contract complexity**: Native assets do not require Plutus scripts, reducing operational complexity.
- **Unified infrastructure**: The same transaction structure used for ADA also supports native assets.
- **Automatic deposits**: Deposit addresses may receive native assets, even if the exchange does not actively support them yet.

### Working with Native Assets

Use tools like [`cardano-rosetta-java`](https://github.com/cardano-foundation/cardano-rosetta-java) or [`cardano-graphql`](https://github.com/cardano-foundation/cardano-graphql) to track native assets across UTxOs. These tools allow you to:

- Detect native assets per address
- Query balances for specific assets
- Monitor transaction inclusion and confirmations

🔗 **See also:** [Using multi-assets with Rosetta](https://cardano-foundation.github.io/cardano-rosetta-java/docs/user-guides/multi-assets)

### Cardano Token Registry

The **Cardano Token Registry** provides a way to register **off-chain metadata** for native assets on Cardano. This metadata is used by wallets, explorers, and exchanges to display human-readable and visual information about tokens.

Registered metadata includes:

- ✅ Human-readable name (e.g., "MyToken")
- ✅ Ticker symbol (e.g., "MTK")
- ✅ Description and project website URL
- ✅ Logo or icon
- ✅ Decimal places (important for allowing fractional token balances)

This makes it easier for users and systems to interpret tokens consistently across the ecosystem.

:::info
The Cardano Token Registry data is included **by default** when using [`cardano-graphql`](https://github.com/input-output-hk/cardano-graphql), so exchanges using it can access token metadata without additional integration.
:::

You can also self-host the token registry using the official GitHub repository:

🔗 [cf-token-metadata-registry – GitHub](https://github.com/cardano-foundation/cf-token-metadata-registry)

:::tip
Always check and validate the **decimal places** of a token using the registry to ensure accurate accounting and display of fractional amounts.
:::

### Minimum ADA Requirement for Native Assets

Each UTxO on Cardano is required to contain a **minimum amount of ADA**, which **varies depending on the size and complexity** of the UTxO — including how many native assets it contains.

For native asset transactions, this means:

- Any deposit or withdrawal involving a native asset must also include ADA.
- The minimum ADA depends on:
  - The number of **policy IDs**
  - The length of **asset names**
  - The total number of **distinct assets** in the UTxO

Exchanges should:

- Validate that customers include sufficient ADA when depositing native assets
- Enforce minimum withdrawal amounts that meet the ADA requirement

🔗 **Reference**: [Minimum ADA in Mary-era transactions](https://cardano-ledger.readthedocs.io/en/latest/explanations/min-utxo-mary.html)

:::note
Failure to meet the minimum ADA requirement will result in invalid transactions that are rejected by the network.
:::

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

## Support and Resources

- [Network configurations](https://book.world.dev.cardano.org/environments.html) 