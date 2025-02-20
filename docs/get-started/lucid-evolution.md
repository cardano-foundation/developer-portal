---
id: lucid-evolution
title: Get Started with Lucid Evolution
sidebar_label: Lucid Evolution
description: Get Started with Lucid Evolution
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Lucid Evolution is a highly scalable, production-ready transaction builder & off-chain framework for users and DApps. It provides a TypeScript library for building transactions and designing off-chain code.

## Quick Start

To install `lucid-evolution` you can use `pnpm` (or another package manager):

<Tabs
defaultValue="pnpm"
values={[
{label: 'pnpm', value: 'pnpm'},
{label: 'npm', value: 'npm'},
{label: 'yarn', value: 'yarn'},
{label: 'bun', value: 'bun'},
]}>
<TabItem value="pnpm">

```bash
pnpm i @lucid-evolution/lucid
```

</TabItem>
<TabItem value="npm">

```bash
npm i @lucid-evolution/lucid
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add @lucid-evolution/lucid
```

</TabItem>
<TabItem value="bun">

```bash
bun i @lucid-evolution/lucid
```

</TabItem>
</Tabs>

:::note

Installing the lucid package will automatically export all other Lucid Evolution packages as well. For more information on the other packages, please refer to the [lucid-evolution documentation](https://anastasia-labs.github.io/lucid-evolution/install).

:::

## Instantiate Lucid Evolution

Lucid Evolution can be used with or without a blockchain provider, which allows you to query data and submit transactions. Evolution library supports the `Mainnet`, `Preprod`, `Preview` and `Custom` networks.

### Provider Selection

<Tabs
defaultValue="blockfrost"
values={[
{label: 'Blockfrost', value: 'blockfrost'},
{label: 'Kupmios', value: 'kupmios'},
{label: 'Maestro', value: 'maestro'},
{label: 'Koios', value: 'koios'},
]}>
<TabItem value="blockfrost">

```typescript
import { Lucid, Blockfrost } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<projectId>"),
  "Preprod"
);
```

</TabItem>
<TabItem value="kupmios">

```typescript
import { Lucid, Kupmios } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Kupmios(
    "http://localhost:1442", // Kupo endpoint
    "http://localhost:1337" // Ogmios endpoint
  ),
  "Preview"
);
```

**or with API Keys**

```typescript
const lucid = await Lucid(
  new Kupmios("http://localhost:1442", "http://localhost:1337", {
    kupoHeader: { "priv-api-key": "<kupo-api-key>" }, // for example: "dmtr-api-key": "<kupo-api-key>"
    ogmiosHeader: { "priv-api-key": "<ogmios-api-key>" },
  }),
  "Preview"
);
```

:::note

Kupmios is a mix of [Ogmios](https://ogmios.dev/) and [Kupo](https://cardanosolutions.github.io/kupo/).

:::

</TabItem>
<TabItem value="maestro">

```typescript
import { Lucid, Maestro } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Maestro({
    network: "Preprod", // For MAINNET: "Mainnet" (1)
    apiKey: "<Your-API-Key>", // Get yours by visiting https://docs.gomaestro.org/docs/Getting-started/Sign-up-login
    turboSubmit: false, // Read about paid turbo transaction submission feature at https://docs.gomaestro.org/docs/Dapp%20Platform/Turbo%20Transaction
  }),
  "Preprod" // For MAINNET: "Mainnet" (2)
);
```

</TabItem>
<TabItem value="koios">

```typescript
import { Lucid, Koios } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Koios("https://preprod.koios.rest/api/v1"),
  "Preprod"
);
```

**or with a bearer token**

```typescript
const lucid = await Lucid(
  new Koios("<koios-api-url>", "<koios-bearer-token>"),
  "Preprod"
);
```

</TabItem>
</Tabs>

### Query Provider

By querying the provider you are essentially asking "what's on the blockchain?", this way you can query any on-chain data.

The provider in `lucid.provider` is the provider instance you passed to `Lucid()` when selecting your provider (Blockfrost, Kupmios, Maestro, Koios, etc.).

<Tabs
defaultValue="utxos"
values={[
{label: 'UTxOs', value: 'utxos'},
{label: 'Datums', value: 'datums'},
{label: 'Protocol Parameters', value: 'protocol-parameters'},
]}>
<TabItem value="utxos">

UTxOs (Unspent Transaction Outputs) are the fundamental building blocks in Cardano's eUTxO model. One of its differentiators from account-based models is that your wallet balance is the sum of all UTxOs at your address.

**Using provider**

```typescript
const utxos = await lucid.provider.getUtxos("addr_test...");
```

**or using convenience method**

```typescript
const utxos = await lucid.utxosAt("addr_test...");
```

:::note

This convenience method internally uses `lucid.provider.getUtxos()`.

:::

</TabItem>
<TabItem value="datums">

In Cardano, datums are pieces of data attached to UTxOs. Let's get some terminology out of the way.

- _Inline datums_: When the complete datum is stored directly in the UTxO
- _Datum hashes_: When only a hash of the datum is stored on-chain

**Using Provider**

```typescript
const datum = await lucid.provider.getDatum("<datum_hash>");
```

**or using convenience method**

```typescript
const datum = await lucid.datumOf("<datum_hash>");
```

**or querying a datum from a scriptUTxO**

```typescript
const [scriptUtxo] = await lucid.utxosAt("addr_test...");
const datum = await lucid.datumOf(scriptUtxo);
```

:::note

`lucid.datumOf(utxo)` is a convenience method that handles both inline datums and datum hashes:

1. For UTxOs with inline datums → returns the datum directly
2. For UTxOs with datum hashes → fetches the full datum using `provider.getDatum()`

Once fetched, the datum is cached in the UTxO object for subsequent queries, avoiding additional network requests.

:::

</TabItem>
<TabItem value="protocol-parameters">

Protocol parameters define the rules and constraints of the Cardano network, such as transaction fees, maximum block size, maximum transaction size, Plutus execution costs, and the minimum UTxO ada value.

**Using the provider directly:**

```typescript
const protocolParameters = await lucid.provider.getProtocolParameters();
```

</TabItem>
</Tabs>

---

## Create a wallet

You are provided multiple options to create and import a wallet

<Tabs
defaultValue="private-key"
values={[
{label: 'Private Key', value: 'private-key'},
{label: 'Seed Phrase', value: 'seed-phrase'},
]}>
<TabItem value="private-key">

Generate a new private key:

```typescript
const privateKey = generatePrivateKey(); // Bech32 encoded private key
console.log(privateKey);
```

</TabItem>
<TabItem value="seed-phrase">

Generate a new seed phrase (mnemonic):

```typescript
const seedPhrase = generateSeedPhrase(); // BIP-39
console.log(seedPhrase);
```

</TabItem>
</Tabs>

---

## Choosing Wallet

Use any suitable method to select a wallet and interact with the blockchain through it

<Tabs
defaultValue="private-key"
values={[
{label: 'Private Key', value: 'private-key'},
{label: 'Seed Phrase', value: 'seed-phrase'},
{label: 'Wallet API', value: 'wallet-api'},
{label: 'Address-only', value: 'address-only'},
]}>
<TabItem value="private-key">

Select a wallet using a private key:

```typescript
lucid.selectWallet.fromPrivateKey(privateKey);
```

</TabItem>
<TabItem value="seed-phrase">

Select a wallet using a seed phrase (mnemonic):

```typescript
const seedPhrase = "your seed phrase here...";
lucid.selectWallet.fromSeed(seedPhrase);
```

</TabItem>
<TabItem value="wallet-api">

If you're integrating with a wallet provider that exposes an API conforming to the `WalletApi` interface. This works for any [CIP-30](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030) compliant wallet.

```typescript
// `externalWalletApi` is your wallet provider's API
const walletApi: WalletApi = externalWalletApi;
lucid.selectWallet.fromAPI(walletApi);
```

</TabItem>
<TabItem value="address-only">

This method will create a limited wallet that can still query the address and its UTxOs. You can use it to build transactions that **others will sign**, as it cannot sign transactions (no private key).

```typescript
const address = "addr_test...";
const utxos = await lucid.utxosAt(address);
lucid.selectWallet.fromAddress(address, utxos);
```

:::warning

Transactions built with an address-only wallet will need to be signed by a wallet with the actual private keys before they can be submitted.

:::

</TabItem>
</Tabs>

---

## Your first transaction

A couple of fundamentals to remember are that in Cardano's eUTxO model, a transaction can consume one or more UTxOs as inputs, create one or more UTxOs as outputs, and must be balanced (sum of inputs = sum of outputs + fees).

### 1. Build

Let's create a simple transaction where we send `5 ada` to two recipients each:

```typescript
const tx = await lucid
  .newTx()
  .pay.ToAddress("addr_testa...", { lovelace: 5000000n })
  .pay.ToAddress("addr_testb...", { lovelace: 5000000n })
  .complete();
```

:::note
To balance the transaction and initiate coin selection, transactions always
need to end with `.complete()`
:::

### 2. Sign

```typescript
const signedTx = await tx.sign.withWallet().complete();
```

You could also choose to sign the transaction with a private key:

```typescript
const signedTx = await tx.sign.withPrivateKey(privateKey).complete();
```

### 3. Submit

Lastly we submit the transaction:

```typescript
const txHash = await signedTx.submit();
console.log(txHash);
```

:::note

Remember to select a wallet before attempting to build and submit
The wallet selection methods we discussed in the previous section should be implemented before building the transaction.

:::

### Putting everything together

```typescript
import { Lucid, Blockfrost } from "@lucid-evolution/lucid";

// Initialize Lucid with a provider
const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<projectId>"),
  "Preprod"
);

// Select a wallet for signing
lucid.selectWallet.fromPrivateKey(privateKey);

// Build, sign and submit transaction
const tx = await lucid
  .newTx()
  .pay.ToAddress("addr_testa...", { lovelace: 5000000n }) // Pay 5 ada to addr_testa
  .complete(); // Balances the transaction and initiates coin selection

const signedTx = await tx.sign.withWallet().complete();
const txHash = await signedTx.submit();
console.log(txHash);
```

---

## You want to learn more?

Check out our [docs](https://anastasia-labs.github.io/lucid-evolution/documentation/core-concepts/instantiate-evolution) for more examples.

You now have all you need to start playing with Lucid Evolution. Take a look at [under the hood](https://anastasia-labs.github.io/lucid-evolution/documentation/core-concepts/under-the-hood) to understand how Evolution library works, follow the [deep dive](https://anastasia-labs.github.io/lucid-evolution/documentation/deep-dives/make-payments) series to start building your own off-chain code and take a look at example open-source repositories to use the library in different use cases.

<iframe width="100%" height="600" src="https://www.youtube.com/embed/aCV7XzyMUNw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>
