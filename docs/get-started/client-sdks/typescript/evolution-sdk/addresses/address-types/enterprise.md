---
title: Enterprise Addresses
description: Payment-only addresses without staking capability
---

# Enterprise Addresses

Enterprise addresses contain only a payment credential, with no staking component.

## Structure

```
Enterprise Address = Payment Credential Only
```

**Payment Credential**: Controls who can spend UTXOs at this address
**No Staking**: Cannot delegate stake or earn staking rewards

## Construction

Create enterprise addresses by instantiating the `EnterpriseAddress` class:

```typescript
import { AddressEras, EnterpriseAddress, KeyHash } from "@evolution-sdk/evolution";

const address = new EnterpriseAddress.EnterpriseAddress({
  networkId: 1, // mainnet
  paymentCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28)
  })
});

const bech32 = AddressEras.toBech32(address);
console.log(bech32); // "addr1..."
```

## Parsing Addresses

```typescript
import { AddressEras, EnterpriseAddress } from "@evolution-sdk/evolution";

const bech32 = "addr1vx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz6cevnrgl";

const address = AddressEras.fromBech32(bech32) as EnterpriseAddress.EnterpriseAddress;

console.log("Network ID:", address.networkId);
console.log("Payment:", address.paymentCredential);
```

## Script-Based Example

Enterprise addresses can use script hashes as payment credentials:

```typescript
import { AddressEras, EnterpriseAddress, ScriptHash } from "@evolution-sdk/evolution";

const scriptAddr = new EnterpriseAddress.EnterpriseAddress({
  networkId: 1,
  paymentCredential: new ScriptHash.ScriptHash({
    hash: new Uint8Array(28)
  })
});

const bech32 = AddressEras.toBech32(scriptAddr);
console.log("Script enterprise address:", bech32);
```

## Format Details

**Bech32 Prefix**: `addr` (mainnet) or `addr_test` (testnet)
**Length**: 29 bytes raw / ~59 characters Bech32
**Header Bits**: `0110xxxx` (key hash) or `0111xxxx` (script hash)
**Size Advantage**: Half the size of base addresses (29 vs 57 bytes)

## Comparison with Base Addresses

| Feature | Enterprise | Base |
|---------|-----------|------|
| Payment credential | Yes | Yes |
| Staking credential | No | Yes |
| Can receive funds | Yes | Yes |
| Can delegate stake | No | Yes |
| Earns staking rewards | No | Yes |
| Size | 29 bytes | 57 bytes |
| Use case | Exchanges, scripts | User wallets |

## Characteristics

**Smaller Size**: 29 bytes compared to 57 bytes for base addresses.

**Single Credential**: Only payment credential required - no stake key management.

**No Staking**: Cannot delegate stake or earn staking rewards.

## Related

- **[Base Addresses](./base.md)** - Addresses with both payment and staking credentials
- **[Reward Addresses](./reward.md)** - Staking credential only
