---
id: plu-ts
title: Plu-ts
sidebar_label: Plu-ts (Typescript)
description: Plu-ts
image: /img/plu_ts-logo.svg
--- 

## Introduction

[`Plu-ts`](https://github.com/HarmonicLabs/plu-ts) is a Typescript-embedded programming language and library for developing smart contracts on the Cardano blockchain. It is designed for smart contract efficiency while staying as close as possible to the Typescript syntax.

The tool is composed by the eDSL that allows you to create smart contracts and compile them; and an off-chain library that introduces all the types required to interact with the Cardano ledger and create transactions.

## Getting started

To get started with `plu-ts`, you can install it using `npm` and set up your project following the instructions in the [`plu-ts` documentation](https://pluts.harmoniclabs.tech/).

You can find the documentation for `plu-ts` at [pluts.harmoniclabs.tech](https://pluts.harmoniclabs.tech/).

If you need help feel free to open issues at the [`plu-ts` git repository](https://github.com/HarmonicLabs/plu-ts).

### Example contract

Some example projects can be found [in the `plu-ts` documentation](https://pluts.harmoniclabs.tech/category/examples);

Here we report the `Hello plu-ts` contract; to see how it works you can follow [the example project](https://pluts.harmoniclabs.tech/examples/Hello_world_v0).

```ts
import { bool, compile, makeValidator, PaymentCredentials, pBool, pfn, Script, ScriptType, PScriptContext, bs, PPubKeyHash } from "@harmoniclabs/plu-ts";

const contract = pfn([
    PPubKeyHash.type,
    bs,
    PScriptContext.type
],  bool)
(( owner, message, ctx ) => {

    const isBeingPolite = message.eq("Hello plu-ts");

    const signedByOwner = ctx.tx.signatories.some( owner.eqTerm );

    return isBeingPolite.and( signedByOwner );
});

// all validators must be untyped once on-chain
export const untypedValidator = makeValidator( contract );

// here we get the raw bytes of the contract
export const compiledContract = compile( untypedValidator );

// the `script` object can be used offchain
export const script = new Script(
    ScriptType.PlutusV2,
    compiledContract
);
```

## Resources

- [`Plu-ts` Documentation](https://pluts.harmoniclabs.tech/#introduction)
- [`Plu-ts` Github Repository](https://github.com/HarmonicLabs/plu-ts).
