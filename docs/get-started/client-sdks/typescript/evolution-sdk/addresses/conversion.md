---
title: Address Conversion
description: Convert between different address formats using Core Address module
---

# Address Conversion

The Core `Address` module provides transformations between different address representations: Bech32 strings, hexadecimal, and raw bytes.

## Available Formats

### Bech32 (Human-Readable)

Standard format used in wallets and explorers:
- Mainnet base: `addr1...`
- Testnet base: `addr_test1...`
- Mainnet reward: `stake1...`
- Testnet reward: `stake_test1...`

### Hexadecimal

Hex-encoded bytes, useful for low-level operations and debugging.

### Raw Bytes

Binary format (Uint8Array), used internally and for serialization.

## Conversion Examples

### Bech32 to Address

```typescript
import { Address } from "@evolution-sdk/evolution";

const bech32 = "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd";

// Parse Bech32 string to address
const address = Address.fromBech32(bech32);

console.log("Network ID:", address.networkId);
console.log("Payment credential:", address.paymentCredential);
console.log("Staking credential:", address.stakingCredential);

// Convert address back to Bech32
const encoded = Address.toBech32(address);
console.log("Bech32:", encoded);
```

### Hex to Address

```typescript
import { Address } from "@evolution-sdk/evolution";

const hexAddress = "019493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e32c728d3861e164cab28cb8f006448139c8f1740ffb8e7aa9e5232dc";

// Parse hex to address
const address = Address.fromHex(hexAddress);

console.log("Parsed from hex:", address);

// Convert address to hex
const hex = Address.toHex(address);
console.log("Hex:", hex);
```

### Bytes to Address

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution";

// Create an address structure
const address = new Address.Address({
  networkId: 1,
  paymentCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28)
  }),
  stakingCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28)
  })
});

// Convert to raw bytes
const bytes = Address.toBytes(address);
console.log("Bytes length:", bytes.length); // 57 for base address

// Parse from bytes
const decoded = Address.fromBytes(bytes);
console.log("Decoded:", decoded);
```

## Error Handling

Conversions can fail with invalid input:

```typescript
import { Address } from "@evolution-sdk/evolution";

const invalidBech32 = "invalid_address";

try {
  const address = Address.fromBech32(invalidBech32);
  console.log("Parsed address:", address);
} catch (error) {
  console.error("Failed to parse address:", error);
}
```

## Next Steps

- **[Address Validation](./validation.md)** - Verify address correctness and handle errors
- **[Address Types](./address-types/overview.md)** - Overview of all Cardano address types
- **[Address](./address.md)** - Parse, validate, and convert addresses
