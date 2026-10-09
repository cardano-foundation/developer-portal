---
id: delegate-and-withdraw
title: Delegate and Withdraw
sidebar_label: Delegate and withdraw
description: "Register a stake credential, delegate it to a pool, and withdraw the rewards it earns, from an application with Evolution, Mesh, and cardano-cli."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This page is the first half of the [staking lifecycle](/docs/developers/curriculum/staking-governance/staking#the-staking-lifecycle) in code: register the stake credential, delegate it to a pool, and withdraw the rewards it earns. Each operation is a single transaction, shown in Evolution, Mesh, and cardano-cli.

## Before you start

The snippets below set up a provider and a wallet once and reuse them; each transaction uses a fresh builder.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const address = await client.address()
const stakeCredential = address.stakingCredential!   // staking certificates act on this
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core"
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet"

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!)
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
  networkId: 0,                          // 0 = preprod/preview testnet
  walletAddressType: AddressType.Base,
  fetcher: provider,
  submitter: provider,
  mnemonic: process.env.WALLET_MNEMONIC!.split(" "),
})
// staking certificates act on the wallet's reward address;
// each operation builds with a fresh new MeshTxBuilder({ fetcher: provider })
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

You need `payment.skey` / `payment.addr` plus a registered stake key pair (`stake.vkey` / `stake.skey`). Operations that touch the stake credential are signed by both keys.

</TabItem>
</Tabs>

## Register and delegate

Delegating for the first time means two things: registering the stake credential (a small refundable deposit) and delegating it to a pool. The Conway era added a combined certificate that does both in one step and saves a certificate fee, so either way it's a single transaction.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Credential } from "@evolution-sdk/evolution"

declare const stakeCredential: Credential.Credential
declare const poolKeyHash: any

const tx = await client
  .newTx()
  .registerAndDelegateTo({ stakeCredential, poolKeyHash })
  .build()

const signed = await tx.sign()
await signed.submit()
```

You can also chain the two certificates explicitly, which is what you'd do with legacy (pre-Conway, no-deposit) registration:

```typescript
// Conway certificates
const tx = await client
  .newTx()
  .registerStake({ stakeCredential })
  .delegateToPool({ stakeCredential, poolKeyHash })
  .build()

// Legacy certificates (no deposit), use registerStakeLegacy() instead
const legacyTx = await client
  .newTx()
  .registerStakeLegacy({ stakeCredential })
  .delegateToPool({ stakeCredential, poolKeyHash })
  .build()
```

The deposit (currently 2 ADA) is fetched from protocol parameters automatically. Already registered? Drop the registration call and just `delegateToPool({ stakeCredential, poolKeyHash })`.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder, deserializePoolId } from "@meshsdk/core"

const utxos = await wallet.getUtxosMesh()
const changeAddress = await wallet.getChangeAddressBech32()
const rewardAddress = (await wallet.getRewardAddresses())[0]
const poolIdHash = deserializePoolId("pool1...")

const txBuilder = new MeshTxBuilder({ fetcher: provider })
const unsignedTx = await txBuilder
  .registerStakeCertificate(rewardAddress)
  .delegateStakeCertificate(rewardAddress, poolIdHash)
  .selectUtxosFrom(utxos)
  .changeAddress(changeAddress)
  .complete()

const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

`deserializePoolId` turns a bech32 `pool1...` ID into the hash the builder needs. Already registered? Use only `delegateStakeCertificate(rewardAddress, poolIdHash)`.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Generate a registration certificate (the deposit comes from the `stakeAddressDeposit` protocol parameter) and a delegation certificate, then submit both in one transaction:

```shell
# 1. Registration certificate
cardano-cli latest stake-address registration-certificate \
  --stake-verification-key-file stake.vkey \
  --key-reg-deposit-amt 2000000 \
  --out-file registration.cert

# 2. Delegation certificate (needs the target pool ID)
cardano-cli latest stake-address stake-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --stake-pool-id pool17navl486tuwjg4t95vwtlqslx9225x5lguwuy6ahc58x5dnm9ma \
  --out-file delegation.cert

# 3. Build, including both certificates (build handles fee + deposit)
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --change-address $(< payment.addr) \
  --certificate-file registration.cert \
  --certificate-file delegation.cert \
  --witness-override 2 \
  --out-file tx.raw

# 4. Sign with both payment and stake keys, then submit
cardano-cli latest transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --out-file tx.signed

cardano-cli latest transaction submit --tx-file tx.signed
```

The `--witness-override 2` flag tells `build` to budget for two signatures (payment + stake) so the fee is accurate. Already registered? Skip the registration certificate and build with just `delegation.cert`.

</TabItem>
</Tabs>

## Withdraw rewards

Rewards accumulate to the reward address each epoch and must be **explicitly withdrawn**. You always withdraw the entire balance. Partial withdrawals aren't allowed.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
const delegation = await client.getWalletDelegation()
console.log("Available rewards:", delegation.rewards, "lovelace")

const tx = await client
  .newTx()
  .withdraw({ stakeCredential, amount: delegation.rewards })
  .build()

const signed = await tx.sign()
await signed.submit()
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder } from "@meshsdk/core"

const utxos = await wallet.getUtxosMesh()
const changeAddress = await wallet.getChangeAddressBech32()
const rewardAddress = (await wallet.getRewardAddresses())[0]

// The full reward balance, from the provider
const { rewards } = await provider.fetchAccountInfo(rewardAddress)

const txBuilder = new MeshTxBuilder({ fetcher: provider })
const unsignedTx = await txBuilder
  .withdrawal(rewardAddress, rewards)
  .selectUtxosFrom(utxos)
  .changeAddress(changeAddress)
  .complete()

const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

`withdrawal` takes the lovelace amount as a string; pass the whole `rewards` balance.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```shell
# Read the current reward balance
rewards="$(cardano-cli query stake-address-info --address $(< stake.addr) | jq .[].rewardAccountBalance)"

# Withdraw the full balance with the stakeAddress+lovelace syntax
cardano-cli latest transaction build \
  --tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]') \
  --withdrawal "$(< stake.addr)+$rewards" \
  --change-address $(< payment.addr) \
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

- [Manage stake](/docs/developers/curriculum/staking-governance/manage-stake): query delegation status, deregister cleanly, and delegate stake and vote together
