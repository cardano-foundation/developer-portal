---
id: transactions-minting
sidebar_position: 6
title: Minting Transactions
sidebar_label: Minting Transactions
description: Learn to use ForgeScript to create minting transactions for minting and burning native assets.
image: /img/og/og-getstarted-mesh.png
---

In this section, we will learn how to use ForgeScript to create transactions for minting and burning native assets.
If you are new to transactions, be sure to check out [how to send lovelace and assets](transactions-basic).

In this section, we will explore the following:

- [Minting Assets](#minting-assets)
- [Burning Assets](#burning-assets)

## Minting Assets

First, we will see how to mint native assets with a `ForgeScript`.

```javascript
import { resolveScriptHash, ForgeScript, stringToHex } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // checkout https://meshjs.dev/providers
  verbose: true, // for extra info logging
});

const tokenName = "Mesh Token";
const tokenNameHex = stringToHex(tokenName);
const script = ForgeScript.withOneSignature(mainAddr);
const policyId = resolveScriptHash(script);

const assetMetadata = {
  [policyId]: {
    [tokenName]: {
      name: tokenName,
      image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
      mediaType: "image/jpg",
      description: "This NFT is minted by Mesh (https://meshjs.dev/).",
    },
  },
};

const unsignedTx = await txBuilder
  .mint("1", policyId, tokenNameHex)
  .mintingScript(script)
  .metadataValue("721", assetMetadata)
  .selectUtxosFrom(utxos)
  .changeAddress(mainAddr)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
return await wallet.submitTx(signedTx);

```

Additionally, you can define the forging script with a `NativeScript`. For example if you want to have a policy locking script, you can do this:

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

[Check out this page](https://meshjs.dev/apis/txbuilder/minting#minting-with-one-signature) for a detailed explanation.

## Burning Assets

Same as during the minting step, we need to define the `ForgeScript`. We use the first wallet address as the "minting address". Note that assets can only be burned by their minting address owner.

```javascript
import { resolveScriptHash, ForgeScript, stringToHex } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // checkout https://meshjs.dev/providers
  verbose: true, // for extra info logging
});

const tokenName = "Mesh Token";
const tokenNameHex = stringToHex(tokenName);
const script = ForgeScript.withOneSignature(mainAddr);
const policyId = resolveScriptHash(script);

const assetMetadata = {
  [policyId]: {
    [tokenName]: {
      name: tokenName,
      image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
      mediaType: "image/jpg",
      description: "This NFT is minted by Mesh (https://meshjs.dev/).",
    },
  },
};

const unsignedTx = await txBuilder
  .mint("-1", policyId, tokenNameHex)
  .mintingScript(script)
  .metadataValue("721", assetMetadata)
  .selectUtxosFrom(utxos)
  .changeAddress(mainAddr)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
return await wallet.submitTx(signedTx);

```

[Check out this page](https://meshjs.dev/apis/txbuilder/minting#burning-assets) for a detailed explanation.
