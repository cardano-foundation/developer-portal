---
id: p2p
title: Topology
sidebar_label: Topology
sidebar_position: 5
description: OVerview and configiuration of P2P topology.
keywords: [Get-started, run the node, installation, networking, p2p, peer to peer, cardano-node, cardano node]
--- 

The P2P topology file specifies how to obtain the _root peers_.

* The term _local roots_ refers to a group of peer nodes with which a node will aim to maintain a specific number of active or 'hot' connections.
  These hot connections play an active role in the consensus algorithm.
  Conversely, 'warm' connections refer to those not yet actively participating in the consensus algorithm.
  Local roots should comprise local relays, a local block-producing node, and any other peers with which the node needs to maintain a connection.
  These connections are typically kept private.


* _bootstrap peers_: trusted set of peers, only used for syncing.  With
  `cardano-node-10.2` one can use _Genesis_ instead.


* _public roots_: publicly known nodes (e.g. IOG relays or ledger nodes).
  They are either read from the configuration file directly or from the chain.
  The configured ones will be used to pass a recent snapshot of peers needed before the node caches up with the recent enough chain to construct root peers by itself.

Unlike local ones, the node does not guarantee a connection with every public root.
However, by being present in the set, it gets an opportunity to establish an outbound connection with that peer.

A minimal version of this file looks like this:

```json
{
  "localRoots": [
      { "accessPoints": [
            {
              "address": "x.x.x.x",
              "port": 3001
            }
          ],
        "advertise": false,
        "valency": 1,
        "warmValency": 2,
        "trustable": true,
        "diffusionMode": "InitiatorAndResponder"
      }
  ],
  "useLedgerAfterSlot": 128908821,
  "bootstrapPeers": [
    {
      "address": "backbone.cardano.iog.io",
      "port": 3001
    },
    {
      "address": "backbone.mainnet.emurgornd.com",
      "port": 3001
    },
    {
      "address": "backbone.mainnet.cardanofoundation.org",
      "port": 3001
    }
  ],
  "publicRoots": [
    { "accessPoints": [
        {
          "address": "y.y.y.y",
          "port": 3002
        }
        ],
      "advertise": false
    }
  ]
}
```

### Local Roots

* `LocalRoots` are designed for peers that the node **should always keep as hot or warm**, such as its own block producer or fullfill aranged agreements with other SPOs.

  This means that your node will initiate contact with the node at IP `x.x.x.x` on `port 3001` and resolve the DNS domain `y.y.y.y` (provided it exists).
  It will then try to connect with at least one of the resolved IPs.


* `hotValency` tells the node the number of connections it should attempt to select from the specified group.
  When a DNS address is provided, valency determines the count of resolved IP addresses for which the node should maintain an active (hot) connection.
  Note: one can also use the deprecated now `valency` field for `hotValency`.


* `warmValency` is an optional field, similar to `hotValency`, that informs the node about the number of peers it should maintain as warm.
  This field is optional and defaults to the value set in the `valency` or `hotValency` field.
  If a value is specified for `warmValency`, it should be greater than or equal to the one defined in `hotValency`; otherwise, `hotValency` will be adjusted to match this value.
  We recommend that users set the `warmValency` value to `hotValency + 1` to ensure that at least one backup peer can be promoted to a hot connection in case of unexpected events.
  Check [this issue](https://github.com/intersectmbo/ouroboros-network/issues/4565) for more context on this `WarmValency` option.


* The `diffusionMode` is an optional field available since `cardano-node-10.2`.
  It can either be `"InitiatorAndResponder"` (the default value) or `"InitiatorOnly"` (similar to `DiffusionMode` in the configuration file).
  If `"InitiatorOnly"` is set, then all local roots in this group will negotiate initiator-only diffusion mode, e.g. the TCP connection will be used as a unidirectional connection.

  The topology setting overwrites `DiffusionMode` from the configuration file for given local root peers.
  It is meant to overwrite the diffusion mode when a node is running in `InitiatorAndResponder` mode (the default).
  The other way is also possible, but note that when the option in the configuration file is set to `InitiatorOnly`, the node will not run the accept loop.


* The `advertise` parameter instructs a node about the acceptability of sharing addresses through *peer sharing* (which we'll explain in more detail in a subsequent section).
  If a node has activated peer sharing, it can receive requests from other nodes seeking peers.
  However, it will only disclose those peers for which it has both local and remote permissions.

  Local permission corresponds to the value of the advertise parameter.
  On the other hand, 'remote permission' is tied to the `PeerSharing` value associated with the remote address, which is ascertained after the initial handshake between nodes.


* Local root groups shall be non-overlapping.


* Local roots should not be greater than the `TargetNumberOfKnownPeers`.
  If they are, they will get clamped to the limit.


* Read the next section for `trustablePeers` and `bootstrapPeers`.


Your __block-producing__ node must __ONLY__ talk to your __relay nodes__, and the relay node should talk to other relay nodes in the network.

You have the option to notify the node of any changes to the topology configuration file by sending a SIGHUP signal to the `cardano-node` process.
This can be done, for example, with the command `pkill -HUP cardano-node`.
Upon receiving the signal, the `cardano-node` will re-read the configuration file and restart all DNS resolutions.

Please be aware that this procedure is specific to the topology configuration file, not the node configuration file.
Additionally, the SIGHUP signal will prompt the system to re-read the block forging credentials file paths and attempt to fetch them to initiate block forging.
If this process fails, block forging will be disabled.
To re-enable block forging, ensure that the necessary files are present.



### Ledger Peers / Public Roots & Big Ledger Peers

The option `useLedgerAfterSlot` configures from which slot the node should start to use peers registered on the ledger.  Before the given slot, the node will use `PublicRoots`, unless `bootstrapPeers` are given (see below).
If a negative value is specified a node will not use ledger peers.
Ledger peers should be disabled for your block producing node.

Ledger peers are drawn from the ledger based on stake distribution.
Big ledger peers is a similar notion.
It is a subset of ledger peers which contains 90% of them with the largest stake.

`PublicRoots` serve as a source of fallback peers, which are used if we are before the configured `useLedgerAfterSlot` slot (please consider using `bootstrapPeers` instead or Genesis).

### Genesis lite a.k.a Bootstrap Peers

Bootstrap Peers is a pre-Genesis feature that allows a node to connect to a trustable set of peers when its chain falls behind.

Bootstrap peers can be disabled by setting `bootstrapPeers: null`.
They are enabled by providing a list of addresses.
By default, bootstrap peers are disabled.

Trustable peers comprise the bootstrap peers (see `bootstrapPeers` option in the example topology file above) and the trustable local root peers (see `trustable` option in the example topology file above).
By default, local root peers are not trustable.

For the node to be able to start and make progress when bootstrap peers are enabled, the user _must_ provide a trustable source of peers via a topology file.
This means that the node will only start if either the bootstrap peers list is non-empty or there's a local root group that is trustable.
Failing to configure the node with trustable peer sources will cause the node to crash with an exception.
*_Please note_* that if the only source of trustable peers is a DNS name, the node might be unable to make progress once in the fallback state if DNS is not providing any addresses.

With bootstrap peers enabled, the node will trace the following:

- `TraceLedgerStateJudgmentChanged {TooOld,YoungEnoug}`: If it has changed to any of these states.

  - `TooOld` state means that the information the node is getting from its peers is outdated and behind at least 20 min.
    This means there's something wrong, and the node should only connect to trusted peers (trusted peers are bootstrap peers and trustable local root peers) to sync.

  - The `YoungEnough` state means the node is caught up and connects to non-trusted peers.

- `TraceOnlyBootstrap`: Once the node transitions to `TooOld,` the node will disconnect from all non-trusted peers and reconnect only to trusted ones in order to sync from trusted sources.
  This tracing message means that the node has successfully purged all non-trusted connections and is only going to connect to trusted peers.

### Configuring the node to use P2P

You can enable P2P from the configuration file; the field `EnableP2P` can be set to either `false` or `true`. When setting it to `true`, you will also need to configure the target number of _active_, _established_ and _known_ peers, together with the target number of _root_ peers.  The default configuration values are:

```json
{
  ...
  "EnableP2P": true,

  "TargetNumberOfRootPeers": 60,

  "TargetNumberOfActivePeers": 15,
  "TargetNumberOfEstablishedPeers": 40,
  "TargetNumberOfKnownPeers": 85,

  "TargetNumberOfActiveBigLedgerPeers": 5,
  "TargetNumberOfEstablishedBigLedgerPeers": 10,
  "TargetNumberOfKnownBigLedgerPeers": 15,
}
```

* `TargetNumberOfActivePeers` - the target for active ledger peers (aka hot peers); includes: local roots, ledger peers / public roots, peers from peer-sharing; excludes: big ledger peers.
* `TargetNumberOfEstablishedPeers` - the target for established connections (the sum of warm & hot peers); includes: local roots roots, ledger peers / public roots, peers from peer-sharing; excludes big ledger peers.
* `TargetNumberOfKnownPeers` - the target for known peers (the sum of cold, warm & hot); includes: local roots, ledger peers / public roots, peers from peer-sharing; excludes big ledger peers.

* `TargetNumberOfActiveBigLedgerPeers` - the target for active big ledger peers (aka hot big ledger peers).
* `TargetNumberOfEstablishedBigLedgerPeers` - the target for established connections with big ledger peers (the sum of warm & hot big ledger peers).
* `TargetNumberOfKnownBigLedgerPeers` - the target for known big ledger peers (the sum of cold, warm & hot big ledger peers).

* `TargetNumberOfRootPeers` - a lower limit for known local roots, ledger peers / public root peers.  Anything beyoned this target will be filled by peers from peer sharing, ledger / public root peers.

Note, when using bootstrap-peers, feature the targets have to be large enough to accomodate all bootstrap peers. 

#### Genesis network specific configuration

How to enable Genesis mode is beyond this document, here we only document relevant networking options.
These options are available since `cardano-node-10.2`.

```json
{
  "SyncTargetNumberOfActivePeers": 0,
  "SyncTargetNumberOfActiveBigLedgerPeers": 30,
  "SyncTargetNumberOfEstablishedBigLedgerPeers": 50,
  "SyncTargetNumberOfKnownBigLedgerPeers": 100,
}
```

These targets overwrite the above target values.
Other targets values in sync mode, like number of established or known peers are not configurable at the moment, we use the default values listed in the previous section.
