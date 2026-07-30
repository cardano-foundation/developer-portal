---
id: locked-value
title: Locked Value
sidebar_label: Locked value
description: "The locked-value vulnerability: a design that permanently traps funds in a UTXO with no way to recover them."
---

> Adapted from [Mesh's Bad Contracts](https://github.com/MeshJS/mesh).

**Locked value** is a design where funds become permanently stuck in a UTXO with no way to spend them, the on-chain equivalent of burning them, so the value leaves circulation for good.

Sometimes this is intentional: an untamperable UTXO can serve as a single, provable source of truth that no one, including its creator, can alter. The question is whether the value it traps is worth that guarantee. In the [Plutus NFT example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft/locked-value) only about 2 ADA stays locked in the oracle UTXO, so there it is an acceptable tradeoff rather than a severe bug.

Weigh the economics before adopting a design that locks value: how much is trapped, and what the permanence buys you.

## Code examples

- [Mesh: Locked Value Example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft/locked-value)
