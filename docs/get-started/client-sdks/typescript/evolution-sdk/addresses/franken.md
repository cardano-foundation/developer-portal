---
title: Franken Addresses
description: A pattern for combining payment and stake credentials from different sources
---

# Franken Addresses (Hybrid Pattern)

:::info
Franken addresses are **not a separate address type**. They are simply Base addresses where the payment and stake credentials come from different sources. This is a construction pattern, not a distinct format.
:::

Franken addresses (also called Frankenstein or chimera addresses) are a way of constructing base addresses where the payment credential and stake credential are **cryptographically independent** - they come from different wallets, smart contracts, or key sources.

## What They Really Are

```
Franken "Address" = Base Address with Independent Credentials
                 = Payment Credential (Source A) + Stake Credential (Source B)
```

**On-chain**: These look exactly like regular base addresses (57 bytes, same header, same format)
**Wallets**: See them as normal base addresses - no special handling needed
**The "Trick"**: The payment and stake credentials don't share a common derivation path or master key

## Key Properties

**Independence**: Payment and stake keys are from completely different sources
**No Trust Required**: Each party only controls their respective credential
**Standard Format**: Still a valid base address - wallets see it as normal
**Separate Security**: Compromise of one key doesn't affect the other

## Credential Combinations

This pattern works with **any combination of key hashes and script hashes** for payment and stake credentials:

| Payment Credential | Stake Credential | Use Case |
|-------------------|------------------|----------|
| **Key Hash** | **Key Hash** | Traditional pattern: two different wallets |
| **Script Hash** | **Key Hash** | Smart contract funds + individual staking control |
| **Key Hash** | **Script Hash** | Individual payment + DAO-controlled delegation |
| **Script Hash** | **Script Hash** | Full smart contract control with separation |

**Examples:**
- **Payment: Script, Stake: Key** - Multi-sig treasury where funds require multiple signatures, but delegation is controlled by a single administrator
- **Payment: Key, Stake: Script** - Individual controls funds, but staking/delegation follows governance decisions (e.g., DAO votes on pool selection)
- **Payment: Script A, Stake: Script B** - Different smart contracts control spending vs staking logic (e.g., time-locked payments, voting contract for delegation)

This flexibility makes the pattern ideal for complex custody arrangements, DeFi protocols, and governance systems.

## Construction

### Building Franken Addresses with Core Module

Build directly from two independent key hashes using the Core `Address` class:

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution";

const frankenAddress = new Address.Address({
  networkId: 1, // mainnet
  paymentCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28) // Wallet A's payment key hash
  }),
  stakingCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28) // Wallet B's stake key hash (different!)
  })
});

const bech32 = Address.toBech32(frankenAddress);
console.log("Franken address:", bech32);
```

## Example Use Case: Custodial Platform

A common use case is a custodial platform where the platform controls fund management, but users retain control over staking delegation:

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution";

// Platform controls spending (payment credential)
// User controls delegation (stake credential)
function createCustodialAddress(
  platformPaymentHash: Uint8Array,
  userStakeHash: Uint8Array
) {
  return new Address.Address({
    networkId: 1,
    paymentCredential: new KeyHash.KeyHash({
      hash: platformPaymentHash
    }),
    stakingCredential: new KeyHash.KeyHash({
      hash: userStakeHash
    })
  });
}
```

**Benefits of this pattern:**
- Platform can manage funds without controlling user's staking rewards
- Users retain autonomy over delegation decisions
- Clear separation of responsibilities

## Limitations

**Complexity**: More mental overhead. Need to understand which credential controls what operation.

**Coordination**: Multiple parties may need to coordinate, especially for reward distribution.

**Backup**: Each party must backup their credentials independently. No single recovery mechanism.

**Tooling**: Not all tools recognize the split credential ownership, though addresses function normally.

## Next Steps

- **[Base Addresses](./address-types/base)** - Understanding the underlying base address format
- **[Validation](./validation)** - Verifying address structure
