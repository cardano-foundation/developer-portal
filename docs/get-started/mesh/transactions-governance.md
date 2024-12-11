---
id: transactions-governance
sidebar_position: 10
title: Governance Transactions
sidebar_label: Governance Transactions
description: Transactions for registering DRep and participating in Cardano's on-chain governance
image: /img/og/og-getstarted-mesh.png
---

## DRep Registration

In Voltaire, stake credentials can delegate their stake to Decentralized Representatives (DReps) for voting, in addition to the current delegation to stake pools for block production. This DRep delegation will work similarly to the current stake delegation process, using on-chain certificates. Registering as a DRep will also follow the same process as stake registration.

```javascript
const dRep = await wallet.getDRep();
const dRepId = dRep.dRepIDCip105;

const anchorUrl = '';
const anchorHash = await getMeshJsonHash(anchorUrl);

// get utxo to pay for the registration
const utxos = await wallet.getUtxos();
const registrationFee = "500000000";
const assetMap = new Map<Unit, Quantity>();
assetMap.set("lovelace", registrationFee);
const selectedUtxos = keepRelevant(assetMap, utxos);

const changeAddress = await wallet.getChangeAddress();

txBuilder
  .drepRegistrationCertificate(dRepId, {
    anchorUrl: anchorUrl,
    anchorDataHash: anchorHash,
  })
  .changeAddress(changeAddress)
  .selectUtxosFrom(selectedUtxos);

const unsignedTx = await txBuilder.complete();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/txbuilder/governance#registration)

## Vote Delegation

Any wallet can delegate its voting power to another DRep. This is done by creating a vote delegation certificate and submitting it to the blockchain.

```javascript
const utxos = await wallet.getUtxos();
const rewardAddresses = await wallet.getRewardAddresses();
const rewardAddress = rewardAddresses[0];

const changeAddress = await wallet.getChangeAddress();

const assetMap = new Map<Unit, Quantity>();
assetMap.set("lovelace", "5000000");
const selectedUtxos = keepRelevant(assetMap, utxos);

const txBuilder = getTxBuilder();

for (const utxo of selectedUtxos) {
  txBuilder.txIn(
    utxo.input.txHash,
    utxo.input.outputIndex,
    utxo.output.amount,
    utxo.output.address,
  );
}

txBuilder
  .voteDelegationCertificate(
    {
      dRepId: drepid,
    },
    rewardAddress,
  )
  .changeAddress(changeAddress);

const unsignedTx = await txBuilder.complete();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/txbuilder/governance#delegation)

## Vote

Voting is done by creating a vote certificate and submitting it to the blockchain.

```javascript
const dRep = await wallet.getDRep();
const dRepId = dRep.dRepIDCip105;

const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

const txBuilder = getTxBuilder();
txBuilder
  .vote(
    {
      type: "DRep",
      drepId: dRepId,
    },
    {
      txHash: 'aff2909f8175ee02a8c1bf96ff516685d25bf0c6b95aac91f4dfd53a5c0867cc',
      txIndex: 0,
    },
    {
      voteKind: "Yes",
    },
  )
  .selectUtxosFrom(utxos)
  .changeAddress(changeAddress);

const unsignedTx = await txBuilder.complete();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

[Try demo](https://meshjs.dev/apis/txbuilder/governance#vote)
