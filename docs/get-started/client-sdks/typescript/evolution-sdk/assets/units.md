---
title: Asset Units
description: Understanding policy IDs, asset names, and units
---

# Asset Units

Every native asset on Cardano is identified by two components: a **policy ID** (28-byte hash of the minting policy script) and an **asset name** (0-32 bytes chosen by the minter). Together, these form the asset's unique identifier or "unit."

## Structure

| Component | Size | Format | Example |
|-----------|------|--------|---------|
| **Policy ID** | 28 bytes | Hex (56 chars) | `7edb7a2d...c9d8e7f6` |
| **Asset Name** | 0-32 bytes | Hex-encoded | `4d79546f6b656e` ("MyToken") |
| **Unit** | Combined | policyId + assetName | `7edb7a2d...4d79546f6b656e` |

## Working with Assets

```typescript
import { Assets } from "@evolution-sdk/evolution"

const policyId = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0" // 56 hex chars = 28 bytes
const assetName = "4d79546f6b656e" // "MyToken" in hex

// Add native token to an asset bundle
let assets = Assets.fromLovelace(2_000_000n) // Min ADA for UTxO
assets = Assets.addByHex(assets, policyId, assetName, 1000n)
```

## Lovelace

ADA's smallest unit is **lovelace**. 1 ADA = 1,000,000 lovelace. Lovelace is always represented separately from native tokens in asset bundles:

```typescript
import { Assets } from "@evolution-sdk/evolution"

const fiveAda = Assets.fromLovelace(5_000_000n)

// Common amounts
const oneAda = 1_000_000n
const halfAda = 500_000n
const tenAda = 10_000_000n
```

## Minimum ADA

Every UTxO must contain a minimum amount of ADA (determined by `coinsPerUtxoByte` protocol parameter). UTxOs with native tokens require more ADA because they're larger. The transaction builder calculates this automatically.

## Next Steps

- [Assets Overview](./overview.md) — Creating and merging asset bundles
- [Metadata](./metadata.md) — Attach metadata to transactions
- [Simple Payment](../transactions/simple-payment.md) — Send native tokens
