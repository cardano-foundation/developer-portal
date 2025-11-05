---
id: mesh
title: How to create a metadata transaction using Mesh
sidebar_label: Mesh
description: How to create a metadata transaction using Mesh SDK
image: /img/og/og-developer-portal.png
---

:::note
This guide assumes that you have a basic understanding of Mesh SDK and how to use it. We recommend checking out the [Mesh documentation](https://meshjs.dev) first if you're new to Mesh.
:::

## Setup

### Initialize the Blockchain Provider

First, set up a [blockchain provider](https://meshjs.dev/providers). You can use Blockfrost, Koios, or any other supported provider:

```tsx
import { BlockfrostProvider } from "@meshsdk/core";

const provider = new BlockfrostProvider('<Your-Blockfrost-API-Key>');
```

### Initialize Mesh Wallet

Next, initialize the Mesh Wallet. You can use either mnemonic phrases or CLI-generated keys:

```tsx
import { MeshWallet } from "@meshsdk/core";

const meshWallet = new MeshWallet({
  networkId: 0, // 0 for testnet, 1 for mainnet
  fetcher: provider,
  submitter: provider,
  key: {
    type: 'mnemonic',
    words: ['your', 'mnemonic', 'phrase', 'here'], // Replace with your mnemonic
  },
});
```

Alternatively, if you're building a frontend application and want to use a browser wallet:

```tsx
import { BrowserWallet } from "@meshsdk/core";

const wallet = await BrowserWallet.enable('eternl'); // or any other wallet
```

## Build and submit transaction with metadata

There are two common approaches to adding metadata to transactions:

1. **Standardized transaction messages (CIP-20)** - Using label `674` with the `msg` key for comments/memos/invoices
2. **Custom application metadata** - Using any label (like `1337`) with your own data structure

Both approaches follow the general design specification for JSON metadata. **Strings** must be at most 64 bytes when UTF-8 encoded, and top-level keys must be integers between 0 and 2^64 - 1.

### Example: Transaction message (CIP-20)

[CIP-20](https://cips.cardano.org/cip/CIP-0020) defines a standardized format for transaction messages using label `674`. This format is widely supported by wallets and explorers and the label `674` was chosen because it is the T9 encoding of "msg".

```tsx
import { BlockfrostProvider, MeshWallet, MeshTxBuilder } from "@meshsdk/core";

// Initialize provider
const provider = new BlockfrostProvider('<Your-Blockfrost-API-Key>');

// Initialize wallet
const meshWallet = new MeshWallet({
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  key: {
    type: 'mnemonic',
    words: ['your', 'mnemonic', 'phrase', 'here'],
  },
});

// Define metadata
const label = 674;
const metadata = {
  msg: [
    'Invoice-No: 1234567890',
    'Customer-No: 555-1234',
  ],
};

// Build transaction
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});

const utxos = await meshWallet.getUtxos();
const changeAddress = await meshWallet.getChangeAddress();

const unsignedTx = await txBuilder
  .changeAddress(changeAddress)
  .metadataValue(label, metadata)
  .selectUtxosFrom(utxos)
  .complete();

// Sign and submit
const signedTx = await meshWallet.signTx(unsignedTx);
const txHash = await meshWallet.submitTx(signedTx);

console.log(`Transaction submitted with hash: ${txHash}`);
```

### Example: Custom metadata

You can also add custom metadata with any label and structure that fits your application needs. The label `1337` used in this example is arbitrary and can be replaced with any valid label according to your application's needs:

```tsx
import { BlockfrostProvider, MeshWallet, MeshTxBuilder } from "@meshsdk/core";

// Initialize provider and wallet (same as previous example)
const provider = new BlockfrostProvider('<Your-Blockfrost-API-Key>');
const meshWallet = new MeshWallet({
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  key: {
    type: 'mnemonic',
    words: ['your', 'mnemonic', 'phrase', 'here'],
  },
});

// Define custom metadata
const label = 1337;
const metadata = {
  name: "hello world",
  completed: 0,
};

// Build transaction
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});

const utxos = await meshWallet.getUtxos();
const changeAddress = await meshWallet.getChangeAddress();

const unsignedTx = await txBuilder
  .changeAddress(changeAddress)
  .metadataValue(label, metadata)
  .selectUtxosFrom(utxos)
  .complete();

// Sign and submit
const signedTx = await meshWallet.signTx(unsignedTx);
const txHash = await meshWallet.submitTx(signedTx);

console.log(`Transaction submitted with hash: ${txHash}`);
```

Congratulations, you are now able to submit **Cardano** transactions with metadata embedded into them using Mesh SDK!

## Learn more

For more information about Mesh SDK and building transactions, check out:

- [Mesh Transaction Builder Documentation](https://meshjs.dev/apis/txbuilder)
- [Mesh Providers](https://meshjs.dev/providers)
