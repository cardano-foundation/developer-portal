---
id: mint-nft
title: Mint an NFT
sidebar_label: Mint an NFT
description: Mint a one-of-one NFT on Cardano with CIP-25 metadata, using Evolution, Mesh, or cardano-cli.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

An NFT is just a native token with a quantity of 1, minted under a policy that closes after a set slot so the supply can never grow. The name, image, and description are attached to the minting transaction as CIP-25 metadata (label `721`). This page mints one and sends it to a wallet, pick your tool below.

New to policies and what makes a token "non-fungible"? Read [Minting policies](/docs/developers/curriculum/native-tokens/minting-policies) and [What are native tokens](/docs/developers/curriculum/native-tokens/overview) first. This page is the hands-on version.

## What you'll build

- A minting policy only you can mint from (time-locked, so the supply is provably fixed once the lock slot passes)
- One NFT (quantity 1) carrying CIP-25 metadata
- A transaction that mints it, attaches the metadata, and pays it to a recipient

## Prerequisites

- Test ADA on Preview or Pre-Production ([faucet](/docs/developers/curriculum/start-building/networks-and-test-ada))
- A provider key (Blockfrost) for the SDK tabs, or a running node for cardano-cli
- An image pinned to IPFS (the `ipfs://...` URI goes in the metadata)

:::tip CIP-25 or CIP-68?
**CIP-25** stores metadata in the minting transaction (label 721). Simplest, and what this page uses. **CIP-68** stores metadata in an on-chain datum that a smart contract can read and update later. Choose CIP-68 only if your NFT's metadata needs to change or be read on-chain. See [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry).
:::

## Mint it

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import {
  Address, Assets, NativeScripts, ScriptHash, Time, TransactionMetadatum,
  preprod, Client
} from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!,
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

// Time-locked policy: your key signs, and minting closes at lockSlot, one hour from now
const { paymentCredential } = await client.address()
const lockSlot = Time.getSlotAt(60 * 60 * 1000, "Preprod")
const nativeScript = NativeScripts.makeScriptAll([
  NativeScripts.makeInvalidHereafter(lockSlot).script,   // "before": lockSlot
  NativeScripts.makeScriptPubKey(paymentCredential.hash).script,
])

const policyId = ScriptHash.toHex(ScriptHash.fromScript(nativeScript))
const assetName = "4d794e4654303031"                    // "MyNFT001" in hex

let mintAssets = Assets.fromLovelace(0n)
mintAssets = Assets.addByHex(mintAssets, policyId, assetName, 1n)

let sendAssets = Assets.fromLovelace(2_000_000n)        // min ADA travels with the NFT
sendAssets = Assets.addByHex(sendAssets, policyId, assetName, 1n)

const nftMetadata = new Map([
  [policyId, new Map([
    ["MyNFT001", new Map([                               // CIP-25 v1: the asset name as UTF-8 text
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
  .setValidity({ to: Time.slotToUnixTime(lockSlot, preprod.slotConfig) })   // upper bound = lockSlot
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

The builder handles fees, coin selection, and change. `mintAssets` with quantity `1n` is what makes it non-fungible; `attachMetadata` under `721n` is the CIP-25 standard. `setValidity` sets the transaction's upper bound to `lockSlot`: a `before` policy only validates when that bound is set and is no later than its slot. The builder does not check this for you.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex, BlockfrostProvider, MeshWallet, deserializeAddress } from '@meshsdk/core';

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!);
const wallet = new MeshWallet({
  networkId: 0,                          // 0 = preprod/preview testnet
  fetcher: provider,
  submitter: provider,
  key: { type: "mnemonic", words: process.env.WALLET_MNEMONIC!.split(" ") },
});
await wallet.init();

const changeAddress = await wallet.getChangeAddress();
// Time-locked policy: your key signs, and minting closes at lockSlot, about an hour after the tip
const { pubKeyHash } = deserializeAddress(changeAddress);
const lockSlot = Number((await provider.fetchLatestBlock()).slot) + 3600;
const forgingScript = ForgeScript.fromNativeScript({
  type: "all",
  scripts: [
    { type: "before", slot: lockSlot.toString() },
    { type: "sig", keyHash: pubKeyHash },
  ],
});

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
  .invalidHereafter(lockSlot)              // upper bound = lockSlot
  .changeAddress(changeAddress)
  .selectUtxosFrom(await wallet.getUtxos())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

`ForgeScript.fromNativeScript` serializes the time-locked policy; `.mint("1", ...)` sets quantity 1. `.invalidHereafter(lockSlot)` sets the transaction's upper bound: a `before` policy only validates when that bound is set and is no later than its slot. Mesh does not check this for you.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

The cardano-cli path is the most manual. Full key/address setup is in [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction); the NFT-specific parts are the time-locked policy, the metadata file, and the build flags.

Time-locked policy (`policy/policy.script`):

```json
{
  "type": "all",
  "scripts": [
    { "type": "before", "slot": <future slot> },
    { "type": "sig", "keyHash": "<policy key hash>" }
  ]
}
```

Replace `<future slot>` with a real future slot: the current slot (`cardano-cli latest query tip`) plus a buffer (for example `+ 10000`). A past slot like `0` would make the policy immediately unmintable. Pass the same value as `$slot` to `--invalid-hereafter` below: a `before` policy only validates when the transaction's upper bound is set and is no later than its slot, and cardano-cli does not check this.

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
cardano-cli latest transaction build \
  --tx-in $txhash#$txix \
  --tx-out "$address+1500000+1 $policyid.$tokenname" \
  --change-address $address \
  --mint "1 $policyid.$tokenname" \
  --minting-script-file policy/policy.script \
  --metadata-json-file metadata.json \
  --invalid-hereafter $slot \
  --out-file matx.raw

cardano-cli latest transaction sign \
  --signing-key-file payment.skey --signing-key-file policy/policy.skey \
  --tx-body-file matx.raw --out-file matx.signed
cardano-cli latest transaction submit --tx-file matx.signed
```

</TabItem>
</Tabs>

## Make it a true one-of-one

An NFT derives value from guaranteed scarcity. A **time-locked policy** (the `before` slot in every tab above) means no more tokens can ever be minted under that policy once the deadline passes, enforced at the protocol level. Buyers can verify it by inspecting the policy. Until the deadline, the key holder can still mint more under it; a [one-shot policy](/docs/developers/curriculum/smart-contracts/write-a-validator#one-shot-policies) enforces uniqueness from the first mint. See [Validity intervals](/docs/developers/curriculum/fundamentals/core-concepts/transactions#validity-intervals-and-time).

## Updatable metadata: CIP-68

CIP-25 writes the metadata into the minting transaction, where it is permanent and readable only off-chain. **[CIP-68](https://cips.cardano.org/cip/CIP-68)** instead stores it in an **inline datum on a reference token**, so it can be updated later and read on-chain by smart contracts through reference inputs. Each asset becomes a pair: a **reference token** (asset-name label `100`) held at a script address carrying the metadata datum, and a **user token** (label `222`) that lives in the holder's wallet. For when to choose it over CIP-25, see [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry#cip-68-datum-metadata-updatable-on-chain).

CIP-68 does not require a Plutus minting policy. It requires that both tokens share a policy ID and carry the CIP-67 label prefixes, and that each user token has exactly one reference token, so the time-locked native policy above can mint the pair in one transaction. With a native policy, "exactly one" rests on you as the key holder; a [one-shot policy](/docs/developers/curriculum/smart-contracts/write-a-validator#one-shot-policies) enforces it on-chain. The script that holds the reference token decides who can change the metadata, because an update spends that output and re-creates it with a new datum. An always-succeed script lets anyone rewrite the metadata or take the token, so the minimal holder checks the issuer's signature (Aiken, Plutus V3, see [Smart contracts](/docs/developers/curriculum/smart-contracts/overview)):

```aiken
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}

validator cip68_holder(issuer: VerificationKeyHash) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    list.has(tx.extra_signatories, issuer)
  }

  else(_) {
    fail @"unsupported purpose"
  }
}
```

Save it as `validators/cip68_holder.ak`. Each tab looks it up in `plutus.json` by its title, `cip68_holder.cip68_holder.spend`, applies your key hash as the `issuer` parameter, mints the pair, and sends the (100) token to the resulting holder address with the metadata as its inline datum:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
// setup from the CIP-25 example above, its imports through `policyId`
import { Bytes, Data, InlineDatum, Label, PlutusV3, Text, UPLC } from "@evolution-sdk/evolution"
import blueprint from "./plutus.json" with { type: "json" }   // from `aiken build`

// Metadata lives on the reference token as a CIP-68 datum: Constr 0 [metadata, version, extra]
const metadata = Data.map([
  [Text.toBytes("name"), Text.toBytes("CIP-68 Token")],
  [Text.toBytes("image"), Text.toBytes("ipfs://QmYourImageHashHere")],
])
const referenceDatum = Data.constr(0n, [metadata, 1n, Data.constr(0n, [])])   // extra: Unit when unused

// Asset names carry the CIP-67 label prefix: (100) reference, (222) user
const name = Text.toHex("MyCIP68Token")
const refNameHex  = Label.toLabel(100) + name   // 000643b0...
const userNameHex = Label.toLabel(222) + name   // 000de140...

// The cip68_holder validator, applied to your key hash, holds the reference token
const holderCode = blueprint.validators.find((v) => v.title === "cip68_holder.cip68_holder.spend")!.compiledCode
const holder = new PlutusV3.PlutusV3({
  bytes: Bytes.fromHex(UPLC.applySingleCborEncoding(UPLC.applyParamsToScript(holderCode, [paymentCredential.hash]))),
})
const scriptAddress = new Address.Address({ networkId: 0, paymentCredential: ScriptHash.fromScript(holder) })

let mintAssets = Assets.fromLovelace(0n)
mintAssets = Assets.addByHex(mintAssets, policyId, refNameHex, 1n)
mintAssets = Assets.addByHex(mintAssets, policyId, userNameHex, 1n)

let refOutput = Assets.fromLovelace(2_000_000n)
refOutput = Assets.addByHex(refOutput, policyId, refNameHex, 1n)

const tx = await client
  .newTx()
  .mintAssets({ assets: mintAssets })
  .attachScript({ script: nativeScript })
  // reference token (100) -> holder script, metadata as its inline datum (the user token goes to change)
  .payToAddress({
    address: scriptAddress,
    assets: refOutput,
    datum: new InlineDatum.InlineDatum({ data: referenceDatum }),
  })
  .setValidity({ to: Time.slotToUnixTime(lockSlot, preprod.slotConfig) })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
// setup from the CIP-25 example above, its imports through `policyId`
import { CIP68_100, CIP68_222, applyParamsToScript, serializePlutusScript, assocMap, byteString, conStr0, integer } from "@meshsdk/core";
import blueprint from "./plutus.json" with { type: "json" };   // from `aiken build`

// The cip68_holder validator, applied to your key hash, holds the reference token
const holderCode = blueprint.validators.find((v) => v.title === "cip68_holder.cip68_holder.spend")!.compiledCode;
const holderScript = applyParamsToScript(holderCode, [pubKeyHash]);
const { address: scriptAddress } = serializePlutusScript({ code: holderScript, version: "V3" });

// CIP-68 datum: Constr 0 [metadata, version, extra], with UTF-8 keys and values as bytes
const utf8 = (s: string) => byteString(stringToHex(s));
const referenceDatum = conStr0([
  assocMap([
    [utf8("name"), utf8("CIP-68 Token")],
    [utf8("image"), utf8("ipfs://QmYourImageHashHere")],
  ]),
  integer(1),    // version
  conStr0([]),   // extra: Unit when unused
]);
const tokenNameHex = stringToHex("MyCIP68Token");

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  // reference token (label 100) and user token (label 222), under the same policy
  .mint("1", policyId, CIP68_100(tokenNameHex)).mintingScript(forgingScript)
  .mint("1", policyId, CIP68_222(tokenNameHex)).mintingScript(forgingScript)
  // reference token -> holder script, metadata stored as its inline datum (the user token goes to change)
  .txOut(scriptAddress, [{ unit: policyId + CIP68_100(tokenNameHex), quantity: "1" }])
  .txOutInlineDatumValue(referenceDatum, "JSON")
  .invalidHereafter(lockSlot)
  .changeAddress(changeAddress)
  .selectUtxosFrom(await wallet.getUtxos())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

</TabItem>
</Tabs>

To update the metadata, the issuer spends the reference output and re-creates it with a new datum in a transaction they sign. A larger datum raises the output's [minimum ADA](/docs/developers/curriculum/native-tokens/overview#the-minimum-ada-requirement), so add lovelace when the metadata grows.

## Royalties: CIP-27

A royalty is recorded as a **single token** (empty asset name) under metadata label **`777`**, carrying a rate and a recipient address, minted once under the **same policy** as the NFTs it covers. Marketplaces that honor [CIP-27](https://cips.cardano.org/cip/CIP-27) read label 777 to route a cut of secondary sales to the creator. The policy must be new and unused, and the royalty token must be minted first: marketplaces look only at the first asset minted under a policy. The lock slot is part of the policy ID, so save it and reuse it when you mint the NFTs. Metadata strings are capped at 64 bytes, so the address is written as an array of strings.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Evolution has no royalty-specific helper, so you attach the CIP-27 structure as plain metadata under label `777n`:

```typescript
// setup from the CIP-25 example above, its imports through `policyId`
const royaltyAddress = "addr_test1qz..."   // royalty recipient
const royaltyMetadata = TransactionMetadatum.fromEntries([
  ["rate", "0.05"],                              // 5%
  ["addr", royaltyAddress.match(/.{1,64}/g)!],   // split into strings of at most 64 bytes
])

let royaltyToken = Assets.fromLovelace(0n)
royaltyToken = Assets.addByHex(royaltyToken, policyId, "", 1n)   // empty asset name

const tx = await client
  .newTx()
  .mintAssets({ assets: royaltyToken })
  .attachScript({ script: nativeScript })
  .attachMetadata({ label: 777n, metadata: royaltyMetadata })
  .setValidity({ to: Time.slotToUnixTime(lockSlot, preprod.slotConfig) })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh's `RoyaltiesStandard` type names the address field `address`, but CIP-27 uses the key `addr`, so attach a plain object under label `777`:

```typescript
// setup from the CIP-25 example above, its imports through `policyId`
const royaltyAddress = "addr_test1qz...";   // royalty recipient
const royaltyMetadata = {
  rate: "0.05",                                // 5%
  addr: royaltyAddress.match(/.{1,64}/g)!,     // split into strings of at most 64 bytes
};

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .mint("1", policyId, "")              // empty asset name = the policy's royalty token
  .mintingScript(forgingScript)
  .metadataValue(777, royaltyMetadata)
  .invalidHereafter(lockSlot)
  .changeAddress(changeAddress)
  .selectUtxosFrom(await wallet.getUtxos())
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
| Min UTxO too low | not enough ADA with the NFT | include 2 ADA in the NFT output, comfortably above the floor |

## Next steps

- [Mint a fungible token](/docs/developers/curriculum/native-tokens/mint-fungible): the same flow with quantity greater than 1
- [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry): CIP-25 vs CIP-68, royalties (CIP-27)
- Advanced: the smart contract [one-shot NFT policy](/docs/developers/curriculum/smart-contracts/write-a-validator#one-shot-policies) for protocol-guaranteed uniqueness
- [Lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend): lock your NFT at a script address for sales, swaps, or escrow
