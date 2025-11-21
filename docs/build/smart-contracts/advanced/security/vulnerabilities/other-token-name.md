---
id: other-token-name
title: Other Token Name
sidebar_label: Other Token Name
aliases: ["Infinite Mint"]
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

## 2. Other token name

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

```rust
myPolicy par red ctx = do
  …
  assetClassValueOf txInfoMint ownAssetClass == someQuantity
  …
```

Note that on Cardano, a token is defined by its asset class, which consists of two parts: the currency symbol and the token name. The currency symbol is the hash of the minting policy containing the rules controlling the minting and burning of the token. The token name can be any string with a maximum length of 32 bytes.

The above minting policy checks that a specific asset class is found within the value minted by the transaction. If we were to trust that the minting policy is controlling that only someQuantity of tokens with the currency symbol controlled by the minting policy ('own' currency symbol) are being minted, we would be making a big mistake. This is because the minting policy is only checking that someQuantity of tokens with 'own' currency symbol and a specific token name are being minted, but nothing is checked for other token names. Therefore, someone could maliciously mint a token with a different token name and use it, for instance, to impersonate the owner of the legit token.

The most straight-forward coding pattern to use in order to prevent such a vulnerability can be observed in the following excerpt:

```rust
myPolicy rmr ctx = do
  …
  txInfoMint == (assetClassValue ownAssetClass someQuantity)
 …
```

The fixed minting policy checks that only someQuantity of tokens are being minted, and all of them have the same asset class. Of course, this might be too restrictive if tokens with other currency symbols need to be minted in the same transaction. If this is the case, a slightly more complex solution will be needed.

---

## Related: Infinite Mint

> From [Mesh Bad Contracts](https://github.com/MeshJS/mesh)

Infinite mint is a vulnerability where there is no strict restriction on minting a particular policy where malicious players can mint more than desired tokens from one transaction. Normally it comes from when the validator checks against whether a particular token has been minted without strictly prohibiting other tokens from minting. This vulnerability is dangerous when a complex application relies on certain policy ID for authentication, while malicious players can produce uncontrolled circulation of token with that policy ID, leading to complex hacking scenarios causing loss of funds.

### Code Examples

- [Mesh: Infinite Mint Example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/giftcard/infinite-mint)
