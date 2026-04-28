---
title: Reward Addresses
description: Stake-only addresses for withdrawing staking rewards
---

# Reward Addresses

Reward addresses (also called stake addresses) contain only a staking credential. They are used for staking operations and cannot hold regular UTXOs.

## Structure

```
Reward Address = Staking Credential Only
```

**Staking Credential**: Controls delegation and reward withdrawal
**No Payment**: Cannot receive or spend regular UTXOs

## Construction

Create reward addresses by instantiating the `RewardAccount` class:

```typescript
import { KeyHash, RewardAccount } from "@evolution-sdk/evolution";

const rewardAccount = new RewardAccount.RewardAccount({
  networkId: 1, // mainnet
  stakeCredential: new KeyHash.KeyHash({
    hash: new Uint8Array(28)
  })
});

const bech32 = RewardAccount.toBech32(rewardAccount);
console.log(bech32); // "stake1..."
```

## Parsing Addresses

```typescript
import { RewardAccount } from "@evolution-sdk/evolution";

const bech32 = "stake1uyehkck0lajq8gr28t9uxnuvgcqrc6070x3k9r8048z8y5gh6ffgw";

const address = RewardAccount.fromBech32(bech32);

console.log("Network ID:", address.networkId);
console.log("Stake credential:", address.stakeCredential);
```

## Script-Based Addresses

Reward addresses can use script hashes for the staking credential:

```typescript
import { RewardAccount, ScriptHash } from "@evolution-sdk/evolution";

const scriptRewardAccount = new RewardAccount.RewardAccount({
  networkId: 1,
  stakeCredential: new ScriptHash.ScriptHash({
    hash: new Uint8Array(28)
  })
});

const bech32 = RewardAccount.toBech32(scriptRewardAccount);
console.log("Script-based reward address:", bech32);
```

## Relationship with Base Addresses

Reward addresses are Bech32-encoded with the `stake`/`stake_test` prefix. They share the same stake credential as their corresponding base addresses:

```
Base Address:    addr1qx... (payment + stake)
                           ↓ (same stake key)
Reward Address:  stake1uy... (stake only)
```

## Format Details

**Bech32 Prefix**: `stake` (mainnet) or `stake_test` (testnet)
**Length**: 29 bytes raw / ~59 characters Bech32
**Header Bits**: `1110xxxx` (key hash) or `1111xxxx` (script hash)

## Address Components

Reward addresses enable separation between payment and staking operations:

| Capability | Payment Key | Stake Key |
|------------|-------------|-----------|
| Spend UTXOs | Yes | No |
| Receive funds | Yes | No |
| Delegate stake | No | Yes |
| Withdraw rewards | No | Yes |
| Vote (governance) | No | Yes |

## Related

- **[Base Addresses](./base)** - Addresses with both payment and staking credentials
- **[Enterprise Addresses](./enterprise)** - Payment credential only
- **[Staking](../../staking)** - Using reward addresses for delegation and withdrawals
