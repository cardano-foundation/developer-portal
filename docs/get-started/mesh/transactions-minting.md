---
id: transactions-minting
sidebar_position: 6
title: Minting Transactions - Mesh SDK (Open-Source Library for Building Web3 Apps on the Cardano Blockchain)
sidebar_label: Minting Transactions
description: Learn to use ForgeScript to create minting transactions for minting and burning native assets.
image: ../img/og/og-getstarted-mesh.png
---

In this section, we will learn to use ForgeScript to create minting transactions for minting and burning native assets. If you are new to transactions, be sure to check out how to create transactions to [send lovelace and assets](transactions-basic).

In this section, we will explore the following:

- [Minting Assets](#minting-assets)
- [Burning Assets](#burning-assets)

## Minting Assets

We will see how to mint native assets with a `ForgeScript`.

```javascript
import { Transaction, ForgeScript } from "@meshsdk/core";
import type { Mint, AssetMetadata } from "@meshsdk/core";

// prepare forgingScript
const usedAddress = await wallet.getUsedAddresses();
const address = usedAddress[0];
const forgingScript = ForgeScript.withOneSignature(address);

const tx = new Transaction({ initiator: wallet });

// define asset#1 metadata
const assetMetadata1: AssetMetadata = {
  name: "Mesh Token",
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT is minted by Mesh (https://meshjs.dev/).",
};
const asset1: Mint = {
  assetName: "MeshToken",
  assetQuantity: "1",
  metadata: assetMetadata1,
  label: "721",
  recipient: "addr_test1vpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0c7e4cxr",
};
tx.mintAsset(forgingScript, asset1);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Additionally, you can define the forging script with NativeScript. For example if you want to have a policy locking script, you can do this:

```javascript
import type { NativeScript } from "@meshsdk/core";

const nativeScript: NativeScript = {
  type: "all",
  scripts: [
    {
      type: "before",
      slot: "<insert slot here>",
    },
    {
      type: "sig",
      keyHash: "<insert keyHash here>",
    },
  ],
};

const forgingScript = ForgeScript.fromNativeScript(nativeScript);
```

[Try demo](https://meshjs.dev/apis/transaction/minting#minting)

## Burning Assets

Like minting assets, we need to define the `ForgeScript`. We use the first wallet address as the "minting address". Note that, assets can only be burned by its minting address.

```javascript
import { Transaction, ForgeScript } from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";

// prepare forgingScript
const usedAddress = await wallet.getUsedAddresses();
const address = usedAddress[0];
const forgingScript = ForgeScript.withOneSignature(address);

const tx = new Transaction({ initiator: wallet });

// burn asset#1
const asset1: Asset = {
  unit: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
  quantity: "1",
};
tx.burnAsset(forgingScript, asset1);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh Playground](https://meshjs.dev/apis/transaction/minting) for live demo and full explanation.
