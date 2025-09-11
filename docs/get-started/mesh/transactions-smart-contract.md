---
id: transactions-smart-contract
sidebar_position: 5
title: Smart Contracts Transactions
sidebar_label: Smart Contracts Transactions
description: Create transactions to work with smart contracts.
image: /img/og/og-getstarted-mesh.png
---

In this section, we will look at how to create transactions to work with smart contracts. If you are new to transactions, be sure to check out how to create transactions to [send lovelace and assets](transactions-basic).

We have also released a collection of Aiken smart contracts and its corresponding transactions. You can check out the [GitHub repository](https://meshjs.dev/smart-contracts) for complete code examples and our [dedicated page](https://meshjs.dev/smart-contracts) for full explanation.

In this section, we will explore the following:

- [Lock Assets in Smart Contract](#lock-assets-in-smart-contract)
- [Unlock Assets from Smart Contract](#unlock-assets-from-smart-contract)
- [Minting Assets with Smart Contract](#minting-assets-with-smart-contract)

## Lock Assets in Smart Contract

Token locking is a Cardano feature where certain assets are guarded by smart contracts. 
Once locked, they can be unlocked by meeting the conditions defined in the locking script.
The correct Datum must be attached to the locking transaction; otherwise, you may not be able to withdraw your assets.

To lock assets in the always succeed contract:

```javascript
import { MeshTxBuilder } from "@meshsdk/core";

// always succeed script address
const scriptAddress = "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8";

const utxos = await wallet.getUtxos();
const myAddress = (await wallet.getUsedAddress("payment")).toBech32();

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // check out https://meshjs.dev/providers
  verbose: true, // for extra info logging
});
const unsignedTx = await txBuilder
  .txOut(scriptAddress, [
    { 
      unit: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
      quantity: "1"
    },
  ])
  .txOutInlineDatumValue("supersecret")
  .changeAddress(myAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/smart-contracts#lock-assets) for a detailed explanation

## Unlock Assets from Smart Contract

Now that we have locked our token in the Always Succeed smart contract, we can create a transaction that unlocks our asset from the script's address.
To do so, we need to provide 3 components required for each transaction involving smart contracts:

1, Script (hex-encoded Cbor or refence script) 
2. Redeemer (Cbor-encoded, or PlutusData)
3. Datum (hash, if the locking transaction used datum-by-hash, or inline datum)

```javascript
async function _getAssetUtxo({ scriptAddress, asset, datum }) {
  // check out https://meshjs.dev/providers
  const utxos = await provider.fetchAddressUTxOs(scriptAddress, asset);

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

// Always Succeed contract script
const script  = {
  code: "4e4d01000033222220051200120011",
  version: "V1",
};

const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true, // for extra info logging
});

// create the unlock asset transaction
const unsignedTx = await txBuilder
  .txOut(scriptAddress, [
    { 
      unit: "64af286e2ad0df4de2e7de15f8ff5b3d27faecf4ab2757056d860a424d657368546f6b656e",
      quantity: "1"
    },
  ])
  .txOutInlineDatumValue("supersecret")
  .changeAddress("ANOTHER ADDRESS HERE")
  .selectUtxosFrom(utxos)
  .complete();

// note that the partial sign is set to true
const signedTx = await wallet.signTx(unsignedTx, true);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/smart-contracts#unlock-assets) for a detailed explanation.

## Minting Assets with Smart Contract

We can use a Plutus Script to mint tokens. This script is designed to always succeed, meaning that anyone can sign and mint tokens with it, as there are no validation on this script.

```javascript
import {
  MeshTxBuilder,
  mConStr0,
  resolveScriptHash,
  stringToHex,
  builtinByteString,
  deserializeAddress,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-cst";

const alwaysSucceedMintScript =
  applyParamsToScript("585401010029800aba2aba1aab9eaab9dab9a4888896600264653001300600198031803800cc0180092225980099b8748000c01cdd500144c9289bae30093008375400516401830060013003375400d149a26cac8009", [])

// get owner's pub-key hash
const { pubKeyHash } = deserializeAddress(mainAddr);

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // checkout https://meshjs.dev/providers
  verbose: true, // for extra info logging
});

const tokenName = "Mesh Token";
const tokenNameHex = stringToHex(tokenName);
const policyId = resolveScriptHash(scriptCbor, "V3");
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
  .mintPlutusScript("V3")
  .mint("1", policyId, tokenNameHex)
  .metadataValue("721", assetMetadata)
  .mintingScript(alwaysSucceedMintScript)
  .mintRedeemerValue(mConStr0([]))
  .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
  .txOutInlineDatumValue([
    firstUtxo.input.txHash,
    firstUtxo.input.outputIndex,
    tokenNameHex,
  ])
  .txOut(mainAddr, [
    {
      unit: "lovelace",
      quantity: "10000000",
    },
    { quantity: 1, unit: policyId + tokenNameHex },
  ])
  .selectUtxosFrom(utxos)
  .requiredSignerHash(pubKeyHash)
  .changeAddress(mainAddr)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
return await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/minting#minting-assets-with-plutus-script) for a detailed explanation.
