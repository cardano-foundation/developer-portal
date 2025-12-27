---
id: locked-value
title: Locked Value
sidebar_label: Locked Value
---

> From [Mesh Bad Contracts](https://github.com/MeshJS/mesh)

Locked value is a design where the application would cause permanent lock of value alike burning value permenantly. It will cause loss of fund and value circulation. However, in some scenarios it might be a intented behaviour to produce umtamperable utxos to serve as single proven source of truth for apps. One should consider the economics and tradeoff against the design choice. In the plutus nft example, locked value vulnerability is not considered as severe since only around 2 ADA would be permenantly lock in oracle.

## Code Examples

- [Mesh: Locked Value Example](https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src/plutus-nft/locked-value)
