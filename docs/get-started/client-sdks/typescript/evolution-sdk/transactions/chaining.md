---
title: Transaction Chaining
description: Build multiple dependent transactions without waiting for on-chain confirmation between them
---

# Transaction Chaining

Build a sequence of dependent transactions up-front, then submit them in order — no waiting for blocks between steps.

## The Problem

Each Cardano transaction spends UTxOs and creates new ones. Normally you can't build the second transaction until the first is confirmed on-chain, because the new UTxOs it creates don't exist yet from the provider's perspective.

This 10–30 second wait between steps is painful for multi-step workflows: batch payouts, batch minting, or any sequence of operations that logically belong together.

## How It Works

After `.build()` completes, the resulting `SignBuilder` exposes a `.chainResult()` method that returns:

```
ChainResult
├── consumed   — UTxOs coin selection spent from the available set
├── available  — remaining unspent UTxOs + newly created outputs (with pre-computed txHash)
└── txHash     — pre-computed hash of this transaction (blake2b-256 of the body)
```

The `available` array is the key. It contains the UTxOs your wallet still holds _plus_ any outputs this transaction creates — already tagged with the correct `txHash` so they're valid as inputs to the next build. Pass it as `availableUtxos` in the next `.build()` call.

```
tx1.build({ availableUtxos: walletUtxos })
     └── tx1.chainResult().available   ← remaining UTxOs + tx1's new outputs
           │
           ▼
tx2.build({ availableUtxos: tx1.chainResult().available })
     └── tx2.chainResult().available   ← remaining + tx2's new outputs
           │
           ▼
tx3.build({ availableUtxos: tx2.chainResult().available })
```

Transactions must be **submitted in order**. Each transaction spends outputs created by the previous one, so the node will reject tx2 if tx1 hasn't been submitted yet.

## Usage

### Two sequential payments

The simplest case: two payments built back-to-back, submitted in order.

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const alice = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const bob = Address.fromBech32(
  "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
)

// Build first transaction — auto-fetches wallet UTxOs
const tx1 = await client
  .newTx()
  .payToAddress({ address: alice, assets: Assets.fromLovelace(2_000_000n) })
  .build()

// Build second transaction immediately — no waiting for tx1 to confirm
const tx2 = await client
  .newTx()
  .payToAddress({ address: bob, assets: Assets.fromLovelace(2_000_000n) })
  .build({ availableUtxos: tx1.chainResult().available })

// Submit in order — tx1 must reach the node before tx2
const signed1 = await tx1.sign()
await signed1.submit()

const signed2 = await tx2.sign()
await signed2.submit()
```

### Spending an output from the previous transaction

Use `tx1.chainResult().available` to find the output you want to spend in tx2.

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const alice = Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63")
const bob = Address.fromBech32(
  "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
)

const tx1 = await client
  .newTx()
  .payToAddress({ address: alice, assets: Assets.fromLovelace(5_000_000n) })
  .build()

const chain1 = tx1.chainResult()

// Find Alice's output in the chain result — it has a pre-computed txHash
const aliceAddress = Address.toBech32(alice)
const aliceOutput = chain1.available.find((utxo) => Address.toBech32(utxo.address) === aliceAddress)!

// tx2 immediately spends Alice's output, forwarding to Bob
const tx2 = await client
  .newTx()
  .collectFrom({ inputs: [aliceOutput] })
  .payToAddress({ address: bob, assets: Assets.fromLovelace(4_500_000n) })
  .build({ availableUtxos: chain1.available })

await (await tx1.sign()).submit()
await (await tx2.sign()).submit()
```

### Three-step batch

Chain three builds together up-front, then submit all three.

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const recipients = [
  Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
  Address.fromBech32(
    "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs68faae"
  ),
  Address.fromBech32(
    "addr_test1qpq6xvp5y4fw0wfgxfqmn78qqagkpv4q7qpqyz8s8x3snp5n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgsc3z7t3"
  )
]

const tx1 = await client
  .newTx()
  .payToAddress({ address: recipients[0], assets: Assets.fromLovelace(5_000_000n) })
  .build()

const tx2 = await client
  .newTx()
  .payToAddress({ address: recipients[1], assets: Assets.fromLovelace(5_000_000n) })
  .build({ availableUtxos: tx1.chainResult().available })

const tx3 = await client
  .newTx()
  .payToAddress({ address: recipients[2], assets: Assets.fromLovelace(5_000_000n) })
  .build({ availableUtxos: tx2.chainResult().available })

for (const tx of [tx1, tx2, tx3]) {
  const signed = await tx.sign()
  await signed.submit()
}
```

## Gotchas

- **Submit in order.** Each transaction in the chain depends on outputs from the previous one. Submitting tx2 before tx1 means the node sees inputs that don't exist yet and rejects it.
- **Not retry-safe by default.** The chain is built from a single snapshot of chain state. If tx1 fails after you've built tx2 (e.g. a network error mid-submit), you cannot safely retry just tx2 — you need to rebuild the whole chain. See [Retry-Safe Transactions](./retry-safe.md) for how to structure resilient pipelines.
- **`chainResult()` is memoized.** It's computed once from the build result and cached. Calling it multiple times is free but you always get the same snapshot.
- **The outputs in `available` are not yet on-chain.** They exist only as pre-computed UTxOs. Don't pass them to any provider call (e.g. `getUtxos`) — they won't be there yet.

## Composing Builders

Use `.compose()` to merge multiple builder configurations into a single transaction. This enables reusable, modular transaction patterns:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

declare const recipientAddress: Address.Address

// Define reusable builder fragments
const paymentBuilder = client.newTx().payToAddress({
  address: recipientAddress,
  assets: Assets.fromLovelace(5_000_000n)
})

const validityBuilder = client.newTx().setValidity({
  to: BigInt(Date.now()) + 300_000n // 5 minutes
})

// Compose them into one transaction
const tx = await client
  .newTx()
  .compose(paymentBuilder)
  .compose(validityBuilder)
  .build()

const signed = await tx.sign()
await signed.submit()
```

Each `.compose(other)` copies the other builder's queued operations into the current builder. The composed builder is captured at compose-time — later changes to the source builder don't affect the composed result.

**Use cases:**
- Reusable payment templates shared across different flows
- Separating concerns: one builder for payments, another for validity, another for metadata
- Testing: compose mock operations in test setups

## Next Steps

- [Retry-Safe Transactions](./retry-safe.md)
- [Multi Output](./multi-output.md)
- [Simple Payment](./simple-payment.md)
