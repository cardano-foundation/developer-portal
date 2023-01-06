---
id: transactions-basic
sidebar_position: 4
title: Basic Transactions - Mesh SDK (Open-Source Library for Building Web3 Apps on the Cardano Blockchain)
sidebar_label: Basic Transactions
description: Create transactions for sending assets.
image: ../img/og/og-getstarted-mesh.png
---

As of writing, there are 4 main types of transactions:

- [Send lovelace and assets](transactions-basic) (this)
- [Interacting with smart contracts](transactions-smart-contract)
- [Minting and burning assets](transactions-minting)
- [Interacting with stakepools](transactions-staking)

In this section, we will explore the following:

- [Send ADA to Addresses](#send-ada-to-addresses)
- [Send Multiple Assets to Addresses](#send-multiple-assets-to-addresses)
- [Send Assets to Handler](#send-assets-to-handler)

## Send ADA to Addresses

You can chain `tx.sendLovelace()` to send to multiple recipients. For example:

```javascript
import { Transaction } from "@meshsdk/core";

const tx = new Transaction({ initiator: wallet })
  .sendLovelace(
    "addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr",
    "1000000"
  )
  .sendLovelace("ANOTHER ADDRESS HERE", "1500000");
const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/transaction#sendAda)

## Send Multiple Assets to Addresses

We can chain a series of `tx.sendAssets()` and `tx.sendLovelace()` to send multiple assets to multiple recipients. For example:

```javascript
import { Transaction, Asset } from "@meshsdk/core";

const tx = new Transaction({ initiator: wallet })
  .sendLovelace(
    "addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr",
    "1000000"
  )
  .sendAssets(
    "addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr",
    [
      {
        unit: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
        quantity: "1",
      },
    ]
  )
  .sendLovelace("ANOTHER ADDRESS HERE", "1500000");

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/transaction#sendAssets)

## Send Assets to Handler

We can get the ADA Handle's address with any blockchain providers and calling the `fetchHandleAddress()` function.

For instance, lets send some lovelace to `$jingles`:

```javascript
import { KoiosProvider, Transaction } from "@meshsdk/core";

const koios = new KoiosProvider("api");

const tx = new Transaction({ initiator: wallet }).sendLovelace(
  await koios.fetchHandleAddress("jingles"),
  "1000000"
);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh Playground](https://meshjs.dev/apis/transaction) for live demo and full explanation.
