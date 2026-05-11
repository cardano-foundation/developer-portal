---
title: Address Validation
description: Validate and verify Cardano addresses
---

# Address Validation

Validating addresses is critical before using them in transactions. The SDK provides utilities to parse and validate addresses with error handling.

## Basic Validation

Create a helper function for safe address validation:

```typescript
import { Address } from "@evolution-sdk/evolution";

function validateAddress(addressString: string) {
  try {
    const address = Address.fromBech32(addressString);
    return { success: true, address } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
}

const result = validateAddress("addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd");
if (result.success) {
  console.log("Valid address:", result.address);
} else {
  console.error("Invalid address:", result.error);
}
```

## Network Validation

Verify an address belongs to the expected network:

```typescript
import { Address } from "@evolution-sdk/evolution";

function validateNetwork(
  addressString: string,
  expectedNetwork: "mainnet" | "testnet"
): boolean {
  try {
    const address = Address.fromBech32(addressString);
    const expectedNetworkId = expectedNetwork === "mainnet" ? 1 : 0;

    if (address.networkId !== expectedNetworkId) {
      console.error(
        `Wrong network: expected ${expectedNetwork}, got ${address.networkId === 1 ? "mainnet" : "testnet"}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid address:", error);
    return false;
  }
}
```

## Address Type Checking

Check if an address has staking credentials:

```typescript
import { Address } from "@evolution-sdk/evolution";

function hasStakingCredential(addressString: string): boolean {
  try {
    const address = Address.fromBech32(addressString);
    return Address.hasStakingCredential(address);
  } catch {
    return false;
  }
}

function isEnterpriseAddress(addressString: string): boolean {
  try {
    const address = Address.fromBech32(addressString);
    return Address.isEnterprise(address);
  } catch {
    return false;
  }
}
```

## Common Validation Scenarios

### User Input Validation

```typescript
import { Address } from "@evolution-sdk/evolution";

function validateUserInput(input: string): string | null {
  const trimmed = input.trim();

  try {
    Address.fromBech32(trimmed);
    return trimmed;
  } catch (error) {
    alert("Invalid address format. Please check and try again.");
    return null;
  }
}
```

### Bulk Validation

```typescript
import { Address } from "@evolution-sdk/evolution";

function validateMany(addresses: string[]): {
  valid: string[];
  invalid: { address: string; error: string }[];
} {
  const valid: string[] = [];
  const invalid: { address: string; error: string }[] = [];

  for (const addr of addresses) {
    try {
      Address.fromBech32(addr);
      valid.push(addr);
    } catch (error) {
      invalid.push({ address: addr, error: String(error) });
    }
  }

  return { valid, invalid };
}
```

## Next Steps

- **[Address Conversion](./conversion.md)** - Transform between Bech32, hex, and byte formats
- **[Address Types](./address-types/overview.md)** - Overview of all Cardano address types
- **[Address](./address.md)** - Parse, validate, and convert addresses
