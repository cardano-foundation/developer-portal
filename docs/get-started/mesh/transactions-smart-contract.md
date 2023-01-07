---
id: transactions-smart-contract
sidebar_position: 5
title: Smart Contracts Transactions - Mesh SDK (Open-Source Library for Building Web3 Apps on the Cardano Blockchain)
sidebar_label: Smart Contracts Transactions
description: Create transactions to work with smart contracts.
image: ../img/og/og-getstarted-mesh.png
---

In this section, we will look at how to create transactions to work with smart contracts. If you are new to transactions, be sure to check out how to create transactions to [send lovelace and assets](transactions-basic).

In this section, we will explore the following:

- [Lock Assets in Smart Contract](#lock-assets-in-smart-contract)
- [Unlock Assets from Smart Contract](#unlock-assets-from-smart-contract)
- [Minting Assets with Smart Contract](#minting-assets-with-smart-contract)

## Lock Assets in Smart Contract

Token locking is a feature where certain assets are reserved on the smart contract. The assets can only be unlocked when certain conditions are met, for example, when making a purchase.

To lock assets in the always succeed contract:

```javascript
import { Transaction } from "@meshsdk/core";

// this is the script address of always succeed contract
const scriptAddress = "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8";

const tx = new Transaction({ initiator: wallet }).sendAssets(
  {
    address: scriptAddress,
    datum: {
      value: "supersecret",
    },
  },
  [
    {
      unit: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
      quantity: "1",
    },
  ]
);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/transaction/smart-contract#lockAssets)

## Unlock Assets from Smart Contract

As we may have locked assets in the contract, you can create transactions to unlock the assets with a redeemer that corresponds to the datum. Define the corresponding code to create the datum, only a transaction with the corrent datum hash is able to unlock the asset. Define the unit of the locked asset to search for the UTXO in the smart contract, which is required for the transaction's input.

```javascript
async function _getAssetUtxo({ scriptAddress, asset, datum }) {
  const koios = new KoiosProvider("preprod");

  const utxos = await koios.fetchAddressUTxOs(scriptAddress, asset);

  const dataHash = resolveDataHash(datum);

  let utxo = utxos.find((utxo: any) => {
    return utxo.output.dataHash == dataHash;
  });

  return utxo;
}

// fetch input UTXO
const assetUtxo = await _getAssetUtxo({
  scriptAddress: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
  asset: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
  datum: "supersecret",
});

// get wallet change address
const address = await wallet.getChangeAddress();

// create the unlock asset transaction
const tx = new Transaction({ initiator: wallet })
  .redeemValue({
    value: assetUtxo,
    script: {
      version: "V1",
      code: "4e4d01000033222220051200120011",
    },
    datum: "supersecret",
  })
  .sendValue(address, assetUtxo) // address is recipient address
  .setRequiredSigners([address]);

const unsignedTx = await tx.build();
// note that the partial sign is set to true
const signedTx = await wallet.signTx(unsignedTx, true);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/transaction/smart-contract#unlockAssets)

## Minting Assets with Smart Contract

We can use a Plutus Script to mint tokens. This script is designed to always succeed, meaning that anyone can sign and mint tokens with it, as there are no validation on this script.

```javascript
import {
  Transaction,
  AssetMetadata,
  Mint,
  Action,
  PlutusScript,
} from "@meshsdk/core";

const script: PlutusScript = {
  code: plutusMintingScriptCbor,
  version: "V2",
};

const redeemer: Partial<Action> = {
  tag: "MINT",
};

const tx = new Transaction({ initiator: wallet });

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
tx.mintAsset(script, asset1, redeemer);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh Playground](https://meshjs.dev/apis/transaction/smart-contract) for live demo and full explanation.
