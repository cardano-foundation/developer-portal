---
id: transactions-basic
sidebar_position: 4
title: Basic Transactions
sidebar_label: Basic Transactions
description: Create transactions for sending assets.
image: /img/og/og-getstarted-mesh.png
---

As of writing, there are 4 main types of transactions:

- [Send lovelace and assets](transactions-basic) (this tutorial)
- [Interacting with smart contracts](transactions-smart-contract)
- [Minting and burning assets](transactions-minting)
- [Interacting with stake pools](transactions-staking)

In this section, we will explore the following:

- [Send ADA to Addresses](#send-ada-to-addresses)
- [Send Multiple Assets to Addresses](#send-multiple-assets-to-addresses)
- [Send Assets to Handler](#send-assets-to-handler)
- [Send tokens and stable coins to addresses](#send-tokens-and-stable-coins-to-addresses)

## Send ADA to Addresses

You can chain `txBuilder.txOut()` to send lovelace to multiple recipients. For example:

```javascript
import { MeshTxBuilder } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // check out https://meshjs.dev/providers
  verbose: true, // for extra info logging
});
const unsignedTx = await txBuilder
  .txOut("addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr", [
    { unit: "lovelace", quantity: "1000000" },
  ])
  .txOut("addr_test1wzs7xqd6y04p6nyeqjzt8gpuktw4x82p4ve9fmg5vut22ksl6el0e", [
    { unit: "lovelace", quantity: "1500000" },
  ])
  .changeAddress("ANOTHER ADDRESS HERE")
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/basics#send-value) for a detailed explanation.

## Send Multiple Assets to Addresses

We can chain a series of `txBuilder.txOut()` to send multiple assets to multiple recipients. For example:

```javascript
import { MeshTxBuilder } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // check out https://meshjs.dev/providers
  verbose: true, // for extra info logging
});
const unsignedTx = await txBuilder
  .txOut("addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr", [
    { unit: "lovelace", quantity: "1000000" },
  ])
  .txOut("addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr", [
     {
      unit: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
      quantity: "1",
     }
  ])
  .txOut("addr_test1wzs7xqd6y04p6nyeqjzt8gpuktw4x82p4ve9fmg5vut22ksl6el0e", [
    { unit: "lovelace", quantity: "1000000" },
  ])
  .changeAddress("ANOTHER ADDRESS HERE")
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/basics#send-value-toc) for a detailed explanation.

## Send Assets to Handler

We can get the ADA Handle's address with any blockchain providers and calling the `fetchHandleAddress()` function.

For instance, lets send some lovelace to `$jingles`:

```javascript
import { MeshTxBuilder } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // check out https://meshjs.dev/providers
  verbose: true, // for extra info logging
});
const unsignedTx = await txBuilder
  .txOut("addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr", [
    { unit: "lovelace", quantity: "1000000" },
  ])
  .txOut("ANOTHER ADDRESS HERE", [{ unit: "lovelace", quantity: "1500000" }])
  .changeAddress("addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr")
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

## Send tokens and stable coins to addresses

The `txOut` method allows us to send various Cardano assets.

For instance, lets send some DJED to ADA to `jingles`:

```javascript
import { MeshTxBuilder } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // check out https://meshjs.dev/providers
  verbose: true, // for extra info logging
});
const address = await provider.fetchHandleAddress("jingles");

const unsignedTx = await txBuilder
  .txOut(address, [
    { unit: "DJED", quantity: "1000000" },
  ])
  .txOut(address, [{ unit: "lovelace", quantity: "1000000" }])
  .changeAddress("ANOTHER ADDRESS")
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [full documentation](https://meshjs.dev/apis/txbuilder) for more examples and full explanation.

