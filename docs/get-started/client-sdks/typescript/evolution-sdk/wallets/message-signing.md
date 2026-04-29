---
title: Message Signing
description: Sign and verify messages using CIP-30 COSE signatures
---

# Message Signing

Evolution SDK implements the CIP-30 message signing standard using COSE (CBOR Object Signing and Encryption). This allows wallets to sign arbitrary data and prove ownership of an address without submitting a transaction.

Common use cases:
- **Authentication** — Prove you control an address (login with wallet)
- **Data attestation** — Sign off-chain data with your key
- **Message verification** — Verify a signature came from a specific address

## Sign a Message

Use `COSE.SignData.signData` to sign arbitrary data with a private key:

```typescript
import { COSE, PrivateKey, Address } from "@evolution-sdk/evolution"

declare const privateKey: PrivateKey.PrivateKey
declare const myAddress: Address.Address

// Create a payload from text
const payload = COSE.Utils.fromText("Hello, I'm signing this message!")

// Sign with your private key
const signedMessage = COSE.SignData.signData(
  Address.toHex(myAddress),  // Address as hex
  payload,                    // Payload bytes
  privateKey                  // Your private key
)

// signedMessage contains:
// - signature: Uint8Array (CBOR-encoded COSE_Sign1)
// - key: Uint8Array (CBOR-encoded COSE_Key with public key)
```

## Verify a Signature

Use `COSE.SignData.verifyData` to verify a signed message:

```typescript
import { COSE, Address, KeyHash } from "@evolution-sdk/evolution"

declare const myAddress: Address.Address
declare const signerKeyHash: KeyHash.KeyHash
declare const signedMessage: COSE.SignData.SignedMessage

// The original payload that was signed
const payload = COSE.Utils.fromText("Hello, I'm signing this message!")

// Verify the signature
const isValid = COSE.SignData.verifyData(
  Address.toHex(myAddress),       // Expected signer address
  KeyHash.toHex(signerKeyHash),   // Expected signer key hash
  payload,                         // Original payload
  signedMessage                    // The signed message to verify
)

if (isValid) {
  console.log("Signature is valid!")
}
```

Verification checks:
1. Payload matches the signed data
2. Address in the signature matches the expected address
3. Algorithm is EdDSA
4. Public key hash matches the expected key hash
5. Ed25519 signature is cryptographically valid

## Payload Utilities

The `COSE.Utils` module provides helpers for creating payloads:

```typescript
import { COSE } from "@evolution-sdk/evolution"

// From text string
const textPayload = COSE.Utils.fromText("Sign this message")

// Back to text
const text = COSE.Utils.toText(textPayload)

// From hex string
const hexPayload = COSE.Utils.fromHex("deadbeef")

// Back to hex
const hex = COSE.Utils.toHex(hexPayload)
```

## Low-Level COSE API

For advanced use cases, you can work with COSE structures directly.

### COSE_Sign1

The single-signer signature structure:

```typescript
import { COSE } from "@evolution-sdk/evolution"

// Decode a COSE_Sign1 from CBOR bytes
declare const cborBytes: Uint8Array
const coseSign1 = COSE.Sign1.coseSign1FromCBORBytes(cborBytes)

// Access fields
const payload = coseSign1.payload    // Signed payload
const signature = coseSign1.signature // Ed25519 signature
const headers = coseSign1.headers    // Protected + unprotected headers

// Encode back to CBOR
const encoded = COSE.Sign1.coseSign1ToCBORBytes(coseSign1)
```

### COSE_Key

Represents a public key in COSE format:

```typescript
import { COSE, PrivateKey, VKey } from "@evolution-sdk/evolution"
import { Schema } from "effect"

declare const privateKey: PrivateKey.PrivateKey

// Build a COSE_Key from a private key
const vkey = VKey.fromPrivateKey(privateKey)
const ed25519Key = new COSE.Key.EdDSA25519Key(
  { privateKey: undefined, publicKey: vkey },
  { disableValidation: true }
)
const coseKey = ed25519Key.build()

// Encode to CBOR
const keyBytes = Schema.encodeSync(COSE.Key.COSEKeyFromCBORBytes())(coseKey)
```

### Headers

COSE headers carry metadata about the signature:

```typescript
import { COSE } from "@evolution-sdk/evolution"

// Create headers
const protectedHeaders = COSE.Header.headerMapNew()
  .setAlgorithmId(COSE.Label.AlgorithmId.EdDSA)

const unprotectedHeaders = COSE.Header.headerMapNew()

const headers = COSE.Header.headersNew(protectedHeaders, unprotectedHeaders)
```

## How It Works

The CIP-30 signing process follows this flow:

1. **Protected headers** are created with the algorithm (EdDSA) and signer's address
2. **Unprotected headers** mark the payload as not pre-hashed
3. A **COSE_Sign1 builder** creates the `Sig_structure1` (the data to be signed)
4. The private key signs the `Sig_structure1` with Ed25519
5. The result is CBOR-encoded as a `COSE_Sign1` + `COSE_Key` pair

This matches the `api.signData()` specification from CIP-30, making it compatible with all CIP-30 compliant wallets.

## Next Steps

- [Wallets](./overview.md) — Wallet types and setup
- [Private Key](./private-key.md) — Working with private keys
- [API Wallet](./api-wallet.md) — CIP-30 browser wallet integration
