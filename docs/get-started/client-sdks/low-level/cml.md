---
id: cml
title: Cardano Multiplatform Library (CML)
sidebar_label: Cardano Multiplatform Library
description: Rust library for Cardano that can be deployed to multiple platforms including JavaScript, TypeScript, WASM, and mobile.
image: /img/og/og-developer-portal.png
---

## Introduction

Cardano Multiplatform Library (CML) is a Rust library that provides core Cardano functionality across multiple platforms. Written in Rust and compiled to various targets, it offers consistent serialization, deserialization, and utility functions for building dApps and wallets on any platform.

The library can be deployed as a Rust crate, JavaScript/TypeScript package, WASM module, or mobile binding, making it ideal for cross-platform Cardano development.

## Key Features

CML handles three main areas of Cardano development:

- **Serialization & Deserialization** - Complete support for Cardano's core data structures with consistent behavior across all platforms
- **Utility Functions** - Essential helpers for dApps and wallets including transaction building, address handling, and cryptographic operations
- **Multi-Platform Support** - Single codebase that works in browsers, Node.js, Rust applications, and mobile apps

## Platform Support

### JavaScript / TypeScript

CML provides NPM packages for different JavaScript environments:

- **Browser** - Full WASM-based implementation for web browsers
- **Node.js** - Native module optimized for server-side JavaScript
- **asm.js** - Legacy JavaScript fallback (strongly discouraged for new projects)

```bash
# For browsers
npm install @dcspark/cardano-multiplatform-lib-browser

# For Node.js
npm install @dcspark/cardano-multiplatform-lib-nodejs
```

### Rust

Available as a standard Rust crate:

```bash
cargo add cardano-multiplatform-lib
```

### Mobile

CML can be integrated into mobile applications using Ionic + Capacitor or equivalent frameworks to enable WASM bindings on iOS and Android.

## Getting Started

For detailed documentation, examples, and API reference, visit the [official CML documentation](https://dcspark.github.io/cardano-multiplatform-lib/).

## Resources

- [Official Documentation](https://dcspark.github.io/cardano-multiplatform-lib/)
- [GitHub Repository](https://github.com/dcSpark/cardano-multiplatform-lib)
- [Crates.io](https://crates.io/crates/cardano-multiplatform-lib)
- [NPM Package (Browser)](https://www.npmjs.com/package/@dcspark/cardano-multiplatform-lib-browser)
- [NPM Package (Node.js)](https://www.npmjs.com/package/@dcspark/cardano-multiplatform-lib-nodejs)
