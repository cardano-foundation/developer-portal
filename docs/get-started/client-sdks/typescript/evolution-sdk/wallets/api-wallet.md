---
title: API Wallets
description: Browser extensions and hardware wallets via CIP-30
---

# API Wallets

API wallets connect to external signing devices through the CIP-30 standard. Keys never leave the user's device—your application only requests signatures, which the wallet prompts the user to approve.

## What They Are

Interfaces to browser extensions (Eternl, Lace, Flint) and hardware wallets (Ledger, Trezor) following the CIP-30 standard. Your application receives a wallet API object and uses it to request operations.

## When to Use

- **dApps**: Decentralized applications where users control funds
- **NFT marketplaces**: User-to-user transactions
- **DeFi interfaces**: Swaps, staking, lending protocols
- **Any end-user application**: Where users maintain custody

## Why They Work

User custody model—keys stay on user's device or hardware wallet. Your application proposes operations, user approves through their trusted wallet interface. No key management burden on your application.

## How to Secure

Never request or store user keys. Frontend signs only and should not include provider configuration. Backend builds transactions using read-only wallets with the user's address. This separation of concerns provides security by design. Never try to access wallet internals. Never cache signatures.

## Supported Wallets

- **Eternl** - Popular browser extension
- **Lace** - Light wallet by IOG
- **Flint** - Feature-rich extension
- **Typhon** - Advanced features
- **Hardware wallets** - Ledger, Trezor (through extensions)

## Frontend Pattern (Signing Only)

Frontend creates API wallet client without provider. It can sign transactions and prepare signed CBOR for backend submission, but it cannot build transactions or submit through the client without a provider.

The raw CIP-30 wallet API can submit transactions, but Evolution keeps submission on provider-backed clients so wallet-only assembly stays strictly signing-focused.

```typescript
import { Transaction, TransactionWitnessSet, mainnet, Client } from "@evolution-sdk/evolution"

declare const cardano: any // window.cardano

async function signAndSubmit() {
  // 1. User connects browser extension (CIP-30)
  const walletApi = await cardano.eternl.enable()

  // 2. Create API wallet client (signing only)
  const client = Client.make(mainnet)
  .withCip30(walletApi)

  // 3. Get user address
  const userAddress = await client.address()
  console.log("User address:", userAddress)

  // 4. Request backend to build transaction (backend has provider + read-only wallet)
  const unsignedTxCbor = "84a400..." // From backend

  // 5. Sign with user's wallet (prompts user approval)
  const witnessSet = await client.signTx(unsignedTxCbor)

  // 6. Merge witnesses into the unsigned transaction
  const signedTxCbor = Transaction.addVKeyWitnessesHex(
    unsignedTxCbor,
    TransactionWitnessSet.toCBORHex(witnessSet)
  )

  // 7. Hand signed transaction back to backend for provider submission
  const { txHash } = await fetch("/api/submit-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedTxCbor })
  }).then((r) => r.json()) as { txHash: string }

  console.log("Transaction submitted:", txHash)
}
```

## Configuration Options

```typescript
interface WalletApi {
  // CIP-30 wallet API interface
  getNetworkId(): Promise<number>
  getUtxos(): Promise<string[] | undefined>
  // ... other CIP-30 methods
}

interface ApiWalletConfig {
  api: WalletApi // CIP-30 wallet API object (required)
}
```

## Complete dApp Example

```typescript
import { Address, Transaction, TransactionWitnessSet, mainnet, Client } from "@evolution-sdk/evolution"

declare const cardano: any

async function connectAndPay() {
  // Detect available wallets (CIP-30 extensions)
  const availableWallets = Object.keys(cardano).filter((key) => cardano[key]?.enable)
  console.log("Available wallets:", availableWallets)

  // User selects wallet
  const walletName = "eternl" // or "lace", "flint", etc.

  // Request connection (CIP-30)
  const walletApi = await cardano[walletName].enable()

  // Create API wallet client
  const client = Client.make(mainnet)
  .withCip30(walletApi)

  // Get user address
  const address = Address.toBech32(await client.address())

  // Send address to backend for transaction building
  const response = await fetch("/api/build-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress: address,
      recipientAddress: "addr1...",
      lovelace: "5000000"
    })
  })

  const { txCbor } = await response.json()

  // Sign with user wallet (prompts user for approval)
  const witnessSet = await client.signTx(txCbor)

  // Merge witnesses into the unsigned transaction
  const signedTxCbor = Transaction.addVKeyWitnessesHex(
    txCbor,
    TransactionWitnessSet.toCBORHex(witnessSet)
  )

  // Submit through provider-backed backend
  const { txHash } = await fetch("/api/submit-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedTxCbor })
  }).then((r) => r.json()) as { txHash: string }

  console.log("Payment sent:", txHash)
}
```

## Hardware Wallet Support

Hardware wallets work through browser extensions. The extension communicates with the hardware device.

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

declare const cardano: any

async function useHardwareWallet() {
  // User connects Ledger/Trezor through browser extension
  const walletApi = await cardano.eternl.enable() // Extension handles hardware

  // Create API wallet client (same as software wallets)
  const client = Client.make(mainnet)
  .withCip30(walletApi)

  // Extension will prompt hardware wallet for signatures
  const txCbor = "84a400..." // Transaction CBOR from backend
  const witnessSet = await client.signTx(txCbor)
}
```

## Derivation Paths

Hardware wallets and extensions follow Cardano's BIP-32 derivation paths:

| Path                   | Account | Address   | Use Case                     |
| ---------------------- | ------- | --------- | ---------------------------- |
| `m/1852'/1815'/0'/0/0` | 0       | 0         | Standard first address       |
| `m/1852'/1815'/0'/0/1` | 0       | 1         | Second address, same account |
| `m/1852'/1815'/1'/0/0` | 1       | 0         | Second account first address |
| `m/1852'/1815'/0'/2/0` | 0       | 0 (stake) | Staking key derivation       |

**Path breakdown:**

- `1852'`: Purpose (Cardano)
- `1815'`: Coin type (ADA)
- `0'`: Account index
- `0`: Change chain (0=external, 1=internal, 2=staking)
- `0`: Address index

## Error Handling

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

declare const cardano: any

async function connectWallet(walletName: string) {
  try {
    // Check if wallet exists
    if (!cardano[walletName]) {
      throw new Error(`${walletName} not installed`)
    }

    // Request connection using CIP-30
    const walletApi = await cardano[walletName].enable()

    // Create API wallet client
    const client = Client.make(mainnet)
  .withCip30(walletApi)

    return client
  } catch (error: any) {
    if (error.code === 2) {
      console.error("User rejected connection")
    } else if (error.code === 3) {
      console.error("Account not found")
    } else {
      console.error("Connection failed:", error)
    }
    throw error
  }
}
```

## Best Practices

Always show wallet selection UI so users can choose their preferred wallet. Handle user rejection gracefully without breaking your application flow. Display transaction details before requesting signature to maintain transparency. Show loading states during signing operations. Provide clear success and error feedback to keep users informed. Cache wallet choice in localStorage to improve user experience. Allow wallet disconnection so users can switch wallets or disconnect. Never auto-connect without explicit user action. Never hide transaction details from users. Never batch operations without explicit user consent for each action.

## Next Steps

- **[Client patterns](../clients/architecture)** - Frontend/backend architecture and client patterns
- **[Security](./security)** - Complete security guide
- **[Seed Phrase](./seed-phrase)** - Development wallets
