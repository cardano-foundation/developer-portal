---
id: uplc
title: Untyped Plutus Core
sidebar_label: UPLC
description: Assembly language of Cardano smart contract platform
---

## Untyped Plutus Core: The Execution Layer

At the lowest level, all Cardano smart contracts execute as **Untyped Plutus Core** (UPLC) programs. Understanding UPLC provides crucial insight into how your high-level smart contract code actually runs on-chain.

### What is UPLC?

UPLC is the "assembly language" of Cardano smart contracts. Every smart contract language (Aiken, Plutus Haskell, OpShin, etc.) compiles down to UPLC before execution. Think of it as the intermediate representation that the Cardano virtual machine actually executes.

**Why Multiple Languages?** The diverse ecosystem of languages targeting UPLC reflects different development philosophies. This diversity allows developers to choose tools that match their background and project needs while all compiling to the same execution target.

**Compilation Pipeline:**

```
High-level Code → Typed Plutus Core → UPLC → Binary Encoding → On-chain Execution
```

### Properties

- While UPLC has no explicit types, it preserves the implicit type structure from the original typed program. Type mismatches still cause runtime errors, but the execution model is simpler.

- UPLC uses lambda calculus with functions, variables, constants, and application. Everything is a function or can be applied to a function. Variables use DeBruijn indices instead of names, referring to bound variables by their position in ancestor lambdas.

- UPLC can express any computation that can be performed by a computer, making it powerful enough to handle complex smart contract logic.

- Since there are no operators, all operations (even basic arithmetic) use built-in functions like `addInteger`, `appendByteString`, or `verifyEd25519Signature`.

### Basic UPLC Components

#### Primitive Types

UPLC supports seven primitive types:

- **unit**: `(con unit ())`
- **bool**: `(con bool True)`  
- **integer**: `(con integer 42)`
- **bytestring**: `(con bytestring #41696b656e)`
- **string**: `(con string "Hello")`
- **pair**: `(con pair<bool, integer> [True, 42])`
- **list**: `(con list<integer> [1, 2, 3])`

#### Functions and Application

Functions use lambda syntax:

```
(lam x x)                           // Identity function
[ (lam x x) (con integer 42) ]     // Apply identity to 42
```

#### Built-in Functions

Essential operations use built-ins:

```
[ [ (builtin addInteger) (con integer 16) ] (con integer 26) ]  // 16 + 26
[ [ (builtin equalsByteString) #hello ] #world ]                // Compare bytes
```

#### Data Type

The generic `Data` type is crucial for smart contracts, representing arbitrary structured data used in datums and redeemers. It supports five constructors:

```
data Data = 
    Constr Integer [Data]           -- Tagged constructors with data
  | Map [(Data, Data)]              -- Key-value mappings  
  | List [Data]                     -- Homogeneous lists
  | I Integer                       -- Integer values
  | B ByteString                    -- Binary data
```

**Working with Data**: Built-in functions help construct and access Data values:

- `constrData`, `unConstrData` - Work with tagged constructors
- `listData`, `unListData` - Build and extract lists
- `mapData`, `unMapData` - Handle key-value pairs
- `iData`, `unIData` - Convert integers to/from Data
- `bData`, `unBData` - Convert bytestrings to/from Data

This type system allows high-level languages to serialize complex data structures into a format that UPLC can process uniformly.

### Binary Encoding and Execution

On-chain, UPLC programs are stored as compact binary data using the "flat" encoding format. This binary representation is what validators actually receive and execute.

**Size Implications**: UPLC programs can be large, which is why transaction size limits (16KB) become important for complex smart contracts. Recent improvements like reference scripts help mitigate this.

**Execution Costs**: Every UPLC operation has precise memory and CPU costs defined by the protocol's cost model. These costs enable predictable fee calculation and execution budgets.

### Why This Matters for Developers

- When smart contracts fail, understanding UPLC helps interpret low-level error messages and execution traces for debugging.

- Knowing how high-level constructs compile to UPLC helps write more efficient smart contracts.

- UPLC is the common target for all smart contract languages, enabling cross-language compatibility.

- Understanding the compilation pipeline helps minimize the size of on-chain scripts and optimize your contracts to their last bits.

While you won't write UPLC directly, understanding it as the execution foundation helps you write better smart contracts in any high-level language.

For complete technical details including formal syntax and semantics, see the [Formal Specification of the Plutus Core Language](https://plutus.cardano.intersectmbo.org/resources/plutus-core-spec.pdf).
