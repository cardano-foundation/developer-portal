--- 
id: cardano-token-registry-cip68
title: CIP 68
sidebar_label: "CIP 68: Onchain Token Metadata"
description: The Cardano Token Registry provides a means to register off-chain token metadata that can map to on-chain identifiers. 
image: /img/og/og-developer-portal.png 
sidebar_position: 3
--- 
# CIP-68: Cardano On-Chain Metadata Standard

[CIP-68](https://cips.cardano.org/cip/CIP-0068) is an on-chain metadata standard for Cardano native assets, designed to provide a flexible and programmable way to manage metadata directly on the blockchain. Unlike CIP-26, which relies on off-chain storage, CIP-68 uses **datums**—on-chain data structures in Cardano’s extended UTxO model—to store metadata. This standard introduces two types of tokens: a **reference NFT** that holds the metadata and a **user token** that represents the asset in a user’s wallet. The reference NFT points to the metadata, which can be updated without minting new tokens.

CIP-68 also incorporates **asset name labels** (defined in CIP-67) to classify tokens, making it easier for third-party tools like wallets and decentralized exchanges (DEXs) to identify their purpose. The metadata is stored in a structured format, allowing for fields such as:
- **name**: The token’s name.
- **image**: A link (e.g., IPFS) to associated media.
- **description**: Details about the token’s purpose or attributes.
- **custom fields**: Programmable metadata for specific use cases, such as NFT attributes or token properties.

This standard supports dynamic metadata updates, making it suitable for advanced use cases like evolving NFTs or fractionalized assets.

## Use Cases

CIP-68 is well-suited for:
- Non-fungible tokens (NFTs) with dynamic or updatable metadata, such as digital art or gaming assets.
- Fungible tokens requiring programmable metadata for smart contract integration.
- Decentralized applications (dApps) that need on-chain metadata for automated processes, such as NFT marketplaces or automated market makers (AMMs).

## Pros of CIP-68

- **Dynamic Metadata**: Metadata can be updated on-chain without minting new tokens, enabling evolving NFTs or tokens with changing properties.
- **Smart Contract Integration**: CIP-68 metadata is accessible to Plutus smart contracts, making it ideal for dApps and complex token logic.
- **Decentralization**: Storing metadata on-chain eliminates reliance on centralized registries, enhancing trustlessness and resilience.
- **Flexibility**: Supports a wide range of asset classes and use cases, from NFTs to fractionalized tokens, due to its programmable structure.
- **Interoperability**: Asset name labels (CIP-67) make it easier for third-party tools to identify and process CIP-68-compliant assets.
- **Immediate Availability**: Metadata are available immediately after being minted on-chain, usually within a minute.

## Cons of CIP-68

- **Higher Costs**: Storing metadata on-chain requires datums and additional UTxOs, doubling the transaction costs compared to CIP-26.[](https://www.crypto-news-flash.com/cardano-advances-blockchain-innovation-with-cip25-metadata-validation-boosting-nfts-and-amms/)
- **Complexity**: Implementing CIP-68 is more technically demanding, requiring knowledge of Plutus or other on-chain programming tools.
- **Compatibility Issues**: Some existing Cardano tools and wallets still primarily support CIP-26 (or CIP-25 for NFTs), leading to potential interoperability challenges.[](https://www.crypto-news-flash.com/cardano-advances-blockchain-innovation-with-cip25-metadata-validation-boosting-nfts-and-amms/)
- **Scalability Concerns**: On-chain metadata increases the blockchain’s data load, which could impact scalability for projects with large numbers of assets.

## Summary

CIP-68 is a powerful standard for developers seeking to create dynamic, programmable, and decentralized native assets on Cardano. Its on-chain approach enables integration with smart contracts and supports innovative use cases, but it comes at the cost of higher transaction fees and increased complexity. Developers should consider CIP-68 for projects requiring flexibility and on-chain functionality, while being mindful of its cost and compatibility trade-offs.
