---
id: chrysalis
title: Chrysalis - .NET SDK for Cardano
sidebar_label: Chrysalis
description: A native .NET toolkit for Cardano blockchain development, providing serialization, transaction building, wallet management, and smart contract interaction.
image: /img/og/og-developer-portal.png
---

![Chrysalis](/img/get-started/chrysalis-banner.jpeg)

## Introduction

Chrysalis is a native .NET toolkit for Cardano blockchain development, providing everything needed to build applications on Cardano. From CBOR serialization to transaction building and smart contract interaction, Chrysalis offers a complete solution for .NET developers.

**Key Components:**

- **Serialization** - Efficient CBOR encoding/decoding for Cardano data structures
- **Node Communication** - Direct interaction with Cardano nodes through Ouroboros mini-protocols
- **Wallet Management** - Address generation and key handling
- **Transaction Building** - Simple and advanced transaction construction
- **Smart Contract Integration** - Plutus script evaluation and validation via Rust FFI

## Features

- **Strong Typing** - Strong typing for all Cardano blockchain structures
- **High Performance** - Optimized for speed and efficiency
- **Modular Architecture** - Use only what you need
- **Modern C# API** - Takes advantage of the latest .NET features
- **Complete Cardano Support** - Works with all major Cardano eras and protocols

## Installation

Install the main package:

```bash
dotnet add package Chrysalis
```

Or install individual components:

```bash
dotnet add package Chrysalis.Cbor
dotnet add package Chrysalis.Network
dotnet add package Chrysalis.Tx
dotnet add package Chrysalis.Plutus
dotnet add package Chrysalis.Wallet
```

## Architecture

Chrysalis consists of several specialized libraries:

| Module | Description |
|---|---|
| **Chrysalis.Cbor** | CBOR serialization for Cardano data structures |
| **Chrysalis.Cbor.CodeGen** | Source generation for optimized serialization code |
| **Chrysalis.Network** | Implementation of Ouroboros mini-protocols |
| **Chrysalis.Tx** | Transaction building and submission |
| **Chrysalis.Plutus** | Smart contract evaluation and validation |
| **Chrysalis.Wallet** | Key management and address handling |

## Usage Examples

### CBOR Serialization

Define and use CBOR-serializable types with attribute-based serialization:

```csharp
// Define CBOR-serializable types
[CborSerializable]
[CborConstr(0)]
public partial record AssetDetails(
    [CborOrder(0)] byte[] PolicyId,
    [CborOrder(1)] AssetClass Asset,
    [CborOrder(2)] ulong Amount
): CborBase;

[CborSerializable]
[CborList]
public partial record AssetClass(
    [CborOrder(0)] byte[] PolicyId,
    [CborOrder(1)] byte[] AssetName
) : CborBase;

// Deserialize from CBOR hex
var data = "d8799f581cc05cb5c5f43aac9d9e057286e094f60d09ae61e8962ad5c42196180c9f4040ff1a00989680ff";
AssetDetails details = CborSerializer.Deserialize<AssetDetails>(data);

// Serialize back to CBOR
byte[] serialized = CborSerializer.Serialize(details);
```

#### Extension Method Pattern

Chrysalis uses extension methods extensively to provide clean access to nested data structures:

```csharp
// Without extensions, deep property access is verbose and differs by era
var hash = transaction.TransactionBody.Inputs.GetValue()[0].TransactionId;

// With extension methods, access is simplified and era-agnostic
var hash = transaction.TransactionBody.Inputs().First().TransactionId();

// Extensions support common operations
Transaction signedTx = transaction.Sign(privateKey);
```

### Wallet Management

Generate and manage addresses and keys:

```csharp
// Create wallet from mnemonic
var mnemonic = Mnemonic.Generate(English.Words, 24);

var accountKey = mnemonic
    .GetRootKey()
    .Derive(PurposeType.Shelley, DerivationType.HARD)
    .Derive(CoinType.Ada, DerivationType.HARD)
    .Derive(0, DerivationType.HARD);

var privateKey = accountKey
    .Derive(RoleType.ExternalChain)
    .Derive(0);

var paymentKey = privateKey.GetPublicKey();

var stakingKey = accountKey
    .Derive(RoleType.Staking)
    .Derive(0)
    .GetPublicKey();

// Generate address
var address = Address.FromPublicKeys(
    NetworkType.Testnet,
    AddressType.BasePayment,
    paymentKey,
    stakingKey
);

string bech32Address = address.ToBech32();

Console.WriteLine($"Bech32 Address: {bech32Address}");
```

### Node Communication

Connect directly to a Cardano node:

```csharp
try {
    // Connect to a local node
    NodeClient client = await NodeClient.ConnectAsync("/ipc/node.socket");
    await client.StartAsync(2);

    // Query UTXOs by address
    var addressBytes = Convert.FromHexString("00a7e1d2e57b1f9aa851b08c8934a315ffd97397fa997bb3851c626d3bb8d804d91fa134757d1a41b0b12762f8922fe4b4c6faa5ffec1bc9cf");
    var utxos = await client.LocalStateQuery.GetUtxosByAddressAsync([addressBytes]);

    // Synchronize with the chain
    var tip = await client.LocalStateQuery.GetTipAsync();
    Console.WriteLine($"Chain tip: {tip}");

    // Available mini-protocols - accessed as properties
    var localTxSubmit = client.LocalTxSubmit;
    var localStateQuery = client.LocalStateQuery;
    var localTxMonitor = client.LocalTxMonitor;
}
catch (InvalidOperationException ex) {
    Console.WriteLine($"Connection failed: {ex.Message}");
}
catch (Exception ex) {
    Console.WriteLine($"Protocol error: {ex.Message}");
}
```

### Transaction Building

Build and sign transactions with the fluent API or template builder:

```csharp
// Simple transaction using template builder
var senderAddress = address.ToBech32();
var receiverAddress = "addr_test1qpcxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptsm6dhy7";
var provider = new Blockfrost("apiKeyHere");

var transfer = TransactionTemplateBuilder<ulong>.Create(provider)
    .AddStaticParty("sender", senderAddress, true)
    .AddStaticParty("receiver", receiverAddress)
    .AddInput((options, amount) =>
    {
        options.From = "sender";
    })
    .AddOutput((options, amount) =>
    {
        options.To = "receiver";
        options.Amount = new Lovelace(amount);
    })
    .Build();

// Execute the template with a specific amount
Transaction tx = await transfer(5_000_000UL);
Transaction signedTx = tx.Sign(privateKey);
```

### Smart Contract Interaction

Interact with and validate Plutus scripts:

```csharp
var provider = new Blockfrost("project_id");
var ownerAddress = "your address";
var alwaysTrueValidatorAddress = "your validator address";

var spendRedeemerBuilder = (_, _, _) =>
{
    // Custom Logic and return type as long as it inherits from CborBase
    // ex: returns an empty list
    return new PlutusConstr([]);
};

var lockTxHash = "your locked tx hash";
var scriptRefTxHash = "your script ref tx hash";

var unlockLovelace = TransactionTemplateBuilder<UnlockParameters>.Create(provider)
    .AddStaticParty("owner", ownerAddress, true)
    .AddStaticParty("alwaysTrueValidator", alwaysTrueValidatorAddress)
    .AddReferenceInput((options, unlockParams) =>
    {
        options.From = "alwaysTrueValidator";
        options.UtxoRef = unlockParams.ScriptRefUtxoOutref;
    })
    .AddInput((options, unlockParams) =>
    {
        options.From = "alwaysTrueValidator";
        options.UtxoRef = unlockParams.LockedUtxoOutRef;
        options.SetRedeemerBuilder(spendRedeemerBuilder);
    })
    .Build();


var unlockParams = new(
    new TransactionInput(Convert.FromHexString(lockTxHash), 0),
    new TransactionInput(Convert.FromHexString(scriptRefTxHash), 0)
);

var unlockUnsignedTx = await unlockLovelace(unlockParams);
var unlockSignedTx = unlockUnsignedTx.Sign(privateKey);
var unlockTxHash = await provider.SubmitTransactionAsync(unlockSignedTx);

Console.WriteLine($"Unlock Tx Hash: {unlockTxHash}");
```

#### CIP Implementation Support

Chrysalis supports various Cardano Improvement Proposals (CIPs), including:

```csharp
// CIP-68 NFT standard implementation
var nftMetadata = new Cip68<PlutusData>(
    Metadata: metadata,
    Version: 1,
    Extra: null
);
```

## Performance

Chrysalis is optimized for performance, with benchmarks showing it outperforms equivalent libraries in other languages, including Pallas (Rust):

- **With database operations:** Chrysalis (609.56 blocks/s) vs Pallas Rust (474.95 blocks/s)
- **Without database operations:** Chrysalis (4,500 blocks/s) vs Pallas Rust (3,500 blocks/s)

Key performance advantages:

- Faster block deserialization (approximately 28% faster than Rust)
- Optimized chain synchronization
- Lower memory footprint (reduced allocations)
- Excellent scalability for high-throughput applications

These benchmarks were performed using BenchmarkDotNet with proper warm-up cycles, multiple iterations, and statistical analysis.

## Resources

- [GitHub Repository](https://github.com/SAIB-Inc/Chrysalis)
