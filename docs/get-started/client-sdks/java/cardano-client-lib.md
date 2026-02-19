---
id: cardano-client-lib
title: Cardano Client Lib - Java SDK for Cardano
sidebar_label: Cardano Client Lib
description: A comprehensive Java client library for building Cardano applications with transaction building, smart contract support, and multiple backend providers.
image: /img/og/og-developer-portal.png
---

## Introduction

Cardano Client Lib is a Java library that simplifies interaction with the Cardano blockchain. It provides a high-level API for transaction building, smart contract integration, and account management, with support for multiple backend providers including Blockfrost, Koios, and Ogmios/Kupo.

The library follows a modular architecture with fine-grained dependencies, so you can include only the components you need.

## Key Features

- High-level **QuickTx API** and **Composable Functions API** for transaction building
- HD wallet support (BIP32, BIP39, CIP1852)
- Plutus smart contract support
- Native script and multi-asset transaction support
- Governance API
- CIP standard implementations (CIP8, CIP20, CIP25, CIP27, CIP30, CIP67, CIP68)
- Multiple backend providers (Blockfrost, Koios, Ogmios/Kupo)

## Installation

**Maven:**

```xml
<dependency>
    <groupId>com.bloxbean.cardano</groupId>
    <artifactId>cardano-client-lib</artifactId>
    <version>0.7.1</version>
</dependency>

<!-- Add a backend provider (e.g., Blockfrost) -->
<dependency>
    <groupId>com.bloxbean.cardano</groupId>
    <artifactId>cardano-client-backend-blockfrost</artifactId>
    <version>0.7.1</version>
</dependency>
```

**Gradle:**

```groovy
implementation 'com.bloxbean.cardano:cardano-client-lib:0.7.1'
implementation 'com.bloxbean.cardano:cardano-client-backend-blockfrost:0.7.1'
```

Other available backend providers:
- `cardano-client-backend-koios` for [Koios](https://www.koios.rest/)
- `cardano-client-backend-ogmios` for [Ogmios](https://ogmios.dev/)/[Kupo](https://cardanosolutions.github.io/kupo/)

## Quick Example

Here's an example of sending ADA using the QuickTx API:

```java
Tx tx1 = new Tx()
        .payToAddress(receiver1Addr, Amount.ada(1.5))
        .payToAddress(receiver2Addr, Amount.ada(2.5))
        .attachMetadata(MessageMetadata.create().add("This is a test message 2"))
        .from(sender1Addr);

Tx tx2 = new Tx()
        .payToAddress(receiver2Addr, Amount.ada(4.5))
        .from(sender2Addr);

QuickTxBuilder quickTxBuilder = new QuickTxBuilder(backendService);
Result<String> result = quickTxBuilder
        .compose(tx1, tx2)
        .feePayer(sender1Addr)
        .withSigner(SignerProviders.signerFrom(sender1))
        .withSigner(SignerProviders.signerFrom(sender2))
        .completeAndWait(System.out::println);
```

## Resources

- [GitHub Repository](https://github.com/bloxbean/cardano-client-lib)
- [Documentation](https://cardano-client.dev)
- [JavaDoc](https://javadoc.io/doc/com.bloxbean.cardano/cardano-client-core/latest/index.html)
- [Example Projects](https://github.com/bloxbean/cardano-client-examples)
- [Discord Community](https://discord.gg/JtQ54MSw6p)
