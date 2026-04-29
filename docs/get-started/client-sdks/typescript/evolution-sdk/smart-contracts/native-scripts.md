---
title: Native Scripts
description: Time-locks, multi-sig, and simple minting policies without Plutus
---

# Native Scripts

Native scripts are lightweight validators that don't require Plutus. They check simple conditions — key signatures, time constraints, or combinations of both. Use them for time-locked vesting, multi-sig wallets, and simple minting policies.

No script evaluation costs, no collateral required, smaller transactions.

## Script Types

| Type | What It Checks | Use Case |
| --- | --- | --- |
| **ScriptPubKey** | A specific key signed the transaction | Single-signer authorization |
| **InvalidBefore** | Transaction is after a slot | Time-locked release |
| **InvalidHereafter** | Transaction is before a slot | Deadline enforcement |
| **ScriptAll** | ALL sub-scripts pass | Multi-sig (all must sign) |
| **ScriptAny** | ANY sub-script passes | Multi-sig (one must sign) |
| **ScriptNOfK** | N of K sub-scripts pass | M-of-N multi-sig |

## Building Native Scripts

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

// Single key requirement
const singleSigner = NativeScripts.makeScriptPubKey(
  Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
)

// Time-lock: can't spend before slot 100000
const timeLock = NativeScripts.makeInvalidBefore(100000n)

// Deadline: can't spend after slot 200000
const deadline = NativeScripts.makeInvalidHereafter(200000n)
```

## Multi-Sig: All Must Sign

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const keyHash1 = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
const keyHash2 = Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
const keyHash3 = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")

const multiSig = NativeScripts.makeScriptAll([
  NativeScripts.makeScriptPubKey(keyHash1),
  NativeScripts.makeScriptPubKey(keyHash2),
  NativeScripts.makeScriptPubKey(keyHash3),
])
```

## Multi-Sig: Any Can Sign

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const keyHash1 = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
const keyHash2 = Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")

const anyOf = NativeScripts.makeScriptAny([
  NativeScripts.makeScriptPubKey(keyHash1),
  NativeScripts.makeScriptPubKey(keyHash2),
])
```

## Multi-Sig: M-of-N

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const keyHash1 = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
const keyHash2 = Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
const keyHash3 = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")

// 2-of-3 multi-sig
const twoOfThree = NativeScripts.makeScriptNOfK(2n, [
  NativeScripts.makeScriptPubKey(keyHash1),
  NativeScripts.makeScriptPubKey(keyHash2),
  NativeScripts.makeScriptPubKey(keyHash3),
])
```

## Time-Locked Vesting

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const beneficiary = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")

const vestingScript = NativeScripts.makeScriptAll([
  NativeScripts.makeScriptPubKey(beneficiary),
  NativeScripts.makeInvalidBefore(50000000n),
])
```

## Minting with Native Scripts

```typescript
import { Assets, NativeScripts, Bytes, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const myKeyHash = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")

const mintingPolicy = NativeScripts.makeScriptPubKey(myKeyHash)
const script = new NativeScripts.NativeScript({ script: mintingPolicy })

declare const policyId: string

let assets = Assets.fromLovelace(0n)
assets = Assets.addByHex(assets, policyId, "4d79546f6b656e", 1000n)

const tx = await client
  .newTx()
  .mintAssets({ assets })
  .attachScript({ script })
  .build()

const signed = await tx.sign()
await signed.submit()
```

## Utility Functions

```typescript
import { NativeScripts, Bytes } from "@evolution-sdk/evolution"

const keyHash1 = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
const keyHash2 = Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")

const script = NativeScripts.makeScriptAll([
  NativeScripts.makeScriptPubKey(keyHash1),
  NativeScripts.makeScriptPubKey(keyHash2),
  NativeScripts.makeInvalidBefore(100000n),
])

// Count minimum required signers
const count = NativeScripts.countRequiredSigners(script)

// Extract all key hashes from the script tree
const keyHashes = NativeScripts.extractKeyHashes(script)

// Serialize to CBOR
const cbor = NativeScripts.toCBORHex(
  new NativeScripts.NativeScript({ script })
)

// Convert to JSON
const json = NativeScripts.toJSON(script)
```

## Native Scripts vs Plutus Scripts

| | Native Scripts | Plutus Scripts |
| --- | --- | --- |
| **Complexity** | Simple conditions only | Arbitrary logic |
| **Execution cost** | None (free) | Memory + CPU units |
| **Collateral** | Not required | Required |
| **Transaction size** | Smaller | Larger (script included) |
| **Redeemer** | Not needed | Required |
| **Use cases** | Multi-sig, time-locks, simple minting | DeFi, auctions, complex validation |

## Next Steps

- [Minting Tokens](./minting.md) — Mint with Plutus minting policies
- [Locking to Script](./locking.md) — Lock funds with datums
- [Spending from Script](./spending.md) — Unlock with redeemers
- [Time / Slots](../time/slots.md) — Convert between Unix time and slots for time constraints
