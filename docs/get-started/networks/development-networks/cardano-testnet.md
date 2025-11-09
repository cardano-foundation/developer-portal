---
id: cardano-testnet
title: Test Custom Clusters Locally With cardano-testnet
sidebar_label: cardano-testnet
description: Test Custom Clusters Locally Using cardano-testnet
---

In the future, cardano-testnet will be available from [cardano-node GitHub Releases](https://github.com/IntersectMBO/cardano-node/releases) page. Until then, it is obtained by building [cardano-node](https://github.com/IntersectMBO/cardano-node) from source.

## Building cardano-testnet

We refer to [the instructions](https://developers.cardano.org/docs/get-started/infrastructure/node/installing-cardano-node) for building cardano-node from source. Once you are done with these instructions, run the following to build cardano-testnet.

```bash
cabal build cardano-testnet
```

This should succeed 🙂 Now, define two environment variables pointing to your `cardano-node` and `cardano-cli` executables (which you can obtain from [cardano-node's GitHub releases](https://github.com/IntersectMBO/cardano-node/releases)):

```shell
export CARDANO_CLI=path to your executable
export CARDANO_NODE=path to your executable
```

## Options for launching a local cluster

To launch a local cluster, you should use the `cardano-testnet cardano` command, whose API is as follows:

```text
Usage: cardano-testnet cardano [--num-pool-nodes COUNT]
  [--max-lovelace-supply WORD64]
  [--nodeLoggingFormat LOGGING_FORMAT]
  [--num-dreps NUMBER]
  [--enable-new-epoch-state-logging]
  [--output-dir DIRECTORY]
  [--testnet-magic INT]
  [--epoch-length SLOTS]
  [--slot-length SECONDS]
  [--active-slots-coeff DOUBLE]
  [--node-env FILEPATH]
  [--update-time]

  Start a testnet

Available options:
  --num-pool-nodes COUNT   Number of pool nodes. Note this uses a default node
                           configuration for all nodes.
  --max-lovelace-supply WORD64
                           Max lovelace supply that your testnet starts with.
                           Ignored if a custom Shelley genesis file is passed.
                           (default: 100000020000000)
  --nodeLoggingFormat LOGGING_FORMAT
                           Node logging format (json|text)
                           (default: NodeLoggingFormatAsJson)
  --num-dreps NUMBER       Number of delegate representatives (DReps) to
                           generate. Ignored if a node environment is passed.
                           (default: 3)
  --enable-new-epoch-state-logging
                           Enable new epoch state logging to
                           logs/ledger-epoch-state.log
  --output-dir DIRECTORY   Directory where to store files, sockets, and so on.
                           It is created if it doesn't exist. If unset, a
                           temporary directory is used.
  --testnet-magic INT      Specify a testnet magic id. (default: 42)
  --epoch-length SLOTS     Epoch length, in number of slots. Ignored if a node
                           environment is passed. (default: 500)
  --slot-length SECONDS    Slot length. Ignored if a node environment is passed.
                           (default: 0.1)
  --active-slots-coeff DOUBLE
                           Active slots coefficient. Ignored if a node
                           environment is passed. (default: 5.0e-2)
  --node-env FILEPATH      Path to the node's environment (which is generated
                           otherwise). You can generate a default environment
                           with the 'create-env' command, then modify it and
                           pass it with this argument.
  --update-time            Update the time stamps in genesis files to current
                           date
  -h,--help                Show this help text
```

We now go over these different options as there are many interactions between them.

### Using a custom node configuration file and custom genesis files

cardano-testnet has two behaviors, depending on whether you want to use defaults or not. You can either:

1. Default the node configuration file, the Shelley, Alonzo, Byron, and Conway genesis files, and the topology file. In this case, don't specify `--node-env`: `cardano-testnet` will take care of generating all these files.
2. Pass a pre-generated node sandbox environment using `--node-env`. This environment should be generated using the `cardano-testnet create-env` sub-command. In that case, `cardano-testnet` will not generate any configuration file. The specifics of the `create-env` sub-command are detailed below.

### The `cardano-testnet` sandbox environment

`cardano-testnet` stores all its keys (SPO, dreps, etc.), configuration files, and node data in a single directory.

If you don't specify `--output-dir`, cardano-testnet will create a fresh temporary directory to run.
If you specify `--output-dir`, cardano-testnet will use the specified directory to store the keys and the nodes' data. In this case we recommend using a fresh directory every time, otherwise there is a risk that one run poisons the other.
In addition, using your own directory makes it easier to inspect the logs after the testnet has finished, or while it is running.

The structure of the directory is as follows (using bash pseudo-syntax to avoid enumerations):

```text
├── byron-gen-command
│   └── genesis-keys.00{0,1,2}.key
├── delegate-keys
│   ├── delegate{1,2,3}
│   │   ├── kes.{skey,vkey}
│   │   ├── key.{skey,vkey}
│   │   ├── opcert.{cert,counter}
│   │   └── vrf.{skey,vkey}
│   └── README.md
├── drep-keys
│   ├── drep{1,2,3}
│   │   └── drep.{skey,vkey}
│   └── README.md
├── genesis-keys
│   ├── genesis{1,2,3}
│   │   └── key.{skey,vkey}
│   └── README.md
├── logs
│   ├── node{1,2,3}
│   │   ├── node.pid
|   |   └── {stderr,stdout}.log
│   ├── ledger-epoch-state-diffs.log
│   ├── ledger-epoch-state.log
│   ├── node-20241010121635.log
│   └── node.log -> node-20241010121635.log
├── node-data
│   ├── node{1,2,3}
│   │   ├── db
│   │   │   └── <node database files>
│   │   ├── port
│   │   └── topology.json
├── pools-keys
│   ├── pool1
│   │   ├── byron-delegate.key
│   │   ├── byron-delegation.cert
│   │   ├── cold.{skey,vkey}
│   │   ├── kes.{skey,vkey}
│   │   ├── opcert.{cert,counter}
│   │   ├── staking-reward.{skey,vkey}
│   │   └── vrf.{skey,vkey}
│   └── README.md
├── socket
│   ├── node{1,2,3}
│   │   └── sock
├── stake-delegators
│   ├── delegator{1,2,3}
│   │   ├── payment.{skey,vkey}
│   │   └── staking.{skey,vkey}
├── utxo-keys
│   ├── utxo{1,2,3}
│   │   └── utxo.{addr,skey,vkey}
│   └── README.md
├── {alonzo,byron,conway,shelley}-genesis.json
├── configuration.json
├── current-stake-pools.json
└── module
```

We draw the reader's attention to two things:

1. The nodes' logs are located in `logs/node1/`, `logs/node2/`, etc. Those are useful for debugging.
2. The genesis files are at the root of the output directory, and the topology files are in the node subdirectories. This will be relevant for the next section.

### Creating your own sandbox environment

`cardano-testnet` provides the option to create a sandbox environment as described above, without launching the node network itself. This allows the modification of configuration files, Genesis or otherwise. The API of the command is as follows:

```text
Usage: cardano-testnet create-env [--num-pool-nodes COUNT]
  [--max-lovelace-supply WORD64]
  [--nodeLoggingFormat LOGGING_FORMAT]
  [--num-dreps NUMBER]
  [--enable-new-epoch-state-logging]
  [--output-dir DIRECTORY]
  [--testnet-magic INT]
  [--epoch-length SLOTS]
  [--slot-length SECONDS]
  [--active-slots-coeff DOUBLE]
  --output DIRECTORY
  [--params-file FILEPATH | --params-mainnet]
  [--p2p-topology]

  Create a sandbox for Cardano testnet

Available options:
  --num-pool-nodes COUNT   Number of pool nodes. Note this uses a default node
                           configuration for all nodes.
  --max-lovelace-supply WORD64
                           Max lovelace supply that your testnet starts with.
                           Ignored if a custom Shelley genesis file is passed.
                           (default: 100000020000000)
  --nodeLoggingFormat LOGGING_FORMAT
                           Node logging format (json|text)
                           (default: NodeLoggingFormatAsJson)
  --num-dreps NUMBER       Number of delegate representatives (DReps) to
                           generate. Ignored if a node environment is passed.
                           (default: 3)
  --enable-new-epoch-state-logging
                           Enable new epoch state logging to
                           logs/ledger-epoch-state.log
  --output-dir DIRECTORY   Directory where to store files, sockets, and so on.
                           It is created if it doesn't exist. If unset, a
                           temporary directory is used.
  --testnet-magic INT      Specify a testnet magic id. (default: 42)
  --epoch-length SLOTS     Epoch length, in number of slots. Ignored if a node
                           environment is passed. (default: 500)
  --slot-length SECONDS    Slot length. Ignored if a node environment is passed.
                           (default: 0.1)
  --active-slots-coeff DOUBLE
                           Active slots coefficient. Ignored if a node
                           environment is passed. (default: 5.0e-2)
  --output DIRECTORY       Directory where to create the sandbox environment.
  --params-file FILEPATH   File containing custom on-chain parameters in
                           Blockfrost format:
                           https://docs.blockfrost.io/#tag/cardano--epochs/GET/epochs/latest/parameters
  --params-mainnet         Use mainnet on-chain parameters
  --p2p-topology           Use P2P topology files instead of "direct" topology
                           files
  -h,--help                Show this help text
```
If you want to run a testnet with custom parameters, we suggest the following workflow:

```bash
rm -rf env # Ensure there is no existing sandbox environment
cardano-testnet create-env --output env # Creates the sanbox environment in env/

# Modify the configuration files as you see fit

cardano-testnet cardano --node-env env --update-time # Run the testnet on the custom environment
```

Notes:
1. The `--update-time` options tells `cardano-testnet` to update the time stamps in various Genesis files. If you take too long to modify the configuration files, omitting that option will result in a failure when trying to start the testnet.
2. The following configuration files are safe for modifications:
    - `env/configuration.json`: high-level configuration options for the `cardano-testnet` binary
    - `env/{alonzo,byron,conway,shelley}-genesis.json`: the genesis files for the testnet chain.
    - `env/nodes/nodeN/topology.json`: topology files for individual nodes. Those can either be P2P topology files, or "direct" topology files, depending on the option `--p2p-topology`.

### Getting on-chain parameters from mainnet

By default, the `create-env` sub-command generates on-chain parameters at their initial value. If you want your test network to use a different set of on-chain parameters without specifying them by hand, you can use one of the following options:
1. Use `--params-file` to specify a set of on-chain parameters. The file must be formatted as a JSON response from this [Blockfrost endpoint](https://docs.blockfrost.io/#tag/cardano--epochs/GET/epochs/latest/parameters).
2. Use `--params-mainnet` to get on-chain parameters similar to the current state of mainnet. Those parameters are provisioned from [this file](https://raw.githubusercontent.com/input-output-hk/cardano-parameters/refs/heads/main/mainnet/parameters.json), which is updated every epoch (i.e. every five days).

### Era-specific flags: Shelley

There are four flags that control values specified in the Shelley genesis file:

```text
  --max-lovelace-supply WORD64
                           Max lovelace supply that your testnet starts with.
                           Ignored if a custom Shelley genesis file is passed.
                           (default: 100000020000000)
  --epoch-length SLOTS     Epoch length, in number of slots. Ignored if a node
                           environment is passed. (default: 500)
  --slot-length SECONDS    Slot length. Ignored if a node environment is passed.
                           (default: 0.1)
  --active-slots-coeff DOUBLE
                           Active slots coefficient. Ignored if a node
                           environment is passed. (default: 5.0e-2)
```

Note that all of these flags are ignored when a sandbox environment is provided

### Era-specific flags: Conway

There is one flag that control values that appear in the Conway genesis file and that's the number of dreps:

```text
  --num-dreps NUMBER       Number of delegate representatives (DReps) to
                           generate. Ignored if a node environment is passed.
                           (default: 3)
```

Like the Shelley flags, this flag is ignored if a sandbox environment is provided.

### Understanding the output of `cardano-testnet`

When you run `cardano-testnet`, you will see output similar to this:

```shell
  ✗ <interactive> failed at src/Testnet/Property/Run.hs:120:7
    after 1 test.
    shrink path: 1:

    forAll0 =
      ━━━━ File: /tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7/current-stake-pools.json ━━━━
      [
          "pool1kn846yjkzkm4pr4t853eh6xgxh03ppeedw0jme7kyp6vu3zlt2q"
      ]

    forAll1 =
      Reading file: /tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7/current-stake-pools.json
...
... lots of output
...
    forAll74 =
      /tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7

    forAll75 =
      Workspace: /tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7

    This failure can be reproduced by running:
    > recheckAt (Seed 17228010050918130971 17168952627524325549) "1:" <property>
  
Please disregard the message above implying a failure.

Testnet is running with config file /tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7/configuration.yaml
Logs of the SPO node can be found at /tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7/logs/node1/stdout.log

To interact with the testnet using cardano-cli, you might want to set:

  export CARDANO_NODE_SOCKET_PATH=/tmp/nix-shell.FKrgvC/nix-shell.JlgE9b/testnet-test-8b4770fd02d979a7/socket/node1/sock
  export CARDANO_NODE_NETWORK_ID=42

Type CTRL-C to exit.
```

You can ignore the initial `✗ <interactive> failed` log. This is an artifact from the fact that cardano-testnet relies
on a test library to run. The same applies to all `forAllX = ...` logs.

The last few lines give you the location of the config file (hence the location of the sandbox directory, if you haven't specified it), and the logs of the SPO node.

It also gives you some environment variables to export, should you want to use [cardano-cli](https://developers.cardano.org/docs/get-started/cli-operations/basic-operations/) to interact with the testnet.

Once the line `Testnet is running.  Type CTRL-C to exit.` appears, the testnet is running and building blocks.
