---
title: Plutus Types
description: Pre-built type-safe schemas for common Cardano data structures
---

# Plutus Types

Pre-built, battle-tested schemas for core Cardano data structures: credentials, addresses, values, output references, and CIP-68 metadata.

These types are exported from `@evolution-sdk/evolution/plutus` and match the on-chain Plutus specification exactly—use them to eliminate encoding errors and ensure validator compatibility.

## Available Types

| Type | Use Case | Import |
|------|----------|--------|
| **Credential** | Reference wallets or scripts | `import { Credential } from "@evolution-sdk/evolution/plutus"` |
| **Address** | Payment destinations with optional staking | `import { Address } from "@evolution-sdk/evolution/plutus"` |
| **Value** | ADA and native token quantities | `import { Value } from "@evolution-sdk/evolution/plutus"` |
| **OutputReference** | Identify specific UTxOs | `import { OutputReference } from "@evolution-sdk/evolution/plutus"` |
| **CIP68Metadata** | NFT/FT metadata following CIP-68 | `import { CIP68Metadata } from "@evolution-sdk/evolution/plutus"` |

## Quick Start

```typescript
import { Credential } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

const cred: Credential.Credential = {
  VerificationKey: {
    hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
  }
}

const cbor = Credential.CredentialCodec.toCBORHex(cred)
```

## Working with Codecs

> **Note**: Credential exports `CredentialCodec` (along with related codecs like `PaymentCredentialCodec`), while other types export just `Codec`. All provide the same encoding/decoding methods.

**When building transactions**: Use `toCBORBytes()` for binary data
**When storing/transmitting**: Use `toCBORHex()` for hex strings
**When debugging**: Use `toData()` to inspect PlutusData structure
**When decoding**: Use `fromCBORHex()` or `fromCBORBytes()` with matching format

```typescript
import { Address } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

const address: Address.Address = {
  payment_credential: {
    VerificationKey: {
      hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
    }
  },
  stake_credential: undefined
}

const cborHex = Address.Codec.toCBORHex(address)
const cborBytes = Address.Codec.toCBORBytes(address)
const decoded = Address.Codec.fromCBORHex(cborHex)
const data = Address.Codec.toData(address)
```

## Credential

```typescript
import { Credential } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

const walletCred: Credential.Credential = {
  VerificationKey: {
    hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
  }
}

const scriptCred: Credential.Credential = {
  Script: {
    hash: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
  }
}
```

## Address

```typescript
import { Address } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

// Base address (with staking)
const baseAddress: Address.Address = {
  payment_credential: {
    VerificationKey: {
      hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
    }
  },
  stake_credential: {
    Inline: {
      credential: {
        VerificationKey: {
          hash: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
        }
      }
    }
  }
}
```

### Address Variants

```typescript
import { Address } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

// Enterprise address (no staking)
const enterpriseAddress: Address.Address = {
  payment_credential: {
    Script: {
      hash: Bytes.fromHex("123456789abc123456789abc123456789abc123456789abc12345678")
    }
  },
  stake_credential: undefined
}

// Pointer address
const pointerAddress: Address.Address = {
  payment_credential: {
    VerificationKey: {
      hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
    }
  },
  stake_credential: {
    Pointer: {
      slot_number: 12345678n,
      transaction_index: 2n,
      certificate_index: 0n
    }
  }
}
```

## Value

```typescript
import { Value } from "@evolution-sdk/evolution/plutus"
import { Bytes, Text } from "@evolution-sdk/evolution"

// ADA only
const adaOnly: Value.Value = new Map([
  [new Uint8Array(), new Map([
    [new Uint8Array(), 5000000n]
  ])]
])

// Multi-asset value (ADA + tokens)
const policyId = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")

const multiAsset: Value.Value = new Map([
  [new Uint8Array(), new Map([
    [new Uint8Array(), 2000000n]
  ])],
  [policyId, new Map([
    [Text.toBytes("MyToken"), 100n],
    [Text.toBytes("MyNFT"), 1n]
  ])]
])
```

## OutputReference

```typescript
import { OutputReference } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

const utxoRef: OutputReference.OutputReference = {
  transaction_id: Bytes.fromHex(
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  ),
  output_index: 0n
}
```

## CIP68Metadata

### CIP-68 Token Labels

| Label | Type | Description |
|-------|------|-------------|
| **100** | Reference NFT | Immutable metadata, always 1 quantity |
| **222** | User NFT | Mutable metadata, user-held token |
| **333** | Reference FT | Fungible token metadata |
| **444** | Reference RFT | Rich fungible token (advanced features) |

```typescript
import { CIP68Metadata } from "@evolution-sdk/evolution/plutus"
import { Data, Text } from "@evolution-sdk/evolution"

const nftMetadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("SpaceAce #4242")],
  [Text.toBytes("image"), Text.toBytes("ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")],
  [Text.toBytes("rarity"), Text.toBytes("legendary")],
  [Text.toBytes("attributes"), Data.map([
    [Text.toBytes("class"), Text.toBytes("explorer")],
    [Text.toBytes("power"), 9000n]
  ])]
])

const datum: CIP68Metadata.CIP68Datum = {
  metadata: nftMetadata,
  version: 1n,
  extra: []
}

const ftMetadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("MyToken")],
  [Text.toBytes("ticker"), Text.toBytes("MTK")],
  [Text.toBytes("decimals"), 6n],
  [Text.toBytes("url"), Text.toBytes("https://mytoken.io")]
])

const ftDatum: CIP68Metadata.CIP68Datum = {
  metadata: ftMetadata,
  version: 1n,
  extra: [
    Data.map([[Text.toBytes("mutable"), 1n]])
  ]
}
```

## Real-World Examples

### Escrow Script Datum

```typescript
import { Address, Value, OutputReference } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

interface EscrowDatum {
  beneficiary: Address.Address
  deadline: bigint
  locked_value: Value.Value
  original_utxo: OutputReference.OutputReference
}

const escrowDatum: EscrowDatum = {
  beneficiary: {
    payment_credential: {
      VerificationKey: {
        hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
      }
    },
    stake_credential: undefined
  },
  deadline: 1735689600000n,
  locked_value: new Map([
    [new Uint8Array(), new Map([[new Uint8Array(), 10000000n]])]
  ]),
  original_utxo: {
    transaction_id: Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"),
    output_index: 2n
  }
}
```

### Multi-Sig Validator Redeemer

```typescript
import { Credential } from "@evolution-sdk/evolution/plutus"
import { Bytes } from "@evolution-sdk/evolution"

interface MultiSigRedeemer {
  required_signers: Credential.Credential[]
  threshold: bigint
}

const redeemer: MultiSigRedeemer = {
  required_signers: [
    {
      VerificationKey: {
        hash: Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
      }
    },
    {
      VerificationKey: {
        hash: Bytes.fromHex("def456abc123def456abc123def456abc123def456abc123def456ab")
      }
    },
    {
      VerificationKey: {
        hash: Bytes.fromHex("123456789abc123456789abc123456789abc123456789abc12345678")
      }
    }
  ],
  threshold: 2n
}
```

### NFT Minting with CIP-68

```typescript
import { CIP68Metadata, Value } from "@evolution-sdk/evolution/plutus"
import { Bytes, Data, Text } from "@evolution-sdk/evolution"

const metadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("CryptoKitty #42")],
  [Text.toBytes("image"), Text.toBytes("ipfs://Qm...")],
  [Text.toBytes("dna"), Text.toBytes("0xabc123...")],
  [Text.toBytes("traits"), Data.map([
    [Text.toBytes("fur"), Text.toBytes("tabby")],
    [Text.toBytes("eyes"), Text.toBytes("blue")]
  ])]
])

const referenceDatum: CIP68Metadata.CIP68Datum = {
  metadata,
  version: 1n,
  extra: []
}

const policyId = Bytes.fromHex("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8")
const assetName = Text.toBytes("CryptoKitty42")

const referenceLabel = new Uint8Array([0x00, 0x0f, 0x42, 0x00])
const userLabel = new Uint8Array([0x00, 0x0f, 0x42, 0x02])

const mintValue: Value.Value = new Map([
  [policyId, new Map([
    [new Uint8Array([...referenceLabel, ...assetName]), 1n],
    [new Uint8Array([...userLabel, ...assetName]), 1n]
  ])]
])
```

## Best Practices

**Use as building blocks**: Import and compose these types—don't recreate Credential or Address types yourself. They match Plutus exactly.

**Match validator types**: Your smart contract must expect these exact structures. Field names and order matter for CBOR encoding.

**Test with real data**: Verify encoding/decoding with actual blockchain data to catch edge cases before deployment.

**Leverage type safety**: Let TypeScript catch errors at compile time. If it type-checks with these types, CBOR encoding will be correct.

## Next Steps

- [TSchema](./tschema) — Build custom type-safe schemas for your own data structures
- [PlutusData](./data) — Understand the five primitive PlutusData types
- [Smart Contracts](../smart-contracts) — Use these types with Plutus validators
- [Transactions](../transactions) — Build transactions with addresses, values, and references
