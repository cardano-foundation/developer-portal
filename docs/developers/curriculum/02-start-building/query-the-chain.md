---
id: query-the-chain
title: Query the Chain
sidebar_label: Query the chain
description: Read Cardano on-chain data (UTXOs, balances, datums, protocol parameters, delegation, and transaction status) through a provider, with Evolution and Mesh.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Reading is the other half of building. Before you build a transaction you need UTXOs and protocol parameters; after you submit one you wait for confirmation; a dApp UI shows balances, datums, and delegation. All of it comes from **querying the chain** through a **provider**, so you don't have to run and index a node yourself.

The conceptual model (UTXOs, datums) is in [Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions) and [eUTXO](/docs/developers/curriculum/fundamentals/core-concepts/eutxo); this page is the read-side how-to.

## Choosing a provider

A provider is the data source your SDK talks to. Most SDKs support several behind one unified interface, so the query methods stay the same no matter which you pick:

| Provider | Hosting | API key | Rate limits |
|---|---|---|---|
| **Blockfrost** | Hosted | Required | Yes (free tier limited) |
| **Maestro** | Hosted | Required | Yes (free tier limited) |
| **Koios** | Hosted (community) or self-hosted | Optional | Yes (higher with a key) |
| **Kupmios** | Self-hosted (Ogmios + Kupo) | Not applicable | None (your own infra) |

Configure one when you make the client:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { mainnet, Client } from "@evolution-sdk/evolution"

// Blockfrost (hosted)
const bf = Client.make(mainnet).withBlockfrost({
  baseUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
  projectId: process.env.BLOCKFROST_PROJECT_ID!
})

// Kupmios (self-hosted Ogmios + Kupo)
const kupmios = Client.make(mainnet).withKupmios({
  ogmiosUrl: "http://localhost:1337",
  kupoUrl: "http://localhost:1442"
})

// Maestro (hosted)
const maestro = Client.make(mainnet).withMaestro({
  baseUrl: "https://mainnet.gomaestro-api.org/v1",
  apiKey: process.env.MAESTRO_API_KEY!
})

// Koios (community)
const koios = Client.make(mainnet).withKoios({ baseUrl: "https://api.koios.rest/api/v1" })
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { BlockfrostProvider, KoiosProvider, MaestroProvider, OgmiosProvider } from "@meshsdk/core"

// Blockfrost (hosted), network auto-detected from the key prefix
const bf = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID!)

// Koios (community), pass the network
const koios = new KoiosProvider("mainnet")

// Maestro (hosted)
const maestro = new MaestroProvider({ network: "Mainnet", apiKey: process.env.MAESTRO_API_KEY! })

// Ogmios (self-hosted; Mesh has no single "Kupmios", pair it with Kupo for indexed reads)
const ogmios = new OgmiosProvider("ws://localhost:1337")
```

In Mesh the read methods live on the **provider** (an `IFetcher`/`ISubmitter`), not on a unified client. You pass the provider to `MeshTxBuilder` and the wallet, and call its `fetch*` methods directly.

</TabItem>
</Tabs>

Use the matching network base URL for Preprod/Preview (e.g. `https://cardano-preprod.blockfrost.io/api/v0`). For a **hosted Kupmios** like [Demeter](https://demeter.run), pass the API keys through the connection. With Evolution that is the `headers` option on `withKupmios`:

```typescript
const client = Client.make(mainnet).withKupmios({
  ogmiosUrl: "https://ogmios.demeter.run",
  kupoUrl: "https://kupo.demeter.run",
  headers: {
    ogmiosHeader: { "dmtr-api-key": process.env.DEMETER_API_KEY! },
    kupoHeader: { "dmtr-api-key": process.env.DEMETER_API_KEY! }
  }
})
```

Mesh has no single Kupmios provider; pair `OgmiosProvider` with Kupo and pass the Demeter keys through each provider's connection options.

Because the interface is unified, switching provider (e.g. Blockfrost in dev, self-hosted Kupmios in prod) is a one-line change. The query calls stay the same. For setting up the provider infrastructure itself (Blockfrost projects, running your own node + Kupo + Ogmios, Demeter), see the [API providers reference](/docs/developers/curriculum/production/api-providers/overview) and [production infrastructure](/docs/developers/curriculum/production/infrastructure).

:::tip Privacy and trust
A **hosted** provider sees every address you query and every transaction you submit, along with your IP. It's a third party in your data path, with rate limits and an uptime you don't control. **Self-hosting** (your own node + Kupo + Ogmios, or Kupmios) keeps that data private and removes the dependency, at the cost of running the infrastructure. Pick based on how sensitive your queries are and how much ops you want to own.
:::

## Provider-only, read-only, or signing client

How you configure the client decides what it can do:

| Client | Configured with | Query any address | Query own wallet | Build tx | Sign |
|---|---|---|---|---|---|
| **Provider-only** | provider | Yes | - | - | - |
| **Read-only** | provider + address | Yes | Yes | Yes (unsigned) | - |
| **Signing** | provider + wallet (seed/key/CIP-30) | Yes | Yes | Yes | Yes |

A **provider-only** client is all you need to read the chain, a block explorer, a submission service, a monitor. Add a wallet address (**read-only**) to also build unsigned transactions for a specific user (the [backend-builds pattern](/docs/developers/curriculum/dapps/connect-a-wallet#frontend-signs-backend-builds-and-submits)); add a [wallet](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys#working-with-wallets-in-code) to sign.

## Querying chain data

You'll read a handful of things off the chain, each a single query through the client.

### Off-chain helpers you'll reach for

Querying gives you raw chain data; turning addresses, datums, and assets into the hashes and identifiers your code needs is the other half. Both SDKs ship the same family of pure helpers for this, so you can call them in a backend without a provider. The calls differ in name, not in what they return:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address, Unit, Time } from "@evolution-sdk/evolution"

// Address -> credentials
const { paymentCredential, stakingCredential, networkId } = Address.getAddressDetails("addr_test1...")
const payment = Address.getPaymentCredential("addr_test1...")     // payment credential only

// Unit -> policy id + asset name
const { policyId, assetName, label } = Unit.fromUnit(unit)

// Time -> slot for a network
const slot = Time.unixTimeToSlot(Date.now(), slotConfig)

// CIP-14 fingerprint: compute from policy + name (no one-call helper)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { deserializeAddress, resolvePaymentKeyHash, resolveSlotNo, resolveFingerprint } from "@meshsdk/core"

// Address -> credentials
const { pubKeyHash, scriptHash, stakeCredentialHash } = deserializeAddress("addr_test1...")
const paymentKeyHash = resolvePaymentKeyHash("addr_test1...")     // payment key hash only

// Unit -> policy id + asset name (slice; unit = policyId + assetNameHex)
const policyId = unit.slice(0, 56)
const assetNameHex = unit.slice(56)

// Time -> slot for a network
const slot = resolveSlotNo("preprod")

// CIP-14 fingerprint
const fingerprint = resolveFingerprint(policyId, assetNameHex)
```

</TabItem>
</Tabs>

Mesh additionally ships one-call helpers like `resolveDataHash` (datum hash), `serializeNativeScript`, and `resolveScriptHashDRepId`; in Evolution you reach the same results through its `Data`, `NativeScripts`, and credential modules. Either way these are pure (network-aware only for slot conversion), so they belong in a backend without a provider.

### UTXOs and balances

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address } from "@evolution-sdk/evolution"

// Any address
const utxos = await client.getUtxos(Address.fromBech32("addr_test1..."))

// Your wallet, and its total ADA
const mine = await client.getWalletUtxos()
const balance = mine.reduce((sum, u) => sum + u.assets.lovelace, 0n)

// Find UTXOs holding a specific asset, or the single UTXO holding an NFT
const withToken = await client.getUtxosWithUnit(Address.fromBech32("addr_test1..."), unit)
const nftUtxo = await client.getUtxoByUnit(unit)   // unit = policyId + assetNameHex
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
// Any address (pass a unit as the second argument to filter by asset)
const utxos = await provider.fetchAddressUTxOs("addr_test1...")

// Your wallet, and its total ADA
const mine = await wallet.getUtxosMesh()
const balance = (await wallet.getBalanceMesh()).find((a) => a.unit === "lovelace")?.quantity ?? "0"

// UTXOs holding a specific asset, or the addresses holding an NFT
const withToken = await provider.fetchAddressUTxOs("addr_test1...", unit)   // unit = policyId + assetNameHex
const holders = await provider.fetchAssetAddresses(unit)
```

</TabItem>
</Tabs>

### Datums

A UTXO with an **inline datum** carries it directly, on the UTXO you already fetched. A UTXO with only a **datum hash** needs a separate lookup to recover the datum behind it:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
// Inline datum: already attached to the fetched UTXO
const utxos = await client.getUtxos(scriptAddress)
const inline = utxos[0].datumOption          // present when the output carries an inline datum

// Datum hash: resolve the datum behind it through the provider
const datum = await client.getDatum(datumHash)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
// Inline datum: Mesh returns it directly on each fetched UTXO
const utxos = await provider.fetchAddressUTxOs(scriptAddress)
const inline = utxos[0].output.plutusData    // the inline datum (CBOR hex), when present
```

</TabItem>
</Tabs>

Inline datums (Plutus V2+) avoid the extra round-trip. Prefer them when designing contracts. See [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context). Mesh reads inline datums straight off the fetched UTXO and has no separate datum-hash lookup, so for a hash-only UTXO you supply the datum off-chain when you spend it, another reason to prefer inline datums.

### Protocol parameters

The builder fetches these automatically, but you can read them, fees, size limits, deposits, Plutus costs:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
const params = await client.getProtocolParameters()
console.log(params.minFeeA, params.maxTxSize, params.keyDeposit, params.coinsPerUtxoByte)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const params = await provider.fetchProtocolParameters()
```

</TabItem>
</Tabs>

### Delegation and confirmation

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
// Which pool a reward address delegates to, and its reward balance
const delegation = await client.getDelegation(rewardAddress)   // { poolId, rewards }

// Wait for a submitted transaction to appear on-chain (poll every 3s)
const confirmed = await client.awaitTx(txHash, 3000)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
// Delegation and reward balance for a stake address
const info = await provider.fetchAccountInfo(rewardAddress)   // { active, poolId, balance, rewards, ... }

// Call back once a submitted transaction is on-chain
provider.onTxConfirmed(txHash, () => console.log("confirmed"))
```

</TabItem>
</Tabs>

Delegation queries underpin the [staking](/docs/developers/curriculum/staking-governance/staking) UI; `awaitTx` is the confirmation step after [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction).

## Submitting transactions

A provider also broadcasts signed transactions and can evaluate script costs before you submit:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Transaction } from "@evolution-sdk/evolution"

// Submit signed CBOR (e.g. returned from a frontend wallet)
const signedTx = Transaction.fromCBORHex(signedTxCbor)
const txHash = await client.submitTx(signedTx)
const confirmed = await client.awaitTx(txHash)

// Estimate script execution units before submitting
const redeemers = await client.evaluateTx(Transaction.fromCBORHex(unsignedTxCbor))
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
// Submit signed CBOR (e.g. returned from a frontend wallet)
const txHash = await provider.submitTx(signedTxCbor)
provider.onTxConfirmed(txHash, () => console.log("confirmed"))

// Estimate script execution units before submitting
const redeemers = await provider.evaluateTx(unsignedTxCbor)
```

</TabItem>
</Tabs>

Common rejection reasons from the node:

| Error | Meaning | Retryable? |
|---|---|---|
| `BadInputsUTxO` | A chosen UTXO was already spent | No: rebuild with fresh UTXOs |
| `OutsideValidityIntervalUTxO` | The transaction expired | No: rebuild with a new validity window |
| `ValueNotConservedUTxO` | Inputs ≠ outputs + fee | No: fix the transaction |
| `FeeTooSmallUTxO` | Fee too low | No: rebuild |
| Network timeout | Provider unreachable | Yes: retry after a delay |

`BadInputsUTxO` from indexer lag is the classic one. Handle it with the [retry-safe pattern](/docs/developers/curriculum/start-building/transaction-building#resilient-submission-retry-safe), which re-reads chain state on every attempt.

## Inspect a transaction

Sometimes you have a transaction in hand (one you built, or one you pulled from the chain) and you want to read it back: its inputs, outputs, fee, mint, and validity interval. Both SDKs decode transaction CBOR into an inspectable structure.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

Evolution decodes CBOR straight into typed transaction objects:

```typescript
import { Transaction, TransactionBody } from "@evolution-sdk/evolution"

const tx = Transaction.fromCBORHex(txHex)          // the whole transaction
const body = TransactionBody.fromCBORHex(bodyHex)  // or just the body
// read inputs, outputs, fee, mint, and the validity interval off the decoded body
```

</TabItem>
<TabItem value="mesh" label="Mesh">

Mesh's `TxParser` turns CBOR into a `MeshTxBuilderBody`. It needs a serializer (`CSLSerializer` from `@meshsdk/core-csl`) and, optionally, a fetcher so it can pull the input UTXO data the CBOR only references by hash:

```typescript
import { BlockfrostProvider, TxParser } from "@meshsdk/core"
import { CSLSerializer } from "@meshsdk/core-csl"

const fetcher = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID!)
const txParser = new TxParser(new CSLSerializer(), fetcher)

// txHex from building, or fetcher.fetchTxInfo(txHash).tx.cborHex from chain
const body = await txParser.parse(txHex)   // pass providedUtxos as 2nd arg if no fetcher

console.log("inputs:", body.inputs.length, "outputs:", body.outputs.length)
console.log("fee:", body.fee, "mints:", body.mints?.length ?? 0)
```

Beyond reading, the parsed body can be rebuilt with `MeshTxBuilder`, or turned into a unit tester via `txParser.toTester()` (see [Testing without a chain](/docs/developers/curriculum/production/development-networks#testing-without-a-chain)).

</TabItem>
</Tabs>

## Next steps

- [Transaction building](/docs/developers/curriculum/start-building/transaction-building), use what you query to build and submit
- [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet), read a user's UTXOs and address in the browser
- [Contract library](/templates/contracts), inspect real contracts' UTXOs and datums with what you just learned
- [Production infrastructure](/docs/developers/curriculum/production/infrastructure), run your own provider stack at scale
