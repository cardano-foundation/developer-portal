---
title: Address Eras
description: Parse all Cardano address formats including legacy Byron and Pointer addresses
---

# Address Eras

The `AddressEras` module is a full-spectrum address parser that handles every Cardano address type -- including legacy Byron addresses and deprecated Pointer addresses that the simplified `Address` module does not cover.

## When to Use AddressEras vs Address

| Feature | Address | AddressEras |
|---------|---------|-------------|
| Base addresses | Yes | Yes |
| Enterprise addresses | Yes | Yes |
| Byron addresses | No | Yes |
| Pointer addresses | No | Yes |
| Reward accounts | No | Yes |
| Simplified API | Yes | No |

Use `Address` for most application code. Use `AddressEras` when parsing UTxOs or transactions that may contain legacy formats.

## Parsing Any Address

`AddressEras.fromBech32` accepts any valid Bech32-encoded Cardano address and returns a discriminated union tagged by `_tag`:

```typescript
import { AddressEras } from "@evolution-sdk/evolution"

const addr1 = AddressEras.fromBech32(
  "addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"
)
const addr2 = AddressEras.fromBech32(
  "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw"
)

// Type narrowing by _tag
if (addr1._tag === "BaseAddress") {
  console.log("Payment:", addr1.paymentCredential)
  console.log("Stake:", addr1.stakeCredential)
} else if (addr1._tag === "EnterpriseAddress") {
  console.log("Payment only:", addr1.paymentCredential)
} else if (addr1._tag === "RewardAccount") {
  console.log("Stake credential:", addr1.stakeCredential)
}
```

## The Five Address Types

`AddressEras` is a union of all five Cardano address types:

| `_tag` | Fields | Bech32 prefix | Use case |
|--------|--------|---------------|----------|
| `BaseAddress` | `networkId`, `paymentCredential`, `stakeCredential` | `addr` / `addr_test` | Standard address with payment and staking |
| `EnterpriseAddress` | `networkId`, `paymentCredential` | `addr` / `addr_test` | Payment only, no staking rewards |
| `PointerAddress` | `networkId`, `paymentCredential`, `pointer` | `addr` / `addr_test` | Deprecated pointer to on-chain stake registration |
| `RewardAccount` | `networkId`, `stakeCredential` | `stake` / `stake_test` | Staking reward withdrawal address |
| `ByronAddress` | `networkId`, `bytes` | N/A (Base58) | Legacy Byron-era address |

Each type is a `Schema.TaggedClass`, so you can use `_tag` for exhaustive pattern matching.

## Format Conversion

`AddressEras` provides symmetric parsing and encoding functions for all three formats:

### Bech32

```typescript
import { AddressEras } from "@evolution-sdk/evolution"

const address = AddressEras.fromBech32(
  "addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"
)

const bech32 = AddressEras.toBech32(address)
```

### Hex

```typescript
import { AddressEras } from "@evolution-sdk/evolution"

const address = AddressEras.fromHex(
  "019493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e32c728d3861e164cab28cb8f006448139c8f1740ffb8e7aa9e5232dc"
)

const hex = AddressEras.toHex(address)
```

### Bytes

```typescript
import { AddressEras } from "@evolution-sdk/evolution"

const address = AddressEras.fromHex(
  "019493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e32c728d3861e164cab28cb8f006448139c8f1740ffb8e7aa9e5232dc"
)

const bytes = AddressEras.toBytes(address)
const decoded = AddressEras.fromBytes(bytes)
```

## Handling Legacy Addresses

When iterating UTxOs from the chain, you may encounter Byron addresses that `Address` cannot parse. Use `AddressEras` to handle them:

```typescript
import { AddressEras } from "@evolution-sdk/evolution"

type Utxo = { address: string; value: bigint }

function getPaymentCredential(utxo: Utxo) {
  const address = AddressEras.fromHex(utxo.address)

  switch (address._tag) {
    case "BaseAddress":
    case "EnterpriseAddress":
    case "PointerAddress":
      return address.paymentCredential
    case "RewardAccount":
      return null // Reward accounts have no payment credential
    case "ByronAddress":
      return null // Byron addresses store opaque bytes
  }
}
```

## Summary

| Function | Purpose |
|----------|---------|
| `fromBech32()` | Parse Bech32 address string (any type) |
| `fromHex()` | Parse hex-encoded address bytes |
| `fromBytes()` | Parse raw `Uint8Array` address |
| `toBech32()` | Encode to Bech32 string |
| `toHex()` | Encode to hex string |
| `toBytes()` | Encode to raw `Uint8Array` |
| `isAddress()` | Type guard for the `AddressEras` union |

## Next Steps

- **[Address](./address.md)** - Simplified API for modern address types
- **[Address Types](./address-types/overview.md)** - Overview of all Cardano address types
- **[Address Conversion](./conversion.md)** - Transform between Bech32, hex, and byte formats
