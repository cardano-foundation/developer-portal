---
id: transaction-failures
title: When transactions fail
sidebar_label: Transaction failures
description: Why Cardano transactions fail, the two-phase validation model, build-time versus submit-time errors, and which failures are retryable.
---

Transactions fail, and on Cardano they fail in a small number of well-defined ways. The useful question is never just "what went wrong" but **where** and **why**: a failure caught while you build is different from one the node rejects, and a transient race is different from a logic error. Knowing which you are looking at tells you whether to retry, rebuild, or fix. This page is the map; each class links to the page that treats it in depth.

## The two-phase model

The ledger validates a transaction in two phases, and the phase a failure lands in decides what it costs you.

- **Phase 1** checks structure: the inputs exist, the value balances (inputs equal outputs plus fee), signatures are present, and the fee is sufficient. A phase-1 failure is rejected for free, the transaction never makes it on-chain.
- **Phase 2** runs the Plutus scripts. It only happens if phase 1 passed. A phase-2 failure (a validator returns false, or exhausts its budget) is the one case where a *submitted* transaction costs you: the node consumes your [collateral](/docs/developers/curriculum/smart-contracts/lock-and-spend#collateral). A transaction that passes both phases never loses collateral.

Most failures you hit are phase 1, and most of those never leave your machine.

## Build-time failures

The SDK refuses to produce a transaction in the first place. Nothing is submitted, nothing is spent; you fix the inputs and rebuild.

- **Below the minimum ADA.** Every output must carry a [minimum amount of ADA](/docs/developers/curriculum/native-tokens/overview#the-minimum-ada-requirement) that scales with its size, so an output of a bare token or a tiny lovelace amount is rejected before submission.
- **Transaction too large.** Too many inputs or a large multi-asset bundle can push the transaction past the size limit. This is the downstream cost of [wallet fragmentation](/docs/developers/curriculum/start-building/transaction-building#coin-selection): many small UTXOs mean many inputs. Consolidate, or let coin selection prefer larger UTXOs.
- **Insufficient funds.** Coin selection cannot cover the outputs plus fee from the available UTXOs.
- **Over the script budget.** A Plutus transaction whose scripts exceed the per-transaction execution-unit limit cannot be built. See [what you pay for](/docs/developers/curriculum/smart-contracts/choose-a-language#what-you-pay-for-execution-costs) and [optimization](/docs/developers/curriculum/smart-contracts/advanced/optimization).

## Submit-time failures

The transaction is well-formed but the node rejects it. The full list of node rejection codes is in [Submitting transactions](/docs/developers/curriculum/start-building/query-the-chain#submitting-transactions); the ones worth understanding by cause:

- **`BadInputsUTxO`** (phase 1): a chosen UTXO is already spent. Either you read **stale** state (the indexer had not caught up) or another transaction **contended** for the same UTXO (a second browser tab, a double-clicked submit, or a concurrent backend build). This is the UTXO model's characteristic race: inputs are discrete and consumed exactly once.
- **`OutsideValidityIntervalUTxO`** (phase 1): the transaction's validity window has passed before it landed. Rebuild with a fresh window.
- **`ValueNotConservedUTxO`** / **`FeeTooSmallUTxO`** (phase 1): the balance or the fee is wrong, almost always a building bug rather than a transient condition.
- **Script failure** (phase 2): a validator returned false or ran out of budget. Collateral is consumed. This is a logic problem, in the validator or in the datum/redeemer you supplied, not something a retry fixes. Reproduce it locally with the [testing](/docs/developers/curriculum/smart-contracts/testing) tools before resubmitting.

## Retryable or fatal

The triage that matters: re-sending an unchanged transaction only helps for **transient** failures. Everything else needs a rebuild or a fix.

| Failure | When | Retry unchanged? | What to do |
|---|---|---|---|
| Network timeout / provider error | Submit | Yes | Retry after a short backoff |
| `BadInputsUTxO` (stale or contended) | Submit | No | Re-read fresh UTXOs and rebuild |
| `OutsideValidityIntervalUTxO` | Submit | No | Rebuild with a new validity window |
| `ValueNotConserved` / `FeeTooSmall` | Submit | No | Fix the build |
| Below min-ADA / too large / insufficient funds | Build | No | Fix inputs or consolidate, rebuild |
| Script failure (phase 2) | Submit | No | Debug the validator; collateral already spent |

The important subtlety: `BadInputsUTxO` from indexer lag *looks* transient but a blind retry resubmits the same doomed transaction. The fix is to make every attempt read fresh chain state, which is exactly the [retry-safe pattern](/docs/developers/curriculum/start-building/transaction-building#resilient-submission-retry-safe): wrap read, build, sign, and submit together so a retry rebuilds against the current UTXO set rather than the stale one.

## Key takeaways

- A failure's **phase** tells you its cost: phase 1 is free, a phase-2 script failure burns collateral.
- A failure's **stage** tells you the fix: build-time means change the inputs; submit-time means the node judged a well-formed transaction.
- Only **transient** failures (timeouts, lag-induced `BadInputsUTxO`) are worth retrying, and only if each attempt rebuilds from fresh state.

## Next steps

- [Resilient submission](/docs/developers/curriculum/start-building/transaction-building#resilient-submission-retry-safe): the retry-safe pattern in code
- [Submitting transactions](/docs/developers/curriculum/start-building/query-the-chain#submitting-transactions): the full rejection-code reference
- [Collateral](/docs/developers/curriculum/smart-contracts/lock-and-spend#collateral): how phase-2 failures are paid for
