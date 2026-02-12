---
id: topology
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


* _bootstrap peers_: trusted set of peers, only used for syncing.  Optionally starting with
  `cardano-node-10.2`, the operator has the alternative to use Ouroboros Genesis instead.


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
        "behindFirewall": false,
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
  "peerSnapshotFile": "path/to/big-ledger-peer-snapshot.json"
}
```

### Local Roots

* `LocalRoots` are designed for peers that the node **should always keep as hot or warm**, such as its own block producer or fulfill arranged agreements with other SPOs.

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

* The `behindFirewall` is an optional field.
  If activated, the node will not attempt to initiate outbound connections to the specified peers.
  Instead, it will wait for the peers behind a firewall to establish the connection.
  The option is available since `cardano-node-10.7`.

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

Bootstrap Peers is an interim solution to facilitate syncing client nodes in a P2P environment from a pool of dedicated relays belonging to the original founding organizations of the Cardano blockchain. These relays have a priviledged trusted status within the ecosystem until full decentralization is achieved following a successful rollout of the Ouroboros Genesis protocol.

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

- `TraceLedgerStateJudgmentChanged {TooOld,YoungEnough}`: If it has changed to any of these states.

  - `TooOld` state means that the information the node is getting from its peers is outdated and behind at least 20 min.
    This means there's something wrong, and the node should only connect to trusted peers (trusted peers are bootstrap peers and trustable local root peers) to sync.

  - The `YoungEnough` state means the node is caught up and connects to non-trusted peers.

- `TraceOnlyBootstrap`: Once the node transitions to `TooOld,` the node will disconnect from all non-trusted peers and reconnect only to trusted ones in order to sync from trusted sources.
  This tracing message means that the node has successfully purged all non-trusted connections and is only going to connect to trusted peers.

### [Ouroboros Genesis](https://iohk.io/en/blog/posts/2024/05/08/ouroboros-genesis-design-update/)

Ouroboros Genesis is the upcoming consensus mechanism of trustless syncing in a meaningfully decentralized and permissionless P2P environment which is expected to supersede bootstrap peers described in the previous section. In general, it is the successor to Ouroboros Praos with which it is backwards compatible, and externally indistinguishable from in terms of behavior when the node is synced up (**WARNING**: a bug in Genesis as of the 10.2, 10.3, and 10.4 releases makes caught-up nodes susceptible to a kind of eclipse attack; intrepid users experimenting with Genesis should disable it and restart their node once it finishes syncing). Ouroboros Genesis is included as an experimental feature starting with `cardano-node 10.2`, and at the time of this writing it is disabled by default - refer to config.json file section below on instructions how to enable this by toggling a feature flag. Until Ouroboros Genesis is officially adopted by the community following a rollout period, one can configure the node to either use it or fall back on the bootstrap peers mechanism. However, if Genesis mode is enabled, it is incompatible with bootstrap peers and will disable the latter by overriding the configuration, and emit a trace of such occurrence to inform the operator to update the topology file. From the perspective of the topology file, a new entry must be added especially if a node is starting to sync from a blank or some arbitrary but significantly out-of-date state:

`"peerSnapshotFile": "path/to/snapshot.json"`

The file contains a snapshot of so-called big ledger peers which are the relays belonging to the largest pools, by staked ADA, registered on the ledger which cumulatively hold 90% of the total stake at some arbitrary slot number. By virtue of the value of their stake, indicating a level of vested interest in sustaining the network, they are postulated to be a proxy for honest ledger state and therefore moderate exposure to eclipse/sybil attacks. These stake pools need not be priviledged or authoritative in any sense beyond their total delegated stake, nor even necessarily be members of the founding entities. When syncing in this mode, these peers are sampled and connected with to jump-start the process. Such a snapshot file can be created manually apriori with cardano-cli from, ideally, a synced node, and may be signed and distributed with a node release in the future. Once provided, this file remains static while a node is running. The relevant cli command to manually generate a snapshot is `cardano-cli query ledger-peer-snapshot --out-file *arbitrary-file-name*`. Finally, the node will ignore this file if it's own ledger state is more recent and hence it is not strictly necessary for ongoing operation. It is however recommended to periodically update the snapshot, manually or from a latest release, as part of regular maintenance schedule.

### Configuring the node to use P2P

The `cardano-node`'s P2P configuration has a variety of options relating to how many connections are to be initiated, and conversely how many incoming connections can be accepted and it is vital to understand what this actually means in practice to operate a well-configured stake pool, but the provided defaults described below do provide a sensible starting point. The smallest practical network in principle is that between two hosts, and if drawn on paper, the two nodes as points, as a simplification the link between them can be viewed as a single concept when considering the network as a whole. However, to understand the P2P network at a lower level that is useful to us as relay operators, it is crucial to be aware that logically a connection should be split into a pair - its outbound and inbound legs - from *each* peer to the other most generally. An outbound from a peer/node/host is the inbound as seen from the other side, and vice versa. At any time, a node can maintain an outbound connection to its upstream peer that is not reciprocated. In such situation, the node initiating the outbound connection is the initiator, and it's upstream node is the responder. Even though the underlying TCP bearer supports bidirectional communication, in this scenario the logical communication is inherently one way where the initiator typically queries the responder, whom provides the requested information. At any time, the responder can decide to initiate its own outbound connection back to its previously downstream-only client, and in this case each one runs its initiator and responder mechanisms independently over a single channel/TCP bearer to conserve system resources. The queries from the initiator of one are served by the responder of the other side - but each side can now query the other at its own pace to get the information it wants. Furthermore in this duplex state, the original initiator can at any time decide to close its outbound leg to the other side, at which point it is now the original responder side that is merely in initiator-only mode, and the original initiator is just the responder. It is only when neither side wants to maintain an initiator/outbound leg to the other for querying that the connection is torn down and system resources are released.

You can enable P2P from the configuration file; the field `EnableP2P` can be set to either `false` or `true`. When setting it to `true`, you will also need to configure the target number of _active_, _established_ and _known_ peers, together with the target number of _root_ peers.  These values control the number of outbound/initiator connections the node will try to maintain in the appropriate mode to what are collectively named our upstream peers. This is important for the node as blocks are downloaded strictly from these peers and we want to maintain sufficiently many outbound connections to both:
- ensure we remain on the current network blockchain tip in a timely fashion to avoid short forks causing height battles and potentially losing rewards
- to harden ourselves from potential eclipse attacks in the presence of adversarial actors and adopting their dishonest chain
These network delays and timeliness issues arise naturally due to traffic congestion and physical limits and so all the node can do is provide mechanisms to manage them.

Importantly, blocks that the node is itself serving on demand, which we ourselves have minted or are ones we relay from *our* upstream peers, or the transactions it is requesting are determined by its downstream clients on which these peer target values have no bearing on. There isn't any fine-grained way to control theses connection modes for our incoming downstream/client peers, ie. the nodes that have our node as its upstream/responder peer. It is these clients that decide for themselves if our node is either in established or active mode from their initiator perspective, but this does also impact on our resource usage, such as processor utilization, bandwidth consumption, memory footprint, or file descriptor usage. The last item is subtle and easy to overlook - the cardano-node implementation is carefully designed around minimizing file descriptor usage, but it is a limited global resource which other unrelated processes running on the host consume. Running out of file descriptors may make the node unresponsive and essentially appear stuck, requiring a manual intervention. Regardless, these are general points that apply to all software applications, and in particular to this or other blockchain node implementations.

That said, there are global configurable connection limits which govern in the aggregate how many peers we are connected with before we start refusing any more connections to avoid overloading and impairing our performance. Some careful consideration must be given prior to lowering this limit manually when a particular performance metric is a concern, as at some point at the other extreme our block propagation times will suffer, which is a crucial characteristic when engaging in block production. In other words, to reap rewards, we want to have a good variety of these downstream peers dispersed around the globe such that our blocks propagate quickly to and via them such that they are adopted by the whole network as fast as possible. Furthermore, exhausting the connection limit prematurely may prevent our own tooling from connecting with the node. We of course cannot force any arbitrary downstream peers on the network to initiate their outbound leg to us (ie. have them treat our node as its responder/upstream) to improve our block propagation situation, but we can help nudge the odds in our favor by selectively adding a few other relays from around the globe as our local root peers. If our relays are registered on the ledger the effect will be similar. These peer nodes, following accepting our outbound connection to them, may in turn decide, somewhat randomly, to try to establish a connection back to us (ie. the channel is ran in initiator/responder duplex mode for bidirectional queries and responses), and if link performance is satisfactory from their perspective such that *their* outbound connection is maintained with us over the long term, *our* block propagation time is expected to improve/decrease. Another good option is to reach out to some other pool operators directly, especially when operating in sparser regions such as South America or Asia Pacific and maintain a reciprocal local root connection to each other's public relays defined in the respective topology files. Such arrangements do not adversely impact blockchain security or our own perceived anonymity/independence if these acquaintances are ***not*** marked as trustable in the topology file configuration, which is a default, and in general are mutually beneficial if uptime and bandwidth are similar, or help each other's block propagation times, as well as healthy for the network as a whole if partitions were to occur by external commission, omission, or unfortunate accident outside our control.

In summary, as node operators we can specify the maximum overall number of connections we can maintain with our peers, some of which are outbound, others inbound and some of which are both. We only have a fine-grained means of controlling the number of our outbound connections to various types of peer and the mode in which they should operate. There are good reasons why the configuration is as such which is outside of the scope of this guide, but suffice to say that the complexity is not accidental but is necessary for flexibility and meeting design intent of Praos consensus protocol security guarantees which critically rely on timeliness of network communication.

The default configuration values are:

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

Collectively, these are known as the deadline targets. Prior to Ouroboros Genesis, this was the only set of static P2P targets available to the node. When Genesis mode is enabled in the configuration file, these deadline targets are in effect strictly when the node deems itself caught up to its upstream peers, and the network is awaiting for the next block to be produced and diffused.

* `TargetNumberOfActivePeers` - the target for active ledger peers (aka hot peers); includes: local roots, ledger peers / public roots, peers from peer-sharing; excludes: big ledger peers. This ordinarily should be least the number of local root peers that are specified as hot in the topology file, otherwise the number of these connections will be clamped below the expected number. However, it is not strictly a misconfiguration and the node will run in such configuration.
* `TargetNumberOfEstablishedPeers` - the target for established connections (the sum of warm & hot peers); includes: local roots roots, ledger peers / public roots, peers from peer-sharing; excludes big ledger peers. Same note as for active peers above applied here as well.
* `TargetNumberOfKnownPeers` - the target for known peers (the sum of cold, warm & hot); includes: local roots, ledger peers / public roots, peers from peer-sharing; excludes big ledger peers.

* `TargetNumberOfActiveBigLedgerPeers` - the target for active big ledger peers (aka hot big ledger peers).
* `TargetNumberOfEstablishedBigLedgerPeers` - the target for established connections with big ledger peers (the sum of warm & hot big ledger peers).
* `TargetNumberOfKnownBigLedgerPeers` - the target for known big ledger peers (the sum of cold, warm & hot big ledger peers).

* `TargetNumberOfRootPeers` - a lower limit for known local roots, ledger peers / public root peers.  Anything beyond this target will be filled by peers from peer sharing, ledger / public root peers.

Note, when using bootstrap-peers, feature the targets have to be large enough to accommodate all bootstrap peers.

**Custom targets must satisfy the property that # of known >= # of established >= # of active >= 0 otherwise the node will fail to start as it is a serious misconfiguration.**

#### Ouroboros Genesis protocol's network specific configuration

Ouroboros Genesis is disabled by default at the time of this writing. To enable it, the node configuration file must contain
* `"ConsensusMode": "GenesisMode"`
or the argument `--ConsensusMode GenesisMode` must be given on command line or script when starting up the node process.

Detailed configuration settings for Ouroboros Genesis are beyond the scope of this article; however, sensible defaults are provided and below we document the relevant networking options.
These options are available since `cardano-node-10.2` and by default their values are as shown below:

```json
{
  "SyncTargetNumberOfActivePeers": 0,
  "SyncTargetNumberOfActiveBigLedgerPeers": 30,
  "SyncTargetNumberOfEstablishedBigLedgerPeers": 50,
  "SyncTargetNumberOfKnownBigLedgerPeers": 100,
  "MinBigLedgerPeersForTrustedState": 5
}
```

Collectively, these are known as the sync targets and they are in effect automatically when the node's consensus module detects that the local ledger state is out of date vis-à-vis our upstream peers. The node then proceeds to download *and validate* blocks in bulk from some of its upstream active peers to catch up as soon as possible. As long as there is at least one honest active peer in this set, which need not be the same one(s) for the duration of the process, the Ouroboros Genesis protocol ensures that our node will successfully complete with the honest ledger state. It is important for this reason that the `SyncTargetNumberOfActiveBigLedgerPeers` is not a 'small' number. Optionally, the `SyncTargetNumberOfActivePeers` can be set such that outbound connections are also opened up to local root peers, if defined, as well as other public relays or nodes we learn about via peer sharing, if enabled. Care must be taken to ensure that these sync targets *by themselves* satisfy the inequality constraints given in the prior section, or the node will fail to start with an appropriate error message. Additionally, this latter option must not exceed `TargetNumberOfEstablishedPeers` from the *deadline* configuration set as the sole exception. Once sufficiently many blocks have been adopted and the node deems itself caught up again, the number of outbound connections will revert to the deadline set described in the previous section. If at any time during the syncing process the number of hot connections to big ledger peers drops below `MinBigLedgerPeersForTrustedState` value (which must not exceed the `SyncTargetNumberOfActivePeers` for obvious reasons), the node will pause and await until sufficiently many active outbound connections are online. This is only but one of the many safeguards in Ouroboros Genesis protocol to avoid adopting a dishonest chain during the syncing process. The blog post link in a prior section heading provides an approachable but technical deep dive for the curious operator or end user.
