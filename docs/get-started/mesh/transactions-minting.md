---
id: transactions-minting
sidebar_position: 6
title: Minting Transactions
sidebar_label: Minting Transactions
description: Learn to use ForgeScript to create minting transactions for minting and burning native assets.
image: /img/og/og-getstarted-mesh.png
---

Minting and burning assets with Native Script and Plutus Script

Minting and burning assets is a common operation in blockchain applications. In the Cardano ecosystem, minting and burning are achieved through Native Scripts and Plutus Scripts.

To view a video demonstration of this feature of the MeshSDK, navigate to the video guide [Mint an NFT Collection](https://meshjs.dev/guides/nft-collection).

In this page, you will find the APIs to create transactions for minting and burning assets.

## Minting with One Signature

In this section, we will see how to mint native assets with a `MeshTxBuilder`. For minting assets with smart contract, visit MeshTxBuilder - Smart Contract - Minting Assets with Smart Contract.

Firstly, we need to define the `forgingScript` with `ForgeScript`. We use the first wallet address as the "minting address" (you can use other addresses).

```javascript
const changeAddress = await wallet.getChangeAddress();
const forgingScript = ForgeScript.withOneSignature(changeAddress);
```

Then, we define the metadata.

```javascript
const demoAssetMetadata = {
  name: "Mesh Token",
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};
const policyId = resolveScriptHash(forgingScript);
const tokenName = "MeshToken";
const tokenNameHex = stringToHex(tokenName);
const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };
```

Finally, we create a transaction and mint the asset with the lower level APIs.

```javascript
const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .txIn(utxo.input.txHash, utxo.input.outputIndex)
  .mint("1", policyId, tokenName)
  .mintingScript(forgingScript)
  .changeAddress(changeAddress)
  .complete();
```

Example code:

```javascript
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';
import type { Asset } from '@meshsdk/core';

const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();
const forgingScript = ForgeScript.withOneSignature(changeAddress);

const demoAssetMetadata = {
  name: "Mesh Token",
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};
const policyId = resolveScriptHash(forgingScript);
const tokenName = "MeshToken";
const tokenNameHex = stringToHex(tokenName);
const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .mint("1", policyId, tokenNameHex)
  .mintingScript(forgingScript)
  .metadataValue(721, metadata)
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh website](https://meshjs.dev/apis/txbuilder/minting) to see the full list of APIs.
