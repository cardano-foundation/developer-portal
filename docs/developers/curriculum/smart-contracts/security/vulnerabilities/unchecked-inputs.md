---
id: unchecked-inputs
title: Unchecked Inputs
sidebar_label: Unchecked inputs
description: "Five vulnerabilities from trusting data a validator never verified: arbitrary datums, other redeemers, other token names, inputs missed by a global validator, and unbound off-chain signatures."
---

A validator decides using data it is handed: a datum, a redeemer, a minted value, the set of inputs, sometimes a signature made off-chain. Each of those is chosen by whoever builds the transaction, so anything the validator does not explicitly check is something an attacker gets to choose freely. This class collects the five places that assumption is most often left implicit.

They run from the narrowest scope to the widest: one datum field, then the redeemer, then the value minted under a policy, then the whole input set, and finally a signature that was never bound to the protocol it authorizes.

## Arbitrary Datum

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `arbitrary-datum`

**Property statement:**
Correctness of the datum is checked for all legit UTxOs locked by the protocol.

**Test:**
A transaction can successfully lock in the protocol a legit UTxO with an arbitrary datum, making consumption in a second transaction fail.

**Impact:**

- Unspendable outputs
- Protocol halting

**Further explanation:**
It could be tempting to omit checks for the datum of an output being locked in a script when this datum is not going to be explicitly used in the validation of the future spending transaction. However, this is a dangerous practice as the type of the datum carried by a UTxO locked in a validator still needs to match the datum type expected by the validator. Otherwise, a transaction trying to consume the locked UTxO will fail, even if nothing was going to be checked about the information contained in the datum.

The length of a `ByteArray` field deserves the same suspicion. A credential, a key hash, or a script hash is exactly 28 bytes (Blake2b-224), but nothing forces that length on a raw `ByteArray` supplied in a datum or redeemer; it is a convention, not a type constraint. If a validator trusts such bytes as an address or key and must later build a required output paying to it, an attacker who sets the field to length 0 or an over-long value can make that output impossible to construct, permanently locking the UTxO. Validate the length of untrusted key and script hashes (`== 28`), prefer the typed `Credential` and `Address` types over raw bytes, and fail safely on malformed data.

## Other Redeemer

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `other-redeemer`

**Property statement:**
Logic under one script redeemer that relies on the logic enforced by another redeemer (either from the same script or from another one) explicitly requires the presence of the redeemer under which the intended logic exists.

**Test:**
A transaction can successfully avoid some checks by spending a UTxO or minting a token using a different redeemer than the one expected by the script.

**Impact:**
By-passing checks

**Further explanation:**
Suppose a simple staking protocol that allows users to lock a certain amount of token X and later on receive an ADA reward, which increases based on the amount of time tokens have been locked. This protocol consists of two validators, `globalValidator` and `positionsValidator`. The `globalValidator`'s mission is to lock an NFT that carries as datum the global state of the pool (e.g. how much token X has been staked in aggregate by all participants) as well as the rewards pool (ADA to be distributed to stakers) and the `positionsValidator`'s mission is to lock one UTxO per each participant, holding the user's bag of token X and carrying as datum a timestamp stating when was the last time that the position was updated.

To interact with the protocol, users can either open a position or update their position.

To reflect that, the validators have the following logic:

- `globalValidator` has one redeemer, `UpdateState`, which checks that a user's position is opened or updated correctly and that rewards are distributed correctly based on the user's stake size and timestamp, updating the global state accordingly.
- `positionsValidator` has one redeemer, `UpdatePosition`, which just checks that the NFT locked in `globalValidator` has been consumed, therefore deferring all the checking to the `globalValidator`.

Some time after, a new redeemer is added to `globalValidator` to allow anyone to add ADA to the rewards pool. This new redeemer, `AddRewards`, only verifies that the consumed UTxO is locked back in the same validator keeping the same datum, but with an increased amount of ADA.

By adding this new redeemer, a vulnerability has been introduced. This is because by consuming the UTxO locked in the `globalValidator` with the `AddRewards` redeemer, nothing is checked regarding the correct update of the user's position. Therefore, in the same transaction a user could freely update their position, for instance changing the timestamp to some time far away in the past. This would allow the user to, in a second transaction, fool the `globalValidator` to unlock a big chunk of the rewards pool.

In order to prevent this problem, the expected redeemers should be explicitly mentioned in the scripts wherever possible.

The same mistake appears across scripts, not just within one. Many protocols enforce that another script runs by referencing its hash: minting from a policy, withdrawing from a staking credential, or spending from a script hash. If a validator only checks that the other script executes but not **which redeemer constructor** it runs with, an attacker can trigger a permissive "cold" branch of that script (an admin path, a rewards-top-up path) that allows arbitrary minting, burning, or spending. The rule is the same in stronger form: do not infer which branch ran from ledger values that "must be true in that branch", assert the exact redeemer constructor of the script you are forwarding to.

## Other Token Name

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

### Related: Infinite Mint

> From [Mesh Bad Contracts](https://github.com/MeshJS/mesh)

Infinite mint is the same bug seen from the minting side: a policy that does not strictly bound what it mints lets an attacker mint more tokens than intended in a single transaction. It usually comes from a validator that checks *that* a particular token was minted without prohibiting other tokens under the same policy. It is dangerous when an application trusts a policy ID for authentication, because an attacker can then put an uncontrolled supply of that policy's tokens into circulation and use them to forge that trust.

#### Code examples

- [Mesh: Infinite Mint Example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/giftcard/infinite-mint)

## Missed Input Validation

> Concerns the utxo-indexer pattern documented by [Anastasia Labs design patterns](https://github.com/Anastasia-Labs/design-patterns).

**Identifier:** `missed-input`

**Property statement:**
Every script input is provably validated: each spend binds its redeemer index to its own output reference, and the global validator checks that the indices cover the complete set of relevant inputs.

**Test:**
A transaction spends a script input that is never referenced by the indexed validation, so its rules are never enforced.

**Impact:**

- Inputs spent without their validation running
- Value leaked from the protocol

**Further explanation:**
The **utxo-indexer** pattern makes global validation cheap. Instead of every input independently scanning the whole transaction (which is O(n²) as inputs grow), a single validator, a minting policy or a withdraw-zero staking script, validates the transaction once, and each spend input simply defers to it. The redeemer carries indices that pair each input to its corresponding output, so the global validator does O(1) lookups at the claimed positions rather than searching.

The pattern has two footguns, both variants of trusting the indices without binding them to reality:

- A spend validator that only checks "the global validator ran" (the staking script is present in the withdrawals, or the policy is in the mint field) without confirming that **its own input** is part of the index set the global validator processed. An attacker attaches an extra input at the same script address that the indices never reference. The global validator validates the inputs it was pointed at; the extra one rides along, spent with no rules enforced.
- A global validator that trusts the redeemer indices without checking they cover **every** relevant input, with no gaps, no duplicates, and a count that matches. Indices that quietly skip an input let that input escape validation.

This is closely related to [double satisfaction](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/double-satisfaction), where the pairing between inputs and outputs is what breaks. Prevent it by having each spend assert that its redeemer index points at its own output reference (using the script context's own-input information), and by having the global validator validate the complete input set, confirming that the input and output at each claimed index are really there.

## Missing Signature Domain Separation

> Demonstrated in the [Invariant0 Banking Series CTF](https://github.com/Invariant-0/cardano-ctf) (levels 11-13); see also the replay weakness documented in [CIP-8](https://cips.cardano.org/cip/CIP-8).

**Identifier:** `signature-domain-separation`

**Property statement:**
Every off-chain signature a validator accepts commits to who signed it, which protocol and instance it authorizes, and a value that is consumed on use, so a signature cannot be replayed against another key, another protocol, or the same protocol twice.

**Test:**
A transaction successfully authorizes an action with a signature that was produced for a different key, a different protocol or script instance, or that was already used in an earlier transaction.

**Impact:**

- Unauthorized withdrawals or state changes
- Cross-protocol and repeated replay of a single signed intent

**Further explanation:**
Some protocols accept an off-chain authorization: an account owner signs a message with their Ed25519 private key, shares it (by message, email, in person), and anyone holding it can submit a transaction that redeems it on-chain, where a validator checks the signature with `verify_ed25519_signature`. This is the "cheque" or meta-transaction pattern. Getting the signature check right means binding three things into the signed message, and each one is a separate way to get it wrong:

- **Whose signature is it?** Verifying that a signature is valid for a public key provided in the redeemer proves nothing if the attacker also chose the key. The signer's identity must be checked against something the attacker cannot control, such as the owner's key hash stored in the datum.
- **What is it for?** A message that carries only an amount is valid anywhere the same shape is accepted. Without a **domain separator**, a protocol identifier (script hash or policy id) and the network, the same signed intent replays across every protocol and every deployment that accepts it.
- **Can it be used twice?** A message with no unique, consumed element (a nonce, an incrementing id, an output reference, or an expiry) is a permanent pass: it can be redeemed repeatedly as long as the account has funds.

The Banking CTF walks these three failures in order: one level verifies the signature against an attacker-supplied key (identity not bound), the next omits any id or nonce (unlimited reuse), and the last adds an id but leaves it out of the signed message, so one signature is valid for any id. That last case is the subtle one: **every security-relevant field must be part of what is signed.** Checking a field that the signature does not cover authenticates nothing.

Prevent this by signing over the full tuple that defines the intent, a domain tag, the script or policy id, the network, the account, a unique nonce, and the amount, verifying the signer against the datum, and invalidating the nonce on-chain when the signature is used.
