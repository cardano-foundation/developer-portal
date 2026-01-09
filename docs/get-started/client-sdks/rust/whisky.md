---
id: whisky
title: Whisky - Cardano Rust SDK
sidebar_label: Whisky
description: Open-source Cardano Rust SDK for DApp development with transaction building and wallet utilities.
image: /img/og/og-developer-portal.png
---

## Introduction

Whisky is an open-source Cardano Rust SDK designed for DApp development. It provides a comprehensive set of tools for building transactions, handling wallet operations, and interacting with the Cardano blockchain through various provider services.

The SDK is organized into multiple specialized modules that work together to provide a complete development experience, from low-level serialization to high-level transaction building.

## Key Features

With Whisky, you can:

- Build transactions using cardano-cli-like APIs, suitable for serious DApp backends on Rust codebases
- Handle transaction signing in Rust
- Interact with blockchain through provider services like Maestro and Blockfrost
- Perform off-node evaluation on transaction execution units using TxPipe's UPLC integration
- Use WASM bindings for JavaScript/TypeScript integration

## Modules

Whisky consists of several focused modules:

- **whisky** - The core Rust crate supporting Cardano DApp development
- **whisky-common** - Universal types and utilities
- **whisky-csl** - Wrapper implementation for most cardano-serialization-lib functionality
- **whisky-provider** - Connection to external services like Blockfrost and Maestro
- **whisky-wallet** - Wallet signing and key encryption utilities
- **whisky-macros** - Rust macros utility
- **whisky-js** - WASM package output for JavaScript/TypeScript integration

## Installation

### Rust Library

```bash
cargo add whisky
```

### JavaScript / TypeScript WASM

```bash
# For Node.js
yarn add @sidan-lab/whisky-js-nodejs

# For browser
yarn add @sidan-lab/whisky-js-browser
```

## Quick Example

Here's a simple example of sending lovelace using Whisky:

```rust
use whisky::*;

pub fn send_lovelace(
    recipient_address: &str,
    my_address: &str,
    inputs: &[UTxO],
) -> Result<String, WError> {
    let mut tx_builder = TxBuilder::new_core();
    tx_builder
        .tx_out(
            recipient_address,
            &[Asset::new_from_str("lovelace", "1000000")],
        )
        .change_address(my_address)
        .select_utxos_from(inputs, 5000000)
        .complete_sync(None)?;

    Ok(tx_builder.tx_hex())
}
```

## End-to-End WhiskyPallas Tx Build and Unit Test Run

Whisky supports multiple serializer backends. The `WhiskyPallas` serializer is a pure-Rust implementation using [TxPipe's Pallas](https://github.com/txpipe/pallas) library, providing an alternative to the CSL (cardano-serialization-lib) backend.

### Choosing a Serializer

You can choose between `WhiskyPallas` and `WhiskyCSL` when creating a `TxBuilder`:

```rust
use whisky::*;
use whisky_pallas::WhiskyPallas;

// Using WhiskyPallas serializer
let mut tx_builder = TxBuilder::new(TxBuilderParam {
    serializer: Box::new(WhiskyPallas::new(None)),
    evaluator: None,
    fetcher: None,
    submitter: None,
    params: None,
});

// Or using the default CSL serializer
let mut tx_builder_csl = TxBuilder::new_core();
```

### End-to-End Transaction Building with WhiskyPallas

#### Simple Spend Transaction

```rust
use whisky::*;
use whisky_pallas::WhiskyPallas;

fn build_simple_spend() -> String {
    let mut tx_builder = TxBuilder::new(TxBuilderParam {
        serializer: Box::new(WhiskyPallas::new(None)),
        evaluator: None,
        fetcher: None,
        submitter: None,
        params: None,
    });

    let signed_tx = tx_builder
        .tx_in(
            "2cb57168ee66b68bd04a0d595060b546edf30c04ae1031b883c9ac797967dd85",
            3,
            &[Asset::new_from_str("lovelace", "9891607895")],
            "addr_test1vru4e2un2tq50q4rv6qzk7t8w34gjdtw3y2uzuqxzj0ldrqqactxh",
        )
        .change_address("addr_test1vru4e2un2tq50q4rv6qzk7t8w34gjdtw3y2uzuqxzj0ldrqqactxh")
        .signing_key("your_signing_key_hex")
        .complete_sync(None)
        .unwrap()
        .complete_signing()
        .unwrap();

    signed_tx
}
```

#### Complex Plutus Transaction with Minting and Script Reference

```rust
use serde_json::{json, to_string};
use whisky::*;
use whisky_common::data::*;
use whisky_pallas::WhiskyPallas;

fn build_complex_plutus_tx() -> String {
    let mut tx_builder = TxBuilder::new(TxBuilderParam {
        serializer: Box::new(WhiskyPallas::new(None)),
        evaluator: None,
        fetcher: None,
        submitter: None,
        params: None,
    });

    let policy_id = "baefdc6c5b191be372a794cd8d40d839ec0dbdd3c28957267dc81700";
    let token_name_hex = "6d65736874657374696e67342e6164610a";

    tx_builder
        // Add input UTxO
        .tx_in(
            "fc1c806abc9981f4bee2ce259f61578c3341012f3d04f22e82e7e40c7e7e3c3c",
            3,
            &[Asset::new_from_str("lovelace", "9692479606")],
            "addr_test1vpw22xesfv0hnkfw4k5vtrz386tfgkxu6f7wfadug7prl7s6gt89x",
        )
        // Mint tokens using Plutus V2 script reference
        .mint_plutus_script_v2()
        .mint(1, policy_id, token_name_hex)
        .mint_tx_in_reference(
            "63210437b543c8a11afbbc6765aa205eb2733cb74e2805afd4c1c8cb72bd8e22",
            0,
            policy_id,
            100, // script size
        )
        .mint_redeemer_value(&WRedeemer {
            data: WData::JSON(
                to_string(&json!({
                    "constructor": 0,
                    "fields": []
                }))
                .unwrap(),
            ),
            ex_units: Budget {
                mem: 3386819,
                steps: 1048170931,
            },
        })
        // Add output with minted token
        .tx_out(
            "addr_test1vpw22xesfv0hnkfw4k5vtrz386tfgkxu6f7wfadug7prl7s6gt89x",
            &[
                Asset::new_from_str("lovelace", "2000000"),
                Asset::new(policy_id.to_string() + token_name_hex, "1".to_string()),
            ],
        )
        // Add collateral
        .tx_in_collateral(
            "3fbdf2b0b4213855dd9b87f7c94a50cf352ba6edfdded85ecb22cf9ceb75f814",
            6,
            &[Asset::new_from_str("lovelace", "10000000")],
            "addr_test1vpw22xesfv0hnkfw4k5vtrz386tfgkxu6f7wfadug7prl7s6gt89x",
        )
        .change_address("addr_test1vpw22xesfv0hnkfw4k5vtrz386tfgkxu6f7wfadug7prl7s6gt89x")
        .complete_sync(None)
        .unwrap();

    tx_builder.tx_hex()
}
```

#### Staking Withdrawal Transaction

```rust
use whisky::*;
use whisky_pallas::WhiskyPallas;

fn build_withdrawal_tx() -> String {
    let mut tx_builder = TxBuilder::new(TxBuilderParam {
        serializer: Box::new(WhiskyPallas::new(None)),
        evaluator: None,
        fetcher: None,
        submitter: None,
        params: None,
    });

    let signed_tx = tx_builder
        .tx_in(
            "fbd3e8091c9f0c5fb446be9e58d9235f548546a5a7d5f60ee56e389344db9c5e",
            0,
            &[Asset::new_from_str("lovelace", "9496607660")],
            "addr_test1qpjfsrjdr8kk5ffj4jnw02ht3y3td0y0zkcm52rc6w7z7flmy7vplnvz6a7dncss4q5quqwt48tv9dewuvdxqssur9jqc4x459",
        )
        .change_address("addr_test1qpjfsrjdr8kk5ffj4jnw02ht3y3td0y0zkcm52rc6w7z7flmy7vplnvz6a7dncss4q5quqwt48tv9dewuvdxqssur9jqc4x459")
        .withdrawal("stake_test1uraj0xqlekpdwlxeugg2s2qwq896n4kzkuhwxxnqggwpjeqe9s9k2", 0)
        .required_signer_hash("fb27981fcd82d77cd9e210a8280e01cba9d6c2b72ee31a60421c1964")
        .signing_key("your_signing_key_hex")
        .complete_sync(None)
        .unwrap()
        .complete_signing()
        .unwrap();

    signed_tx
}
```

### Running Unit Tests

The whisky crate includes comprehensive integration tests for both WhiskyPallas and WhiskyCSL serializers. These tests verify transaction building for various scenarios including simple spends, complex Plutus transactions, minting, withdrawals, and governance actions.

```sh
# Run all tests
cargo test

# Run only WhiskyPallas integration tests
cargo test --package whisky --test pallas_integration_tests

# Run only WhiskyCSL integration tests
cargo test --package whisky --test csl_integration_tests

# Run a specific test with output
cargo test --package whisky --test pallas_integration_tests test_simple_spend -- --nocapture
```

The integration tests cover:
- **Common transactions**: Simple spend, withdrawals, stake registration/deregistration
- **Complex Plutus transactions**: Minting with script references, spending from script addresses, inline datums
- **Governance transactions**: DRep registration, vote delegation, voting
- **Edge cases**: Multiple collateral inputs, custom protocol parameters, embedded datums

## Resources

- [Official Documentation](https://whisky.sidan.io/)
- [GitHub Repository](https://github.com/sidan-lab/whisky)
- [Crates.io](https://crates.io/crates/whisky)
- [NPM Package (Node.js)](https://www.npmjs.com/package/@sidan-lab/whisky-js-nodejs)
- [NPM Package (Browser)](https://www.npmjs.com/package/@sidan-lab/whisky-js-browser)
