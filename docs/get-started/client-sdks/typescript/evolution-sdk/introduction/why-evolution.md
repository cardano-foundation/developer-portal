---
title: Why Evolution
description: Philosophy and benefits of the Evolution SDK for Cardano development
sidebar_position: 2
---

# Why Evolution?

Evolution SDK is a modern, type-safe TypeScript library purpose-built for Cardano blockchain development. It represents the next generation of developer experience on Cardano, building on lessons learned from first-generation libraries.

## What Makes Evolution Different?

### Type Safety First
Every interaction with the blockchain is fully typed. The compiler catches errors before runtime, preventing entire categories of bugs. Whether you're working with addresses, transactions, or smart contract data, TypeScript ensures correctness at every step.

### Built on Effect-TS
Evolution leverages [Effect-TS](https://effect.website/), a powerful library for building robust, composable applications. This means:
- **Error handling** that doesn't rely on exceptions
- **Resource management** that prevents leaks
- **Composable APIs** that work together seamlessly

### Modular Architecture
Use only what you need. Evolution's modular design means tree-shaking removes unused code from your bundles. Whether you're building a CLI tool or a web dApp, you only ship what you use.

### Composability Over Callbacks
Build complex workflows by composing simple, deterministic functions. No callback hell, no promise chains—just clear, testable code that's easy to reason about.

## Compared to Lucid Evolution

If you're coming from Lucid, Evolution provides:
- **Better TypeScript support** - Full type inference across all APIs
- **Cleaner error handling** - Explicit error types instead of thrown exceptions
- **More flexibility** - Swap providers and wallets without changing code
- **Better testing** - Pure functions and dependency injection make testing easier

See the [Migration Guide](./migration-from-lucid) for detailed comparisons.

## Get Started

Ready to build? Start with [Installation](./installation) or jump to [Getting Started](./getting-started).
