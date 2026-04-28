---
title: Retry-Safe Transactions
description: Build transactions that automatically retry when the node rejects inputs due to indexer lag
---

# Retry-Safe Transactions

Structure your build-sign-submit pipeline so that retrying re-reads all chain state from scratch every time.

## The Problem

This is one of the most common challenges Cardano developers face when building applications that submit sequential transactions.

When you submit a transaction it doesn't immediately become part of the chain. It first enters the **mempool** of the node you submitted to. A block producer then picks it up and includes it in a new **block**. That block propagates across the network, gets validated, and is attached to the chain. Only once your provider node has received and processed that block does its UTxO set reflect the spent inputs — a process that typically takes 10–30 seconds, and can be longer under network congestion or in the event of a chain fork.

Until that happens, the UTxOs consumed by your transaction still appear as unspent when you query your provider. If you immediately build the next transaction using those stale UTxOs, the node will reject it with `BadInputsUTxO` — because from the ledger's perspective, those inputs no longer exist.

This is not a bug. It is an inherent property of how Cardano's consensus and block propagation work.

The fix is straightforward: **all chain state reads must happen inside the action**, not before it. UTxOs, script UTxOs, datums, oracle values — anything queried from your provider must be re-read on every attempt so each retry works with the freshest available view of the chain.

## How It Works

An "action" is the complete unit of work — read chain state, build, sign, and submit — wrapped in a single retryable function or Effect. When the node rejects the transaction, the retry re-runs from the top, re-reading everything before building again.

```
retry attempt N
  └─ read chain state     ← fresh every attempt (UTxOs, datums, script state, ...)
  └─ build tx
  └─ sign
  └─ submit to node
       ├─ accepted → done
       └─ BadInputsUTxO → retry attempt N+1
```

Querying chain state **outside** the action and passing it in as a static value defeats this — the same snapshot is reused on every retry.

## Usage

### Plain async with manual retry

The simplest approach: wrap the full pipeline in an async function and call it from a retry loop.

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const recipient = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")

// The action fetches UTxOs at call time — safe to retry
async function sendPayment() {
  const tx = await client
    .newTx()
    .payToAddress({ address: recipient, assets: Assets.fromLovelace(2_000_000n) })
    .build()

  const signed = await tx.sign()
  return signed.submit()
}

// Simple retry with delay
async function withRetry<T>(action: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await action()
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error("unreachable")
}

const txHash = await withRetry(sendPayment)
console.log("Submitted:", txHash)
```

### With script UTxOs

When collecting from a script address, query the script UTxOs inside the action so each retry gets a fresh view of what is available at that address.

```ts
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

async function unlockFromScript() {
  const scriptAddress = Address.fromBech32("addr_test1...")
  const recipient = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")

  // Script UTxOs fetched inside the action — re-run on every retry
  const scriptUtxos = await client.getUtxos(scriptAddress)

  const tx = await client
    .newTx()
    .collectFrom({ inputs: scriptUtxos })
    .payToAddress({ address: recipient, assets: Assets.fromLovelace(5_000_000n) })
    .build()

  const signed = await tx.sign()
  return signed.submit()
}
```

### Using Effect for structured retry

When using Effect, compose the full pipeline as a single `Effect.gen` and apply `Effect.retry` directly. `Schedule` controls the timing and number of attempts.

```ts
import { Address, preprod, Client } from "@evolution-sdk/evolution"
import { Effect, Schedule } from "effect"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const unlockAction = Effect.gen(function* () {
  // Script UTxOs fetched fresh on every attempt
  const scriptUtxos = yield* client.effect.getUtxos(
    Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
  )

  const signBuilder = yield* client.newTx().collectFrom({ inputs: scriptUtxos }).buildEffect()

  return yield* signBuilder.effect.signAndSubmit()
})

// Retry up to 3 times with a 3-second delay between attempts
const txHash = await unlockAction.pipe(
  Effect.retry(Schedule.recurs(3).pipe(Schedule.addDelay(() => "3 seconds"))),
  Effect.runPromise
)

console.log("Submitted:", txHash)
```

`Effect.retry` re-runs the entire `Effect.gen` block on failure — every chain state read inside it is re-executed on each attempt.

## Gotchas

- **Read all chain state inside the action, not outside.** Any indexer call made before the action — UTxOs, datums, script state, oracle values — captures a snapshot that is reused on every retry. Move those reads inside the action so each attempt queries the indexer fresh.
- **Retry does not fix insufficient funds.** If the wallet genuinely does not have enough ADA, the node will reject for a different reason and retrying will always fail. Check balances before entering a retry loop.
- **`Effect.retry` retries on any failure by default.** If you use Kupmios (which submits directly via Ogmios to the node), you can narrow retries to stale-input rejections specifically by matching `"BadInputsUTxO"` in the error message — this is the node's ledger validation error surfaced through the submission response:

  ```ts
  Effect.retry(Schedule.recurs(3).pipe(Schedule.addDelay(() => "3 seconds")), {
    while: (err) => err.message.includes("BadInputsUTxO")
  })
  ```

  Other indexers relay the same node error in different formats — check the raw cause for the specific message.

- **Indexer lag is not instant.** A 0ms retry delay may still read the same stale data. Add at least a 2–3 second delay between attempts.

## Next Steps

- [Simple Payment](./simple-payment) — Basic transaction building
- [First Transaction](./first-transaction) — Complete walkthrough
- [Error Handling](../advanced/error-handling) — Typed errors with Effect
