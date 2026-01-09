---
id: pallas
title: Pallas - Rust Primitives for Cardano
sidebar_label: Pallas
description: Rust-native building blocks for the Cardano blockchain ecosystem.
image: /img/og/og-developer-portal.png
---

![Pallas](/img/get-started/pallas-logo.svg)

## Introduction

Pallas is a collection of Rust modules that re-implement common Ouroboros and Cardano logic in native Rust. Rather than providing a specific application, Pallas serves as a foundational layer for building higher-level use cases like explorers, wallets, and potentially even full nodes.

The library is organized as a Cargo workspace where each building block lives in its own crate. The root `pallas` crate serves as an all-in-one dependency that re-exports all modules in a hierarchical structure, with Cargo features to customize the setup for your specific needs.

:::tip Looking for a transaction builder?
Pallas provides low-level primitives for building custom tooling. If you need a higher-level SDK for transaction building in Rust, check out [Whisky](/docs/get-started/client-sdks/rust/whisky), which uses Pallas internally via its `WhiskyPallas` serializer backend.
:::

## Key Components

### Core

- **pallas-codec** - CBOR encoding and decoding using the minicbor library
- **pallas-crypto** - Cryptographic primitives
- **pallas-math** - Mathematical functions

### Network

- **pallas-network** - Network stack with multiplexer and mini-protocol implementations

### Ledger

- **pallas-primitives** - Ledger primitives and CBOR codec for different Cardano eras
- **pallas-traverse** - Utilities for traversing multi-era block data
- **pallas-addresses** - Encode and decode Cardano addresses of any type

### Transaction Builder

- **pallas-txbuilder** - Ergonomic transaction builder

### Interoperability

- **pallas-hardano** - Interoperability with Haskell Cardano node artifacts
- **pallas-utxorpc** - Interoperability with the UTxO RPC specification

## Getting Started

Pallas is designed for developers who need low-level access to Cardano functionality in Rust. You can include specific components based on your needs using Cargo features, or include the entire suite for comprehensive functionality.

:::tip
For complete documentation, examples, and the latest updates, visit the [Pallas GitHub repository](https://github.com/txpipe/pallas).
:::

## Resources

- [GitHub Repository](https://github.com/txpipe/pallas)
- [Crates.io](https://crates.io/crates/pallas)
