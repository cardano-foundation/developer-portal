---
id: mint-fungible
title: Mint a Fungible Token
sidebar_label: Mint a fungible token
description: Mint and burn a fungible native token on Cardano with Evolution, Mesh, or cardano-cli.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

A fungible token is a native token minted with a quantity greater than one, where every unit is interchangeable. You define a [minting policy](/docs/developers/curriculum/native-tokens/minting-policies), mint the supply, and the tokens then move through ordinary transactions. Pick your tool below.

## What you'll build

- A signature-based minting policy
- A supply of one fungible token minted to your own address
- (Optional) a burn transaction that destroys some of them

## Prerequisites

- Test ADA on Preview or Pre-Production ([faucet](/docs/developers/curriculum/start-building/networks-and-test-ada))
- A provider key (Blockfrost) for the SDK tabs, or a running node for cardano-cli
- Min-ADA travels with tokens, keep a little ADA in the output ([why](/docs/developers/curriculum/native-tokens/overview#the-minimum-ada-requirement))

## Mint it

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Assets, Data, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const mintingPolicy: any   // native script or smart contract, see Minting policies

const policyId = "7edb7a2d9fbc4d2a68e4c9e9d3d7a5c8f2d1e9f8a7b6c5d4e3f2a1b0"
const assetName = "4d79546f6b656e"          // "MyToken" in hex

let assets = Assets.fromLovelace(0n)
assets = Assets.addByHex(assets, policyId, assetName, 1000n)   // quantity > 1

const tx = await client
  .newTx()
  .mintAssets({ assets, redeemer: Data.constr(0n, []), label: "mint-my-token" })
  .attachScript({ script: mintingPolicy })
  .build()

const signed = await tx.sign()
await signed.submit()
```

The builder tracks the policy, indexes redeemers, evaluates execution units, and calculates fees for you.

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

const policyId = resolveScriptHash(forgingScript);
const tokenName = "MeshToken";

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .mint("1000000", policyId, stringToHex(tokenName))   // quantity > 1
  .mintingScript(forgingScript)
  .changeAddress(changeAddress)
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

`ForgeScript.withOneSignature` derives a signature policy from your address.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Full key, address, and node setup is in [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction). The token-specific steps:

Signature policy (`policy/policy.script`):

```json
{ "keyHash": "<policy key hash>", "type": "sig" }
```

Get the policy ID, then build, sign, and submit (token name hex-encoded):

```bash
cardano-cli conway transaction policyid --script-file policy/policy.script > policy/policyID

cardano-cli conway transaction build-raw \
  --fee $fee \
  --tx-in $txhash#$txix \
  --tx-out "$address+$output+$amount $policyid.$tokenname" \
  --mint "$amount $policyid.$tokenname" \
  --minting-script-file policy/policy.script \
  --out-file matx.raw
# calculate-min-fee, rebuild with the fee, then:
cardano-cli conway transaction sign \
  --signing-key-file payment.skey --signing-key-file policy/policy.skey \
  --tx-body-file matx.raw --out-file matx.signed
cardano-cli conway transaction submit --tx-file matx.signed
```

</TabItem>
</Tabs>

## Burn tokens

Burning is minting with a negative quantity, authorized by the same policy.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
let burn = Assets.fromLovelace(0n)
burn = Assets.addByHex(burn, policyId, assetName, -500n)

const tx = await client
  .newTx()
  .mintAssets({ assets: burn, redeemer: Data.constr(1n, []), label: "burn-tokens" })
  .attachScript({ script: mintingPolicy })
  .build()

await (await tx.sign()).submit()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```javascript
// same imports, provider, wallet, forgingScript, policyId, and tokenName as "Mint it" above
const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .mint("-500", policyId, stringToHex(tokenName))   // negative quantity burns
  .mintingScript(forgingScript)                     // same policy that minted
  .changeAddress(await wallet.getChangeAddressBech32())
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```bash
cardano-cli conway transaction build-raw \
  --tx-in $txhash#$txix \
  --tx-out "$address+$output+$remaining $policyid.$tokenname" \
  --mint "-500 $policyid.$tokenname" \
  --minting-script-file policy/policy.script \
  --out-file burn.raw
# sign with payment.skey + policy.skey, then submit
```

</TabItem>
</Tabs>

## Next steps

- [Mint an NFT](/docs/developers/curriculum/native-tokens/mint-nft): quantity 1, plus CIP-25 metadata and a time-lock
- [Token metadata & registry](/docs/developers/curriculum/native-tokens/metadata-registry): give your token a name, ticker, and decimals
- [Lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend): lock tokens at a script address to build escrows, swaps, or token sales
