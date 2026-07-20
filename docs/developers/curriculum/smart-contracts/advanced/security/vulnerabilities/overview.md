---
id: overview
title: Vulnerability reference
sidebar_label: Vulnerability reference
description: A reference catalog of common Cardano smart contract vulnerabilities, each linking to a deep dive, for developers building and auditing validators.
---

A catalog of common Cardano smart contract vulnerabilities, each linking to a deep dive. Use it as a reference when building and auditing dApps. For the conceptual overview, what the eUTXO model protects you from and the patterns that keep validators safe, start with [Smart Contract Security](/docs/developers/curriculum/smart-contracts/security).

## Vulnerability catalog

| Vulnerability | Identifier | Description |
|---------------|------------|-------------|
| [Double Satisfaction](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/double-satisfaction) | `double-satisfaction` | Multiple UTxOs in one transaction - each validator sees the same outputs, so one payment satisfies all of them |
| [Missing UTxO Authentication](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/missing-utxo-authentication) | `missing-utxo-authentication` | Anyone can create UTxOs at script addresses - without authentication (validity tokens), can't distinguish legitimate from fake |
| [Time Handling](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/time-handling) | `time-handling` | Validators only see time intervals, not exact timestamps - incorrect bound handling enables time manipulation |
| [Token Security](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/token-security) | `token-security` | Native tokens, validation tokens, dust attacks, and execution limit exploits |
| [Unbounded Value](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/unbounded-value) | `unbounded-value` | Unlimited tokens in UTxO cause size/execution limit failures - funds become unspendable |
| [Unbounded Datum](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/unbounded-datum) | `unbounded-datum` | Datum growing without limits eventually exceeds resource constraints |
| [Unbounded Inputs](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/unbounded-inputs) | `unbounded-inputs` | Too many UTxOs required simultaneously hits transaction size/resource limits |
| [Other Redeemer](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/other-redeemer) | `other-redeemer` | Logic expecting specific redeemer bypassed by using different redeemer on same script |
| [Other Token Name](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/other-token-name) | `other-token-name` | Minting policies not checking all token names allow unintended tokens under same policy ID |
| [Arbitrary Datum](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/arbitrary-datum) | `arbitrary-datum` | Not validating datum when locking allows invalid data causing spend failures |
| [UTxO Contention](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/utxo-contention) | `utxo-contention` | Shared global state creates contention when multiple users access same UTxO |
| [Cheap Spam](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/cheap-spam) | `cheap-spam` | Low-cost spam actions stall legitimate protocol operations |
| [Insufficient Staking Control](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/insufficient-staking-control) | `insufficient-staking-control` | Missing staking credential checks allow reward redirection, franken addresses, and stake-key spoofing |
| [Signature Domain Separation](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/signature-domain-separation) | `signature-domain-separation` | Off-chain signatures without a domain separator or nonce replay across protocols or repeatedly |
| [Certificate Deregistration](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/certificate-deregistration) | `certificate-deregistration` | An unguarded staking-script certificate path lets anyone deregister the credential and halt a withdraw-zero protocol |
| [Missed Input](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/missed-input) | `missed-input` | A redeemer index not bound to the spent input lets an unvalidated input slip past a global validator |
| [Locked Value](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/locked-value) | `locked-value` | Permanent value locking - consider economic tradeoffs |
| [Hash Grinding](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/hash-grinding) | `hash-grinding` | Author-influenced on-chain hashes are grindable, biasing placement or selection (advanced) |
| [Evaluation Order](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/evaluation-order) | `evaluation-order` | Short-circuiting boolean operators can skip a required check or a deferred failure (advanced) |

## Practice

Attack these yourself in the **[Cardano CTF](/docs/developers/curriculum/smart-contracts/advanced/security/ctf)**, an interactive security game where you exploit vulnerable contracts.

## Sources

Reference material:
- **[MLabs](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)** - Formal vulnerability framework
- **[Invariant0](https://medium.com/@invariant0)** - In-depth security analysis
- **[Mesh](https://github.com/MeshJS/mesh)** - Code examples
