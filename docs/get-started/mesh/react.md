---
id: react
sidebar_position: 8
title: React Web App - Mesh SDK (Open-Source Library for Building Web3 Apps on the Cardano Blockchain)
sidebar_label: React Web App
description: Start building web3 applications, interact with your contracts using your wallets.
image: ../img/og/og-getstarted-mesh.png
---

Mesh provide a collection of useful UI components, so you can easily include web3 functionality and convenient utilities for your application.

- [MeshProvider](#meshprovider) - Subscribe to wallet changes
- [UI Components](#ui-components) - React frontend components to speed up your app development.
- [Wallet Hooks](#wallet-hooks) - React hooks for interacting with connected wallet

To start, install `mesh-react`:

```bash
npm install @meshsdk/react
```

Next, let's add `MeshProvider` to the root of the application. [React Context](https://reactjs.org/docs/context.html) allows apps to share data across the app, and MeshProvider allows your app to subscribe to context changes.

```javascript
import { MeshProvider } from "@meshsdk/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <Component {...pageProps} />
    </MeshProvider>
  );
};
```

## UI Components

In order for dApps to communicate with the user's wallet, we need a way to connect to their wallet.

Add this CardanoWallet to allow the user to select a wallet to connect to your dApp. After the wallet is connected, see Browser Wallet for a list of CIP-30 APIs.

```javascript
import { CardanoWallet } from '@meshsdk/react';

export default function Page() {
  return (
    <>
      <CardanoWallet />
    </>
  );
}
```

Browse all [UI Components](https://meshjs.dev/react/ui-components) provided by Mesh to start building web3 applications, interact with your contracts using your wallets.

## Wallet Hooks

In a React application, Hooks allows you to extract and reuse stateful logic and variables without changing your component hierarchy. This makes it easy to reuse the same Hook among many components. You can try each of these hooks on [Mesh Playground](https://meshjs.dev/react/wallet-hooks).

### useWalletList

Returns a list of wallets installed on user's device.

```javascript
import { useWalletList } from '@meshsdk/react';

export default function Page() {
  const wallets = useWalletList();

  return (
    <>
      {wallets.map((wallet, i) => {
        return (
          <p key={i}>
            <img src={wallet.icon} style={{ width: '48px' }} />
            <b>{wallet.name}</b>
          </p>
        );
      })}
    </>
  );
}
```

### useAddress

Return address of connected wallet.

```javascript
import { useAddress } from '@meshsdk/react';

export default function Page() {
  const address = useAddress();

  return (
    <div><p>Your wallet address is: <code>{address}</code></p></div>
  );
}
```

### useAssets

Return a list of assets in connected wallet from all UTXOs.

```javascript
import { useAssets } from '@meshsdk/react';

export default function Page() {
  const assets = useAssets();

  return (
    <ol>
      {assets &&
        assets.slice(0, 10).map((asset, i) => {
          return (
            <li key={i}>
              <b>{asset.assetName}</b> (x{asset.quantity})
            </li>
          );
        })}
    </ol>
  );
}
```

### useLovelace

Return amount of lovelace in wallet.

```javascript
import { useLovelace } from '@meshsdk/react';

export default function Page() {
  const lovelace = useLovelace();

  return (
    <div>
      <p>You have <b>₳ {parseInt(lovelace) / 1000000}</b>.</p>
    </div>
  );
}
```

### useNetwork

Return the network of connected wallet.

```javascript
import { useNetwork } from '@meshsdk/react';

export default function Page() {
  const network = useNetwork();

  return (
    <div>
      <p>Connected network: <b>{network}</b>.</p>
    </div>
  );
}
```

### useWallet

Provide information on the current wallet's state, and functions for connecting and disconnecting user wallet.

```javascript
import { useWallet } from '@meshsdk/react';

export default function Page() {
  const { wallet, connected, name, connecting, connect, disconnect, error } = useWallet();

  return (
    <div>
      <p>
        <b>Connected?: </b> {connected ? 'Is connected' : 'Not connected'}
      </p>
      <p>
        <b>Connecting wallet?: </b> {connecting ? 'Connecting...' : 'No'}
      </p>
      <p>
        <b>Name of connected wallet: </b>
        {name}
      </p>
      <button onClick={() => disconnect()}>Disconnect Wallet</button>
    </div>
  );
}
```

Check out the [Mesh Playground](https://meshjs.dev/react/wallet-hooks) for live demo and full explanation.
