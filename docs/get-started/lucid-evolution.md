---
id: lucid-evolution
title: Get Started with Lucid Evolution
sidebar_label: Lucid Evolution
description: Get Started with Lucid Evolution
---

Lucid Evolution is a highly scalable, production-ready transaction builder & off-chain framework for users and dApps.

## Installation

To install `lucid-evolution` you can use `pnpm` (or another package manager) and run the following in you root project:

#### Add `lucid-evolution` as dependency

```sh
pnpm i @lucid-evolution/lucid 
```

#### Get `lucid-evolution` from source

First clone the git repository

```sh
git clone https://github.com/Anastasia-Labs/lucid-evolution.git
cd lucid-evolution
pnpm install
```

## Instantiate Lucid Evolution

Lucid Evolution can be used with or without a blockchain provider, which allows you to query data and submit transactions.

Evolution supports the `Mainnet`, `Preprod`, `Preview` and `Custom` networks

### Provider selection

There are multiple builtin providers you can choose from in Lucid Evolution not limited to:

#### Blockfrost

```typescript
import { Lucid, Blockfrost } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<projectId>"),
  "Preprod"
);
```

#### Kupmios

```typescript
import { Lucid, Kupmios } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Kupmios(
    "http://localhost:1442", // Kupo endpoint
    "http://localhost:1337" // Ogmios endpoint (Note: changed from ws:// to http:// in a release 1 month ago)
  ),
  "Preview"
);
```

Kupmios is a mix of [Ogmios](https://ogmios.dev/) and [Kupo](https://cardanosolutions.github.io/kupo/).

#### Maestro

```typescript
import { Lucid, Maestro } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Maestro({
    network: "Preprod", // For MAINNET: "Mainnet"
    apiKey: "<Your-API-Key>", // Get yours by visiting https://docs.gomaestro.org/docs/Getting-started/Sign-up-login
    turboSubmit: false, // Read about paid turbo transaction submission feature at https://docs.gomaestro.org/docs/Dapp%20Platform/Turbo%20Transaction
  }),
  "Preprod" // For MAINNET: "Mainnet"
);
```

#### Koios

```typescript
import { Lucid, Koios } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Koios("https://preprod.koios.rest/api/v1"),
  "Preprod"
);
```

### Query Provider

The `provider` in `lucid.provider` is the provider instance you passed to `Lucid()` when selecting your provider (Blockfrost, Kupmios, Maestro, Koios, etc.).

#### Query UTxOs

#### Using Provider

```typescript
const utxos = await lucid.provider.getUtxos("addr_test...");
```

#### Using Convenience Method

```typescript
const utxos = await lucid.utxosAt("addr_test...");
```

This convenience method internally uses `lucid.provider.getUtxos()`.

#### Query Datums

##### Using Provider

```typescript
const datum = await lucid.provider.getDatum("<datum_hash>");
```

##### Using Convenience Method

```typescript
const datum = await lucid.datumOf("<datum_hash>");
```

##### Querying datum from a UTxO

```typescript
const [scriptUtxo] = await lucid.utxosAt("addr_test...");
const datum = await lucid.datumOf(scriptUtxo);
```


#### Query Protocol Parameters

##### Using the provider directly:

```typescript
const protocolParameters = await lucid.provider.getProtocolParameters();
```

## Create a wallet

You are provided multiple options to create and import a wallet

### Private Key
    Generate a new private key:

    ```typescript
    const privateKey = generatePrivateKey(); // Bech32 encoded private key
    console.log(privateKey);
    ```

### Seed Phrase

Generate a new seed phrase (mnemonic):

    ```typescript
    const seedPhrase = generateSeedPhrase(); // BIP-39
    console.log(seedPhrase);
    ```

## Choosing Wallet

Use different methods to select a wallet and query balances, UTxOs


### Private Key

    Select a wallet using a private key:

    ```typescript
    lucid.selectWallet.fromPrivateKey(privateKey);
    ```

### Address & UTXOs

This method is useful when you have the address and UTXOs of a wallet but not necessarily the private key.
    ```typescript
    const address = "addr_test..."; // Your wallet address
    const utxos = await lucid.utxosAt(address);
    lucid.selectWallet.fromAddress(address, utxos);
    ```

### Seed Phrase

    Select a wallet using a seed phrase (mnemonic):

    ```typescript
    const seedPhrase = "your seed phrase here...";
    lucid.selectWallet.fromSeed(seedPhrase);
    ```


If you're integrating with a wallet provider that exposes an API conforming to the WalletApi interface:

    ```typescript
    // `externalWalletApi` is your wallet provider's API
    const walletApi: WalletApi = externalWalletApi;
    lucid.selectWallet.fromAPI(walletApi);
    ```

## More examples

You now have all you need to start playing with Lucid Evolution. Have a look at [our docs](https://anastasia-labs.github.io/lucid-evolution/documentation/core-concepts/instantiate-evolution) for more examples. 
