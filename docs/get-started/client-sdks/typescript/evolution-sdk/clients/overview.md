---
title: Clients
description: Client types combining wallets and providers
---

import DocCardList from '@theme/DocCardList';

# Clients

Clients assemble chain-scoped capabilities into one runtime surface. Start with `Client.make(chain)`, then add read access, address context, or signing capability with `.withX(...)`.

Submission only appears once a provider stage is present. Wallet-only assembly stages can sign, but they still hand signed transactions to a provider-backed client or backend for broadcast.

<DocCardList />

## Overview

A client's capabilities depend on which stages you add:

- **Provider stage**: Enables blockchain queries and transaction submission
- **Address stage**: Adds wallet address context without signing
- **Signer stage**: Adds transaction and message signing

Different combinations create different client stages with distinct capabilities.

## Client Types

| Client Stage             | Added Via                       | Can Query | Can Build Tx | Can Sign | Can Submit |
| ------------------------ | ------------------------------- | --------- | ------------ | -------- | ---------- |
| **Read Client**          | `.withBlockfrost()` or peers    | Yes       | No           | No       | Yes        |
| **Address Client**       | `.withAddress()`                | No        | No           | No       | No         |
| **Offline Signer Client**| `.withSeed()`, `.withPrivateKey()`, `.withCip30()` | No | No | Yes | No |
| **Read-Only Client**     | Provider + `.withAddress()`     | Yes       | Yes          | No       | Yes        |
| **Signing Client**       | Provider + signing capability   | Yes       | Yes          | Yes      | Yes        |

## Configuration Pattern

All clients start with `Client.make(chain)` and add capabilities as needed:

```typescript
const readClient = Client.make(preprod).withBlockfrost({ ... })
const addressClient = Client.make(preprod).withAddress("addr_test1...")
const signingClient = Client.make(preprod).withBlockfrost({ ... }).withSeed({ ... })
```

**Rules**:

- `Client.make(chain)` is the empty assembly stage
- Add a provider first when you need blockchain reads or submission
- Add `.withAddress()` when you only need wallet context
- Add `.withSeed()`, `.withPrivateKey()`, or `.withCip30()` when you need signing
- `.withCip30()` without a provider is a signing-only stage; submission still happens through provider-backed infrastructure

## Decision Tree

```
What do you need to do?

Build + Sign + Submit transactions?
├─ Development/Testing → Signing Client with `.withSeed()`
└─ Production automation → Signing Client with `.withPrivateKey()`

Sign only in the browser (with provider-backed submission elsewhere)?
└─ Offline Signer Client with `.withCip30()`

Build only (backend)?
└─ Read-Only Client with `.withAddress()`

Query + Submit pre-signed?
└─ Read Client
```

## Next Steps

- **[Client Basics](./client-basics)** - Understanding client capabilities
- **[Provider Setup](./providers)** - Provider configuration comparison
- **[Architecture](./architecture)** - Frontend/backend patterns
- **[Wallets](../wallets)** - Wallet types and security
- **[Providers](../providers)** - Provider-only client patterns
