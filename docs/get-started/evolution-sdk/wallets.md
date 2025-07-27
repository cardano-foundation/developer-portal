---
id: wallets
sidebar_position: 2
title: Create & Choose Wallets
sidebar_label: Create & Choose Wallets
description: How to create and choose wallets with Evolution SDK
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Create a wallet

You are provided with multiple options to create and import a wallet:

<Tabs
defaultValue="private-key"
values={[
{label: 'Private Key', value: 'private-key'},
{label: 'Seed Phrase', value: 'seed-phrase'},
]}>
<TabItem value="private-key">

Generate a new private key:

```typescript
import { generatePrivateKey } from "@evolution-sdk/lucid";

const privateKey = generatePrivateKey(); // Bech32 encoded private key
// console.log(privateKey);
```

</TabItem>
<TabItem value="seed-phrase">

Generate a new seed phrase (mnemonic):

```typescript
import { generateSeedPhrase } from "@evolution-sdk/lucid";

const seedPhrase = generateSeedPhrase(); // BIP-39
// console.log(seedPhrase);
```

</TabItem>
</Tabs>

---

## Choosing Wallet

Use any suitable method to select a wallet and interact with the blockchain through it:

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
