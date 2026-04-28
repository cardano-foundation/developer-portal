---
title: Assets
description: Working with native assets on Cardano
---

import DocCardList from '@theme/DocCardList';

# Assets

Cardano supports native multi-asset transactions — send ADA and custom tokens in the same output. The `Assets` module provides utilities for creating, merging, and manipulating asset bundles.

<DocCardList />

## Creating Assets

```typescript
import { Assets } from "@evolution-sdk/evolution"

// ADA only (1 ADA = 1,000,000 lovelace)
const adaOnly = Assets.fromLovelace(5_000_000n)

// ADA + native tokens
let assets = Assets.fromLovelace(2_000_000n)
assets = Assets.addByHex(
  assets,
  "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0", // policy ID (56 hex chars)
  "",    // asset name (empty for fungible tokens)
  100n   // quantity
)
```

## Merging Assets

Combine multiple asset bundles:

```typescript
import { Assets } from "@evolution-sdk/evolution"

const bundle1 = Assets.fromLovelace(5_000_000n)
const bundle2 = Assets.fromLovelace(3_000_000n)
const combined = Assets.merge(bundle1, bundle2) // 8 ADA total
```

## Next Steps

- [Asset Units](./units) — Understanding policy IDs and asset names
- [Metadata](./metadata) — Attach metadata to transactions (CIP-25, CIP-20)
- [Minting](../smart-contracts) — Mint native tokens with smart contracts
