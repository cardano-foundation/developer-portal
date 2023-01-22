---
id: transactions-staking
sidebar_position: 7
title: Staking Transactions - Mesh SDK (Open-Source Library for Building Web3 Apps on the Cardano Blockchain)
sidebar_label: Staking Transactions
description: APIs for staking ADA and managing stake pools.
image: ../img/og/og-getstarted-mesh.png
---

In this section, we will learn to create to stake ADA in stakepools. If you are new to transactions, be sure to check out how to create transactions to [send lovelace and assets](transactions-basic).

In this section, we will explore the following:

- [Register Stake Address](#register-stake-address)
- [Delegate ADA to Stakepool](#delegate-ada-to-stakepool)

## Register Stake Address

New address must "register" before they can delegate to stakepools.

```javascript
import { Transaction } from "@meshsdk/core";

const rewardAddress = "stake1qdzmqvfdnxsn4a3hd57x435madswynt4hqw8n7f2pdq05g4995re";
const poolId = "pool1mhww3q6d7qssj5j2add05r7cyr7znyswe2g6vd23anpx5sh6z8d";

const tx = new Transaction({ initiator: wallet });
tx.registerStake(rewardAddress);
tx.delegateStake(rewardAddress, poolId);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

## Delegate ADA to Stakepool

Delegation is the process by which ADA holders delegate the stake associated with their ADA to a stake pool. Doing so, this allows ADA holders to participate in the network and be rewarded in proportion to the amount of stake delegated.

```javascript
import { Transaction } from "@meshsdk/core";

const rewardAddress = "stake1qdzmqvfdnxsn4a3hd57x435madswynt4hqw8n7f2pdq05g4995re";
const poolId = "pool1mhww3q6d7qssj5j2add05r7cyr7znyswe2g6vd23anpx5sh6z8d";

const tx = new Transaction({ initiator: wallet });
tx.delegateStake(rewardAddress, poolId);

const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Check out the [Mesh Playground](https://meshjs.dev/apis/transaction/staking) for live demo and full explanation.
