---
title: Pointer Addresses
description: Payment addresses with on-chain stake pointer reference
---

# Pointer Addresses

:::info
**Legacy Format**: Pointer addresses are rarely used in practice. This documentation exists for parsing historical transactions and understanding the complete address specification.
:::

Pointer addresses contain a payment credential plus a pointer to an on-chain stake registration certificate. They reference stake information indirectly via blockchain coordinates instead of embedding a stake credential.

## Historical Context

Pointer addresses were part of the original Shelley address design, intended to optimize for size by referencing stake information rather than embedding it.

**Original Goal**: Save 28 bytes per address by using a pointer instead of a full stake credential.

**Reality**: Minimal savings, added complexity. On-chain stake registrations must be permanent and indexed. Wallet software needs additional logic to resolve pointers.

**Outcome**: The ecosystem converged on base addresses as the standard format.

## Structure

```
Pointer Address = Payment Credential + Pointer (slot, txIndex, certIndex)
```

**Payment Credential**: Controls who can spend UTXOs
**Pointer**: References stake registration cert location on-chain

## Comparison with Base Addresses

| Feature | Pointer | Base |
|---------|---------|------|
| Payment credential | Yes | Yes |
| Stake credential | Via pointer | Direct embed |
| Size | Variable | Fixed 57 bytes |
| Complexity | High | Low |
| Adoption | Rare | Universal |
| Recommended | No | Yes |

## Parsing Pointer Addresses (Legacy)

`Address` does not support pointer addresses as they are deprecated. Use `AddressEras` for historical parsing.

```typescript
import { AddressEras } from "@evolution-sdk/evolution";

const address = AddressEras.fromBech32("addr_test1gz2n8fvzgmyhnqlpnv2340v09943nr7pz5af2rwqrra8ncsm0tdz8");

if (address._tag === "PointerAddress") {
  console.log("Payment credential:", address.paymentCredential);
  console.log("Pointer:", address.pointer);
}
```

## Migration to Base Address

If you have funds at a pointer address, you can send them to a base address using your wallet. Create a transaction that spends from the pointer address UTXOs and sends to your base address. This requires the appropriate signing keys for the payment credential referenced in the pointer address.

## Advanced: Understanding Pointer Structure

The pointer identifies where the stake registration certificate lives on-chain:

- **slot**: Block slot number containing the registration
- **txIndex**: Transaction position within that block
- **certIndex**: Certificate position within that transaction

This triplet uniquely identifies the stake registration certificate.

### Stake Registration Requirement

For a pointer address to work:

1. A stake registration certificate must exist on-chain at the pointer location
2. That certificate must register a stake credential
3. The pointer (slot, txIndex, certIndex) must be valid and resolvable

If any of these fail, the address is invalid.

## Advanced: Manual Construction

This example shows the structure for completeness. **Do not use in production**:

```typescript
import { KeyHash, Pointer, PointerAddress } from "@evolution-sdk/evolution";

const paymentCred = new KeyHash.KeyHash({
  hash: new Uint8Array(28).fill(0)
});

const pointer = new Pointer.Pointer({
  slot: 12345,
  txIndex: 2,
  certIndex: 0
});

const pointerAddr = new PointerAddress.PointerAddress({
  networkId: 0,
  paymentCredential: paymentCred,
  pointer: pointer
});

console.log("Pointer address (deprecated):", pointerAddr);
```

## Format Details

**Bech32 Prefix**: `addr` (mainnet) or `addr_test` (testnet)
**Length**: Variable (34-48 bytes depending on pointer values)
**Header Bits**: `0100xxxx` (key hash) or `0101xxxx` (script hash)

## Related

- **[Base Addresses](./base)** - Standard address format with embedded stake credential
- **[Enterprise Addresses](./enterprise)** - Payment credential only
