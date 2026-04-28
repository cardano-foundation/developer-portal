---
title: Address
description: Working with Cardano addresses using Address
---

# Address

The Evolution SDK provides `Address` for working with modern Cardano addresses. This module handles parsing, validation, inspection, and conversion between formats.

## Modern Address Types

Cardano primarily uses two address types today:

- **Base Address** - Payment + staking credentials (most common)
- **Enterprise Address** - Payment credential only (no staking rewards)

Legacy formats (Byron, Pointer) exist for historical compatibility but are no longer used in practice.

## Basic Operations

### Parsing Addresses

```typescript
import { Address } from "@evolution-sdk/evolution";

// Parse from Bech32 (most common format)
const address = Address.fromBech32(
  "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd"
);

// Parse from hex
const address2 = Address.fromHex(
  "01195a6a8c607b8a0237109aab5e31b7c8828509fb17e4019cd381021a4f8a081b7bd1b0d35972c0e8eaba8e5c923c99d66a3bbe78ff23c5855"
);
```

### Converting Formats

```typescript
import { Address } from "@evolution-sdk/evolution";

const address = Address.fromBech32(
  "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd"
);

// Convert to different formats
const bech32 = Address.toBech32(address);  // "addr1qx2k..."
const hex = Address.toHex(address);        // "01195a6a..."
const bytes = Address.toBytes(address);    // Uint8Array
```

### Validating User Input

```typescript
import { Address } from "@evolution-sdk/evolution";

function validateAddress(input: string): Address.Address | null {
  try {
    const address = Address.fromBech32(input);

    // Check network (0 = testnet, 1 = mainnet)
    if (address.networkId !== 1) {
      console.warn("Not a mainnet address");
    }

    return address;
  } catch (error) {
    console.error("Invalid address:", error);
    return null;
  }
}
```

## Address Inspection

### Type Checking

```typescript
import { Address } from "@evolution-sdk/evolution";

const address = Address.fromBech32(
  "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd"
);

const details = Address.getAddressDetails(Address.toBech32(address));
const isEnterprise = Address.isEnterprise(address); // false
const hasStaking = Address.hasStakingCredential(address); // true

if (details?.type === "Base") {
  console.log("Base address with staking capability");
} else if (isEnterprise) {
  console.log("Enterprise address - no staking rewards");
}
```

### Address Details

For comprehensive information about an address:

```typescript
import { Address } from "@evolution-sdk/evolution";

const details = Address.getAddressDetails(
  "addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd"
);

if (details) {
  console.log("Type:", details.type);                    // "Base"
  console.log("Network:", details.networkId);            // 1 (mainnet)
  console.log("Bech32:", details.address.bech32);
  console.log("Hex:", details.address.hex);
}
```

## Address Construction

For advanced use cases, you can construct addresses from credentials:

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution";

const paymentCred = new KeyHash.KeyHash({
  hash: new Uint8Array(28) // 28-byte key hash
});

const stakeCred = new KeyHash.KeyHash({
  hash: new Uint8Array(28) // 28-byte key hash
});

const address = new Address.Address({
  networkId: 1,
  paymentCredential: paymentCred,
  stakingCredential: stakeCred
});

const bech32 = Address.toBech32(address);
```

## Legacy Address Types

For historical compatibility, Evolution SDK supports legacy address formats via `AddressEras`:

- **Byron addresses** - Legacy Byron-era format (no longer used)
- **Pointer addresses** - Reference stake credentials via on-chain pointers (deprecated)

These are automatically handled when parsing existing UTXOs but should not be used for new addresses.

## Summary

| Function | Purpose |
|----------|---------|
| `fromBech32()` | Parse Bech32 address string |
| `fromHex()` | Parse hex address string |
| `toBech32()` | Convert to Bech32 string |
| `toHex()` | Convert to hex string |
| `isEnterprise()` | Check if enterprise address (no staking) |
| `hasStakingCredential()` | Check if address has staking capability |
| `getAddressDetails()` | Get comprehensive address information |

## Best Practices

1. **Use Base addresses** for most applications (enables staking rewards)
2. **Validate network ID** to prevent testnet/mainnet mixups
3. **Parse once, reuse** - avoid re-parsing the same address strings
4. **Handle errors gracefully** when parsing user input

## Next Steps

- [Address Validation](./validation) - Error handling and validation patterns
- [Address Conversion](./conversion) - Transform between formats
- [Address Construction](./construction) - Build addresses from credentials
