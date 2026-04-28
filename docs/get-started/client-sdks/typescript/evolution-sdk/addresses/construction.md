---
title: Address Construction
description: Build Cardano addresses from credentials and keys
---

# Address Construction

Cardano addresses are derived from credentials (key hashes or script hashes). Evolution SDK provides utilities for parsing, converting, and working with all address types.

## Parse from Bech32

The most common way to work with addresses:

```typescript
import { Address } from "@evolution-sdk/evolution"

const address = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
```

## Parse from Hex

```typescript
import { Address } from "@evolution-sdk/evolution"

// Address hex: 58 chars (29 bytes, enterprise) or 114 chars (57 bytes, base)
const address = Address.fromHex(
  "01abc123def456abc123def456abc123def456abc123def456abc123deabc123def456abc123def456abc123def456abc123def456abc123de"
)
```

## Convert Between Formats

```typescript
import { Address } from "@evolution-sdk/evolution"

const address = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")

// To hex
const hex = Address.toHex(address)

// To bytes
const bytes = Address.toBytes(address)

// To bech32
const bech32 = Address.toBech32(address)
```

## Getting Your Wallet Address

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const myAddress = await client.address()
```

## Next Steps

- [Address Types](./address-types) — Base, enterprise, pointer, reward
- [Address Validation](./validation) — Validate address format
- [Address Conversion](./conversion) — Convert between formats
