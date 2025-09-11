---
id: transactions-governance
sidebar_position: 10
title: Governance Transactions
sidebar_label: Governance Transactions
description: Transactions for registering DRep and participating in Cardano's on-chain governance
image: /img/og/og-getstarted-mesh.png
---

In Voltaire, ADA holders can delegate their governance rights (via their stake credentials) to Decentralized Representatives (DReps), 
thereby assigning their voting power in decentralized governance, independently of how they delegate stake for block production.

## DRep Registration

To register as a Drep, you need to submit a transaction including an anchor (URL to an off-chain resource), 
and an anchor hash (the actual hash of the off-line resource).

```javascript
import { getFile, keepRelevant, hashDrepAnchor } from "@meshsdk/core";

async function getMeshJsonHash(url) {
  var drepAnchor = await getFile(url);
  const anchorObj = JSON.parse(drepAnchor);
  const anchorHash = hashDrepAnchor(anchorObj);
  return anchorHash;
}

// Here we need an additional wallet instance to be able to sign the transaction.
// We provide "drep" for the `accountType` parameter.
const stakeWallet = new MeshWallet({
  key: {
    type: "mnemonic",
    words: mnemonic,
  },
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  accountType: "drep",
});

const dRep = await wallet.getDRep();
const dRepId = dRep.dRepIDCip105;

const anchorUrl = 'url to your off-chain document';
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

// Here we are signing the transaction with both wallets,
// passing on the second argument 'true', as to signal
// that it's a partially signed transaction.
const signedTx = await wallet.signTx(
    await drepWallet.signTx(unsignedTx, true),
    true);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/governance#registration) for a detailed explanation.

## Vote Delegation

Any wallet can delegate its voting power to another DRep. This is done by creating a vote delegation certificate and submitting it to the blockchain.

```javascript
import { keepRelevant } from "@meshsdk/core";

const utxos = await wallet.getUtxos();
const rewardAddresses = await wallet.getRewardAddresses();
const rewardAddress = rewardAddresses[0];
const drepid = "replace with a DRep ID of your choice;

const changeAddress = await wallet.getChangeAddress();

const assetMap = new Map();
assetMap.set("lovelace", "5000000");
const selectedUtxos = keepRelevant(assetMap, utxos);

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
// Check out the following docs to learn how to create a `stakeWallet` instance
// https://developers.cardano.org/docs/get-started/mesh/transactions-staking#delegate-ada-to-stake-pool
const signedTx = await wallet.signTx(
    await stakeWallet.signTx(unsignedTx, true),
    true);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/governance#vote-delegation) for a detailed explanation.

## Vote

Voting is done by creating a transaction including a vote certificate, which includes: 
- DRep Id
- UTxO information of the governance action to vote on (txIndex + txHash)
- type of vote (Yes or No)


```javascript
// Here we need an additional wallet instance to be able to sign the transaction.
// We provide "drep" for the `accountType` parameter.
const stakeWallet = new MeshWallet({
  key: {
    type: "mnemonic",
    words: mnemonic,
  },
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  accountType: "drep",
});

const dRep = await wallet.getDRep();
const dRepId = dRep.dRepIDCip105;

const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

txBuilder
  .vote(
    {
      type: "DRep",
      drepId: dRepId,
    },
    {
      // see a full list of current governance actions:
      // https://cardanoscan.io/govActions
      txHash: "replace-with-governance-tx-hash",
      txIndex: 0,
    },
    {
      voteKind: "Yes",
    },
  )
  .selectUtxosFrom(utxos)
  .changeAddress(changeAddress);

// Here we are signing the transaction with both wallets,
// passing on the second argument 'true', as to signal
// that it's a partially signed transaction.
const signedTx = await wallet.signTx(
    await drepWallet.signTx(unsignedTx, true),
    true);
const txHash = await wallet.submitTx(signedTx);
```

[Check out this page](https://meshjs.dev/apis/txbuilder/governance#vote) for a detailed explanation.
