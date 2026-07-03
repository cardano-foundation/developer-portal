---
id: certificate-deregistration
title: Unconstrained Certificate Operations
sidebar_label: Certificate deregistration
description: "How an unguarded staking-script certificate path lets an attacker deregister the credential, claim its deposit, and halt a withdraw-zero protocol."
---

> Concerns the withdraw-zero pattern documented by [Anastasia Labs design patterns](https://github.com/Anastasia-Labs/design-patterns/blob/main/stake-validator/STAKE-VALIDATOR.md) and [CIP-112](https://cips.cardano.org/cip/CIP-112).

**Identifier:** `certificate-deregistration`

**Property statement:**
A staking script explicitly handles its certificate (registration and deregistration) operations, denying by default any it does not intend to allow.

**Test:**
A transaction submitted by an unrelated party successfully deregisters the protocol's staking credential.

**Impact:**

- Protocol liveness halted until re-registration
- Repeatable griefing plus theft of the refunded key deposit

**Further explanation:**
Many protocols centralize validation with the **withdraw-zero** pattern: instead of each input re-running the same expensive checks, the spend validators only require that a specific staking script executes in the transaction, and the real logic runs once in that staking script. A staking script executes when the transaction includes a withdrawal from its reward account, even a withdrawal of zero, which is why the pattern is cheap. It has a precondition, though: the stake credential must be **registered**, or the zero withdrawal fails phase-1 validation.

A staking script runs for more than withdrawals. Registering or deregistering its credential also invokes it, under its certifying (`publish`) purpose. If the script does not constrain that purpose, for example a catch-all fallback that returns success for any operation it did not explicitly consider, then anyone can submit a deregistration certificate for the credential and the script will approve it.

Deregistration does two things: it refunds the key deposit (2 ADA on mainnet) to whoever submitted the certificate, and it removes the credential. Every subsequent protocol transaction that relies on the withdraw-zero withdrawal now fails, because it withdraws from a reward account that no longer exists, until someone re-registers the credential and pays the 2 ADA deposit again. An attacker can repeat this, turning it into a cheap, repeatable denial of service with a small profit on each round.

Aiken's default is protective here: a validator with no fallback handler rejects any purpose it does not explicitly handle, so an unhandled certificate operation is denied. The vulnerability appears when a developer adds a permissive `else` that succeeds, or writes a `publish` handler that does not guard which certificate is being posted. Prevent it by handling the certificate purpose explicitly and denying deregistration unless the protocol genuinely intends to allow it, and by not making liveness depend on a single credential that anyone can deregister.
