---
title: Address Types
description: Comprehensive guide to all Cardano address types and formats
---

import DocCardList from '@theme/DocCardList';

# Address Types

The Evolution SDK implements all Cardano address formats as defined in the ledger specification. This section documents the serialization and deserialization of each address type.

<DocCardList />

## SDK Architecture

Evolution SDK provides two interfaces for working with addresses:

**Core Address Module (`Address`)**: A unified API for common address operations.
- Handles `Payment Credential + Optional Staking Credential`
- Automatically serializes as Base Address (with staking) or Enterprise Address (without staking)
- Simplifies most serialization tasks

**Type-Specific Modules**: Complete implementations for protocol compliance.
- `BaseAddress`, `EnterpriseAddress`, `RewardAddress`, `PointerAddress`, `ByronAddress`
- Required for exact CBOR encoding/decoding
- Used for protocol-level operations and blockchain tooling

## Address Format Specifications

Each address type encodes different credential combinations:

- **Payment Credential**: Hash of payment verification key or script
- **Staking Credential**: Hash of stake verification key or script

### Format Comparison

| Address Type | Payment | Staking | On-Chain Size | Bech32 Prefix | Header Bits |
|--------------|---------|---------|---------------|---------------|-------------|
| **[Base](./base.md)** | Yes | Yes | 57 bytes | `addr`/`addr_test` | `0000`–`0011` |
| **[Enterprise](./enterprise.md)** | Yes | No | 29 bytes | `addr`/`addr_test` | `0110`–`0111` |
| **[Reward](./reward.md)** | No | Yes | 29 bytes | `stake`/`stake_test` | `1110`–`1111` |
| **[Pointer](./pointer.md)** | Yes | Pointer | Variable | `addr`/`addr_test` | `0100`–`0101` |

## Address Type Documentation

Detailed serialization specifications for each format:

- **[Base Addresses](./base.md)** - Payment and staking credential encoding
- **[Enterprise Addresses](./enterprise.md)** - Payment credential only encoding
- **[Reward Addresses](./reward.md)** - Staking credential only encoding
- **[Pointer Addresses](./pointer.md)** - On-chain stake registration reference encoding

## Related

- **[Conversion](../conversion.md)** - Format transformations (Bech32, hex, bytes)
- **[Validation](../validation.md)** - Parsing and validation
