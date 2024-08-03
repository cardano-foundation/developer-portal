---
id: cardano-relay-configuration
title: Cardano Relay Configuration (Startup scripts, Systemd)
sidebar_label: Cardano Relay Configuration
description: Cardano Relay Configuration (Startup scripts, Systemd)
image: ../img/og-developer-portal.png
---
In the last section, we went through the process of downloading, compiling, and installing cardano-node and cardano-cli into your Linux-based operating system. Now in this section we will walk through the process of configuring the installed node as a relay node.

## Configuration Files

The `cardano-node` application requires the following configuration files to run as of writing this article.

- **Main Config**: It contains general node settings such as **logging** and **versioning**. It also points to the **Byron Genesis** and the **Shelly Genesis** file.
- **Byron Genesis**: It contains the initial protocol parameters and instructs the `cardano-node` on how to bootstrap the **Byron Era** of the **Cardano** blockchain.
- **Shelly Genesis**: It contains the initial protocol parameters and instructs the `cardano-node` on how to bootstrap the **Shelly Era** of the **Cardano** blockchain.
- **Alonzo Genesis**: It contains the initial protocol parameters and instructs the `cardano-node` on how to bootstrap the **Alonzo Era** of the **Cardano** blockchain.
- **Topology**: It contains the list of network peers (**`IP Address` and `Port` of other nodes running the blockchain network**) that your node will connect to.

:::important
Currently, the `cardano-node` topology is manually set by the community of network operators in the **Cardano** blockchain. But an automated p2p (peer-to-peer) system is in the works. For more information visit [Introducing our new peer-to-peer (P2P) testnet](https://iohk.io/en/blog/posts/2021/12/08/introducing-our-new-peer-to-peer-p2p-testnet/).

For more information about **Cardano** blockchain eras and upgrades, please visit the [Cardano Roadmap](https://roadmap.cardano.org/en).
:::

The focus of this tutorial is on learning how to setup a stake pool. So we will go through the steps of configuring the relay on a [testnet network](docs/get-started/testnets-and-devnets.md) and not the Mainnet.
You can download the current **Cardano** blockchain network configuration files here:

## Pre-Production Testnet

```
mkdir -p $HOME/cardano-testnet
cd $HOME/cardano-testnet

curl -O -J https://book.world.dev.cardano.org/environments/preprod/config.json
curl -O -J https://book.world.dev.cardano.org/environments/preprod/topology.json
curl -O -J https://book.world.dev.cardano.org/environments/preprod/byron-genesis.json
curl -O -J https://book.world.dev.cardano.org/environments/preprod/shelley-genesis.json
curl -O -J https://book.world.dev.cardano.org/environments/preprod/alonzo-genesis.json
curl -O -J https://book.world.dev.cardano.org/environments/preprod/conway-genesis.json
```

:::note

Each network has a `config` file, `genesis` file(s), `topology` file, and unique identifier called the **Network Magic**.

:::

If your Block Producer node is already setup, you can add it to your relay topology file by adding its IP address and port number to "localRoots".

```
nano topology.json

{
  "LocalRoots": {
    "groups": [
      {
        "localRoots": {
          "accessPoints": [
            { "address": "your-blockproducer-address", "port": 6000 }
          ],
          "advertise": false
        },
        "valency": 1
      }
    ]
  },
  "PublicRoots": [
    {
      "publicRoots": {
        "accessPoints": [
          {
            "address": "preprod-node.world.dev.cardano.org",
            "port": 30000
          }
        ],
        "advertise": false
      }
    }
  ],
  "useLedgerAfterSlot": 4642000
}
```
Save and close the topology.json file.

* `useLedgerAfterSlot` indicates after which slot peers should be fetched from the ledger. A negative value will disable fetching peers from the ledger, and you will need to manually add peers to the topology file.
* `valency` is the number of connections that your node should establish towards a specific group. If you have one IP in `localRoots`, then it should be 1; if you have one DNS name with two IPs behind it, then it should be 2; or if you have two IPs/DNS names with single IP behind each, then it should also be 2, and so on.
* `localRoots` are for peers which the node should always have as hot connections, such as your BP or your other relays.
* `publicRoots` represent a source of fallback peers, a source of peers to be used if peers from the ledger (`useLedgerAfterSlot`) are disabled or unavailable.
* You can tell the node that the topology configuration file has changed by sending a SIGHUP signal to the cardano-node process, e.g. `pkill -HUP cardano-node`. After receiving the signal, cardano-node will re-read the file and restart all DNS resolution. Please note that this only applies to the topology configuration file!

## Creating Startup Scripts and Services

To run an instance of Cardano Node, we create a bash script and configure the options. Additionally, we create a systemd service to start the node which ensures that in case of system reboot or crashes, the Cardano Node starts again automatically.

First, switch to the directory containing configuration files
```
cd $HOME/cardano-testnet
```

Now create the start script startTestNode.sh
```
nano startTestNode.sh
```

:::note
Replace <$HOME> with local values of the `$HOME` environment variable on each machine. To find those values, run `echo $HOME`.
:::

copy the following in the file
```
#!/bin/bash
# Set a variable to indicate the port where the Cardano Node listens
PORT=6000
# Set a variable to indicate the local IP address of the computer where Cardano Node runs
# 0.0.0.0 listens on all local IP addresses for the computer
HOSTADDR=0.0.0.0
# Set a variable to indicate the file path to your topology file
TOPOLOGY=<$HOME>/cardano-testnet/topology.json
# Set a variable to indicate the folder where Cardano Node stores blockchain data
DB_PATH=<$HOME>/cardano-testnet/db
# Set a variable to indicate the path to the Cardano Node socket for Inter-process communication (IPC)
SOCKET_PATH=<$HOME>/cardano-testnet/db/socket
# Set a variable to indicate the file path to your main Cardano Node configuration file
CONFIG=<$HOME>/cardano-testnet/config.json
#
# Run Cardano Node using the options that you set using variables
#
/usr/local/bin/cardano-node run --topology ${TOPOLOGY} --database-path ${DB_PATH} --socket-path ${SOCKET_PATH} --host-addr ${HOSTADDR} --port ${PORT} --config ${CONFIG}
```

:::note

For a detailed understanding of all the configuration parameters, please refer to [Running cardano-node](docs/get-started/cardano-node/running-cardano.md#cardano-node-parameters)

:::

Save and close the startTestNode.sh file.

To set execute permissions for the startTestNode.sh file, type:

    chmod +x $HOME/cardano-testnet/startTestNode.sh

To create the folder where Cardano Node stores blockchain data, type:

    mkdir $HOME/cardano-testnet/db

To run Cardano Node as a service, use nano to create a file named cardano-testnode.service and then add the following contents to the file.

:::note

Replace <$USER> and  <$HOME> with their values of the environment variable. To find the values use following commands:

    echo $USER
    echo $HOME

:::

```
[Unit]
Description       = Cardano TestNode Service
Wants             = network-online.target
After             = network-online.target

[Service]
User              = <$USER>
Type              = simple
WorkingDirectory  = <$HOME>/cardano-testnet
ExecStart         = /bin/bash -c '<$HOME>/cardano-testnet/startTestNode.sh'
ExecReload        = pkill -HUP cardano-node
KillSignal        = SIGINT
RestartKillSignal = SIGINT
TimeoutStopSec    = 300
LimitNOFILE       = 32768
Restart           = always
RestartSec        = 5
SyslogIdentifier  = cardano-testnode

[Install]
WantedBy          = multi-user.target
```

Save and close the cardano-testnode.service file.

To move the cardano-node.service file to the folder /etc/systemd/system and set file permissions, type:

    sudo mv $HOME/cardano-testnet/cardano-testnode.service /etc/systemd/system/cardano-testnode.service
    sudo chmod 644 /etc/systemd/system/cardano-testnode.service

## Launching Cardano Relay Node

To start Cardano Node as a service when the computer boots, type:

    sudo systemctl daemon-reload
    sudo systemctl enable cardano-testnode.service

Now the relay node is ready to start

    sudo systemctl reload-or-restart cardano-testnode

If you have everything set correctly, you should see something like this on using the command `journalctl --unit=cardano-node --follow`:

```
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.protocol:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] Byron; Shelley
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.version:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 1.35.4
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.commit:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] ebc7be471b30e5931b35f9bbc236d21c375b91bb
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.nodeStartTime:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 2022-12-01 14:31:40.958841061 UTC
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.systemStartTime:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 2022-06-01 00:00:00 UTC
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotLengthByron:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 20s
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.epochLengthByron:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 21600
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotLengthShelley:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 1s
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.epochLengthShelley:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 432000
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotsPerKESPeriodShelley:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 129600
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotLengthAllegra:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 1s
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.epochLengthAllegra:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 432000
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotsPerKESPeriodAllegra:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 129600
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotLengthMary:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 1s
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.epochLengthMary:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 432000
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotsPerKESPeriodMary:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 129600
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotLengthAlonzo:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 1s
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.epochLengthAlonzo:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 432000
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotsPerKESPeriodAlonzo:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 129600
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotLengthBabbage:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 1s
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.epochLengthBabbage:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 432000
Dec  1 15:31:40 localhost cardano-testnode[162851]: #033[35m[localhos:cardano.node.basicInfo.slotsPerKESPeriodBabbage:Notice:5]#033[0m [2022-12-01 14:31:40.95 UTC] 129600
```

Syncing the blockchain from zero can take a while. Please be patient. If you want to stop syncing, you can do so using the command `sudo systemctl stop cardano-node`. Restarting the relay node will resume syncing the blockchain.

## Reloading the Topology configuration

In case you have made an update to `topology.json` file, since this node is assumed to be running in P2P mode - you can can load these changes without having to perform a full node restart using command below:

    sudo systemctl reload cardano-node
