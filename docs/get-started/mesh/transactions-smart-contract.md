---
id: transactions-smart-contract
sidebar_position: 5
title: Smart Contracts Transactions
sidebar_label: Smart Contracts Transactions
description: Create transactions to work with smart contracts.
image: /img/og/og-getstarted-mesh.png
---

In this guide, you will understand all logics you need to know for interacting with smart contracts with `MeshTxBuilder`.

In Cardano, whenever you need the nodes' computing power to execute a smart contract, you need to provide collateral to prevent spamming. You will see this is everywhere when script execution is needed in below's examples, and here's how you can do so:

```javascript
txBuilder
  .txInCollateral(txHash: string, txIndex: number, amount?: Asset[], address?: string)
```

## Lock Assets

Locking assets meaning sending value to a script address with datum.

Same as `Transaction` demo, we will lock selected assets from your wallet in an `always succeed` smart contract. We use one API to represent sending value, another API to represent attaching datum to complete the locking assets process:

```javascript
// For inline datumtxBuilder
  .txOut(address, assets)
  .txOutInlineDatumValue(data)
```

```javascript
// For datum hashtxBuilder
  .txOut(address, assets)
  .txOutDatumHashValue(data)
```

The lower level APIs support providing your datum in all Mesh `Data` (default), JSON and CBOR representations. For details and helper utilities, please check <Link href="/apis/data">Data section</Link>.

```javascript
// For inline datum provided in JSONtxBuilder
  .txOut(address, assets)
  .txOutInlineDatumValue(jsonData, "JSON")
```

Example code:
```javascript
const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

const script: PlutusScript = {
  code: demoPlutusAlwaysSucceedScript,
  version: "V2",
};
const { address: scriptAddress } = serializePlutusScript(script);

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .txOut(scriptAddress, [{ unit: "d9312da562da182b02322fd8acb536f37eb9d29fba7c49dc172555274d657368546f6b656e", quantity: "1" }])
  .txOutInlineDatumValue("meshsecretcode")
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

## Unlock Assets

Unlocking with `MeshTxBuilder` starts with anyone of the below script version indicators:

```javascript
.spendingPlutusScriptV1()
.spendingPlutusScriptV2()
.spendingPlutusScriptV3()
```

Followed by specifying the exact script input to spend with:

```javascript
.txIn(txHash: string, txIndex: number, amount?: Asset[], address?: string)
```

In Cardano, if you want to unlock assets from a script address, you have to provide 3 other necessary information apart from `.txIn()` itself. They are:

- Actual script
- Datum of the input
- Redeemer of the unlock

**Actual script**
The actual script can be either provided by transaction builder or referenced from an UTxO onchain.

- (i) Reference script
```javascript
.spendingTxInReference()
```

- (ii) Supplying script
```javascript
.txInScript(scriptCbor: string)
```

**Datum of the input**

Similar to script, datum can also either be provided by transaction builder or as inline datum.

- (i) Referencing inline datum
```javascript
.txInInlineDatumPresent()
```

- (ii) Supplying datum
```javascript
.txInDatumValue(datum: Data | object | string, type?: "Mesh" | "CBOR" | "JSON")
```

**Redeemer of the unlock**

Redeemer can be provided in different <Link href="/apis/data">data types</Link>. If your MeshTxBuilder does not include an `evaluator` instance, you can also provide your budget for the unlock with this redeemer endpoint

```javascript
.txInRedeemerValue(redeemer: Data | object | string, type: "Mesh" | "CBOR" | "JSON", exUnits?: Budget)
```

An example of complete set of endpoints to unlock assets from a script address:

```javascript
const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

txBuilder
  .spendingPlutusScriptV2()
  .txIn(txHash: string, txIndex: number, amount?: Asset[], address?: string)
  .txInInlineDatumPresent() // or .txInDatumValue(datum: Data | string | object)
  .txInRedeemerValue(redeemer: Data | object | string, type?: string, exUnits?: Budget)
  .spendingTxInReference(txHash: string, txIndex: number, spendingScriptHash?: string) // or supplying script
```

Example code:
```javascript
const utxos = await wallet.getUtxos();
const collateral = await wallet.getCollateral();
const changeAddress = await wallet.getChangeAddress();

const script: PlutusScript = {
  code: demoPlutusAlwaysSucceedScript,
  version: "V2",
};
const { address: scriptAddress } = serializePlutusScript(script);

const assetUtxo = await fetchAssetUtxo({
  address: scriptAddress,
  asset: userInput,
  datum: userInput2,
});
if (assetUtxo === undefined) {
  throw "Asset UTXO not found";
}

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .spendingPlutusScriptV2()
  .txIn(assetUtxo.input.txHash, assetUtxo.input.outputIndex)
  .txInInlineDatumPresent()
  .txInRedeemerValue(mConStr0([]))
  .txInScript(demoPlutusAlwaysSucceedScript)
  .changeAddress(changeAddress)
  .txInCollateral(
    collateral[0]?.input.txHash!,
    collateral[0]?.input.outputIndex!,
    collateral[0]?.output.amount!,
    collateral[0]?.output.address!,
  )
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh website](https://meshjs.dev/apis/txbuilder/smart-contracts) to see the full list of APIs.