---
id: plinth
title: Plinth (Plutus Tx)
sidebar_label: Plinth (Haskell)
description: Haskell-based smart contract development for Cardano
image: /img/og/og-developer-portal.png
---

[**Plinth**](https://plutus.cardano.intersectmbo.org/docs/) is a subset of Haskell designed for writing smart contract validators on Cardano. As a high-level, purely functional language, Plinth leverages Haskell's powerful type system to help developers write secure, reliable, and deterministic on-chain code.

Plinth compiles to **Untyped Plutus Core (UPLC)**, the low-level lambda calculus language that actually executes on Cardano's blockchain. This architecture allows developers to write in familiar Haskell syntax while targeting Cardano's optimized execution environment.

## Language Architecture

The term "Plutus" has historically caused confusion by referring to multiple components. To clarify:

**Plinth** (formerly Plutus Tx) is the high-level Haskell subset you write code in. **Untyped Plutus Core (UPLC)** is the low-level execution language that runs on-chain. Plinth is one of several languages that compile to UPLC, alongside Aiken, [Plutarch](https://plutarch-plutus.org/), and others.

**Plinth focuses exclusively on on-chain validator scripts** that determine whether transactions can spend UTXOs, mint tokens, or perform other blockchain operations. For off-chain components like transaction building and wallet integration, you'll use standard Haskell libraries and tools.

## Getting Started

**Official Documentation:** Visit the **[Plinth User Guide](https://plutus.cardano.intersectmbo.org/docs/)** for comprehensive tutorials, language reference, and development guides.

**Prerequisites:** Plinth development requires familiarity with Haskell. If you're new to Haskell, consider starting with [Learn You a Haskell](http://learnyouahaskell.com/) or the [Haskell and Crypto Mongolia 2020](https://www.youtube.com/watch?v=ctfZ6DwFiPg&list=PLJ3w5xyG4JWmBVIigNBytJhvSSfZZzfTm&index=4) course.

## Resources

**Plutus Pioneer Program:** The [Plutus Pioneer Program](https://github.com/input-output-hk/plutus-pioneer-program) offers comprehensive training for Plinth development. The program includes interactive videos, exercises, and community support. Note that programming experience and familiarity with functional programming concepts are recommended.

**Plutus Project-Based Learning (PPBL):** [PPBL](https://app.andamio.io/course/4a79b279593a787b79da46df4dc34a3e59b003838dcf48a2f436094d) from Gimbalabs provides a hands-on approach to learning Cardano development with real projects.

**Development Platform:** [Demeter.run](https://demeter.run) offers a web-based development environment with Plutus starter kits and a free tier for experimentation.
