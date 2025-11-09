---
id: using-cardano-wallet
title: Using cardano-wallet REST API
sidebar_label: Using cardano-wallet
sidebar_position: 2
description: Learn how to create wallets, manage addresses, and send transactions using cardano-wallet's REST API
image: /img/og/og-getstarted-cardano-wallet.png
---

:::note
This guide assumes you have installed `cardano-wallet` into your system. If not you can refer to [Installing cardano-wallet](installing-cardano-wallet.md) guide for instructions on how to do that.

We will use the path `$HOME/cardano/wallets` to store all the `cardano-wallet` related files as an example, please replace it with the directory you have chosen to store the files.
:::

:::important
Please make sure your `cardano-node` is connected and synchronized to a testnet network before proceeding.
:::

:::warning
In a production environment, it might not be a good idea to store wallets / keys in a public server unless you know what you are doing.
:::

First, lets create a directory to store all our `wallets` like so:

```bash
mkdir -p $HOME/cardano/wallets
```

## Starting cardano-wallet as a REST API server

We will be focusing on the [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) that `cardano-wallet` provides. In-order to interact with the API, we must first start the server.

```bash
cardano-wallet serve \
--port 1337 \
--testnet $HOME/cardano/testnet-byron-genesis.json \
--database $HOME/cardano/wallets/db \
--node-socket $CARDANO_NODE_SOCKET_PATH
```

`cardano-wallet serve` : Runs `cardano-wallet` as a web server that provides a [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer).

`--port` : Specifies the port that the web server will listen to for any requests.

> You can choose whatever `port` number you like, but it is recommended to use `port` numbers `1024` and above. See [Registered Port](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml) for more information.

`--testnet` : Specifies the **Byron** genesis file path for the testnet network.

> This should match the genesis file that the `cardano-node` you are connected is using as-well. If you meant to connect to `mainnet` then use the `--mainnet` flag and the `mainnet` **Byron** genesis file instead.

`--database` : Specifies the path where the wallet database will be saved.

> It is important to note that the wallet creation function requires a passphrase so all the wallet data will be encrypted by the passphrase.

`--node-socket` : Specifies the `cardano-node` socket path that will be used by the `cardano-wallet` to communicate with the node.

> The `cardano-node` uses **IPC (Inter-Process-Communication)** for communicating with the other **Cardano** components like `cardano-cli`, `cardano-wallet` and `cardano-db-sync`. In **Linux** and **MacOS** it uses something called [unix sockets](https://en.wikipedia.org/wiki/Unix_domain_socket) and [Named Pipes](https://docs.microsoft.com/en-us/windows/win32/ipc/named-pipes) in **Windows**.
>
> Here is an example `--socket-path` argument for **Linux**:

```
--socket-path $HOME/cardano/db/node.socket
```

> As you can see the argument points to a file since **unix sockets** are represented as files (like everything else in **Linux**). In this case we put the socket file in the `db` directory that we have just created before.
>
> In **Windows**, the `--socket-path` argument would look something like this:

```
--socket-path "\\\\.\\pipe\\cardano-node-testnet"
```

> As you notice its almost like a network `URI` or a network `Path` than a file, this is a key difference that you will have to be aware depending on your operating system. You can replace the string `cardano-node-testnet` in the argument to whatever you like, this example path in particular is used in the [Daedalus Testnet Wallet](https://daedaluswallet.io) for **Windows**.

Once the server is running you should see something like this (among other things):

```
[cardano-wallet.network:Info:12] [2021-06-03 13:48:24.82 UTC] Protocol parameters for tip are:
 Decentralization level: 100.00%
 Transaction parameters: [Fee policy: 155381.0 + 44.0x, Tx max size: 16384]
 Desired number of pools: 500
 Minimum UTxO value: 1.000000
 Eras:
   - byron from -0
   - shelley from 74
   - allegra from 102
   - mary from 112

Slotting parameters for tip are:
 Slot length:        1s
 Epoch length:       432000
 Active slot coeff:  5.0e-2
 Security parameter: 2160 block


[cardano-wallet.main:Info:4] [2021-06-03 13:48:24.86 UTC] Wallet backend server listening on http://127.0.0.1:1337/
```

## Checking wallet server information

The first thing we can do to test if the wallet server is working correctly is to query the network information via the API.

```bash
curl --url http://localhost:1337/v2/network/information | jq
```

The result should be something like this:

```json
{
  "node_era": "mary",
  "network_tip": {
    "slot_number": 408744,
    "absolute_slot_number": 28359144,
    "time": "2021-06-03T13:52:40Z",
    "epoch_number": 135
  },
  "next_epoch": {
    "epoch_start_time": "2021-06-03T20:20:16Z",
    "epoch_number": 136
  },
  "sync_progress": {
    "status": "ready"
  },
  "node_tip": {
    "height": {
      "unit": "block",
      "quantity": 2639489
    },
    "slot_number": 408722,
    "absolute_slot_number": 28359122,
    "time": "2021-06-03T13:52:18Z",
    "epoch_number": 135
  }
}
```

It is important to make sure that the `sync_progress.status` is equal to `ready` before proceeding.

## Creating a wallet

To create a wallet we must first generate a wallet **recovery phrase** using the `cardano-wallet` in the CLI.

```bash
cardano-wallet recovery-phrase generate | jq -c --raw-input 'split(" ")'
```

You should get a **24-word mnemonic seed** in return similar to this:

```
["shift", "badge", "heavy", "action", "tube", "divide", "course", "quality", "capable", "velvet", "cart", "marriage", "vague", "aware", "maximum", "exist", "crime", "file", "analyst", "great", "cabbage", "course", "sad", "apology"]
```

We can now create a **Cardano** wallet using the `/v2/wallets` API endpoint:

```bash
curl --request POST \
  --url http://localhost:1337/v2/wallets \
  --header 'Content-Type: application/json' \
  --data '{
 "name": "test_cf_1",
 "mnemonic_sentence": ["shift", "badge", "heavy", "action", "tube", "divide", "course", "quality", "capable", "velvet", "cart", "marriage", "vague", "aware", "maximum", "exist", "crime", "file", "analyst", "great", "cabbage", "course", "sad", "apology"],
 "passphrase": "test123456"
}' | jq
```

Our requests payload data is composed of:

`name` : The name of the wallet.

`passphrase` : Sets the security phrase to protect the funds inside the wallet. It will be required every time you need write access to the wallet, more specifically sending assets.

`mnemonic_sentence` : This is the wallet **recovery phrase** formatted into a `JSON` array.

If successful, you should see something like this:

```json
{
  "address_pool_gap": 20,
  "passphrase": {
    "last_updated_at": "2021-06-03T14:25:18.2676524Z"
  },
  "balance": {
    "available": {
      "unit": "lovelace",
      "quantity": 0
    },
    "total": {
      "unit": "lovelace",
      "quantity": 0
    },
    "reward": {
      "unit": "lovelace",
      "quantity": 0
    }
  },
  "id": "5076b34c6949dbd150eb9c39039037543946bdce",
  "state": {
    "status": "syncing",
    "progress": {
      "unit": "percent",
      "quantity": 0
    }
  },
  "name": "test_cf_1",
  "assets": {
    "available": [],
    "total": []
  },
  "tip": {
    "height": {
      "unit": "block",
      "quantity": 0
    },
    "slot_number": 0,
    "absolute_slot_number": 0,
    "time": "2019-07-24T20:20:16Z",
    "epoch_number": 0
  },
  "delegation": {
    "next": [],
    "active": {
      "status": "not_delegating"
    }
  }
}
```

Initially, the newly created/restored wallet will need to be synced before it can be used. You can verify if the wallet is already synced by executing the following request:

```bash
curl --url http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce | jq '.state'
```

***It is important to note that the `5076b34c6949dbd150eb9c39039037543946bdce` string is actually the `wallet.id` of the previously generated wallet.***

You should see something like this:

```json
{
  "status": "ready"
}
```

## Receiving tAda (test ada)

Now that we have created a wallet, we can now request some tAda from the **Testnet Faucet**. But before we can do that we must first get a cardano address for our wallet.

We can do that by executing the command:

```bash
curl --url 'http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce/addresses?state=unused' | jq '.[0]'
```

The result should be something like this:

```json
{
  "derivation_path": [
    "1852H",
    "1815H",
    "0H",
    "0",
    "0"
  ],
  "id": "addr_test1qzf9q3qjcaf6kxshwjfw9ge29njtm56r2a08g49l79xgt4je0592agqpwraqajx2dsu2sxj64uese5s4qum293wuc00q7j6vsp",
  "state": "unused"
}
```

It is important to note that the parameter of this request is the **wallet id** of the target wallet you want to get the address. In this case it is `5076b34c6949dbd150eb9c39039037543946bdce` our previously generated wallet.

We are basically querying the first wallet address that has not been used just yet, Indicated by `state: "unused"`. As we can see the wallet address value is: `addr_test1qzf9q3qjcaf6kxshwjfw9ge29njtm56r2a08g49l79xgt4je0592agqpwraqajx2dsu2sxj64uese5s4qum293wuc00q7j6vsp"`

Now we can finally request some `tAda` for the wallet address from the [Cardano Testnet Faucet](../../get-started/networks/testnets/testnet-faucet).

Once you requested some `tAda` from the [Cardano Testnet Faucet](../../get-started/networks/testnets/testnet-faucet), we can then check if it has arrived into our wallet like so:

```bash
curl --url http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce | jq '.balance'
```

You should see something like this:

```json
{
  "available": {
    "unit": "lovelace",
    "quantity": 1000000000
  },
  "total": {
    "unit": "lovelace",
    "quantity": 1000000000
  },
  "reward": {
    "unit": "lovelace",
    "quantity": 0
  }
}
```

As we can see here we have a total of `1,000,000,000 lovelace` available to spend that we received from the [Cardano Testnet Faucet](../../get-started/networks/testnets/testnet-faucet).

## Creating simple transactions

To have a clearer understanding of how sending transactions work using `cardano-wallet`, first lets create another wallet like so:

**Generate recovery-phrase**

```bash
cardano-wallet recovery-phrase generate | jq -c --raw-input 'split(" ")'
```

**Recovery-phrase result**

```
["then", "tattoo", "copy", "glance", "silk", "kitchen", "kingdom", "pioneer", "off", "path", "connect", "artwork", "alley", "smooth", "also", "foil", "glare", "trouble", "erupt", "move", "position", "merge", "scale", "echo"]
```

**Create Wallet Request**

```bash
curl --request POST \
  --url http://localhost:1337/v2/wallets \
  --header 'Content-Type: application/json' \
  --data '{
 "name": "test_cf_2",
 "mnemonic_sentence": ["then", "tattoo", "copy", "glance", "silk", "kitchen", "kingdom", "pioneer", "off", "path", "connect", "artwork", "alley", "smooth", "also", "foil", "glare", "trouble", "erupt", "move", "position", "merge", "scale", "echo"],
 "passphrase": "test123456"
}' | jq
```

**Create Wallet Result**

```json
{
  "address_pool_gap": 20,
  "passphrase": {
    "last_updated_at": "2021-06-04T11:39:06.8887923Z"
  },
  "balance": {
    "available": {
      "unit": "lovelace",
      "quantity": 0
    },
    "total": {
      "unit": "lovelace",
      "quantity": 0
    },
    "reward": {
      "unit": "lovelace",
      "quantity": 0
    }
  },
  "id": "4a64b453ad1c1d33bfec4d3ba90bd2456ede35bb",
  "state": {
    "status": "syncing",
    "progress": {
      "unit": "percent",
      "quantity": 0
    }
  },
  "name": "test_cf_2",
  "assets": {
    "available": [],
    "total": []
  },
  "tip": {
    "height": {
      "unit": "block",
      "quantity": 0
    },
    "slot_number": 0,
    "absolute_slot_number": 0,
    "time": "2019-07-24T20:20:16Z",
    "epoch_number": 0
  },
  "delegation": {
    "next": [],
    "active": {
      "status": "not_delegating"
    }
  }
}
```

We now have the following wallets:

| WalletId                                        | Wallet Name       | Balance(Lovelace)     |
| --------                                        | ---------         | ----------            |
| 5076b34c6949dbd150eb9c39039037543946bdce        | test_cf_1         | 1000000000            |
| 4a64b453ad1c1d33bfec4d3ba90bd2456ede35bb        | test_cf_2         | 0                     |

Now let's say that we want to send `250,000,000 lovelaces` to `test_cf_2` wallet. Well first we have to get `test_cf_2` wallet address like so:

```bash
curl --url 'http://localhost:1337/v2/wallets/4a64b453ad1c1d33bfec4d3ba90bd2456ede35bb/addresses?state=unused' | jq '.[0]'
```

and we should see something like this:

```json
{
  "derivation_path": [
    "1852H",
    "1815H",
    "0H",
    "0",
    "0"
  ],
  "id": "addr_test1qzyfnjk3zmgzmvnnvnpeguv6se2ptjj3w3uuh30llqe5xdtzdduxxvke8rekwukyn0qt9g5pahasrnrdmv7nr86x537qxdgza0",
  "state": "unused"
}
```

So now that we have `test_cf_2` wallet address `addr_test1qzyfnjk3zmgzmvnnvnpeguv6se2ptjj3w3uuh30llqe5xdtzdduxxvke8rekwukyn0qt9g5pahasrnrdmv7nr86x537qxdgza0`. We can now use it to send some `tAda` to it from `test_cf_1` wallet like so:

```bash
curl --request POST \
  --url http://localhost:1337/v2/wallets/5076b34c6949dbd150eb9c39039037543946bdce/transactions \
  --header 'Content-Type: application/json' \
  --data '{
 "passphrase": "test123456",
 "payments": [
  {
   "address": "addr_test1qzyfnjk3zmgzmvnnvnpeguv6se2ptjj3w3uuh30llqe5xdtzdduxxvke8rekwukyn0qt9g5pahasrnrdmv7nr86x537qxdgza0",
   "amount": {
    "quantity": 250000000,
    "unit": "lovelace"
   }
  }
 ]
}'
```

:::note
Remember, we use the `test_cf_1` wallet id in the `http://localhost:1337/v2/wallets/<walletId>` endpoint, because we want the `test_cf_1` to send to `test_cf_2` wallet address.
:::

Now we can check `test_cf_2` wallet balance like so:

```bash
curl --url http://localhost:1337/v2/wallets/4a64b453ad1c1d33bfec4d3ba90bd2456ede35bb | jq '.balance'
```

And we should see that indeed the `250,000,000 tAda` has been received (***you might need to wait for a few seconds***).

```json
{
  "available": {
    "unit": "lovelace",
    "quantity": 250000000
  },
  "total": {
    "unit": "lovelace",
    "quantity": 250000000
  },
  "reward": {
    "unit": "lovelace",
    "quantity": 0
  }
}
```

Checking `test_cf_1` wallet balance should show you something like this:

```json
{
  "available": {
    "unit": "lovelace",
    "quantity": 749831199
  },
  "total": {
    "unit": "lovelace",
    "quantity": 749831199
  },
  "reward": {
    "unit": "lovelace",
    "quantity": 0
  }
}
```

Our wallets should now be the following:

| WalletId                                        | Wallet Name       | Balance(Lovelace)     |
| --------                                        | ---------         | ----------            |
| 5076b34c6949dbd150eb9c39039037543946bdce        | test_cf_1         | 749831199             |
| 4a64b453ad1c1d33bfec4d3ba90bd2456ede35bb        | test_cf_2         | 250000000             |

:::note

It is important to note that `cardano-wallet` has automatically determined the fee for the transaction to send `250,000,000 lovelace` from wallet `test_cf_1` to `test_cf_2` and `cardano_wallet` has deducted the fee from `test_cf_1` wallet automatically.

:::

:::tip

Full documentation of the `cardano-wallet` [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) can be found here: [https://cardano-foundation.github.io/cardano-wallet/api/edge](https://cardano-foundation.github.io/cardano-wallet/api/edge)

:::

Congratulations, You have created and sent your first **Cardano** transaction using `cardano-wallet`! 🎉🎉🎉
