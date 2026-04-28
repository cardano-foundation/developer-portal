---
title: TSchema
description: Type-safe schema definitions for Plutus data structures
---

# TSchema

TSchema wraps Effect Schema with Plutus-specific encoding rules, giving you compile-time type safety and automatic CBOR serialization for smart contract data structures.

Define your schema once, get TypeScript types and CBOR encoding automatically.

## Why TSchema?

**Without TSchema** (manual PlutusData):
- Easy to mismatch types between TypeScript and on-chain
- No compile-time validation
- Manual CBOR encoding prone to errors
- Field order mistakes cause validator failures

**With TSchema**:
- Types inferred from schema automatically
- Compiler catches type mismatches
- Correct CBOR encoding guaranteed
- Field order enforced by structure

## Quick Start

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const OutputReferenceSchema = TSchema.Struct({
  transaction_id: TSchema.ByteArray,
  output_index: TSchema.Integer
})

type OutputReference = typeof OutputReferenceSchema.Type

const OutputReferenceCodec = Data.withSchema(OutputReferenceSchema)

const outRef: OutputReference = {
  transaction_id: Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"),
  output_index: 0n
}

const cborHex = OutputReferenceCodec.toCBORHex(outRef)
const decoded = OutputReferenceCodec.fromCBORHex(cborHex)
```

## The Core Schemas

### ByteArray

```typescript
import { Bytes, TSchema } from "@evolution-sdk/evolution"

const HashSchema = TSchema.ByteArray
type Hash = typeof HashSchema.Type

const txHash: Hash = Bytes.fromHex(
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
)
```

### Integer

```typescript
import { TSchema } from "@evolution-sdk/evolution"

const AmountSchema = TSchema.Integer
type Amount = typeof AmountSchema.Type

const lovelace: Amount = 5000000n
```

### Struct

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const AddressSchema = TSchema.Struct({
  payment_credential: TSchema.ByteArray,
  stake_credential: TSchema.ByteArray
})

type Address = typeof AddressSchema.Type

const Codec = Data.withSchema(AddressSchema)

const addr: Address = {
  payment_credential: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  stake_credential: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
}

const cbor = Codec.toCBORHex(addr)
```

### Variant

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const CredentialSchema = TSchema.Variant({
  VerificationKey: {
    hash: TSchema.ByteArray
  },
  Script: {
    hash: TSchema.ByteArray
  }
})

type Credential = typeof CredentialSchema.Type

const Codec = Data.withSchema(CredentialSchema)

const vkeyCred: Credential = {
  VerificationKey: {
    hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
  }
}

const scriptCred: Credential = {
  Script: {
    hash: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
  }
}

const cbor1 = Codec.toCBORHex(vkeyCred)
const cbor2 = Codec.toCBORHex(scriptCred)
```

### Array

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const IntListSchema = TSchema.Array(TSchema.Integer)
type IntList = typeof IntListSchema.Type

const Codec = Data.withSchema(IntListSchema)

const amounts: IntList = [100n, 200n, 300n]
const cbor = Codec.toCBORHex(amounts)
```

### Map

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const AssetsSchema = TSchema.Map(
  TSchema.ByteArray,
  TSchema.Integer
)

type Assets = typeof AssetsSchema.Type

const Codec = Data.withSchema(AssetsSchema)

const assets: Assets = new Map([
  [Bytes.fromHex("546f6b656e"), 100n],
  [Bytes.fromHex("4e4654"), 1n]
])

const cbor = Codec.toCBORHex(assets)
```

### UndefinedOr

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const PersonSchema = TSchema.Struct({
  name: TSchema.ByteArray,
  nickname: TSchema.UndefinedOr(TSchema.ByteArray)
})

type Person = typeof PersonSchema.Type

const Codec = Data.withSchema(PersonSchema)

const person1: Person = {
  name: Bytes.fromHex("416c696365"),
  nickname: undefined
}

const person2: Person = {
  name: Bytes.fromHex("426f62"),
  nickname: Bytes.fromHex("426f62627920")
}
```

### NullOr

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const ConfigSchema = TSchema.Struct({
  timeout: TSchema.Integer,
  retryLimit: TSchema.NullOr(TSchema.Integer)
})

type Config = typeof ConfigSchema.Type

const Codec = Data.withSchema(ConfigSchema)

const config: Config = {
  timeout: 30000n,
  retryLimit: null
}
```

### Boolean

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const SettingsSchema = TSchema.Struct({
  isActive: TSchema.Boolean,
  amount: TSchema.Integer
})

const Codec = Data.withSchema(SettingsSchema)

const settings = Codec.toData({ isActive: true, amount: 100n })
```

### PlutusData

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const FlexibleDatumSchema = TSchema.Struct({
  version: TSchema.Integer,
  payload: TSchema.PlutusData
})

const Codec = Data.withSchema(FlexibleDatumSchema)

const datum = Codec.toData({
  version: 1n,
  payload: Data.constr(0n, [Data.int(42n)])
})
```

### Literal

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const UnitSchema = TSchema.Literal("Unit" as const)
const Codec = Data.withSchema(UnitSchema)
const unit = Codec.toData("Unit" as const)
```

### Tuple

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const PairSchema = TSchema.Tuple([TSchema.ByteArray, TSchema.Integer])
type Pair = typeof PairSchema.Type

const Codec = Data.withSchema(PairSchema)

const pair: Pair = [new Uint8Array(28), 42n]
const cbor = Codec.toCBORHex(pair)
```

### TaggedStruct

```typescript
import { TSchema } from "@evolution-sdk/evolution"

const ClaimAction = TSchema.TaggedStruct("Claim", {})
const UpdateAction = TSchema.TaggedStruct("Update", {
  newValue: TSchema.Integer
})

type Claim = typeof ClaimAction.Type
type Update = typeof UpdateAction.Type
```

### Union (Direct)

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const ActionSchema = TSchema.Union(
  TSchema.TaggedStruct("Claim", {}),
  TSchema.TaggedStruct("Cancel", {}),
  TSchema.TaggedStruct("Update", { amount: TSchema.Integer })
)

type Action = typeof ActionSchema.Type

const Codec = Data.withSchema(ActionSchema)

const claim: Action = { _tag: "Claim" }
const update: Action = { _tag: "Update", amount: 500n }
```

## Utility Functions

```typescript
import { TSchema } from "@evolution-sdk/evolution"

declare const MySchema: any
declare const SchemaA: any
declare const SchemaB: any
declare const someValue: any
declare const a: any
declare const b: any

// Type guard
TSchema.is(MySchema)(someValue)

// Compose schemas
const Composed = TSchema.compose(SchemaA, SchemaB)

// Filter with refinement
const Positive = TSchema.filter(TSchema.Integer, (n) => n > 0n)

// Structural equality
const eq = TSchema.equivalence(MySchema)
eq(a, b)
```

## Creating Codecs

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const Schema = TSchema.Struct({
  id: TSchema.ByteArray,
  amount: TSchema.Integer
})

const Codec = Data.withSchema(Schema)

// Codec provides:
// - toData(value) → PlutusData
// - fromData(data) → value
// - toCBORHex(value) → string
// - toCBORBytes(value) → Uint8Array
// - fromCBORHex(hex) → value
// - fromCBORBytes(bytes) → value
```

## Real-World Examples

### Payment Credential

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const PaymentCredentialSchema = TSchema.Variant({
  VerificationKey: {
    hash: TSchema.ByteArray
  },
  Script: {
    hash: TSchema.ByteArray
  }
})

export type PaymentCredential = typeof PaymentCredentialSchema.Type

export const PaymentCredentialCodec = Data.withSchema(PaymentCredentialSchema)

const cred: PaymentCredential = {
  VerificationKey: {
    hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
  }
}

const cbor = PaymentCredentialCodec.toCBORHex(cred)
```

### Escrow Datum

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const EscrowDatumSchema = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
  amount: TSchema.Integer
})

export type EscrowDatum = typeof EscrowDatumSchema.Type

export const EscrowDatumCodec = Data.withSchema(EscrowDatumSchema)

const datum: EscrowDatum = {
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: 1735689600000n,
  amount: 10000000n
}

const datumCbor = EscrowDatumCodec.toCBORHex(datum)
```

### Multi-Action Redeemer

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const RedeemerSchema = TSchema.Variant({
  Claim: {},
  Cancel: {},
  Update: {
    new_beneficiary: TSchema.ByteArray,
    new_deadline: TSchema.Integer
  }
})

export type Redeemer = typeof RedeemerSchema.Type

export const RedeemerCodec = Data.withSchema(RedeemerSchema)

const claim: Redeemer = { Claim: {} }
const cancel: Redeemer = { Cancel: {} }
const update: Redeemer = {
  Update: {
    new_beneficiary: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab"),
    new_deadline: 1735776000000n
  }
}

const claimCbor = RedeemerCodec.toCBORHex(claim)
```

## Nested Schemas

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const CredentialSchema = TSchema.Variant({
  VerificationKey: { hash: TSchema.ByteArray },
  Script: { hash: TSchema.ByteArray }
})

const StakeCredentialSchema = TSchema.Variant({
  Inline: { credential: CredentialSchema },
  Pointer: {
    slot_number: TSchema.Integer,
    transaction_index: TSchema.Integer,
    certificate_index: TSchema.Integer
  }
})

const AddressSchema = TSchema.Struct({
  payment_credential: CredentialSchema,
  stake_credential: TSchema.UndefinedOr(StakeCredentialSchema)
})

export type Address = typeof AddressSchema.Type

export const AddressCodec = Data.withSchema(AddressSchema)
```

## Schema vs Direct PlutusData

| Approach | Type Safety | Validation | CBOR Encoding | Use When |
|----------|-------------|------------|---------------|----------|
| **TSchema** | Compile-time | Automatic | Guaranteed correct | Production smart contracts |
| **Direct Data** | Runtime only | Manual | Manual | Prototyping, debugging, tools |

**Rule of thumb**: Use TSchema for all production smart contract integration.

## Best Practices

**Define schemas once**: Create a schema for each datum/redeemer type and reuse it.

**Match validator exactly**: Your TSchema definitions must match your Plutus validator types exactly, including field names and order.

**Use type extraction**: Let TypeScript infer types from schemas—don't duplicate type definitions.

**Test round-trips**: Always verify encode → decode returns the original value.

**Export types and codecs**:

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const MyDatumSchema = TSchema.Struct({
  value: TSchema.Integer
})

export type MyDatum = typeof MyDatumSchema.Type
export const MyDatumCodec = Data.withSchema(MyDatumSchema)
```

## Next Steps

- [Plutus Types](./plutus) — Pre-built schemas for addresses, credentials, values, and CIP-68
- [PlutusData](./data) — Understanding the five primitive PlutusData types
- [Smart Contracts](../smart-contracts) — Using schemas with Plutus validators
