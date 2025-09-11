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

[Browser Wallet](https://meshjs.dev/apis/wallets/browserwallet) is used for connecting, querying, and performing wallet functions in accordance with [CIP-30](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030), which defines the API for dApps to communicate with the user's wallet.

Using Browser Wallet is simple: import `BrowserWallet` and call the APIs, for example:

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
| [Get Available Wallets](https://meshjs.dev/apis/wallets/browserwallet#get-available-wallets) | ```BrowserWallet.getAvailableWallets();``` |
| [Connect Wallet](https://meshjs.dev/apis/wallets/browserwallet#connect-wallet) | ```const wallet = await BrowserWallet.enable('eternl');``` |
| [Get Balance](https://meshjs.dev/apis/wallets/browserwallet#get-balance) | ```const balance = await wallet.getBalance();``` |
| [Get Change Address](https://meshjs.dev/apis/wallets/browserwallet#get-change-address) | ```const changeAddress = await wallet.getChangeAddress();``` |
| [Get Network ID](https://meshjs.dev/apis/wallets/browserwallet#get-network-id) | ```const networkId = await wallet.getNetworkId();``` |
| [Get Reward Addresses](https://meshjs.dev/apis/wallets/browserwallet#get-reward-addresses) | ```const rewardAddresses = await wallet.getRewardAddresses();``` |
| [Get Used Addresses](https://meshjs.dev/apis/wallets/browserwallet#get-used-addresses) | ```const usedAddresses = await wallet.getUsedAddresses();``` |
| [Get Unused Addresses](https://meshjs.dev/apis/wallets/browserwallet#get-unused-addresses) | ```const unusedAddresses = await wallet.getUnusedAddresses();``` |
| [Get UTXOs](https://meshjs.dev/apis/wallets/browserwallet#get-utxos) | ```const utxos = await wallet.getUtxos();``` |
| [Sign Data](https://meshjs.dev/apis/wallets/browserwallet#sign-data) | ```const signature = await wallet.signData('mesh');``` |
| [Sign Transaction](https://meshjs.dev/apis/wallets/browserwallet#sign-transaction) | ```const signedTx = await wallet.signTx(tx, partialSign?);``` |
| [Submit Transaction](https://meshjs.dev/apis/wallets/browserwallet#submit-transaction) | ```const txHash = await wallet.submitTx(signedTx);``` |
| [Get Lovelace](https://meshjs.dev/apis/wallets/browserwallet#get-lovelace) | ```const lovelace = await wallet.getLovelace();``` |
| [Get Assets](https://meshjs.dev/apis/wallets/browserwallet#get-assets) | ```const assets = await wallet.getAssets();``` |
| [Get Policy IDs](https://meshjs.dev/apis/wallets/browserwallet#get-policy-ids) | ```const policyIds = await wallet.getPolicyIds();``` |
| [Get a Collection of Assets](https://meshjs.dev/apis/wallets/browserwallet#get-a-collection-of-assets) | ```const assets = await wallet.getPolicyIdAssets('64af2...42');``` |
| [Get Supported Extensions](https://meshjs.dev/apis/wallets/browserwallet#get-supported-extensions) | ```await wallet.getSupportedExtensions('eternl');``` |
| [Get Extensions](https://meshjs.dev/apis/wallets/browserwallet#get-extensions) | ```await wallet.getExtensions();``` |
| [Get DRep ID Key](https://meshjs.dev/apis/wallets/browserwallet#get-drep-id-key) | ```await wallet.getDRep();``` |
| [Get Registered Pub Stake Keys](https://meshjs.dev/apis/wallets/browserwallet#get-registered-pub-stake-keys) | ```await wallet.getRegisteredPubStakeKeys();``` |

Check out the [Mesh Browser Wallet docs](https://meshjs.dev/apis/wallets/browserwallet) for live demos and full explanations.

## Mesh Wallet

[Mesh Wallet](https://meshjs.dev/apis/wallets/meshwallet) is used for building transactions in your applications. You can import Mesh Wallet with:

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

See the [Mesh Wallet docs](https://meshjs.dev/apis/wallets/meshwallet) for live demos and full explanations.
