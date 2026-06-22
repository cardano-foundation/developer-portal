---
id: overview
title: Listening for ada payments
sidebar_label: Listening for Payments
description: Detect and confirm ada payments in your application, using Blockfrost, cardano-cli, or cardano-wallet.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Detecting incoming payments is a core need for shops, payment gateways, donations, subscriptions, ticketing, and vending or IoT machines: you need to know reliably when ada arrives at an address.

## How it works

Every method follows the same loop:

1. **Generate a payment address** for the order (often shown as a [CIP-13](https://cips.cardano.org/cip/CIP-0013) QR code).
2. **Display it** to the customer.
3. **Poll the address** for incoming transactions.
4. **Compare the received amount** against what you expect.
5. **Fulfill** once the payment confirms.

![Payment flow](/img/integrate-cardano/ada-online-shop.png)

The only thing that differs between methods is *how you read the chain*: a hosted API, your own node via cardano-cli, or a cardano-wallet service. Start with Blockfrost unless you already run your own infrastructure.

## Detecting a payment

<Tabs groupId="method">
<TabItem value="blockfrost" label="Blockfrost">

[Blockfrost](/docs/developers/curriculum/production/api-providers/blockfrost) serves chain data over HTTP, so there is no node to run. Query the address total and poll until the received sum covers the expected amount:

```js
const PROJECT_ID = process.env.BLOCKFROST_API_KEY;
const BASE = "https://cardano-preprod.blockfrost.io/api/v0"; // preview and mainnet hosts differ
const expectedLovelace = 1_000_000n;

async function receivedLovelace(address) {
  const res = await fetch(`${BASE}/addresses/${address}/total`, {
    headers: { project_id: PROJECT_ID },
  });
  const data = await res.json();
  const lovelace = data.received_sum?.find((a) => a.unit === "lovelace");
  return BigInt(lovelace?.quantity ?? 0);
}

// poll every few seconds until paid
const timer = setInterval(async () => {
  if ((await receivedLovelace(address)) >= expectedLovelace) {
    clearInterval(timer);
    // payment confirmed: fulfill the order
  }
}, 3000);
```

For a complete point-of-sale app with a React UI, QR codes, and live USD/ADA conversion built on this approach, fork the [Cardano POS starter](https://github.com/fill-the-fill/cardano-pos-starting-point).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

If you run your own [node](/docs/operators/node/installing-cardano-node), query the address UTXOs directly and sum their lovelace, no third-party API involved:

```bash
cardano-cli query utxo --address "$(cat payment.addr)" --testnet-magic 1 --output-json
```

```js
import { execSync } from "node:child_process";

const expectedLovelace = 1_000_000n;

function receivedLovelace(addr) {
  const out = execSync(
    `cardano-cli query utxo --address ${addr} --testnet-magic 1 --output-json`,
  );
  const utxos = JSON.parse(out.toString());
  return Object.values(utxos).reduce(
    (sum, u) => sum + BigInt(u.value.lovelace),
    0n,
  );
}
// poll receivedLovelace(addr) on an interval and compare to expectedLovelace
```

This is the lowest-level option: you run and sync the node yourself.

</TabItem>
<TabItem value="cardano-wallet" label="cardano-wallet">

If you run a [cardano-wallet](https://github.com/cardano-foundation/cardano-wallet) service alongside a node, read the wallet balance over its REST API (default port `8090`):

```js
const walletId = "101b3814d6977de4b58c9dedc67b87c63a4f36dd";
const expectedLovelace = 1_000_000n;

async function balanceLovelace() {
  const res = await fetch(`http://localhost:8090/v2/wallets/${walletId}`);
  const wallet = await res.json();
  return BigInt(wallet.balance.total.quantity);
}
// poll balanceLovelace() on an interval and compare to expectedLovelace
```

Use a dedicated wallet per order, or derive fresh addresses, so balances map cleanly to payments.

</TabItem>
</Tabs>

:::tip Wait for confirmations
A transaction in the mempool can still be rolled back. For anything valuable, wait a few blocks before treating a payment as final.
:::

## Use cases

E-commerce checkout, payment gateways, donation platforms, subscription billing, event ticketing, in-app purchases, and vending or IoT machines: anywhere you fulfill something only after ada arrives.
