---
id: 01-hello-world
title: Hello World
sidebar_label: 01 - Hello World
description: Install Mesh SDK and learn how to send assets using the Mesh wallet.
---

Welcome to the first lesson of the Cardano Application Development Course! In this session, you'll set up the [Mesh SDK](https://meshjs.dev/) and learn how to create a wallet using `MeshWallet` and send assets using `MeshTxBuilder`.

## System setup

Before we begin, let's prepare our system for development. We will be using Node.js and TypeScript for this course, so make sure you have them installed on your machine.

### Create a package.json file

First, create a new `package.json` file in the root of your project with the following content:

```json
{
  "type": "module",
  "dependencies": {},
  "scripts": {}
}
```

### Install the necessary packages

Open your terminal and run these commands to install the required packages and MeshSDK:

```bash
npm install
npm install tsx @meshsdk/core
```

Here's how your `package.json` file should look after installing the packages:

```json
{
  "type": "module",
  "dependencies": {
    "@meshsdk/core": "^1.9.0",
    "tsx": "^4.19.4"
  },
  "scripts": {}
}
```

- `@meshsdk/core`: Core functionality for network interactions, wallets, and transactions.
- `tsx`: Allows running TypeScript files directly from the command line.

## Create a wallet

We will use [`MeshWallet`](https://meshjs.dev/apis/wallets/meshwallet). This class provides methods to create a new wallet, generate mnemonic phrases, and get the wallet address.

### Generate mnemonic phrases

To create a new wallet, we need to generate a mnemonic phrase. A mnemonic phrase is a set of words that can be used to recover your wallet. It is important to keep your mnemonic phrase safe and secure, as it can be used to access your funds.

To create a new wallet mnemonic, do the following:

```ts
import { MeshWallet } from "@meshsdk/core";

// Generate new mnemonic phrases for your wallet
const mnemonic = MeshWallet.brew();
console.log("Your mnemonic phrases are:", mnemonic);
```

- Use the `brew` method to generate a new mnemonic phrase.

### Initialize the wallet and get the wallet address

Now that we have generated a mnemonic phrase, we can initialize the wallet with it. The `MeshWallet` class provides a method to create a new wallet using the mnemonic phrase.

```ts
// Initialize the wallet with a mnemonic key
const wallet = new MeshWallet({
  networkId: 0, // preprod testnet
  key: {
    type: "mnemonic",
    words: mnemonic as string[],
  },
});

// Get the wallet address
const address = await wallet.getChangeAddress();
console.log("Your wallet address is:", address);
```

- `networkId`: Specify the network, 0 for preprod testnet.
- `key`: Specify the key type and mnemonic phrases.
- `getChangeAddress`: Method to get the wallet address.

### Run the code

Here is the source code. Create a new file `mnemonic.ts` and copy the code into it:

```ts
import { MeshWallet } from "@meshsdk/core";

// Generate new mnemonic phrases for your wallet
const mnemonic = MeshWallet.brew();
console.log("Your mnemonic phrases are:", mnemonic);

// Initialize the wallet with a mnemonic key
const wallet = new MeshWallet({
  networkId: 0, // preprod testnet
  key: {
    type: "mnemonic",
    words: mnemonic as string[],
  },
});

// Get the wallet address
const address = await wallet.getChangeAddress();
console.log("Your wallet address is:", address);
```

Update the `package.json` file to add a script to run the code:

```json
{
  "type": "module",
  "dependencies": {
    "@meshsdk/core": "^1.9.0",
    "tsx": "^4.19.4"
  },
  "scripts": {
    "mnemonic": "tsx mnemonic.ts"
  }
}
```

Run the script:

```bash
npm run mnemonic
```

This will generate a new mnemonic phrase and wallet address for you. The output will look something like this:

```bash
> mnemonic
> tsx mnemonic.ts

Your mnemonic phrases are: [
  'access',  'spawn',   'taxi',
  'prefer',  'fortune', 'sword',
  'nerve',   'price',   'valid',
  'panther', 'sure',    'hello',
  'layer',   'try',     'grace',
  'seven',   'fossil',  'voice',
  'tobacco', 'circle',  'measure',
  'solar',   'pride',   'together'
]
Your wallet address is: addr_test1qptwuv6dl863u3k93mjrg0hgs0ahl08lfhsudxrwshcsx59cjxatme29s6cl7drjceknunry049shu9eudnsjvwqq9qsuem66d
```

## Send lovelace

Now that we have a wallet and some lovelace, let's learn how to send lovelace using the Mesh SDK. We will use the `MeshTxBuilder` class to create a transaction and send it to the network.

### Get lovelace from faucet

To get some lovelace for testing, you can use the [Cardano Preprod Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet). Paste your wallet address and click on the "Request funds" button. You should receive some lovelace in your wallet shortly.

### Get Blockfrost API key

In order to create transactions, we need to use APIs to get UTXOs from the network. For this, we will use Blockfrost to get UTXOs and submit transactions. Sign up for a free account and get your  [Blockfrost API key](https://blockfrost.io/).

You should get the preprod API key, which starts with `preprod`. You can find the API key in the "Projects" section of your Blockfrost account.

### Get wallet information

Now, let's get the wallet information using the `MeshWallet` class.

```ts
// Get wallet data needed for the transaction
const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();
```

- `getUtxos`: Method to get the UTXOs from the wallet.
- `getChangeAddress`: Method to get the change address.

### Create a transaction to send lovelace

Now, we will create a transaction to send lovelace using the [`MeshTxBuilder`](https://meshjs.dev/apis/txbuilder) class.

```ts
// Create the transaction
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true, // optional, prints the transaction body
});

const unsignedTx = await txBuilder
  .txOut(
    "addr_test1qpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0uafhxhu32dys6pvn6wlw8dav6cmp4pmtv7cc3yel9uu0nq93swx9",
    [{ unit: "lovelace", quantity: "1500000" }]
  )
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();
```

- `txOut`: Add the recipient address and amount.
- `changeAddress`: Set the change address.
- `selectUtxosFrom`: Provide wallet UTXOs into the transaction as inputs.
- `complete`: Create the transaction.

### Sign and submit the transaction

Now that we have created the transaction, we need to sign it and submit it to the network.

```ts
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
console.log("Transaction hash:", txHash);
```

- `signTx`: Method to sign the transaction, which will return the signed transaction.
- `submitTx`: Method to submit the transaction to the network.

### Run the code

Here is the source code. Create a new file `send-lovelace.ts` and copy the code into it:

```ts
import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from "@meshsdk/core";

// Set up the blockchain provider with your key
const provider = new BlockfrostProvider("YOUR_KEY_HERE");

// Initialize the wallet with a mnemonic key
const wallet = new MeshWallet({
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  key: {
    type: "mnemonic",
    words: ["your", "mnemonic", "...", "here"],
  },
});

// Get wallet data needed for the transaction
const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

// Create the transaction
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true, // optional, prints the transaction body
});

const unsignedTx = await txBuilder
  .txOut(
    "addr_test1qpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0uafhxhu32dys6pvn6wlw8dav6cmp4pmtv7cc3yel9uu0nq93swx9",
    [{ unit: "lovelace", quantity: "1500000" }]
  )
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
console.log("Transaction hash:", txHash);
```

Update the `package.json` file to add a script to run the code:

```json
{
  "type": "module",
  "dependencies": {
    "@meshsdk/core": "^1.9.0",
    "tsx": "^4.19.4"
  },
  "scripts": {
    "mnemonic": "tsx mnemonic.ts",
    "send-lovelace": "tsx send-lovelace.ts"
  }
}
```

Run the script:

```bash
npm run send-lovelace
```

This will create a transaction to send lovelace to the recipient address and submit it to the network. The output will look something like this:

```bash
> send-lovelace
> tsx send-lovelace.ts

txBodyJson - before coin selection {"inputs":[],"outputs":[{"address":"addr_test1qpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0uafhxhu32dys6pvn6wlw8dav6cmp4pmtv7cc3yel9uu0nq93swx9","amount":[{"unit":"lovelace","quantity":"1500000"}]}],"fee":"0","collaterals":[],"requiredSignatures":[],"referenceInputs":[],"mints":[],"changeAddress":"addr_test1qp2k7wnshzngpqw0xmy33hvexw4aeg60yr79x3yeeqt3s2uvldqg2n2p8y4kyjm8sqfyg0tpq9042atz0fr8c3grjmysdp6yv3","metadata":{},"validityRange":{},"certificates":[],"withdrawals":[],"votes":[],"signingKey":[],"chainedTxs":[],"inputsForEvaluation":{},"network":"mainnet","expectedNumberKeyWitnesses":0,"expectedByronAddressWitnesses":[]}
txBodyJson - after coin selection {"inputs":[{"type":"PubKey","txIn":{"txHash":"99d859b305ab8021e497fad0dc55373e50fffd3e7026142fa3cf5accfe0d3aab","txIndex":1,"amount":[{"unit":"lovelace","quantity":"9823719"}],"address":"addr_test1qp2k7wnshzngpqw0xmy33hvexw4aeg60yr79x3yeeqt3s2uvldqg2n2p8y4kyjm8sqfyg0tpq9042atz0fr8c3grjmysdp6yv3"}}],"outputs":[{"address":"addr_test1qpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0uafhxhu32dys6pvn6wlw8dav6cmp4pmtv7cc3yel9uu0nq93swx9","amount":[{"unit":"lovelace","quantity":"1500000"}]},{"address":"addr_test1qp2k7wnshzngpqw0xmy33hvexw4aeg60yr79x3yeeqt3s2uvldqg2n2p8y4kyjm8sqfyg0tpq9042atz0fr8c3grjmysdp6yv3","amount":[{"unit":"lovelace","quantity":"8153730"}]}],"fee":"169989","collaterals":[],"requiredSignatures":[],"referenceInputs":[],"mints":[],"changeAddress":"addr_test1qp2k7wnshzngpqw0xmy33hvexw4aeg60yr79x3yeeqt3s2uvldqg2n2p8y4kyjm8sqfyg0tpq9042atz0fr8c3grjmysdp6yv3","metadata":{},"validityRange":{},"certificates":[],"withdrawals":[],"votes":[],"signingKey":[],"chainedTxs":[],"inputsForEvaluation":{"99d859b305ab8021e497fad0dc55373e50fffd3e7026142fa3cf5accfe0d3aab1":{"input":{"outputIndex":1,"txHash":"99d859b305ab8021e497fad0dc55373e50fffd3e7026142fa3cf5accfe0d3aab"},"output":{"address":"addr_test1qp2k7wnshzngpqw0xmy33hvexw4aeg60yr79x3yeeqt3s2uvldqg2n2p8y4kyjm8sqfyg0tpq9042atz0fr8c3grjmysdp6yv3","amount":[{"unit":"lovelace","quantity":"9823719"}]}}},"network":"mainnet","expectedNumberKeyWitnesses":0,"expectedByronAddressWitnesses":[]}
Transaction hash: 62a825c607e4ca5766325c2fccd7ee98313ff81b7e8a4af67eac421b0f0866ff
```

You should see the transaction hash in the output.

Note, in the `MeshTxBuilder` class, we have set `verbose: true`, which will print the transaction body before and after coin selection. This is useful for debugging and understanding how the transaction is built.

## Source code

The source code for this lesson is available on [GitHub](https://github.com/cardanobuilders/cardanobuilders.github.io/tree/main/codes/course-hello-cardano/01-wallet-send-lovelace).

### Educational

You can find a youtube video of an initial walkthrough/workshop [here](https://www.youtube.com/watch?v=Spz8iAggFns).