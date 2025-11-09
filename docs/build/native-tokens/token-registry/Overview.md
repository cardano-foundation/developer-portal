--- 
id: cardano-token-registry-overview
title: Cardano Token Registry 
sidebar_label: Overview 
description: The Cardano Token Registry provides a means to register either on-chain or off-chain token metadata that can map to on-chain identifiers. 
image: /img/og/og-developer-portal.png 
sidebar_position: 1 
--- 

As introduced [here](/docs/build/native-tokens/overview), Cardano native assets are custom tokens created and managed directly on the Cardano blockchain, leveraging its native multi-asset ledger. Unlike tokens on other blockchains that rely on smart contracts, Cardano's native assets are integrated into the protocol itself, enabling efficient creation, transfer, and management of both fungible and non-fungible tokens (NFTs). Native assets are identified by a unique combination of two onchain properties called **Policy Id** and **Asset Name**, which ensure secure and decentralized token operations.

Native assets are versatile, supporting a wide range of use cases, such as digital collectibles, tokenized real-world assets, stablecoins, and governance tokens. Tokens' metadata are additional data which describe assets’ properties, such as name, description, image or website and play a critical role in making these assets usable and interoperable across wallets, marketplaces, and decentralized applications (dApps).

## Role of Metadata in Native Assets

Metadata in Cardano native assets provides contextual information that enhances their functionality and user experience. For example, metadata for an NFT might include its artwork, creator details, or rarity attributes, while metadata for a fungible token might specify its ticker symbol or decimal precision. Metadata ensures that third-party tools, such as wallets and explorers, can interpret and display asset information correctly.

Cardano supports two primary metadata standards for **fungible tokens** (FT):
- **CIP-26**: An off-chain metadata standard that stores data in a centralized or semi-centralized registry, suitable for simple and static use cases.
- **CIP-68**: An on-chain metadata standard that uses datums to store dynamic and programmable metadata directly on the blockchain, enabling advanced use cases.

These standards cater to different needs, balancing factors like cost, flexibility, and decentralization. The choice of standard depends on the asset’s requirements, such as whether metadata needs to be static or updatable, and whether off-chain or on-chain storage is preferred.

Find out more about these two standards in the following links:
* [CIP-26](/docs/build/native-tokens/token-registry/cardano-token-registry-cip26)
* [CIP-68](/docs/build/native-tokens/token-registry/cardano-token-registry-cip68)

## Why Metadata Standards Matter

Standardized metadata ensures interoperability and consistency across the Cardano ecosystem. By adhering to established standards like CIP-26 or CIP-68, developers can ensure that their assets are recognized and correctly displayed by wallets, decentralized exchanges (DEXs), and NFT marketplaces. These standards also facilitate trust and usability by providing a predictable structure for metadata, making it easier for developers and users to interact with native assets.

In the following sections, we explore the specifics of CIP-26 and CIP-68, including their structures, use cases, and trade-offs, to help developers choose the right standard for their projects.
