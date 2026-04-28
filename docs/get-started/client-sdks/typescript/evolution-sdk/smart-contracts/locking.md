---
title: Locking to Script
description: Send funds to a script address with datums
---

# Locking to Script

Locking funds to a script means sending ADA or native tokens to a script address with a datum attached. The datum carries the state your validator will check when someone tries to spend the UTxO later.

This is the first half of any smart contract interaction — you lock funds, then later spend them.

## Basic Lock

Send ADA to a script address with an inline datum:

```typescript
import { Address, Assets, Data, InlineDatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const scriptAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")

const tx = await client
  .newTx()
  .payToAddress({
    address: scriptAddress,
    assets: Assets.fromLovelace(10_000_000n),
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, []) })
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
console.log("Locked funds at:", txHash)
```

## Lock with Structured Datum

For real contracts, define your datum with TSchema for type safety:

```typescript
import { Address, Assets, Bytes, Data, InlineDatum, TSchema, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const EscrowDatumSchema = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
  amount: TSchema.Integer
})

const EscrowDatumCodec = Data.withSchema(EscrowDatumSchema)

const datum = EscrowDatumCodec.toData({
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: 1735689600000n,
  amount: 25_000_000n
})

const scriptAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")

const tx = await client
  .newTx()
  .payToAddress({
    address: scriptAddress,
    assets: Assets.fromLovelace(25_000_000n),
    datum: new InlineDatum.InlineDatum({ data: datum })
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

## Lock with Native Tokens

Lock both ADA and native tokens to a script:

```typescript
import { Address, Assets, Data, InlineDatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const scriptAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")

let assets = Assets.fromLovelace(5_000_000n)
assets = Assets.addByHex(assets, "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1", "", 100n)

const tx = await client
  .newTx()
  .payToAddress({
    address: scriptAddress,
    assets,
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, [100n]) })
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Lock with Reference Script

Store a script on-chain alongside the locked funds. Other transactions can reference this script instead of including it directly:

```typescript
import { Address, Assets, Data, InlineDatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const validatorScript: any

const scriptAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")

const tx = await client
  .newTx()
  .payToAddress({
    address: scriptAddress,
    assets: Assets.fromLovelace(10_000_000n),
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, []) }),
    script: validatorScript
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Multiple Locks in One Transaction

```typescript
import { Address, Assets, Data, InlineDatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const escrowAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")
const vestingAddress = Address.fromBech32("addr_test1wz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3pqsyu")

const tx = await client
  .newTx()
  .payToAddress({
    address: escrowAddress,
    assets: Assets.fromLovelace(10_000_000n),
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, [1735689600000n]) })
  })
  .payToAddress({
    address: vestingAddress,
    assets: Assets.fromLovelace(50_000_000n),
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, [1735776000000n, 5000000n]) })
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Next Steps

- [Spending from Script](./spending) — Unlock the funds you locked
- [Datums](./datums) — Datum types and construction patterns
- [Reference Scripts](./reference-scripts) — Store scripts on-chain
