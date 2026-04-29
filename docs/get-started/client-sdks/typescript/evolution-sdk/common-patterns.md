---
title: Common Patterns
description: Quick recipes for frequent tasks — copy, paste, and adapt
---

# Common Patterns

Task-oriented recipes for the most common operations. Each pattern is self-contained — copy, paste, adapt.

For full tutorials, see the dedicated guide sections linked from each recipe.

---

## Send ADA to an Address

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(5_000_000n) // 5 ADA
  })
  .build()

const signed = await tx.sign()
const hash = await signed.submit()
```

**More:** [Simple Payment](./transactions/simple-payment.md) | [Multi-Output](./transactions/multi-output.md)

---

## Query Wallet UTxOs

```typescript
import { Address, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

// Get all UTxOs at your wallet address
const utxos = await client.getWalletUtxos()
// utxos → UTxO[] with .txHash, .outputIndex, .assets, .datum

// Get UTxOs at a specific address
const addr = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const addrUtxos = await client.getUtxos(addr)
```

**More:** [Querying UTxOs](./querying/utxos.md)

---

## Lock Funds to a Script

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
await signed.submit()
```

**More:** [Locking to Script](./smart-contracts/locking.md) | [Datums](./smart-contracts/datums.md)

---

## Spend from a Script

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[] // from client.getUtxos(scriptAddress)
declare const validatorScript: any // compiled Plutus script (from Aiken build or Blueprint codegen)

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .attachScript({ script: validatorScript })
  .build()

const signed = await tx.sign()
await signed.submit()
```

**More:** [Spending from Script](./smart-contracts/spending.md) | [Redeemers](./smart-contracts/redeemers.md)

---

## Apply Parameters to a Compiled Script

```typescript
import { Data, UPLC } from "@evolution-sdk/evolution"

declare const compiledScript: string

const applied = UPLC.applyParamsToScript(compiledScript, [
  Data.bytearray("abc123def456abc123def456abc123def456abc123def456abc123de"),
  Data.int(1735689600000n),
])
// applied → double-CBOR hex string ready for transaction use
```

**More:** [Parameterized Scripts](./smart-contracts/apply-params.md)

---

## Define a Type-Safe Datum

```typescript
import { Bytes, Data, TSchema } from "@evolution-sdk/evolution"

const EscrowDatum = TSchema.Struct({
  beneficiary: TSchema.ByteArray,
  deadline: TSchema.Integer,
  amount: TSchema.Integer,
})

type EscrowDatum = typeof EscrowDatum.Type

const Codec = Data.withSchema(EscrowDatum)

// toData → PlutusData (Constr with 3 fields)
const datum = Codec.toData({
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: 1735689600000n,
  amount: 25_000_000n,
})

// toCBORHex → CBOR hex string for on-chain use
const cbor = Codec.toCBORHex({
  beneficiary: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de"),
  deadline: 1735689600000n,
  amount: 25_000_000n,
})
// cbor → "d8799f4e...1a017d7840ff" (ready for datum field)
```

**More:** [TSchema](./encoding/tschema.md) | [Datums](./smart-contracts/datums.md)

---

## Register a Stake Key

```typescript
import { Credential, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const stakeCredential: Credential.Credential

const tx = await client
  .newTx()
  .registerStake({ stakeCredential })
  .build()

const signed = await tx.sign()
await signed.submit()
```

**More:** [Staking Registration](./staking/registration.md) | [Delegation](./staking/delegation.md)

---

## Set Transaction Validity Window

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const now = BigInt(Date.now())

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .setValidity({
    from: now,
    to: now + 300_000n // 5 minutes
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

**More:** [Validity Ranges](./time/validity-ranges.md)

---

## Sign and Verify a Message (CIP-30)

```typescript
import { COSE, PrivateKey, Address } from "@evolution-sdk/evolution"

declare const privateKey: PrivateKey.PrivateKey
declare const myAddress: Address.Address

const payload = COSE.Utils.fromText("Login to MyDApp")

const signed = COSE.SignData.signData(
  Address.toHex(myAddress),
  payload,
  privateKey
)
// signed.signature — CBOR-encoded COSE_Sign1
// signed.key — CBOR-encoded COSE_Key
```

**More:** [Message Signing](./wallets/message-signing.md)

---

## Handle Errors

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

try {
  const tx = await client
    .newTx()
    .payToAddress({
      address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
      assets: Assets.fromLovelace(2_000_000n)
    })
    .build()

  const signed = await tx.sign()
  await signed.submit()
} catch (error) {
  // TransactionBuilderError — build phase failure
  // EvaluationError — script evaluation failure
  // ProviderError — network/API error
  // CoinSelectionError — insufficient funds
  console.error(error)
}
```

**More:** [Error Handling](./advanced/error-handling.md)
