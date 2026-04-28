---
title: Wallets
description: Wallet types for signing and key management
---

import DocCardList from '@theme/DocCardList';

# Wallets

Wallets manage private keys and prove ownership through cryptographic signatures. The Evolution SDK provides four wallet types, each designed for different security models and operational contexts.

<DocCardList />

## Overview

**What wallets do**: Sign transactions, derive addresses, prove ownership of funds through cryptographic operations.

**What wallets don't do**: Query blockchain, build transactions, or submit to network—those capabilities come from combining wallets with providers in [clients](../clients).

## Wallet Types

### Seed Phrase Wallet

Derives keys from 24-word mnemonic phrase using BIP39/BIP44 standards.

**Configuration**:
```typescript
{
  mnemonic: "fitness juice ankle...",
  accountIndex: 0
}
```

**Characteristics**:
- **Keys**: Derived from mnemonic + account index
- **Signing**: Local cryptographic operations
- **Best for**: Development, testing, multi-account setups
- **Security**: Low (keys in memory)

---

### Private Key Wallet

Uses direct extended private key material without mnemonic derivation.

**Configuration**:
```typescript
{
  paymentKey: "xprv..."
}
```

**Characteristics**:
- **Keys**: Direct extended private key
- **Signing**: Local cryptographic operations
- **Best for**: Backend automation, scripts, single-account operations
- **Security**: Medium (requires secure vault storage)

---

### API Wallet (CIP-30)

Delegates signing to external wallet applications via CIP-30 standard.

**Configuration**:
```typescript
{
  api: walletApi  // From window.cardano.{walletName}.enable()
}
```

**Characteristics**:
- **Keys**: External (user's device or hardware wallet)
- **Signing**: User approves each signature through wallet UI
- **Best for**: User-facing dApps, browser applications
- **Security**: High (user controls keys)

---

### Read-Only Wallet

Observes an address without any signing capability.

**Configuration**:
```typescript
{
  address: "addr1...",
  rewardAddress: "stake1..."  // Optional
}
```

**Characteristics**:
- **Keys**: None (address only)
- **Signing**: Not possible
- **Best for**: Monitoring, auditing, backend transaction building
- **Security**: Highest (no keys present)

## Comparison Matrix

| Type | Has Keys | Can Sign | Key Storage | Primary Use Case |
|------|----------|----------|-------------|------------------|
| **Seed Phrase** | Yes (local) | Yes | Memory/disk | Development, testing |
| **Private Key** | Yes (local) | Yes | Secure vault | Backend automation |
| **API Wallet** | No (external) | Via user | User's device | Frontend dApps |
| **Read-Only** | None | No | N/A | Observation, monitoring |

## Usage with Clients

Wallet configs are passed to capability methods like `.withSeed()`, `.withPrivateKey()`, `.withCip30()`, and `.withAddress()`. The details of wiring a provider and submitting transactions belong in the clients documentation.

In particular, `.withCip30()` gives you signing capability without provider-backed submission on its own. Frontend flows still rely on a provider-backed client or backend to broadcast the signed transaction.

Example wallet configuration objects:

```typescript
const seedWalletConfig = { mnemonic: "...", accountIndex: 0 };
const privateKeyWalletConfig = { paymentKey: "..." };
const apiWalletConfig = { api: walletApi };
const readOnlyWalletConfig = { address: "addr1..." };
```

See [Clients documentation](../clients) for concrete examples that combine a provider and a wallet to build a client capable of querying and submitting transactions.

## Security Considerations

Each wallet type has different security implications:

- **Seed Phrase**: Convenient but exposes mnemonic in code/memory
- **Private Key**: Better for automation, requires vault (AWS Secrets Manager, HashiCorp Vault)
- **API Wallet**: Highest security, user controls all signing approvals
- **Read-Only**: No security risk (no keys)

See [Security Best Practices](./security) for detailed guidance.

## Next Steps

Explore each wallet type in detail:

- **[Seed Phrase Wallets](./seed-phrase)** - Mnemonic-based signing
- **[Private Key Wallets](./private-key)** - Direct key usage
- **[API Wallets](./api-wallet)** - CIP-30 integration
- **[Security](./security)** - Best practices and checklists
- **[Clients](../clients)** - Using wallets with providers
