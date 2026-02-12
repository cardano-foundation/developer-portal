---
id: overview
title: Smart Contract Vulnerabilities
sidebar_label: Overview
description: Common Cardano smart contract vulnerabilities - a reference database for dApp developers.
---

A standardized database of common Cardano smart contract vulnerabilities. Use this as a reference when building and auditing dApps.

## Vulnerability Database

| Vulnerability | Identifier | Description |
|---------------|------------|-------------|
| [Double Satisfaction](vulnerabilities/double-satisfaction) | `double-satisfaction` | Multiple UTxOs in one transaction - each validator sees the same outputs, so one payment satisfies all of them |
| [Missing UTxO Authentication](vulnerabilities/missing-utxo-authentication) | `missing-utxo-authentication` | Anyone can create UTxOs at script addresses - without authentication (validity tokens), can't distinguish legitimate from fake |
| [Time Handling](vulnerabilities/time-handling) | `time-handling` | Validators only see time intervals, not exact timestamps - incorrect bound handling enables time manipulation |
| [Token Security](vulnerabilities/token-security) | `token-security` | Native tokens, validation tokens, dust attacks, and execution limit exploits |
| [Unbounded Value](vulnerabilities/unbounded-value) | `unbounded-value` | Unlimited tokens in UTxO cause size/execution limit failures - funds become unspendable |
| [Unbounded Datum](vulnerabilities/unbounded-datum) | `unbounded-datum` | Datum growing without limits eventually exceeds resource constraints |
| [Unbounded Inputs](vulnerabilities/unbounded-inputs) | `unbounded-inputs` | Too many UTxOs required simultaneously hits transaction size/resource limits |
| [Other Redeemer](vulnerabilities/other-redeemer) | `other-redeemer` | Logic expecting specific redeemer bypassed by using different redeemer on same script |
| [Other Token Name](vulnerabilities/other-token-name) | `other-token-name` | Minting policies not checking all token names allow unintended tokens under same policy ID |
| [Arbitrary Datum](vulnerabilities/arbitrary-datum) | `arbitrary-datum` | Not validating datum when locking allows invalid data causing spend failures |
| [UTxO Contention](vulnerabilities/utxo-contention) | `utxo-contention` | Shared global state creates contention when multiple users access same UTxO |
| [Cheap Spam](vulnerabilities/cheap-spam) | `cheap-spam` | Low-cost spam actions stall legitimate protocol operations |
| [Insufficient Staking Control](vulnerabilities/insufficient-staking-control) | `insufficient-staking-control` | Missing staking credential checks allow reward redirection |
| [Locked Value](vulnerabilities/locked-value) | `locked-value` | Permanent value locking - consider economic tradeoffs |

## Learn By Doing

**[Cardano CTF](ctf)** - Interactive security game where you exploit vulnerable contracts.

## Sources

Content for reference:
- **[MLabs](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)** - Formal vulnerability framework
- **[Invariant0](https://medium.com/@invariant0)** - In-depth security analysis
- **[Mesh](https://github.com/MeshJS/mesh)** - Code examples
