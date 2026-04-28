---
title: Blueprint Codegen
description: Generate type-safe TypeScript schemas from CIP-57 Plutus Blueprints
---

# Blueprint Codegen

When you compile a smart contract with Aiken (or another toolchain that outputs [CIP-57 Plutus Blueprints](https://cips.cardano.org/cip/CIP-0057)), you get a `plutus.json` file describing your validators, their parameters, datums, and redeemers.

Evolution SDK can generate type-safe TSchema definitions from this blueprint, giving you compile-time type safety for all on-chain data interactions.

## Quick Start

```typescript
import { Blueprint } from "@evolution-sdk/evolution"
import * as fs from "fs"

const blueprint = JSON.parse(fs.readFileSync("plutus.json", "utf-8"))
const code = Blueprint.Codegen.generateTypeScript(blueprint)
fs.writeFileSync("src/contract-types.ts", code)
```

The generated file includes:
- TSchema definitions for every type in your blueprint
- Validator metadata (script hashes, parameter schemas)
- Full type safety for datums, redeemers, and parameters

## Configuration

Pass a config object to customize code generation:

```typescript
import { Blueprint } from "@evolution-sdk/evolution"

declare const blueprint: any

const code = Blueprint.Codegen.generateTypeScript(blueprint, {
  optionStyle: "NullOr",     // "NullOr" | "UndefinedOr" | "Union"
  unionStyle: "Variant",     // "Variant" | "Struct" | "TaggedStruct"
  emptyConstructorStyle: "Literal", // "Literal" | "Struct"
  moduleStrategy: "flat",    // "flat" | "namespaced"
  includeIndex: false,
  fieldNaming: {
    singleFieldName: "value",
    multiFieldPattern: "field{index}",
  },
  imports: {
    data: 'import { Data } from "@evolution-sdk/evolution"',
    tschema: 'import { TSchema } from "@evolution-sdk/evolution"',
    schema: 'import { Schema } from "effect"',
  },
  indent: "  ",
})
```

### Option Styles

Controls how `Option<T>` types from your blueprint are represented:

| Style | Generated Code | Use When |
| --- | --- | --- |
| `"NullOr"` | `TSchema.NullOr(T)` | Default, idiomatic TypeScript |
| `"UndefinedOr"` | `TSchema.UndefinedOr(T)` | Prefer undefined over null |
| `"Union"` | `TSchema.Union(TaggedStruct("Some", ...), TaggedStruct("None", ...))` | Need explicit pattern matching |

### Union Styles

Controls how union types with named constructors are generated:

| Style | Generated Code | Use When |
| --- | --- | --- |
| `"Variant"` | `TSchema.Variant({ Tag1: {...}, Tag2: {...} })` | Default, compact |
| `"Struct"` | `TSchema.Union(TSchema.Struct(...), ...)` | Verbose, same encoding |
| `"TaggedStruct"` | `TSchema.Union(TaggedStruct("Tag1", ...), ...)` | Effect `_tag` style |

### Module Strategy

Controls how types are organized in the generated file:

- **`"flat"`** (default) — All types at top level: `CardanoAddressCredential`, `CardanoAssetsPolicyId`
- **`"namespaced"`** — Nested TypeScript namespaces: `Cardano.Address.Credential`, `Cardano.Assets.PolicyId`

### Custom Field Names

When your blueprint has constructors with unnamed fields, you can provide explicit names:

```typescript
import { Blueprint } from "@evolution-sdk/evolution"

declare const blueprint: any

const code = Blueprint.Codegen.generateTypeScript(blueprint, {
  optionStyle: "NullOr",
  unionStyle: "Variant",
  emptyConstructorStyle: "Literal",
  moduleStrategy: "flat",
  includeIndex: false,
  useRelativeRefs: true,
  fieldNaming: {
    singleFieldName: "value",
    multiFieldPattern: "field{index}",
  },
  imports: {
    data: 'import { Data } from "@evolution-sdk/evolution"',
    tschema: 'import { TSchema } from "@evolution-sdk/evolution"',
    schema: 'import { Schema } from "effect"',
  },
  indent: "  ",
  variantFieldNames: {
    "Credential.VerificationKey": ["hash"],
    "Credential.Script": ["hash"],
  },
})
```

## What Gets Generated

For a blueprint with validators and type definitions, the codegen produces:

**Schema definitions** — TSchema types for every definition in the blueprint:
```typescript
import { Data } from "@evolution-sdk/evolution"
import { TSchema } from "@evolution-sdk/evolution"

export const PlutusData = TSchema.PlutusData

export const ByteArray = TSchema.ByteArray
export const Int = TSchema.Integer

export const Credential = TSchema.Variant({
  VerificationKey: { hash: TSchema.ByteArray },
  Script: { hash: TSchema.ByteArray },
})
```

**Validator metadata** — Script info for each validator:
```typescript
export const myValidator = {
  title: "my_validator",
  compiledCode: "5907...",
  hash: "abc123...",
}
```

## Using Generated Types

```typescript
import { Data } from "@evolution-sdk/evolution"

declare const Credential: any
declare const myValidator: { compiledCode: string }

const CredentialCodec = Data.withSchema(Credential)

const datum = CredentialCodec.toData({
  VerificationKey: {
    hash: new Uint8Array(28),
  },
})
```

## End-to-End Workflow

1. **Compile** your smart contract (e.g., `aiken build`)
2. **Generate** types: run the codegen against `plutus.json`
3. **Import** generated schemas in your app
4. **Use** with `Data.withSchema` for type-safe transaction building

```typescript
import { Blueprint } from "@evolution-sdk/evolution"
import * as fs from "fs"

const blueprint = JSON.parse(fs.readFileSync("plutus.json", "utf-8"))
const code = Blueprint.Codegen.generateTypeScript(blueprint)
fs.writeFileSync("src/generated/contract-types.ts", code)
```

## Next Steps

- [Parameterized Scripts](./apply-params) — Apply parameters before using a validator
- [TSchema](../encoding/tschema) — Understand the schema system
- [Datums](./datums) — Attach data to script outputs
- [Spending from Script](./spending) — Unlock funds with type-safe redeemers
