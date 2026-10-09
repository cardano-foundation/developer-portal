---
id: governance-operations
title: Governance Operations
sidebar_label: Governance operations
description: "The governance appendix: Constitutional Committee credential management, querying governance state, the CIP-95 wallet API, and governance script purposes."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This appendix collects the governance operations most integrations touch only occasionally: the Constitutional Committee's credential ceremonies, the queries that power governance UIs, and the wallet and validator hooks for building governance features.

## Committee operations

Constitutional Committee members use a **cold/hot credential model**: the cold credential identifies the seat and stays offline; an authorized hot credential does the day-to-day voting. If the hot key is compromised, authorize a new one (it overrides the old); if the cold key is compromised, the only recourse is to resign.

Mesh's transaction builder exposes no committee-certificate helpers, so use Evolution or cardano-cli for these.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Anchor, Credential } from "@evolution-sdk/evolution"

declare const coldCredential: Credential.Credential
declare const hotCredential: Credential.Credential
declare const anchor: Anchor.Anchor

// Authorize a hot credential
const authTx = await client.newTx().authCommitteeHot({ coldCredential, hotCredential }).build()

// Resign the seat
const resignTx = await client.newTx().resignCommitteeCold({ coldCredential, anchor }).build()
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

A member holds a **cold** credential (offline, the on-chain identity) and a **hot** credential (signs votes); an authorization certificate links them, and a new one overrides the previous.

```bash
# cold key pair + its hash (what an update-committee action references)
cardano-cli latest governance committee key-gen-cold \
  --cold-verification-key-file cc-cold.vkey \
  --cold-signing-key-file cc-cold.skey
cardano-cli latest governance committee key-hash \
  --verification-key-file cc-cold.vkey > cc-key.hash

# hot key pair
cardano-cli latest governance committee key-gen-hot \
  --verification-key-file cc-hot.vkey \
  --signing-key-file cc-hot.skey

# authorize the hot credential
cardano-cli latest governance committee create-hot-key-authorization-certificate \
  --cold-verification-key-file cc-cold.vkey \
  --hot-verification-key-file cc-hot.vkey \
  --out-file cc-authorization.cert
```

Submit the certificate in a transaction signed by the payment and cold keys. To step down, submit a resignation certificate the same way:

```bash
cardano-cli latest governance committee create-cold-key-resignation-certificate \
  --cold-verification-key-file cc-cold.vkey \
  --out-file cc-resign.cert
```

Script-based members use `--cold-script-hash` / `--hot-script-hash` instead of the key files.

</TabItem>
</Tabs>

## Query governance state

To show proposals, DRep info, voting power, or committee state in a UI, query your node:

<Tabs>
<TabItem value="cardano-cli" label="cardano-cli" default>

```bash
cardano-cli latest query gov-state                           # committee, constitution, params, proposals
cardano-cli latest query drep-state --all-dreps              # DRep registration: deposit, expiry, anchor
cardano-cli latest query drep-stake-distribution --all-dreps # voting power per DRep
cardano-cli latest query committee-state                     # members, hot-key auth, expiry, threshold
cardano-cli latest query proposals --all-proposals           # actions eligible for ratification
```

</TabItem>
</Tabs>

`query constitution` returns the current constitution anchor and guardrails script hash, and `query gov-state | jq -r .nextRatifyState.nextEnactState.prevGovActionIds` gives the last-enacted action IDs you need for the `--prev-governance-action-*` flags. Query APIs (Blockfrost, Koios, Maestro) expose the same data over HTTP; see [Use a provider](/docs/developers/curriculum/production/use-a-provider).

## Browser wallet APIs (CIP-95)

For a browser dApp, [CIP-95](https://cips.cardano.org/cip/CIP-0095) adds governance methods to the [wallet connector](/docs/developers/curriculum/dapps/connect-a-wallet), so you can read what you need to build governance transactions.

It is an **optional extension**, not part of the CIP-30 core, so two things follow. You have to ask for it when you connect, and a wallet is free to say no. Plenty of wallets implement core CIP-30 only, and your dApp has to handle that rather than assume the methods are there.

<Tabs>
<TabItem value="browser" label="Browser API" default>

```typescript
// Request the extension at enable time
const api = await window.cardano.eternl.enable({ extensions: [{ cip: 95 }] })

// A wallet without CIP-95 still connects, it just returns no cip95 namespace
if (!api.cip95) throw new Error("This wallet does not support governance (CIP-95)")

const dRepKey = await api.cip95.getPubDRepKey()                // the user's DRep key
const stakeKeys = await api.cip95.getRegisteredPubStakeKeys()  // registered stake keys
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshCardanoBrowserWallet } from "@meshsdk/wallet"

const wallet = await MeshCardanoBrowserWallet.enable("eternl", [{ cip: 95 }])

const dRepKey = await wallet.getPubDRepKey()
```

</TabItem>
</Tabs>

`signTx` and `signData` are extended rather than namespaced, so they keep working as before and gain the ability to witness Conway certificates and DRep credentials. For the connection itself, see [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet#governance-cip-95).

## Governance in your validators

Plutus V3 added governance **script purposes**: a validator can run as a `Voting` or `Proposing` script, letting a contract participate in governance under script control. See the `ScriptPurpose` list in [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context#the-scriptpurpose). All the SDK governance operations in this module also support script-controlled credentials: pass a `redeemer` and `attachScript({ script })`, exactly as for [script-controlled stake](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/stake-validator#submitting-the-trigger-off-chain).

## Next steps

- [Smart Contracts](/docs/developers/curriculum/smart-contracts/overview): the next module. Write the validation logic behind the script credentials and governance purposes this module kept pointing at.
- [cardano.org/governance](https://cardano.org/governance): the participant hub. Delegate your vote, become a DRep, and read the constitution.
