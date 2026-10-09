---
id: drep-and-delegation
title: DReps & Vote Delegation
sidebar_label: DReps & vote delegation
description: "Register as a DRep with a key- or script-based credential and delegate voting power, from an application with Evolution, Mesh, and cardano-cli."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Governance participation starts with the two operations on this page: registering a **DRep**, the credential votes are cast with, and delegating voting power to one. The SDK snippets assume the same provider and wallet setup as [staking](/docs/developers/curriculum/staking-governance/delegate-and-withdraw#before-you-start): an Evolution `client`, or a Mesh `provider` and `wallet` with a fresh `MeshTxBuilder` per transaction. Each operation also has a **cardano-cli** tab with the key-based flow; the deeper cli ceremonies (script and Plutus DReps) continue beneath the relevant sections.

## Register as a DRep

Becoming a DRep is a registration certificate with a refundable deposit (`drepDeposit`, currently 500 ADA) and an optional anchor describing who you are ([CIP-119](https://cips.cardano.org/cip/CIP-0119) metadata).

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Anchor, Credential } from "@evolution-sdk/evolution"

declare const drepCredential: Credential.Credential
declare const anchor: Anchor.Anchor

// Register (add `anchor` to attach metadata)
const tx = await client.newTx().registerDRep({ drepCredential, anchor }).build()
const signed = await tx.sign()
await signed.submit()
```

Update metadata with `updateDRep({ drepCredential, anchor })` and step down with `deregisterDRep({ drepCredential })` (the deposit is refunded). The deposit is fetched from protocol parameters automatically.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { hashDrepAnchor } from "@meshsdk/core"

const dRep = await wallet.getDRep()

// Optional CIP-119 metadata describing the DRep, hashed and anchored on-chain
const anchorUrl = "https://example.com/drep.jsonld"
const anchorMetadata = { /* CIP-119 metadata object */ }
const anchorDataHash = hashDrepAnchor(anchorMetadata)   // hashes the metadata, not the URL

txBuilder
  .drepRegistrationCertificate(dRep.dRepIDCip105, { anchorUrl, anchorDataHash })
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

Update metadata with `drepUpdateCertificate(dRepId, { anchorUrl, anchorDataHash })` and step down with `drepDeregistrationCertificate(dRepId)` (the deposit is refunded). See the [Mesh governance guide](https://meshjs.dev/apis/txbuilder/governance).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Generate the DRep key pair:

```bash
cardano-cli latest governance drep key-gen \
  --verification-key-file drep.vkey \
  --signing-key-file drep.skey
```

Build the registration certificate with the deposit and an optional metadata anchor. Query `dRepDeposit` rather than hardcoding it; the value below is the current 500 ADA:

```bash
cardano-cli latest governance drep registration-certificate \
  --drep-verification-key-file drep.vkey \
  --key-reg-deposit-amt 500000000 \
  --drep-metadata-url https://example.com/drep.jsonld \
  --drep-metadata-hash a14a5ad4f36bddc00f92ddb39fd9ac633c0fd43f8bfa57758f9163d10ef916de \
  --out-file drep-reg.cert
```

Build the transaction (`--witness-override 2` covers the payment and DRep signatures), sign with both keys, and submit:

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file drep-reg.cert \
  --witness-override 2 \
  --out-file tx.raw

cardano-cli latest transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file drep.skey \
  --out-file tx.signed

cardano-cli latest transaction submit --tx-file tx.signed
```

</TabItem>
</Tabs>

### Script-based and Plutus DReps

A DRep credential can also be a script hash instead of a key hash. The flow mirrors the key-based path, but the DRep ID is the hash of the script and the transaction carries a witness (multisig) or a redeemer (Plutus) instead of a plain DRep key signature.

For a **simple-script (multisig) DRep**, write a native script (for example `type: atLeast` over the members' DRep key hashes), hash it for the DRep ID, and register against that script hash:

<Tabs>
<TabItem value="cardano-cli" label="cardano-cli" default>

```bash
cardano-cli hash script --script-file drep-multisig.json --out-file drep-multisig.id

cardano-cli latest governance drep registration-certificate \
  --drep-script-hash "$(< drep-multisig.id)" \
  --key-reg-deposit-amt 500000000 \
  --out-file drep-multisig-reg.cert
```

</TabItem>
</Tabs>

Build with `--certificate-script-file drep-multisig.json`, then collect one `transaction witness` per member and combine them with `transaction assemble`. A **Plutus-script DRep** registers the same way (`--drep-script-hash` from `cardano-cli hash script` on the `.plutus` file), but the transaction supplies collateral and a redeemer rather than script witnesses:

<Tabs>
<TabItem value="cardano-cli" label="cardano-cli" default>

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --tx-in-collateral $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --certificate-file drep.cert \
  --certificate-script-file drep.plutus \
  --certificate-redeemer-value {} \
  --change-address $(< payment.addr) \
  --out-file tx.raw
```

</TabItem>
</Tabs>

Only the payment key signs; script validity comes from the redeemer, not a DRep key signature.


## Delegate your vote

Voting power delegation is **separate from and independent of stake delegation**. You can delegate stake to one pool and your vote to a different DRep, and change either without affecting the other. There are also two built-in options for holders who don't want to pick a DRep: **Abstain** (not counted) and **No Confidence** (counts against the committee). In the Conway era, staking rewards keep accruing, but you cannot withdraw them until your stake credential has delegated its vote, to a DRep or to a predefined option (Abstain or No Confidence).

Both delegations attach to your **stake credential**, the part of your address separate from the payment credential. See [Addresses](/docs/developers/curriculum/fundamentals/core-concepts/addresses) for how the two combine.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Credential, DRep } from "@evolution-sdk/evolution"

declare const stakeCredential: Credential.Credential
declare const drepKeyHash: any

// Delegate to a specific DRep
const tx = await client
  .newTx()
  .delegateToDRep({ stakeCredential, drep: DRep.fromKeyHash(drepKeyHash) })
  .build()

// Or a built-in option:
//   drep: DRep.alwaysAbstain()
//   drep: DRep.alwaysNoConfidence()
```

To register stake and delegate the vote in one step, use `registerAndDelegateTo({ stakeCredential, drep })`; to do stake + vote together, see [Manage stake](/docs/developers/curriculum/staking-governance/manage-stake#delegate-stake-and-vote-together).

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const dRepId = "drep1..."   // a registered DRep (or use { type: "AlwaysAbstain" } / { type: "AlwaysNoConfidence" })
const rewardAddress = (await wallet.getRewardAddresses())[0]

txBuilder
  .voteDelegationCertificate({ dRepId }, rewardAddress)
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())

const unsignedTx = await txBuilder.complete()
const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Create the vote-delegation certificate from your stake key. Target a registered DRep with `--drep-key-hash` (or `--drep-script-hash`), or pick `--always-abstain` / `--always-no-confidence`:

```bash
cardano-cli latest stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --drep-key-hash $(< drep.id) \
  --out-file vote-deleg.cert
```

Build, sign with the payment and stake keys, and submit:

```bash
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file vote-deleg.cert \
  --witness-override 2 \
  --out-file tx.raw

cardano-cli latest transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --out-file tx.signed

cardano-cli latest transaction submit --tx-file tx.signed
```

</TabItem>
</Tabs>

## Next steps

- [Vote & propose](/docs/developers/curriculum/staking-governance/vote-and-propose): cast votes with the DRep you registered, and put actions on-chain
