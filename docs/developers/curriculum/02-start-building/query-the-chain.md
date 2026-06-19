---
id: query-the-chain
title: Query the Chain
sidebar_label: Query the chain
description: Read Cardano on-chain data (UTXOs, balances, datums, protocol parameters, delegation, and transaction status) through a provider, with Evolution and cardano-cli.
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

Use the matching network base URL for Preprod/Preview (e.g. `https://cardano-preprod.blockfrost.io/api/v0`). For a **hosted Kupmios** like [Demeter](https://demeter.run), pass API keys via headers:

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

Every query runs through the client. The full set:

| Method | Returns | Description |
|---|---|---|
| `getUtxos(address)` | `UTxO[]` | UTXOs at any address |
| `getWalletUtxos()` | `UTxO[]` | Your wallet's UTXOs |
| `getUtxosWithUnit(address, unit)` | `UTxO[]` | UTXOs at an address holding an asset |
| `getUtxoByUnit(unit)` | `UTxO` | The single UTXO holding an NFT |
| `getUtxosByOutRef(refs)` | `UTxO[]` | UTXOs by output reference |
| `getDatum(hash)` | `Data` | A datum by its hash |
| `getProtocolParameters()` | `ProtocolParameters` | Current network parameters |
| `getDelegation(rewardAddress)` | `Delegation` | Stake delegation + rewards |
| `awaitTx(hash, checkInterval?)` | `boolean` | Wait for a transaction to confirm |

### UTXOs and balances

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

### Datums

A UTXO with an **inline datum** carries it directly. A UTXO with a **datum hash** needs a lookup:

```typescript
const datum = await client.getDatum(datumHash)
```

Inline datums (Plutus V2+) avoid the extra round-trip. Prefer them when designing contracts. See [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context).

### Protocol parameters

The builder fetches these automatically, but you can read them, fees, size limits, deposits, Plutus costs:

```typescript
const params = await client.getProtocolParameters()
console.log(params.minFeeA, params.maxTxSize, params.keyDeposit, params.coinsPerUtxoByte)
```

### Delegation and confirmation

```typescript
// Which pool a reward address delegates to, and its reward balance
const delegation = await client.getDelegation(rewardAddress)   // { poolId, rewards }

// Wait for a submitted transaction to appear on-chain (poll every 3s)
const confirmed = await client.awaitTx(txHash, 3000)
```

Delegation queries underpin the [staking](/docs/developers/curriculum/staking-governance/staking) UI; `awaitTx` is the confirmation step after [your first transaction](/docs/developers/curriculum/start-building/your-first-transaction).

## Submitting transactions

A provider also broadcasts signed transactions and can evaluate script costs before you submit:

```typescript
import { Transaction } from "@evolution-sdk/evolution"

// Submit signed CBOR (e.g. returned from a frontend wallet)
const signedTx = Transaction.fromCBORHex(signedTxCbor)
const txHash = await client.submitTx(signedTx)
const confirmed = await client.awaitTx(txHash)

// Estimate script execution units before submitting
const redeemers = await client.evaluateTx(Transaction.fromCBORHex(unsignedTxCbor))
```

Common rejection reasons from the node:

| Error | Meaning | Retryable? |
|---|---|---|
| `BadInputsUTxO` | A chosen UTXO was already spent | No: rebuild with fresh UTXOs |
| `OutsideValidityIntervalUTxO` | The transaction expired | No: rebuild with a new validity window |
| `ValueNotConservedUTxO` | Inputs ≠ outputs + fee | No: fix the transaction |
| `FeeTooSmallUTxO` | Fee too low | No: rebuild |
| Network timeout | Provider unreachable | Yes: retry after a delay |

`BadInputsUTxO` from indexer lag is the classic one. Handle it with the [retry-safe pattern](/docs/developers/curriculum/start-building/transaction-building#resilient-submission-retry-safe), which re-reads chain state on every attempt.

## Other SDKs and the CLI

The examples above use Evolution. The same reads are available from Mesh and directly from a running node:

<Tabs groupId="sdk">
<TabItem value="mesh" label="Mesh">

Queries go through the provider object you create (e.g. `new BlockfrostProvider(key)`): `fetchAddressUTxOs`, `fetchProtocolParameters`, `fetchUTxOs`, and friends. See the [Mesh providers reference](https://meshjs.dev/providers).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

A running node answers the same queries directly: `cardano-cli query utxo --address <addr>`, `cardano-cli query protocol-parameters`, `cardano-cli query tip`, and `cardano-cli query stake-address-info`. See the [cardano-cli reference](/docs/developers/curriculum/start-building/transaction-building#building-with-cardano-cli).

</TabItem>
</Tabs>

## Next steps

- [Transaction building](/docs/developers/curriculum/start-building/transaction-building), use what you query to build and submit
- [Connect a wallet](/docs/developers/curriculum/dapps/connect-a-wallet), read a user's UTXOs and address in the browser
- [Production infrastructure](/docs/developers/curriculum/production/infrastructure), run your own provider stack at scale
