---
id: parameter-validation
title: Onchain Parameter Application
sidebar_label: Onchain Parameter Application
description: Check that a script hash is an instantiation of a unparameterised script.
---

## Introduction

When writing onchain code you might encounter a situation where you want to be able to check that a script hash is an instantiation of a unparameterised script.
It is common for smart contracts to accept parameters (e.g. fees, references to other scripts, magical numbers). Perhaps the most well known example of such a script is the
one-shot minting policy script, that enforces that the minting policy can only ever succeed once (ie. for NFTs, or fixed-supply fungible tokens).

```rust
-- Check that a specific UTxO was spent in the transaction.
oneShotValidate :: TxOutRef -> ScriptContext -> ()
oneShotValidate oref ctx = any (\input -> txInInfoOutRef input == oref) inputs 
  where
    txInfo = scriptContextTxInfo ctx
    inputs = txInfoInputs txInfo 
```

To determine that a `CurrencySymbol`, for instance `scriptHashToCheck`, is derived from the result of applying a given `TxOutRef` to the `oneShotValidate` script (and thus must be a fixed-supply token):

```rust
let plutusVersion = 3
    versionHeader = integerToByteString True 1 plutusVersion
    scriptHeader = versionHeader <> prefix <> param
    final_res = scriptHeader <> postfix
in hash final_res == scriptHashToCheck
```

Where `param` is `serialiseData TX_OUT_REF_PARAM`, `prefix` is the cbor script bytes of `oneShotValidator` before the argument, and `postfix` is the cbor script bytes of the `oneShotValidator` after the argument.

Parameterized scripts used in this design pattern should have the form:

```rust
[ (lam x …) PARAMHERE] 
```

So that if the param is used multiple times it doesn't need to be spliced in everywhere.

Given a plutus script that accepts parameters (in the above example, a `TxOutRef`), with this design pattern you can verify onchain that a given script hash is an instance of that script with a specific parameter applied.

## Examples and Implementation

We maintain a standard library that provides a high-level abstraction for onchain parameter validation and many other design patterns. You can explore the implementation of this design pattern in our [aiken-design-patterns](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/develop/lib/aiken-design-patterns/parameter-validation.ak) repository.

## Considerations

This design pattern only works under the assumption that the parameter is constant size (this holds true for `TxOutRef`). If a script accepts parameters with dynamic size (ie. arbitrary size integer / bytestring) then to use it with this
design pattern you should modify the parameter to be the hash of the original parameter, and then allow the pre-image to be provided in the tx and verify that it matches the hash.

If you found this design pattern useful, please consider supporting the [builtinApplyParams CIP](https://github.com/cardano-foundation/CIPs/pull/934) which proposes the introduction of a new builtin that would make this pattern much more accessible and robust.
