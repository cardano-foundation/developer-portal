---
id: cardano-testnet
title: Test Custom Clusters Locally With cardano-testnet
sidebar_label: cardano-testnet
description: Test Custom Clusters Locally Using cardano-testnet
---

In the future, cardano-testnet will be available from [cardano-node GitHub Releases](https://github.com/IntersectMBO/cardano-node/releases) page. Until then, it is obtained by building [cardano-node](https://github.com/IntersectMBO/cardano-node) from source.

## Building cardano-testnet

We refer to [the instructions](https://developers.cardano.org/docs/operate-a-stake-pool/node-operations/installing-cardano-node) for building cardano-node from source. Once you are done with these instructions, run the following to build cardano-testnet.

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
Usage: cardano-testnet cardano [--num-pool-nodes COUNT | --node-config FILEPATH]
  [ --shelley-era
  | --allegra-era
  | --mary-era
  | --alonzo-era
  | --babbage-era
  | --conway-era
  ]
  [--max-lovelace-supply WORD64]
  [--enable-p2p BOOL]
  [--nodeLoggingFormat LOGGING_FORMAT]
  [--num-dreps NUMBER]
  [--enable-new-epoch-state-logging]
  [--output-dir DIRECTORY]
  --testnet-magic INT
  [--epoch-length SLOTS]
  [--slot-length SECONDS]
  [--active-slots-coeff DOUBLE]

  Start a testnet in any era

Available options:
  --num-pool-nodes COUNT   Number of pool nodes. Note this uses a default node
                           configuration for all nodes. (default: 1)
  --node-config FILEPATH   Path to the node's configuration file (which is
                           generated otherwise). If you use this option, you
                           should also pass all the genesis files (files pointed
                           to by the fields "AlonzoGenesisFile",
                           "ShelleyGenesisFile", etc.).
  --shelley-era            Specify the Shelley era - DEPRECATED - will be
                           removed in the future
  --allegra-era            Specify the Allegra era - DEPRECATED - will be
                           removed in the future
  --mary-era               Specify the Mary era - DEPRECATED - will be removed
                           in the future
  --alonzo-era             Specify the Alonzo era - DEPRECATED - will be removed
                           in the future
  --babbage-era            Specify the Babbage era (default) - DEPRECATED - will
                           be removed in the future
  --conway-era             Specify the Conway era
  --max-lovelace-supply WORD64
                           Max lovelace supply that your testnet starts with.
                           Ignored if a custom Shelley genesis file is passed.
                           (default: 100000020000000)
  --enable-p2p BOOL        Enable P2P (default: False)
  --nodeLoggingFormat LOGGING_FORMAT
                           Node logging format (json|text)
                           (default: NodeLoggingFormatAsJson)
  --num-dreps NUMBER       Number of delegate representatives (DReps) to
                           generate. Ignored if a custom Conway genesis file is
                           passed. (default: 3)
  --enable-new-epoch-state-logging
                           Enable new epoch state logging to
                           logs/ledger-epoch-state.log
  --output-dir DIRECTORY   Directory where to store files, sockets, and so on.
                           It is created if it doesn't exist. If unset, a
                           temporary directory is used.
  --testnet-magic INT      Specify a testnet magic id.
  --epoch-length SLOTS     Epoch length, in number of slots. Ignored if a custom
                           Shelley genesis file is passed. (default: 500)
  --slot-length SECONDS    Slot length. Ignored if a custom Shelley genesis file
                           is passed. (default: 0.1)
  --active-slots-coeff DOUBLE
                           Active slots coefficient. Ignored if a custom Shelley
                           genesis file is passed. (default: 5.0e-2)
  -h,--help                Show this help text
```

We now go over these different options as there are many interactions between them.

### Using a custom node configuration file and custom genesis files

cardano-testnet has two behaviors, depending on whether you want to use defaults or not. You can either:

1. default the node configuration file and the Alonzo, Shelley, and Conway genesis files. In this case, don't specify `--node-config`: cardano-testnet will take care of generating all these files.
2. pass the node configuration file using `--node-config`. In this case, you should also specify the Alonzo, Shelley, and Conway genesis files, using the fields `AlonzoGenesisFile`, `ShelleyGenesisFile`, and `ConwayGenesisFile` from the node configuration file.

Right now, for scenario 2., there is no way to generate the node configuration file and the genesis files automatically, but this will be [made available soon](https://github.com/IntersectMBO/cardano-node/issues/6153).

### Using a custom output directory

If you don't specify `--output-dir`, cardano-testnet will create a fresh temporary directory to run.
This directory will contain both (SPO, dreps, etc.) keys as well the nodes' data. If you specify `--output-dir`,
cardano-testnet will use the specified directory to store the keys and the nodes' data. In this case we recommend using
a fresh directory every time, otherwise there is a risk that one run poisons the other.
In addition, using your own directory makes it easier to inspect the logs after the testnet has finished, or while
it is running. The structure of the directory is as follows (using bash pseudo-syntax to avoid enumerations):

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
│   │   └── {stderr,stdout}.log
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
└── current-stake-pools.json
```

We draw the reader's attention to two things:

1. The nodes' logs are located in `logs/node1/`, `logs/node2/`, etc. Those are useful for debugging.
2. The genesis files are at the root of the output directory. If you are not providing your own genesis files initially, look at the generated ones. They can be used as a starting point to craft your own genesis files.

### Era-specific flags: Shelley

There are four flags that control values specified in the Shelley genesis file:

```text
  --max-lovelace-supply WORD64
                           Max lovelace supply that your testnet starts with.
                           Ignored if a custom Shelley genesis file is passed.
                           (default: 100000020000000)
  --epoch-length SLOTS     Epoch length, in number of slots. Ignored if a custom
                           Shelley genesis file is passed. (default: 500)
  --slot-length SECONDS    Slot length. Ignored if a custom Shelley genesis file
                           is passed. (default: 0.1)
  --active-slots-coeff DOUBLE
                           Active slots coefficient. Ignored if a custom Shelley
                           genesis file is passed. (default: 5.0e-2)
```

Note that all of these flags are ignored when a node configuration file and Shelley genesis file are specified.

### Era-specific flags: Conway

There is one flag that control values that appear in the Conway genesis file and that's the number of dreps:

```text
  --num-dreps NUMBER       Number of delegate representatives (DReps) to
                           generate. Ignored if a custom Conway genesis file is
                           passed. (default: 3)
```

Like the Shelley flags, this flag is ignored if a node configuration file and a Conway genesis file are specified.

## Launching a local cluster: an example script

A typical way to launch a testnet cluster will look like this, using a Bash script:

```bash
#!/usr/bin/env bash
set -eux

TMP_DIR=$(mktemp -d)

# Install your custom configuration files (node configuration + genesis files)
cp <FROM_SOMEWHERE>/configuration.json  $TMP_DIR/.
# This assumes the AlonzoGenesisFile JSON field in the node configuration file is "alonzo-genesis.json"
# Same for Shelley and Conway
for era in shelley alonzo conway
do
  cp <FROM_SOMEWHERE>/$era-genesis.json $TMP_DIR/.
done

cabal run cardano-testnet -- cardano --node-config $TMP_DIR/configuration.json --output-dir $TMP_DIR --testnet-magic 42
```

When you execute this script, you will see output similar to this:

```shell
  ✗ <interactive> failed at src/Testnet/Property/Run.hs:89:7
    after 1 test.
    shrink path: 1:
  
    forAll0 =
      ━━━━ File: /tmp/nix-shell.iZ2TPc/tmp.ly3nO21w1e/current-stake-pools.json ━━━━
      [
          "pool1r8fuwkk3kkfekh6el0kzydrn009yqd89mrv4zpjq77wg6639ese"
      ]
    
    forAll1 =
      Reading file: /tmp/nix-shell.iZ2TPc/tmp.ly3nO21w1e/current-stake-pools.json
    
    forAll2 =
      ━━━━ command ━━━━
      /home/churlin/.local/state/cabal/store/ghc-8.10.7/cardano-cli-10.4.0.0-e-cardano-cli-3b9fee1097cc434bbca7740006a83745fcc229aa57d45fcca2712990862bc6b9/bin/cardano-cli latest query stake-pools --out-file /tmp/nix-shell.iZ2TPc/tmp.ly3nO21w1e/current-stake-pools.json
    
    forAll3 =
      /tmp/nix-shell.iZ2TPc/tmp.ly3nO21w1e/current-stake-pools.json
...
... lots of output
...
forAll75 =
      Reusing /tmp/nix-shell.iZ2TPc/tmp.ly3nO21w1e
  
    This failure can be reproduced by running:
    > recheckAt (Seed 1622863211725641548 12217359344083085813) "1:" <property>
  
Testnet is running.  Type CTRL-C to exit.
```

You can ignore the initial `✗ <interactive> failed` log. This is an artifact from the fact that cardano-testnet relies
on a test library to run. The same applies to all `forAllX = ...` logs. That being said, those logs give the location of the output directory being used: it is `/tmp/nix-shell.iZ2TPc/tmp.ly3nO21w1e/` in the log above. This can be useful if you didn't specify `--output-dir` yourself and rely on cardano-testnet's default behavior.

Once the line `Testnet is running.  Type CTRL-C to exit.` appears, the testnet is running and building blocks, and regular queries commands (for example using [cardano-cli](https://developers.cardano.org/docs/operate-a-stake-pool/cli-operations/basic-operations/)) can be executed against it.

## Stopping a local cluster

Right now, there is no built-in way to stop a running cluster (this will be improved in the future). We recommend using one of these methods to kill a running testnet:

1. Call `pidof cardano-node` and then `kill` the corresponding process.
2. Call `killall cardano-node`
