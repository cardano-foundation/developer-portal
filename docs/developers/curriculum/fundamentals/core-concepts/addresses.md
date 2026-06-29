---
id: addresses
title: Addresses
sidebar_label: Addresses
description: Cardano address structure, address types, and how payment and delegation credentials work.
image: /img/og/og-getstarted-technical-concepts.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

An address is where value lives on Cardano: a public identifier others use to send you funds, much like an email address. Unlike one, it is self-sovereign (tied to keys you control, not a service provider) and bakes in its own spending rules and stake settings rather than being just a destination. Before you can follow how transactions move value or how the [eUTXO model](/docs/developers/curriculum/fundamentals/core-concepts/eutxo) works, you need to know what an address actually encodes: who can spend funds held there, and who controls their stake.

## Address structure

A Cardano (Shelley-era) address has two or three parts:

```
+--------+-------------------+-----------------------+
| Header | Payment credential| Delegation credential |
| 1 byte | 28 bytes          | 28 bytes (optional)   |
+--------+-------------------+-----------------------+
```

- **Header** describes the address type and network (mainnet or testnet). The network discriminant prevents sending mainnet funds to a testnet address.
- **Payment credential** defines the spending condition: who can spend funds at this address.
- **Delegation credential** (optional) controls stake delegation and reward withdrawal.

Addresses are **Bech32**-encoded with human-readable prefixes: `addr` (mainnet), `addr_test` (testnet), `stake` (reward addresses).

```
addr1vpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5eg0yu80w
stake1vpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5egfu2p0u
```

## Payment credentials

A payment credential comes in two forms:

- **Verification key hash**: the Blake2b-224 hash of an Ed25519 public key. Regular wallets use this. To spend, you provide the public key and a signature.
- **Script hash**: the Blake2b-224 hash of a Plutus or native script. Smart contracts, DEX pools, and escrows use this. To spend, you provide the script and satisfy its validation logic.

:::tip Addresses hold hashes, not keys
An address contains the **hash** of a public key, not the key itself. You cannot recover a public key from an address; the key is only revealed when funds are spent. This adds a layer of protection (and is why quantum concerns are reduced for unspent, unreused addresses).
:::

When the payment credential is a script hash, the address is a **script address**: UTXOs there can only be spent by a transaction that satisfies the script. This is how contracts are "deployed", the script's hash *is* its address, and anyone who compiles the same script gets the same address. See [Smart Contracts](/docs/developers/curriculum/smart-contracts/overview).

## Delegation credentials

The delegation credential controls two things: publishing a delegation certificate (delegating stake to a pool) and withdrawing staking rewards. Like payment credentials, it can be a verification key hash or a script hash.

**Key insight:** delegating does not move your funds. They stay at your payment address under your control; the delegation credential only decides which pool receives your stake and who can withdraw rewards.

## Address types

| Type | Credentials | Use |
|---|---|---|
| **Base** | Payment + delegation | The most common type. Standard wallets; can hold funds and delegate for rewards. |
| **Enterprise** | Payment only | No staking. Exchanges and organizations that explicitly opt out of stake rights. Shorter than base. |
| **Reward (stake)** | Delegation only | Receives staking rewards; cannot receive regular payments. One per stake key. Prefix `stake`. |
| **Pointer** | Payment + pointer to a stake registration | Space-efficient alternative to base; functionally equivalent, but rarely used. |
| **Script** | Script-hash payment credential | A base or enterprise address whose payment credential is a script hash (smart contracts). |

## Privacy: stake-key linking

Multiple payment addresses that share the same delegation credential are publicly linked, because the same stake key hash appears in all of them:

```
addr1q[payment_hash_1][stake_hash_shared]...
addr1q[payment_hash_2][stake_hash_shared]...
```

Anyone can see these belong together. Options:

- **Accept it** (standard wallet behavior, all addresses under one stake key).
- **Forgo staking** with enterprise addresses (unlinked, but no rewards).
- **Multiple stake keys** (complex and impractical for most).

For most applications the linking is acceptable; only privacy-critical apps need alternatives.

## Working with addresses in code

Whatever tool you reach for, the same handful of operations come up once an address enters your application:

- **Parse** an address from its encodings (Bech32, hex, or raw bytes) into a structured value.
- **Check the network** before using it. An address's header marks it mainnet or testnet; rejecting a mismatch up front prevents a costly class of mistakes (see the tip below).
- **Inspect the credentials**: whether the payment credential is a key hash or a script hash, and whether a delegation credential is present (a base address) or absent (enterprise).
- **Convert** between Bech32, hex, and bytes for storage, display, or transaction building.
- **Build** an address from raw credentials. This is the rare case: in a dApp you usually *get* the user's address from the [wallet connector](/docs/developers/curriculum/dapps/connect-a-wallet) rather than constructing one.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address } from "@evolution-sdk/evolution"

// Parse, from Bech32, hex, or bytes
const address = Address.fromBech32("addr1...")   // also Address.fromHex(...) / Address.fromBytes(...)

// Validate user input AND check the network (0 = testnet, 1 = mainnet)
function parseChecked(input: string, expect: 0 | 1) {
  try {
    const a = Address.fromBech32(input.trim())
    return a.networkId === expect ? a : null   // wrong network → reject
  } catch {
    return null                                // malformed → reject
  }
}

// Inspect
const details = Address.getAddressDetails("addr1...")   // { type: "Base", networkId, address: { bech32, hex } }
const hasStake = Address.hasStakingCredential(address)  // base vs enterprise
const isEnterprise = Address.isEnterprise(address)

// Convert
const hex = Address.toHex(address)
const bytes = Address.toBytes(address)   // 57 bytes for a base address, 29 for enterprise
const bech32 = Address.toBech32(address)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { deserializeAddress, resolvePaymentKeyHash } from "@meshsdk/core"

// Parse and inspect: pull the credentials out of a Bech32 address
const { pubKeyHash, scriptHash, stakeCredentialHash } = deserializeAddress("addr1...")

// Payment credential: a key hash (regular wallet) or a script hash (contract)
const isScript = scriptHash !== undefined

// Base vs enterprise: a base address carries a stake credential, enterprise doesn't
const hasStake = stakeCredentialHash !== undefined

// Shorthand when you only need the payment key hash
const keyHash = resolvePaymentKeyHash("addr1...")
```

</TabItem>
</Tabs>

Building one from raw credentials (the rare case above) looks like:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address, KeyHash } from "@evolution-sdk/evolution"

declare const paymentKeyHash: Uint8Array  // 28 bytes
declare const stakeKeyHash: Uint8Array    // 28 bytes

const address = new Address.Address({
  networkId: 1,
  paymentCredential: new KeyHash.KeyHash({ hash: paymentKeyHash }),
  stakingCredential: new KeyHash.KeyHash({ hash: stakeKeyHash }),   // omit for an enterprise address
})
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { pubKeyAddress, serializeAddressObj } from "@meshsdk/core"

declare const paymentKeyHash: string   // 28-byte hash, hex
declare const stakeKeyHash: string     // 28-byte hash, hex

// Build the address object from raw credentials (omit the stake hash for an enterprise address)
const addressObj = pubKeyAddress(paymentKeyHash, stakeKeyHash)

// Serialize to bech32 (networkId: 0 = testnet, 1 = mainnet)
const address = serializeAddressObj(addressObj, 1)
```

</TabItem>
</Tabs>

:::tip Always validate the network
Checking the network discriminant before using an address in a transaction is the cheapest guard against sending mainnet funds to a testnet address (and vice versa). Legacy Byron and pointer formats are still parsed automatically when reading existing UTXOs, but shouldn't be used for new addresses.
:::

## Tools

- [`cardano-address`](https://github.com/IntersectMBO/cardano-addresses): inspect components, extract key hashes
- [`bech32`](https://github.com/input-output-hk/bech32): decode Bech32 to hex
- [`cardano-cli`](/docs/developers/curriculum/start-building/your-first-transaction): generate and hash keys, build addresses
- Technical reference: [CIP-19: Cardano Addresses](https://cips.cardano.org/cip/CIP-19)

## Key takeaways

- An address encodes a header, a payment credential (who can spend), and an optional delegation credential (stake control).
- Payment and delegation credentials are each either a key hash or a script hash.
- Base addresses are the norm; enterprise opt out of staking; script addresses are where contracts hold funds.
- Addresses store key *hashes*, not public keys, and reused stake keys link addresses publicly.

## Next steps

- [Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys): where the keys behind these credentials come from
- [Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions): how value moves between addresses
