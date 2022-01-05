---
id: cardano-wallet-js
title: Get Started with cardano-wallet-js
sidebar_label: cardano-wallet-js
description: Get Started with cardano-wallet-js
image: ./img/og-developer-portal.png
---

## cardano-wallet-js
`cardano-wallet-js` is a javascript/typescript SDK for Cardano with a several functionalities. You can use it as a client for the official [cardano-wallet](https://github.com/input-output-hk/cardano-wallet) and also to create Native Tokens and NFTs. 

## Table of Contents

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
    + [Connecting to a cardano-wallet service](#connecting-to-a-cardano-wallet-service)
    + [Blockchain Information](#blockchain-information)
  * [Useful operations](#useful-operations)
    + [Generate Recovery Phrases](#generate-recovery-phrases)
    + [Create or restore a wallet](#create-or-restore-a-wallet)
    + [Wallet addresses](#wallet-addresses)
    + [Wallet balances](#wallet-balances)
    + [Wallet delegation](#wallet-delegation)
    + [Stake pool operations with the wallet](#stake-pool-operations-with-the-wallet)
    + [Wallet transactions](#wallet-transactions)
    + [Submit external transaction](#submit-external-transaction)
    + [Key handling](#key-handling)
    + [Native Tokens](#native-tokens)
		+ [Send Native Tokens](#send-native-tokens)
- [Test](#test)
- [Support our project](#support-our-project)


## Introduction
The official cardano-wallet by IOHK exposes a REST api/CLI interface which allows
clients to perform common tasks on the cardano-blockchain, such as:
 - creating or restoring a wallet
 - submitting a transaction with or without [metadata](https://github.com/input-output-hk/cardano-wallet/wiki/TxMetadata) 
 - checking on the status of the node
 - listing transactions
 - listing wallets

Our project aims to provide an easy to use Javascript SDK for programmers, instead of
exposing the raw REST structure to you. 
## Requirements
Before start using the library you will need a `cardano-wallet` server running. If you have docker available you can just
download the `docker-composer.yml` they provide and start it using `docker-compose`:

```shell
wget https://raw.githubusercontent.com/input-output-hk/cardano-wallet/master/docker-compose.yml
NETWORK=testnet docker-compose up
```

:::note 
You can find more information about different options to start the cardano-wallet server [here](https://github.com/input-output-hk/cardano-wallet)
:::
## Installation
Using npm:
```shell
npm i cardano-wallet-js
```
## Usage
To begin, start with a `WalletServer`. It allows you to connect to some remote `cardano-wallet` service.

### Connecting to a cardano-wallet service
```js
const { WalletServer } = require('cardano-wallet-js');
let walletServer = WalletServer.init('http://{your-server-host}:{port}/v2');
```   
### Blockchain Information
First you can try is getting some blockchain information like: (network parameters, information and clock)

Get network information
```js
let information = await walletServer.getNetworkInformation();
console.log(information);
```
This will print out something like this:
```json
{
    "network_tip": {
        "time": "2021-04-12T21:59:25Z",
        "epoch_number": 125,
        "absolute_slot_number": 23895549,
        "slot_number": 265149
    },
    "node_era": "mary",
    "node_tip": {
        "height": {
            "quantity": 0,
            "unit": "block"
        },
        "time": "2019-07-24T20:20:16Z",
        "epoch_number": 0,
        "absolute_slot_number": 0,
        "slot_number": 0
    },
    "sync_progress": {
        "status": "syncing",
        "progress": {
            "quantity": 0,
            "unit": "percent"
        }
    },
    "next_epoch": {
        "epoch_start_time": "2021-04-14T20:20:16Z",
        "epoch_number": 126
    }
}
```
Get network parameters
```js
let parameters = await walletServer.getNetworkParameters();
console.log(parameters);
```
This will print out something like this:
```json
{
    "slot_length": {
        "quantity": 1,
        "unit": "second"
    },
    "decentralization_level": {
        "quantity": 100,
        "unit": "percent"
    },
    "genesis_block_hash": "96fceff972c2c06bd3bb5243c39215333be6d56aaf4823073dca31afe5038471",
    "blockchain_start_time": "2019-07-24T20:20:16Z",
    "desired_pool_number": 500,
    "epoch_length": {
        "quantity": 432000,
        "unit": "slot"
    },
    "eras": {
        "shelley": {
            "epoch_start_time": "2020-07-28T20:20:16Z",
            "epoch_number": 74
        },
        "mary": {
            "epoch_start_time": "2021-02-03T20:20:16Z",
            "epoch_number": 112
        },
        "byron": {
            "epoch_start_time": "2019-07-24T20:20:16Z",
            "epoch_number": 0
        },
        "allegra": {
            "epoch_start_time": "2020-12-15T20:20:16Z",
            "epoch_number": 102
        }
    },
    "active_slot_coefficient": {
        "quantity": 5,
        "unit": "percent"
    },
    "security_parameter": {
        "quantity": 2160,
        "unit": "block"
    },
    "minimum_utxo_value": {
        "quantity": 1000000,
        "unit": "lovelace"
    }
}
```
Get network clock
```js
let clock = await walletServer.getNetworkClock();
console.log(clock);
```
This will print out something like this:
```json
{
	"status": "available",
	"offset": {
        "quantity": 405623,
        "unit": "microsecond"
	}
}
```
## Useful operations

### Generate Recovery Phrases
   The recovery phrase generation relies on [bip39](https://github.com/bitcoinjs/bip39).
```js   
const { Seed } = require('cardano-wallet-js');
    
// generate a recovery phrase of 15 words (default)
let recoveryPhrase = Seed.generateRecoveryPhrase();
console.log(recoveryPhrase);

Output:
> "hip dust material keen buddy fresh thank program stool ill regret honey multiply venture imitate"
```

:::important
The recovery phrase is the only way you can restore your wallet and you **SHOULD KEEP IT SECURE AND PRIVATE**. You'll get a completeley different recovery phrase each time you execute the method. 
:::

For convenience, you can convert the recovery phrase into an array using this:
```js
let words = Seed.toMnemonicList(recoveryPhrase);
console.log(words);

Output:
> ['hip', 'dust', 'material', 'keen', 'buddy', 'fresh', 'thank', 'program', 'stool', 'ill', 'regret', 'honey', 'multiply', 'venture', 'imitate']
```

### Create or restore a wallet

In this example we are going to create a new wallet. Have in mind that the method `createOrRestoreShelleyWallet` creates a new wallet if it doesn't exist or restore an existent wallet:
```js
const { Seed, WalletServer } = require('cardano-wallet-js');
    
let walletServer = WalletServer.init('http://you.server.com');
let recoveryPhrase = Seed.generateRecoveryPhrase();
let mnemonic_sentence = Seed.toMnemonicList(recoveryPhrase);
let passphrase = 'tangocrypto';
let name = 'tangocrypto-wallet';
    
let wallet = await walletServer.createOrRestoreShelleyWallet(name, mnemonic_sentence, passphrase);
```    
List wallets:
```js    
let wallets = await walletServer.wallets();
```    
Get wallet by Id:
```js
let wallets = await walletServer.wallets();
let id = wallets[0].id;
let wallet = await walletServer.getShelleyWallet(id);
```
Get wallet's utxo statistics:
```js
let statistics = await wallet.getUtxoStatistics();
```    
Statistics will contain the UTxOs distribution across the whole wallet, in the form of a histogram similar to the one below.
![Utxo Histogram](https://www.tangocrypto.com/images/cardano-wallet-js-utxo-histogram.png)
           
Remove wallet:
```js
await wallet.delete();
```    
Rename wallet:
```js
let newName = 'new-name';
wallet = await wallet.rename(newName);
```
Change wallet passphrase:
```js
let oldPassphrase = 'tangocrypto';
let newPassphrase = 'new-passphrase';
wallet = await wallet.updatePassphrase(oldPassphrase, newPassphrase);
```
:::note 
The wallet itself doesn't hold the passphrase, you can check it's correctly updated trying to call a method needing the passphrase e.g: `sendPayment`
:::
### Wallet addresses
Cardano wallets are Multi-Account Hierarchy Deterministic that follow a variation of BIP-44 described [here](https://github.com/input-output-hk/implementation-decisions/blob/e2d1bed5e617f0907bc5e12cf1c3f3302a4a7c42/text/1852-hd-chimeric.md). All the addresses are derived from a root key (is like a key factory) which you can get from the recovery phrase. Also the wallets will always have 20 "consecutive" unused address, so anytime you use one of them new address will be "discovered" to keep the rule.
```js
let addresses = await wallet.getAddresses(); // list will contain at least 20 address
```
Get unused addresses:
```js
let unusedAddresses = await wallet.getUnusedAddresses();
```    
Get used addresses:
```js
let usedAddresses = await wallet.getUsedAddresses();
```
You can create/discover next unused address:
```js
// you'll get the n-th address where n is the current addresses list length 
let address = await wallet.getNextAddress();    

// you can also pass the specific index
let address = await wallet.getAddressAt(45);  
``` 
### Wallet balances
When you create a wallet the initial balance is 0. If you are in the mainnet you can transfer Ada to this address. If you are on the testnet you can request test tokens from the [Faucet](https://developers.cardano.org/en/testnets/cardano/tools/faucet/), just input one of the addresses of your wallet and request funds. 
```js
// get available balance. The balance you can expend
let availableBalance = wallet.getAvailableBalance();

// get rewards balance. The balance available to withdraw
let rewardBalance = wallet.getRewardBalance();

// get total balance. Total balance is the sum of available balance plus reward balance
let totalBalance = wallet.getTotalBalance();
```
### Wallet delegation
The wallet have information about whether already delegate on a stake pool or not
```js
let delegation = wallet.getDelegation();
console.log(delegation);
```
It the wallet is not delegate to any stake pool the output should be something similar to this:
```js
{
    "next": [],
    "active": {
        "status": "not_delegating"
    }
}
```
If you start delegating (see [Stake pool section](#stake-pool-operations-with-the-wallet) the action will not take effect inmediatelly but the `next` property will indicate when the delegation will finally take effect. 
The delegation meanwhile should look like this:
```js
{
    "next": [{
        "status": "delegating",
        "changes_at": {
            "epoch_start_time": "2021-04-15T15:03:27Z",
            "epoch_number": 10
        },
        "target": "pool1as50x0wtumtyqzs7tceeh5ry0syh8jnvpnuu9wlxswxuv48sw4w"
    }],
    "active": {
        "status": "not_delegating"
    }
}
```
:::note 
Property `changes_at` will indicate the epoch at the delegation will take effect
:::

If we ask again after/during the epoch 10, we should get the delgation in place:
```js
// refresh the wallet if you are using the same object. This will fecth the info from the blockchain
await wallet.refresh();

let delegation = wallet.getDelegation();
console.log(delegation);

Output:
>  {
      next: [],
      active: {
	status: 'delegating',
	target: 'pool1as50x0wtumtyqzs7tceeh5ry0syh8jnvpnuu9wlxswxuv48sw4w'
      }
   }	
```

### Stake pool operations with the wallet

Get stake pool ranking list by member rewards:
```js
let stake = 1000000000;
let pools = await walletServer.getStakePools(stake);
```    
:::note 
You'll get pool ordered by `non_myopic_member_rewards` which basically means from heighest to lower expected rewards. By default the wallet server
isn't configured to fecth the pool's metadata (e.g. ticker, name, homepage) but you can specify it through the update settings functionality, see Update Settings section below.
:::

Estimate delegation fee:
```js
let fee = await wallet.estimateDelegationFee();
```
:::note 
The very first time you delegate to a pool you'll be charged an extra 2 ADA. This extra fee won't be included on the response.
:::

Delegate to stake pool:
```js
let passphrase = 'tangocrypto';
// choose the first pool from the previous ranking list, but you can select whatever you want.
let pool = pools[0]; 
let transaction = await wallet.delegate(pool.id, passphrase);
```   
:::note 
The transacion status initially is set to `pending`, so you should keep tracking the transaction using the `id` in order to make sure the final status (e.g. `in_ledger`). You can learn more about the transacion's life cycle [here](https://github.com/input-output-hk/cardano-wallet/wiki/About-Transactions-Lifecycle). 
For delegate to another stake pool use the same method above specifying a different stake pool.   
:::

Withdraw stake pool's rewards:
```js
let passphrase = 'tangocrypto';

// select the address to receive the rewards
let address = (await wallet.getUsedAddresses())[0];
// get the reward balance available to withdraw
let rewardBalance = wallet.getRewardBalance();

let transaction = await wallet.withdraw(passphrase, [address], [rewardBalance]);
```    
:::note 
You can send the rewards to multiple addresses splitting up the rewardBalance for each one. Also you can send it to any valid address whether it's in your wallet or not.
:::

Stop delegating:
```js
let transaction = await wallet.stopDelegation(passphrase);
```
Stake pool maintenance actions:
```js
let maintenanceActions = await walletServer.stakePoolMaintenanceActions();
```    
Possible values are:
- not_applicable -> we're currently not querying a SMASH server for metadata
- not_started -> the Garbage Collection hasn't started yet, try again in a short while
- restarting -> the Garbage Collection thread is currently restarting, try again in short while
- has_run -> the Garbage Collection has run successfully
 
:::note 
Maintenance actions will depend on whether or not the wallet server is using a Stakepool Metadata Aggregation Server (SMASH).
:::

Manually trigger Garbage Collection:
```js
await walletServer.triggerStakePoolGarbageCollection();
```    
    
### Wallet transactions

Get wallet transactions:
```js
// get all wallet transactions
let transactions = await wallet.getTransactions();

// filter by start and end date
let start = new Date(2021, 0, 1); // January 1st 2021;
let end = new Date(Date.now());
let transactions = await wallet.getTransactions(start, end);
```

Get transaction details:
```js
let transaction = await wallet.getTransaction(tx.id);
```
Get payment fees:
```js
let receiverAddress = new AddressWallet('addr1q99q78gt2898zgu2dcswf2yuxj6vujcqece38rycc7wsncl5lx8y....');
let amount = 5000000; // 5 ADA
let estimatedFees = await senderWallet.estimateFee([receiverAddress], [amount]);
```
Send payment transfer. Notice that you don't have to calculate the minimum fee, the SDK does that for you:
```js
let passphrase = 'tangocrypto';

let receiverAddress = [new AddressWallet('addr1q99q78gt2898zgu2dcswf2yuxj6vujcqece38rycc7wsncl5lx8y....')];
let amounts = [5000000]; // 5 ADA
let transaction = await senderWallet.sendPayment(passphrase, receiverAddress, amounts);
```
:::note 
You can pass a list of address and amount. We expect both list have the same length where elemetns on each list is index related to the other. 
You can think of it as sending `amounts[i]` to `addresses[i]`.
:::

Send payment transfer with metadata:

Metadata can be expressed as a JSON object with some restrictions:
- All top-level keys must be integers between 0 and 2<sup>64</sup> - 1
- Each metadata value is tagged with its type.
- Strings must be at most 64 bytes when UTF-8 encoded.
- Bytestrings are hex-encoded, with a maximum length of 64 bytes.
 
For more information check [here](https://github.com/input-output-hk/cardano-wallet/wiki/TxMetadata).
```js
let passphrase = 'tangocrypto';

let receiverAddress = [new AddressWallet('addr1q99q78gt2898zgu2dcswf2yuxj6vujcqece38rycc7wsncl5lx8y....')];
let amounts = [5000000]; // 5 ADA

let metadata = ['abc', '2512a00e9653fe49a44a5886202e24d77eeb998f', 123];
let transaction = await senderWallet.sendPayment(passphrase, receiverAddress, amounts, metadata);
``` 
:::warning 
Please note that metadata provided in a transaction will be stored on the blockchain forever. Make sure not to include any sensitive data, in particular personally identifiable information (PII).
:::

Send a more complex metadata object:
```js
let passphrase = 'tangocrypto';

// receiver address
let receiverAddress = [new AddressWallet('addr1q99q78gt2898zgu2dcswf2yuxj6vujcqece38rycc7wsncl5lx8y....')];
let amounts = [5000000]; // 5 ADA

let metadata: any = {0: 'hello', 1: Buffer.from('2512a00e9653fe49a44a5886202e24d77eeb998f', 'hex'), 4: [1, 2, {0: true}], 5: {'key': null, 'l': [3, true, {}]}, 6: undefined};
let transaction = await senderWallet.sendPayment(passphrase, receiverAddress, amounts, metadata);
```
:::note 
Values like boolean, null and undefined are passed as string (e.g "true", "null", "undefined").
:::

Forget transaction:
If for some reason your transaction hang on status `pending`, for a long period, you can consider to "cancel" it.
```js
wallet.forgetTransaction(transaction.id)
```
:::important 
A transaction, when sent, cannot be cancelled. One can only request forgetting about it in order to try spending (concurrently) the same UTxO in another transaction. But, the transaction may still show up later in a block and therefore, appear in the wallet.
:::
### Submit external transaction
You can pass in a transaction created externally (by other tools) and submit it into the blockchain. You can use this library to create the transaction
offline as well. Here is an example:
```js   
// recovery phrase, this should be the same you use to create the wallet (see Wallet section)
let recovery_phrase = [...];

// blockchain config, this is where you can find protocol params, slotsPerKESPeriod etc.
// This lib comes with  Mainnet, Testnet and LocalCluster config, but you should pass your own to make sure they are up to date.
// You can find the latest config files here: https://hydra.iohk.io/build/6498473/download/1/index.html
let config = { ..., "protocolParams": {... "minFeeA": 44, ..., "minFeeB": 155381, ...} }

// get first unused wallet's address
let addresses = (await wallet.getUnusedAddresses()).slice(0, 1);
let amounts = [1000000];

// get ttl 
let info = await walletServer.getNetworkInformation();
let ttl = info.node_tip.absolute_slot_number * 12000;

// you can include metadata
let data: any = {0: 'hello', 1: Buffer.from('2512a00e9653fe49a44a5886202e24d77eeb998f', 'hex'), 4: [1, 2, {0: true}], 5: {'key': null, 'l': [3, true, {}]}, 6: undefined};

// get the tx structure with all the necessary components (inputs, outputs, change, etc).
let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);

// get the signing keys (can be offline)
let rootKey = Seed.deriveRootKey(recovery_phrase); 
let signingKeys = coinSelection.inputs.map(i => {
    let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
    return privateKey;
});

// build and sign tx (can be offline)
// include the metadata in the build and sign process
let metadata = Seed.buildTransactionMetadata(data);
let txBuild = Seed.buildTransaction(coinSelection, ttl, {metadata: metadata, config: config});
let txBody = Seed.sign(txBuild, signingKeys, metadata);

// submit the tx into the blockchain
let signed = Buffer.from(txBody.to_bytes()).toString('hex');
let txId = await walletServer.submitTx(signed);
```    
### Key handling
There ara a couple of methods you can use to derive and get private/public key pairs. For more info check [here](https://docs.cardano.org/projects/cardano-wallet/en/latest/About-Address-Derivation.html).

Get root key from recovery phrase
```js
let phrase = [...];
let rootKey = Seed.deriveRootKey(phrase);
console.log(rootKey.to_bech32());

Output:
> "xprv..."
```

Derive private/signing key (also known as spending key) from root key
```js
let rootKey = Seed.deriveRootKey(phrase);
let privateKey = Seed.deriveKey(rootKey, ['1852H','1815H','0H','0','0']).to_raw_key();
console.log(privateKey.to_bech32());
 
Output:
> "ed25519e_sk1..."
```

Derive account key from root
```js
let rootKey = Seed.deriveRootKey(phrase);
let accountKey = Seed.deriveAccountKey(rootKey, 0);
console.log(accountKey.to_bech32());

Output:
> "xprv..."
```

All the method mentioned above return a `Bip32PrivateKey` which you can use to keep deriving and generating keys and addresses check [here](https://docs.cardano.org/projects/cardano-serialization-lib/en/latest/) for more info. For example, assuming you have `cardano-serialization-lib` installed, 
you can get a stake address like this:
```js
let rootKey = Seed.deriveRootKey(phrase);
let stakePrvKey = Seed.deriveKey(rootKey, ['1852H','1815H','0H','2','0']).to_raw_key();
const stakePubKey = stakePrvKey.to_public();

const rewardAddr = RewardAddress.new(
NetworkInfo.mainnet().network_id(),
StakeCredential.from_keyhash(stakePubKey.hash())
)
.to_address();
console.log(rewardAddr.to_bech32());

Output:
> "stake..."
```

Sign and verify a message using a private/public key pair.
```js
let message = 'Hello World!!!';
const rootKey = Seed.deriveRootKey(phrase);
const accountKey = Seed.deriveAccountKey(rootKey);
```
```js
// we'll use the stake private/public key at 0 in this case but you can use whatever private/public key pair.
const stakePrvKey = accountKey
	.derive(CARDANO_CHIMERIC) // chimeric
	.derive(0);

const privateKey = stakePrvKey.to_raw_key();
const publicKey = privateKey.to_public();

const signed = Seed.signMessage(privateKey, message);
const verify_result = Seed.verifyMessage(publicKey, message, signed);

Output:
> True
```

### Native Tokens
You can create native tokens just creating a transaction with a couple of differences, here is an example:
```js
// address to hold the minted tokens. You can use which you want.
let addresses = [(await wallet.getAddresses())[0]];

// blockchain config, this is where you can find protocol params, slotsPerKESPeriod etc.
// This lib comes with  Mainnet, Testnet and LocalCluster config (Config.Mainnet, Config.Testnet and Config.LocalCluster), but you may consider provide your own to make sure they are up to date.
// You can find the latest config files here: https://hydra.iohk.io/build/6498473/download/1/index.html
let config = { ..., "protocolParams": {... "minFeeA": 44, ..., "minFeeB": 155381, ...} }

// policy public/private keypair
let keyPair= Seed.generateKeyPair();
let policyVKey = keyPair.publicKey;
let policySKey = keyPair.privateKey;

// generate single issuer native script
let keyHash = Seed.getKeyHash(policyVKey);
let script = Seed.buildSingleIssuerScript(keyHash);

//generate policy id
let scriptHash = Seed.getScriptHash(script);
let policyId = Seed.getPolicyId(scriptHash);

// metadata
let data: any = {};
let tokenData: any = {}
tokenData[policyId] = {
	Tango: {
		arweaveId: "arweave-id",
		ipfsId: "ipfs-id",
		name: "Tango",
		description: "Tango crypto coin",
		type: "Coin"
	}
};
data[0] = tokenData;

// asset
let asset = new AssetWallet(policyId, "Tango", 1000000);

// token
let tokens = [new TokenWallet(asset, script, [keyPair])];

//scripts
let scripts = tokens.map(t => t.script);

// get min ada for address holding tokens
let minAda = Seed.getMinUtxoValueWithAssets([asset], config);
let amounts = [minAda];

// get ttl info
let info = await walletServer.getNetworkInformation();
let ttl = info.node_tip.absolute_slot_number * 12000;

// get coin selection structure (without the assets)
let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);

// add signing keys
let rootKey = Seed.deriveRootKey(payeer.mnemonic_sentence); 
let signingKeys = coinSelection.inputs.map(i => {
	let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
	return privateKey;
});

// add policy signing keys
tokens.filter(t => t.scriptKeyPairs).forEach(t => signingKeys.push(...t.scriptKeyPairs.map(k => k.privateKey.to_raw_key())));

let metadata = Seed.buildTransactionMetadata(data);

// the wallet currently doesn't support including tokens not previuosly minted
// so we need to include it manually.
coinSelection.outputs = coinSelection.outputs.map(output => {
	if (output.address === addresses[0].address) {
		output.assets = tokens.map(t => {
			let asset: WalletsAssetsAvailable = {
				 policy_id: t.asset.policy_id,
				 asset_name: Buffer.from(t.asset.asset_name).toString('hex'),
				 quantity: t.asset.quantity
			};
			return asset;
		});
	}
	return output;
});

// we need to sing the tx and calculate the actual fee and the build again 
// since the coin selection doesnt calculate the fee with the asset tokens included
let txBody = Seed.buildTransactionWithToken(coinSelection, ttl, tokens, signingKeys, {data: data, config: config});
let tx = Seed.sign(txBody, signingKeys, metadata, scripts);

// submit the tx	
let signed = Buffer.from(tx.to_bytes()).toString('hex');
let txId = await walletServer.submitTx(signed);
```
:::note
You can check more scripts on `test/assets.ts`, this example is the equivalent to "RequireSignature" you can create with JSON:
:::

```json
{
  "type": "sig",
  "keyHash": "e09d36c79dec9bd1b3d9e152247701cd0bb860b5ebfd1de8abb6735a"
} 
```

### Send Native Tokens
Here you have two options, either rely on cardano-wallet directly or build the tx by yourself. 
#### Using Cardano Wallet
```js
// passphrase
let passphrase = "your passphrase";
let policyId = "your policyId";

// passphrase
let passphrase = "your passphrase";
let policyId = "your policyId";

// blockchain config, this is where you can find protocol params, slotsPerKESPeriod etc.
// This lib comes with  Mainnet, Testnet and LocalCluster config (Config.Mainnet, Config.Testnet and Config.LocalCluster), but you may consider provide your own to make sure they are up to date.
// You can find the latest config files here: https://hydra.iohk.io/build/6498473/download/1/index.html
let config = { ..., "protocolParams": {... "minFeeA": 44, ..., "minFeeB": 155381, ...} }

// address to send the minted tokens
let addresses = [new AddressWallet("addr......")];
let asset = new AssetWallet(policyId, "Tango", 100);

// bind the asset to the address
let assets = {}; 
assets[addresses[0].id] = [asset];

// calculate the min ADA to send in the tx
let minAda = Seed.getMinUtxoValueWithAssets([asset], config);

// send it using the wallet
let tx = await wallet.sendPayment(passphrase, addresses, [minAda], ['send 100 Tango tokens'], assets);	
```
#### Building the tx
```js
// passphrase
let passphrase = "your passphrase";
let policyId = "your policyId";

// blockchain config, this is where you can find protocol params, slotsPerKESPeriod etc.
// This lib comes with  Mainnet, Testnet and LocalCluster config (Config.Mainnet, Config.Testnet and Config.LocalCluster), but you should pass your own to make sure they are up to date.
// You can find the latest config files here: https://hydra.iohk.io/build/6498473/download/1/index.html
let config = { ..., "protocolParams": {... "minFeeA": 44, ..., "minFeeB": 155381, ...} }

// address to send the minted tokens
let addresses = [new AddressWallet("addr......")];
let asset = new AssetWallet(policyId, "Tango", 100);

// blockchain config, this is where you can find protocol params, slotsPerKESPeriod etc.
// This lib comes with  Mainnet, Testnet and LocalCluster config, but you may consider provide your own to make sure they are up to date.
// You can find the latest config files here: https://hydra.iohk.io/build/6498473/download/1/index.html
let config = { ..., "protocolParams": {... "minFeeA": 44, ..., "minFeeB": 155381, ...} }

// bind the asset to the address
let assets = {}; 
assets[addresses[0].id] = [asset];

// calculate the min ADA to send in the tx
let minUtxo = Seed.getMinUtxoValueWithAssets([asset], config)

// you can include metadata as well
let data =  ['send 100 Tango tokens'];
let coinSelection = await wallet.getCoinSelection(addresses, [minUtxo], data, assets);
let info = await walletServer.getNetworkInformation();

//build and sign tx
let rootKey = Seed.deriveRootKey(payeer.mnemonic_sentence); 
let signingKeys = coinSelection.inputs.map(i => {
	let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
	return privateKey;
});
let metadata = Seed.buildTransactionMetadata(data);
let txBuild = Seed.buildTransaction(coinSelection, info.node_tip.absolute_slot_number * 12000, {metadata: metadata, config: config});
let txBody = Seed.sign(txBuild, signingKeys, metadata);
let signed = Buffer.from(txBody.to_bytes()).toString('hex');
let txId = await walletServer.submitTx(signed);
```
# Test

### Stack
you'll need to install stak >= 1.9.3
you can find it here: https://docs.haskellstack.org/en/stable/README/.
You may need to install the libsodium-dev, libghc-hsopenssl-dev, gmp, sqlite and systemd development libraries for the build to succeed.

Also you will need `cardano-node` and `cardano-cli` binaries availables on your PATH.

The setup steps are quite simple:
clone: `cardano-wallet`
execute: `stack install cardano-wallet:exe:local-cluster`
Set a specific port `export CARDANO_WALLET_PORT=7355` so the wallet always start at the same port.
run `~/.local/bin/local-cluster`

