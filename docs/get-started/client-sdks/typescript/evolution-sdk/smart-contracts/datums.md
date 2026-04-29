---
title: Datums
description: Attach data to script-locked UTxOs
---

# Datums

Datums are the data payloads attached to UTxOs at script addresses. When you lock funds to a smart contract, the datum carries the state your validator needs — beneficiary addresses, deadlines, token quantities, or any structured data your contract logic requires.

## Datum Options

Evolution SDK supports two ways to attach datums to outputs:

| Type             | Description                                                    | When to Use                                 |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------- |
| **Inline Datum** | Data stored directly in the UTxO                               | Recommended for most use cases (Plutus V2+) |
| **Datum Hash**   | Only a hash stored on-chain; full datum provided when spending | Legacy Plutus V1 contracts                  |

## Inline Datums

Inline datums embed the full data in the output. The spending transaction can read it directly without needing to provide the datum separately:

```typescript
import { Address, Assets, Data, InlineDatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu"),
    assets: Assets.fromLovelace(10_000_000n),
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, [5000000n, 1735689600000n]) })
  })
  .build()
```

## Datum Hashes

Datum hashes store only a 32-byte hash in the output. The full datum must be provided when spending:

```typescript
import { Address, Assets, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const datum = Data.constr(0n, [5000000n])
const datumHash = Data.toDatumHash(datum)

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu"),
    assets: Assets.fromLovelace(10_000_000n),
    datum: datumHash
  })
  .build()
```

## Type-Safe Datums with TSchema

For production contracts, define your datum structure with TSchema to get compile-time type checking and automatic CBOR encoding:

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const EscrowDatumSchema = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
  amount: TSchema.Integer
})

type EscrowDatum = typeof EscrowDatumSchema.Type
const EscrowDatumCodec = Data.withSchema(EscrowDatumSchema)

const datum: EscrowDatum = {
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: 1735689600000n,
  amount: 10_000_000n
}

const plutusData = EscrowDatumCodec.toData(datum)
```

## Constructing Complex Datums

### Variant Datums

For datums with multiple possible shapes:

```typescript
import { Data, TSchema } from "@evolution-sdk/evolution"

const OrderDatumSchema = TSchema.Variant({
  Buy: {
    price: TSchema.Integer,
    quantity: TSchema.Integer
  },
  Sell: {
    price: TSchema.Integer,
    quantity: TSchema.Integer,
    min_fill: TSchema.Integer
  },
  Cancel: {}
})

type OrderDatum = typeof OrderDatumSchema.Type

const buyOrder: OrderDatum = {
  Buy: { price: 1500000n, quantity: 100n }
}

const sellOrder: OrderDatum = {
  Sell: { price: 2000000n, quantity: 50n, min_fill: 10n }
}
```

### Using Raw PlutusData

For quick prototyping without schemas:

```typescript
import { Bytes, Data, Text } from "@evolution-sdk/evolution"

const datum = Data.constr(0n, [
  Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  1735689600000n,
  Data.map([
    [Text.toBytes("name"), Text.toBytes("My NFT")],
    [Text.toBytes("image"), Text.toBytes("ipfs://Qm...")]
  ])
])
```

## Reading Datums from UTxOs

When querying UTxOs, inline datums are available directly on the UTxO object:

```typescript
import { Address, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const scriptAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")
const utxos = await client.getUtxos(scriptAddress)

for (const utxo of utxos) {
  if (utxo.datumOption) {
    console.log("UTxO has datum attached")
  }
}
```

## Best Practices

- **Use inline datums** for new contracts — they're simpler and don't require datum lookup when spending
- **Use TSchema** for production — compile-time type checking prevents encoding mistakes
- **Match your validator exactly** — field names and order in TSchema must match your Plutus type definitions
- **Test round-trips** — verify that encoding and decoding your datum produces identical results

## Next Steps

- [Locking to Script](./locking.md) — Send funds to a script address with datums
- [Spending from Script](./spending.md) — Unlock script UTxOs with redeemers
- [TSchema](../encoding/tschema.md) — Type-safe schema definitions
- [PlutusData](../encoding/data.md) — Raw PlutusData construction
