---
id: overview
title: Advanced Smart Contracts
sidebar_label: Overview
description: "The advanced shelf for Cardano validators: design patterns, compilation and debugging, optimization, and the cryptographic primitives Plutus exposes."
---

You can write, test, and secure a validator. Everything here is what you reach for after that, when a contract has to be cheaper, larger, more composable, or has to prove something rather than check it.

This is a reference shelf, not a sequential read. Nothing below is a prerequisite for anything else, so come back to a page when you hit the problem it solves.

## What is here

- **[Design patterns](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/overview)**: the reusable architectures the ecosystem has converged on, including the withdraw-zero trick for running shared validation once per transaction and on-chain structures (linked lists, tries, Merkle trees) for state too large to sit in one UTXO.
- **[UPLC](/docs/developers/curriculum/smart-contracts/advanced/uplc)**: the untyped lambda calculus every Cardano language compiles down to. Read this when you want to know what your code actually becomes.
- **[Debug CBOR](/docs/developers/curriculum/smart-contracts/advanced/debug-cbor)**: decoding the binary encoding that datums, redeemers, and scripts travel in, which is how you diagnose a mismatch the compiler cannot see.
- **[Contract optimization](/docs/developers/curriculum/smart-contracts/advanced/optimization)**: benchmarking first, then the techniques that cut execution units, grouped by the kind of saving they make.
- **[Zero-knowledge proofs](/docs/developers/curriculum/smart-contracts/advanced/zero-knowledge)**: verifying a computation on-chain without re-running it or revealing its inputs.
- **[BLS signatures, VRFs and credentials](/docs/developers/curriculum/smart-contracts/advanced/bls-primitives)**: the BLS12-381 builtins as a construction kit for aggregated signatures, verifiable randomness, and selective-disclosure credentials.

Security has its own section rather than living here: the [vulnerability reference](/docs/developers/curriculum/smart-contracts/security/vulnerabilities/overview) and the [CTF](/docs/developers/curriculum/smart-contracts/security/ctf) are things every contract author needs, not advanced material.

## Next steps

- [Design patterns](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/overview) is the most broadly useful page here, and the one to read even if you have no specific problem yet
- [Build a dApp](/docs/developers/curriculum/dapps/overview): the next module, where these contracts meet users
