---
title: Address Overview
description: Working with Cardano addresses in Evolution SDK
---

import DocCardList from '@theme/DocCardList';

# Address Overview

Cardano addresses identify where funds can be sent and who controls them. The Evolution SDK provides `Address` for working with payment credentials and optional staking credentials, handling the complexity of different address formats.

<DocCardList />

## The Core Address Model

Instead of dealing with multiple address types (BaseAddress, EnterpriseAddress, etc.), Evolution SDK uses a unified `Address` structure:

```typescript
Address = Payment Credential + Optional Staking Credential
```

This simple model covers the most common use cases:
- **With staking credential** → Functions like a Base Address (supports delegation)
- **Without staking credential** → Functions like an Enterprise Address (payment only)

## Getting Started

You can import address functionality in two ways:

### Option 1: From the Main Package (Recommended)

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution";

// Example: Create an address with both payment and stake credentials
const paymentCred = new KeyHash.KeyHash({ hash: new Uint8Array(28) });
const address = new Address.Address({
  networkId: 1,
  paymentCredential: paymentCred
});
```
**Note:** The double naming (e.g., `Address.Address`) is intentional - the first is the module namespace, the second is the class constructor.

### Option 2: Direct Module Imports

```typescript
import { Address } from "@evolution-sdk/evolution/Address";
import { KeyHash } from "@evolution-sdk/evolution/KeyHash";

// Same functionality, imported directly from modules
const paymentCred = new KeyHash({ hash: new Uint8Array(28) });
const address = new Address({
  networkId: 1,
  paymentCredential: paymentCred
});
```

## Quick Start

### Parse and Inspect Addresses

```typescript
import { Address } from "@evolution-sdk/evolution"

const bech32 = "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd"

// Parse from Bech32
const address = Address.fromBech32(bech32)

// Inspect properties
console.log("Network:", address.networkId === 1 ? "mainnet" : "testnet")
console.log("Payment credential:", address.paymentCredential)
console.log("Staking credential:", address.stakingCredential)

// Check if it has staking capability
const hasStaking = address.stakingCredential !== undefined
console.log("Supports staking:", hasStaking)
```

### Create New Addresses

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution"

const paymentCred = new KeyHash.KeyHash({
  hash: new Uint8Array(28) // Your payment key hash
})
const stakeCred = new KeyHash.KeyHash({
  hash: new Uint8Array(28) // Your stake key hash
})

// Address with staking (like Base Address)
const stakingAddress = new Address.Address({
  networkId: 1, // mainnet
  paymentCredential: paymentCred,
  stakingCredential: stakeCred
})

// Address without staking (like Enterprise Address)
const paymentOnlyAddress = new Address.Address({
  networkId: 1,
  paymentCredential: paymentCred
})

// Convert to Bech32 string
const bech32String = Address.toBech32(stakingAddress)
```

[Learn about the Address module →](./address)

## When to Use Each Pattern

### Address with Staking Credential

**Use when:**
- Building standard user wallets
- You want staking rewards
- General purpose applications
- Maximum feature compatibility

**Equivalent to:** Base Address in Cardano specification

### Address without Staking Credential

**Use when:**
- Running an exchange (custodial platform)
- Smart contract addresses
- Don't need staking capability
- Want simpler structure

**Equivalent to:** Enterprise Address in Cardano specification

## Address Anatomy

### With Staking (Standard Pattern)

```
┌─────────────────────────────────────────────────────┐
│            Address (with staking)                    │
├────────────────────────┬────────────────────────────┤
│  Payment Credential    │  Staking Credential        │
│  (28 bytes)            │  (28 bytes)                │
│  Controls spending     │  Controls delegation       │
└────────────────────────┴────────────────────────────┘
         ↓                         ↓
    Spend UTXOs            Delegate & earn rewards
```

### Without Staking (Basic Pattern)

```
┌──────────────────────────┐
│  Address (payment only)  │
├──────────────────────────┤
│  Payment Credential      │
│  (28 bytes)              │
│  Controls spending       │
└──────────────────────────┘
         ↓
    Spend UTXOs
    (no staking)
```

## Network Prefixes

Addresses use different Bech32 prefixes based on network:

| Network | Payment Address | Reward Address |
|---------|----------------|----------------|
| Mainnet | `addr1...` | `stake1...` |
| Testnet (Preprod/Preview) | `addr_test1...` | `stake_test1...` |

The Evolution SDK automatically handles the correct prefix based on the `networkId` you provide (1 = mainnet, 0 = testnet).

## Understanding Address Eras

While `Address` covers most use cases, Cardano's ledger specification defines several specific address types. These are called **Address Eras**:

| Era Type | Address Equivalent | When to Learn More |
|----------|----------------------|-------------------|
| **Base** | Address with staking credential | Standard addresses |
| **Enterprise** | Address without staking credential | Exchange/contract addresses |
| **Reward** | Special stake-only address | Auto-generated for rewards |
| **Pointer** | Legacy reference pattern | Rarely used |

**For most applications**, you don't need to think about these era-specific types. The `Address` class handles them automatically.

**For advanced use cases** requiring era-specific features, see the [Address Types guide →](./address-types)

"Franken addresses" are not a separate era - they're just Base addresses constructed with independent payment and stake credentials. See [Franken Addresses](./franken) for this advanced pattern.

## Key Concepts

### Payment Credential

Controls **spending** of funds:
- Required to sign spending transactions
- Can be key hash (28 bytes) or script hash (28 bytes)
- Loss of payment key = loss of funds

### Staking Credential

Controls **delegation** and rewards:
- Required to delegate stake
- Required to withdraw rewards
- Can be key hash (28 bytes) or script hash (28 bytes)
- Independent from payment credential

### Credential Types

Both payment and staking credentials can be:

**Key Hash**: Derived from a cryptographic key (user-controlled)
**Script Hash**: Derived from a Plutus script (smart contract-controlled)

## Common Operations

### Conversion

Convert between formats (Bech32, hex, bytes): see [Address Conversion](./conversion).

### Validation

Verify address format and network: see [Address Validation](./validation).

## Next Steps

**Core Concepts:**
- [Address](./address) - How to parse, validate, and convert addresses
- [Address Types](./address-types) - Comprehensive coverage of all address types

**Advanced Patterns:**
- [Franken Addresses](./franken) - Constructing addresses with split credential ownership

**Practical Guides:**
- [Conversion](./conversion) - Transform between Bech32, hex, and bytes
- [Validation](./validation) - Verify addresses before use

**Related Topics:**
- [Transactions](../transactions) - Sending funds to addresses
- [Staking](../staking) - Delegation and rewards
- [Wallets](../wallets) - Key management and address derivation
