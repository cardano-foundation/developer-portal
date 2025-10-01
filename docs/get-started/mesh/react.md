---
id: react
sidebar_position: 8
title: React Web App
sidebar_label: React Web App
description: Start building web3 applications, interact with your contracts using your wallets.
image: /img/og/og-getstarted-mesh.png
---

Mesh provides a collection of useful UI components and convenient utilities for your web3 application.

In this section, we will cover the following:

- [Mesh Provider](#mesh-provider) - Subscribe to wallet changes
- [UI Components](#ui-components) - React frontend components to speed up your app development.
- [Wallet Hooks](#wallet-hooks) - React hooks for interacting with connected wallet

To start, install `mesh-react` in your React.js project:

```bash
npm install @meshsdk/react
```

## Mesh Provider

Next, let's wrap our app with `MeshProvider`. This component uses 
[React Context](https://reactjs.org/docs/context.html), which in this case allows all its child components to access the shared state of `MeshProvider`.

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

For dApps to communicate with the user's wallet, we need a way to connect to their wallet.

Add `CardanoWallet` to allow users to select a wallet and connect to your dApp. After the wallet is connected,
you can start accessing various methods. See [Browser Wallet](https://meshjs.dev/apis/wallets/browserwallet) for a full list of available CIP-30 APIs.

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

Browse all [UI Components](https://meshjs.dev/react/ui-components) provided by Mesh to start building web3 applications, interact with your contracts, or using browser wallets.

## Wallet Hooks

In a React application, Hooks let you extract and reuse stateful logic without changing your component hierarchy.
This makes it easy to reuse the same Hook among many components. You can see a detailed list of all available hooks on [Mesh Playground](https://meshjs.dev/react/wallet-hooks).

### useWalletList

Returns a list of wallets installed on the user's device.

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

Returns the address of the connected wallet.

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

Returns a list of assets from all UTXOs in the connected wallet.

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

Return the amount of lovelace in the connected wallet.

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

Return the current network of the connected wallet.

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

Provides information on the current wallet's state, and functions for connecting and disconnecting the user's wallet.

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

[Check out this page](https://meshjs.dev/react/wallet-hooks) for a detailed explanation.
