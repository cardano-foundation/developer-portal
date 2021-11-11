---
id: cardanosharp-wallet
title: Get Started with CardanoSharp Wallet
sidebar_label: CardanoSharp Wallet
description: Get Started with CardanoSharp Wallet
image: ./img/og-developer-portal.png
--- 

# CardanoSharp.Wallet 
[![Build status](https://ci.appveyor.com/api/projects/status/knh87k86mf7gbxyo?svg=true)](https://ci.appveyor.com/project/nothingalike/cardanosharp-wallet/branch/main) [![Test status](https://img.shields.io/appveyor/tests/nothingalike/cardanosharp-wallet)](https://ci.appveyor.com/project/nothingalike/cardanosharp-wallet/branch/main) [![NuGet Version](https://img.shields.io/nuget/v/CardanoSharp.Wallet.svg?style=flat)](https://www.nuget.org/packages/CardanoSharp.Wallet/) ![NuGet Downloads](https://img.shields.io/nuget/dt/CardanoSharp.Wallet.svg)

CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.

## Getting Started

CardanoSharp.Wallet is installed from NuGet.

```sh
Install-Package CardanoSharp.Wallet
```

## Create Mnemonics

The `MnemonicService` has operations tbat help with *generating* and *restoring* Mnemonics. It is built for use in DI containers (ie. the interface `IMnemonicService`).

```cs
IMnemonicService service = new MnemonicService();
```

### Generate Mnemonic

```cs
IMnemonicService service = new MnemonicService();
Mnemonic rememberMe = service.Generate(24, WordLists.English);
System.Console.WriteLine(rememberMe.Words);
```

### Restore Mnemonic

```cs
string words = "art forum devote street sure rather head chuckle guard poverty release quote oak craft enemy";
Mnemonic mnemonic = MnemonicService.Restore(words);
```

## Create Private and Public Keys

Use powerful extensions to create and derive keys.

```cs
// The rootKey is a PrivateKey made of up of the 
//  - byte[] Key
//  - byte[] Chaincode
PrivateKey rootKey = mnemonic.GetRootKey();

// This path will give us our Payment Key on index 0
string paymentPath = $"m/1852'/1815'/0'/0/0";
// The paymentPrv is Private Key of the specified path.
PrivateKey paymentPrv = rootKey.Derive(paymentPath);
// Get the Public Key from the Private Key
PublicKey paymentPub = paymentPrv.GetPublicKey(false);

// This path will give us our Stake Key on index 0
string stakePath = $"m/1852'/1815'/0'/2/0";
// The stakePrv is Private Key of the specified path
PrivateKey stakePrv = rootKey.Derive(stakePath);
// Get the Public Key from the Stake Private Key
PublicKey stakePub = stakePrv.GetPublicKey(false);
```

 > If you want to learn more about key paths, read this article [About Address Derivation](https://github.com/input-output-hk/technical-docs/blob/main/cardano-components/cardano-wallet/doc/About-Address-Derivation.md)

## Create Addresses

The `AddressService` lets you Create Addresses from Keys. It is built for use in DI containers (ie. the interface `IAddressService`)

```cs
IAddressService addressService = new AddressService();
```

From the public keys we generated above, we can now get the public address.

```csharp
// add using
using CardanoSharp.Wallet.Models.Addresses;

// Creating Addresses require the Public Payment and Stake Keys
Address baseAddr = addressService.GetAddress(
    paymentPub, 
    stakePub, 
    NetworkType.Testnet, 
    AddressType.Base);
```

If you already have an address.

```cs
Address baseAddr = new Address("addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp");
```

## Fluent Key Derivation

A fluent API helps navigate the derivation paths.

```cs
// Add using
using CardanoSharp.Wallet.Extensions.Models;

// Restore a Mnemonic
var mnemonic = new MnemonicService().Restore(words);

// Fluent derivation API
var derivation = mnemonic
    .GetMasterNode("password")      // IMasterNodeDerivation
    .Derive(PurposeType.Shelley)    // IPurposeNodeDerivation
    .Derive(CoinType.Ada)           // ICoinNodeDerivation
    .Derive(0)                      // IAccountNodeDerivation
    .Derive(RoleType.ExternalChain) // IRoleNodeDerivation
    //or .Derive(RoleType.Staking) 
    .Derive(0);                     // IIndexNodeDerivation

PrivateKey privateKey = derivation.PrivateKey;
PublicKey publicKey = derivation.PublicKey;
```

## Build and Sign Transactions

CardanoSharp.Wallet requires input from the chain in order to build transactions. Lets assume we have gathered the following information.

```cs
uint currentSlot = 40000000;
ulong minFeeA = 44;
ulong minFeeB = 155381;
string inputTx = "0000000000000000000000000000000000000000000000000000000000000000";
```

Lets derive a few keys to use while building transactions.

```cs
// Derive down to our Account Node
var accountNode = rootKey.Derive()
    .Derive(PurposeType.Shelley)
    .Derive(CoinType.Ada)
    .Derive(0);

// Derive our Change Node on Index 0
var changeNode = accountNode
    .Derive(RoleType.InternalChain) 
    .Derive(0);

// Derive our Staking Node on Index 0
var stakingNode = accountNode
    .Derive(RoleType.Staking) 
    .Derive(0);

// Deriving our Payment Node
//  note: We did not derive down to the index.
var paymentNode = accountNode
    .Derive(RoleType.ExternalChain);
```

## Simple Transaction

Lets assume the following...

- You have 100 ADA on path:        `m/1852'/1815'/0'/0/0`
- You want to send 25 ADA to path: `m/1852'/1815'/0'/0/1`

### Build Transaction Body

```cs
// Generate the Recieving Address
Address paymentAddr = addressService.GetAddress(
    paymentNode.Derive(1).PublicKey, 
    stakingNode.PublicKey, 
    NetworkType.Testnet, 
    AddressType.Base);

// Generate an Address for changes
Address changeAddr = addressService.GetAddress(
    changeNode.PublicKey, 
    stakingNode.PublicKey, 
    NetworkType.Testnet, 
    AddressType.Base);

var transactionBody = TransactionBodyBuilder.Create
    .AddInput(inputTx, 0)
    .AddOutput(paymentAddr, 25)
    .AddOutput(changeAddr, 75)
    .SetTtl(currentSlot + 1000)
    .SetFee(0)
    .Build();
```

### Build Transaction Witnesses

For this simple transaction we really only need to add our keys. This is how we sign our transactions.

```cs
// Derive Sender Keys
var senderKeys = paymentNode.Derive(0);

var witnesses = TransactionWitnessSetBuilder.Create
    .AddVKeyWitness(senderKeys.PublicKey, senderKeys.PrivateKey);
```

### Calculate Fee

```cs
// Construct Transaction Builder
var transactionBuilder = TransactionBuilder.Create
    .SetBody(transactionBody)
    .SetWitnesses(witnesses);

// Calculate Fee
var fee = transaction.CalculateFee(minFeeA, minFeeB);

// Update Fee and Rebuild
transactionBody.SetFee(fee);
Transaction transaction = transactionBuilder.Build();
transaction.TransactionBody.TransactionOutputs.Last().Value.Coin -= fee;
```

## Metadata Transaction

Building the Body and Witnesses are the same as the Simple Transaction.

> If you would like to read more about Metadata, please read this article on [Tx Metadata](https://github.com/input-output-hk/cardano-node/blob/master/doc/reference/tx-metadata.md)

```cs
// Build Metadata and Add to Transaction
var auxData = AuxiliaryDataBuilder.Create
    .AddMetadata(1234, new { name = "simple message" });

var transaction = TransactionBuilder.Create
    .SetBody(transactionBody)
    .SetWitnesses(witnesses)
    .SetAuxData(auxData)
    .Build();
```

## Minting Transaction

Before we can mint a token, we need to create a policy. 

> If you would like to read more about policy scripts, please read this article on [Simple Scripts](https://github.com/input-output-hk/cardano-node/blob/master/doc/reference/simple-scripts.md).

```cs
// Generate a Key Pair for your new Policy
var keyPair = KeyPair.GenerateKeyPair();
var policySkey = keyPair.PrivateKey;
var policyVkey = keyPair.PublicKey;
var policyKeyHash = HashUtility.Blake2b244(policyVkey.Key);

// Create a Policy Script with a type of Script All
var policyScript = ScriptAllBuilder.Create
    .SetScript(NativeScriptBuilder.Create.SetKeyHash(policyKeyHash))
    .Build();

// Generate the Policy Id
var policyId = policyScript.GetPolicyId();
```

Now lets define our token.

```cs
// Create the AWESOME Token
string tokenName = "AWESOME";
uint tokenQuantity = 1;

var tokenAsset = TokenBundleBuilder.Create
    .AddToken(policyId, tokenName.ToBytes(), tokenQuantity);
```

When minting, we will need to add our new token to one of the outputs of our Transaction Body.

```cs
// Generate an Address to send the Token
Address baseAddr = addressService.GetAddress(
    paymentNode.Derive(1).PublicKey, 
    stakingNode.PublicKey, 
    NetworkType.Testnet, 
    AddressType.Base);

// Build Transaction Body with Token Bundle
var transactionBody = TransactionBodyBuilder.Create
    .AddInput(inputTx, 0)
    // Sending to Base Address, includes 100 ADA and the Token we are minting
    .AddOutput(baseAddr, 100, tokenAsset)
    .SetTtl(currentSlot + 1000)
    .SetFee(0)
    .Build();
```

## Handling Token Bundles

When building transaction, we need to ensure we handle tokens properly.

```cs
var tokenBundle = TokenBundleBuilder.Create
    .AddToken(policyId, "Token1".ToBytes(), 100)
    .AddToken(policyId, "Token2".ToBytes(), 200);

Address baseAddr = addressService.GetAddress(
    paymentNode.Derive(1).PublicKey, 
    stakingNode.PublicKey, 
    NetworkType.Testnet, 
    AddressType.Base);

var transactionBody = TransactionBodyBuilder.Create
    .AddInput(inputTx, 0)
    .AddOutput(baseAddr, 2, tokenBundle)
    .AddOutput(changeAddr, 98)
    .SetTtl(currentSlot + 1000)
    .SetFee(0)
    .Build();
```
