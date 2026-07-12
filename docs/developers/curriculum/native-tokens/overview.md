---
id: overview
title: What Are Native Tokens
sidebar_label: What are native tokens
description: How Cardano's multi-asset ledger handles native tokens and NFTs as first-class citizens alongside ADA.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

A Cardano native token is a custom asset the ledger tracks directly, alongside ADA, without a smart contract for basic transfers. Where Ethereum needs an ERC-20 or ERC-721 contract per token, Cardano treats your token the same way it treats ADA: it lives in UTXOs and moves through ordinary transactions.

:::note Quick summary
Tokens are "native" because the protocol tracks them with the same UTXO machinery that tracks ADA. That means lower fees, no contract-execution risk on transfers, atomic multi-asset transactions, and the same ledger-level guarantees ADA has.
:::

## What makes a token "native"?

On Ethereum, creating a token means deploying a contract that holds its own ledger of who owns what; every transfer is a contract call that costs gas and can fail in contract logic. On Cardano, the ledger itself tracks your token. Sending it works exactly like sending ADA, through inputs and outputs, with no contract execution for a basic transfer.

This builds directly on the [eUTXO model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo): each UTXO can hold ADA plus any number of native tokens bundled together.

## How tokens are identified

Every native token is identified by two parts:

- **Policy ID**: the 28-byte (56 hex character) hash of the minting policy script that authorized the token. It groups all tokens minted under that policy, and because it is a script hash, the minting rules are permanently bound to the token's identity.
- **Asset Name**: an optional label (up to 32 bytes) distinguishing tokens within a policy. One name for a fungible token; a unique name per item in an NFT collection. It can be empty.

Together they form a globally unique **Asset ID**: `PolicyID.AssetName`. Two tokens are fungible only if they share the complete Asset ID; the same asset name under different policies is not the same token.

### Why ADA is special

ADA is the only token with no policy ID. It is the protocol's **base currency**, used for fees, rewards, deposits, and minimum-UTXO values. In the value structure it sits under an empty policy ID and empty asset name. ADA is denominated in **lovelace**: 1 ADA = 1,000,000 lovelace (named after Ada Lovelace, like Ethereum's wei).

## Token bundles

A UTXO's value is not a single number, it is a nested map, `Map<PolicyID, Map<AssetName, Quantity>>`, so one UTXO can carry ADA plus many tokens at once:

```
Output value:
  2.5 ADA
  + 1,000 HOSKY
  + 50 SUNDAE
  + 1 SpaceBudz #4567 (NFT)
```

This is the **token bundle** (multi-asset value). It makes transfers atomic (send many token types in one output) and storage-efficient, at the cost of more complex coin selection (the wallet must balance every asset, not just ADA).

## Fungible, non-fungible, and semi-fungible

The only on-chain difference is quantity:

- **Fungible token**: quantity greater than 1, all units interchangeable (currencies, utility tokens, stablecoins).
- **NFT**: quantity exactly 1, made unique by a one-time minting policy (art, collectibles, certificates).
- **Semi-fungible**: a set of identical units that are distinct as a category (for example, 100 event tickets).

For the full mechanics see [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies).

## The minimum ADA requirement

Every token-bearing UTXO must carry a minimum amount of ADA, scaling with the output's byte size. This prevents dust UTXOs from bloating the ledger. Rough estimates:

```
ADA-only output:            ~1.0 ADA
1 token (1 policy, 1 name): ~1.2 ADA
1 NFT with inline datum:    ~1.5-2.0 ADA
many tokens in one output:  ~3-5+ ADA
```

Practical consequences:

- **You cannot send "just a token."** Some ADA always travels with it.
- **Airdrop cost**: 10,000 recipients at ~1.2 ADA each is ~12,000 ADA locked in min-UTXO (held by recipients).
- **Consolidation**: combining many small token UTXOs into one frees the excess ADA.

:::tip
This page is the canonical reference for min-ADA, token bundles, and fungibility. Other pages link here instead of re-explaining.
:::

## Working with assets in code

In the SDKs, a token amount is an **asset bundle**: lovelace plus zero or more native tokens keyed by `policyId + assetNameHex`.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

The `Assets` module builds and combines bundles:

```typescript
import { Assets } from "@evolution-sdk/evolution"

// ADA only (1 ADA = 1,000,000 lovelace)
const ada = Assets.fromLovelace(5_000_000n)

// ADA + a native token: addByHex(bundle, policyId, assetNameHex, quantity)
let bundle = Assets.fromLovelace(2_000_000n)              // min-ADA travels with the token
bundle = Assets.addByHex(bundle, policyId, assetNameHex, 100n)

// Combine bundles
const total = Assets.merge(ada, bundle)
```

`policyId` is 56 hex chars (28 bytes); `assetNameHex` is the hex-encoded asset name (empty `""` is valid). The builder enforces [min-ADA](#the-minimum-ada-requirement) on every token-bearing output automatically.

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh keys a bundle by `unit` (`policyId + assetNameHex`, or `"lovelace"`) with string quantities. `MeshValue` builds and combines them:

```typescript
import { MeshValue } from "@meshsdk/core"

// ADA only (string lovelace; 1 ADA = 1,000,000 lovelace)
const ada = MeshValue.fromAssets([{ unit: "lovelace", quantity: "5000000" }])

// ADA + a native token: unit is policyId + assetNameHex
const bundle = MeshValue.fromAssets([{ unit: "lovelace", quantity: "2000000" }]) // min-ADA travels with the token
bundle.addAsset({ unit: policyId + assetNameHex, quantity: "100" })

// Combine bundles
const total = ada.merge(bundle)

// Back to the `{ unit, quantity }[]` the builder consumes
const assets = total.toAssets()
```

`assetNameHex` is the hex-encoded asset name (empty `""` is valid). The builder enforces [min-ADA](#the-minimum-ada-requirement) on every token-bearing output automatically.

</TabItem>
</Tabs>

For display, **CIP-14 asset fingerprints** give a short checksummed `asset1...` identifier derived from the policy ID + asset name. Use it in UIs, but the canonical on-chain identifier stays `policyId + assetName`.

## Native tokens vs Ethereum ERC-20/721

On Ethereum, a token is a smart contract, so every transfer is a contract call that costs gas and can revert in the contract's logic. On Cardano, a token is part of the ledger. Minting and burning are governed by a policy script, but once minted, tokens move in ordinary transactions with no script execution, so a plain transfer cannot fail in contract logic the way an ERC-20 transfer can. One transaction can carry many token types at once, fungible and non-fungible tokens use the same mechanism, and you pay the normal transaction fee rather than variable gas.

The flip side is that there is no built-in transfer logic. Behavior like blacklists or transfer fees requires locking the tokens at a script address, and at that point spending them is subject to validation just like an ERC-20 transfer. There are also no built-in decimals: on-chain quantities are integers, so a 6-decimal token is minted in micro-units and displayed with decimals via a CIP-26 registration.

## Token lifecycle

Native tokens move through: policy design, then policy creation (the script hash becomes the policy ID), then minting (positive quantity), then circulation (ordinary transfers, no scripts), then optional smart-contract interaction, and finally burning (negative quantity).

![Native token lifecycle](./img/multiasset-lifecycle.png)

## Key takeaways

- Tokens are native: same ledger as ADA, no contract for basic transfers, so they are cheaper and safer.
- Every token is `PolicyID.AssetName`; the policy ID is the minting script's hash, binding rules to identity.
- A single UTXO holds ADA plus any number of tokens (the token bundle).
- Every token-bearing UTXO carries min-ADA; it scales with size and shapes airdrop and consolidation design.

## Next steps

- [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies): the rules that control creation and burning
- [Mint a fungible token](/docs/developers/curriculum/native-tokens/mint-fungible) and [Mint an NFT](/docs/developers/curriculum/native-tokens/mint-nft)
- [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry): CIP-25, CIP-68, CIP-26, royalties
