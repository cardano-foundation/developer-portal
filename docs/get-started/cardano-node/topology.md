---
id: p2p
title: Topology
sidebar_label: Topology
sidebar_position: 5
description: OVerview and configiuration of P2P topology.
keywords: [Get-started, run the node, installation, networking, p2p, peer to peer, cardano-node, cardano node]
--- 

The P2P topology file specifies how to obtain the _root peers_.

* The term _local roots_ refers to a group of peer nodes with which a node will aim to maintain a specific number of active, or 'hot' connections.
  These hot connections are those that play an active role in the consensus algorithm.
  Conversely, 'warm' connections refer to those not yet actively participating in the consensus algorithm.
  Local roots should comprise local relays or a local block-producing node, and any other peers that the node needs to maintain a connection with.
  These connections are typically kept private.


* _public roots_: publicly known nodes (e.g. IOG relays, or ledger nodes).
  They are either read from the configuration file directly or from the chain.
  The configured ones will be used to pass a recent snapshot of peers needed before the node caches up with the recent enough chain to construct root peers by itself.

The node does not guarantee a connection with every public root, unlike local ones.
However, by being present in the set, it gets an opportunity to establish an outbound connection with that peer.

A minimal version of this file looks like this:

```json
{
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
        "trustable": true
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
  ],
  "useLedgerAfterSlot": 128908821,
}
```

* The main difference between `LocalRoots` and `PublicRoots` is the ability to specify various groups with varying valencies in the former.
  This can be valuable for informing your node about different targets within a group to achieve.
  `LocalRoots` is designed for peers that the node should always keep as hot or warm, such as its own block producer.
  On the other hand, `PublicRoots` serves as a source of fallback peers, to be used if we are before the configured `useLedgerAfterSlot` slot.


* This means that your node will initiate contact with the node at IP `x.x.x.x` on `port 3001` and resolve the DNS domain `y.y.y.y` (provided it exists).
  It will then make efforts to establish a connection with at least one of the resolved IPs.

* `hotValency` tells the node the number of connections it should attempt to select from the specified group.
  When a DNS address is provided, valency determines the count of resolved IP addresses for which the node should maintain an active (hot) connection.
  Note: one can also use the deprecated now `valency` field for `hotValency`.


- `warmValency` is an optional field, similar to `hotValency`, that informs the node about the number of peers it should maintain as warm.
  This field is optional and defaults to the value set in the `valency` or `hotValency` field.
  If a value is specified for `warmValency`, it should be greater than or equal to the one defined in `hotValency`; otherwise, or `hotValency` will be adjusted to match this value.
  We recommend users set the `warmValency` value to `hotValency + 1` to ensure at least one backup peer is available to be promoted to a hot connection in case of unexpected events.
  Check [this issue](https://github.com/intersectmbo/ouroboros-network/issues/4565) for more context on this `WarmValency` option.


* Local root groups shall be non-overlapping.

* The advertise parameter instructs a node about the acceptability of sharing its address through *peer sharing* (which we'll explain in more detail in a subsequent section).
  In essence, if a node has activated peer sharing, it can receive requests from other nodes seeking peers.
  However, it will only disclose those peers for which it has both local and remote permissions.

  Local permission corresponds to the value of the advertise parameter.
  On the other hand, 'remote permission' is tied to the `PeerSharing` value associated with the remote address, which is ascertained after the initial handshake between nodes.


* Local roots should not be greater than the `TargetNumberOfKnownPeers`.
  If they are, they will get clamped to the limit.

- For `trustablePeers` and `bootstrapPeers` read the next section.

Your __block-producing__ node must __ONLY__ talk to your __relay nodes__, and the relay node should talk to other relay nodes in the network.

You have the option to notify the node of any changes to the topology configuration file by sending a SIGHUP signal to the `cardano-node` process.
This can be done, for example, with the command `pkill -HUP cardano-node`.
Upon receiving the signal, the `cardano-node` will re-read the configuration file and restart all DNS resolutions.

Please be aware that this procedure is specific to the topology configuration file, not the node configuration file.
Additionally, the SIGHUP signal will prompt the system to re-read the block forging credentials file paths and attempt to fetch them to initiate block forging.
If this process fails, block forging will be disabled.
To re-enable block forging, ensure that the necessary files are present.

You can disable ledger peers by setting the `useLedgerAfterSlot` to a negative value.

### Genesis lite a.k.a Bootstrap Peers

Bootstrap Peers is a pre-Genesis feature that means to provide a way for a node to connect to a trustable set of peers when the its chain falls behind.

Bootstrap peers can be disabled by setting `bootstrapPeers: null`.
They are enabled by providing a list of addresses.
By default bootstrap peers are disabled.

Trustable peers are composed by the bootstrap peers (see `bootstrapPeers` option in the example topology file above) and the trustable local root peers (see `trustable` option in the example topology file above).
By default local root peers are not trustable.

In order for the node to be able to start and make progress, when bootstrap peers are enabled, the user _must_ provide a trustable source of peers via topology file.
This means that the node will only start if either the bootstrap peers list is non-empty or there's a local root group that is trustable.
Failing to configure the node with trustable peer sources will make it so that the node crashes with an exception.
*_Please note_* that if the only source of trustable peers is a DNS name, the node might not be able to make progress once in fallback state, if DNS is not providing any addresses.

With bootstrap peers enabled the node will trace:

- `TraceLedgerStateJudgmentChanged {TooOld,YoungEnoug}`: If it has changed to any of these states.

  - `TooOld` state means that the information the node is getting from its peers is outdated and behind at least 20 min.
    This means there's something wrong and that the node should only connect to trusted peers (trusted peers are bootstrap peers and trustable local root peers) in order to sync.

  - `YoungEnough` state means that the node is caught up and that it can now connect to non-trusted peers.

- `TraceOnlyBootstrap`: Once the node transitions to `TooOld` the node will disconnect from all non-trusted peers and reconnect to only trusted ones in order to sync from trusted sources only.
  This tracing message means that the node has successfully purged all non-trusted connections and is only going to connect to trusted peers.

### Configuring the node to use P2P

You can enable P2P from the configuration file, the field `EnableP2P` can be set to either `false` or `true`. When setting it to `true`, you will also need to configure the target number of _active_, _established_ and _known_ peers, together with the target number of _root_ peers, for example:

```json
{
  ...
  "EnableP2P": true,
  "TargetNumberOfActivePeers": 20,
  "TargetNumberOfEstablishedPeers": 40,
  "TargetNumberOfKnownPeers": 100,
  "TargetNumberOfRootPeers": 10,
}
```