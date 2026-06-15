---
id: parameter-validation
title: On-Chain Parameter Validation
sidebar_label: On-Chain Parameter Validation
description: Check that a script hash is an instantiation of a unparameterised script.
---

## Introduction

When writing onchain code you might encounter a situation where you want to be able to check that a script hash is an instantiation of a unparameterised script.
It is common for smart contracts to accept parameters (e.g. fees, references to other scripts, magical numbers). Perhaps the most well known example of such a script is the
one-shot minting policy script, that enforces that the minting policy can only ever succeed once (ie. for NFTs, or fixed-supply fungible tokens).

Given a plutus script that accepts parameters (such as a `TxOutRef`), with this design pattern you can verify onchain that a given script hash is an instance of that script with a specific parameter applied. It works by reconstructing the script hash from the serialised CBOR bytes before and after the parameter, and comparing it to the hash to check.

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

This pattern provides two sets of functions. One for applying parameter(s) in the dependent script (i.e. the minting script in the example above), and one for wrapping your parameterized scripts with.

After defining your parameterized scripts, you'll need to generate instances of them with dummy data in order to obtain the required `prefix` value for your target script to utilize. Note that your prefix should be from a single CBOR encoded result.

#### 1. Parameter Application Functions (for the dependent script)

Use these inside your contracts that depend on parameterized scripts. The parameter must be serialised before getting passed. It'll be hashed with `blake2b_224` before placement after `prefix`.

Note that your prefix should be from a single CBOR encoded result. And also, the `version` should either be 1, 2, or 3 depending on your script.

- **`apply_param(version, prefix, param)`** - Use this inside your contracts that depend on scripts with single parameters. The parameter must be serialised before getting passed here. It'll be hashed with `blake2b_224` before placement after `prefix`.
- **`apply_param_2(version, prefix, param_0, param_1)`** - Similar to `apply_param`, but for scripts with 2 parameters.
- **`apply_param_3(version, prefix, param_0, param_1, param_2)`** - Similar to `apply_param`, but for scripts with 3 parameters.
- **`apply_prehashed_param(version, prefix, param)`** - Similar to `apply_param`, but for scripts that their parameters don't need to be resolved (e.g. have a script hash as their parameter). Can be used for any hashing algorithms, i.e. the length of the provided hash does not matter (`prefix` covers it).
- **`apply_prehashed_param_2(version, prefix, param_0, param_1)`** - Similar to `apply_prehashed_param`, but for scripts with 2 parameters. Note that while the first parameter (`param_0`) can still be of any length, `blake2b_224` is the presumed hashing algorithm for the second parameter, i.e. the parameter is expected to be 28 bytes long.
- **`apply_prehashed_param_3(version, prefix, param_0, param_1, param_2)`** - Similar to `apply_prehashed_param`, but for scripts with 3 parameters. Here again the first parameter can be of arbitrary length, while the other two must be 28 bytes long.

All functions return a `ScriptHash`.

#### 2. Wrapper Functions (for the parameterized scripts)

Helper functions for parameterized scripts, which take care of validating resolved parameter hashes, and provide you with both the parameter and your custom redeemer.

**Key types:**

```aiken
/// Datatype for redeemer of your single parameterized scripts.
pub type ParameterizedRedeemer<p, r> {
  param: p,
  redeemer: r,
}

/// Datatype for parameterized scripts that don't need a redeemer.
pub type Parameter<p> {
  param: p,
}
```

(Also available: `ParameterizedRedeemer2<p, q, r>`, `ParameterizedRedeemer3<p, q, s, r>`, `Parameter2<p, q>`, `Parameter3<p, q, s>`)

**Wrapper functions with redeemer:**

- **`wrapper`** - For scripts with one parameter
- **`wrapper_2`** - For scripts with two parameters
- **`wrapper_3`** - For scripts with three parameters

**Wrapper functions without redeemer:**

- **`wrapper_no_redeemer`** - Wrapper function for scripts with one parameter that don't need a redeemer
- **`wrapper_no_redeemer_2`** - For two parameters
- **`wrapper_no_redeemer_3`** - For three parameters

### Examples

The following examples are from the upstream library and show both the dependent script using `apply_param`, and parameterized scripts using the wrapper functions:

**Dependent minting script** - uses `apply_param` to verify the destination address is an instance of a parameterized spending script:

```aiken
use aiken/cbor
use aiken/collection/list
use aiken/crypto.{Blake2b_224, Hash, blake2b_224}
use aiken/primitive/bytearray
use aiken_design_patterns/parameter_validation.{
  Parameter, ParameterizedRedeemer, apply_param,
}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Output, OutputReference, Transaction}

// Sample prefix and postfix values obtained from `parameterized_spend`
const destination_script_prefix: ByteArray =
  #"59012f0101003229800aba2aba1aab9faab9eaab9dab9a9bae002488888896600264653001300800198041804800cc0200092225980099b8748008c020dd500144ca60026018003300c300d0019b874800122259800980098061baa00789919192cc004c04c00a264b300130053010375400313232332259800980c001c4c8c96600266e3cde41bb30010148acc004c02cc058dd500644cdc79bc83371466e28dd98009bb30013766603260340046eb8c064c05cdd5006459015459015180c000980a9baa00f8b202c375a602a0026eb8c054008c054004c044dd5000c5900f1809001c590111bad30110013011001300d375400f16402c3009375400516401c300800130043754011149a26cac80109811e581c"

validator dependent_mint {
  mint(redeemer: OutputReference, _own_policy: PolicyId, tx: Transaction) {
    let Transaction { mint, outputs, .. } = tx
    let target_script_hash =
      apply_param(
        version: 3,
        prefix: destination_script_prefix,
        param: cbor.serialise(redeemer),
      )
    expect [
      Output {
        address: Address {
          payment_credential: Script(destination_script_hash),
          ..
        },
        value: produced_value,
        ..
      },
    ] = outputs
    and {
      assets.without_lovelace(produced_value) == mint,
      destination_script_hash == target_script_hash,
      list.length(assets.flatten(mint)) == 1,
    }
  }

  else(_) {
    fail
  }
}
```

**Parameterized spending script** - uses `wrapper` to validate the resolved parameter:

```aiken
validator parameterized_spend(
  hashed_parameter: Hash<Blake2b_224, OutputReference>,
) {
  spend(
    m_secret: Option<Hash<Blake2b_224, Int>>,
    outer_redeemer: ParameterizedRedeemer<OutputReference, Int>,
    _own_out_ref: OutputReference,
    _tx: Transaction,
  ) {
    let
      parameter,
      redeemer,
    <-
      parameter_validation.wrapper(
        hashed_parameter,
        fn(p: OutputReference) { cbor.serialise(p) },
        outer_redeemer,
      )
    expect Some(hashed_secret) = m_secret
    let nonce = parameter
    let answer = redeemer
    let raw_secret =
      cbor.serialise(nonce)
        |> bytearray.concat(cbor.serialise(nonce))
        |> bytearray.concat(cbor.serialise(answer))
    blake2b_224(raw_secret) == hashed_secret
  }

  else(_) {
    fail
  }
}
```

**Parameterized minting script** - uses `wrapper_no_redeemer` for a script that doesn't need a custom redeemer:

```aiken
validator parameterized_mint(
  hashed_parameter: Hash<Blake2b_224, OutputReference>,
) {
  mint(
    outer_redeemer: Parameter<OutputReference>,
    own_policy: PolicyId,
    tx: Transaction,
  ) {
    let param <-
      parameter_validation.wrapper_no_redeemer(
        hashed_parameter: hashed_parameter,
        parameter_serialiser: fn(p: OutputReference) { cbor.serialise(p) },
        outer_redeemer: outer_redeemer,
      )
    let nonce = param
    let token_name = cbor.serialise(nonce) |> blake2b_224
    assets.flatten(tx.mint) == [(own_policy, token_name, 1)]
  }

  else(_) {
    fail
  }
}
```

## Examples and Implementation

Full working example: [parameter-validation.ak](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/validators/examples/parameter-validation.ak)

Library implementation: [parameter_validation module](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/main/lib/aiken-design-patterns/parameter-validation.ak)

## Considerations

This design pattern only works under the assumption that the parameter is constant size (this holds true for `TxOutRef`). If a script accepts parameters with dynamic size (ie. arbitrary size integer / bytestring) then to use it with this design pattern you should modify the parameter to be the hash of the original parameter, and then allow the pre-image to be provided in the tx and verify that it matches the hash.

If you found this design pattern useful, please consider supporting the [builtinApplyParams CIP](https://github.com/cardano-foundation/CIPs/pull/934) which proposes the introduction of a new builtin that would make this pattern much more accessible and robust.
