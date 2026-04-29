---
title: 'Tutorial: Token Vesting'
description: Build a complete token vesting contract — lock funds with a deadline, then release to a beneficiary after time passes
---

# Tutorial: Token Vesting

Build a complete vesting flow: lock funds to a script with a deadline datum, then release them to a beneficiary after the deadline passes. This tutorial ties together TSchema, inline datums, validity ranges, and script spending.

## What You'll Build

A time-locked vesting contract where:
- An **owner** locks ADA to a script address with a deadline
- A **beneficiary** can withdraw the funds after the deadline passes
- The Plutus validator checks: (a) the deadline has passed and (b) the beneficiary signed the transaction

## Prerequisites

- A compiled Plutus vesting validator (from Aiken, Plutarch, or similar)
- A Blockfrost API key ([get one free](https://blockfrost.io))
- Basic familiarity with [smart contracts](./overview.md) and [TSchema](../encoding/tschema.md)

## Step 1: Define the Vesting Datum

The datum carries the state your validator needs — who the beneficiary is and when the lock expires:

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const VestingDatum = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
})

type VestingDatum = typeof VestingDatum.Type

const VestingCodec = Data.withSchema(VestingDatum)

const datum = VestingCodec.toData({
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: BigInt(new Date("2025-12-31T23:59:59Z").getTime()),
})
```

## Step 2: Lock Funds to the Vesting Script

```typescript
import { Address, Assets, Bytes, Data, InlineDatum, TSchema, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const VestingDatum = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
})
const VestingCodec = Data.withSchema(VestingDatum)

const datum = VestingCodec.toData({
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: BigInt(new Date("2025-12-31T23:59:59Z").getTime()),
})

const scriptAddress = Address.fromBech32(
  "addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu"
)

const tx = await client
  .newTx()
  .payToAddress({
    address: scriptAddress,
    assets: Assets.fromLovelace(50_000_000n),
    datum: new InlineDatum.InlineDatum({ data: datum }),
  })
  .build()

const signed = await tx.sign()
const lockTxHash = await signed.submit()
```

:::info
The locked funds are now at the script address with your datum attached. Nobody can spend them without satisfying the validator — which requires the deadline to pass and the beneficiary to sign.
:::

## Step 3: Spend After the Deadline

```typescript
import { Data, KeyHash, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const vestingUtxos: UTxO.UTxO[]
declare const vestingScript: any
declare const beneficiaryKeyHash: KeyHash.KeyHash

const now = BigInt(Date.now())

const tx = await client
  .newTx()
  .collectFrom({
    inputs: vestingUtxos,
    redeemer: Data.constr(0n, []),
    label: "claim-vesting",
  })
  .attachScript({ script: vestingScript })
  .addSigner({ keyHash: beneficiaryKeyHash })
  .setValidity({
    from: now,
    to: now + 300_000n,
  })
  .build()

const signed = await tx.sign()
const claimTxHash = await signed.submit()
```

### Why `setValidity` Matters

Plutus validators can't read the current time directly. Instead, they inspect the transaction's **validity interval** — the range `[from, to]` that the ledger guarantees the transaction was submitted within.

By setting `from: now` where `now > deadline`, you're telling the validator: "this transaction is only valid after the deadline, therefore the deadline has passed." The ledger enforces this — if someone tries to submit before the deadline, the transaction is rejected.

## Step 4: Full Working Example

```typescript
import {
  Address, Assets, Bytes, Data, InlineDatum, KeyHash,
  TSchema, preprod, Client
} from "@evolution-sdk/evolution"

const VestingDatum = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
})
const VestingCodec = Data.withSchema(VestingDatum)

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const scriptAddress = Address.fromBech32("addr_test1wrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qnmqsyu")
const beneficiaryHash = Bytes.fromHex(
  "abc123def456abc123def456abc123def456abc123def456abc123de"
)
const deadline = BigInt(new Date("2025-12-31T23:59:59Z").getTime())

declare const vestingScript: any

async function lockFunds(amount: bigint) {
  const datum = VestingCodec.toData({
    beneficiary: beneficiaryHash,
    deadline,
  })

  const tx = await client
    .newTx()
    .payToAddress({
      address: scriptAddress,
      assets: Assets.fromLovelace(amount),
      datum: new InlineDatum.InlineDatum({ data: datum }),
    })
    .build()

  const signed = await tx.sign()
  return signed.submit()
}

async function claimFunds() {
  const utxos = await client.getUtxos(scriptAddress)
  const now = BigInt(Date.now())

  if (now < deadline) {
    throw new Error(`Deadline not reached. Wait until ${new Date(Number(deadline))}`)
  }

  const tx = await client
    .newTx()
    .collectFrom({
      inputs: utxos,
      redeemer: Data.constr(0n, []),
      label: "claim-vesting",
    })
    .attachScript({ script: vestingScript })
    .addSigner({ keyHash: new KeyHash.KeyHash({ hash: beneficiaryHash }) })
    .setValidity({ from: now, to: now + 300_000n })
    .build()

  const signed = await tx.sign()
  return signed.submit()
}
```

## Common Pitfalls

:::warning
**Validity interval too early** — If `from` is before the deadline, the validator will reject. Always set `from` to a time after the deadline.
:::

| Problem | Cause | Fix |
| --- | --- | --- |
| "Script evaluation failed" | Validity `from` is before deadline | Set `from` to current time (must be > deadline) |
| "Missing required signer" | Beneficiary didn't sign | Add `.addSigner({ keyHash })` matching the datum's beneficiary |
| "Datum mismatch" | Datum schema doesn't match validator | Verify TSchema field order matches your Aiken/Plutarch type |
| "UTxO already spent" | Funds already claimed | Query UTxOs first to check if they're still there |
| "Outside validity interval" | Transaction submitted too late | Increase the `to` value or submit faster |

## Next Steps

- [Locking to Script](./locking.md) — More locking patterns
- [Spending from Script](./spending.md) — Redeemer modes and debug labels
- [Validity Ranges](../time/validity-ranges.md) — Time constraint details
- [TSchema](../encoding/tschema.md) — Schema definition reference
- [Native Scripts](./native-scripts.md) — Time-locks without Plutus
