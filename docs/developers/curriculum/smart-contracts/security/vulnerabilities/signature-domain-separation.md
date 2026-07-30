---
id: signature-domain-separation
title: Missing Signature Domain Separation
sidebar_label: Signature domain separation
description: "How off-chain signatures without a domain separator let an attacker replay a signed authorization across protocols or reuse it many times."
aliases: ["Signature Replay"]
---

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
