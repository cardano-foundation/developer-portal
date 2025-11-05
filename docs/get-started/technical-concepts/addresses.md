---
id: addresses
title: Addresses
sidebar_label: Addresses
description: Understanding Cardano address types, structure, and how payment and stake keys work together.
image: /img/og/og-getstarted-technical-concepts.png
---

Cardano addresses are used as destinations to send ada on the blockchain. Understanding their structure and types is fundamental to working with the Cardano ecosystem.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/NjPf_b9UQNs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Address Construction and Structure

Cardano addresses are blake2b-224 hash digests of relevant verifying/public keys concatenated with metadata. They are binary sequences consisting of a one-byte header and variable-length payload:

- **Header**: Contains address type information (bits 7-4) and network tags (bits 3-0) distinguishing mainnet from testnet
- **Payload**: The raw or encoded data containing the actual address information

### Encoding Formats

**Shelley addresses** use Bech32 encoding with human-readable prefixes:

- `addr` for mainnet addresses
- `addr_test` for testnet addresses
- `stake` for mainnet reward addresses
- `stake_test` for testnet reward addresses

**Byron addresses** use Base58 encoding for backward compatibility, making them easily distinguishable from newer addresses.

## Key Types and Their Purposes

Cardano uses two main types of Ed25519 keys, each serving distinct purposes:

**Payment Keys**: Used to sign transactions involving fund transfers, minting tokens, and interacting with smart contracts. The payment verification (public) key is used to derive addresses that can receive and send ada and native tokens.

**Stake Keys**: Used to sign staking-related transactions including stake address registration, delegation to stake pools, and reward withdrawals. Stake keys enable participation in Cardano's proof-of-stake consensus mechanism.

## Payment and Delegation Components

Shelley addresses contain two distinct parts:

**Payment Part**: Controls fund ownership. Spending requires a witness (signature or script validation) proving control over this component. This is typically derived from a payment verification key.

**Delegation Part**: Controls stake rights associated with funds. This can be:

- A stake key hash (direct delegation)
- A pointer to an on-chain stake registration certificate (compact representation)
- Empty (enterprise addresses with no stake rights)

**Franken addresses** allow payment and delegation parts to be controlled by different entities, enabling separation of fund control and staking rights.

Franken Addresses are a way to register additional pledge to a pool without registering a second owner on the blockchain.
<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/KULzovfWn-M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Address Types

Cardano supports different address types across categories:

### Shelley Address Types

**Base Addresses** directly specify the staking key controlling stake rights. The staking rights can be exercised by registering the stake key and delegating to a stake pool. Base addresses can be used in transactions without prior stake key registration.

**Enterprise Addresses** carry no stake rights, allowing users to opt out of proof-of-stake participation. Exchanges and organizations holding ada on behalf of others often use these to demonstrate they don't exercise stake rights. These addresses can still receive, hold, and send native tokens.

**Reward Account Addresses** distribute rewards for proof-of-stake participation. They use account-style (not UTXO-style) accounting, cannot receive funds via transactions, and have a one-to-one correspondence with registered staking keys.

**Pointer Addresses** indirectly specify staking keys by referencing a location on the blockchain where a stake key registration certificate exists. Pointers are considerably shorter than stake key hashes. If the referenced certificate is lost due to rollback, pointer addresses remain valid for payments but lose stake participation rights.

Learn and dive into CPS-0002 which focuses on Pointer Addresses.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/XKgmP1r_GSA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

### Legacy Byron Addresses

Byron addresses are legacy addresses from Cardano's Byron era, using CBOR encoding and Base58 representation. They have no stake rights and are maintained for backward compatibility.

:::caution
**Important Limitation**: Byron addresses are **not allowed in transactions that contain Plutus scripts**. This means smart contracts will never encounter Byron addresses during validation. If you're working with dApps, ensure all addresses are Shelley-era addresses to avoid transaction failures.
:::

<details>
<summary>Technical Reference: Address Binary Format</summary>

For complete technical specifications including binary format details and address derivation paths, see [CIP-19: Cardano Addresses](https://cips.cardano.org/cip/CIP-19).

The binary format follows this structure:
- 1 byte header (address type + network tag)
- Variable payload depending on address type
- Bech32 or Base58 encoding applied to the final binary

</details>

---

## Next Steps

- Learn about [Wallet & Key Management](/docs/get-started/technical-concepts/wallet-key-management)
- Understand [Transaction Fees](/docs/get-started/technical-concepts/fees)
- Build with addresses: [Building dApps](/docs/integrate-cardano/)
