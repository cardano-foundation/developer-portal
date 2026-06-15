---
id: pyth
title: Pyth
sidebar_label: Pyth
description: High-frequency oracle providing real-time price feeds to Cardano smart contracts via Pyth Pro.
image: /img/og/og-developer-portal.png
---

:::caution Beta
Pyth Pro on Cardano is currently in Beta. The API may change before release.
:::

## What is Pyth?

[Pyth](https://pyth.network) is a high-frequency oracle network that delivers real-time price data across multiple blockchains. [Pyth Pro (Lazer)](https://docs.pyth.network/price-feeds/pro) provides sub-second price feeds using a pull-based model: consumers fetch signed updates off-chain and verify them on-chain.

On Cardano, price updates are verified through a **zero-withdrawal** from the Pyth withdraw script. Your validator calls `pyth.get_updates` to read verified updates directly from the transaction being validated. The Pyth script handles signature verification so your contract doesn't have to.

## What Pyth Provides

**Pyth Pro (Lazer)**: Sub-second, high-frequency price feeds via a pull-based model. You subscribe to a websocket or fetch the latest price and include the signed update in your transaction.

**On-chain Aiken Library**: The [`pyth-lazer-cardano`](https://github.com/pyth-network/pyth-crosschain/tree/main/lazer/contracts/cardano) library handles signature verification and exposes parsed price data including price, confidence, EMA price, bid/ask, and exponent.

**Off-chain TypeScript SDK**: The [`@pythnetwork/pyth-lazer-sdk`](https://www.npmjs.com/package/@pythnetwork/pyth-lazer-sdk) provides websocket streaming and one-shot fetching of signed price updates.

## Integration Guide

Integrating Pyth Pro into a Cardano smart contract is a three-step process:

### Step 1: Use the Aiken library on-chain

Add the Pyth Lazer Cardano library to your `aiken.toml`:

```toml
[[dependencies]]
name = "pyth-network/pyth-lazer-cardano"
version = "main"
source = "github"
```

Your contract reads verified updates from the transaction via `pyth.get_updates`. This function reads the Pyth state from `reference_inputs` and the verified update bytes from the Pyth withdraw script's redeemer.

The following example reads the `ADA/USD` feed (Pyth Pro feed ID `16`) and converts the result into Aiken's `Rational` type:

```aiken
use aiken/collection/list
use aiken/math/rational.{Rational}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use pyth
use types/u32

fn read_ada_usd_price(pyth_id: PolicyId, self: Transaction) -> Rational {
  expect [update] = pyth.get_updates(pyth_id, self)
  expect Some(feed) = list.find(update.feeds, fn(feed) {
    u32.as_int(feed.feed_id) == 16
  })
  expect Some(Some(price)) = feed.price
  expect Some(exponent) = feed.exponent
  expect Some(multiplier) = rational.from_int(10) |> rational.pow(exponent)

  rational.from_int(price) |> rational.mul(multiplier)
}
```

Each `PriceUpdate` includes `timestamp_us`, `channel_id`, and a list of `feeds`. Each `Feed` includes fields such as `feed_id`, `price`, `best_bid_price`, `best_ask_price`, `exponent`, `confidence`, `ema_price`, and `feed_update_timestamp`.

:::warning
The Pyth withdraw script verifies signature validity but does **not** enforce freshness. If your contract requires a validity window, you need to enforce it directly by checking the `timestamp_us` field.
:::

:::warning
`pyth.get_updates` requires the Pyth state UTxO to be present as a reference input. If you omit it, your validator will fail when it tries to locate the Pyth State NFT and withdraw-script hash.
:::

### Step 2: Fetch signed price updates off-chain

Use the TypeScript SDK to fetch a signed update. You need to request the `solana` format, which is the little-endian Ed25519-signed binary format used for both Cardano and Solana integrations.

```typescript
import { PythLazerClient } from "@pythnetwork/pyth-lazer-sdk";

const lazer = await PythLazerClient.create({ token: LAZER_TOKEN });
const latestPrice = await lazer.getLatestPrice({
  channel: "fixed_rate@200ms",
  formats: ["solana"],
  jsonBinaryEncoding: "hex",
  priceFeedIds: [16],
  properties: ["price", "exponent"],
});

if (!latestPrice.solana?.data) {
  throw new Error("Missing update payload");
}

const update = Buffer.from(latestPrice.solana.data, "hex");
```

If you need streaming integration instead of a one-shot fetch, see the [Pyth Pro subscription guide](https://docs.pyth.network/price-feeds/pro/subscribe-to-prices).

### Step 3: Include the update in a Cardano transaction

Build a transaction that performs a zero-withdrawal from the Pyth withdraw script, passing the signed update as the redeemer. The `pyth_id` is the Pyth deployment policy ID for your network.

```typescript
import { ScriptHash } from "@evolution-sdk/evolution";
import {
  getPythScriptHash,
  getPythState,
} from "@pythnetwork/pyth-lazer-cardano-js";

const client = createClient({ network, provider });

const pythState = await getPythState(POLICY_ID, client);
const pythScript = getPythScriptHash(pythState);

const wallet = client.attachWallet({
  mnemonic: CARDANO_MNEMONIC,
  type: "seed",
});

const now = BigInt(Date.now());
const tx = wallet
  .newTx()
  .setValidity({ from: now - 60_000n, to: now + 60_000n })
  .readFrom({ referenceInputs: [pythState] })
  .withdraw({
    amount: 0n,
    redeemer: [update],
    stakeCredential: ScriptHash.fromHex(pythScript),
  });

// Add your own scripts and transaction data, then sign and submit:
const builtTx = await tx.build();
const digest = await builtTx.signAndSubmit();
```

:::warning
The zero-withdrawal and your consuming validator must be in the **same transaction**. `pyth.get_updates` reads the withdrawal redeemer directly from the transaction being validated.
:::

## Network Support

Pyth Pro on Cardano is currently in Beta.

## Additional Resources

- [Pyth Pro Price Feed IDs](https://docs.pyth.network/price-feeds/pro/price-feed-ids): complete list of supported feeds
- [Contract sources](https://github.com/pyth-network/pyth-crosschain/tree/main/lazer/contracts/cardano): Aiken contracts and off-chain SDK
- [fetch-and-verify.ts](https://github.com/pyth-network/pyth-crosschain/blob/main/lazer/contracts/cardano/sdk/js/src/examples/fetch-and-verify.ts): full off-chain example
