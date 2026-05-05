---
title: Frontend/Backend Architecture
description: Separating signing and building across client types
---

# Frontend/Backend Architecture

Complete architecture patterns showing proper separation between frontend signing and backend transaction building using different client types.

## Overview

Modern web applications require separation of concerns:

- **Frontend**: User wallets for signing (API wallet client)
- **Backend**: Transaction building with provider access (Read-only client)
- **Security**: Keys on user device, provider keys on server

This pattern uses two different **client types**:

1. **API Wallet Client** (frontend): API wallet only, no provider → can sign, cannot build
2. **Read-Only Client** (backend): Read-only wallet + provider → can build, cannot sign

---

## Architecture Pattern

### Frontend: API Wallet Client

Frontend applications use API wallet clients (CIP-30) for signing only. They have no provider access and cannot build transactions.

**Client Type**: API Wallet Client
**Components**: API wallet (no provider)
**Capabilities**: Address retrieval and transaction signing
**Cannot Do**: Build transactions, query blockchain, fee calculation, provider-backed submission

```typescript
import { Address, Transaction, TransactionWitnessSet, mainnet, Client } from "@evolution-sdk/evolution"

declare const cardano: any

// 1. Connect to user's browser wallet
const walletApi = await cardano.eternl.enable()

// 2. Create API wallet client (no provider)
const client = Client.make(mainnet)
  .withCip30(walletApi)

// 3. Get user address to send to backend
const address = Address.toBech32(await client.address())

// 4. Receive unsigned transaction from backend
const unsignedTxCbor = await fetch("/api/build-tx", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userAddress: address })
})
  .then((r) => r.json())
  .then((data) => data.txCbor)

// 5. Sign with user wallet (prompts approval)
const witnessSet = await client.signTx(unsignedTxCbor)

// 6. Merge witnesses into the unsigned transaction
const signedTxCbor = Transaction.addVKeyWitnessesHex(
  unsignedTxCbor,
  TransactionWitnessSet.toCBORHex(witnessSet)
)

// 7. Return signed transaction to backend for provider submission
const { txHash } = await fetch("/api/submit-tx", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ signedTxCbor })
}).then((r) => r.json()) as { txHash: string }

console.log("Transaction submitted:", txHash)
```

**Security:**

- Provider API keys never exposed to frontend
- User approves every signature in wallet interface
- Private keys stay on user's device
- Cannot build transactions without provider access

---

### Backend: Read-Only Client

Backend services use read-only clients configured with user addresses to build unsigned transactions. They have provider access but zero signing capability.

**Client Type**: Read-Only Client
**Components**: Read-only wallet + provider
**Capabilities**: Address observation, transaction building, UTxO selection, fee calculation
**Cannot Do**: Sign transactions, access private keys

```typescript
import { Address, Assets, Transaction, mainnet, Client } from "@evolution-sdk/evolution"

export async function buildTransaction(userAddressBech32: string) {
  // Create read-only client with user's address (bech32 string)
  const client = Client.make(mainnet)
  .withBlockfrost({
      baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
      projectId: process.env.BLOCKFROST_PROJECT_ID!
    })
  .withAddress(userAddressBech32)

  // Build unsigned transaction
  const builder = client.newTx()
  builder.payToAddress({
    address: Address.fromBech32(
      "addr1qz8eg0aknl96hd3v6x3qfmmz5zhtrq5hn8hmq0x4qd6m2qdppx88rnw3eumv9zv2ctjns05c8jhsqwg98qaxcz2qh45qhjv39c"
    ),
    assets: Assets.fromLovelace(5000000n)
  })

  // Build and return unsigned transaction
  const result = await builder.build()
  const unsignedTx = await result.toTransaction()
  const txCbor = Transaction.toCBORHex(unsignedTx)

  return { txCbor }
}
```

**Security:**

- Backend never sees or has access to private keys
- Cannot sign even if server is compromised
- Provider API keys protected on server side
- Cannot submit transactions without signatures from frontend

---

## Complete Flow: Build → Sign → Submit

Full architecture showing frontend/backend separation with proper security model.

The browser signs and produces witnesses. The backend, which has provider access, assembles the signed transaction for broadcast and submits it.

### End-to-End Example

```typescript
// shared.ts
export type BuildPaymentRequest = {
  userAddress: string
  recipientAddress: string
  lovelace: string
}

export type BuildPaymentResponse = {
  txCbor: string
}

export type SubmitTxResponse = {
  txHash: string
}

// frontend.ts (Browser)
import { Address, Transaction, TransactionWitnessSet, mainnet, Client } from "@evolution-sdk/evolution"
import type { BuildPaymentRequest, BuildPaymentResponse, SubmitTxResponse } from "./shared"

declare const cardano: any

async function sendPayment(recipientAddress: string, lovelace: bigint) {
  // 1. Connect user wallet (CIP-30)
  const walletApi = await cardano.eternl.enable()

  // 2. Create API wallet client (signing only)
  const walletClient = Client.make(mainnet)
  .withCip30(walletApi)

  // 3. Get user address (returns Core Address, convert to bech32 for backend)
  const userAddress = Address.toBech32(await walletClient.address())

  // 4. Request backend to build transaction
  const requestBody: BuildPaymentRequest = {
    userAddress,
    recipientAddress,
    lovelace: lovelace.toString()
  }

  const response = await fetch("/api/build-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  })

  const { txCbor } = (await response.json()) as BuildPaymentResponse

  // 5. Sign with user wallet (prompts user approval)
  const witnessSet = await walletClient.signTx(txCbor)

  // 6. Merge witnesses into the unsigned transaction
  const signedTxCbor = Transaction.addVKeyWitnessesHex(
    txCbor,
    TransactionWitnessSet.toCBORHex(witnessSet)
  )

  // 7. Return signed transaction to backend for submission
  const submitResponse = await fetch("/api/submit-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedTxCbor })
  })

  const { txHash } = (await submitResponse.json()) as SubmitTxResponse

  return txHash
}

// backend.ts (Server)
import { Address, Assets, Transaction, TransactionHash, mainnet, Client } from "@evolution-sdk/evolution"
import type { BuildPaymentResponse, SubmitTxResponse } from "./shared"

const providerClient = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

export async function buildPayment(
  userAddressBech32: string,
  recipientAddressBech32: string,
  lovelace: bigint
): Promise<BuildPaymentResponse> {
  // Convert recipient to Core Address for payToAddress
  const recipientAddress = Address.fromBech32(recipientAddressBech32)

  // Create read-only client with user's address (bech32 string)
  const client = providerClient.withAddress(userAddressBech32)

  // Build unsigned transaction
  const builder = client.newTx()
  builder.payToAddress({
    address: recipientAddress,
    assets: Assets.fromLovelace(lovelace)
  })

  // Return unsigned CBOR for frontend to sign
  const result = await builder.build()
  const unsignedTx = await result.toTransaction()
  const txCbor = Transaction.toCBORHex(unsignedTx)

  return { txCbor }
}

export async function submitSignedTx(signedTxCbor: string): Promise<SubmitTxResponse> {
  const signedTx = Transaction.fromCBORHex(signedTxCbor)
  const txHash = await providerClient.submitTx(signedTx)
  return { txHash: TransactionHash.toHex(txHash) }
}
```

---

## Why This Works

This architecture provides complete security through proper separation:

**User Security:**

- Private keys never leave user's device
- User approves every transaction in their wallet
- Frontend cannot build transactions alone
- Backend cannot sign transactions alone

**Application Security:**

- Provider API keys never exposed to frontend
- Compromised server results in no fund loss (no keys)
- Frontend cannot query blockchain without backend
- Both components required for complete transactions

**Scalability:**

- Clean separation of concerns
- Backend handles complex blockchain queries
- Frontend handles simple signing UX
- Easy to test and maintain independently

---

## Client Type Comparison

| Feature             | API Wallet Client (Frontend) | Read-Only Client (Backend)  |
| ------------------- | ---------------------------- | --------------------------- |
| **Components**      | API wallet only              | Read-only wallet + provider |
| **Can Sign**        | Yes                          | No                          |
| **Can Build**       | No                           | Yes                         |
| **Can Query**       | No                           | Yes                         |
| **Has Keys**        | Yes (on device)              | No                          |
| **Provider Access** | No                           | Yes                         |
| **Use Case**        | User signing                 | Transaction building        |

---

## Common Mistakes

### Frontend Trying to Build (wrong)

```typescript
// WRONG - API wallet client has no provider
const client = Client.make(mainnet)
  .withCip30(walletApi)

const builder = client.newTx() // Error: Cannot build without provider
```

**Fix**: Get unsigned transaction from backend instead.

### Correct Frontend Pattern

```typescript
// CORRECT - API wallet client signs only
const client = Client.make(mainnet)
  .withCip30(walletApi)

// Get transaction from backend
const { txCbor } = await fetch("/api/build-tx").then((r) => r.json())

// Sign with user approval
const witnessSet = await client.signTx(txCbor)
```

---

### Backend Trying to Sign (wrong)

```typescript
// WRONG - Read-only client has no private keys
const client = Client.make(mainnet)
  .withBlockfrost({ ...providerConfig })
  .withAddress(userAddress)

await client.signTx(txCbor) // Error: Cannot sign with read-only wallet
```

**Fix**: Return unsigned transaction to frontend for signing.

### Correct Backend Pattern

```typescript
// CORRECT - Read-only client builds only (needs provider + address)
const client = Client.make(mainnet)
  .withBlockfrost({ ...providerConfig })
  .withAddress(userAddress)

// Build unsigned transaction
const builder = client.newTx()
// ... configure transaction ...
const result = await builder.build()
const unsignedTx = await result.toTransaction()

// Return to frontend for signing
return { txCbor: Transaction.toCBORHex(unsignedTx) }
```

---

## Method Availability by Client Type

Understanding what each client type can do:

| Method            | Full Client | API Wallet Client | Read-Only Client | Provider-Only Client |
| ----------------- | ----------- | ----------------- | ---------------- | -------------------- |
| `address()`       | Yes         | Yes               | Yes              | No                   |
| `rewardAddress()` | Yes         | Yes               | Yes              | No                   |
| `newTx()`         | Yes         | No                | Yes              | Yes                  |
| `signMessage()`   | Yes         | Yes               | No               | No                   |
| `signTx()`        | Yes         | Yes               | No               | No                   |
| `submitTx()`      | Yes         | No                | Yes              | Yes                  |
| `getUtxos()`      | Yes         | No                | Yes              | Yes                  |
| `query*()`        | Yes         | No                | Yes              | Yes                  |

---

## Next Steps

- **[API Wallets](../../wallets/api-wallet.md)** - CIP-30 browser wallet integration for frontend signing
- **[Client Architecture](../architecture.md)** - Read-only wallets and backend transaction building
- **[Wallet Types](../../wallets/overview.md)** - Understand different wallet types used in clients
- **[Security Best Practices](../../wallets/security.md)** - Complete security guide for wallet integration
