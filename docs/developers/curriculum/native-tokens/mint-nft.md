---
id: mint-nft
title: Mint an NFT
sidebar_label: Mint an NFT
description: Mint a one-of-one NFT on Cardano with CIP-25 metadata, using Evolution, Mesh, or cardano-cli.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

An NFT is just a native token with a quantity of 1, made permanently unique by a minting policy that can only ever run once. The name, image, and description are attached to the minting transaction as CIP-25 metadata (label `721`). This guide mints one and sends it to a wallet, pick your tool below.

New to policies and what makes a token "non-fungible"? Read [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies) and [What are native tokens](/docs/developers/curriculum/native-tokens/overview) first. This page is the hands-on version.

## What you'll build

- A minting policy only you can mint from (time-locked, so the supply is provably fixed)
- One NFT (quantity 1) carrying CIP-25 metadata
- A transaction that mints it, attaches the metadata, and pays it to a recipient

## Prerequisites

- Test ADA on Preview or Pre-Production ([faucet](/docs/developers/curriculum/start-building/networks-and-test-ada))
- A provider key (Blockfrost) for the SDK tabs, or a running node for cardano-cli
- An image pinned to IPFS (the `ipfs://...` URI goes in the metadata)

:::tip CIP-25 or CIP-68?
**CIP-25** stores metadata in the minting transaction (label 721). Simplest, and what this guide uses. **CIP-68** stores metadata in an on-chain datum that a smart contract can read and update later. Choose CIP-68 only if your NFT's metadata needs to change or be read on-chain. See [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry).
:::

## Mint it

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import {
  Address, Assets, NativeScripts, Bytes, TransactionMetadatum,
  preprod, Client
} from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const myKeyHash = Bytes.fromHex("abc123def456abc123def456abc123def456abc123def456abc123de")
const mintingPolicy = NativeScripts.makeScriptPubKey(myKeyHash)
const nativeScript = new NativeScripts.NativeScript({ script: mintingPolicy })

const policyId = "abc123def456abc123def456abc123def456abc123def456abc123de"
const assetName = "4d794e4654303031"                    // "MyNFT001" in hex

let mintAssets = Assets.fromLovelace(0n)
mintAssets = Assets.addByHex(mintAssets, policyId, assetName, 1n)

let sendAssets = Assets.fromLovelace(2_000_000n)        // min ADA travels with the NFT
sendAssets = Assets.addByHex(sendAssets, policyId, assetName, 1n)

const nftMetadata = new Map([
  [policyId, new Map([
    [assetName, new Map([
      ["name", "My First NFT"],
      ["image", "ipfs://QmYourImageHashHere"],
      ["mediaType", "image/png"],
      ["description", "Minted with Evolution SDK"],
    ])]
  ])]
])

const tx = await client
  .newTx()
  .mintAssets({ assets: mintAssets })
  .attachScript({ script: nativeScript })
  .attachMetadata({ label: 721n, metadata: nftMetadata })   // 721n, bigint
  .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: sendAssets })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

The builder handles fees, coin selection, and change. `mintAssets` with quantity `1n` is what makes it non-fungible; `attachMetadata` under `721n` is the CIP-25 standard.

</TabItem>
<TabItem value="mesh" label="Mesh">

```javascript
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex, BlockfrostProvider } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!);
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
  networkId: 0,                          // 0 = preprod/preview testnet
  walletAddressType: AddressType.Base,
  fetcher: provider,
  submitter: provider,
  mnemonic: process.env.WALLET_MNEMONIC!.split(" "),
});

const changeAddress = await wallet.getChangeAddressBech32();
const forgingScript = ForgeScript.withOneSignature(changeAddress);

const demoAssetMetadata = {
  name: "Mesh Token",
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};
const policyId = resolveScriptHash(forgingScript);
const tokenName = "MeshToken";
const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .mint("1", policyId, stringToHex(tokenName))
  .mintingScript(forgingScript)
  .metadataValue(721, metadata)            // CIP-25
  .changeAddress(changeAddress)
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

`ForgeScript.withOneSignature` derives the policy from your address; `.mint("1", ...)` sets quantity 1.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

The cardano-cli path is the most manual. Full key/address setup is in [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction); the NFT-specific parts are the time-locked policy, the metadata file, and the build flags.

Time-locked policy (`policy/policy.script`):

```json
{
  "type": "all",
  "scripts": [
    { "type": "before", "slot": 90000000 },
    { "type": "sig", "keyHash": "<policy key hash>" }
  ]
}
```

Set the `before` slot to a real future slot: the current slot plus a buffer (for example `+ 10000`). A past slot like `0` would make the policy immediately unmintable.

CIP-25 metadata (`metadata.json`):

```json
{ "721": { "<policyID>": { "NFT1": {
  "name": "Cardano NFT guide token",
  "description": "My first NFT",
  "image": "ipfs://<hash>"
} } } }
```

Build, sign, and submit (set `--testnet-magic 1|2` or `--mainnet`):

```bash
cardano-cli conway transaction build \
  --tx-in $txhash#$txix \
  --tx-out "$address+1500000+1 $policyid.$tokenname" \
  --change-address $address \
  --mint "1 $policyid.$tokenname" \
  --minting-script-file policy/policy.script \
  --metadata-json-file metadata.json \
  --invalid-hereafter $slot \
  --out-file matx.raw

cardano-cli conway transaction sign \
  --signing-key-file payment.skey --signing-key-file policy/policy.skey \
  --tx-body-file matx.raw --out-file matx.signed
cardano-cli conway transaction submit --tx-file matx.signed
```

</TabItem>
</Tabs>

## Make it a true one-of-one

An NFT derives value from guaranteed scarcity. A **time-locked policy** (the `before` slot above, or a time-lock on the native script in the SDK tabs) means no more tokens can ever be minted under that policy once the deadline passes, enforced at the protocol level. Buyers can verify it by inspecting the policy. See [Validity intervals](/docs/developers/curriculum/fundamentals/core-concepts/transactions#validity-intervals-and-time).

## Updatable metadata: CIP-68

CIP-25 writes the metadata into the minting transaction, where it is permanent and readable only off-chain. **[CIP-68](https://cips.cardano.org/cip/CIP-68)** instead stores it in an **inline datum on a reference token**, so it can be updated later and read on-chain by smart contracts through reference inputs. Each asset becomes a pair: a **reference token** (asset-name label `100`) held at a script address carrying the metadata datum, and a **user token** (label `222`) that lives in the holder's wallet. For when to choose it over CIP-25, see [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry#cip-68-datum-metadata-updatable-on-chain).

Minting both tokens in one transaction needs a Plutus minting policy and an always-succeed reference-token holder (see [Smart contracts](/docs/developers/curriculum/smart-contracts/overview)). Both SDKs ship CIP-68 helpers:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Assets, Bytes, Text, Data, InlineDatum, Address, preprod, Client } from "@evolution-sdk/evolution"
import { CIP68Metadata } from "@evolution-sdk/evolution/plutus"

const client = Client.make(preprod)
  .withBlockfrost({ baseUrl: "https://cardano-preprod.blockfrost.io/api/v0", projectId: process.env.BLOCKFROST_API_KEY! })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

// Metadata lives on the reference token as a typed CIP-68 datum
const metadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("CIP-68 Token")],
  [Text.toBytes("image"), Text.toBytes("ipfs://QmYourImageHashHere")],
])
const referenceDatum: CIP68Metadata.CIP68Datum = { metadata, version: 1n, extra: [] }

// Asset names carry the CIP-67 label prefix: (100) reference, (222) user
const name = Text.toBytes("MyCIP68Token")
const refNameHex  = Bytes.toHex(new Uint8Array([0x00, 0x0f, 0x42, 0x00, ...name]))
const userNameHex = Bytes.toHex(new Uint8Array([0x00, 0x0f, 0x42, 0x02, ...name]))

// Your compiled minting policy and the always-succeed script address holding the reference token
declare const mintingScript: any
declare const policyId: string
const scriptAddress = Address.fromBech32("addr_test1...")

let mintAssets = Assets.fromLovelace(0n)
mintAssets = Assets.addByHex(mintAssets, policyId, refNameHex, 1n)
mintAssets = Assets.addByHex(mintAssets, policyId, userNameHex, 1n)

let refOutput = Assets.fromLovelace(2_000_000n)
refOutput = Assets.addByHex(refOutput, policyId, refNameHex, 1n)

const tx = await client
  .newTx()
  .mintAssets({ assets: mintAssets, redeemer: Data.constr(0n, []) })
  .attachScript({ script: mintingScript })
  // reference token (100) -> script address, metadata as its inline datum (the user token goes to change)
  .payToAddress({
    address: scriptAddress,
    assets: refOutput,
    datum: new InlineDatum.InlineDatum({ data: CIP68Metadata.Codec.toData(referenceDatum) }),
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import {
  MeshTxBuilder, BlockfrostProvider, resolveScriptHash, stringToHex,
  mConStr0, mTxOutRef, applyParamsToScript, serializePlutusScript,
  metadataToCip68, CIP68_100, CIP68_222,
} from "@meshsdk/core";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!);
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
  networkId: 0, walletAddressType: AddressType.Base,
  fetcher: provider, submitter: provider,
  mnemonic: process.env.WALLET_MNEMONIC!.split(" "),
});
const txBuilder = new MeshTxBuilder({ fetcher: provider });

const utxos = await wallet.getUtxosMesh();
const collateral = (await wallet.getCollateralMesh())[0];
const changeAddress = await wallet.getChangeAddressBech32();

// Your compiled Plutus scripts (see Smart contracts): an always-succeed holder
// for the reference token, and a one-time minting policy.
const alwaysSucceedCbor = "...";         // PlutusScript V1 CBOR
const oneTimeMintingPolicyCbor = "...";  // parameterized minting policy CBOR

const userTokenMetadata = {
  name: "CIP-68 Token",
  image: "ipfs://QmYourImageHashHere",
  mediaType: "image/png",
  description: "A CIP-68 token with updatable, on-chain metadata",
};

const { address: scriptAddress } = serializePlutusScript({ code: alwaysSucceedCbor, version: "V1" });

// Parameterize the policy by the UTXO it consumes, so it can only ever run once
const scriptCode = applyParamsToScript(oneTimeMintingPolicyCbor, [
  mTxOutRef(utxos[0].input.txHash, utxos[0].input.outputIndex),
]);
const policyId = resolveScriptHash(scriptCode, "V2");
const tokenNameHex = stringToHex("MyCIP68Token");

const unsignedTx = await txBuilder
  .txIn(utxos[0].input.txHash, utxos[0].input.outputIndex, utxos[0].output.amount, utxos[0].output.address)
  // reference token (label 100) -> script address, metadata stored as its datum
  .mintPlutusScriptV2().mint("1", policyId, CIP68_100(tokenNameHex)).mintingScript(scriptCode).mintRedeemerValue(mConStr0([]))
  // user token (label 222) -> the holder's wallet
  .mintPlutusScriptV2().mint("1", policyId, CIP68_222(tokenNameHex)).mintingScript(scriptCode).mintRedeemerValue(mConStr0([]))
  .txOut(scriptAddress, [{ unit: policyId + CIP68_100(tokenNameHex), quantity: "1" }])
  .txOutInlineDatumValue(metadataToCip68(userTokenMetadata))
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
  .complete();

const signedTx = await wallet.signTx(unsignedTx, true);
const txHash = await wallet.submitTx(signedTx);
```

</TabItem>
</Tabs>

Mesh's `metadataToCip68` / `CIP68_100` / `CIP68_222` helpers and Evolution's typed `CIP68Metadata` schema reach the same result by different routes (helper functions versus a typed codec): encode the metadata as the reference token's datum and apply the CIP-67 label prefixes. To **update** the metadata later, spend the reference UTXO and recreate it with a new datum.

## Royalties: CIP-27

A royalty is recorded as a **single token** (empty asset name) under metadata label **`777`**, carrying a rate and a recipient address, minted once under the **same policy** as the NFTs it covers. Marketplaces that honor [CIP-27](https://cips.cardano.org/cip/CIP-27) read label 777 to route a cut of secondary sales to the creator.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Evolution has no royalty-specific helper, so you attach the CIP-27 structure as plain metadata under label `777n`:

```typescript
import { Assets } from "@evolution-sdk/evolution"

// reuse the client and your single-signature native policy from above
const royaltyMetadata = new Map([
  ["rate", "0.05"],            // 5%
  ["addr", "addr_test1qz..."], // royalty recipient
])

let royaltyToken = Assets.fromLovelace(0n)
royaltyToken = Assets.addByHex(royaltyToken, policyId, "", 1n)   // empty asset name

const tx = await client
  .newTx()
  .mintAssets({ assets: royaltyToken })
  .attachScript({ script: nativeScript })
  .attachMetadata({ label: 777n, metadata: royaltyMetadata })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh ships a typed `RoyaltiesStandard` helper for the 777 structure:

```typescript
import { MeshTxBuilder, ForgeScript, resolveScriptHash, RoyaltiesStandard } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({ fetcher: provider });   // same provider + wallet as above
const address = (await wallet.getUsedAddressesBech32())[0];
const forgingScript = ForgeScript.withOneSignature(address);
const policyId = resolveScriptHash(forgingScript);

const royaltyMetadata: RoyaltiesStandard = {
  rate: "0.05",                 // 5%
  address: "addr_test1qz...",   // royalty recipient
};

const unsignedTx = await txBuilder
  .mint("1", policyId, "")              // empty asset name = the policy's royalty token
  .mintingScript(forgingScript)
  .metadataValue(777, royaltyMetadata)
  .changeAddress(address)
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

</TabItem>
</Tabs>

## Common pitfalls

| Problem | Cause | Fix |
|---|---|---|
| NFT not showing in wallet | metadata structure mismatch | policy ID and asset name in metadata must exactly match the minted token |
| "Minting not allowed" | wrong key signed | the signing key's hash must match the policy |
| Type error on label (Evolution) | `721` instead of `721n` | use the bigint `721n` |
| Min UTxO too low | not enough ADA with the NFT | include about 2 ADA in the NFT output |

## Next steps

- [Mint a fungible token](/docs/developers/curriculum/native-tokens/mint-fungible): the same flow with quantity greater than 1
- [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry): CIP-25 vs CIP-68, royalties (CIP-27)
- Advanced: the smart contract [one-shot NFT policy](/docs/developers/curriculum/smart-contracts/write-a-validator#one-shot-policies) for protocol-guaranteed uniqueness
- [Lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend): lock your NFT at a script address for sales, swaps, or escrow
