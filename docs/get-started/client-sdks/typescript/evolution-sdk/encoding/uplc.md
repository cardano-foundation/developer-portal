---
title: UPLC
description: Working with Untyped Plutus Lambda Calculus programs
---

# UPLC

UPLC (Untyped Plutus Lambda Calculus) is the low-level language that Plutus smart contracts compile to. Evolution SDK provides a complete UPLC module for parsing, constructing, encoding, and manipulating UPLC programs.

Most developers interact with UPLC indirectly through `applyParamsToScript` (see [Parameterized Scripts](../smart-contracts/apply-params)). This guide covers the UPLC module in depth for advanced use cases.

## Program Structure

A UPLC program consists of a version and a body (a term):

```typescript
import { UPLC } from "@evolution-sdk/evolution"

declare const flatBytes: Uint8Array
const program = UPLC.fromFlatBytes(flatBytes)

console.log(program.version)
console.log(program.body)
```

## CBOR Encoding Levels

Plutus scripts on-chain are typically **double CBOR-encoded**: the Flat-encoded bytes are wrapped in CBOR bytes, then wrapped again. Evolution SDK handles all encoding levels:

```typescript
import { UPLC } from "@evolution-sdk/evolution"

declare const scriptHex: string

const level = UPLC.getCborEncodingLevel(scriptHex)
// "double" | "single" | "none"

const singleEncoded = UPLC.applySingleCborEncoding(scriptHex)
const doubleEncoded = UPLC.applyDoubleCborEncoding(scriptHex)

const flatBytes = UPLC.decodeDoubleCborHexToFlat(scriptHex)
const program = UPLC.fromCborHexToProgram(scriptHex)
```

## Flat Encoding

```typescript
import { UPLC } from "@evolution-sdk/evolution"

declare const program: UPLC.Program

const flatBytes = UPLC.toFlatBytes(program)
const flatHex = UPLC.toFlatHex(program)

const parsed = UPLC.fromFlatBytes(flatBytes)
const parsedFromHex = UPLC.fromFlatHex(flatHex)
```

## Constructing Terms

```typescript
import { UPLC } from "@evolution-sdk/evolution"

const x = UPLC.varTerm(0n)
const identity = UPLC.lambdaTerm(0n, UPLC.varTerm(0n))
const applied = UPLC.applyTerm(identity, UPLC.constantTerm("integer", 42n))
const addInteger = UPLC.builtinTerm("addInteger")
const delayed = UPLC.delayTerm(UPLC.constantTerm("integer", 1n))
const forced = UPLC.forceTerm(delayed)

// Constructor (Plutus V3)
const constr = UPLC.constrTerm(0n, [
  UPLC.constantTerm("integer", 100n)
])

// Case expression (Plutus V3)
const caseExpr = UPLC.caseTerm(constr, [
  UPLC.constantTerm("integer", 1n),
  UPLC.constantTerm("integer", 2n)
])

const err = UPLC.errorTerm
```

## Data Constants

```typescript
import { UPLC, Data } from "@evolution-sdk/evolution"

const term = UPLC.dataConstant(Data.int(42n))

const aikenTerm = UPLC.dataConstant(
  Data.constr(0n, [Data.int(1n)]),
)
```

## Applying Parameters

```typescript
import { UPLC, Data } from "@evolution-sdk/evolution"

declare const compiledScript: string

const applied = UPLC.applyParamsToScript(compiledScript, [
  Data.bytearray("abc123"),
  Data.int(1000000n)
])

const typedApplied = UPLC.applyParamsToScriptWithSchema(
  compiledScript,
  [{ owner: new Uint8Array(28), deadline: 1000000n }],
  (params) => Data.constr(0n, [
    Data.bytearray(params.owner.toString()),
    Data.int(params.deadline)
  ])
)
```

See [Parameterized Scripts](../smart-contracts/apply-params) for a complete tutorial.

## Builtin Functions

UPLC includes a fixed set of builtin functions matching Plutus V3. The full list is available via `UPLC.BuiltinFunctions`:

| Category | Examples |
| --- | --- |
| Arithmetic | `addInteger`, `subtractInteger`, `multiplyInteger`, `divideInteger` |
| Comparison | `equalsInteger`, `lessThanInteger`, `lessThanEqualsInteger` |
| ByteString | `appendByteString`, `sliceByteString`, `lengthOfByteString` |
| Cryptography | `sha2_256`, `sha3_256`, `blake2b_256`, `verifyEd25519Signature` |
| Data | `constrData`, `mapData`, `listData`, `iData`, `bData`, `unConstrData` |
| String | `appendString`, `equalsString`, `encodeUtf8`, `decodeUtf8` |
| BLS | `bls12_381_G1_add`, `bls12_381_G2_add`, `bls12_381_millerLoop` |

## Version Management

```typescript
import { UPLC } from "@evolution-sdk/evolution"

const version = UPLC.makeSemVer(1, 1, 0)
const parts = UPLC.parseSemVer("1.1.0")
```

## Error Handling

```typescript
import { UPLC } from "@evolution-sdk/evolution"

try {
  const program = UPLC.fromFlatHex("invalid")
} catch (e) {
  if (e instanceof UPLC.UPLCError) {
    console.error("UPLC error:", e.message)
  }
}
```

## Next Steps

- [Parameterized Scripts](../smart-contracts/apply-params) — Apply parameters to validators
- [Blueprint Codegen](../smart-contracts/blueprint-codegen) — Generate types from CIP-57 blueprints
- [CBOR Encoding](./cbor) — Low-level CBOR operations
- [Data Encoding](./data) — PlutusData construction
