---
id: topology
title: Topology
sidebar_label: Topology
sidebar_position: 5
description: Overview and configuration of cardano-node topology and peer discovery.
keywords: [Get-started, run the node, installation, networking, p2p, peer to peer, cardano-node, cardano node]
---

The topology file tells `cardano-node` where to find peers. It specifies local roots (peers to always stay connected to), a syncing strategy (bootstrap peers or a Genesis snapshot), public roots as fallbacks, and when to switch to ledger-based peer discovery.

## Topology file reference

A complete topology file for mainnet using bootstrap peers (Praos mode, recommended):

```json
{
  "localRoots": [
    {
      "accessPoints": [
        { "address": "x.x.x.x", "port": 3001 }
      ],
      "advertise": false,
      "hotValency": 1,
      "warmValency": 2,
      "trustable": false,
      "behindFirewall": false,
      "diffusionMode": "InitiatorAndResponder"
    }
  ],
  "bootstrapPeers": [
    { "address": "backbone.cardano.iog.io",               "port": 3001 },
    { "address": "backbone.mainnet.emurgornd.com",         "port": 3001 },
    { "address": "backbone.mainnet.cardanofoundation.org", "port": 3001 }
  ],
  "publicRoots": [
    {
      "accessPoints": [
        { "address": "y.y.y.y", "port": 3002 }
      ],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 128908821
}
```

For Genesis mode, replace `bootstrapPeers` with `peerSnapshotFile` — see [Ouroboros Genesis](#ouroboros-genesis) below.

### Local roots

Local roots are peers the node **always** keeps as hot or warm connections — typically your own relays (for the block producer) or your block producer (for relays). These connections are private and not advertised to the network.

| Field | Description |
|-------|-------------|
| `hotValency` | Number of hot (active) connections to maintain from this group. The deprecated `valency` field is an alias. |
| `warmValency` | Number of warm connections to maintain. Defaults to `hotValency`. Recommend `hotValency + 1` so there is always a ready backup for promotion. |
| `advertise` | Whether to share this peer's address via peer sharing. Set `false` for your block producer. |
| `trustable` | Marks this group as a trusted source when bootstrap peers are enabled. Default `false`. |
| `behindFirewall` | If `true`, the node will not initiate connections to these peers — they must connect in. Available since `cardano-node 10.7`. Default `false`. |
| `diffusionMode` | `"InitiatorAndResponder"` (default) or `"InitiatorOnly"`. Available since `cardano-node 10.2`. Overrides `DiffusionMode` in `config.json` for peers in this group only. |

:::tip Block producer topology
Your block producer must connect **only** to your own relays. Set `"useLedgerAfterSlot": -1` and `"bootstrapPeers": null` in its topology to disable all outbound peer discovery. Its `localRoots` should list only your relays.
:::

**Reloading topology without restarting:** send `SIGHUP` to the node process:

```bash
pkill -HUP cardano-node
```

This re-reads the topology file, restarts DNS resolution, and re-fetches block forging credential paths. If credential files are missing after the reload, block forging is disabled until the files are present.

### Ledger peers and public roots

`useLedgerAfterSlot` controls when the node switches to discovering peers from the ledger stake distribution. Before that slot it uses `publicRoots` (or `bootstrapPeers`, if configured). Set to `-1` to disable ledger peer discovery entirely.

`publicRoots` are fallback peers used before `useLedgerAfterSlot` is reached or when ledger peers are unavailable.

**Big ledger peers** are the subset of ledger peers whose pools collectively hold 90% of total stake. They are used preferentially during Genesis sync due to their stronger economic incentive to remain honest.

## Syncing strategy

### Bootstrap peers — Praos mode (recommended for mainnet)

Praos is the default consensus mode. In Praos mode, the node uses a fixed list of trusted relays from the founding organizations to sync before it has enough chain state to discover peers from the ledger on its own. This is the `bootstrapPeers` list.

```json
"bootstrapPeers": [
  { "address": "backbone.cardano.iog.io",               "port": 3001 },
  { "address": "backbone.mainnet.emurgornd.com",         "port": 3001 },
  { "address": "backbone.mainnet.cardanofoundation.org", "port": 3001 }
]
```

Set `"bootstrapPeers": null` to disable. When enabled, the node requires at least one trustable peer source — either a non-empty `bootstrapPeers` list or a local root group with `"trustable": true` — or it will refuse to start.

The node traces two sync states:

- **`TooOld`** — the node's chain is more than 20 minutes behind. The node disconnects from all non-trusted peers and syncs only from bootstrap peers and trustable local roots.
- **`YoungEnough`** — the node is caught up and connects to the wider network normally.

### Ouroboros Genesis — trustless sync (experimental) {#ouroboros-genesis}

Ouroboros Genesis is a trustless syncing protocol that supersedes bootstrap peers. It is available as an experimental feature from `cardano-node 10.2`, disabled by default, and is expected to become the mainnet default in a future release.

To enable Genesis mode, set in `config.json`:

```json
"ConsensusMode": "GenesisMode"
```

Genesis mode is incompatible with bootstrap peers. When enabled it overrides the `bootstrapPeers` setting. Replace `bootstrapPeers` in your topology with a peer snapshot file:

```json
"peerSnapshotFile": "path/to/big-ledger-peer-snapshot.json"
```

Generate a snapshot from a fully synced node:

```bash
cardano-cli query ledger-peer-snapshot --out-file big-ledger-peer-snapshot.json
```

The snapshot contains big ledger peers at a specific slot. The node ignores the file once its own ledger state is more recent, so it is not strictly required for ongoing operation — but it should be refreshed periodically as part of regular maintenance.

:::warning Genesis bug in 10.2–10.4
A bug in releases 10.2, 10.3, and 10.4 makes caught-up nodes susceptible to an eclipse attack when Genesis mode is enabled. If you are running one of those versions with Genesis enabled, disable Genesis (`ConsensusMode: PraosMode` or remove the field) and restart once the node finishes syncing.
:::

## Peer connection targets

Peer targets are set in `config.json`, not in the topology file. The defaults are:

```json
{
  "TargetNumberOfRootPeers": 60,
  "TargetNumberOfActivePeers": 15,
  "TargetNumberOfEstablishedPeers": 40,
  "TargetNumberOfKnownPeers": 85,
  "TargetNumberOfActiveBigLedgerPeers": 5,
  "TargetNumberOfEstablishedBigLedgerPeers": 10,
  "TargetNumberOfKnownBigLedgerPeers": 15
}
```

These **deadline targets** apply when the node considers itself caught up. In Praos mode they are always in effect; in Genesis mode they apply once the node has synced.

**Constraint:** `known >= established >= active >= 0` must hold for both the regular and big-ledger sets, or the node will fail to start.

| Target | Description |
|--------|-------------|
| `TargetNumberOfActivePeers` | Hot connections to local roots, ledger/public root peers, and peer-sharing peers (excludes big ledger peers). Should be at least the number of hot local roots configured in the topology file. |
| `TargetNumberOfEstablishedPeers` | Warm + hot connections (same peer set as above). |
| `TargetNumberOfKnownPeers` | Cold + warm + hot connections (same peer set). |
| `TargetNumberOfActive/Established/KnownBigLedgerPeers` | Same three tiers, but for big ledger peers specifically. |
| `TargetNumberOfRootPeers` | Minimum known peers filled from local roots and ledger/public roots before peer sharing is used to fill the rest. |

When using bootstrap peers, all targets must be large enough to accommodate the full bootstrap peer list.

### Peer sharing

Peer sharing lets nodes exchange peer addresses with each other, helping the network self-heal and fill peer slots without relying solely on ledger-registered nodes.

Enable it in `config.json`:

```json
"PeerSharing": true
```

Peer sharing has two levels of permission before an address is disclosed:

- **Node level** — `PeerSharing: true` must be set, or the node will not respond to peer requests at all.
- **Per-peer level** — `advertise: true` must be set on a local root entry for that peer's address to be shareable. The remote node must also consent during the handshake.

Both conditions must hold for an address to be shared. Set `advertise: false` for your block producer and any private infrastructure.

:::note
Peer sharing is an organic discovery mechanism on top of ledger peers and local roots — it is not a replacement for them. If your node has spare peer capacity after filling ledger and root peers, peer sharing fills the remainder up to `TargetNumberOfKnownPeers`.
:::

For good block propagation, relays benefit from connections to peers distributed globally. Consider [arranging reciprocal local root connections](https://forum.cardano.org/c/staking-delegation/156) with operators in under-represented regions (South America, Asia Pacific). Do **not** mark these peers as `trustable` — that designation is only for your own infrastructure.

### Genesis sync targets

These apply automatically in Genesis mode when the local ledger state is detected to be out of date:

```json
{
  "SyncTargetNumberOfActivePeers": 0,
  "SyncTargetNumberOfActiveBigLedgerPeers": 30,
  "SyncTargetNumberOfEstablishedBigLedgerPeers": 50,
  "SyncTargetNumberOfKnownBigLedgerPeers": 100,
  "MinBigLedgerPeersForTrustedState": 5
}
```

During sync, the node bulk-downloads and validates blocks from big ledger peers. `SyncTargetNumberOfActiveBigLedgerPeers` should not be a small number — Ouroboros Genesis guarantees convergence to the honest chain as long as at least one active peer is honest. If active big ledger peers drop below `MinBigLedgerPeersForTrustedState`, the node pauses until enough connections are re-established.

The sync targets must independently satisfy `known >= established >= active >= 0`. Additionally, `SyncTargetNumberOfActivePeers` must not exceed `TargetNumberOfEstablishedPeers` from the deadline set.

Once the node deems itself caught up, it transitions back to the deadline targets.
