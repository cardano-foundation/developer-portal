---
id: pyth
title: "Integrate a Price Feed: Pyth"
sidebar_label: Integrate a price feed
description: Feed real-time market prices into a Cardano validator with the pull-based oracle workflow, implemented with Pyth Pro.
---

Feeding a live market price into a validator is a workflow every price-dependent contract shares: fetch a signed price update off-chain, include it in the transaction, and verify it on-chain. This page walks that workflow with Pyth, the [recommended](/docs/developers/curriculum/dapps/oracles/overview#recommended-pyth) production price oracle for Cardano contracts. If oracles are new to you, [Oracles](/docs/developers/curriculum/dapps/oracles/overview) covers the general problem of getting off-chain data on-chain and the pull-based model Cardano contracts use to read it.

## What is Pyth?

[Pyth](https://pyth.network) is a high-frequency oracle network that delivers real-time price data across multiple blockchains. [Pyth Pro (Lazer)](https://docs.pyth.network/price-feeds/pro) provides sub-second price feeds using a pull-based model: consumers fetch signed updates off-chain and verify them on-chain.

On Cardano, price updates are verified through a **zero-withdrawal** from the Pyth withdraw script. Your validator calls `pyth.get_updates` to read verified updates directly from the transaction being validated. The Pyth script handles signature verification so your contract doesn't have to.

## What Pyth provides

**Pyth Pro (Lazer)**: Sub-second, high-frequency price feeds via a pull-based model. You subscribe to a websocket or fetch the latest price and include the signed update in your transaction.

**On-chain Aiken Library**: The [`pyth-lazer-cardano`](https://github.com/pyth-network/pyth-crosschain/tree/main/lazer/contracts/cardano) library handles signature verification and exposes parsed price data including price, confidence, EMA price, bid/ask, and exponent.

**Off-chain TypeScript SDK**: The [`@pythnetwork/pyth-lazer-sdk`](https://www.npmjs.com/package/@pythnetwork/pyth-lazer-sdk) provides websocket streaming and one-shot fetching of signed price updates.

## Integration guide

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
The Pyth withdraw script verifies signature validity but does **not** enforce freshness. A valid signature proves the price is genuinely Pyth's (integrity); it does not prove the update is recent, or that one was posted at all (liveness). If your contract requires a validity window, enforce it directly by checking the `timestamp_us` field. See [who publishes, and what that guarantees](/docs/developers/curriculum/dapps/oracles/overview#who-publishes-and-what-that-guarantees) for the trust model behind this.
:::

:::warning
`pyth.get_updates` requires the Pyth state UTxO to be present as a reference input. If you omit it, your validator will fail when it tries to locate the Pyth State NFT and withdraw-script hash.
:::

### Step 2: Fetch signed price updates off-chain

Use the TypeScript SDK to fetch a signed update. You need to request the `solana` format, which is the little-endian Ed25519-signed binary format used for both Cardano and Solana integrations.

:::tip Getting an access token
Fetching updates requires a Pyth Pro access token. Intersect has arranged access for projects building on Cardano; see the [Intersect announcement](https://intersectmbo.org/news/pyth-pro-on-cardano-subscription-offer) for how to request an API key.
:::

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
import { Client, preprod, ScriptHash } from "@evolution-sdk/evolution";
import {
  getPythScriptHash,
  getPythState,
} from "@pythnetwork/pyth-lazer-cardano-js";

const client = Client.make(preprod).withKoios({
  baseUrl: "https://preprod.koios.rest/api/v1",
});

const pythState = await getPythState(POLICY_ID, client);
const pythScript = getPythScriptHash(pythState);

const wallet = client.withSeed({ mnemonic: CARDANO_MNEMONIC });

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

### Verify the integration

Before wiring Pyth into a real contract, deploy a minimal validator that does nothing but read the feed. If this works, the whole pipeline works: the fetch, the zero-withdrawal, the reference input, and `pyth.get_updates`. Any failure after this point is in your own logic, not the integration.

```aiken
use aiken/collection/list
use cardano/address.{Credential}
use cardano/assets.{PolicyId}
use cardano/certificate.{Certificate, RegisterCredential}
use cardano/transaction.{Transaction}
use pyth
use types/u32

/// Minimal test validator to verify the Pyth integration works.
/// Parameterized with the Pyth deployment policy ID.
validator pyth_test(pyth_id: PolicyId) {
  withdraw(_redeemer: Data, _account: Credential, self: Transaction) {
    expect [update] = pyth.get_updates(pyth_id, self)

    // Find BTC/USD (feed ID 1) and assert a price exists
    expect Some(btc_feed) =
      list.find(update.feeds, fn(f) { u32.as_int(f.feed_id) == 1 })
    expect Some(Some(_price)) = btc_feed.price

    True
  }

  publish(_redeemer: Data, certificate: Certificate, _self: Transaction) {
    when certificate is {
      RegisterCredential { .. } -> True
      _ -> fail
    }
  }

  else(_) {
    fail
  }
}
```

This test consumer is itself a [withdrawal validator](/docs/developers/curriculum/smart-contracts/write-a-validator#withdrawal-validator), and a withdrawal validator's stake credential must be **registered on-chain before its first use**. That is what the `publish` handler is for: it allows the registration certificate and nothing else. Register the credential once, then run a transaction with two zero-withdrawals, the Pyth one carrying the signed update and this one running the check.

## Validator patterns

The steps above get a verified price into your validator. What follows are the recurring shapes for actually using it, written against the current library types. Two unit conventions matter throughout: transaction validity bounds are POSIX **milliseconds**, while `timestamp_us` is **microseconds**. Feed fields are also double-optional: the outer `Option` tells you whether you requested that property in the off-chain fetch (Step 2's `properties` array), the inner whether Pyth has a value for it right now.

### Enforce a freshness window

The signature check proves integrity, not recency, so bound the age yourself. Anchor the check to the validity **upper** bound: then no matter when inside its validity window the transaction lands on-chain, the update is at most `max_age_ms` old.

```aiken
use aiken/interval.{Finite}
use cardano/transaction.{Transaction}
use pyth.{PriceUpdate}
use types/u64

const max_age_ms: Int = 60_000

fn is_fresh(update: PriceUpdate, self: Transaction) -> Bool {
  expect Finite(upper) = self.validity_range.upper_bound.bound_type
  let age_us = upper * 1_000 - u64.as_int(update.timestamp_us)
  age_us >= 0 && age_us <= max_age_ms * 1_000
}
```

The two-sided check rejects both stale updates and updates timestamped after the validity window, since either one means the transaction was assembled inconsistently. It also forces the transaction to have a finite validity interval: an unbounded transaction fails the `expect`.

### Settle an outcome at a deadline

In the settlement shape, the datum stores the question (which feed, what threshold, by when) and the oracle answers it exactly once, after the deadline. The deadline is enforced through the validity interval, so the ledger itself refuses a transaction that tries to settle early.

```aiken
use aiken/collection/list
use aiken/interval.{Finite}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use pyth
use types/u32

pub type Terms {
  pyth_id: PolicyId,
  feed_id: Int,
  target_price: Int,
  deadline: Int,
}

fn settles_above_target(terms: Terms, self: Transaction) -> Bool {
  // The transaction cannot be valid before the deadline
  expect Finite(lower) = self.validity_range.lower_bound.bound_type
  expect lower >= terms.deadline

  expect [update] = pyth.get_updates(terms.pyth_id, self)
  expect Some(feed) =
    list.find(update.feeds, fn(f) { u32.as_int(f.feed_id) == terms.feed_id })
  expect Some(Some(price)) = feed.price

  price > terms.target_price
}
```

Two details make this cheap and safe:

- **Store the target in raw feed units.** ADA/USD publishes with exponent `-8`, so a target of $0.45 is stored as `45_000_000`. Comparing two integers avoids rational arithmetic on-chain entirely; the conversion example in Step 1 is only needed when you must combine feeds with different exponents.
- **Mirror the bound for the other side of the deadline.** Any action that must happen *before* it, such as placing a bet or adjusting a position, requires the validity **upper** bound at or below `terms.deadline`. Between the two rules, the state machine cannot accept positions after expiry or settle before it, and none of that depends on off-chain code behaving.
- **Let anyone settle.** The oracle signature already fixes the outcome, so the resolving transaction needs no privileged signer. Requiring one (say, the market creator) reintroduces exactly the liveness dependency the signature model warns about: settlement then happens only when that party chooses to act. Keep resolution permissionless and let the deadline plus the verified price decide.

This is the core of a prediction market, an option expiry, or a parametric insurance payout. The surrounding contract only adds how positions are entered and how the pot is paid out.

### Refuse to act in a dislocated market

The bid-ask spread is a live uncertainty measure. A settlement or liquidation that fires during a momentary dislocation is technically correct and practically wrong, so let the contract demand an orderly market:

```aiken
fn spread_within(feed: Feed, max_spread: Int) -> Bool {
  expect Some(Some(bid)) = feed.best_bid_price
  expect Some(Some(ask)) = feed.best_ask_price
  ask - bid <= max_spread
}
```

The same idea extends to the other payload fields: `ema_price` against `price` gives a momentum signal with no on-chain history, and two feeds fetched in one update give a cross-asset ratio. When you compare a ratio against bounds, cross-multiply instead of dividing (`min_num * price_b <= price_a * min_den`) so everything stays in integers. The design-space view of these options is in [Designing with a price feed](/docs/developers/curriculum/dapps/oracles/overview#designing-with-a-price-feed).

The three patterns above compose into a full contract in [A price-settled prediction market](/docs/developers/curriculum/dapps/oracles/prediction-market), a complete dApp walked end to end.

## Network support

Pyth deployments are per-network: each network has its own `pyth_id` policy ID, which your validator and off-chain code use to locate the Pyth state and withdraw script. The examples above target preprod. For the deployment on your target network, see the [Pyth documentation](https://docs.pyth.network/price-feeds/pro/integrate-as-consumer/cardano).

## Additional resources

- [Pyth Pro Price Feed IDs](https://docs.pyth.network/price-feeds/pro/price-feed-ids): complete list of supported feeds
- [Contract sources](https://github.com/pyth-network/pyth-crosschain/tree/main/lazer/contracts/cardano): Aiken contracts and off-chain SDK
- [fetch-and-verify.ts](https://github.com/pyth-network/pyth-crosschain/blob/main/lazer/contracts/cardano/sdk/js/src/examples/fetch-and-verify.ts): full off-chain example

## Next steps

- [A price-settled prediction market](/docs/developers/curriculum/dapps/oracles/prediction-market): these patterns assembled into a working oracle-consuming dApp
- [On-chain randomness](/docs/developers/curriculum/dapps/oracles/randomness): the other hard data problem, where a feed cannot help you
