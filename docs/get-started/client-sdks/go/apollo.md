---
id: apollo
title: Apollo - Go SDK for Cardano
sidebar_label: Apollo
description: Pure Golang Cardano building blocks for serialization and transaction building.
image: /img/og/og-developer-portal.png
---

## Introduction

Apollo is a pure Golang library that provides comprehensive building blocks for Cardano development. It offers native Go serialization and transaction building capabilities, with the long-term goal of enabling direct interaction with the Cardano node without intermediaries.

The library aims to give developers access to every resource needed for Cardano development, making it a complete solution for building Cardano applications in Go.

## Key Features

- Pure Golang Cardano serialization
- Comprehensive transaction building capabilities
- Wallet management from mnemonics
- Integration with Blockfrost and other backend services
- Direct access to low-level Cardano primitives
- Support for UTxO management and transaction signing

## Quick Example

Here's a simple example of building and submitting a transaction using Apollo:

```go
package main

import (
    "encoding/hex"
    "fmt"

    "github.com/fxamacker/cbor/v2"
    "github.com/Salvionied/apollo"
    "github.com/Salvionied/apollo/txBuilding/Backend/BlockFrostChainContext"
    "github.com/Salvionied/apollo/constants"
)

func main() {
    // Initialize Blockfrost backend
    bfc, err := BlockFrostChainContext.NewBlockfrostChainContext(
        constants.BLOCKFROST_BASE_URL_PREVIEW,
        int(constants.PREVIEW),
        "blockfrost_api_key",
    )
    if err != nil {
        panic(err)
    }

    // Create Apollo instance
    cc := apollo.NewEmptyBackend()
    SEED := "your mnemonic here"
    apollob := apollo.New(&cc)

    // Set wallet from mnemonic
    apollob, err = apollob.SetWalletFromMnemonic(SEED, constants.PREVIEW)
    if err != nil {
        panic(err)
    }

    // Set wallet as change address
    apollob, err = apollob.SetWalletAsChangeAddress()
    if err != nil {
        panic(err)
    }

    // Fetch UTxOs
    utxos, err := bfc.Utxos(*apollob.GetWallet().GetAddress())
    if err != nil {
        panic(err)
    }

    // Build transaction
    apollob, err = apollob.AddLoadedUTxOs(utxos...).
        PayToAddressBech32("your address here", 1_000_000).
        Complete()
    if err != nil {
        panic(err)
    }

    // Sign transaction
    apollob = apollob.Sign()
    tx := apollob.GetTx()

    // Serialize and submit
    cborred, err := cbor.Marshal(tx)
    if err != nil {
        panic(err)
    }
    fmt.Println(hex.EncodeToString(cborred))

    tx_id, err := bfc.SubmitTx(*tx)
    if err != nil {
        panic(err)
    }
    fmt.Println(hex.EncodeToString(tx_id.Payload))
}
```

## Installation

```bash
go get github.com/Salvionied/apollo
```

## Resources

- [GitHub Repository](https://github.com/Salvionied/apollo)
- [Discord Community](https://discord.gg/MH4CmJcg49)
