---
id: prediction-market
title: A Price-Settled Prediction Market
sidebar_label: Prediction market
description: "A complete oracle-consuming dApp walked end to end: one validator with three identities, the bet, resolve and claim paths, the mint policy, and the off-chain transactions."
---

The [Pyth integration guide](/docs/developers/curriculum/dapps/oracles/pyth) covers the three-step setup and the individual [validator patterns](/docs/developers/curriculum/dapps/oracles/pyth#validator-patterns). This page assembles them into a full dApp: a binary prediction market, "will BTC be above this price at this time?", where the Pyth feed is the judge. The contract is adapted from the [winning entry](https://github.com/SAIB-Inc/cardano-pyth-prediction-market) of the recent Cardano x Pyth hackathon.

Read it end to end to see how an oracle-consuming contract fits together, or jump to the path you need. It assumes the client and wallet set up in [Step 3](/docs/developers/curriculum/dapps/oracles/pyth#step-3-include-the-update-in-a-cardano-transaction) of the integration guide.

Everything so far has been pieces. This section assembles them into a full dApp: a binary prediction market, "will BTC be above this price at this time?", where the Pyth feed is the judge. The contract is adapted from the [winning entry](https://github.com/SAIB-Inc/cardano-pyth-prediction-market) of the recent Cardano x Pyth hackathon.

The market's lifecycle:

```mermaid
graph LR
    A[Create<br/>one-shot mint] --> B[Open]
    B -->|Bet: mint YES/NO<br/>before deadline| B
    B -->|Resolve: Pyth read<br/>after deadline| C[Resolved]
    C -->|Claim: burn winners<br/>for pro-rata payout| C
    C -->|last claim burns<br/>the state thread| D[Closed]
```

### The market lives in one UTxO

The whole market, its question, its pot, its accounting, is a single UTxO carrying an inline datum and a **[state-thread token](https://aiken-lang.org/fundamentals/common-design-patterns#state-thread-tokens-aka-stt)** that proves it is the genuine market and not a look-alike someone paid into the script address:

```aiken
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference}

pub type MarketDatum {
  creator: ByteArray,
  pyth_id: PolicyId,
  feed_id: Int,
  target_price: Int,
  resolution_time: Int,
  token_policy: PolicyId,
  yes_reserve: Int,
  no_reserve: Int,
  k: Int,
  total_yes_minted: Int,
  total_no_minted: Int,
  total_ada: Int,
  resolved: Bool,
  winning_side: Option<BetDirection>,
}

pub type BetDirection {
  Yes
  No
}

pub type MarketAction {
  Bet { direction: BetDirection, amount: Int }
  Resolve
  Claim { burn_amount: Int }
}

pub type MintAction {
  MintTokens
  BurnTokens
}

/// Parameter for the market validator (makes each market's policy ID unique)
pub type MarketParams {
  one_shot: OutputReference,
}
```

Four groups of fields:

- **The question**: `pyth_id`, `feed_id`, `target_price`, `resolution_time`. Which Pyth deployment, which feed, what threshold, by when. `target_price` is stored in raw feed units, exactly as the [settlement pattern](/docs/developers/curriculum/dapps/oracles/pyth#settle-an-outcome-at-a-deadline) above prescribes.
- **Position pricing**: `yes_reserve`, `no_reserve`, `k`. A constant-product curve (the same `x * y = k` idea AMMs use) prices YES and NO positions dynamically, so betting on the side the market already favors buys you fewer tokens.
- **Accounting**: `total_yes_minted`, `total_no_minted`, `total_ada`. What claims will be paid from and divided by.
- **Lifecycle**: `resolved`, `winning_side`. Flipped exactly once, by the oracle.

The `one_shot` parameter is an output reference the creating transaction must consume, a [one-shot minting policy](https://aiken-lang.org/fundamentals/common-design-patterns#one-shot-minting-policies). Since no UTxO can be spent twice, each market instantiates a unique script, and therefore a unique policy ID and address.

### One script, three identities

The validator is a single Aiken `validator` block with both a spend and a mint handler. That means the same script hash is simultaneously the **spending validator** guarding the market UTxO, the **minting policy** of the YES/NO position tokens, and the **identity** of the state-thread token. This identity trick is the backbone of the design: any check against `market_policy_id` is a check against all three at once.

```aiken
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use prediction_market/market_validation.{
  validate_bet, validate_burn_tokens, validate_claim, validate_mint_tokens,
  validate_resolve,
}
use prediction_market/types.{
  Bet, BurnTokens, Claim, MarketAction, MarketDatum, MarketParams, MintAction,
  MintTokens, Resolve,
}

validator market(params: MarketParams) {
  spend(
    datum: Option<MarketDatum>,
    redeemer: MarketAction,
    spend_out_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(market_datum) = datum

    when redeemer is {
      Bet { direction, amount } ->
        validate_bet(market_datum, direction, amount, spend_out_ref, self)
      Resolve -> validate_resolve(market_datum, spend_out_ref, self)
      Claim { burn_amount } ->
        validate_claim(market_datum, burn_amount, spend_out_ref, self)
    }
  }

  mint(redeemer: MintAction, policy_id: PolicyId, self: Transaction) {
    when redeemer is {
      MintTokens -> validate_mint_tokens(params.one_shot, policy_id, self)
      BurnTokens -> validate_burn_tokens(policy_id, self)
    }
  }

  else(_) {
    fail
  }
}
```

The logic lives in a library module (`prediction_market/market_validation.ak`, with the types above in `prediction_market/types.ak`). Three token names are fixed: `"YES"`, `"NO"`, and `""` (the empty name) for the state thread:

```aiken
use aiken/collection/dict
use aiken/collection/list
use aiken/interval.{Finite}
use cardano/address.{Script}
use cardano/assets
use cardano/transaction.{InlineDatum, OutputReference, Transaction, find_input}
use prediction_market/types.{MarketDatum, No, Yes}
use pyth
use types/u32

pub const yes_token: ByteArray = "YES"
pub const no_token: ByteArray = "NO"
pub const state_thread_token: ByteArray = ""

fn has_state_thread(value: assets.Value, policy_id: assets.PolicyId) -> Bool {
  assets.quantity_of(value, policy_id, state_thread_token) == 1
}
```

<details>
<summary>Mint-policing helpers used below</summary>

These enforce that a transaction's mint field contains exactly what the action allows, so nothing extra can ride along under the market's policy:

```aiken
fn has_no_market_policy_mint(
  policy_id: assets.PolicyId,
  tx: Transaction,
) -> Bool {
  let mint_dict = tx.mint |> assets.tokens(policy_id)
  dict.foldl(mint_dict, True, fn(_asset_name, _qty, _acc) { False })
}

fn only_mints_market_token(
  policy_id: assets.PolicyId,
  token_name: ByteArray,
  amount: Int,
  tx: Transaction,
) -> Bool {
  let mint_dict = tx.mint |> assets.tokens(policy_id)

  assets.quantity_of(tx.mint, policy_id, token_name) == amount && dict.foldl(
    mint_dict,
    True,
    fn(asset_name, qty, acc) {
      acc && asset_name == token_name && qty == amount
    },
  )
}

fn only_burns_market_token(
  policy_id: assets.PolicyId,
  token_name: ByteArray,
  amount: Int,
  burn_state_thread: Bool,
  tx: Transaction,
) -> Bool {
  let mint_dict = tx.mint |> assets.tokens(policy_id)

  assets.quantity_of(tx.mint, policy_id, token_name) == amount && if burn_state_thread {
    assets.quantity_of(tx.mint, policy_id, state_thread_token) == -1
  } else {
    assets.quantity_of(tx.mint, policy_id, state_thread_token) == 0
  } && dict.foldl(
    mint_dict,
    True,
    fn(asset_name, qty, acc) {
      acc && if asset_name == token_name {
        qty == amount
      } else {
        burn_state_thread && asset_name == state_thread_token && qty == -1
      }
    },
  )
}
```

</details>

### Bet

A bet spends the market UTxO and recreates it with the pot grown, the reserves shifted, and the bettor's position tokens minted. Note the [mirror rule](/docs/developers/curriculum/dapps/oracles/pyth#settle-an-outcome-at-a-deadline) in action: the validity **upper** bound must sit at or below the deadline.

```aiken
pub fn validate_bet(
  datum: MarketDatum,
  direction: types.BetDirection,
  amount: Int,
  spend_out_ref: OutputReference,
  tx: Transaction,
) -> Bool {
  expect !datum.resolved
  expect amount > 0

  // Must be before resolution time
  expect Finite(upper) = tx.validity_range.upper_bound.bound_type
  expect upper <= datum.resolution_time

  // Tokens out via the constant product formula
  let (tokens_out, new_datum) =
    when direction is {
      Yes -> {
        let tokens = datum.yes_reserve - datum.k / ( datum.no_reserve + amount )
        expect tokens > 0
        let new =
          MarketDatum {
            ..datum,
            yes_reserve: datum.yes_reserve - tokens,
            no_reserve: datum.no_reserve + amount,
            total_yes_minted: datum.total_yes_minted + tokens,
            total_ada: datum.total_ada + amount,
          }
        (tokens, new)
      }
      No -> {
        let tokens = datum.no_reserve - datum.k / ( datum.yes_reserve + amount )
        expect tokens > 0
        let new =
          MarketDatum {
            ..datum,
            yes_reserve: datum.yes_reserve + amount,
            no_reserve: datum.no_reserve - tokens,
            total_no_minted: datum.total_no_minted + tokens,
            total_ada: datum.total_ada + amount,
          }
        (tokens, new)
      }
    }

  // The market must continue: same address, state thread intact, new datum
  expect Some(spend_input) = find_input(tx.inputs, spend_out_ref)
  expect Script(market_policy_id) =
    spend_input.output.address.payment_credential
  let script_address = spend_input.output.address
  expect has_state_thread(spend_input.output.value, market_policy_id)

  expect Some(continuing_output) =
    tx.outputs
      |> list.find(fn(output) { output.address == script_address })

  expect InlineDatum(out_datum) = continuing_output.datum
  expect output_market_datum: MarketDatum = out_datum
  expect output_market_datum == new_datum
  expect has_state_thread(continuing_output.value, market_policy_id)

  // Exactly the earned position tokens are minted, nothing else
  let expected_token_name =
    when direction is {
      Yes -> yes_token
      No -> no_token
    }

  expect
    only_mints_market_token(
      market_policy_id,
      expected_token_name,
      tokens_out,
      tx,
    )

  // The pot must actually grow by the bet
  let input_lovelace = assets.lovelace_of(spend_input.output.value)
  let output_lovelace = assets.lovelace_of(continuing_output.value)
  expect output_lovelace >= input_lovelace + amount

  True
}
```

The validator recomputes the CPMM math itself and demands the continuing datum match exactly. The off-chain code proposes the new state; the validator verifies it.

### Resolve

Resolve is where the oracle comes in, and it is exactly the [settle-at-a-deadline pattern](/docs/developers/curriculum/dapps/oracles/pyth#settle-an-outcome-at-a-deadline): validity lower bound at or past the deadline, one `pyth.get_updates` read, one integer comparison.

```aiken
pub fn validate_resolve(
  datum: MarketDatum,
  spend_out_ref: OutputReference,
  tx: Transaction,
) -> Bool {
  expect !datum.resolved

  // Must be after resolution time
  expect Finite(lower) = tx.validity_range.lower_bound.bound_type
  expect lower >= datum.resolution_time

  // The verified Pyth price decides the winner
  expect [update] = pyth.get_updates(datum.pyth_id, tx)
  expect Some(feed) =
    list.find(update.feeds, fn(f) { u32.as_int(f.feed_id) == datum.feed_id })
  expect Some(Some(oracle_price)) = feed.price

  let winning_side =
    if oracle_price > datum.target_price {
      Yes
    } else {
      No
    }

  // Creator must sign (hackathon simplification, see below)
  expect tx.extra_signatories |> list.has(datum.creator)

  // Continuing output: same value, datum flipped to resolved
  expect Some(spend_input) = find_input(tx.inputs, spend_out_ref)
  expect Script(market_policy_id) =
    spend_input.output.address.payment_credential
  let script_address = spend_input.output.address
  expect has_state_thread(spend_input.output.value, market_policy_id)

  let expected_datum =
    MarketDatum { ..datum, resolved: True, winning_side: Some(winning_side) }

  expect Some(continuing_output) =
    tx.outputs
      |> list.find(fn(output) { output.address == script_address })

  expect InlineDatum(out_datum) = continuing_output.datum
  expect output_market_datum: MarketDatum = out_datum
  expect output_market_datum == expected_datum
  expect has_state_thread(continuing_output.value, market_policy_id)
  expect has_no_market_policy_mint(market_policy_id, tx)

  // No ADA may leave during resolve
  let input_lovelace = assets.lovelace_of(spend_input.output.value)
  let output_lovelace = assets.lovelace_of(continuing_output.value)
  expect output_lovelace >= input_lovelace

  True
}
```

:::caution Hackathon simplifications to harden for production
Two corners were cut here, both flagged by the original authors. First, resolution requires the **creator's signature**; as [Let anyone settle](/docs/developers/curriculum/dapps/oracles/pyth#settle-an-outcome-at-a-deadline) explains, that reintroduces a liveness dependency. Drop the `extra_signatories` check and let the deadline plus the verified price decide. Second, there is **no freshness check** on the update; add the [`is_fresh`](/docs/developers/curriculum/dapps/oracles/pyth#enforce-a-freshness-window) guard so a resolver cannot settle with an old price that happened to suit them.
:::

### Claim

After resolution, winners burn their tokens for a pro-rata share of the pot. The arithmetic is one line: `payout = burn_amount * total_ada / total_winning_minted`. Note the ending: when the last winning token is burned, the state thread burns with it and the market UTxO disappears. The contract cleans up after itself.

```aiken
pub fn validate_claim(
  datum: MarketDatum,
  burn_amount: Int,
  spend_out_ref: OutputReference,
  tx: Transaction,
) -> Bool {
  expect datum.resolved
  expect Some(winning_side) = datum.winning_side
  expect burn_amount > 0

  let (winning_token, total_winning_minted) =
    when winning_side is {
      Yes -> (yes_token, datum.total_yes_minted)
      No -> (no_token, datum.total_no_minted)
    }

  let payout = burn_amount * datum.total_ada / total_winning_minted

  expect Some(spend_input) = find_input(tx.inputs, spend_out_ref)
  expect Script(market_policy_id) =
    spend_input.output.address.payment_credential
  let script_address = spend_input.output.address
  expect has_state_thread(spend_input.output.value, market_policy_id)

  let expected_datum =
    when winning_side is {
      Yes ->
        MarketDatum {
          ..datum,
          total_ada: datum.total_ada - payout,
          total_yes_minted: datum.total_yes_minted - burn_amount,
        }
      No ->
        MarketDatum {
          ..datum,
          total_ada: datum.total_ada - payout,
          total_no_minted: datum.total_no_minted - burn_amount,
        }
    }

  if total_winning_minted == burn_amount {
    // Last claimer takes what remains, burns the state thread, market closes
    expect
      only_burns_market_token(
        market_policy_id,
        winning_token,
        -burn_amount,
        True,
        tx,
      )
    True
  } else {
    expect Some(continuing_output) =
      tx.outputs
        |> list.find(fn(output) { output.address == script_address })

    expect InlineDatum(out_datum) = continuing_output.datum
    expect output_market_datum: MarketDatum = out_datum
    expect output_market_datum == expected_datum
    expect has_state_thread(continuing_output.value, market_policy_id)
    expect
      only_burns_market_token(
        market_policy_id,
        winning_token,
        -burn_amount,
        False,
        tx,
      )

    // ADA may decrease by at most the payout
    let input_lovelace = assets.lovelace_of(spend_input.output.value)
    let output_lovelace = assets.lovelace_of(continuing_output.value)
    expect output_lovelace >= input_lovelace - payout

    True
  }
}
```

### The mint policy

The mint handler enforces the lifecycle from the token side. The state thread can only ever mint in the transaction that consumes the one-shot input, which happens once in the market's existence. After that, position tokens mint only alongside a legitimate market spend (whose `validate_bet` polices the amounts), and burns are always allowed since burning your own tokens harms no one:

```aiken
pub fn validate_mint_tokens(
  one_shot: OutputReference,
  policy_id: assets.PolicyId,
  tx: Transaction,
) -> Bool {
  let one_shot_consumed =
    tx.inputs
      |> list.any(fn(input) { input.output_reference == one_shot })

  let has_market_spend =
    tx.inputs
      |> list.any(
          fn(input) {
            input.output.address.payment_credential == Script(policy_id) && has_state_thread(
              input.output.value,
              policy_id,
            )
          },
        )

  let minted_state_thread_qty =
    assets.quantity_of(tx.mint, policy_id, state_thread_token)

  let mint_dict = tx.mint |> assets.tokens(policy_id)
  let all_market_mints_are_positive =
    dict.foldl(mint_dict, True, fn(_asset_name, qty, acc) { acc && qty > 0 })

  expect all_market_mints_are_positive

  if one_shot_consumed {
    expect minted_state_thread_qty == 1
    True
  } else {
    expect minted_state_thread_qty == 0
    has_market_spend
  }
}

pub fn validate_burn_tokens(policy_id: assets.PolicyId, tx: Transaction) -> Bool {
  let mint_dict = tx.mint |> assets.tokens(policy_id)
  dict.foldl(mint_dict, True, fn(_key, qty, acc) { acc && qty < 0 })
}
```

### Off-chain: placing a bet

The market UTxO is found by its state-thread token (empty asset name, so its unit is just the policy ID). The off-chain code computes the same CPMM math the validator will recompute, and proposes the continuing state:

```typescript
import { Address, Assets, Data, InlineDatum } from "@evolution-sdk/evolution";

// client and wallet from Step 3

const marketAddress = Address.fromBech32(MARKET_ADDRESS);
const [marketUtxo] = await client.getUtxosWithUnit(marketAddress, MARKET_POLICY_ID);

const betAmount = 50_000_000n; // 50 ADA on YES

// Same formula the validator checks: yes_reserve - k / (no_reserve + amount)
const tokensOut = yesReserve - k / (noReserve + betAmount);

// The continuing datum: reserves shifted, totals grown, all other fields unchanged
const newDatum = Data.constr(0n, [
  /* ...same fields, with yes_reserve - tokensOut, no_reserve + betAmount,
     total_yes_minted + tokensOut, total_ada + betAmount */
]);

let position = Assets.fromLovelace(0n);
position = Assets.addByHex(position, MARKET_POLICY_ID, "594553", tokensOut); // "YES"

let marketValue = Assets.fromLovelace(potLovelace + betAmount);
marketValue = Assets.addByHex(marketValue, MARKET_POLICY_ID, "", 1n); // state thread

const tx = await wallet
  .newTx()
  .collectFrom({
    inputs: [marketUtxo],
    redeemer: Data.constr(0n, [Data.constr(0n, []), betAmount]), // Bet { Yes, amount }
  })
  .payToAddress({
    address: marketAddress,
    assets: marketValue,
    datum: new InlineDatum.InlineDatum({ data: newDatum }),
  })
  .mintAssets({ assets: position, redeemer: Data.constr(0n, []) }) // MintTokens
  .attachScript({ script: marketScript })
  .setValidity({ to: resolutionTime }) // upper bound at or below the deadline
  .build();

await (await tx.sign()).submit();
```

### Off-chain: resolving the market

This transaction ties the whole page together. It spends the market UTxO with the `Resolve` redeemer and performs the Pyth zero-withdrawal from Step 3 in the same transaction, so when `validate_resolve` calls `pyth.get_updates`, the verified update is right there in the withdrawal redeemer of the transaction being validated:

```typescript
import { Data, InlineDatum, ScriptHash } from "@evolution-sdk/evolution";
import {
  getPythScriptHash,
  getPythState,
} from "@pythnetwork/pyth-lazer-cardano-js";

// `update` is the signed payload fetched exactly as in Step 2

const pythState = await getPythState(PYTH_POLICY_ID, client);
const pythScript = getPythScriptHash(pythState);

// The datum the validator will demand: resolved, winner recorded
const resolvedDatum = Data.constr(0n, [
  /* ...same fields, with resolved = True and winning_side = Some(Yes | No),
     computed from the fetched price vs target_price */
]);

const tx = await wallet
  .newTx()
  .collectFrom({
    inputs: [marketUtxo],
    redeemer: Data.constr(1n, []), // Resolve
  })
  .readFrom({ referenceInputs: [pythState] })
  .withdraw({
    amount: 0n,
    redeemer: [update],
    stakeCredential: ScriptHash.fromHex(pythScript),
  })
  .payToAddress({
    address: marketAddress,
    assets: marketValue, // unchanged pot + state thread
    datum: new InlineDatum.InlineDatum({ data: resolvedDatum }),
  })
  .attachScript({ script: marketScript })
  .addSigner({ keyHash: creatorKeyHash }) // creator gate, see the caution above
  .setValidity({ from: resolutionTime, to: resolutionTime + 300_000n })
  .build();

await (await tx.sign()).submit();
```

Two validators run here: the market script (checking the state transition and reading the price through `pyth.get_updates`) and the Pyth withdraw script (verifying the update's signature). The reference input supplies the Pyth state, the withdrawal carries the update bytes, and the validity window proves the deadline has passed. That is the whole integration.

:::caution
This is a teaching adaptation of a hackathon entry: unaudited, with the simplifications flagged above. Read it to understand how an oracle-consuming dApp fits together, but do not deploy it with real funds as-is.
:::

## Next steps

- [Integrate a price feed](/docs/developers/curriculum/dapps/oracles/pyth): the three-step setup and the reusable validator patterns this market composes
- [Oracles on Cardano](/docs/developers/curriculum/dapps/oracles/overview): publication models, trust, and how to choose a feed
