---
title: 'Tutorial: Mint an NFT'
description: Mint a Cardano NFT with CIP-25 metadata — from minting policy to on-chain token
---

# Tutorial: Mint an NFT

Mint a unique NFT on Cardano with CIP-25 metadata — a name, image, and description stored on-chain. This tutorial uses a native script minting policy (no Plutus required) and attaches standard NFT metadata.

## What You'll Build

- A **native script minting policy** that only you can mint from
- An **NFT** (quantity 1) with CIP-25 metadata (name, image, description)
- A **transaction** that mints the token, attaches metadata, and sends it to a recipient

## Prerequisites

- A Blockfrost API key ([get one free](https://blockfrost.io))
- Basic familiarity with [minting tokens](./minting) and [native scripts](./native-scripts)

## Step 1: Create a Minting Policy

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const myKeyHash = Bytes.fromHex(
  "abc123def456abc123def456abc123def456abc123def456abc123de"
)

const mintingPolicy = NativeScripts.makeScriptPubKey(myKeyHash)
const nativeScript = new NativeScripts.NativeScript({ script: mintingPolicy })
```

:::info
For a **one-time mint** (true NFT uniqueness), add a time-lock to the policy. After the deadline passes, nobody can mint more tokens under this policy. See [Native Scripts](./native-scripts) for time-lock examples.
:::

## Step 2: Structure CIP-25 Metadata

CIP-25 defines the standard metadata format for Cardano NFTs. It uses transaction metadata label `721`:

```typescript
import { TransactionMetadatum } from "@evolution-sdk/evolution"

const policyId = "abc123def456abc123def456abc123def456abc123def456abc123de"
const assetNameHex = "4d794e4654303031" // "MyNFT001" in hex

const nftMetadata = new Map<TransactionMetadatum.TransactionMetadatum, TransactionMetadatum.TransactionMetadatum>([
  [policyId, new Map<TransactionMetadatum.TransactionMetadatum, TransactionMetadatum.TransactionMetadatum>([
    [assetNameHex, new Map<TransactionMetadatum.TransactionMetadatum, TransactionMetadatum.TransactionMetadatum>([
      ["name", "My First NFT"],
      ["image", "ipfs://QmYourImageHashHere"],
      ["mediaType", "image/png"],
      ["description", "My first NFT minted with Evolution SDK"],
    ])]
  ])]
])
```

### CIP-25 Required Fields

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Display name of the NFT |
| `image` | string | URI to the image (typically `ipfs://...`) |

### CIP-25 Optional Fields

| Field | Type | Description |
| --- | --- | --- |
| `mediaType` | string | MIME type of the image (e.g., `image/png`) |
| `description` | string | Human-readable description |
| `files` | array | Additional files (for multi-asset NFTs) |

## Step 3: Mint, Attach Metadata, and Send

```typescript
import {
  Address, Assets, NativeScripts, Bytes, TransactionMetadatum,
  preprod, Client
} from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const myKeyHash = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
const mintingPolicy = NativeScripts.makeScriptPubKey(myKeyHash)
const nativeScript = new NativeScripts.NativeScript({ script: mintingPolicy })

const policyId = "abc123def456abc123def456abc123def456abc123def456abc123de"
const assetName = "4d794e4654303031"

let mintAssets = Assets.fromLovelace(0n)
mintAssets = Assets.addByHex(mintAssets, policyId, assetName, 1n)

let sendAssets = Assets.fromLovelace(2_000_000n)
sendAssets = Assets.addByHex(sendAssets, policyId, assetName, 1n)

const nftMetadata = new Map<TransactionMetadatum.TransactionMetadatum, TransactionMetadatum.TransactionMetadatum>([
  [policyId, new Map<TransactionMetadatum.TransactionMetadatum, TransactionMetadatum.TransactionMetadatum>([
    [assetName, new Map<TransactionMetadatum.TransactionMetadatum, TransactionMetadatum.TransactionMetadatum>([
      ["name", "My First NFT"],
      ["image", "ipfs://QmYourImageHashHere"],
      ["mediaType", "image/png"],
      ["description", "Minted with Evolution SDK"],
    ])]
  ])]
])

const recipient = Address.fromBech32(
  "addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"
)

const tx = await client
  .newTx()
  .mintAssets({ assets: mintAssets })
  .attachScript({ script: nativeScript })
  .attachMetadata({ label: 721n, metadata: nftMetadata })
  .payToAddress({ address: recipient, assets: sendAssets })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

## How It Works

1. **`mintAssets`** — creates 1 token under your policy ID (quantity 1 = non-fungible)
2. **`attachScript`** — includes the native script so the ledger can verify your minting authority
3. **`attachMetadata`** — adds CIP-25 metadata under label 721 (the NFT metadata standard)
4. **`payToAddress`** — sends the minted NFT + min ADA to the recipient

The builder handles fee calculation, coin selection, and change automatically.

## Common Pitfalls

:::warning
**Metadata label must be `721n`** (bigint). Using `721` (number) will cause a type error. CIP-25 requires label 721.
:::

| Problem | Cause | Fix |
| --- | --- | --- |
| NFT not showing in wallet | Wrong metadata structure | Ensure policy ID and asset name in metadata match the minted token exactly |
| "Minting not allowed" | Wrong key signed | Ensure the signing wallet's key hash matches the minting policy |
| Missing image | Invalid IPFS URI | Use full `ipfs://Qm...` format, pin the file first |
| Type error on label | Using number instead of bigint | Use `721n` not `721` |
| Min UTxO too low | Not enough ADA with the NFT | Include at least 2 ADA with the NFT output |

## Next Steps

- [Minting Tokens](./minting) — Plutus minting policies and burning
- [Native Scripts](./native-scripts) — Time-locked policies for one-time mints
- [Asset Metadata](../assets/metadata) — More metadata patterns (CIP-20 messages)
- [Blueprint Codegen](./blueprint-codegen) — Generate types from Aiken validators
