---
id: manage-stake
title: Manage Stake
sidebar_label: Manage stake
description: "Query delegation and rewards for a UI, deregister a stake credential and reclaim the deposit, and combine stake and vote delegation in one transaction."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The delegation from [Delegate and withdraw](/docs/developers/curriculum/staking-governance/delegate-and-withdraw) is in place; this page manages it over its lifetime: reading status and rewards to show in a UI, unwinding the registration when a user leaves, and the combined flow that delegates stake and voting power in one transaction. The snippets reuse the [same setup](/docs/developers/curriculum/staking-governance/delegate-and-withdraw#before-you-start).

## Query delegation and rewards

Read which pool a stake credential is delegated to and how many rewards have accrued, to show status in a UI, or to decide how much to withdraw.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
const delegation = await client.getWalletDelegation()

console.log("Pool:", delegation.poolId)     // null if not delegated
console.log("Rewards:", delegation.rewards) // lovelace
```

To query an arbitrary reward address instead of the wallet's, use `client.getDelegation(rewardAddress)`. Both return `{ poolId, rewards }`.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const rewardAddress = (await wallet.getRewardAddresses())[0]

const info = await provider.fetchAccountInfo(rewardAddress)

console.log("Registered:", info.active)  // false if not registered
console.log("Pool:", info.poolId)        // delegated pool
console.log("Rewards:", info.rewards)    // lovelace, available to withdraw
console.log("Balance:", info.balance)    // total controlled stake
```

`fetchAccountInfo` returns `{ active, poolId, balance, rewards, withdrawals }`.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```shell
cardano-cli query stake-address-info --address $(< stake.addr)
```

```json
[
  {
    "address": "stake_test1ur453z5nxrgvvu9wfyuxut8ss0mrvca4n8ly44tcu8camlqaz98mh",
    "delegationDeposit": 2000000,
    "rewardAccountBalance": 10534638802,
    "stakeDelegation": "pool17xgtj7ayvsaju4clums0mfusla4pmtfm6t4fj6guqqlsvne2mwm",
    "voteDelegation": "scriptHash-59aa3f091b3bcef254abfb89aea64973a61b78fdb2ac44839c7ccba8"
  }
]
```

An empty array (`[]`) means the stake address isn't registered.

</TabItem>
</Tabs>

## Deregister and reclaim the deposit

Deregistering removes the stake credential and refunds the registration deposit. **Withdraw rewards first**. Rewards are lost after deregistration. The best practice is to do both in the same transaction.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
const delegation = await client.getWalletDelegation()

const tx = await client
  .newTx()
  .withdraw({ stakeCredential, amount: delegation.rewards })
  .deregisterStake({ stakeCredential })
  .build()

const signed = await tx.sign()
await signed.submit()
```

Use `deregisterStakeLegacy({ stakeCredential })` if you registered with the legacy certificate.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder } from "@meshsdk/core"

const utxos = await wallet.getUtxosMesh()
const changeAddress = await wallet.getChangeAddressBech32()
const rewardAddress = (await wallet.getRewardAddresses())[0]

// Withdraw the last rewards and deregister in one transaction
const { rewards } = await provider.fetchAccountInfo(rewardAddress)

const txBuilder = new MeshTxBuilder({ fetcher: provider })
const unsignedTx = await txBuilder
  .withdrawal(rewardAddress, rewards)
  .deregisterStakeCertificate(rewardAddress)
  .selectUtxosFrom(utxos)
  .changeAddress(changeAddress)
  .complete()

const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

`deregisterStakeCertificate` reclaims the deposit; pairing it with `withdrawal` in the same transaction avoids losing accrued rewards.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```shell
# Deregistration certificate
cardano-cli latest stake-address deregistration-certificate \
  --stake-verification-key-file stake.vkey \
  --out-file dereg.cert

# Withdraw the last rewards and deregister in one transaction
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --withdrawal "$(< stake.addr)+$(cardano-cli query stake-address-info --address $(< stake.addr) | jq -r .[].rewardAccountBalance)" \
  --certificate-file dereg.cert \
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

## Delegate stake and vote together

Conway-era Cardano has a second, **independent** delegation: governance voting power. You can delegate stake to one pool and your vote to a different DRep, and change either without affecting the other. The full DRep flow lives in [DReps & vote delegation](/docs/developers/curriculum/staking-governance/drep-and-delegation#delegate-your-vote), but because both are stake-credential certificates, you can combine them in a single transaction:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Credential, DRep } from "@evolution-sdk/evolution"

declare const stakeCredential: Credential.Credential
declare const poolKeyHash: any
declare const drepKeyHash: any

// Register + delegate stake + delegate vote, all at once
const tx = await client
  .newTx()
  .registerAndDelegateTo({
    stakeCredential,
    poolKeyHash,
    drep: DRep.fromKeyHash(drepKeyHash)
  })
  .build()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder, deserializePoolId } from "@meshsdk/core"

const rewardAddress = (await wallet.getRewardAddresses())[0]
const poolIdHash = deserializePoolId("pool1...")
const dRepId = "drep1..."   // or { type: "AlwaysAbstain" } / { type: "AlwaysNoConfidence" }

// Register + delegate stake + delegate vote, chained in one transaction
const txBuilder = new MeshTxBuilder({ fetcher: provider })
const unsignedTx = await txBuilder
  .registerStakeCertificate(rewardAddress)               // first time only
  .delegateStakeCertificate(rewardAddress, poolIdHash)   // stake -> pool
  .voteDelegationCertificate({ dRepId }, rewardAddress)  // vote -> DRep
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .changeAddress(await wallet.getChangeAddressBech32())
  .complete()

const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```bash
# stake -> pool
cardano-cli latest stake-address stake-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --stake-pool-id pool1... \
  --out-file deleg.cert

# vote -> DRep
cardano-cli latest stake-address vote-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --drep-key-hash $(< drep.id) \
  --out-file vote-deleg.cert

# build both certificates into one transaction
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file deleg.cert \
  --certificate-file vote-deleg.cert \
  --witness-override 2 \
  --out-file tx.raw
# sign with payment.skey + stake.skey, then submit
```

</TabItem>
</Tabs>

Already registered? Drop the registration step: Evolution `delegateToPoolAndDRep({ stakeCredential, poolKeyHash, drep })`, Mesh just the two delegation certificates. The DRep can also be an abstain or no-confidence option (`DRep.alwaysAbstain()` / `DRep.alwaysNoConfidence()` in Evolution).

## Next steps

- [Governance](/docs/developers/curriculum/staking-governance/governance): what that vote delegation feeds into, the bodies, action types, and ratification rules of on-chain governance
