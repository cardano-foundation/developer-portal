---
id: transactions-basic
sidebar_position: 4
title: Basic Transactions
sidebar_label: Basic Transactions
description: Create transactions for sending assets.
image: /img/og/og-getstarted-mesh.png
---

In the code snippet, you will find `txBuilder`, which is an instance of `MeshTxBuilder`, a powerful low-level APIs that allows you to build transactions. Learn how to initialize **MeshTxBuilder**.

```javascript
const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});
```

The `MeshTxBuilder` is a powerful interface where the higher level `Transaction` class is indeed a pre-built combination of the `MeshTxBuilder` APIs. With these lower level APIs, it builds the object to be passing to the serialization libraries like `cardano-sdk` and `Whisky SDK` to construct transactions.

In this page, we will cover how to initialize the `MeshTxBuilder` and the basic operations of building a transaction.


## Initialize Tx Builder

To start building an customized transaction, you need to first initialize `MeshTxBuilder`:

```javascript
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";

const provider = new BlockfrostProvider('<Your-API-Key>');

const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});
```

The `MeshTxBuilder` instance has the following signature:

```javascript
{
  fetcher?: IFetcher;
  submitter?: ISubmitter;
  evaluator?: IEvaluator;
  serializer?: IMeshTxSerializer;
  isHydra?: boolean;
  params?: Partial<Protocol>;
  verbose?: boolean;
}
```

There are 6 optional fields to pass in to initialized the lower level APIs instance:

- `serializer`: The default serializer is `CSLSerializer`. You can pass in your own serializer instance.
- `fetcher`: When you build the transaction without sufficient fields as required by the serialization library, we would index the blockchain to fill the information for you. Affected APIs are `txIn`, `txInCollateral`, `spendingTxInReference`.
- `submitter`: It is used if you would like to use the `submitter` submitTx API directly from the instance.
- `evaluator`: It would perform redeemer execution unit optimization, returning error message in case of invalid transaction.
- `isHydra`: Use another set of default protocol parameters for building transactions.
- `params`: You can pass in the protocol parameters directly.
- `verbose`: Set to `true` to enable verbose logging.


## Send Value

Sending value with `MeshTxBuilder` come with the `.txOut()` endpoint:

```javascript
.txOut(address: string, amount: Asset[])
```

In order to send values (so as every transaction), we have to fund the transaction to do so. There are 2 ways to provide values in a transaction:

- Specifying which input to spend with

```javascript
.txIn(txHash: string, txIndex: number, amount?: Asset[], address?: string)
```


- Providing an array of UTxOs, and perform auto UTxO selection:

```javascript
.selectUtxosFrom(extraInputs: UTxO[])
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

Example code:

```javascript
const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .txOut('addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr', [{ unit: "lovelace", quantity: '1000000' }])
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh website](https://meshjs.dev/apis/txbuilder/basics) to see the full list of APIs.
