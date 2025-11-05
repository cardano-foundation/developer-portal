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

## Resources

- [Official Documentation](https://whisky.sidan.io/)
- [GitHub Repository](https://github.com/sidan-lab/whisky)
- [Crates.io](https://crates.io/crates/whisky)
- [NPM Package (Node.js)](https://www.npmjs.com/package/@sidan-lab/whisky-js-nodejs)
- [NPM Package (Browser)](https://www.npmjs.com/package/@sidan-lab/whisky-js-browser)
