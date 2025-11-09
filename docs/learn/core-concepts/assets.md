---
id: assets
title: Native Assets & Tokens
sidebar_label: Assets & Tokens
description: Understanding Cardano's multi-asset ledger and how native tokens work as first-class citizens.
image: /img/og/og-getstarted-technical-concepts.png
---

One of Cardano's most powerful features is its ability to handle multiple types of assets natively on the blockchain. Unlike other platforms where tokens require smart contracts, Cardano treats custom tokens as first-class citizens alongside ada.

## Multi-Asset Ledger

Cardano is a **multi-asset ledger**, meaning the blockchain can natively track and transfer multiple different asset types without requiring smart contracts. This is fundamentally different from single-asset ledgers like Bitcoin (which tracks only BTC) and account-based multi-asset ledgers like Ethereum (where each token type requires deploying a separate smart contract like ERC-20 or ERC-721).

On Cardano, ada is the principal currency used for fees, deposits, and rewards. All other tokens are **native assets** with the same ledger-level support as ada. Tokens can be created, transferred, and burned using the same ledger mechanisms, and you don't need smart contracts for basic token operations (though you can add custom logic if needed).

### Native vs Non-Native MA Support

**Native multi-asset support** means the blockchain itself handles token accounting. The ledger tracks ownership and transfers directly - this is Cardano's approach.

**Non-native multi-asset support** uses smart contracts on top of a single-asset blockchain (like ERC-20 on Ethereum). This requires layer-2 solutions and introduces complexity.

## How Native Assets Work

Every native asset on Cardano is uniquely identified by two components:

1. **Policy ID**: A unique identifier derived from the minting policy script (the rules governing token creation/destruction)
2. **Asset Name**: A human-readable identifier within that policy

Together, these form a unique **Asset ID**: `PolicyID.AssetName`

### Example

```
Policy ID: e0d123e5f316bef78...
Asset Name: MyToken
Asset ID: e0d123e5f316bef78.MyToken
```

Different policies can use the same asset names without conflict - tokens are only fungible if they share the same complete Asset ID.

## Token Bundles

A **token bundle** is a heterogeneous collection of different token types stored together. This is the standard way to represent assets on Cardano.

### Token Bundle Structure

```
{
  Ada: 50000000,  // 50 ADA in lovelace
  NFTPolicy {
    (CardanoCard1, 1),
    (CardanoCard2, 1)
  },
  StablecoinPolicy {
    (USDC, 1000)
  }
}
```

Token bundles can be split (one bundle divided into multiple outputs), combined (multiple bundles merged into one output), or transferred (sent to any address alongside ada). Each UTXO output contains a token bundle specifying both ada and any number of other native assets.

## Minting Policies

A minting policy is a set of rules that controls who can mint (create) or burn (destroy) tokens, when tokens can be minted or burned, and how many tokens can exist. Policies can be expressed as simple multisig scripts or complex Plutus smart contracts.

### Simple Multisig Policies

Simple policies don't require any code - just signature requirements. You can create single signature policies (only one key can mint), multi-signature policies (requires multiple signatures like 2 of 3 keys), or time-locked policies (can only mint before or after a specific slot).

### Plutus Script Policies

Plutus scripts enable complex minting logic through smart contracts. You can implement one-time minting (mint once, then lock forever), conditional minting based on blockchain state, advanced access control, or dynamic supply management.

### Common Policy Types

**Single-Issuer Policy**: Only the entity holding specific keys can mint tokens. Example: A company minting official merchandise tokens.

**Time-Locked Policy**: Tokens can only be minted/burned within certain time windows. Example: Event tickets that can't be minted after the event starts.

**One-Time Minting Policy**: All tokens are minted in a single transaction, then the policy locks forever. Example: Limited edition NFT collection.

:::tip
The association between an asset and its minting policy is **permanent**. Once created, tokens cannot be moved to a different policy. This ensures that every token was created according to its declared rules.
:::

## Fungible vs Non-Fungible Tokens

**Fungible Tokens (FTs)** are interchangeable tokens where each unit is identical. All tokens with the same Asset ID are fungible with each other, making them useful for currencies, utility tokens, and divisible assets like stablecoins, governance tokens, and reward points.

**Non-Fungible Tokens (NFTs)** are unique tokens where each one is distinct. They're typically used for digital art, collectibles, certificates, and real estate. NFTs usually employ one-time minting policies, carry unique metadata, and mint only 1 token per asset name.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/P-wQ0VymzKU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Token Metadata

Cardano supports rich metadata for tokens through community standards like [CIP-25](https://cips.cardano.org/cip/CIP-25) (the most widely used NFT metadata standard), [CIP-68](https://cips.cardano.org/cip/CIP-68) (token metadata standard with reference tokens), and [CIP-27](https://cips.cardano.org/cip/CIP-27) (royalty standard for NFTs).

Metadata can include name, description, display properties, images, videos, audio files (via IPFS links), attributes and traits, creator information, and royalty and licensing terms.

## Minimum Ada Requirement

Every UTXO output on Cardano must contain a minimum amount of ada, calculated based on the size of the output. This protects the ledger from growing unboundedly by preventing spam attacks with tiny outputs, ensuring nodes can process the UTXO set efficiently, and covering storage costs for maintaining the ledger.

Ada-only outputs require around 1 ADA minimum. Outputs with native tokens require more ada depending on the number of different policy IDs, the number of different asset names, the length of asset names, and whether the output includes a datum for smart contracts.

:::caution Important for Developers
When sending native tokens, you must **always include enough ada** to meet the minimum UTXO value. The ada "travels" with the tokens. To recover this ada, you must either:

1. Spend the output and consolidate tokens into fewer outputs
2. Burn the tokens
:::

<details>
<summary>Technical: Min-Ada Calculation</summary>

The minimum ada value for a UTXO is calculated as:

```
minAda = coinsPerUTxOWord × utxoEntrySize
```

Where:

- `coinsPerUTxOWord`: Protocol parameter
- `utxoEntrySize`: Size of the serialized UTXO in 8-byte words

The size depends on:

- Number of different tokens
- Length of policy IDs (28 bytes each)
- Length of asset names
- Datum hash size (if present)

</details>

## Multi-Signature Tokens

Native assets can be controlled by multi-signature policies, requiring multiple parties to approve minting or burning. This is useful for DAO treasury management, shared asset control between partners, governance tokens requiring consensus, and collaborative NFT projects.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/k_ph_V7xkio" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Native Token Lifecycle

Native tokens go through five phases: minting (creating new tokens according to the minting policy), issuing (distributing tokens to holders), using (trading, transferring, or utilizing tokens), redeeming (returning tokens to issuers, which is optional), and burning (destroying tokens to remove from circulation).

The key actors in this lifecycle are asset controllers who define minting policies, token issuers who mint and distribute tokens, and token holders who own, use, and trade tokens.

![Native Token Lifecycle](/img/multiasset-lifecycle.png)

## Why Native Tokens Matter

### Security

Tokens benefit from the same security guarantees as ada. There are no smart contract vulnerabilities for basic transfers - everything is handled at the ledger level with deterministic execution and protected by Cardano's consensus mechanism.

### Efficiency

Native tokens don't require smart contracts for basic operations, which means lower transaction costs, simpler implementation, smaller transaction size, and direct wallet support.

### Simplicity

Creating and using tokens is straightforward. You don't need contract deployment for basic tokens, transactions use the standard structure, there are no special transfer fees beyond normal transaction fees, and no additional event-handling logic is required.

### UTXO Model Benefits

Tokens inherit all EUTXO advantages including deterministic validation, predictable fees, parallel processing, and local state instead of global state.

<iframe width="100%" height="325" src="https://www.youtube-nocookie.com/embed/pK7xShX9etI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Cardano Native Tokens vs Ethereum ERC-20/721

Understanding the differences helps developers coming from other ecosystems:

| Feature | ERC-20/721 (Ethereum) | Native Tokens (Cardano) |
|---------|----------------------|------------------------|
| **Implementation** | Smart contract code | Built into ledger |
| **Transfer mechanism** | Contract function calls | Native ledger transactions |
| **Requires smart contract to transfer?** | Yes | No |
| **Can transfer multiple token types together?** | No | Yes |
| **Transfer fees** | Variable gas + contract execution | Fixed transaction fee only |
| **Security vulnerabilities** | Contract bugs, overflow errors | Ledger-level guarantees |
| **Non-fungible support** | Requires ERC-721 | Same mechanism as FTs |
| **Metadata** | Stored in contract or IPFS | Off-chain metadata server + CIPs |
| **Minting control** | Contract logic | Minting policy scripts |

The key advantages of Cardano's approach are clear: there's no need to copy-paste contract templates (a common source of bugs), no overflow or underflow vulnerabilities (Cardano's scripting languages use arbitrary-precision integers), transfers work the same for all native assets, and smart contracts can interact with any native token without special support.

<details>
<summary>Technical: Token Structure in Transactions</summary>

In transaction outputs, native assets are represented as nested maps:

```haskell
Value = Map PolicyID (Map AssetName Quantity)

-- Example:
{
  Ada: 50000000,
  PolicyID1: {
    AssetName1: 100,
    AssetName2: 50
  },
  PolicyID2: {
    AssetName3: 1
  }
}
```

Each UTXO carries this value structure. The ledger natively tracks all assets without requiring smart contract state management.

### Minting Field in Transactions

Transactions include a `mint` field for creating/destroying tokens:

```
mint = {
  PolicyID1: { AssetName1: +100 },  // Mint 100 tokens
  PolicyID2: { AssetName2: -50 }    // Burn 50 tokens
}
```

Positive values create tokens, negative values burn them. The ledger validates minting against the policy scripts.

</details>

---

## Next Steps

Ready to build with tokens? Check out [Minting Native Tokens](/docs/build/native-tokens/overview) for practical guides on creating your own tokens and [Minting NFTs](/docs/build/native-tokens/minting-nfts) for non-fungible tokens. Learn about metadata standards in the [Token Registry](/docs/build/native-tokens/token-registry/cardano-token-registry-overview), or explore [Smart Contracts](/docs/build/smart-contracts/overview) for advanced minting policies. To understand the foundation of how tokens work, read about the [EUTXO Model](/docs/learn/core-concepts/eutxo).
