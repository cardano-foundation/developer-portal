---
id: arbitrary-datum
title: Arbitrary Datum
sidebar_label: Arbitrary datum
description: "How the arbitrary datum vulnerability allows unexpected datum values to bypass smart contract validation."
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

## 3. Arbitrary datum

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
