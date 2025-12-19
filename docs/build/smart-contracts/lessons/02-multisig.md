---
id: 02-multisig.mdx
title: Multi-signature Transactions
sidebar_label: 02 - Multisig Tx
description: Learn to build multi-signature transactions on Cardano.
---

A multi-signature (multi-sig) transaction requires more than one user to sign a transaction before it is broadcast on the blockchain. Think of it like a joint savings account where both parties must approve spending. Multi-sig transactions can include two or more required signers, which can be wallets or scripts.

In this lesson, you'll learn how to:

- Build multi-signature transactions to mint a token.
- Set up a NextJS app with a simple web interface to interact with the Cardano blockchain.

## System setup

### Download CIP30 Wallet Extension

To interact with the blockchain, you'll need a [wallet extension](https://cardano.org/apps/?tags=wallet) that supports the CIP30 standard.

After downloading the wallet, restore it using the seed phrase you created in the previous lesson.

### Set Up NextJS and Mesh

Open your terminal and run the following command to create a new NextJS application:

```bash
npx create-next-app@latest --typescript mesh-multisig
```

Follow the prompts:

```bash
Need to install the following packages:
Ok to proceed? (y)

✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … Yes
✔ Would you like to use App Router? … No
✔ Would you like to use Turbopack for next dev? … No
✔ Would you like to customize the import alias (@/* by default)? … No
```

Navigate to the newly created folder:

```bash
cd mesh-multisig
```

Install the latest version of Mesh:

```bash
npm install @meshsdk/core @meshsdk/react
```

### Add MeshProvider

To use Mesh React, wrap your application with the `MeshProvider` component. Open the `src/app/layout.tsx` file and add:

```ts
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@meshsdk/react/styles.css";
import { MeshProvider } from "@meshsdk/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <Component {...pageProps} />
    </MeshProvider>
  );
}
```

### Add CardanoWallet Component

Add a wallet React component to connect to the wallet and interact with the blockchain. Open the `src/pages/index.tsx` file, delete the existing code, and replace it with:

```ts
import { CardanoWallet, useWallet } from "@meshsdk/react";

export default function Home() {
  const { wallet, connected } = useWallet();
  return (
    <div>
      <CardanoWallet isDark={true} />
    </div>
  );
}
```

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000/) to view your application. Press **CTRL+C** to stop the server.

You should see a "Connect Wallet" component. Try connecting to your wallet.

## Minting Script

In this section, you'll create a minting script to mint a token using a multi-signature transaction.

### Define the Minting Script

Set up constants for the minting script:

```ts
const provider = new BlockfrostProvider("YOUR_KEY_HERE");

const demoAssetMetadata = {
  name: "Mesh Token",
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};

const mintingWallet = ["your", "mnemonic", "...", "here"];
```

- Replace `YOUR_KEY_HERE` with your Blockfrost API key.
- Define asset metadata in `demoAssetMetadata`.
- Use a mnemonic for the minting wallet.

### Create Minting Application Wallet

Create a function to build the minting transaction:

```ts
async function buildMintTx(inputs: UTxO[], changeAddress: string) {
  const wallet = new MeshWallet({
    networkId: 0,
    key: {
      type: "mnemonic",
      words: mintingWallet,
    },
  });

  const { pubKeyHash: keyHash } = deserializeAddress(
    await wallet.getChangeAddress()
  );
}
```

- `inputs`: UTxOs from your wallet to pay minting fees.
- Initialize the wallet with the mnemonic.
- Derive the `pubKeyHash` for the minting script.

### Create Native Script

Define the native script:

```ts
const nativeScript: NativeScript = {
  type: "all",
  scripts: [
    {
      type: "before",
      slot: "99999999",
    },
    {
      type: "sig",
      keyHash: keyHash,
    },
  ],
};
const forgingScript = ForgeScript.fromNativeScript(nativeScript);
```

- `nativeScript`: Parameters for the script.
- `ForgeScript.fromNativeScript`: Create the forging script.

### Define Asset Metadata

Set up asset metadata:

```ts
const policyId = resolveScriptHash(forgingScript);
const tokenName = "MeshToken";
const tokenNameHex = stringToHex(tokenName);
const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };
```

- `policyId`: Derived from the forging script.
- `tokenName`: Name of the token.
- `metadata`: Asset metadata.

### Create Transaction

Build the minting transaction:

```ts
const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});

const unsignedTx = await txBuilder
  .mint("1", policyId, tokenNameHex)
  .mintingScript(forgingScript)
  .metadataValue(721, metadata)
  .changeAddress(changeAddress)
  .invalidHereafter(99999999)
  .selectUtxosFrom(inputs)
  .complete();
```

- `mint`: Add token details.
- `mintingScript`: Attach the minting script.
- `metadataValue`: Add asset metadata.
- `changeAddress`: Specify the change address.
- `invalidHereafter`: Set transaction expiry.
- `selectUtxosFrom`: Use UTxOs for fees.
- `complete`: Finalize the transaction.

### Sign the Transaction

Sign the transaction with the minting wallet:

```ts
const signedTx = await wallet.signTx(unsignedTx);
```

### Source code

Here is the complete code for building the minting transaction:

```ts
async function buildMintTx(inputs: UTxO[], changeAddress: string) {
  // minting wallet
  const wallet = new MeshWallet({
    networkId: 0,
    key: {
      type: "mnemonic",
      words: mintingWallet,
    },
  });

  const { pubKeyHash: keyHash } = deserializeAddress(
    await wallet.getChangeAddress()
  );

  // create minting script
  const nativeScript: NativeScript = {
    type: "all",
    scripts: [
      {
        type: "before",
        slot: "99999999",
      },
      {
        type: "sig",
        keyHash: keyHash,
      },
    ],
  };
  const forgingScript = ForgeScript.fromNativeScript(nativeScript);

  // create metadata
  const policyId = resolveScriptHash(forgingScript);
  const tokenName = "MeshToken";
  const tokenNameHex = stringToHex(tokenName);
  const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

  // create transaction
  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
    verbose: true,
  });

  const unsignedTx = await txBuilder
    .mint("1", policyId, tokenNameHex)
    .mintingScript(forgingScript)
    .metadataValue(721, metadata)
    .changeAddress(changeAddress)
    .invalidHereafter(99999999)
    .selectUtxosFrom(inputs)
    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  return signedTx;
}
```

## Execute the transaction

Now that we have the minting transaction, we can execute it.

```ts
async function mint() {
  if (connected) {
    const inputs = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();

    const tx = await buildMintTx(inputs, changeAddress);
    const signedTx = await wallet.signTx(tx);

    const txHash = await wallet.submitTx(signedTx);
    console.log("Transaction hash:", txHash);
  }
}
```

- Check wallet connection.
- Get UTxOs and change address.
- Build, sign, and submit the transaction.

## Source code

The source code for this lesson is available on [GitHub](https://github.com/cardanobuilders/cardanobuilders.github.io/tree/main/codes/course-hello-cardano/02-multisig).

## Challenge

Create a multi-signature wallet requiring 2 out of 3 signers to approve a transaction. Build and sign a transaction with two signers, submit it, and verify success.
