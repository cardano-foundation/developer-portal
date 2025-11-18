---
id: transactions-staking
sidebar_position: 7
title: Staking Transactions
sidebar_label: Staking Transactions
description: APIs for staking ADA and managing stake pools.
image: /img/og/og-getstarted-mesh.png
---

## Register Stake Address

Same as Transaction, with `MeshTxBuilder` you have to register a stake address before delegate to stakepools. Here's the 2 APIs you need:

```javascript
txBuilder
  .registerStakeCertificate(rewardAddress)
  .delegateStakeCertificate(rewardAddress, poolIdHash)
```

Since we need to provide the deserilized hash of pool id, we can use the following util to get it:

```javascript
const poolIdHash = deserializePoolId(
  "pool107k26e3wrqxwghju2py40ngngx2qcu48ppeg7lk0cm35jl2aenx",
);
```

### Register Stake Address

Register a stake address before delegate to stakepools.

**Pool ID**
`pool107k26e3wrqxwghju2py40ngngx2qcu48ppeg7lk0cm35jl2aenx`

```javascript
const utxos = await wallet.getUtxos();
const address = await wallet.getChangeAddress();
const addresses = await wallet.getRewardAddresses();
const rewardAddress = addresses[0]!;
const poolIdHash = deserializePoolId("pool107k26e3wrqxwghju2py40ngngx2qcu48ppeg7lk0cm35jl2aenx");

if (rewardAddress === undefined) {
  throw "No address found";
}

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .registerStakeCertificate(rewardAddress)
  .delegateStakeCertificate(rewardAddress, poolIdHash)
  .selectUtxosFrom(utxos)
  .changeAddress(address)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

## Delegate Stake

Delegation with `MeshTxBuilder` is exactly the same as first delegate, but without registering stake key, so only one API is needed:

```javascript
txBuilder
  .delegateStakeCertificate(rewardAddress, poolIdHash)
```

```javascript
const utxos = await wallet.getUtxos();
const address = await wallet.getChangeAddress();
const addresses = await wallet.getRewardAddresses();
const rewardAddress = addresses[0]!;
const poolIdHash = deserializePoolId("pool107k26e3wrqxwghju2py40ngngx2qcu48ppeg7lk0cm35jl2aenx");

if (rewardAddress === undefined) {
  throw "No address found";
}

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .delegateStakeCertificate(rewardAddress, poolIdHash)
  .selectUtxosFrom(utxos)
  .changeAddress(address)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh website](https://meshjs.dev/apis/txbuilder/governance) to see the full list of APIs.