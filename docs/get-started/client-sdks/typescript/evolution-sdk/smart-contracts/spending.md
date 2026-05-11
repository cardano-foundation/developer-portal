---
title: Spending from Script
description: Unlock funds from a script address using redeemers
---

# Spending from Script

Spending from a script means consuming a UTxO locked at a script address by providing a redeemer — the data your validator checks to authorize the spend. Evolution SDK handles script evaluation, redeemer indexing, and collateral selection automatically.

## Basic Spend

Use `collectFrom` to specify which script UTxOs to spend and what redeemer to provide:

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

const signed = await tx.sign()
const txHash = await signed.submit()
```

## With Required Signer

Many validators check that a specific key signed the transaction. Use `addSigner` to include the required signer:

```typescript
import { Data, KeyHash, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[]
declare const validatorScript: any
declare const myKeyHash: KeyHash.KeyHash

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: validatorScript })
  .addSigner({ keyHash: myKeyHash })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## With Time Constraints

For time-locked validators, set the transaction validity interval so the script can verify the current time:

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

const now = BigInt(Date.now())

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: validatorScript })
  .setValidity({
    from: now,
    to: now + 300_000n // Expires in 5 minutes
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Spend and Pay in One Transaction

```typescript
import { Address, Assets, Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[]
declare const validatorScript: any

const beneficiary = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: validatorScript })
  .payToAddress({
    address: beneficiary,
    assets: Assets.fromLovelace(10_000_000n)
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Redeemer Modes

The `redeemer` parameter supports three modes for different complexity levels. See the [Redeemers](./redeemers.md) page for details.

**Static** — Direct data value (most common):

```typescript
redeemer: Data.constr(0n, [])
```

**Self** — Callback that receives the input's final index:

```typescript
redeemer: (input) => Data.constr(0n, [BigInt(input.index)])
```

**Batch** — Callback for coordinating multiple inputs:

```typescript
redeemer: {
  all: (inputs) => Data.constr(0n, inputs.map(i => BigInt(i.index))),
  inputs: [utxo1, utxo2]
}
```

## Debug Labels

Add labels to identify operations in error messages when debugging script failures:

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const escrowUtxos: UTxO.UTxO[]
declare const validatorScript: any

const tx = await client
  .newTx()
  .collectFrom({
    inputs: escrowUtxos,
    redeemer: Data.constr(0n, []),
    label: "claim-escrow"
  })
  .attachScript({ script: validatorScript })
  .build()
```

## Next Steps

- [Redeemers](./redeemers.md) — Deep dive on static, self, and batch modes
- [Locking to Script](./locking.md) — Lock funds before spending
- [Reference Scripts](./reference-scripts.md) — Reduce transaction size
- [Time](../time/validity-ranges.md) — Validity interval configuration
