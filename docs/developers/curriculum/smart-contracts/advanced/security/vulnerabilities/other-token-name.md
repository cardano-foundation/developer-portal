---
id: other-token-name
title: Other Token Name
sidebar_label: Other token name
description: "How the other token name vulnerability allows unauthorized token minting through unvalidated policy scripts."
aliases: ["Infinite Mint"]
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `other-token-name`

**Property statement:**
A minting policy checks that the total value minted of its 'own' currency symbol does not include unintended token names.

**Test:**
A transaction can successfully mint a token with token name different than the intended one.

**Impacts:**

- Leaking protocol tokens
- Unauthorised protocol actions

**Further explanation:**
A common coding pattern that introduces such a vulnerability can be observed in the following excerpt:

```haskell
myPolicy par red ctx = do
  ...
  assetClassValueOf txInfoMint ownAssetClass == someQuantity
  ...
```

Note that on Cardano, a token is defined by its asset class, which consists of two parts: the currency symbol and the token name. The currency symbol is the hash of the minting policy containing the rules controlling the minting and burning of the token. The token name can be any string with a maximum length of 32 bytes.

The above minting policy checks that a specific asset class is found within the value minted by the transaction. Trusting that the minting policy is controlling that only someQuantity of tokens with the currency symbol controlled by the minting policy ('own' currency symbol) are being minted would be a big mistake. This is because the minting policy is only checking that someQuantity of tokens with 'own' currency symbol and a specific token name are being minted, but nothing is checked for other token names. Therefore, someone could maliciously mint a token with a different token name and use it, for instance, to impersonate the owner of the legit token.

The most straight-forward coding pattern to use in order to prevent such a vulnerability can be observed in the following excerpt:

```haskell
myPolicy rmr ctx = do
  ...
  txInfoMint == (assetClassValue ownAssetClass someQuantity)
  ...
```

The fixed minting policy checks that only someQuantity of tokens are being minted, and all of them have the same asset class. Of course, this might be too restrictive if tokens with other currency symbols need to be minted in the same transaction. If this is the case, a slightly more complex solution will be needed.

---

## Related: Infinite Mint

> From [Mesh Bad Contracts](https://github.com/MeshJS/mesh)

Infinite mint is the same bug seen from the minting side: a policy that does not strictly bound what it mints lets an attacker mint more tokens than intended in a single transaction. It usually comes from a validator that checks *that* a particular token was minted without prohibiting other tokens under the same policy. It is dangerous when an application trusts a policy ID for authentication, because an attacker can then put an uncontrolled supply of that policy's tokens into circulation and use them to forge that trust.

### Code examples

- [Mesh: Infinite Mint Example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/giftcard/infinite-mint)
