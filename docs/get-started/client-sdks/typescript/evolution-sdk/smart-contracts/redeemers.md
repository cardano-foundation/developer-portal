---
title: Redeemers
description: Provide data to script validators when spending or minting
---

# Redeemers

Redeemers are the data you provide to a Plutus script when spending from it or minting with it. The validator receives this data and uses it to decide whether to authorize the transaction.

Evolution SDK supports three redeemer modes that handle a key challenge: redeemer indices aren't known until after coin selection, because coin selection can add or reorder inputs.

## The Index Problem

Cardano redeemers reference inputs by their sorted position in the transaction. When coin selection adds wallet UTxOs to cover fees, all indices can shift. Evolution SDK solves this by deferring redeemer construction until after coin selection completes.

## Static Mode

The simplest mode — provide a direct `Data` value. Use this when your redeemer doesn't need to know its input index:

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[]
declare const validatorScript: any

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: validatorScript })
  .build()
```

**When to use**: Most cases. Simple action tags (Claim, Cancel, Update), fixed parameters, or any redeemer that doesn't depend on transaction structure.

## Self Mode

A callback that receives the input's final index after coin selection. Use this when the redeemer needs to encode its own position:

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[]
declare const validatorScript: any

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: (input) => Data.constr(0n, [BigInt(input.index)])
  })
  .attachScript({ script: validatorScript })
  .build()
```

The callback receives an `IndexedInput` object:

```typescript
interface IndexedInput {
  readonly index: number // Final 0-based index in sorted tx inputs
  readonly utxo: UTxO // The original UTxO
}
```

**When to use**: Validators that need the input's own index for self-referential checks.

## Batch Mode

A callback that sees all specified inputs with their final indices. Use this when multiple script inputs need coordinated redeemer values:

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const orderUtxos: UTxO.UTxO[]
declare const validatorScript: any

const tx = await client
  .newTx()
  .collectFrom({
    inputs: orderUtxos,
    redeemer: {
      all: (inputs) => Data.constr(0n, [inputs.map((i) => BigInt(i.index)) as Data.Data]),
      inputs: orderUtxos
    }
  })
  .attachScript({ script: validatorScript })
  .build()
```

**When to use**: DEX batch fills, multi-UTxO state transitions, or any validator that needs to see indices of multiple inputs simultaneously.

## Minting Redeemers

Redeemers also apply to minting policies. The same three modes work:

```typescript
import { Assets, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const mintingPolicyScript: any

let assets = Assets.fromLovelace(2_000_000n)
assets = Assets.addByHex(assets, "abc123def456abc123def456abc123def456abc123def456abc123de", "", 100n)

const tx = await client
  .newTx()
  .mintAssets({
    assets,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: mintingPolicyScript })
  .build()
```

## Type-Safe Redeemers with TSchema

Define redeemer schemas for compile-time validation:

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const RedeemerSchema = TSchema.Variant({
  Claim: {},
  Cancel: {},
  Update: {
    new_deadline: TSchema.Integer,
    new_beneficiary: TSchema.ByteArray
  }
})

type Redeemer = typeof RedeemerSchema.Type
const RedeemerCodec = Data.withSchema(RedeemerSchema)

const claim = RedeemerCodec.toData({ Claim: {} })
const cancel = RedeemerCodec.toData({ Cancel: {} })
const update = RedeemerCodec.toData({
  Update: {
    new_deadline: 1735776000000n,
    new_beneficiary: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
  }
})
```

## Choosing the Right Mode

| Mode       | Redeemer Value                      | Use Case                               |
| ---------- | ----------------------------------- | -------------------------------------- |
| **Static** | Fixed `Data` value                  | Action tags, simple parameters         |
| **Self**   | `(input) => Data`                   | Self-referential index checks          |
| **Batch**  | `{ all: (inputs) => Data, inputs }` | Multi-input coordination, DEX batching |

Start with static mode. Only use self or batch when your validator specifically needs input indices.

## Next Steps

- [Spending from Script](./spending) — Using redeemers in spend transactions
- [Datums](./datums) — The other half of script data
- [TSchema](../encoding/tschema) — Type-safe schema definitions
