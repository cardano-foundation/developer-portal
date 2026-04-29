---
title: Parameterized Scripts
description: Apply parameters to Plutus scripts at runtime
---

# Parameterized Scripts

Parameterized scripts are Plutus validators that accept configuration at deployment time. Instead of hardcoding values like an owner's key hash or a deadline into the script, you leave them as parameters and apply them before using the script on-chain.

This is the standard pattern for reusable smart contracts — write one validator, deploy it with different parameters for different use cases.

## How It Works

A parameterized Plutus script is compiled with "holes" — lambda abstractions at the top level. When you apply parameters, Evolution SDK:

1. Decodes the double-CBOR-encoded script to UPLC
2. Wraps each parameter as a UPLC `Constant` node
3. Creates `Apply` nodes to fill in the lambda parameters
4. Re-encodes the result back to double-CBOR hex

The result is a fully applied script ready to use in transactions.

## Apply with Raw Data

Use `UPLC.applyParamsToScript` when you have parameters as `Data.Data` values:

```typescript
import { Data, UPLC } from "@evolution-sdk/evolution"

declare const compiledScript: string

const appliedScript = UPLC.applyParamsToScript(compiledScript, [
  Data.bytearray("abc123def456abc123def456abc123def456abc123def456abc123de"),
  Data.int(1735689600000n),
])
```

Each parameter is applied in order, matching the lambda bindings in the compiled script.

## Apply with Type-Safe Schemas

Use `UPLC.applyParamsToScriptWithSchema` for type-safe parameter conversion via a `toData` function:

```typescript
import { Bytes, Data, TSchema, UPLC } from "@evolution-sdk/evolution"

const ParamsSchema = TSchema.Struct({
  owner: TSchema.ByteArray,
  deadline: TSchema.Integer,
})

const ParamsCodec = Data.withSchema(ParamsSchema)

declare const compiledScript: string

const appliedScript = UPLC.applyParamsToScriptWithSchema(
  compiledScript,
  [
    ParamsCodec.toData({
      owner: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
      deadline: 1735689600000n,
    }),
  ],
  (value) => value,
)
```

## Full Example: Parameterized Vesting Contract

```typescript
import {
  Address, Assets, Data, InlineDatum, UPLC,
  preprod, Client,
} from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const compiledVestingScript: string

const appliedScript = UPLC.applyParamsToScript(compiledVestingScript, [
  Data.bytearray("abc123def456abc123def456abc123def456abc123def456abc123de"),
  Data.int(1735689600000n),
])

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu"),
    assets: Assets.fromLovelace(50_000_000n),
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, []) }),
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## CBOR Encoding Options

By default, `applyParamsToScript` uses Aiken-compatible encoding (indefinite-length arrays and maps). If your script was compiled with a different tool, you can pass a different CBOR preset:

```typescript
import { CBOR, Data, UPLC } from "@evolution-sdk/evolution"

declare const compiledScript: string

// Default Aiken encoding (indefinite-length arrays/maps)
const applied = UPLC.applyParamsToScript(compiledScript, [
  Data.int(42n),
])

// CML-compatible encoding (definite-length)
const appliedCml = UPLC.applyParamsToScript(
  compiledScript,
  [Data.int(42n)],
  CBOR.CML_DATA_DEFAULT_OPTIONS,
)
```

## When to Use Parameterized Scripts

| Scenario | Approach |
| --- | --- |
| Same logic, different config per deployment | Parameterized script |
| One-off validator with fixed logic | Non-parameterized script |
| Config changes at runtime (per-transaction) | Use datum fields instead |

Common parameters include:
- **Owner/admin key hashes** — Who can perform admin actions
- **Deadlines** — Time-based unlock conditions
- **Token policy IDs** — Which tokens the contract manages
- **Oracle addresses** — External data feed references

## Next Steps

- [Locking to Script](./locking.md) — Lock funds to your parameterized script
- [Spending from Script](./spending.md) — Spend with redeemers
- [Datums](./datums.md) — Attach state to script outputs
- [TSchema](../encoding/tschema.md) — Type-safe data encoding
