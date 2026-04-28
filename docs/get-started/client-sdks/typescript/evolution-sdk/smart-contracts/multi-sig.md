---
title: 'Tutorial: Multi-Sig Treasury'
description: Build a 2-of-3 multi-signature treasury — shared funds that require multiple signers to spend
---

# Tutorial: Multi-Sig Treasury

Build a shared treasury where no single person controls the funds. A 2-of-3 multi-sig requires any 2 out of 3 key holders to approve a withdrawal — perfect for team treasuries, DAOs, and escrow arrangements.

## What You'll Build

- A **2-of-3 native script** (ScriptNOfK) from 3 key hashes
- A **treasury address** derived from the script
- A **funding transaction** to deposit ADA
- A **withdrawal transaction** requiring 2 of 3 signers

No Plutus required — native scripts handle multi-sig natively.

## Prerequisites

- A Blockfrost API key ([get one free](https://blockfrost.io))
- Familiarity with [native scripts](./native-scripts)
- 3 wallets (or 3 account indices from the same mnemonic for testing)

## Step 1: Create the Multi-Sig Script

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const alice = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")
const bob   = Bytes.fromHex("b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8")
const carol = Bytes.fromHex("c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8")

// 2-of-3: any two must sign to spend
const treasuryScript = NativeScripts.makeScriptNOfK(2n, [
  NativeScripts.makeScriptPubKey(alice),
  NativeScripts.makeScriptPubKey(bob),
  NativeScripts.makeScriptPubKey(carol),
])
```

### How It Works

| Signers Present | Can Spend? |
|----------------|------------|
| Alice + Bob | Yes (2 of 3) |
| Alice + Carol | Yes (2 of 3) |
| Bob + Carol | Yes (2 of 3) |
| Alice only | No (1 of 3) |
| None | No |

## Step 2: Fund the Treasury

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const treasuryAddress: Address.Address

const tx = await client
  .newTx()
  .payToAddress({
    address: treasuryAddress,
    assets: Assets.fromLovelace(100_000_000n),
  })
  .build()

const signed = await tx.sign()
const depositTxHash = await signed.submit()
```

:::info
Anyone can send funds to the treasury address. The multi-sig restriction only applies to **spending** — deposits are unrestricted.
:::

## Step 3: Spend from the Treasury (2 of 3 Sign)

```typescript
import { Address, Assets, KeyHash, NativeScripts, Bytes, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const treasuryUtxos: UTxO.UTxO[]
declare const treasuryScript: NativeScripts.NativeScript

const aliceKeyHash = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")
const bobKeyHash   = Bytes.fromHex("b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8")

const recipient = Address.fromBech32(
  "addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"
)

const tx = await client
  .newTx()
  .collectFrom({ inputs: treasuryUtxos })
  .attachScript({ script: treasuryScript })
  .addSigner({ keyHash: new KeyHash.KeyHash({ hash: aliceKeyHash }) })
  .addSigner({ keyHash: new KeyHash.KeyHash({ hash: bobKeyHash }) })
  .payToAddress({
    address: recipient,
    assets: Assets.fromLovelace(50_000_000n),
  })
  .build()

const signed = await tx.sign()
const withdrawTxHash = await signed.submit()
```

:::warning
The transaction must be signed by the actual private keys of the listed signers. In a real multi-sig flow, the unsigned transaction CBOR is shared between signers, each adds their signature, then the combined transaction is submitted. See [Client Architecture](../clients/architecture) for the frontend/backend signing pattern.
:::

## Variations

### 3-of-3 (Unanimous)

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const alice = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")
const bob   = Bytes.fromHex("b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8")
const carol = Bytes.fromHex("c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8")

const unanimousScript = NativeScripts.makeScriptAll([
  NativeScripts.makeScriptPubKey(alice),
  NativeScripts.makeScriptPubKey(bob),
  NativeScripts.makeScriptPubKey(carol),
])
```

### Time-Locked Treasury

Add a time constraint — funds can only be withdrawn after a specific date:

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const alice = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")
const bob   = Bytes.fromHex("b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8")

const timedTreasury = NativeScripts.makeScriptAll([
  NativeScripts.makeScriptNOfK(2n, [
    NativeScripts.makeScriptPubKey(alice),
    NativeScripts.makeScriptPubKey(bob),
  ]).script,
  NativeScripts.makeInvalidBefore(50000000n),
])
```

## Common Pitfalls

| Problem | Cause | Fix |
| --- | --- | --- |
| "Missing required signer" | Not enough signers added | Add `.addSigner()` for each approving key |
| "Native script validation failed" | Wrong key hashes | Verify key hashes match those in the script exactly |
| Transaction rejected | Only 1 of 3 signed (need 2) | Get a second signer to approve |
| Wrong treasury address | Script hash doesn't match | Ensure you derive the address from the same script |

## Next Steps

- [Native Scripts](./native-scripts) — All script types and composition
- [Tutorial: Token Vesting](./vesting) — Time-locked release with Plutus
- [Client Architecture](../clients/architecture) — Multi-party signing flow (frontend/backend)
- [Spending from Script](./spending) — Required signers and debug labels
