---
title: Provider Layer
description: Why and how providers abstract blockchain data access
---

## Abstract

Cardano has multiple blockchain data providers (Blockfrost, Kupmios, Maestro, Koios) with different APIs, authentication methods, and data formats. The provider layer creates a unified interface over these differences—application code works identically regardless of provider choice. The abstraction is deliberately thin: it provides exactly what the SDK needs (UTxO queries, protocol parameters, transaction submission, script evaluation) without exposing provider-specific features.

## Design Philosophy

Without abstraction, application code couples directly to provider APIs. Switching from Blockfrost to Kupmios requires rewriting every blockchain query—different authentication, different response formats, different error handling. Testing requires real blockchain access or complex mocking of provider-specific APIs.

The architecture establishes a thin interface capturing what transaction building requires: query UTxOs, fetch protocol parameters, submit transactions, evaluate scripts. Each provider implementation translates between this interface and their native API. Application code depends on the interface, not the implementation. Provider selection becomes a configuration choice, not a code change.

## Provider Interface Contract

All providers implement the same core operations required for transaction building:

- `getUtxos(address)` - Query unspent outputs at address
- `getProtocolParameters()` - Fetch current protocol parameters
- `submitTx(tx)` - Submit signed transaction
- `evaluateTx(tx, utxos)` - Calculate script execution costs
- `getDatum(hash)` - Retrieve datum by hash
- `awaitTx(hash)` - Wait for transaction confirmation

Each provider translates interface calls to their native API. Application code depends only on interface, never on specific implementation.

## Type-Driven Configuration

Provider configuration uses discriminated unions to enforce correctness at compile time.

**Provider Config**: Method-specific config object. Each `.withX()` provider method determines which configuration properties are required.

**Provider Factory**: The selected `.withX()` method constructs the appropriate implementation. Invalid configurations produce compile-time errors.

**Provider Instance**: Implements unified interface. Type system guarantees all required configuration is present.

TypeScript enforces: `.withBlockfrost()` requires `baseUrl` and `projectId`. `.withKupmios()` requires `kupoUrl` and `ogmiosUrl`. Mismatches are compilation errors, not runtime failures.

## Integration Points

**Transaction Builder**: During `build()` execution, the builder queries the provider for:
- Protocol parameters (fee calculation, transaction size limits)
- Available UTxOs at wallet addresses (coin selection)
- Script evaluation (calculating execution units for Plutus scripts)

**Client Configuration**: Provider capability is added during assembly via `client(chain).withBlockfrost()` or the other `.withX()` provider methods. The client stores the provider reference and passes it to transaction builders.

**Error Handling**: Provider methods return `Effect<Result, ProviderError>`. All provider-specific errors (HTTP failures, WebSocket disconnections, rate limits, authentication) normalize to `ProviderError` with consistent structure. Application code handles one error type, not provider-specific exceptions.

**Effect-TS Integration**: Providers expose both Promise-based API (auto-wrapped) and Effect-based API (`provider.Effect.*`). Transaction builder uses Effect API for compositional error handling and resource management.

## Related Topics

- [Architecture Overview](./overview) - How providers attach to clients
- [Transaction Flow](./transaction-flow) - Provider queries during build phase
- [Deferred Execution](./deferred-execution) - Provider integration with program execution
