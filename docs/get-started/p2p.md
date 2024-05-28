---
id: p2p
title: Peer-to-Peer (P2P) networking
sidebar_label: Peer-to-Peer
description: OVerview and configiuration of P2P topology.
keywords: [Get-started, run the node, installation, networking, p2p, peer to peer, cardano-node, cardano node]
--- 

Through automatic peer-to-peer (P2P) mechanisms, registered nodes can discover and establish connections with one another. These nodes can create full-duplex connections, allowing them to operate simultaneously as servers and clients for the mini-protocols. Additionally, nodes can maintain specific static topologies, including their own relays and block producers, as well as trusted peers with which they wish to maintain continuous connections.

Root peers can be reloaded using the `SIGHUP` signal, eliminating the need for a restart

The node can dynamically manage the connections, each node maintains a set of peers mapped into three categories:

* **cold peers** ‒ existing (known) peers without an established network connection
* **warm peers** ‒ peers with an established bearer connection, which is only used for network measurements without implementing any of the node-to-node mini-protocols (not active)
* **hot peers** ‒ peers that have a connection, which is being used by all three node-to-node mini-protocols (active peers)

Newly discovered peers are initially added to the cold peer set, with the P2P governor responsible for managing these connections. Maintaining diversity in hop distances enhances block distribution times across the globally distributed network. If adversarial behavior is detected, the peer can be promptly demoted from the hot, warm, or cold sets.

Upstream peers are classified into three categories: known, established, and active.

![P2P](/img/cli/peer-discovery.jpeg)

### What is next?

* Peer sharing
* Ouroboros Genesis release

[Peer-to-peer (P2P) networking](https://docs.cardano.org/explore-cardano/cardano-network/p2p-networking)

### The P2P topology file

Example of a topology file for a node not involved in block production or block propagation:

```json
{
   "localRoots":[
      {
         "accessPoints":[
            
         ],
         "advertise":false,
         "valency":1
      }
   ],
   "publicRoots":[
      {
         "accessPoints":[
            {
               "address":"relays-new.cardano-mainnet.iohk.io",
               "port":3001
            }
         ],
         "advertise":false
      }
   ],
   "useLedgerAfterSlot":322000
}
```

### Example of topology files for a stake pool

The **block-producing node** includes its own relays (`x.x.x.x` and `y.y.y.y`) under local roots. Note that the block producer uses `"useLedgerAfterSlot": -1` to indicate that it should never use `LedgerPeers`.

```json
{
   "localRoots":[
      {
         "accessPoints":[
            {
               "address":"x.x.x.x",
               "port":3000
            },
            {
               "address":"y.y.y.y",
               "port":3000
            }
         ],
         "advertise":false,
         "valency":1
      }
   ],
   "publicRoots":[
      {
         "accessPoints":[
            
         ],
         "advertise":false
      }
   ],
   "useLedgerAfterSlot":-1
}
```

The **relay nodes** (i.e. `x.x.x.x`) includes its own block-producing node (`z.z.z.z`) and the other relay (`y.y.y.y`) under local roots, and a few other root peers under public roots. Note that relay nodes use LedgerPeers - `"useLedgerAfterSlot": 10000000`.

```json
{
   "localRoots":[
      {
         "accessPoints":[
            {
               "address":"z.z.z.z",
               "port":3000
            },
            {
               "address":"y.y.y.y",
               "port":3000
            }
         ],
         "advertise":false,
         "valency":1
      }
   ],
   "publicRoots":[
      {
         "accessPoints":[
            {
               "address":"relays-new.cardano-mainnet.iohk.io",
               "port":3001
            }
         ],
         "advertise":false
      }
   ],
   "useLedgerAfterSlot":322000
}
```

### Configuring the node to use P2P


You can enable P2P from the configuration file, the field `EnableP2P` can be set to either `false` or `true`.

On Mainnet the default is `false`. When setting it to `true`, you will also need to configure the target number of _active_, _established_ and _known_ peers, together with the target number of _root_ peers, for example:

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