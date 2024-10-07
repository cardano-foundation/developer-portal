---
id: plu-ts
title: plu-ts
sidebar_label: plu-ts
description: plu-ts
image: /img/plu_ts-logo.svg
--- 

## Introduction

[`plu-ts`](https://github.com/HarmonicLabs/plu-ts) is a Typescript-embedded programming language and library for developing smart contracts on the Cardano blockchain. It is designed for smart contract efficiency while staying as close as possible to the Typescript syntax. 

The tool is composed by the eDSL that allows you to create smart contracts and compile them; and an off-chain library that introduces all the types required to interact with the Cardano ledger and create transactions.

## Getting started

Visit the [Get started with plu-ts](/docs/get-started/plu-ts) to install `plu-ts` using `npm` and set up your project.

You can find the documentation for `plu-ts` at [pluts.harmoniclabs.tech](https://pluts.harmoniclabs.tech/).

If you need help feel free to open issues at the [`plu-ts` git repository](https://github.com/HarmonicLabs/plu-ts).


### Example contract

some example projects can be found [in the `plu-ts` documentation](https://pluts.harmoniclabs.tech/category/examples);

here we report the `Hello plu-ts` contract; to see how it works you can follow [the example project](https://pluts.harmoniclabs.tech/examples/Hello_world_v0).

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

## Links
- [`plu-ts` documentation](https://pluts.harmoniclabs.tech/#introduction)
- [`plu-ts` Github Repository](https://github.com/HarmonicLabs/plu-ts).

