---
id: transactions
sidebar_position: 3
title: Transactions
sidebar_label: Your First Transaction
description: How to build, sign, and submit transactions with Evolution SDK
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Your first transaction

A couple of fundamentals to remember are that in Cardano's eUTxO model, a transaction can consume one or more UTxOs as inputs, create one or more UTxOs as outputs, and must be balanced (sum of inputs = sum of outputs + fees).

### 1. Build

Let's create a simple transaction where we send `5 ada` to two recipients each:

```typescript
const tx = await lucid
  .newTx()
  .pay.ToAddress("addr_testa...", { lovelace: 5000000n })
  .pay.ToAddress("addr_testb...", { lovelace: 5000000n })
  .complete();
```

:::note
To balance the transaction and initiate coin selection, transactions always
need to end with `.complete()`
:::

### 2. Sign

```typescript
const signedTx = await tx.sign.withWallet().complete();
```

You could also choose to sign the transaction with a private key:

```typescript
const signedTx = await tx.sign.withPrivateKey(privateKey).complete();
```

### 3. Submit

Lastly we submit the transaction:

```typescript
const txHash = await signedTx.submit();
console.log(txHash);
```

:::note

The wallet selection methods we discussed in the [previous section](wallets.md) should be implemented before building the transaction.

:::

## Putting everything together

```typescript
import { Lucid, Blockfrost } from "@evolution-sdk/lucid";

// Initialize Lucid with a provider
const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<projectId>"),
  "Preprod"
);

// Select a wallet for signing - in this case we're using a private key
lucid.selectWallet.fromPrivateKey(privateKey);

// Build, sign and submit transaction
const tx = await lucid
  .newTx()
  .pay.ToAddress("addr_testa...", { lovelace: 5000000n }) // Pay 5 ada to addr_testa
  .complete(); // Balances the transaction and initiates coin selection

const signedTx = await tx.sign.withWallet().complete();
const txHash = await signedTx.submit();
console.log(txHash);
```

## You want to learn more?

### Next Steps

Explore the following sections to learn more about Evolution SDK:

- [Under the hood](https://no-witness-labs.github.io/evolution-sdk/documentation/under-the-hood) - Understand how Evolution library works
- [Deep dives](https://no-witness-labs.github.io/evolution-sdk/documentation/pay-methods) - Follow this series in order to step-by-step understand how to build your own off-chain code for different/advanced use cases

## Resources

- [Official Evolution Library Documentation](https://no-witness-labs.github.io/evolution-sdk/)
- [GitHub Repository](https://github.com/no-witness-labs/evolution-sdk)

> You now have all you need to start playing around with Evolution SDK. If you have any questions, please refer to the library's [Discord community](https://discord.com/invite/eqZDvHvW6k).
