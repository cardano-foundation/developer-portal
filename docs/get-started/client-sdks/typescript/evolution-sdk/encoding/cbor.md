---
title: CBOR
description: Low-level CBOR encoding, decoding, and byte-identical re-encoding
---

# CBOR

Low-level CBOR encode/decode with optional byte-identical re-encoding via the `WithFormat` API.

## Overview

`CBOR` is the lowest-level encoding layer in the SDK. It decodes raw CBOR bytes into a typed `CBOR` union value, and encodes that value back to bytes using configurable options.

Most application code should use the module-specific APIs (`Transaction.fromCBORHex`, `TransactionBody.fromCBORHex`, etc.) rather than this module directly. Use `CBOR` when you need to inspect or manipulate raw CBOR structures, implement a custom codec, or re-encode bytes with exact encoding preservation.

**When NOT to use this module directly:**
- Parsing a full transaction → use `Transaction.fromCBORHex`
- Encoding a domain type → use the module's own `toCBORHex`/`toCBORBytes`
- Working with Plutus data → use the `Data` module

## Quick Start

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const value = CBOR.fromCBORHex("83010203")

if (CBOR.isArray(value)) {
  const len = value.length // 3
}

const hex = CBOR.toCBORHex(value) // "83010203"
const bytes = CBOR.toCBORBytes(value)
```

## Core Concepts

### The `CBOR` Union Type

`CBOR.fromCBORHex` returns a `CBOR` value — a discriminated union over every CBOR major type:

```typescript
import { CBOR } from "@evolution-sdk/evolution"

// bigint      ← CBOR major 0 (uint) and major 1 (nint)
const uint: CBOR.CBOR = 42n
const nint: CBOR.CBOR = -1n

// Uint8Array  ← CBOR major 2 (bytes)
const bytes: CBOR.CBOR = new Uint8Array([0xde, 0xad])

// string      ← CBOR major 3 (text)
const text: CBOR.CBOR = "hello"

// ReadonlyArray<CBOR>          ← CBOR major 4 (array)
// ReadonlyMap<CBOR, CBOR>      ← CBOR major 5 (map)
// { _tag: "Tag"; tag: number; value: CBOR }  ← CBOR major 6 (tag)
// boolean | null | undefined   ← CBOR major 7 (simple)
```

Use the type guards to narrow before accessing:

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const raw = CBOR.fromCBORHex("a2016161026162")

if (!CBOR.isMap(raw)) throw new CBOR.CBORError({ message: "Expected map" })

const entry = raw.get(1n)
```

Available guards: `isInteger`, `isByteArray`, `isArray`, `isMap`, `isRecord`, `isTag`.

### `CBORFormat` — The Encoding Tree

Standard CBOR decode throws away encoding choices: whether an integer used 1 or 4 bytes, whether a map was definite or indefinite, what order keys appeared in. This is fine for domain types that own their encoding. It is a problem for relay services that must hand back byte-identical transactions.

`CBORFormat` is a discriminated union (8 variants) that captures the complete encoding tree for every CBOR node. `fromCBORHexWithFormat` / `fromCBORBytesWithFormat` decode and capture it simultaneously. `toCBORHexWithFormat` / `toCBORBytesWithFormat` replay the captured tree exactly.

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const hex = "1800"

// Plain path: value decoded, encoding choices discarded
const value = CBOR.fromCBORHex(hex)             // 0n
const reEncoded = CBOR.toCBORHex(value)          // "00" — minimal, NOT "1800"

// WithFormat path: encoding tree captured alongside value
const { format, value: v2 } = CBOR.fromCBORHexWithFormat(hex)
const preserved = CBOR.toCBORHexWithFormat(v2, format) // "1800" — byte-identical
```

The `CBORFormat` variants are:

| Variant | CBOR major type | Encoding detail captured |
|---------|----------------|--------------------------|
| `uint`  | 0 (uint)       | `byteSize` of the argument |
| `nint`  | 1 (nint)       | `byteSize` of the argument |
| `bytes` | 2 (bytes)      | definite vs indefinite, chunk sizes |
| `text`  | 3 (text)       | definite vs indefinite, chunk sizes |
| `array` | 4 (array)      | definite vs indefinite, per-child formats |
| `map`   | 5 (map)        | definite vs indefinite, key insertion order |
| `tag`   | 6 (tag)        | tag header `width` |
| `simple`| 7 (simple)     | (no choices to capture) |

### `CodecOptions` Presets

Pre-built presets cover the most common Cardano tool conventions:

| Preset | Use when |
|--------|----------|
| `CML_DEFAULT_OPTIONS` *(default)* | General Cardano use — definite lengths, minimal integer encoding |
| `CANONICAL_OPTIONS` | RFC 8949 canonical: sorted keys, minimal encoding |
| `CML_DATA_DEFAULT_OPTIONS` | Plutus data with indefinite arrays/maps |
| `AIKEN_DEFAULT_OPTIONS` | Aiken `cbor.serialise()` — indefinite arrays, maps as pairs |
| `CARDANO_NODE_DATA_OPTIONS` | Definite Plutus data (tooling compatibility) |

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const value = CBOR.fromCBORHex("a2026161016162")

const defaultHex = CBOR.toCBORHex(value)
const canonicalHex = CBOR.toCBORHex(value, CBOR.CANONICAL_OPTIONS)
```

## Reference

### Decode

| Function | Input | Returns |
|----------|-------|---------|
| `fromCBORHex(hex, options?)` | hex string | `CBOR` |
| `fromCBORBytes(bytes, options?)` | `Uint8Array` | `CBOR` |
| `fromCBORHexWithFormat(hex)` | hex string | `DecodedWithFormat<CBOR>` |
| `fromCBORBytesWithFormat(bytes)` | `Uint8Array` | `DecodedWithFormat<CBOR>` |

### Encode

| Function | Input | Returns |
|----------|-------|---------|
| `toCBORHex(value, options?)` | `CBOR` | hex string |
| `toCBORBytes(value, options?)` | `CBOR` | `Uint8Array` |
| `toCBORHexWithFormat(value, format)` | `CBOR` + `CBORFormat` | hex string |
| `toCBORBytesWithFormat(value, format)` | `CBOR` + `CBORFormat` | `Uint8Array` |

### Type Guards

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const v: CBOR.CBOR = CBOR.fromCBORHex("01")

CBOR.isInteger(v)
CBOR.isByteArray(v)
CBOR.isArray(v)
CBOR.isMap(v)
CBOR.isRecord(v)
CBOR.isTag(v)
```

### Structural Matching

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const value = CBOR.fromCBORHex("43010203")

const result = CBOR.match(value, {
  integer: (n) => `int: ${n}`,
  bytes: (b) => `bytes(${b.length})`,
  text: (s) => `text: ${s}`,
  array: (a) => `array[${a.length}]`,
  map: (m) => `map{${m.size}}`,
  record: (_r) => `record`,
  tag: (tag, _v) => `tag(${tag})`,
  boolean: (b) => `bool: ${b}`,
  null: () => `null`,
  undefined: () => `undefined`,
  float: (f) => `float: ${f}`,
  boundedBytes: (b) => `bounded(${b.length})`,
})
```

## Best Practices

### Use `WithFormat` in any relay or signing service

If your code receives a `Transaction` CBOR hex from a client, adds witnesses, and returns the result, use `WithFormat` at the transaction level to guarantee the body bytes — and thus the `txId` — are never altered:

```typescript
import { Transaction } from "@evolution-sdk/evolution"

function addWalletWitnesses(txHex: string, walletWitnessHex: string): string {
  return Transaction.addVKeyWitnessesHex(txHex, walletWitnessHex)
}
```

### Inject a hand-crafted `CBORFormat` for controlled encoding

```typescript
import { CBOR } from "@evolution-sdk/evolution"

const fmt: CBOR.CBORFormat = {
  _tag: "array",
  length: { tag: "indefinite" },
  children: [{ _tag: "uint" }, { _tag: "uint" }],
}

const hex = CBOR.toCBORHexWithFormat([1n, 2n], fmt)
// hex = "9f0102ff"  — indefinite-length array
```

### Narrow before accessing map entries

```typescript
import { CBOR } from "@evolution-sdk/evolution"

function getMapEntry(hex: string, key: bigint): CBOR.CBOR | undefined {
  const v = CBOR.fromCBORHex(hex)
  if (!CBOR.isMap(v)) return undefined
  return v.get(key)
}
```

## Related

- [Data](./data.md) — Plutus data encoding using the CBOR layer
- [Plutus Types](./plutus.md) — Pre-built schemas for Cardano data structures
