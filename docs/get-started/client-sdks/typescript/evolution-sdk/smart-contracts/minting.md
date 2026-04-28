---
title: Minting Tokens
description: Mint and burn native tokens with minting policies
---

# Minting Tokens

Minting creates new native tokens on Cardano. Every mint requires a minting policy — either a Plutus script or a native script — that authorizes which tokens can be created and under what conditions.

## How It Works

1. Define the tokens to mint (policy ID + asset name + quantity)
2. Attach the minting policy script
3. Provide a redeemer (for Plutus policies)
4. Build, sign, submit — the builder handles the rest

Positive quantities mint tokens. Negative quantities burn them.

## Mint with a Plutus Policy

```typescript
import { Assets, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const mintingPolicy: any

const policyId = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0"
const assetName = "4d79546f6b656e"
let assets = Assets.fromLovelace(0n)
assets = Assets.addByHex(assets, policyId, assetName, 1000n)

const tx = await client
  .newTx()
  .mintAssets({
    assets,
    redeemer: Data.constr(0n, []),
    label: "mint-my-token"
  })
  .attachScript({ script: mintingPolicy })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Mint and Send in One Transaction

```typescript
import { Address, Assets, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const mintingPolicy: any

const policyId = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0"
const assetName = "4d79546f6b656e"

let mintAssets = Assets.fromLovelace(0n)
mintAssets = Assets.addByHex(mintAssets, policyId, assetName, 1n)

let sendAssets = Assets.fromLovelace(2_000_000n)
sendAssets = Assets.addByHex(sendAssets, policyId, assetName, 1n)

const tx = await client
  .newTx()
  .mintAssets({
    assets: mintAssets,
    redeemer: Data.constr(0n, []),
  })
  .attachScript({ script: mintingPolicy })
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: sendAssets
  })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Burn Tokens

Use negative quantities to burn tokens you hold:

```typescript
import { Assets, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const mintingPolicy: any

const policyId = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0"
const assetName = "4d79546f6b656e"

let burnAssets = Assets.fromLovelace(0n)
burnAssets = Assets.addByHex(burnAssets, policyId, assetName, -500n)

const tx = await client
  .newTx()
  .mintAssets({
    assets: burnAssets,
    redeemer: Data.constr(1n, []),
    label: "burn-tokens"
  })
  .attachScript({ script: mintingPolicy })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## What the Builder Handles

When minting, Evolution SDK automatically:
- Tracks the minting policy via its policy ID
- Indexes mint redeemers correctly after coin selection
- Includes the minting policy in the script data hash
- Evaluates the minting policy to compute execution units
- Calculates fees including script execution costs

## Next Steps

- [Locking to Script](./locking) — Lock minted tokens to a script address
- [Asset Units](../assets/units) — Understanding policy IDs and asset names
- [Asset Metadata](../assets/metadata) — Attach CIP-25 NFT metadata
- [Reference Scripts](./reference-scripts) — Store minting policies on-chain
