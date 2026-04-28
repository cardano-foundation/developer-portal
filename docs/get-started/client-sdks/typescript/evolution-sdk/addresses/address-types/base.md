---
title: Base Addresses
description: Standard Cardano addresses with payment and staking credentials
---

# Base Addresses

Base addresses contain both a payment credential and a staking credential. This is the standard address format on Cardano.

## Structure

```
Base Address = Payment Credential + Staking Credential
```

**Payment Credential**: Controls who can spend UTXOs at this address
**Staking Credential**: Controls delegation and receives staking rewards

Both credentials are typically derived from the same wallet, but can come from different sources (see [Franken Addresses](../franken)).

## Construction

Create base addresses by instantiating the `BaseAddress` class:

```typescript
import { AddressEras, BaseAddress, KeyHash, ScriptHash } from "@evolution-sdk/evolution";

const address = new BaseAddress.BaseAddress({
  networkId: 1, // mainnet
  paymentCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28)
  }),
  stakeCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28)
  })
});

const bech32 = AddressEras.toBech32(address);
console.log(bech32); // "addr1..."
```

## Parsing Addresses

Parse a Bech32 address string into a `BaseAddress` instance:

```typescript
import { AddressEras, BaseAddress } from "@evolution-sdk/evolution";

const bech32 = "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd";

const address = AddressEras.fromBech32(bech32) as BaseAddress.BaseAddress;

console.log("Network ID:", address.networkId);
console.log("Payment:", address.paymentCredential);
console.log("Stake:", address.stakeCredential);
```

## Script-Based Addresses

Base addresses can use script hashes for payment and/or staking credentials:

```typescript
import { AddressEras, BaseAddress, ScriptHash } from "@evolution-sdk/evolution";

const scriptAddress = new BaseAddress.BaseAddress({
  networkId: 1,
  paymentCredential: new ScriptHash.ScriptHash({
    hash: new Uint8Array(28)
  }),
  stakeCredential: new ScriptHash.ScriptHash({
    hash: new Uint8Array(28)
  })
});

const bech32 = AddressEras.toBech32(scriptAddress);
console.log("Script-based address:", bech32);
```

## Address Components

### Payment Credential
- **Purpose**: Spending authorization
- **Type**: Key hash (28 bytes) or script hash (28 bytes)
- **Usage**: Required to sign spending transactions

### Staking Credential
- **Purpose**: Delegation and rewards
- **Type**: Key hash (28 bytes) or script hash (28 bytes)
- **Usage**: Required to delegate stake or withdraw rewards

## Format Details

**Bech32 Prefix**: `addr` (mainnet) or `addr_test` (testnet)
**Size**: 57 bytes on-chain

## Related

- **[Enterprise Addresses](./enterprise)** - Payment credential only
- **[Reward Addresses](./reward)** - Staking credential only
- **[Franken Addresses](../franken)** - Addresses with credentials from different sources
