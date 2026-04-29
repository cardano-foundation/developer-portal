---
title: Client architecture & patterns
description: Frontend/backend architecture and client wiring
---

# Client architecture & patterns

Complete architecture patterns showing proper separation between frontend signing and backend transaction building. This page documents how to wire wallets and providers into clients for frontend and backend applications.

## Read-Only Wallets

Read-only wallets observe addresses and build transactions but cannot sign. They enable transaction construction on backends using the user's address without any signing capability.

**What they are:** Wallets configured with an address but no private keys—can build, cannot sign.

**When to use:** Backend transaction building in web applications. Server builds unsigned transactions for frontend to sign.

**Why they work:** Provides transaction builder with proper UTxO selection and fee calculation for a specific address, without security risk of keys on backend.

**How to secure:** Backend never sees keys. Frontend sends user address, backend builds transaction as that user, frontend signs with actual wallet.

### Configuration

```typescript
interface ReadOnlyWalletConfig {
  address: string // Cardano address to observe (required)
  rewardAddress?: string // Stake address for rewards (optional)
}
```

### Backend Transaction Building

```typescript title="server/build-tx.ts"
import { Address, Assets, Transaction, mainnet, Client } from "@evolution-sdk/evolution"

// Backend: Create provider client, then attach read-only wallet
const providerClient = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

// Attach user's address as read-only wallet (expects bech32 string)
const backendClient = providerClient
  .withAddress("addr1qz8eg0aknl96hd3v6x3qfmmz5zhtrq5hn8hmq0x4qd6m2qdppx88rnw3eumv9zv2ctjns05c8jhsqwg98qaxcz2qh45qhjv39c")

// Build unsigned transaction
const builder = backendClient.newTx()
builder.payToAddress({
  address: Address.fromBech32(
    "addr1qz8eg0aknl96hd3v6x3qfmmz5zhtrq5hn8hmq0x4qd6m2qdppx88rnw3eumv9zv2ctjns05c8jhsqwg98qaxcz2qh45qhjv39c"
  ),
  assets: Assets.fromLovelace(5_000_000n)
})

// Build returns result, get transaction and serialize
const result = await builder.build()
const unsignedTx = await result.toTransaction()
const txCbor = Transaction.toCBORHex(unsignedTx)

// Return to frontend for signing
// Frontend: wallet.signTx(txCbor) → backend.submitTx(signedTxCbor)
```

---

## Frontend: Signing Only

Frontend applications connect to user wallets through CIP-30 but never have provider access. They retrieve addresses, sign transactions built by backends, and hand the signed transaction back to a provider-backed service for submission.

**Architecture:** API wallet client (no provider) → can sign, cannot build.

**Workflow:**

1. User connects browser extension wallet
2. Frontend gets user's address
3. Send address to backend
4. Backend builds unsigned transaction
5. Frontend receives unsigned CBOR
6. Frontend requests signature from wallet
7. User approves in wallet interface
8. Frontend returns signed transaction for provider-backed submission

### Implementation

```typescript title="app/sign-tx.ts"
import { Address, Transaction, TransactionWitnessSet, mainnet, Client } from "@evolution-sdk/evolution"

// 1. Connect wallet
declare const cardano: any
const walletApi = await cardano.eternl.enable()

// 2. Create signing-only client
const client = Client.make(mainnet)
  .withCip30(walletApi)

// 3. Get user address for backend
const address = Address.toBech32(await client.address())

// 4. Send address to backend, receive unsigned tx CBOR
const unsignedTxCbor = await fetch("/api/build-tx", {
  method: "POST",
  body: JSON.stringify({ userAddress: address })
})
  .then((r) => r.json())
  .then((data) => data.txCbor)

// 5. Sign with user wallet
const witnessSet = await client.signTx(unsignedTxCbor)

// 6. Merge wallet witnesses into the unsigned transaction
const signedTxCbor = Transaction.addVKeyWitnessesHex(
  unsignedTxCbor,
  TransactionWitnessSet.toCBORHex(witnessSet)
)

// 7. Return signed transaction to backend for submission
const { txHash } = await fetch("/api/submit-tx", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ signedTxCbor })
}).then((r) => r.json()) as { txHash: string }

console.log("Transaction submitted:", txHash)
```

**Security:**
Provider API keys never exposed to frontend. User approves every signature. Keys stay on the user's device. Cannot build transactions without provider access.

---

## Backend: Building Only

Backend services use read-only wallets configured with user addresses to build unsigned transactions. They have provider access for blockchain queries but zero signing capability.

**Architecture:** Read-only wallet + provider → can build, cannot sign.

**Workflow:**

1. Receive user address from frontend
2. Create read-only wallet with that address
3. Build transaction with proper UTxO selection
4. Calculate fees, validate outputs
5. Return unsigned transaction CBOR
6. Frontend handles signing and submission

### Implementation

```typescript title="server/api/build-tx.ts"
import { Address, Assets, Transaction, mainnet, Client } from "@evolution-sdk/evolution"

// Backend endpoint
export async function buildTransaction(userAddress: string) {
  // Create read-only client with user's address
  const client = Client.make(mainnet)
  .withBlockfrost({
      baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
      projectId: process.env.BLOCKFROST_PROJECT_ID!
    })
  .withAddress(userAddress)

  // Build unsigned transaction
  const builder = client.newTx()
  builder.payToAddress({
    address: Address.fromBech32(
      "addr1qz8eg0aknl96hd3v6x3qfmmz5zhtrq5hn8hmq0x4qd6m2qdppx88rnw3eumv9zv2ctjns05c8jhsqwg98qaxcz2qh45qhjv39c"
    ),
    assets: Assets.fromLovelace(5_000_000n)
  })

  // Returns unsigned transaction
  const unsignedTx = await builder.build()
  const txCbor = unsignedTx.toCBOR()

  return { txCbor }
}
```

**Security:**
Backend never sees private keys. Cannot sign even if server is compromised. Provider keys protected on server. Cannot submit transactions without signing from frontend.

---

## Full Flow: Build → Sign → Submit

Complete architecture showing frontend/backend separation with proper security model.

The frontend owns address retrieval and witness creation. The provider-backed backend owns transaction construction and final submission.

**Components:**

- **Frontend**: API wallet (CIP-30) for address retrieval and signing
- **Backend**: Provider-backed client for building and submission
- **Security**: Keys stay on user device, provider keys stay on server

### Complete Example

```typescript
// shared.ts
export type BuildPaymentResponse = { txCbor: string }
export type SubmitTxResponse = { txHash: string }

// frontend.ts (Browser)
import { Address, Transaction, TransactionWitnessSet, mainnet, Client } from "@evolution-sdk/evolution"
import type { BuildPaymentResponse, SubmitTxResponse } from "./shared"

declare const cardano: any

async function sendPayment(recipientAddress: string, lovelace: bigint) {
  // 1. Connect user wallet
  const walletApi = await cardano.eternl.enable()
  const walletClient = Client.make(mainnet)
  .withCip30(walletApi)

  // 2. Get user address (returns Core Address, convert to bech32 for backend)
  const userAddress = Address.toBech32(await walletClient.address())

  // 3. Request backend to build transaction
  const response = await fetch("/api/build-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress,
      recipientAddress,
      lovelace: lovelace.toString()
    })
  })
  const { txCbor } = (await response.json()) as BuildPaymentResponse

  // 4. Sign with user wallet (prompts user approval)
  const witnessSet = await walletClient.signTx(txCbor)

  // 5. Merge wallet witnesses into the unsigned transaction
  const signedTxCbor = Transaction.addVKeyWitnessesHex(
    txCbor,
    TransactionWitnessSet.toCBORHex(witnessSet)
  )

  // 6. Send signed transaction back to backend for submission
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
import type { SubmitTxResponse } from "./shared"

const providerClient = Client.make(mainnet)
  .withBlockfrost({
    baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_PROJECT_ID!
  })

export async function buildPayment(userAddressBech32: string, recipientAddressBech32: string, lovelace: bigint) {
  // Convert bech32 addresses from frontend to Core Address
  const recipientAddress = Address.fromBech32(recipientAddressBech32)

  // Attach user's address as read-only wallet
  const client = providerClient
  .withAddress(userAddressBech32)

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

### Why This Works

User keys never leave their device. Provider API keys never exposed to frontend. Backend cannot sign transactions (compromised server results in no fund loss). Frontend cannot build transactions alone (no provider access). Both components required for complete transactions. Clean separation of concerns provides scalable architecture.

---

## Method Matrix

These rows reflect the assembled client shapes used on this page.

| Method            | Seed + Provider | Private Key + Provider | API Wallet | Read-Only + Provider |
| ----------------- | --------------- | ---------------------- | ---------- | -------------------- |
| `address()`       | Yes             | Yes                    | Yes        | Yes                  |
| `rewardAddress()` | Yes             | Yes                    | Yes        | Yes                  |
| `newTx()`         | Yes             | Yes                    | No         | Yes                  |
| `signMessage()`   | Yes             | Yes                    | Yes        | No                   |
| `signTx()`        | Yes             | Yes                    | Yes        | No                   |
| `submitTx()`      | Yes             | Yes                    | No         | Yes                  |

---

## Common Mistakes

**Error: Frontend trying to build:**

```typescript
// WRONG - Frontend has no provider
const client = Client.make(mainnet)
  .withCip30(walletApi)

const builder = client.newTx() // Error: Cannot build without provider
```

**Correct - Frontend signs only:**

```typescript
// CORRECT - Frontend signs, backend builds
const client = Client.make(mainnet)
  .withCip30(walletApi)

// Get tx from backend, then sign
const witnessSet = await client.signTx(txCborFromBackend)
```

**Error: Backend trying to sign:**

```typescript
// WRONG - Backend has no private keys
const client = Client.make(mainnet)
  .withBlockfrost({ ...providerConfig })
  .withAddress(userAddress)

await client.signTx(txCbor) // Error: Cannot sign with read-only wallet
```

**Correct - Backend builds only:**

```typescript
// CORRECT - Backend builds, frontend signs
const client = Client.make(mainnet)
  .withBlockfrost({ ...providerConfig })
  .withAddress(userAddress)

const builder = client.newTx()

const unsignedTx = await builder.build() // Returns unsigned transaction
```

---

## Next Steps

- **[Frontend/Backend Architecture](./architecture/frontend-backend.md)** - Deeper walkthrough of the split-client pattern
- **[API Wallets](../wallets/api-wallet.md)** - CIP-30 integration details
- **[Security](../wallets/security.md)** - Complete security guide
- **[Private Key](../wallets/private-key.md)** - Backend automation
