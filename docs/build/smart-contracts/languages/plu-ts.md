---
id: plu-ts
title: Pebble
sidebar_label: Pebble (Typecript)
description: Pebble - A strongly-typed domain-specific language for writing Cardano smart contracts
image: /img/plu_ts-logo.svg
---

## Introduction

[**Pebble**](https://pluts.harmoniclabs.tech/) is a strongly-typed domain-specific language (DSL) for writing Cardano smart contracts. A simple, yet rock solid, functional language with an imperative bias, targeting UPLC.

At its heart, Pebble is:

- A language: with its own parser, type checker, and compiler.
- A toolchain: including a CLI, compiler, and integrations for DApp workflows.
- A bridge: between human-readable smart contract code and low-level Plutus Core.

Pebble is statement-oriented (with constructs like let, if, while, match, return), but under the hood, everything still compiles down to Plutus Core expressions, maintaining full functional correctness.

This makes Pebble feel familiar for developers coming from JavaScript, TypeScript, Rust, or Solidity, while retaining the strict guarantees of Plutus.

To sum it all up, pebble is a first-class language with its own syntax and compiler, but still exposes onchain/offchain type ecosystems for contract and DApp integrations.

## Getting started

To get started with Pebble, you can install it using `npm` and set up your project following the instructions in the [Pebble documentation](https://pluts.harmoniclabs.tech/).

### Example contract

Example projects can be found in the [Pebble documentation examples section](https://pluts.harmoniclabs.tech/category/examples).

Below is the `Hello Pebble` contract:

```ts
istruct HelloWorldDatum {
    owner: bytes
}

contract HelloWorld
{
    spend helloWorld(
        inputIdx: int,
        message: bytes
    ) {
        const { tx, spendingRef } = context;

        const { resolved: spendingInput, ref: inputSpendingRef } = tx.inputs[inputIdx];

        assert inputSpendingRef === spendingRef;

        const InlineDatum{ datum: { owner } as HelloWorldDatum } = spendingInput.datum;

        assert tx.requiredSigners.includes( owner );

        assert message === "Hello pebble";
    }
}
```
