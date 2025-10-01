---
id: txbuilder
sidebar_position: 9
title: Transaction Builder
sidebar_label: Transaction Builder
description: Build all possible transaction with our cardano-cli like APIs.
image: /img/og/og-getstarted-mesh.png
---

`MeshTxBuilder` is a powerful interface of low-level APIs that allow you to build and sign transactions.
It builds the transaction object, which then can be passed to various serialization libraries.

Check out [this page](https://meshjs.dev/apis/txbuilder/basics) for a detailed explanation.

## Initialize the MeshTxBuilder

To start building customized transactions, you need to first initialize an instance of `MeshTxBuilder`:

```javascript
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";

const blockchainProvider = new BlockfrostProvider('<Your-API-Key>');

const txBuilder = new MeshTxBuilder({
  fetcher: blockchainProvider,
  evaluator: blockchainProvider,
});
```

The `MeshTxBuilder` constructor accepts the following parameters:

```javascript
{
  fetcher?: IFetcher;
  submitter?: ISubmitter;
  evaluator?: IEvaluator;
  serializer?: IMeshTxSerializer;
  selector?: IInputSelector;
  isHydra?: boolean;
  params?: Partial<Protocol>;
  verbose?: boolean;
}
```

A brief explanation:

- `fetcher`: When you build a transaction without sufficient fields as required by the serialization library,
we would index the blockchain to fill the missing information for you. Affected APIs are: `txIn`, `txInCollateral`, `spendingTxInReference`.
- `submitter`: It is used if you would like to use the submitter's `submitTx` API directly from the instance.
- `evaluator`: It would perform redeemer execution unit calculation, returning error message in case of invalid transaction.
- `serializer`: The default serializer is `CSLSerializer`. You can pass in your own serializer instance.
- `selector`: The default selector is `CardanoSDKInputSelector`. You can pass in your own selector instance.
- `isHydra`: Use another set of default protocol parameters for building transactions.
- `params`: You can pass in the protocol parameters directly.

## Send a Value Transaction

Sending value with `MeshTxBuilder` comes with the `.txOut()` endpoint:

```javascript
.txOut(address: string, amount: Asset[])
```

In order to send values (so as every Cardano transaction), we have to fund the transaction to do so. There are 2 ways to provide values in a transaction:

1. By specifying which input to spend with:

```javascript
.txIn(txHash: string, txIndex: number, amount?: Asset[], address?: string)
```

2. Providing an array of UTxOs, and perform auto UTxO selection:

```javascript
.selectUtxosFrom(extraInputs: UTxO[], strategy?: UtxoSelectionStrategy, threshold?: string, includeTxFees?: boolean)
```

Since the input and output values might not be the same, we have to specify the address (usually own's address) to receive change:

```javascript
.changeAddress(addr: string)
```

The following shows a simple example of building a transaction to send values with UTxO selection:

```javascript
txBuilder
  .txOut(address, [{ unit: "lovelace", quantity: amount }])
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();
```

Check out [this page](https://meshjs.dev/apis/txbuilder/basics#send-value) for a detailed explanation.
