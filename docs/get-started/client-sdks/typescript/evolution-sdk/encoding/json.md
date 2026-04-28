---
title: JSON
description: JSON representation of Plutus data structures
---

# JSON Encoding

Evolution SDK supports JSON representations of PlutusData for API interchange, debugging, and interoperability with tools that use Cardano's JSON Plutus Data format.

## JSON PlutusData Format

The JSON format uses tagged objects to represent each PlutusData type:

| PlutusData Type | JSON Representation |
|----------------|---------------------|
| Integer | `{ "int": 42 }` |
| ByteArray | `{ "bytes": "a1b2c3" }` |
| List | `{ "list": [...] }` |
| Map | `{ "map": [{ "k": ..., "v": ... }] }` |
| Constructor | `{ "constructor": 0, "fields": [...] }` |

## CBOR Encoding for On-Chain Use

For on-chain data (datums, redeemers), use CBOR encoding:

```typescript
import { Data } from "@evolution-sdk/evolution"

const datum = Data.constr(0n, [42n, 100n])

const cborHex = Data.toCBORHex(datum)
const decoded = Data.fromCBORHex(cborHex)
```

## Next Steps

- [PlutusData](./data) — On-chain data structures
- [TSchema](./tschema) — Type-safe schema definitions
- [Hex](./hex) — Hex encoding for bytes
