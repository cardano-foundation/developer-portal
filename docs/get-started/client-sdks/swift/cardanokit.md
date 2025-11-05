---
id: cardanokit
title: CardanoKit - Swift SDK for Cardano
sidebar_label: CardanoKit
description: Native Swift library for building Cardano applications on iOS and macOS.
image: /img/og/og-developer-portal.png
---

## Introduction

[CardanoKit](https://github.com/TokeoPay/CardanoKit) is a Swift library for integrating Cardano into iOS and macOS applications. Built on top of the Cardano Serialization Library (CSL) mobile bridge, it provides a clean, Swift-native API for wallet operations, transaction handling, and address management.

The SDK is designed specifically for mobile development, giving you the tools to build native Cardano experiences on Apple platforms without dealing with cross-platform compromises.

## What You Can Build

CardanoKit handles the fundamental operations you need for Cardano mobile apps. You can generate HD wallets with 12-24 word mnemonics or restore existing wallets from seed phrases. The SDK manages hierarchical deterministic address derivation and supports both payment addresses and staking credentials.

For transactions, you can parse CBOR hex transactions, sign them with wallet private keys, manage UTXOs, and calculate fees. The address management covers Bech32 and hex formats, credential extraction, validation, and works with both mainnet and testnet.

There's also support for data signing following CIP-30, multi-asset token handling, and transaction analysis to extract detailed information about inputs, outputs, and fees.

## Platform Requirements

CardanoKit requires iOS 17.0+ or macOS 15.0+, running Swift 6.0 with Xcode 15.0 or later. It works on iPhone, iPad, and Mac.

The SDK depends on the CSL Mobile Bridge for core Cardano functionality and Bip39.swift for mnemonic support.

## Installation

Add CardanoKit to your project through Swift Package Manager:

```swift
dependencies: [
    .package(url: "https://github.com/TokeoPay/CardanoKit.git", from: "1.0.0")
]
```

Or add it directly in Xcode via File → Add Package Dependencies using the repository URL: `https://github.com/TokeoPay/CardanoKit.git`

## Quick Example

Here's what basic wallet operations look like:

```swift
import CardanoKit

// Create a new wallet
let wallet = try CardanoWallet.generate(accountIndex: 0, wordCount: .SOLID)
let mnemonic = wallet.getMnumonic()

// Get payment address
let paymentAddress = try wallet.getPaymentAddress(index: 0)
print("Address: \(try paymentAddress.asBech32())")

// Restore from mnemonic
let restoredWallet = try CardanoWallet.fromMnemonic(
    accountIndex: 0,
    words: "your mnemonic phrase here"
)

// Generate multiple addresses
for i in 0..<5 {
    let address = try restoredWallet.getPaymentAddress(index: Int64(i))
    print("Address \(i): \(try address.asBech32())")
}
```

Address validation and conversion:

```swift
let bech32Address = "addr1qydqycuh5r253yp70572k2u80yy7hajyy5r9vd6nl9kcxn..."
let address = try Address(bech32: bech32Address)

// Convert formats
let hexFormat = try address.asHex()
let bech32Format = try address.asBech32()

// Extract credentials
let paymentCred = try address.getPaymentCred()
```

Transaction signing:

```swift
// Parse transaction from CBOR hex
let transaction = try FixedTransaction.fromHex(hex: txHex)

// Sign with wallet
let utxos = try TransactionUnspentOutputs()
// ... add relevant UTXOs ...
try wallet.signTransaction(transaction: transaction, utxos: utxos)

// Get signed transaction
let signedTx = try transaction.toHex()
```

## Memory Safety

CardanoKit handles automatic cleanup of cryptographic resources. The Swift-native API uses modern async/await patterns and includes platform-specific optimizations for iOS and macOS.

## Resources

- [GitHub Repository](https://github.com/TokeoPay/CardanoKit)
- [Technical Design](https://github.com/TokeoPay/CardanoKit/blob/main/TechnicalDesign.md)
