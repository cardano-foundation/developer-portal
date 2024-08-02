---
id: submit-votes
sidebar_label: Voting 
title: Submitting votes as DRep, Stake pool or Constitutional Committee member
sidebar_position: 5
description: How to vote on governance actions 
keywords: [Governance, voting , drep, spo, CIP1694]
---


### Pre-requisites

* Payment key pair and it's address with funds
* Authorized hot credentials, DRep credentials OR stake pool keys

To vote on governance actions, follow this process:

1. Obtain the action ID of an ongoing governance action from Discord or query the governance state.
2. Determine your voting stance; engage in discussion if required.
3. Construct your vote file through the Cardano CLI. The example below demonstrates voting `--yes`, although options for `--no` or `--abstain` are also available.

### Verify the content of the governance action

Assume we need to submit a vote on the governance action with ID `df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79#0` that proposes a new constitution.

1. Obtain the URL and hash of the new constitution proposal from the governance state:

```
cardano-cli conway query gov-state | \
jq -r --arg govActionId "df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79" '.proposals | to_entries[] | select(.value.actionId.txId | contains($govActionId)) | .value'
```
```
{
  "action": {
    "contents": [
      null,
      {
        "anchor": {
          "dataHash": "5d372dca1a4cc90d7d16d966c48270e33e3aa0abcb0e78f0d5ca7ff330d2245d",
          "url": "https://tinyurl.com/mr3ferf9"
        }
      }
    ],
    "tag": "NewConstitution"
  },
  "actionId": {
    "govActionIx": 0,
    "txId": "df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79"
  },
  "committeeVotes": {
    "keyHash-c8ac605b25d6084c2ceb28043c8f01b62629966d038a249c7847d66d": "VoteYes",
    "keyHash-d13507f7e7fb8ac3ce2094187c9d99d4601021e9ef5a5f310567765d": "VoteYes"
  },
  "dRepVotes": {
    "keyHash-16faaf6daa2635bbf53bbbaf38b3a6040adf7ced2f7f08952592cf5b": "VoteYes",
    "keyHash-57cb90cfb635e76af648abf1b6a91519218a5919b3cba2527e3725d1": "VoteYes",
    "keyHash-7d84808d563f0f258ad7e4337c2c4bd13010930ebdf7b86c3bfd9ef8": "VoteYes"
  },
  "deposit": 0,
  "expiresAfter": 80,
  "proposedIn": 78,
  "returnAddr": {
    "credential": {
      "keyHash": "f925cbd4eb78aad49ec7bf9b4ddfa4cc4486c967e392699d143c81aa"
    },
    "network": "Testnet"
  },
  "stakePoolVotes": {}
}
```
2. Download the file from the URL registered on the proposal:

````
wget https://tinyurl.com/mr3ferf9 -O constitution.txt
````

3. Verify that the hash of the file matches the `dataHash` registered on the proposal:

````
b2sum -l 256 constitution.txt
5d372dca1a4cc90d7d16d966c48270e33e3aa0abcb0e78f0d5ca7ff330d2245d  constitution.txt
````

**Everything is in order; the text at the URL matches the dataHash, confirming that the text at the URL is precisely what we are voting for.**

In the future, voting apps, explorers, wallets, and other tools could perform the filtering, ensuring that they only display actions whose URL content has been verified against the reported hash.

### Create the vote file

Voting with DRep keys:

```
cardano-cli conway governance vote create \
    --yes \
    --governance-action-tx-id "df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79" \
    --governance-action-index "0" \
    --drep-verification-key-file drep.vkey \
    --out-file df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79-constitution.vote
```

Voting with CC hot keys:

```
cardano-cli conway governance vote create \
    --yes \
    --governance-action-tx-id "df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79" \
    --governance-action-index "0" \
    --cc-hot-verification-key-file cc-hot.vkey \
    --out-file df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79-constitution.vote
```
Voting with SPO keys:

```
cardano-cli conway governance vote create \
    --yes \
    --governance-action-tx-id "df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79" \
    --governance-action-index "0" \
    --cold-verification-key-file cold.vkey \
    --out-file df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79-constitution.vote
```

### Include the vote in a transaction

Build the transaction:

```
cardano-cli conway transaction build \
    --tx-in "$(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]')" \
    --change-address $(< payment.addr) \
    --vote-file df58f714c0765f3489afb6909384a16c31d600695be7e86ff9c59cf2e8a48c79-constitution.vote \
    --witness-override 2 \
    --out-file vote-tx.raw
```
Sign it with the DRep key:
```
cardano-cli transaction sign --tx-body-file vote-tx.raw \
    --signing-key-file drep.skey \
    --signing-key-file payment.skey \
    --out-file vote-tx.signed
```
OR sign it with the CC hot key:
```
cardano-cli transaction sign --tx-body-file vote-tx.raw \
    --signing-key-file cc-hot.skey \
    --signing-key-file payment.skey \
    --out-file vote-tx.signed
```
OR sign it with the SPO cold key:
```
cardano-cli transaction sign --tx-body-file vote-tx.raw \
    --signing-key-file cold.skey \
    --signing-key-file payment.skey \
    --out-file vote-tx.signed
```
Submit the transaction:
```
cardano-cli transaction submit --tx-file vote-tx.signed
```