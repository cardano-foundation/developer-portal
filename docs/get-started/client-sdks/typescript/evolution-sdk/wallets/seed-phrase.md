---
title: Seed Phrase Wallets
description: Mnemonic-based wallets for development and testing
---

# Seed Phrase Wallets

Seed phrase wallets derive cryptographic keys from 24-word BIP-39 mnemonics through hierarchical deterministic (HD) derivation. The same mnemonic always generates the same addresses and keys, following BIP-32/BIP-44 standards.

## What They Are

Memorable word sequences that serve as master seeds for all cryptographic material. The SDK handles BIP-32/BIP-44 derivation internally—provide the mnemonic and account index, and it generates payment keys, staking keys, and addresses following Cardano's standard derivation paths.

## When to Use

- **Development**: Rapid prototyping with reproducible test addresses
- **Testing**: Automated tests with known, predictable wallets
- **Demonstrations**: Educational examples and tutorials
- **Team onboarding**: Shared test credentials across developers

## Why They Work

Mnemonics provide human-friendly backup and recovery. The same 24 words reconstruct all keys across any compliant wallet. Reproducibility simplifies test automation—the same mnemonic always generates the same addresses.

## How to Secure

:::warning
**Never use seed phrase wallets in production with real funds.** Anyone with the mnemonic controls all derived keys and funds. Use [Private Key Wallets](./private-key) with a vault or [API Wallets](./api-wallet) for production.
:::

- Store in environment variables
- Use distinct mnemonics per environment (dev/staging/prod)
- Never commit to version control
- Keep testnet and mainnet mnemonics completely separate

## Generate Mnemonic

Use the SDK to generate a cryptographically secure 24-word mnemonic:

```typescript
import { PrivateKey } from "@evolution-sdk/evolution"

// Generate 24-word mnemonic (256-bit entropy)
const mnemonic = PrivateKey.generateMnemonic()
console.log(mnemonic)
// Example output: "abandon abandon abandon ... art art art"
```

## Basic Setup

```typescript
import { PrivateKey, preprod, Client } from "@evolution-sdk/evolution"

// Create a signing-only client with seed wallet (no provider)
// Can sign transactions but cannot query blockchain or submit
const client = Client.make(preprod)
  .withSeed({
    mnemonic:
      "fitness juice ankle box prepare gallery purse narrow miracle next soccer category analyst wait verb patch kit era hen clerk write skin trumpet attract",
    accountIndex: 0 // First account (increment for more accounts)
  })

// Get address (wallet operations work without provider)
const address = await client.address()
console.log("Derived address:", address)

// To query blockchain or submit, add a provider:
// const fullClient = client.withBlockfrost({ ... });
```

## Configuration Options

```typescript
interface SeedWalletConfig {
  mnemonic: string // 24-word BIP-39 phrase (required)
  accountIndex?: number // Account derivation index (default: 0)
}
```

## Network Switching

Different networks use the same wallet configuration—just change the network parameter:

```typescript
import { PrivateKey, preprod, mainnet, Client } from "@evolution-sdk/evolution"

// Testnet client
const testClient = Client.make(preprod)
  .withSeed({
    mnemonic:
      "fitness juice ankle box prepare gallery purse narrow miracle next soccer category analyst wait verb patch kit era hen clerk write skin trumpet attract",
    accountIndex: 0
  })

// Mainnet client (use DIFFERENT mnemonic in production!)
const mainClient = Client.make(mainnet)
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!, // Different mnemonic!
    accountIndex: 0
  })
```

## Environment Variables

```bash
# .env.local (NEVER commit this file)
WALLET_MNEMONIC="fitness juice ankle box prepare gallery purse narrow miracle next soccer category analyst wait verb patch kit era hen clerk write skin trumpet attract"
BLOCKFROST_PROJECT_ID="preprodYourProjectIdHere"
```

```typescript
import { PrivateKey, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!, // From environment
    accountIndex: 0
  })
```

## Multiple Accounts

Generate independent wallets from the same mnemonic using different `accountIndex` values:

```typescript
import { PrivateKey, preprod, Client } from "@evolution-sdk/evolution"

// Account 0 (default)
const account0 = Client.make(preprod)
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 0
  })

// Account 1 (different addresses, same mnemonic)
const account1 = Client.make(preprod)
  .withSeed({
    mnemonic: process.env.WALLET_MNEMONIC!,
    accountIndex: 1
  })

const addr0 = await account0.address()
const addr1 = await account1.address()
console.log("Different addresses:", addr0 !== addr1) // true
```

## Common Patterns

### Development Testing

```typescript
import { PrivateKey, preprod, Client } from "@evolution-sdk/evolution"

declare function describe(name: string, fn: () => void): void
declare function beforeEach(fn: () => void): void
declare function it(name: string, fn: () => void | Promise<void>): void
declare const expect: any
declare const process: { env: { TEST_WALLET_MNEMONIC?: string } }

describe("Payment tests", () => {
  let client: any

  beforeEach(() => {
    client = Client.make(preprod)
      .withSeed({
        mnemonic: process.env.TEST_WALLET_MNEMONIC!,
        accountIndex: 0
      })
  })

  it("should sign transaction", async () => {
    // Wallet client can sign but needs provider to build/submit
    // For full flow, add a provider: client.withBlockfrost(...)
    const address = await client.address()
    expect(address).toBeDefined()
  })
})
```

## Security Reminders

Never commit mnemonics to Git. Never reuse testnet mnemonics on mainnet. Never use seed phrases in production with real funds. Never share production mnemonics.

Always use environment variables. Always keep separate mnemonics per environment. Always test on preprod or preview networks first before moving to mainnet.

## Next Steps

- **[Private Key Wallets](./private-key)** - Production automation
- **[API Wallets](./api-wallet)** - User-facing applications
- **[Security](./security)** - Complete security guide
