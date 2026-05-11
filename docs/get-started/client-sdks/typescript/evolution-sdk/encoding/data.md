---
title: PlutusData
description: On-chain data structures for Cardano smart contracts
---

# PlutusData

PlutusData is the serialization format for all on-chain data in Cardano smart contracts. Every datum attached to a UTxO, every redeemer that unlocks a script, and every parameter passed to a validator must be encoded as PlutusData.

The Evolution SDK's Data module gives you type-safe PlutusData creation without touching raw CBOR bytes.

## The Five Types

PlutusData consists of five primitive types:

| Type | TypeScript | Use For |
|------|-----------|---------|
| **Integer** | `bigint` | Amounts, indices, timestamps, quantities |
| **ByteArray** | `Uint8Array` | Hashes, addresses, policy IDs, asset names |
| **Constructor** | `{ index: bigint, fields: Data[] }` | Variants, tagged unions, structured data |
| **Map** | `Map<Data, Data>` | Metadata, key-value stores |
| **List** | `ReadonlyArray<Data>` | Arrays of values |

## Quick Start

```typescript
import { Bytes, Data, Text } from "@evolution-sdk/evolution"

// Integer (bigint)
const lovelaceAmount: Data.Data = 5000000n

// ByteArray (Uint8Array)
const tokenName = Text.toBytes("HOSKY")
const policyId = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")

// Constructor (variant with fields)
const unlockAction = Data.constr(0n, [])

// Map (key-value pairs)
const metadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("My NFT")],
  [Text.toBytes("image"), Text.toBytes("ipfs://Qm...")]
])

// List (array)
const quantities: Data.Data = [100n, 200n, 300n]
```

## Integers

Use `bigint` directly—no wrapper needed:

```typescript
import { Data } from "@evolution-sdk/evolution"

const fee: Data.Data = 170000n
const deposit: Data.Data = 2000000n
const nftQuantity: Data.Data = 1n
const ftQuantity: Data.Data = 1000000n
const delta: Data.Data = -500n
const totalSupply: Data.Data = 45000000000000000n
```

## Byte Arrays

```typescript
import { Bytes, Data, Text } from "@evolution-sdk/evolution"

const txHash = Bytes.fromHex(
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
)

const policyId = Bytes.fromHex(
  "1234567890abcdef1234567890abcdef1234567890abcdef12345678"
)

const assetName = Text.toBytes("MyToken")
const adaPolicyId = new Uint8Array()
```

**When to use `Bytes.fromHex` vs `Text.toBytes`:**

- **`Bytes.fromHex`**: For hashes, policy IDs, credential hashes (hexadecimal data)
- **`Text.toBytes`**: For asset names, metadata values (human-readable strings)

## Constructors

```typescript
import { Bytes, Data } from "@evolution-sdk/evolution"

// Simple variant (no data)
const claimAction = Data.constr(0n, [])
const cancelAction = Data.constr(1n, [])

// Variant with single field
const verificationKeyCred = Data.constr(0n, [
  Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
])

const scriptCred = Data.constr(1n, [
  Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
])

// Multiple fields
const outputRef = Data.constr(0n, [
  Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"),
  2n
])
```

## Maps

```typescript
import { Bytes, Data, Text } from "@evolution-sdk/evolution"

const nftMetadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("CryptoKitty #1234")],
  [Text.toBytes("image"), Text.toBytes("ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")],
  [Text.toBytes("description"), Text.toBytes("A rare cryptokitty with rainbow fur")]
])

const tokenMetadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("MyToken")],
  [Text.toBytes("ticker"), Text.toBytes("MTK")],
  [Text.toBytes("decimals"), 6n],
  [Text.toBytes("properties"), Data.map([
    [Text.toBytes("mintable"), 1n],
    [Text.toBytes("burnable"), 1n]
  ])]
])
```

## Lists

```typescript
import { Bytes, Data } from "@evolution-sdk/evolution"

const prices: Data.Data = [100n, 250n, 500n, 1000n]

const approvedSigners: Data.Data = [
  Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab"),
  Bytes.fromHex("123456789abc123456789abc123456789abc123456789abc12345678")
]

const actions: Data.Data = [
  Data.constr(0n, []),
  Data.constr(1n, []),
  Data.constr(2n, [5000000n])
]
```

## CBOR Encoding

```typescript
import { Bytes, Data, Text } from "@evolution-sdk/evolution"

const datum = Data.constr(0n, [
  Data.map([
    [Text.toBytes("beneficiary"), Text.toBytes("addr1...")],
    [Text.toBytes("deadline"), 1735689600000n]
  ]),
  5000000n,
  1n
])

// Encode to hex string
const cborHex = Data.toCBORHex(datum)

// Encode to bytes
const cborBytes = Data.toCBORBytes(datum)

// Decode from CBOR
const decoded = Data.fromCBORHex(cborHex)
```

## Equality Comparison

```typescript
import { Data, Text } from "@evolution-sdk/evolution"

const map1 = Data.map([
  [Text.toBytes("name"), Text.toBytes("Alice")],
  [Text.toBytes("age"), 30n]
])

const map2 = Data.map([
  [Text.toBytes("name"), Text.toBytes("Alice")],
  [Text.toBytes("age"), 30n]
])

const isEqual = Data.equals(map1, map2)
// true
```

## Real-World Examples

### Escrow Datum

```typescript
import { Bytes, Data } from "@evolution-sdk/evolution"

const escrowDatum = Data.constr(0n, [
  Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  1735689600000n,
  10000000n
])

const cborHex = Data.toCBORHex(escrowDatum)
```

### CIP-68 NFT Metadata

```typescript
import { Data, Text } from "@evolution-sdk/evolution"

const metadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("SpaceAce #4242")],
  [Text.toBytes("image"), Text.toBytes("ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")],
  [Text.toBytes("rarity"), Text.toBytes("legendary")],
  [Text.toBytes("attributes"), Data.map([
    [Text.toBytes("class"), Text.toBytes("explorer")],
    [Text.toBytes("power"), 9000n]
  ])]
])

const cip68Datum = Data.constr(0n, [
  metadata,
  1n,
  []
])
```

### Redeemer with Multiple Actions

```typescript
import { Data } from "@evolution-sdk/evolution"

const claim = Data.constr(0n, [])
const cancel = Data.constr(1n, [])
const update = Data.constr(2n, [
  1735776000000n
])

const redeemer = claim
```

### Multi-Sig Validator Redeemer

```typescript
import { Bytes, Data } from "@evolution-sdk/evolution"

const multiSigRedeemer = Data.constr(0n, [
  [
    Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
    Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
  ] as Data.Data,
  2n
])
```

## When to Use PlutusData Directly

Use the Data module directly when:

- Quick prototyping or testing
- Working with dynamic data structures
- Debugging CBOR encoding issues
- Building tooling or explorers

For production smart contract integration, use [TSchema](./tschema.md) for type-safe schema definitions with automatic validation.

## Next Steps

- [TSchema](./tschema.md) — Type-safe schema definitions with automatic validation
- [Plutus Types](./plutus.md) — Pre-built types for addresses, credentials, values, and CIP-68
- [CBOR](./cbor.md) — Low-level CBOR encoding and decoding
