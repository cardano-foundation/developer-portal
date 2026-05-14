---
id: running-cardano
title: How to run cardano-node
sidebar_position: 3
description: This guide will explain and show you how to run the cardano-node and components on your system.
image: /img/og/og-getstarted-running-cardano-node.png
---
This guide covers running `cardano-node` as a passive (non-block-producing) node and querying the chain with `cardano-cli`. If you haven't installed the node yet, see [Installing cardano-node](/docs/get-started/infrastructure/node/installing-cardano-node) first. For running a stake pool, see [Stake Pool Operation](/docs/operate-a-stake-pool/).

## Networks and configuration files

Cardano runs on three public networks. See [Networks](/docs/get-started/networks/overview) for a full description of each. Download the configuration files for the network you want to run:

**Mainnet** (NetworkMagic: `764824073`)
```bash
curl -O -J "https://book.play.dev.cardano.org/environments/mainnet/{config,db-sync-config,submit-api-config,topology,byron-genesis,shelley-genesis,alonzo-genesis,conway-genesis,checkpoints}.json"
```

**Preprod testnet** (NetworkMagic: `1`)
```bash
curl -O -J "https://book.play.dev.cardano.org/environments/preprod/{config,db-sync-config,submit-api-config,topology,byron-genesis,shelley-genesis,alonzo-genesis,conway-genesis}.json"
```

**Preview testnet** (NetworkMagic: `2`)
```bash
curl -O -J "https://book.play.dev.cardano.org/environments/preview/{config,db-sync-config,submit-api-config,topology,byron-genesis,shelley-genesis,alonzo-genesis,conway-genesis}.json"
```

All current environment configurations are listed at [book.play.dev.cardano.org/environments.html](https://book.play.dev.cardano.org/environments.html).

## Bootstrap with Mithril

Syncing from genesis takes over 24 hours on mainnet. [Mithril](https://mithril.network/doc/) provides stake-certified snapshots that get a node synced in under 30 minutes. For the full guide see [Bootstrap a Cardano node](https://mithril.network/doc/manual/getting-started/bootstrap-cardano-node) in the Mithril documentation.

Install the Mithril client:

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://raw.githubusercontent.com/input-output-hk/mithril/refs/heads/main/mithril-install.sh \
  | sh -s -- -c mithril-client -d latest -p $HOME/.local/bin
```

Set environment variables for mainnet (see [network configurations](https://mithril.network/doc/manual/getting-started/network-configurations) for preprod/preview):

```bash
export CARDANO_NETWORK=mainnet
export AGGREGATOR_ENDPOINT=https://aggregator.release-mainnet.api.mithril.network/aggregator
export GENESIS_VERIFICATION_KEY=$(wget -q -O - \
  https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-mainnet/genesis.vkey)
export ANCILLARY_VERIFICATION_KEY=$(wget -q -O - \
  https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-mainnet/ancillary.vkey)
```

Download and verify the snapshot:

```bash
mithril-client cardano-db download latest --include-ancillary
```

This unpacks a certified database into `db/`. Point `--database-path` at it when starting the node and it will sync only the few minutes of blocks produced since the snapshot.

## Running the node

Create a directory for your chosen network and put the configuration files there:

```bash
mkdir -p $HOME/cardano/mainnet/db
cd $HOME/cardano/mainnet
# download config files here (see Networks section above)
```

```
$HOME/cardano/mainnet/
├── db/
├── config.json
├── topology.json
├── byron-genesis.json
├── shelley-genesis.json
├── alonzo-genesis.json
└── conway-genesis.json
```

Start the node:

```bash
cardano-node run \
  --config $HOME/cardano/mainnet/config.json \
  --database-path $HOME/cardano/mainnet/db \
  --socket-path $HOME/cardano/mainnet/db/node.socket \
  --host-addr 0.0.0.0 \
  --port 3001 \
  --topology $HOME/cardano/mainnet/topology.json
```

| Flag | Description |
|------|-------------|
| `--config` | Main config file; references the genesis files in the same directory |
| `--database-path` | Directory where chain data is stored |
| `--socket-path` | Unix socket for IPC with `cardano-cli`, wallets, and other tools |
| `--host-addr` | IP to listen on; `0.0.0.0` accepts connections on all interfaces |
| `--port` | Port to listen on (3001 is conventional) |
| `--topology` | Peer topology file |

For the full list of options run `cardano-node run --help`.

Block producers can pass `--start-as-non-producing-node` alongside their credential flags to start without minting blocks immediately. Sending `SIGHUP` later (`pkill -HUP cardano-node`) triggers the node to read the credential files and begin forging. This is useful for bringing up a standby block producer safely before cutting over to it.

## Running as a systemd service

For production use, run `cardano-node` under systemd so it restarts automatically on failure or reboot.

Create a dedicated system user and directories:

```bash
sudo useradd -r -m -d /var/lib/cardano -s /sbin/nologin cardano
sudo mkdir -p /etc/cardano /var/lib/cardano/db
sudo cp config.json topology.json *-genesis.json /etc/cardano/
sudo chown -R cardano:cardano /etc/cardano /var/lib/cardano
```

If you will be receiving credentials (KES key, VRF key, op cert) encrypted with [age](https://github.com/FiloSottile/age), generate the server's key pair now and keep the public key handy for your air-gapped machine:

```bash
sudo install -d -m 700 /root/.age
sudo age-keygen -o /root/.age/key.txt   # public key is printed to stdout — copy it
```

Create `/etc/systemd/system/cardano-node.service`. The `[Unit]`, `[Service]` boilerplate, and `[Install]` section are the same for both roles — only `ExecStart` differs:

<details>
<summary><strong>Relay node</strong></summary>

See [Relay Configuration](/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration) for the topology file.

```ini
[Unit]
Description=Cardano Node
Wants=network-online.target
After=network-online.target

[Service]
User=cardano
Group=cardano
Type=simple
WorkingDirectory=/var/lib/cardano
ExecStart=/usr/local/bin/cardano-node run \
  --config        /etc/cardano/config.json \
  --topology      /etc/cardano/topology.json \
  --database-path /var/lib/cardano/db \
  --socket-path   /run/cardano/node.socket \
  --host-addr     0.0.0.0 \
  --port          3001
ExecReload=pkill -HUP cardano-node
KillSignal=SIGINT
RestartKillSignal=SIGINT
TimeoutStopSec=300
LimitNOFILE=131072
Restart=always
RestartSec=5
SyslogIdentifier=cardano-node
RuntimeDirectory=cardano
RuntimeDirectoryMode=0750

[Install]
WantedBy=multi-user.target
```

</details>

<details>
<summary><strong>Block producer</strong></summary>

Complete [Key Generation](/docs/operate-a-stake-pool/block-producer/block-producer-keys) and [Deployment](/docs/operate-a-stake-pool/block-producer/deployment) first to generate and transfer credentials. See [Deployment](/docs/operate-a-stake-pool/block-producer/deployment) for the block producer topology file.

```ini
[Unit]
Description=Cardano Node
Wants=network-online.target
After=network-online.target

[Service]
User=cardano
Group=cardano
Type=simple
WorkingDirectory=/var/lib/cardano
ExecStart=/usr/local/bin/cardano-node run \
  --config        /etc/cardano/config.json \
  --topology      /etc/cardano/topology.json \
  --database-path /var/lib/cardano/db \
  --socket-path   /run/cardano/node.socket \
  --host-addr     0.0.0.0 \
  --port          6000 \
  --shelley-kes-key                 /run/secrets/kes.skey \
  --shelley-vrf-key                 /run/secrets/vrf.skey \
  --shelley-operational-certificate /run/secrets/node.cert
ExecReload=pkill -HUP cardano-node
KillSignal=SIGINT
RestartKillSignal=SIGINT
TimeoutStopSec=300
LimitNOFILE=131072
Restart=always
RestartSec=5
SyslogIdentifier=cardano-node
RuntimeDirectory=cardano
RuntimeDirectoryMode=0750

[Install]
WantedBy=multi-user.target
```

To start without forging blocks immediately (useful when cutting over a standby node), add `--start-as-non-producing-node` to the `ExecStart` line and send `SIGHUP` when ready to activate: `pkill -HUP cardano-node`.

If using the KES agent, replace `--shelley-kes-key /run/secrets/kes.skey` with `--shelley-kes-agent-socket /run/kes-agent/service.socket`.

</details>

`RuntimeDirectory=cardano` creates `/run/cardano` at startup and cleans it up on stop, so the socket path is always valid.

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cardano-node.service
```

To allow your own user to query the node via the socket, add yourself to the `cardano` group:

```bash
sudo usermod -aG cardano $USER   # log out and back in to pick up the group
export CARDANO_NODE_SOCKET_PATH=/run/cardano/node.socket
```

## Querying the node

`cardano-cli` and other tools locate the node socket via `CARDANO_NODE_SOCKET_PATH`. Setting `CARDANO_NODE_NETWORK_ID` removes the need to pass `--mainnet` or `--testnet-magic` on every command — it handles both mainnet and testnet magic automatically. Add both to your shell profile:

```bash
export CARDANO_NODE_SOCKET_PATH=/run/cardano/node.socket   # adjust if not using the systemd setup above
export CARDANO_NODE_NETWORK_ID=mainnet                     # or 1 for preprod, 2 for preview
```

Query the current chain tip to verify the node is running and check sync progress:

```bash
cardano-cli query tip
```

```json
{
    "block": 11142430,
    "epoch": 574,
    "era": "Conway",
    "hash": "a9e4413a38aaec6ef89f8a687a58acd01a7e73675d79e9f418f6c41d2e2a7b53",
    "slot": 49630712,
    "syncProgress": "100.00"
}
```

:::important
Do not submit transactions until `syncProgress` is `"100.00"`.
:::

Cross-reference the block number against a [public explorer](/docs/get-started/networks/explorers).

<details>
<summary><strong>Advanced — RTS options</strong></summary>

`cardano-node` is a Haskell program and exposes the GHC runtime system (RTS) for tuning. The IOG-released binaries ship with these defaults compiled in:

```
-T -I0 -A16m -N2 --disable-delayed-os-memory-return
```

| Flag | Effect |
|------|--------|
| `-T` | Collect GC statistics (accessible via `GHC.Stats`; no output by itself) |
| `-I0` | Disable idle GC |
| `-A16m` | Allocation area size for the generational GC |
| `-N2` | Use 2 OS threads for parallel execution |
| `--disable-delayed-os-memory-return` | Return memory to the OS immediately, so RSS in `top`/`htop` reflects actual usage |

You can extend or override these at runtime by appending `+RTS ... -RTS` to the node command:

```bash
cardano-node run +RTS -N4 -A64m -RTS \
  --config /etc/cardano/config.json \
  ...
```

Runtime-supplied flags are merged with the compiled-in defaults; where they conflict, the runtime flag wins.

**Practical notes for stake pool operators:**

- `-N` should not exceed the number of physical cores available to the node process. On a dedicated 4-core machine, `-N4` is reasonable; going higher adds scheduler overhead without benefit.
- Increasing `-A` (e.g. `-A64m`) reduces GC frequency at the cost of higher peak memory. Useful on machines with ample RAM.
- The non-moving GC (`--nonmoving-gc`) can reduce GC pause times at the cost of higher overall memory use. Worth testing on machines with 32 GB+ RAM.

For the full list of available flags run `cardano-node +RTS -? -RTS`, or see the [GHC RTS documentation](https://downloads.haskell.org/ghc/latest/docs/users_guide/runtime_control.html).

</details>
