---
title: Bech32
description: Bech32 encoding for Cardano addresses
---

# Bech32 Encoding

Bech32 is the human-readable encoding format for Cardano addresses. Addresses look like `addr_test1vr...` (testnet) or `addr1q...` (mainnet). The `Address` module handles all Bech32 conversion.

## Parse from Bech32

```typescript
import { Address } from "@evolution-sdk/evolution"

const address = Address.fromBech32(
  "addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"
)
```

## Convert to Bech32

```typescript
import { Address } from "@evolution-sdk/evolution"

declare const address: Address.Address

const bech32 = Address.toBech32(address)
```

## Other Formats

```typescript
import { Address } from "@evolution-sdk/evolution"

declare const address: Address.Address

// To/from hex
const hex = Address.toHex(address)
const fromHex = Address.fromHex(hex)

// To/from bytes
const bytes = Address.toBytes(address)
const fromBytes = Address.fromBytes(bytes)
```

## Bech32 Prefixes

| Prefix | Network | Address Type |
|--------|---------|-------------|
| `addr` | Mainnet | Base/enterprise address |
| `addr_test` | Testnet | Base/enterprise address |
| `stake` | Mainnet | Reward address |
| `stake_test` | Testnet | Reward address |

## Next Steps

- [Addresses](../addresses) — Address types and operations
- [Hex](./hex) — Hex encoding for raw data
