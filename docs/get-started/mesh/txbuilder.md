---
id: txbuilder
sidebar_position: 9
title: Transaction Builder
sidebar_label: Transaction Builder
description: Build all possible transaction with our cardano-cli like APIs.
image: /img/og/og-getstarted-mesh.png
---

The `MeshTxBuilder` is a powerful low-level APIs that allows you to build and sign transactions.

The `MeshTxBuilder` is a powerful interface where the higher level `Transaction` class is indeed a pre-built combination of the `MeshTxBuilder` APIs. With these lower level APIs, it builds the object to be passing to various serialization libraries.

Check out the [Mesh Playground](https://meshjs.dev/apis/txbuilder) for live demo and full explanation.

## Initialize the MeshTxBuilder

To start building an customized transaction, you need to first initialize MeshTxBuilder:

```
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";

const blockchainProvider = new BlockfrostProvider('<Your-API-Key>');

const txBuilder = new MeshTxBuilder({
  fetcher: blockchainProvider,
  evaluator: blockchainProvider,
});
```

The MeshTxBuilder instance has the following signature:

```
{
  fetcher?: IFetcher;
  submitter?: ISubmitter;
  evaluator?: IEvaluator;
  serializer?: IMeshTxSerializer;
  isHydra?: boolean;
  params?: Partial<Protocol>;
}
```

There are 6 optional fields to pass in to initialized the lower level APIs instance:

- `serializer`: The default serializer is CSLSerializer. You can pass in your own serializer instance.
- `fetcher`: When you build the transaction without sufficient fields as required by the serialization library, we would index the blockchain to fill the information for you. Affected APIs are txIn, txInCollateral, spendingTxInReference.
- `submitter`: It is used if you would like to use the submitter submitTx API directly from the instance.
- `evaluator`: It would perform redeemer execution unit optimization, returning error message in case of invalid transaction.
- `isHydra`: Use another set of default protocol parameters for building transactions.
- `params`: You can pass in the protocol parameters directly.

## Send a value transaction

Sending value with `MeshTxBuilder` come with the `.txOut()` endpoint:

```javascript
.txOut(address: string, amount: Asset[])
```

In order to send values (so as every Cardano transaction), we have to fund the transaction to do so. There are 2 ways to provide values in a transaction:

Specifying which input to spend with:

```javascript
.txIn(txHash: string, txIndex: number, amount?: Asset[], address?: string)
```

Providing an array of UTxOs, and perform auto UTxO selection:

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

