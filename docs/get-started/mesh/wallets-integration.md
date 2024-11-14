---
id: wallets-integration
sidebar_position: 3
title: Wallets Integration
sidebar_label: Wallets Integration
description: Wallet for building transactions in your applications.
image: /img/og/og-getstarted-mesh.png
---

With Mesh, you can initialize a new wallet with:
- CIP-30 & CIP-95 wallets ([Browser Wallet](#browser-wallet))
- Cardano CLI generated keys ([Mesh Wallet](#mesh-wallet))
- Mnemonic phrases ([Mesh Wallet](#mesh-wallet))
- Private key ([Mesh Wallet](#mesh-wallet))
- Read only ([Mesh Wallet](#mesh-wallet))

## Browser Wallet

[Browser Wallet](https://meshjs.dev/apis/wallets/browserwallet) is use for connecting, queries and performs wallet functions in accordance to [CIP-30](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030), which defines the API for dApps to communicate with the user's wallet.

To use Browser Wallet is simple, just import `BrowserWallet` execute the APIs, for example:

```javascript
// import BrowserWallet
import { BrowserWallet } from '@meshsdk/core';

// connect to a wallet
const wallet = await BrowserWallet.enable('eternl');

// get assets in wallet
const assets = await wallet.getAssets();
```

| APIs | |
|--|--|
| [Get installed wallets](https://meshjs.dev/apis/wallets/browserwallet#getInstallWallets) | ```BrowserWallet.getInstalledWallets();``` |
| [Connect wallet](https://meshjs.dev/apis/wallets/browserwallet#connectWallet) | ```const wallet = await BrowserWallet.enable('eternl');``` |
| [Get balance](https://meshjs.dev/apis/wallets/browserwallet#getBalance) | ```const balance = await wallet.getBalance();``` |
| [Get change address](https://meshjs.dev/apis/wallets/browserwallet#getChangeAddress) | ```const changeAddress = await wallet.getChangeAddress();``` |
| [Get network ID](https://meshjs.dev/apis/wallets/browserwallet#getNetworkId) | ```const networkId = await wallet.getNetworkId();``` |
| [Get reward addresses](https://meshjs.dev/apis/wallets/browserwallet#getRewardAddresses) | ```const rewardAddresses = await wallet.getRewardAddresses();``` |
| [Get used addresses](https://meshjs.dev/apis/wallets/browserwallet#getUsedAddresses) | ```const usedAddresses = await wallet.getUsedAddresses();``` |
| [Get unused addresses](https://meshjs.dev/apis/wallets/browserwallet#getUnusedAddresses) | ```const unusedAddresses = await wallet.getUnusedAddresses();``` |
| [Get UTXOs](https://meshjs.dev/apis/wallets/browserwallet#getUtxos) | ```const utxos = await wallet.getUtxos();``` |
| [Sign data](https://meshjs.dev/apis/wallets/browserwallet#signData) | ```const addresses = await wallet.getUsedAddresses(); const signature = await wallet.signData(addresses[0], 'mesh');``` |
| [Sign transaction](https://meshjs.dev/apis/wallets/browserwallet#signTx) | ```const signedTx = await wallet.signTx(tx, partialSign?);``` |
| [Submit transaction](https://meshjs.dev/apis/wallets/browserwallet#submitTx) | ```const txHash = await wallet.submitTx(signedTx);``` |
| [Get lovelace](https://meshjs.dev/apis/wallets/browserwallet#getLovelace) | ```const lovelace = await wallet.getLovelace();``` |
| [Get assets](https://meshjs.dev/apis/wallets/browserwallet#getAssets) | ```const assets = await wallet.getAssets();``` |
| [Get policy IDs](https://meshjs.dev/apis/wallets/browserwallet#getPolicyIds) | ```const policyIds = await wallet.getPolicyIds();``` |
| [Get collection of assets](https://meshjs.dev/apis/wallets/browserwallet#getPolicyIdAssets) | ```const assets = await wallet.getPolicyIdAssets('64af2...42');``` |
| [Get Supported Extensions](https://meshjs.dev/apis/wallets/browserwallet#getSupportedExtensions) | ```await wallet.getSupportedExtensions('eternl');``` |
| [Get Extensions](https://meshjs.dev/apis/wallets/browserwallet#getExtensions) | ```await wallet.getExtensions();``` |
| [Get DRep ID Key](https://meshjs.dev/apis/wallets/browserwallet#getSupportedExtensions) | ```await wallet.getPubDRepKey();``` |
| [Get Registered Pub Stake Keys](https://meshjs.dev/apis/wallets/browserwallet#getRegisteredpubstakekeys) | ```await wallet.getRegisteredPubStakeKeys();``` |

Definitely do check out the [Mesh Playground](https://meshjs.dev/apis/wallets/browserwallet) for live demo and full explanation.

## Mesh Wallet

[App Wallet](https://meshjs.dev/apis/wallets/meshwallet) is use for building transactions in your applications. You can import App Wallet with:

```javascript
import { MeshWallet } from '@meshsdk/core';
```

### Generate a new wallet

```javascript
import { MeshWallet } from '@meshsdk/core';

const mnemonic = MeshWallet.brew();
```

### Load with Cardano CLI generated keys

```javascript
import { MeshWallet } from '@meshsdk/core';

const wallet = new MeshWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'cli',
    payment: '5820aaca553a7b95b38b5d9b82a5daa7a27ac8e34f3cf27152a978f4576520dd6503',
    stake: '582097c458f19a3111c3b965220b1bef7d548fd75bc140a7f0a4f080e03cce604f0e',
  },
});
```

### Load with mnemonic phrases

```javascript
import { MeshWallet } from '@meshsdk/core';

const wallet = new MeshWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'mnemonic',
    words: ["solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution","solution"],
  },
});
```

### Load with private keys

```javascript
import { MeshWallet } from '@meshsdk/core';

const wallet = new MeshWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'root',
    bech32: 'xprv1cqa46gk29plgkg98upclnjv5t425fcpl4rgf9mq2txdxuga7jfq5shk7np6l55nj00sl3m4syzna3uwgrwppdm0azgy9d8zahyf32s62klfyhe0ayyxkc7x92nv4s77fa0v25tufk9tnv7x6dgexe9kdz5gpeqgu',
  },
});
```

### Read only wallet

```javascript
import { MeshWallet } from '@meshsdk/core';

const wallet = new MeshWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'address',
    address: 'addr_test1qpvx0sacufuypa2k4sngk7q40zc5c4npl337uusdh64kv0uafhxhu32dys6pvn6wlw8dav6cmp4pmtv7cc3yel9uu0nq93swx9',
  },
});
```

Check out the [Mesh Playground](https://meshjs.dev/apis/wallets/meshwallet) for live demo and full explanation.