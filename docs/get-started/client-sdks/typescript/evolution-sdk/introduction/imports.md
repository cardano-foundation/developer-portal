---
title: Import Patterns
description: How to choose between root, direct, and grouped imports in @evolution-sdk/evolution
sidebar_position: 6
---

# Import Patterns

Evolution SDK exposes one public package with three import styles. They all reach the same consumer-facing API, but each optimizes for something different — discovery, explicitness, or grouped domains. None of them is required; choose the one that fits how you are using the SDK.

## Three Ways to Import

### 1. Root barrel

The root barrel is the easiest place to start. Use it when you are exploring the SDK, prototyping, or reading the API through editor autocomplete.

```ts
import { Address, Assets, Client, preprod } from "@evolution-sdk/evolution"

const address = Address.fromBech32("addr1...")
const amount = Assets.fromLovelace(2_000_000n)
const client = Client.make(preprod)
  .withBlockfrost({ baseUrl: "https://cardano-preprod.blockfrost.io/api/v0", projectId: "your-project-id" })
const tx = client.newTx()
```

The root barrel also exports `Cardano`, which gives you one namespace for discovery:

```ts
import { Cardano } from "@evolution-sdk/evolution"

const address = Cardano.Address.fromBech32("addr1...")
const amount = Cardano.Assets.fromLovelace(2_000_000n)
```

### 2. Direct module import

Direct module imports are a strong default when you know the exact modules you want. Each import is explicit, tree-shakeable, and easy to search for in a codebase.

```ts
import * as Address from "@evolution-sdk/evolution/Address"
import * as Assets from "@evolution-sdk/evolution/Assets"
import * as Transaction from "@evolution-sdk/evolution/Transaction"
```

The import path matches the public module name exactly, using PascalCase. `Address` comes from `@evolution-sdk/evolution/Address`, `Transaction` comes from `@evolution-sdk/evolution/Transaction`, and so on.

### 3. Domain subpath

Some parts of the SDK ship as grouped domains with their own public barrel. Use these when you want several related modules from the same area.

```ts
import { Address, Credential, Value } from "@evolution-sdk/evolution/plutus"
import { Codegen } from "@evolution-sdk/evolution/blueprint"
import { COSESign1, Header } from "@evolution-sdk/evolution/cose"
```

This style works well when the domain already has a natural namespace, such as Plutus data types, blueprint tooling, or COSE message-signing utilities.

## Which One Should I Use?

Use this as a rule of thumb, not a hard rule.

| Situation                                                 | Good choice                                                                         | Why                                         |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| Exploring the SDK in your editor                          | Root barrel: `import { Cardano } from "@evolution-sdk/evolution"`                   | Best for autocomplete and API discovery     |
| Writing examples or short scripts                         | Root barrel: `import { Address, Assets } from "@evolution-sdk/evolution"`           | Short and convenient                        |
| Writing app code when you know the exact modules you need | Direct module import: `import * as Address from "@evolution-sdk/evolution/Address"` | Explicit and tree-shakeable                 |
| Working with Plutus-specific types                        | Domain subpath: `import { Credential } from "@evolution-sdk/evolution/plutus"`      | Keeps all on-chain primitive types together |
| Working with blueprint code generation                    | Domain subpath: `import { Codegen } from "@evolution-sdk/evolution/blueprint"`      | All blueprint utilities live in one barrel  |
| Working with COSE signing types                           | Domain subpath: `import { COSESign1 } from "@evolution-sdk/evolution/cose"`         | All signing primitives live in one barrel   |

## What Does Not Work

Only the public entry points are supported. Deep imports into grouped subdirectories are blocked on purpose.

```ts
// Module not found
import * as Address from "@evolution-sdk/evolution/plutus/Address"
import * as Key from "@evolution-sdk/evolution/cose/Key"
```

Use the grouped barrel instead:

```ts
import { Address } from "@evolution-sdk/evolution/plutus"
import { COSEKey } from "@evolution-sdk/evolution/cose"
```

## Why the SDK Works This Way

The three import styles exist because no single style is right for every context.

The root barrel is the easiest entry point for discovery. A single import gives you autocomplete over the entire surface, which matters when you are learning the API or writing a quick script. The `Cardano` namespace goes further: it groups everything under one identifier so you can type `Cardano.` and browse.

Direct module imports are better for code that lives in a codebase for a long time. Each import path is a stable, searchable contract between your code and the SDK. Bundlers can tree-shake individual modules independently, so only the modules you import end up in your bundle.

Domain subpaths exist for areas of the SDK that form a coherent group — Plutus data types, COSE signing primitives, and blueprint tooling. Rather than importing each piece separately, you get one import that covers the domain.

Blocking deep imports (`/plutus/Address`, `/cose/Key`) matters because it lets the SDK reorganize internals without breaking consumers. The public entry points are the stable surface; what lives inside them is an implementation detail.

## Next Steps

- [Installation](./installation.md)
- [Getting Started](./getting-started.md)
- [API Reference](https://no-witness-labs.github.io/evolution-sdk/)
