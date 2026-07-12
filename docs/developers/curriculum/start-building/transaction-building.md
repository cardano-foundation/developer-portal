---
id: transaction-building
title: Transaction Building
sidebar_label: Transaction building
description: "Go beyond a simple payment: multiple outputs, coin selection, batching and airdrops, transaction chaining, resilient submission, and redeemer indexing, with Evolution and Mesh."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction) showed the core loop: **build → sign → submit**. This page goes deeper: paying many recipients at once, understanding how the builder picks inputs and fees, distributing tokens to hundreds of addresses, chaining dependent transactions, and surviving the indexer lag that trips up most first real deployments.

The conceptual model (UTXOs, inputs, outputs, fees, validity) is in [Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions); this page is the build-side how-to.

## How the builder works

When you build a transaction, a high-level SDK does several things so you don't have to. Understanding the phases helps when something doesn't balance:

1. **Coin selection**: picks UTXOs from your wallet to cover the outputs + fee (see below).
2. **Collateral**: for script transactions only, sets aside pure-ADA UTXOs to cover a failed script.
3. **Change**: returns the leftover (inputs − outputs − fee) to your change address, respecting the min-ADA per UTXO.
4. **Fee calculation**: sizes the fee from the final transaction, iterating because change and fee affect each other.
5. **Script evaluation**: for script transactions, runs the validators to compute execution-unit costs, which feed back into the fee.

The result is an unsigned transaction. Signing adds the witnesses; submitting broadcasts it. A read-only wallet can build a transaction but not sign one. That's the [frontend signs, backend builds](/docs/developers/curriculum/dapps/connect-a-wallet#frontend-signs-backend-builds-and-submits) split.

## Coin selection

Coin selection decides **which** UTXOs to spend. The usual default is **largest-first**: sort the wallet's UTXOs by ADA descending, then take from the top until the outputs and fee are covered. Fewer, larger inputs mean a smaller transaction and a lower fee than many small ones.

- It tracks every required asset (lovelace and each native token) and stops as soon as all are covered.
- It's deterministic. The same wallet state always selects the same inputs.
- If you pass explicit inputs yourself, selection only kicks in to cover any shortfall.

For privacy or fee-optimal strategies you can supply a custom selection function, but largest-first is the right default for most apps.

:::info Going deeper
Coin selection is an active research area. For a formal treatment of UTXO-based selection algorithms and their trade-offs, see this [Cardano research paper on UTXO-based coin selection](https://cardano.org/news/2024-05-23-research-paper-utxo-based-coin-select/).
:::

## Multiple outputs

Pay several recipients in **one** transaction, one fee instead of many. Chain output calls on the builder:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address, Assets } from "@evolution-sdk/evolution"

const tx = await client
  .newTx()
  .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: Assets.fromLovelace(5_000_000n) })
  .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: Assets.fromLovelace(3_000_000n) })
  .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: Assets.fromLovelace(2_000_000n) })
  .build()

const signed = await tx.sign()
await signed.submit()
```

To drain a wallet to a single address, use `.sendAll({ to })`. It collects every UTXO into one output minus fees.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder } from "@meshsdk/core"

const txBuilder = new MeshTxBuilder({ fetcher: provider })
const unsignedTx = await txBuilder
  .txOut("addr_test1...", [{ unit: "lovelace", quantity: "5000000" }])
  .txOut("addr_test1...", [{ unit: "lovelace", quantity: "3000000" }])
  .changeAddress(await wallet.getChangeAddressBech32())
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete()

const signedTx = await wallet.signTx(unsignedTx)
await wallet.submitTx(signedTx)
```

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```bash
# Each --tx-out is one recipient; one fee covers the whole transaction
cardano-cli latest transaction build \
  --tx-in <TxHash>#<TxIx> \
  --tx-out "addr_test1...+5000000" \
  --tx-out "addr_test1...+3000000" \
  --tx-out "addr_test1...+2000000" \
  --change-address $(< payment.addr) \
  --out-file tx.raw
```

Sign and submit as in [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction#send-ada).

</TabItem>
</Tabs>

## Transaction metadata

Any transaction can carry **metadata**: structured data stored permanently on-chain under a numeric **label**. It is used for transaction messages, NFT properties, certifications, timestamps, and supply-chain records. Metadata is stored as compact binary (CBOR), and the schema is deliberately simple: top-level keys are integers (0 to 2^64 − 1), and values are integers, UTF-8 strings (max 64 bytes), bytestrings, lists, or maps. Floats, booleans, and nulls must be encoded as one of those.

Common standardized labels:

| Label | CIP | Purpose |
|---|---|---|
| `674` | CIP-20 | Transaction messages / comments |
| `721` | CIP-25 | NFT metadata |
| `777` | CIP-27 | Royalties |

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Chain `attachMetadata` onto the transaction (the label is a `bigint`):

```typescript
import { Address, Assets, TransactionMetadatum } from "@evolution-sdk/evolution"

declare const message: TransactionMetadatum.TransactionMetadatum

const tx = await client
  .newTx()
  .payToAddress({ address: Address.fromBech32("addr_test1..."), assets: Assets.fromLovelace(2_000_000n) })
  .attachMetadata({ label: 674n, metadata: message })     // CIP-20 message
  .build()
```

Chain multiple `attachMetadata` calls for different labels (e.g. a `674n` message plus `721n` NFT metadata).

</TabItem>
<TabItem value="mesh" label="Mesh">

Add metadata with `metadataValue(label, metadata)` on the builder. This example attaches a CIP-20 (`674`) message:

```typescript
import { MeshTxBuilder } from "@meshsdk/core"

const txBuilder = new MeshTxBuilder({ fetcher: provider })
const unsignedTx = await txBuilder
  .changeAddress(await wallet.getChangeAddressBech32())
  .metadataValue(674, { msg: ["Invoice-No: 1234567890"] })   // CIP-20 message
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete()
```

Use any label with your own structure for custom application data (e.g. `metadataValue(1337, { name: "hello world", completed: 0 })`).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Put the metadata in a JSON file:

```json
{
  "674": { "msg": ["Invoice-No: 1234567890"] }
}
```

Reference it with `--metadata-json-file` when you build the transaction body (works with both `transaction build` and `build-raw`):

```bash
cardano-cli latest transaction build \
  --tx-in <TxHash>#<TxIx> \
  --change-address $(< payment.addr) \
  --metadata-json-file metadata.json \
  --out-file tx.raw
```

</TabItem>
</Tabs>

Metadata is public: any provider can read it back. With Blockfrost, fetch every transaction carrying a label via `GET /metadata/txs/labels/{label}`, and a block explorer shows a transaction's metadata in its UI. To maintain your own index of a label, [a Yaci Store plugin](/docs/developers/curriculum/production/indexing-and-analytics#index-exactly-what-you-need-plugins) can filter for it at indexing time. Minting an NFT with CIP-25 (`721`) metadata is shown end to end in [Mint an NFT](/docs/developers/curriculum/native-tokens/mint-nft).

## Batching and airdrops

A single transaction has a **max size (~16 KB)**. Each output adds ~60-100 bytes, so you fit roughly **20-30 ADA-only recipients** per transaction (fewer if outputs carry native tokens). To pay hundreds of recipients, chunk the list into transaction-sized batches:

```typescript
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size))
  return chunks
}

const BATCH_SIZE = 25 // conservative for ADA-only; lower it for token outputs
const batches = chunk(recipients, BATCH_SIZE)
```

Then submit each batch, waiting for confirmation before the next:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Assets } from "@evolution-sdk/evolution"

for (let i = 0; i < batches.length; i++) {
  let builder = client.newTx()
  for (const r of batches[i]) {
    builder = builder.payToAddress({ address: r.address, assets: Assets.fromLovelace(r.lovelace) })
  }
  const signed = await (await builder.build()).sign()
  const txHash = await signed.submit()
  await client.awaitTx(txHash, 3000)        // wait before the next batch
  console.log(`Batch ${i + 1}/${batches.length} confirmed:`, txHash)
}
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder } from "@meshsdk/core"

for (let i = 0; i < batches.length; i++) {
  let builder = new MeshTxBuilder({ fetcher: provider })
  for (const r of batches[i]) {
    builder = builder.txOut(r.address, [{ unit: "lovelace", quantity: r.lovelace.toString() }])
  }
  const unsignedTx = await builder
    .changeAddress(await wallet.getChangeAddressBech32())
    .selectUtxosFrom(await wallet.getUtxosMesh())
    .complete()
  const txHash = await wallet.submitTx(await wallet.signTx(unsignedTx))
  await new Promise<void>((resolve) => provider.onTxConfirmed(txHash, resolve))   // wait before the next batch
  console.log(`Batch ${i + 1}/${batches.length} confirmed:`, txHash)
}
```

</TabItem>
</Tabs>

For **native-token** airdrops, give each output enough ADA for the min-UTXO (tokens enlarge the UTXO. 2+ ADA per output is a safe floor; the builder computes the exact minimum). Waiting for each batch is simple but slow; the next two sections remove the wait.

## Chaining transactions

Normally you can't build transaction #2 until #1 confirms, because #1's new UTXOs don't exist from the provider's view yet, a 10-30 s wait per step. **Chaining** removes it: once you have built transaction #1, you feed the UTXOs you still hold **plus** its new outputs (already tagged with its pre-computed hash) into the build of transaction #2. For the concept beneath this, why an unconfirmed output is safe to spend and where chaining fits among Cardano's scaling options, see [transaction chaining](/docs/developers/curriculum/production/transaction-chaining). With Evolution:

```typescript
import { Address, Assets } from "@evolution-sdk/evolution"

const alice = Address.fromBech32("addr_test1...")
const bob = Address.fromBech32("addr_test1...")

const tx1 = await client
  .newTx()
  .payToAddress({ address: alice, assets: Assets.fromLovelace(2_000_000n) })
  .build()

// Build tx2 immediately, spending from tx1's not-yet-confirmed outputs
const tx2 = await client
  .newTx()
  .payToAddress({ address: bob, assets: Assets.fromLovelace(2_000_000n) })
  .build({ availableUtxos: tx1.chainResult().available })

// Submit in order. The node rejects tx2 if tx1 hasn't arrived yet
await (await tx1.sign()).submit()
await (await tx2.sign()).submit()
```

:::warning Submit in order
Each chained transaction spends an output of the previous one. If tx2 reaches the node before tx1, the node sees inputs that don't exist and rejects it. A sequential loop guarantees ordering. The `available` outputs are **not on-chain yet**. Don't pass them to a provider query.
:::

Mesh has no built-in chain-tracking equivalent to Evolution's `chainResult().available`. To chain with Mesh you thread the previous transaction's outputs forward yourself, adding each as an explicit input on the next build with `.txIn(txHash, index, amount, address)` and tracking those unconfirmed UTXOs in your own code. You can also merge reusable Evolution builder fragments with `.compose(otherBuilder)` (e.g. a payment fragment + a validity fragment) into one transaction.

## Resilient submission (retry-safe)

The single most common production bug: you submit a transaction, then immediately build the next one, but your provider's UTXO set hasn't caught up, so it still shows the **already-spent** inputs as available. The node rejects the new transaction with `BadInputsUTxO`. This isn't a bug; it's block propagation (10-30 s, longer under load).

The fix: **read all chain state inside the retryable action**, not before it. Each retry re-queries UTXOs/datums/script state fresh, so it works from the latest view. The retry harness itself is plain TypeScript; only the build differs per SDK:

```typescript
async function withRetry<T>(action: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try { return await action() }
    catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw new Error("unreachable")
}
```

The action fetches everything it needs at call time, so each attempt builds from fresh state:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Assets } from "@evolution-sdk/evolution"

async function sendPayment() {
  const tx = await client
    .newTx()
    .payToAddress({ address: recipient, assets: Assets.fromLovelace(2_000_000n) })
    .build()
  return (await tx.sign()).submit()
}

const txHash = await withRetry(sendPayment)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder } from "@meshsdk/core"

async function sendPayment() {
  const unsignedTx = await new MeshTxBuilder({ fetcher: provider })
    .txOut(recipient, [{ unit: "lovelace", quantity: "2000000" }])
    .changeAddress(await wallet.getChangeAddressBech32())
    .selectUtxosFrom(await wallet.getUtxosMesh())
    .complete()
  return wallet.submitTx(await wallet.signTx(unsignedTx))
}

const txHash = await withRetry(sendPayment)
```

</TabItem>
</Tabs>

Querying chain state **outside** the action and passing it in defeats the retry. The same stale snapshot is reused every time. When collecting from a script address, fetch the script UTXOs inside the action too. With Effect, wrap the whole `Effect.gen` pipeline and apply `Effect.retry(Schedule.recurs(3)...)`, optionally narrowing to `err.message.includes("BadInputsUTxO")`. Retrying won't fix genuinely insufficient funds. Check balances first.

## Redeemer indexing

Plutus validators can receive **input indices** in their redeemer for O(1) lookup instead of scanning every input on-chain (execution units are expensive). The catch: Cardano sorts inputs canonically by `(txHash, outputIndex)`, and coin selection adds wallet UTXOs *after* you specify script inputs, shifting every index. So the indices aren't known until the build is complete.

SDKs solve this by **deferring redeemer construction**: you provide a redeemer *function*, and the builder calls it after coin selection has finalized and sorted the inputs. Three modes:

| Mode | The function receives | Use case |
|---|---|---|
| **Batch** | all indexed inputs → one redeemer | a stake-validator coordinator that validates many contract inputs at once |
| **Self** | called once per script UTXO, with its own index | a spend validator that looks up its own input |
| **Static** | no indices, data used directly | a redeemer that doesn't depend on order |

This is what powers the [withdraw-zero coordinator pattern](/docs/developers/curriculum/staking-governance/staking#script-controlled-stake-and-the-coordinator-pattern): the [Stake Validator design pattern](/docs/developers/curriculum/smart-contracts/advanced/design-patterns/stake-validator) runs business logic once for the whole transaction. See [Lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend) for spending from scripts and [Write a validator](/docs/developers/curriculum/smart-contracts/write-a-validator) for the on-chain side.

## Offline builds (air-gapped)

SDKs build a transaction against a live provider. `cardano-cli` can also build one **fully offline**, where you calculate the fee and balance the transaction yourself, for air-gapped signing and reproducible builds. Of its three build commands, `transaction build` is the everyday node-connected one, `build-raw` is the offline one, and `build-estimate` sizes a fee offline without balancing.

<Tabs groupId="sdk">
<TabItem value="cardano-cli" label="cardano-cli" default>

```bash
# 1. Protocol parameters (needs a node, once)
cardano-cli query protocol-parameters --out-file pparams.json

# 2. Draft with fee 0 (the change output holds the full input for now)
cardano-cli latest transaction build-raw \
  --tx-in <TxHash>#<TxIx> \
  --tx-out "$(< payment2.addr)+1000000000" \
  --tx-out "$(< payment.addr)+8994790937" \
  --fee 0 --protocol-params-file pparams.json --out-file tx.draft

# 3. Compute the exact fee (deterministic)
cardano-cli latest transaction calculate-min-fee \
  --tx-body-file tx.draft --protocol-params-file pparams.json --witness-count 1
# 173993 Lovelace

# 4. Rebuild: change = inputs - sent - fee
cardano-cli latest transaction build-raw \
  --tx-in <TxHash>#<TxIx> \
  --tx-out "$(< payment2.addr)+1000000000" \
  --tx-out "$(< payment.addr)+8994616944" \
  --fee 173993 --protocol-params-file pparams.json --out-file tx.raw
```

</TabItem>
</Tabs>

`--witness-count` is how many signatures the transaction will carry. It affects the fee. Inspect any draft with `cardano-cli debug transaction view --tx-body-file tx.draft`.

## Spending from several keys

To spend UTXOs owned by *different* keys in one transaction (combining two wallets, or a multisig), list each `--tx-in`, set the witness count to the number of signers, and pass every signing key at sign time.

<Tabs groupId="sdk">
<TabItem value="cardano-cli" label="cardano-cli" default>

```bash
cardano-cli latest transaction build-raw \
  --tx-in <utxoA> --tx-in <utxoB> \
  --tx-out "$(< store-owner.addr)+999646250" \
  --fee 179581 --out-file tx.draft

cardano-cli latest transaction sign \
  --tx-body-file tx.draft \
  --signing-key-file payment1.skey \
  --signing-key-file payment2.skey \
  --out-file tx.signed
```

</TabItem>
</Tabs>

Then `submit` as usual. Parse CLI output with `jq` for scripted workflows, e.g. pick the first UTXO: `--tx-in $(cardano-cli query utxo --address $(< payment.addr) --output-json | jq -r 'keys[0]')`. The full command reference lives in the [cardano-cli repository](https://github.com/IntersectMBO/cardano-cli).

## Declarative transactions

Everything on this page states *how* to assemble a transaction: pick inputs, add outputs, attach metadata, compute the change. An emerging alternative flips the model: you describe *what* must be true of the transaction, and a resolver works out the rest at runtime. The most developed take on this for Cardano is [Tx3](https://docs.txpipe.io/tx3), a small declarative language that treats a transaction as a reusable, parameterized template:

```text title="buy_product.tx3"
party Buyer;
party Seller;

asset Product = 0x6b9b69."STUFF";

fn total_price(quantity: Int) -> AnyAsset {
  let unit_price = Ada(5000000);
  unit_price * quantity
}

tx buy_product(quantity: Int) {
  input payment {
    from: Buyer,
    min_amount: total_price(quantity) + fees,
  }

  mint {
    amount: Product(quantity),
    redeemer: (),
  }

  output {
    to: Buyer,
    amount: payment - total_price(quantity) - fees + Product(quantity),
  }

  output {
    to: Seller,
    amount: total_price(quantity),
  }
}
```

Read it against the builder model above:

- **Parties are roles, not addresses.** `Buyer` and `Seller` are placeholders bound to real addresses at resolution, so the same spec runs against any wallet and any deployment.
- **Assets are named and typed.** `Product` wraps the policy ID and asset name once; everything after refers to it by name instead of a raw hex pair.
- **Inputs are constraints, not UTXO references.** `payment` states its conditions (it must come from the Buyer and cover the price plus fees), and the resolver performs the coin selection you read about at the top of this page.
- **Balancing is checked up front.** Minting sits in the same declaration, the asset math is type-checked at compile time, and fees and change are computed for you, so a transaction that doesn't balance never reaches submission.

From a spec like this, the toolchain generates typed clients for TypeScript, Rust, Go, and Python, and a resolver materializes, signs, and submits the concrete transaction over a wire protocol (TRP). Your application code calls `buy_product(3)` instead of chaining builder calls. The project is young and its APIs still moving, but the paradigm is worth knowing as you design off-chain code: it is the same shift that constraint-based coin selection already made for inputs, applied to the whole transaction. See the [Tx3 documentation](https://docs.txpipe.io/tx3) and [repository](https://github.com/tx3-lang/tx3).

## Next steps

- [Lock and spend](/docs/developers/curriculum/smart-contracts/lock-and-spend), build transactions that interact with validators
- [Mint native tokens and NFTs](/docs/developers/curriculum/native-tokens/overview), outputs that carry new assets
- [Going to production](/docs/developers/curriculum/production/going-to-production), the reliability checklist before mainnet
