---
title: Unit Tests
description: Test schemas, encoding, and address utilities
---

# Unit Tests

Unit tests validate individual modules — schema encoding/decoding, address parsing, asset manipulation — without needing a blockchain connection.

## Testing Schema Round-Trips

```typescript title="test/schema.test.ts"
import { describe, it, expect } from "vitest"
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const MyDatumSchema = TSchema.Struct({
  amount: TSchema.Integer,
  recipient: TSchema.ByteArray
})

const Codec = Data.withSchema(MyDatumSchema)

describe("MyDatum", () => {
  it("should round-trip encode/decode", () => {
    const original = {
      amount: 5000000n,
      recipient: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
    }

    const cbor = Codec.toCBORHex(original)
    const decoded = Codec.fromCBORHex(cbor)

    expect(decoded.amount).toBe(original.amount)
    expect(decoded.recipient).toEqual(original.recipient)
  })
})
```

## Testing Address Parsing

```typescript
import { describe, it, expect } from "vitest"
import { Address } from "@evolution-sdk/evolution"

describe("Address", () => {
  it("should parse and round-trip bech32", () => {
    const bech32 = "addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"
    const address = Address.fromBech32(bech32)
    const hex = Address.toHex(address)
    const restored = Address.fromHex(hex)
    const restoredBech32 = Address.toBech32(restored)

    expect(restoredBech32).toBe(bech32)
  })
})
```

## Testing Assets

```typescript
import { describe, it, expect } from "vitest"
import { Assets } from "@evolution-sdk/evolution"

describe("Assets", () => {
  it("should merge asset bundles", () => {
    const a = Assets.fromLovelace(5_000_000n)
    const b = Assets.fromLovelace(3_000_000n)
    const merged = Assets.merge(a, b)

    expect(merged.lovelace).toBe(8_000_000n)
  })
})
```

## Next Steps

- [Integration Tests](./integration-tests.md) — Test full transaction workflows
- [Emulator](./emulator.md) — Use devnet for testing
