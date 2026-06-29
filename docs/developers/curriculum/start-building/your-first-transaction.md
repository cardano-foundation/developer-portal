---
id: your-first-transaction
title: Your First Transaction
sidebar_label: Your first transaction
description: Build, sign, and submit your first Cardano transaction on testnet with Evolution, Mesh, or cardano-cli, then read it back from the chain.
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Time to send real value (well, real test value). Every Cardano interaction follows the same three steps: **build** a transaction, **sign** it with your key, and **submit** it to the network. This guide sends ADA on Preprod, then reads it back. Pick your tool below.

## Before you start

- **Test ADA** in a wallet you control ([get it from the faucet](/docs/developers/curriculum/start-building/networks-and-test-ada#get-test-ada))
- **A tool installed** and a **provider key** ([choose your tools](/docs/developers/curriculum/start-building/choose-your-tools)); the SDK tabs use Blockfrost on Preprod
- Optional background: [Transactions](/docs/developers/curriculum/fundamentals/core-concepts/transactions) explains what build/sign/submit is doing under the hood

## Send ADA

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

// Provider (Blockfrost) + wallet (seed phrase) = a signing client
const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

// Build -> sign -> submit
const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1..."),   // recipient
    assets: Assets.fromLovelace(2_000_000n)          // 2 ADA
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
console.log("Transaction submitted:", txHash)
```

The builder selects UTXOs, calculates the fee, and adds a change output for you. `2_000_000n` is 2 ADA (amounts are in lovelace, as a bigint).

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

// Provider + wallet (from your mnemonic)
const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!);

const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
  networkId: 0, // 0 = preprod testnet
  walletAddressType: AddressType.Base,
  fetcher: provider,
  submitter: provider,
  mnemonic: process.env.WALLET_MNEMONIC!.split(" "),
});

// Build -> sign -> submit
const utxos = await wallet.getUtxosMesh();
const changeAddress = await wallet.getChangeAddressBech32();

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .txOut("addr_test1...", [{ unit: "lovelace", quantity: "1500000" }])  // recipient, 1.5 ADA
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx, false);
const txHash = await wallet.submitTx(signedTx);
console.log("Transaction hash:", txHash);
```

`MeshCardanoHeadlessWallet.brew()` generates a fresh mnemonic if you need one. See [Keys & Wallets](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys#working-with-wallets-in-code) for creating wallets in code with either SDK.

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

First point cardano-cli at a running node and generate a key + address (once):

```bash
export CARDANO_NODE_SOCKET_PATH=~/node.socket
export CARDANO_NODE_NETWORK_ID=1   # 1 = preprod, 2 = preview

cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey
cardano-cli address build --payment-verification-key-file payment.vkey --out-file payment.addr
```

Fund `payment.addr` from the [faucet](/docs/developers/curriculum/start-building/networks-and-test-ada#get-test-ada), then build → sign → submit:

```bash
# 1. Find a UTXO to spend
cardano-cli query utxo --address $(< payment.addr)

# 2. Build (automatic fee + change), sign, submit
cardano-cli latest transaction build \
  --tx-in <TxHash>#<TxIx> \
  --tx-out addr_test1...+2000000 \
  --change-address $(< payment.addr) \
  --out-file tx.raw

cardano-cli latest transaction sign \
  --tx-body-file tx.raw --signing-key-file payment.skey --out-file tx.signed

cardano-cli latest transaction submit --tx-file tx.signed
```

For the offline `build-raw` flow with manual fee calculation, and spending from several keys, see [Offline builds](/docs/developers/curriculum/start-building/transaction-building#offline-builds-air-gapped).

</TabItem>
</Tabs>

The transaction hash is your receipt. Paste it into an [explorer](/docs/developers/curriculum/start-building/networks-and-test-ada#block-explorers) to watch it confirm.

## Query the chain

Reading state is the other half of building. Check a balance, list UTXOs, or wait for confirmation:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
// List your wallet's UTXOs and sum the balance
const utxos = await client.getWalletUtxos()
const totalLovelace = utxos.reduce((sum, u) => sum + u.assets.lovelace, 0n)
console.log("Total balance:", totalLovelace, "lovelace")

// Wait for a transaction to confirm (poll every 3s)
const confirmed = await client.awaitTx(txHash, 3000)
console.log("Confirmed:", confirmed)
```

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
// List the wallet's UTXOs
const utxos = await wallet.getUtxosMesh();
console.log(utxos);

// Call back once the transaction is confirmed on-chain
provider.onTxConfirmed(txHash, () => console.log("Confirmed"));
```

`provider.onTxConfirmed(txHash, cb)` polls the provider and fires the callback once the transaction lands; you can also paste the hash into an [explorer](/docs/developers/curriculum/start-building/networks-and-test-ada#block-explorers).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

```bash
cardano-cli query utxo --address $(< payment.addr)
#                            TxHash                                 TxIx        Amount
# --------------------------------------------------------------------------------------
# 262c7891...384fe6d                                                  0        10000000000 lovelace
```

</TabItem>
</Tabs>

## Next steps

- [Mint native tokens and NFTs](/docs/developers/curriculum/native-tokens/overview): your first on-chain asset
- [Smart Contracts](/docs/developers/curriculum/smart-contracts/overview): lock and unlock funds with validators
- Reference: the full [Evolution SDK](https://github.com/IntersectMBO/evolution-sdk) and [Mesh SDK](https://meshjs.dev) docs
