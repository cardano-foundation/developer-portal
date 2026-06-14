---
id: overview
title: Token Registry
sidebar_label: Overview
description: The Cardano Token Registry maps off-chain metadata (name, ticker, decimals, logo) to on-chain native assets so wallets and explorers can display them correctly.
image: /img/og/og-developer-portal.png
---

The **Cardano Token Registry** is an off-chain registry that maps human-readable metadata to on-chain native assets. On-chain, an asset is just a `policyId` and an asset name. The registry is where you publish the name, ticker, decimals, and logo that wallets, explorers, and marketplaces show to users.

It implements **[CIP-26](https://cips.cardano.org/cip/CIP-0026)**: metadata lives in a public GitHub repository, [cardano-foundation/cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry), and is served over a REST API at `https://tokens.cardano.org`. This page explains what the registry is for and when to use it. [Register an entry](/docs/native-tokens/token-registry/register-an-entry) is the practical guide, and [Token Metadata Server](/docs/native-tokens/token-registry/metadata-server) documents the query API.

## Who should register

Registration is **optional** and independent of any on-chain activity. Your tokens work whether or not they have a registry entry. You register so applications can show something better than a raw policy ID.

The field that matters most is **`decimals`**. On-chain quantities are always integers, so without a registered decimals value a wallet has no way to know that `1000000` of your token should display as `1.0`. If your token also has a name, ticker, or logo you want wallets to display, the registry is how you publish them for CIP-26.

## Off-chain (CIP-26) or on-chain (CIP-68)?

The registry is the **off-chain** path. Cardano also supports **[CIP-68](https://cips.cardano.org/cip/CIP-0068)**, which stores metadata in an on-chain datum that smart contracts can read and that you update without a registry submission. Which one fits depends on how your metadata behaves:

| | CIP-26 (registry) | CIP-68 (on-chain datum) |
| --- | --- | --- |
| Where metadata lives | Off-chain GitHub registry | On-chain, in a reference NFT datum |
| Cost | Free, no on-chain footprint | Extra UTXO and transaction cost |
| Updating | New pull request, reviewed by humans | An on-chain transaction you control |
| Readable by smart contracts | No | Yes, via reference inputs |
| Available after a change | Hours to days (review and re-sync) | Immediately, once the transaction is on-chain |

Reach for **CIP-26** for static metadata on a fungible token, such as a stablecoin's ticker and decimals. It is free, simple, and widely supported. Reach for **CIP-68** when metadata must change over time or a contract needs to read it on-chain, such as an evolving NFT or a token whose properties a dApp updates. The two are not exclusive: the [Token Metadata Server](/docs/native-tokens/token-registry/metadata-server) serves both and falls back from one to the other per field.

For the wider metadata picture, including CIP-25 (NFT metadata in the minting transaction) and CIP-27 (royalties), see [Token metadata & registry](/docs/native-tokens/metadata-registry).

## Next steps

- [Register an entry](/docs/native-tokens/token-registry/register-an-entry): prepare, submit, update, and remove a registry entry
- [Token Metadata Server](/docs/native-tokens/token-registry/metadata-server): query metadata over the REST API
