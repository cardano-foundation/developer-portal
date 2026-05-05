---
title: API Overview
description: Find the right module for what you need to do
---

# API Overview

Find the right module by what you want to do. For full API docs, browse the [API Reference](https://github.com/IntersectMBO/evolution-sdk).

## Find by Task

| I want to... | Module | Key Functions |
| --- | --- | --- |
| **Parse or create an address** | Address | `fromBech32`, `fromHex`, `toHex`, `toBech32`, `fromSeed` |
| **Work with ADA and tokens** | Assets | `fromLovelace`, `addByHex`, `merge` |
| **Build a transaction** | TransactionBuilder | `newTx`, `payToAddress`, `collectFrom`, `build` |
| **Sign a transaction** | SignBuilder | `sign`, `signAndSubmit`, `partialSign` |
| **Submit a transaction** | SubmitBuilder | `submit` |
| **Create PlutusData** | Data | `constr`, `int`, `bytearray`, `list`, `map` |
| **Define type-safe schemas** | TSchema | `Struct`, `Variant`, `Array`, `Map`, `ByteArray`, `Integer` |
| **Encode/decode CBOR** | CBOR | `fromCBORHex`, `toCBORHex`, `match` |
| **Work with UPLC scripts** | UPLC | `applyParamsToScript`, `fromFlatBytes`, `toFlatBytes` |
| **Connect a provider** | Client | `make`, `withBlockfrost`, `withKupmios` |
| **Query UTxOs** | Provider | `getUtxos`, `getUtxoByUnit`, `getProtocolParameters` |
| **Manage wallets** | Wallet | `withSeed`, `withPrivateKey`, `withCip30` |
| **Derive keys** | Derivation | `walletFromSeed`, `keysFromSeed`, `addressFromSeed` |
| **Sign messages (CIP-30)** | SignData | `signData`, `verifyData` |
| **Generate from blueprints** | codegen | `generateTypeScript` |
| **Work with credentials** | Credential | `makeKeyHash`, `makeScriptHash` |
| **Handle governance** | DRep, VotingProcedures | `fromKeyHash`, `vote`, `propose` |

## Module Categories

### Core Types

Address, Assets, Credential, Data, TSchema, CBOR, UPLC, Transaction, UTxO, Value

### SDK

Client, Provider (Blockfrost, Kupmios, Maestro, Koios), Wallet, TransactionBuilder, SignBuilder, SubmitBuilder, CoinSelection

### Domains

Blueprint (codegen), COSE (message signing), Plutus (on-chain types)

### Primitives

Bytes, BigInt, Coin, PolicyId, ScriptHash, KeyHash, Slot, UnixTime, and 100+ more

For the complete list, browse the [API Reference](https://github.com/IntersectMBO/evolution-sdk).
