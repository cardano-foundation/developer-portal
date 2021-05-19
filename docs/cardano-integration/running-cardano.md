---
id: running-cardano
title: How to run cardano-node
sidebar_label: Running cardano-node
description: This guide will explain and show you how to run the cardano-node and components on your system.
image: ./img/og-developer-portal.png
--- 
### Overview 

In this guide, we will show you how to run `cardano-node` and `cardano-cli` on your system and we will show you some simple examples on how you can interact with the **Cardano** blockchain.

:::note
This guide assumes you have installed `cardano-node` and `cardano-cli` into your system. If not you can refer to [Installing cardano-node](/docs/cardano-integration/installing-cardano-node) guide for instructions on how to do that.
:::

:::important
This guide does not explain how to run a block-producing `cardano-node` or running a **Cardano Stake Pool**. For more information regarding that topic, please visit the [Stake Pool Operation](/docs/stake-pool-operation/overview) section.
:::

### Configuration Files

The `cardano-node` application requires atleast four configuration files to run as of writing this article.

- **Main Config** : It contains general node settings such as **logging** and **versioning**. It also points to the **Byron Genesis** and the **Shelly Genesis** file.
- **Byron Genesis** : It contains the initial protocol parameters and instructs the `cardano-node` on how to bootstrap the **Byron Era** of the **Cardano** blockchain.
- **Shelly Genesis** : It contains the initial protocol parameters and instructs the `cardano-node` on how to bootstrap the **Shelly Era** of the **Cardano** blockchain.
- **Topology** : It contains the list of network peers (**`IP Address` and `Port` of other nodes running the blockchain network**) that your node will connect to.

:::important
Currently, the `cardano-node` topology is manually set by the community of network operators in the **Cardano** blockchain. But an automated p2p (peer-to-peer) system is in the works. More information can be found in this article: [Boosting network decentralization with P2P](https://iohk.io/en/blog/posts/2021/04/06/boosting-network-decentralization-with-p2p/).

For more information about **Cardano** blockchain eras and upgrades, please visit the [Cardano Roadmap](https://roadmap.cardano.org/en).
:::

You can obtain the current **Cardano** blockchain network configuration files here: 


#### Mainnet / Production
```
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/mainnet-config.json
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/mainnet-byron-genesis.json
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/mainnet-shelley-genesis.json
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/mainnet-topology.json
```

#### Testnet / Sandbox
```
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/testnet-config.json
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/testnet-byron-genesis.json
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/testnet-shelley-genesis.json
https://hydra.iohk.io/job/Cardano/cardano-node/cardano-deployment/latest-finished/download/1/testnet-topology.json
```
:::note
This section will be updated as new **Cardano** networks come online with their respective configuration files.
:::

### Running the node

To run `cardano-node` you enter something like this into the terminal: 

```bash
 cardano-node run \
   --topology path/to/mainnet-topology.json \
   --database-path path/to/db \
   --socket-path path/to/db/node.socket \
   --host-addr x.x.x.x \
   --port 3001 \
   --config path/to/mainnet-config.json
```

To get the complete list of available options, use `cardano-node run --help`

```
Usage: cardano-node run [--topology FILEPATH] [--database-path FILEPATH] 
                        [--socket-path FILEPATH] 
                        [--byron-delegation-certificate FILEPATH] 
                        [--byron-signing-key FILEPATH] 
                        [--shelley-kes-key FILEPATH] 
                        [--shelley-vrf-key FILEPATH] 
                        [--shelley-operational-certificate FILEPATH] 
                        [--bulk-credentials-file FILEPATH] [--host-addr IPV4] 
                        [--host-ipv6-addr IPV6] [--port PORT] 
                        [--config NODE-CONFIGURATION] [--validate-db]
  Run the node.

Available options:
  --topology FILEPATH      The path to a file describing the topology.
  --database-path FILEPATH Directory where the state is stored.
  --socket-path FILEPATH   Path to a cardano-node socket
  --byron-delegation-certificate FILEPATH
                           Path to the delegation certificate.
  --byron-signing-key FILEPATH
                           Path to the Byron signing key.
  --shelley-kes-key FILEPATH
                           Path to the KES signing key.
  --shelley-vrf-key FILEPATH
                           Path to the VRF signing key.
  --shelley-operational-certificate FILEPATH
                           Path to the delegation certificate.
  --bulk-credentials-file FILEPATH
                           Path to the bulk pool credentials file.
  --host-addr IPV4         An optional ipv4 address
  --host-ipv6-addr IPV6    An optional ipv6 address
  --port PORT              The port number
  --config NODE-CONFIGURATION
                           Configuration file for the cardano-node
  --validate-db            Validate all on-disk database files
  --shutdown-ipc FD        Shut down the process when this inherited FD reaches
                           EOF
  --shutdown-on-slot-synced SLOT
                           Shut down the process after ChainDB is synced up to
                           the specified slot
  -h,--help                Show this help text
```
### cardano-node parameters

We will focus on six key command-line parameters for running a node: 

**`--topology`** : This requires the path of the `topology.json` file that you have downloaded as instructed [above](/docs/cardano-integration/running-cardano#configuration-files).

> For example, If you have downloaded the `topology.json` file to `~/cardano/topology.json`, then the argument would be something like this:
```
--topology ~/cardano/topology.json
```

**`--database-path`** : This expects the path to a directory where we will store the actual blockchain data like **blocks**, **transactions**, **metadata** and other types of data that people has stored in the **Cardano** blockchain. We explore on how we can query those kinds of data in the [cardano-db-sync](/cardano-db-sync) section.

> For example, let us say that we decided that all things **Cardano** will be the path `~/cardano`. Then we could create a database directory like so `mkdir -p ~/cardano/db`.
> The directory structure would then be something like this:
```
~/cardano
├── db
├── testnet-byron-genesis.json
├── testnet-config.json
├── testnet-shelley-genesis.json
└── testnet-topology.json
1 directory, 4 files
```
> As you may have noticed, in this example we have choosen to run a `testnet` node and we have downloaded the configuration files into the `~/cardano` directory. We also see that we have created the `db` directory inside `~/cardano`. The argument would then look something like this: 
```
--database-path ~/cardano/db
```

**`--socket-path`** : This expects the path to the `unix socket` or `named pipe` path that the `cardano-node` will use for [IPC (Inter-Process-Communication)](https://en.wikipedia.org/wiki/Inter-process_communication).

> The `cardano-node` uses **IPC (Inter-Process-Communication)** for communicating with some of the other **Cardano** components like `cardano-cli`, `cardano-wallet` and `cardano-db-sync`. In **Linux** and **MacOS** it uses something called [unix sockets](https://en.wikipedia.org/wiki/Unix_domain_socket) and [Named Pipes](https://docs.microsoft.com/en-us/windows/win32/ipc/named-pipes) in **Windows**.

**`--host-addr`** : 

**`--port`** : 

**`--config`** : 

### Querying the Cardano Blockchain
