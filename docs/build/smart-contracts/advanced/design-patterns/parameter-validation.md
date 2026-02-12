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

```haskell
-- Check that a specific UTxO was spent in the transaction.
oneShotValidate :: TxOutRef -> ScriptContext -> ()
oneShotValidate oref ctx = any (\input -> txInInfoOutRef input == oref) inputs 
  where
    txInfo = scriptContextTxInfo ctx
    inputs = txInfoInputs txInfo 
```

To determine that a `CurrencySymbol`, for instance `scriptHashToCheck`, is derived from the result of applying a given `TxOutRef` to the `oneShotValidate` script (and thus must be a fixed-supply token):

```haskell
let plutusVersion = 3
    versionHeader = integerToByteString True 1 plutusVersion
    scriptHeader = versionHeader <> prefix <> param
    final_res = scriptHeader <> postfix
in hash final_res == scriptHashToCheck
```

Where `param` is `serialiseData TX_OUT_REF_PARAM`, `prefix` is the cbor script bytes of `oneShotValidator` before the argument, and `postfix` is the cbor script bytes of the `oneShotValidator` after the argument.

Parameterized scripts used in this design pattern should have the form:

```haskell
[ (lam x …) PARAMHERE]
```

So that if the param is used multiple times it doesn't need to be spliced in everywhere.

Given a plutus script that accepts parameters (in the above example, a `TxOutRef`), with this design pattern you can verify onchain that a given script hash is an instance of that script with a specific parameter applied.

## Aiken Implementation

In some cases, validators need to be aware of instances of a parameterized script in order to have a more robust control over the flow of assets.

As a simple example, consider a minting script that needs to ensure the destination of its tokens can only be instances of a specific spending script, e.g. parameterized by users' wallets.

Since each different wallet leads to a different script address, without verifying instances, instances can only be seen as arbitrary scripts from the minting script's point of view.

This can be resolved by validating an instance is the result of applying specific parameters to a given parameterized script.

### Requirements

To allow this validation on-chain, some restrictions are needed:

1. Parameters of the script must have constant lengths, which can be achieved by having them hashed
2. Consequently, for each transaction, the resolved value of those parameters must be provided through the redeemer
3. The dependent script must be provided with CBOR bytes of instances before and after the parameter(s)
4. Wrapping of instances' logics in an outer function so that there'll be single occurances of each parameter

### Library Functions

This pattern provides two sets of functions:

1. One for applying parameter(s) in the dependent script (i.e. the minting script in the example above)
2. One for wrapping your parameterized scripts with

After defining your parameterized scripts, you'll need to generate instances of them with dummy data in order to obtain the required `prefix` and `postfix` values for your target script to utilize.

## Examples and Implementation

Full working example: [parameter-validation.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/validators/examples/parameter-validation.ak)

Library implementation: [parameter_validation module](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/parameter-validation.ak)

## Considerations

This design pattern only works under the assumption that the parameter is constant size (this holds true for `TxOutRef`). If a script accepts parameters with dynamic size (ie. arbitrary size integer / bytestring) then to use it with this design pattern you should modify the parameter to be the hash of the original parameter, and then allow the pre-image to be provided in the tx and verify that it matches the hash.

If you found this design pattern useful, please consider supporting the [builtinApplyParams CIP](https://github.com/cardano-foundation/CIPs/pull/934) which proposes the introduction of a new builtin that would make this pattern much more accessible and robust.
