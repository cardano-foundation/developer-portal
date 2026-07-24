---
title: "Tokens: fungible & NFTs"
sidebar_label: "3. Tokens: fungible & NFTs"
description: "How Cardano creates custom assets natively, and the difference between fungible tokens and NFTs."
---

# Tokens: fungible & NFTs

So far everything has been about ADA. But a UTxO (one of those sealed bags) can also hold **custom tokens** you create, and on Cardano that's simpler than on most chains.

Tokens on Cardano are **native**: the ledger tracks your custom asset right alongside ADA, and moving it around needs **no smart contract**. Every token has a **policy ID** (who's allowed to create it) and an **asset name** (its label, like `GOLD`).

There are two kinds, and you already know the difference from real life:

- **Fungible tokens** are **interchangeable**, like **dollar bills**, every unit is identical. You make one by minting a quantity greater than 1. Good for currencies, points, in-game gold.
- **NFTs (non-fungible tokens)** are **unique**, like a **numbered ticket** or a piece of art. An NFT is just a token with a quantity of **1**, under a policy that can never mint it again.

That's the whole distinction: **fungible = many identical units; NFT = a single unique unit.**

## Try it

- **See one:** open the **[Cardano explorer for Preview](https://explorer.cardano.org/preview)**, search your address, and check for any assets besides ADA, each shows its policy ID, name, and quantity.
- **Make one:** the fastest way to actually mint is the **[Tutorial](/docs/developers/onboarding/tutorial/overview)**, where you mint GOLD and SILVER. Afterward, look your address up on the explorer and see your new tokens sitting next to your ADA.

## Go deeper

- [What Are Native Tokens](/docs/developers/curriculum/native-tokens/overview)
- [Mint a fungible token](/docs/developers/curriculum/native-tokens/mint-fungible)
- [Mint an NFT](/docs/developers/curriculum/native-tokens/mint-nft)

Next: **[Metadata & native scripts](/docs/developers/onboarding/lectures/beginner/metadata-and-native-scripts)**.
