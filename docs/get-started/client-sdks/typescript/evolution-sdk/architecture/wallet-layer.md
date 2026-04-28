---
title: Wallet Layer
description: Why wallets are separated by capability through the type system
---

## Abstract

Wallet capabilities vary fundamentally: read-only wallets observe addresses and UTxOs but cannot sign; signing wallets can sign transactions but differ in key management (seed phrase, private key, CIP-30 browser API). The wallet layer captures these differences through the type system, making signing operations unavailable at compile time when using read-only wallets. This capability-based separation prevents calling `.sign()` on clients that cannot sign—not through runtime checks, but through type constraints that make invalid operations inexpressible.

## Design Philosophy

Without type-level capability separation, applications rely on runtime checks: "Does this wallet support signing? If not, throw error." This defers errors to runtime and allows code to attempt operations that will inevitably fail.

The architecture encodes capability in types. A `ReadOnlyWallet` produces a `ReadOnlyClient` which has no `.sign()` method—attempting to call it is a compilation error. A `SigningWallet` produces a `SigningClient` where `.sign()` exists and is type-safe. The compiler enforces capability boundaries before code runs.

## Wallet Capability Hierarchy

Wallets separate into two capability levels, with signing wallets further divided by key management approach:

**Wallet Base**: Common operation all wallets support:
- `address()` - Get wallet address

UTxO queries (`getWalletUtxos()`) require a provider and are available on the client, not the wallet itself.

**ReadOnlyWallet**: Base operations only. No signing methods exist. Produced from address or credential without keys.

**SigningWallet**: Base operations plus signing:
- `signTx(transaction)` - Sign transaction with wallet keys
- `signMessage(message)` - Sign arbitrary message

Three signing implementations:
- **SeedWallet**: HD wallet from mnemonic (12/15/24 words)
- **PrivateKeyWallet**: Extended private key (xprv)
- **ApiWallet**: CIP-30 browser wallet API (Nami, Eternl, Flint, hardware wallets)

## Client Type Determination

Wallet capability determines the signing side of staged client assembly. The final client type depends on whether a provider is also present:

- **ClientAssembly**: Chain-scoped starting point.
- **ReadClient**: Provider-backed client with no wallet capability yet.
- **AddressClient**: Wallet identity only, created with `.withAddress()`.
- **OfflineSignerClient**: Signing capability without provider-backed reads or transaction building.
- **ReadOnlyClient**: Read-capable client with wallet identity. Transaction builder's `build()` returns `TransactionResultBase` (unsigned transaction). No `sign()` method exists.
- **SigningClient**: Full provider-backed signing client. Transaction builder's `build()` returns `SignBuilder`, so `sign()` is available.

## Integration Points

**Client Factory**: `client(chain)` uses staged methods like `.withAddress()`, `.withSeed()`, `.withPrivateKey()`, and `.withCip30()` to return the appropriate client type. Type narrowing happens during assembly—no runtime type guards needed in application code.

**Transaction Builder**: Builder type (`ReadOnlyTransactionBuilder` vs `SigningTransactionBuilder`) determined by wallet capability. Read-only builders cannot produce `SignBuilder`, only `TransactionResultBase`.

**Type System Enforcement**: The staged client surface narrows transaction builder access based on the assembled capability set:
```
ReadOnlyClient -> ReadOnlyTransactionBuilder
SigningClient -> SigningTransactionBuilder
```

**Effect-TS Integration**: All wallet operations available as Effect values (`wallet.Effect.*`). Transaction builder uses Effect API for compositional error handling.

## Related Topics

- [Architecture Overview](./overview) - How clients compose with wallets and providers
- [Transaction Flow](./transaction-flow) - How wallet type affects build/sign/submit flow
- [Deferred Execution](./deferred-execution) - Change address resolution from wallet
