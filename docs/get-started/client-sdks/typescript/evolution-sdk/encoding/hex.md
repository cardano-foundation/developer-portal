---
title: Hex
description: Hexadecimal encoding for bytes, hashes, and binary data
---

# Hex Encoding

Hexadecimal strings are used throughout Cardano for hashes, policy IDs, transaction IDs, and raw byte data. The `Bytes` module provides conversion between hex strings and byte arrays.

## Hex to Bytes

```typescript
import { Bytes } from "@evolution-sdk/evolution"

const txHash = Bytes.fromHex(
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
)

const policyId = Bytes.fromHex(
  "abc123def456abc123def456abc123def456abc123def456abc123de"
)
```

## Bytes to Hex

```typescript
import { Bytes } from "@evolution-sdk/evolution"

const bytes = new Uint8Array([0xab, 0xcd, 0xef])
const hex = Bytes.toHex(bytes)
// "abcdef"
```

## Text to Bytes

For human-readable strings (asset names, metadata values), use `Text.toBytes`:

```typescript
import { Text } from "@evolution-sdk/evolution"

const tokenName = Text.toBytes("MyToken")
```

**When to use which:**
- **`Bytes.fromHex`** — For hashes, policy IDs, credential hashes (data already in hex)
- **`Text.toBytes`** — For asset names, metadata values (human-readable strings)

## Next Steps

- [Bech32](./bech32.md) — Address encoding
- [PlutusData](./data.md) — On-chain data structures
