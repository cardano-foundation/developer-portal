---
id: addresses
title: Addresses
sidebar_label: Addresses
description: Cardano address structure, address types, and how payment and delegation credentials work.
image: /img/og/og-getstarted-technical-concepts.png
---

An address is where value lives on Cardano. Before you can follow how transactions move value or how the [eUTXO model](/docs/value/eutxo) works, you need to know what an address actually encodes: who can spend funds held there, and who controls their stake.

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

- **Verification key hash**: the Blake2b-224 hash of an Ed25519 public key. Regular wallets (Lace, Eternl, Yoroi) use this. To spend, you provide the public key and a signature.
- **Script hash**: the Blake2b-224 hash of a Plutus or native script. Smart contracts, DEX pools, and escrows use this. To spend, you provide the script and satisfy its validation logic.

:::tip Addresses hold hashes, not keys
An address contains the **hash** of a public key, not the key itself. You cannot recover a public key from an address; the key is only revealed when funds are spent. This adds a layer of protection (and is why quantum concerns are reduced for unspent, unreused addresses).
:::

When the payment credential is a script hash, the address is a **script address**: UTXOs there can only be spent by a transaction that satisfies the script. This is how contracts are "deployed", the script's hash *is* its address, and anyone who compiles the same script gets the same address. See [Smart Contracts](/docs/build/smart-contracts/overview).

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

A quick reference for handling addresses with the Evolution SDK — parsing, checking the network, inspecting credentials, converting formats, and building one from credentials. In a dApp you usually *get* the user's address from the [wallet connector](/docs/build/integrate/connect-a-wallet); these helpers are for validating and inspecting it.

```typescript
import { Address } from "@evolution-sdk/evolution"

// Parse — from Bech32, hex, or bytes
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

Build an address from raw credentials (advanced — usually the wallet or SDK does this for you):

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

:::tip Always validate the network
Checking `networkId` before using an address in a transaction is the cheapest guard against sending mainnet funds to a testnet address (and vice versa). Legacy Byron/pointer formats are parsed automatically when reading existing UTXOs but shouldn't be used for new addresses. Mesh exposes equivalent helpers (`resolvePaymentKeyHash`, `resolveStakeKeyHash`, `deserializeAddress`) — see [meshjs.dev](https://meshjs.dev/apis/resolvers).
:::

## Web2 analogy

An address is like an **email address**: a public identifier others use to send you value. The difference is that it is self-sovereign (tied to keys you control, not a service provider), and it bakes in *spending rules* (the payment credential) and *stake settings* (the delegation credential) rather than just being a destination.

## Tools

- [`cardano-address`](https://github.com/IntersectMBO/cardano-addresses): inspect components, extract key hashes
- [`bech32`](https://github.com/input-output-hk/bech32): decode Bech32 to hex
- [`cardano-cli`](/docs/first-steps/your-first-transaction): generate and hash keys, build addresses
- Technical reference: [CIP-19: Cardano Addresses](https://cips.cardano.org/cip/CIP-19)

## Key takeaways

- An address encodes a header, a payment credential (who can spend), and an optional delegation credential (stake control).
- Payment and delegation credentials are each either a key hash or a script hash.
- Base addresses are the norm; enterprise opt out of staking; script addresses are where contracts hold funds.
- Addresses store key *hashes*, not public keys, and reused stake keys link addresses publicly.

## Next steps

- [Keys & Wallets](/docs/value/wallets-and-keys): where the keys behind these credentials come from
- [Transactions](/docs/value/transactions): how value moves between addresses
