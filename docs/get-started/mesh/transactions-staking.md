---
id: transactions-staking
sidebar_position: 7
title: Staking Transactions
sidebar_label: Staking Transactions
description: APIs for staking ADA and managing stake pools.
image: /img/og/og-getstarted-mesh.png
---

In this section, we will explore the following:

- [Register Stake Address](#register-stake-address)
- [Delegate ADA to Stake Pool](#delegate-ada-to-stake-pool)

If you are new to transactions, be sure to check out how to create transactions to [send lovelace and assets](transactions-basic).

## Register Stake Address

Before you can delegate to a stake pool, you need to register an address from which your ADA will be delegated.

```javascript
import { MeshTxBuilder } from "@meshsdk/core";

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // checkout https://meshjs.dev/providers
  verbose: true, // for extra info logging
});

const rewardAddress = (await wallet.getRewardAddresses())[0];
const utxos = await wallet.getUtxos();
const addr = (await wallet.getUsedAddress("payment")).toBech32();

const registerTx = await txBuilder
  .registerStakeCertificate(rewardAddress)
  .selectUtxosFrom(utxos)
  .changeAddress(addr)
  .complete();

const signedTx = await wallet.signTx(registerTx);
const txHash = await wallet.submitTx(signedTx);
```

## Delegate ADA to Stake Pool

Delegation is the process by which ADA holders delegate their staking rights to a stake pool.
Doing so, this allows ADA holders to participate in the network and be rewarded in proportion to the amount of stake delegated.


```javascript
// Here we need an additional wallet instance to be able to sign the transaction.
// We provide "stake" for the `accountType` parameter.
const stakeWallet = new MeshWallet({
  key: {
    type: "mnemonic",
    words: mnemonic,
  },
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  accountType: "stake",
});

const rewardAddress = (await wallet.getRewardAddresses())[0];
const poolIdHash = deserializePoolId(
  "pool1kgzq2g7glzcu76ygcl2llhamjjutcts5vhe2mzglmn5jxt2cnfs",
);

const registerTx = await txBuilder
  .delegateStakeCertificate(rewardAddress, poolIdHash)
  .selectUtxosFrom(utxos)
  .changeAddress(addr)
  .complete();

// Here we are signing the transaction with both wallets,
// passing on the second argument 'true', as to signal
// that it's a partially signed transaction.
const signedTx = await wallet.signTx(
    await stakeWallet.signTx(registerTx, true),
    true);
return await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/staking#delegate-stake) for a detailed explanation.
