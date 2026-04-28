---
title: Reference Scripts
description: Reduce transaction size by referencing on-chain scripts
---

# Reference Scripts

Reference scripts (Plutus V2+) let you store a script on-chain in a UTxO and reference it from other transactions instead of including the full script each time. This reduces transaction size and fees significantly — a script that's 10KB only needs to be included once, then all future transactions reference it.

## How It Works

1. **Deploy**: Create a UTxO containing the script as a reference script
2. **Reference**: Future transactions use `readFrom` to reference the UTxO containing the script
3. **Save**: No need to attach the script directly — smaller transactions, lower fees

## Step 1: Deploy a Reference Script

Store your validator script on-chain by including it in a UTxO output:

```typescript
import { Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const validatorScript: any

const myAddress = await client.address()

const tx = await client
  .newTx()
  .payToAddress({
    address: myAddress,
    assets: Assets.fromLovelace(10_000_000n),
    script: validatorScript
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
console.log("Reference script deployed:", txHash)
```

## Step 2: Use the Reference Script

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[]
declare const referenceScriptUtxo: UTxO.UTxO

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .readFrom({ referenceInputs: [referenceScriptUtxo] })
  .build()

const signed = await tx.sign()
await signed.submit()
```

The key difference: `readFrom` makes the UTxO available as a reference input without consuming it. The script is read from the UTxO's reference script field, and the UTxO remains on-chain for future use.

## Reference Scripts vs Attached Scripts

| Approach                      | Transaction Size     | First Use           | Subsequent Uses      |
| ----------------------------- | -------------------- | ------------------- | -------------------- |
| **Attached** (`attachScript`) | Includes full script | Same size           | Same size every time |
| **Referenced** (`readFrom`)   | Only UTxO reference  | Deploy tx is larger | Much smaller         |

**Use reference scripts when**: Your script is used in multiple transactions. The deployment cost pays for itself after just a few uses.

**Use attached scripts when**: One-off transactions or very small scripts where the overhead of a reference UTxO isn't worth it.

## Reading Other Data via Reference Inputs

Reference inputs aren't just for scripts — you can also read datums from UTxOs without consuming them:

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const scriptUtxos: UTxO.UTxO[]
declare const oracleUtxo: UTxO.UTxO
declare const refScriptUtxo: UTxO.UTxO

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])
  })
  .readFrom({
    referenceInputs: [refScriptUtxo, oracleUtxo]
  })
  .build()
```

This is commonly used for:

- **Oracle feeds** — Read price data without consuming the oracle UTxO
- **Configuration UTxOs** — Read protocol settings stored on-chain
- **Shared state** — Multiple transactions can read the same UTxO simultaneously

## Next Steps

- [Locking to Script](./locking) — Deploy reference scripts when locking funds
- [Spending from Script](./spending) — Use reference scripts when spending
- [Datums](./datums) — Data attached to script UTxOs
