---
id: overview
title: Vulnerability reference
sidebar_label: Vulnerability reference
description: "A reference of Cardano smart contract vulnerabilities, organized into four deep dives and four classes, each entry with its identifier, property statement, and remediation."
---

This is the reference half of [Smart Contract Security](/docs/developers/curriculum/smart-contracts/security), which teaches what the eUTXO model protects you from and what it leaves to you. Here every failure is written up in full, so you can look one up while building or work through them while auditing.

Most entries carry an **identifier**, a **property statement** (what must hold for the protocol to be safe), a **test** that demonstrates the failure, and its **impact**. The identifiers are stable and are what audit reports cite.

## Four deep dives

These come up most often, are the most subtle to get right, and each is a page of its own.

| Vulnerability | Identifier | Description |
|---|---|---|
| [Double Satisfaction](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/double-satisfaction) | `double-satisfaction` | Multiple UTxOs in one transaction, each validator sees the same outputs, so one payment satisfies all of them |
| [Missing UTxO Authentication](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/missing-utxo-authentication) | `missing-utxo-authentication` | Anyone can create UTxOs at script addresses, so without authentication you cannot tell legitimate from fake |
| [Time Handling](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/time-handling) | `time-handling` | Validators only see time intervals, not exact timestamps, and incorrect bound handling enables time manipulation |
| [Token Security](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/token-security) | `token-security` | Native tokens, validation tokens, dust attacks, and execution limit exploits |

## Four classes

The rest group into four classes. Reading a class start to finish beats reading its entries separately: within a class the failures share a mechanism, and usually a defense.

### [Resource exhaustion](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion)

Something unbounded grows past a ledger limit, or many actors compete for one UTXO. Value stops being spendable, or the protocol stops making progress.

| Vulnerability | Identifier | Description |
|---|---|---|
| [Unbounded Value](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion#unbounded-value) | `unbounded-value` | Unlimited tokens in a UTxO cause size and execution limit failures, and funds become unspendable |
| [Unbounded Datum](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion#unbounded-datum) | `unbounded-datum` | A datum growing without limits eventually exceeds resource constraints |
| [Unbounded Inputs](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion#unbounded-inputs) | `unbounded-inputs` | Too many UTxOs required simultaneously hits transaction size and resource limits |
| [Cheap Spam](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion#cheap-spam) | `cheap-spam` | Low-cost spam actions stall legitimate protocol operations |
| [UTxO Contention](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion#utxo-contention) | `utxo-contention` | Shared global state creates contention when multiple users need the same UTxO |

### [Unchecked inputs](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs)

The validator trusted something the transaction author chose. Anything it does not explicitly check is an attacker's free choice.

| Vulnerability | Identifier | Description |
|---|---|---|
| [Arbitrary Datum](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#arbitrary-datum) | `arbitrary-datum` | Not validating a datum when locking allows invalid data that causes spend failures |
| [Other Redeemer](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#other-redeemer) | `other-redeemer` | Logic expecting a specific redeemer is bypassed by using a different redeemer on the same script |
| [Other Token Name](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#other-token-name) | `other-token-name` | Minting policies not checking all token names allow unintended tokens under the same policy ID |
| [Missed Input](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#missed-input-validation) | `missed-input` | A redeemer index not bound to the spent input lets an unvalidated input slip past a global validator |
| [Signature Domain Separation](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/unchecked-inputs#missing-signature-domain-separation) | `signature-domain-separation` | Off-chain signatures without a domain separator or nonce replay across protocols or repeatedly |

### [Staking and certificates](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/staking-and-certificates)

An address has two credentials. A validator that governs only the payment half leaves the staking half open.

| Vulnerability | Identifier | Description |
|---|---|---|
| [Insufficient Staking Control](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/staking-and-certificates#insufficient-staking-control) | `insufficient-staking-control` | Missing staking credential checks allow reward redirection, franken addresses, and stake-key spoofing |
| [Certificate Deregistration](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/staking-and-certificates#unconstrained-certificate-operations) | `certificate-deregistration` | An unguarded staking-script certificate path lets anyone deregister the credential and halt a withdraw-zero protocol |

### [Evaluation and grinding](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/evaluation-and-grinding)

Determinism makes validation predictable for you and for an attacker, who can work out in advance which checks will run and what a hash will come out to.

| Vulnerability | Identifier | Description |
|---|---|---|
| [Evaluation Order](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/evaluation-and-grinding#lazy-evaluation-traps) | `evaluation-order` | Short-circuiting boolean operators can skip a required check or a deferred failure |
| [Hash Grinding](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/evaluation-and-grinding#hash-grinding-on-ordering) | `hash-grinding` | Author-influenced on-chain hashes are grindable, biasing placement or selection |

## Practice

Attack these yourself in the **[Cardano CTF](/docs/developers/curriculum/smart-contracts/security/ctf)**, an interactive security game where you exploit vulnerable contracts.

## Sources

Reference material:
- **[MLabs](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)** - Formal vulnerability framework
- **[Invariant0](https://medium.com/@invariant0)** - In-depth security analysis
- **[Mesh](https://github.com/MeshJS/mesh)** - Code examples
