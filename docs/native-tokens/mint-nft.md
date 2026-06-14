---
id: mint-nft
title: Mint an NFT
sidebar_label: Mint an NFT
description: Mint a one-of-one NFT on Cardano with CIP-25 metadata, using Evolution, Mesh, or cardano-cli.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

An NFT is just a native token with a quantity of 1, made permanently unique by a minting policy that can only ever run once. The name, image, and description are attached to the minting transaction as CIP-25 metadata (label `721`). This guide mints one and sends it to a wallet, pick your tool below.

New to policies and what makes a token "non-fungible"? Read [Minting policies](/docs/native-tokens/minting-policies) and [What are native tokens](/docs/native-tokens/overview) first. This page is the hands-on version.

## What you'll build

- A minting policy only you can mint from (time-locked, so the supply is provably fixed)
- One NFT (quantity 1) carrying CIP-25 metadata
- A transaction that mints it, attaches the metadata, and pays it to a recipient

## Prerequisites

- Test ADA on Preview or Pre-Production ([faucet](/docs/first-steps/networks-and-test-ada))
- A provider key (Blockfrost) for the SDK tabs, or a running node for cardano-cli
- An image pinned to IPFS (the `ipfs://...` URI goes in the metadata)

:::tip CIP-25 or CIP-68?
**CIP-25** stores metadata in the minting transaction (label 721). Simplest, and what this guide uses. **CIP-68** stores metadata in an on-chain datum that a smart contract can read and update later. Choose CIP-68 only if your NFT's metadata needs to change or be read on-chain. See [Token metadata & registry](/docs/native-tokens/metadata-registry).
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
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';

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
const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .mint("1", policyId, stringToHex(tokenName))
  .mintingScript(forgingScript)
  .metadataValue(721, metadata)            // CIP-25
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

`ForgeScript.withOneSignature` derives the policy from your address; `.mint("1", ...)` sets quantity 1.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

The cardano-cli path is the most manual. Full key/address setup is in [Your first transaction](/docs/first-steps/your-first-transaction); the NFT-specific parts are the time-locked policy, the metadata file, and the build flags.

Time-locked policy (`policy/policy.script`):

```json
{
  "type": "all",
  "scripts": [
    { "type": "before", "slot": 0 },
    { "type": "sig", "keyHash": "<policy key hash>" }
  ]
}
```

Set the `before` slot to the current slot plus a buffer (for example `+ 10000`).

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

An NFT derives value from guaranteed scarcity. A **time-locked policy** (the `before` slot above, or a time-lock on the native script in the SDK tabs) means no more tokens can ever be minted under that policy once the deadline passes, enforced at the protocol level. Buyers can verify it by inspecting the policy. See [Validity intervals](/docs/value/transactions#validity-intervals-and-time).

## Common pitfalls

| Problem | Cause | Fix |
|---|---|---|
| NFT not showing in wallet | metadata structure mismatch | policy ID and asset name in metadata must exactly match the minted token |
| "Minting not allowed" | wrong key signed | the signing key's hash must match the policy |
| Type error on label (Evolution) | `721` instead of `721n` | use the bigint `721n` |
| Min UTxO too low | not enough ADA with the NFT | include about 2 ADA in the NFT output |

## Next steps

- [Mint a fungible token](/docs/native-tokens/mint-fungible): the same flow with quantity greater than 1
- [Token metadata & registry](/docs/native-tokens/metadata-registry): CIP-25 vs CIP-68, royalties (CIP-27)
- Advanced: [Smart Contracts](/docs/build/smart-contracts/overview) for a smart contract one-shot NFT policy
