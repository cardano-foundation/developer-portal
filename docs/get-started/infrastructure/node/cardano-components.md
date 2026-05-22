---
id: cardano-components
title: Cardano Architecture
sidebar_label: Cardano Architecture
description: How Cardano is structured — the node internals, supporting tools, network topology, and consensus model.
image: /img/og/og-getstarted-cardano-components.png
---

Cardano is a layered, formally specified blockchain. Each layer has a clear responsibility, and the boundaries between them are defined in mathematical specifications before a line of code is written. This page explains how those layers fit together, what software implements them, and how the network is organized.

## The software stack

```
┌─────────────────────────────────────────────────────┐
│                   Applications                      │
│        (dApps, wallets, explorers, SPO tools)       │
├─────────────────┬───────────────────────────────────┤
│   cardano-cli   │  cardano-tracer  │    Mithril     │
├─────────────────┴───────────────────────────────────┤
│                   cardano-node                      │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │   Ledger   │ │ Consensus  │ │   Networking     │ │
│  │ (cardano-  │ │(ouroboros- │ │ (ouroboros-      │ │
│  │  ledger)   │ │ consensus) │ │  network)        │ │
│  └────────────┘ └────────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────────┐   │
│  │       Scripting layer (Plutus Core)          │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│            Local chain storage (LedgerDB)           │
└─────────────────────────────────────────────────────┘
```

## cardano-node

[`cardano-node`](https://github.com/IntersectMBO/cardano-node) is the core process. It maintains a copy of the chain, validates blocks and transactions, participates in the consensus protocol, and communicates with other nodes on the network. Every participant in the Cardano network — relays, block producers, and full-node wallets — runs `cardano-node`.

The node is composed of four internal layers:

### Ledger layer

[`cardano-ledger`](https://github.com/IntersectMBO/cardano-ledger) implements the rules of the blockchain: what a valid transaction looks like, how UTXOs are created and consumed, how protocol parameters change, how governance actions are ratified. It is derived directly from formal specifications written in a mathematical notation and machine-checked for correctness.

The ledger does not know about the network or consensus — it is purely a set of state transition rules. Given a current ledger state and a block, it either accepts the block and produces a new state, or rejects it with a specific rule violation.

### Consensus layer

[`ouroboros-consensus`](https://github.com/IntersectMBO/ouroboros-consensus) implements the Ouroboros family of proof-of-stake protocols. It decides which chain a node considers valid when competing chains exist, handles chain selection under forks, and manages the Hard Fork Combinator — the mechanism that allows Cardano to transition between protocol eras without a disruptive network split.

The consensus layer sits between the network and the ledger: it receives block candidates from peers, asks the ledger to validate them, and uses the Ouroboros rules to decide which chain to follow.

### Networking layer

[`ouroboros-network`](https://github.com/IntersectMBO/ouroboros-network) is a typed, multiplexed peer-to-peer networking stack purpose-built for proof-of-stake blockchains. It handles:

- **Peer discovery and selection** — finding and maintaining connections to peers via P2P topology negotiation
- **Mini-protocols** — typed request/response protocols for chain sync, block fetch, transaction submission, and local queries
- **Pipelining** — requesting multiple blocks ahead of confirmation to maximize throughput
- **Adversarial resistance** — protections against peers that are slow, malicious, or eclipse-attacking

The networking layer handles peer topology and connection management. Both relays and block producers run the same networking code; what distinguishes them is configuration — a relay accepts external connections from any peer, while a block producer's topology is configured to connect only to its own relays (see [Network topology](#network-topology) below).

### Scripting layer

[`Plutus Core`](https://github.com/IntersectMBO/plutus) is the smart contract execution engine embedded in the ledger. At its core it is a typed lambda calculus — a minimal, formally verified computation model. Smart contracts compiled from Aiken, Plinth, Plutarch, or any other high-level language ultimately compile down to Untyped Plutus Core (UPLC) for on-chain execution.

Execution happens within the ledger layer during transaction validation. Every script execution is bounded by an execution unit budget (CPU steps and memory units) that must be declared in the transaction. The declared budget is consumed during validation; both per-transaction and per-block execution unit limits are enforced by the protocol parameters, preventing unbounded computation.

## Supporting components

### cardano-cli

[`cardano-cli`](https://github.com/IntersectMBO/cardano-node/tree/master/cardano-cli) is the command-line interface for interacting with a running `cardano-node`. It connects to the node via a local Unix socket and provides commands for:

- Building, signing, and submitting transactions
- Querying chain state (UTxOs, protocol parameters, governance state)
- Managing keys and certificates
- Pool registration and governance operations

`cardano-cli` is not a daemon — it runs, executes a command against the node, and exits.

### cardano-tracer

[`cardano-tracer`](https://github.com/IntersectMBO/cardano-node/tree/master/cardano-tracer) is a standalone service that collects trace messages and metrics from one or more nodes. The node forwards structured log events and EKG metrics to the tracer over a socket connection; the tracer handles log storage, rotation, and exposes a Prometheus metrics endpoint. This separation keeps the node focused on consensus and block production, not log management.

### Mithril

[Mithril](https://mithril.network) is a stake-based signature protocol that allows SPOs to collectively certify snapshots of the chain state. A new node bootstrapping from a Mithril snapshot can reach the chain tip in minutes rather than hours. SPOs participate as Mithril signers; the Mithril aggregator collects signatures and produces certificates. The chain database portion of the snapshot is certified by a threshold of stake. The ledger state snapshot (ancillary data) is signed separately by IOG's ancillary key, so that portion requires trusting IOG.

### DB Sync

[`cardano-db-sync`](https://github.com/IntersectMBO/cardano-db-sync) is an optional component that follows the chain and writes all block and transaction data into a PostgreSQL database. It is not required to run a node or a stake pool — stake pools do not normally run it — but is commonly used by explorers, analytics tools, and applications that need rich SQL queries over chain data.

## Network topology

```
                        Internet
                           │
            ┌──────────────┼──────────────┐
            │              │              │
         Relay 1        Relay 2        Relay N
       (public IP)    (public IP)    (public IP)
            │              │              │
            └──────────────┼──────────────┘
                           │
                    Block Producer
                    (no public IP)
```

**Relays** accept inbound connections from any peer on the network. They propagate transactions and blocks between the broader network and your block producer. A healthy pool runs at least two relays for redundancy and to support the operation of the network as a whole.

**Block producers** connect only to their own relays, never to external peers. This isolates the block producer from direct external exposure. The block producer uses the hot keys needed to forge blocks (KES key and VRF key), but the cold key that authorizes pool registration and key rotation is never used by the block producer.

P2P topology is negotiated automatically since the introduction of P2P networking. Each relay maintains outbound connections to peers discovered via the P2P governor; the block producer's topology is configured to connect only to specific relay addresses.

## Ouroboros consensus

Cardano uses the **Ouroboros Praos** proof-of-stake consensus protocol (and its successor Leios, currently in research). The key concepts:

**Slots and epochs** — Time is divided into slots (1 second each) and epochs (5 days, 432,000 slots on mainnet). Each epoch, a leadership schedule is computed for the entire epoch — every slot has a probability of having a slot leader, weighted by stake.

**Slot leaders** — A slot leader is a stake pool selected to produce the block for that slot. Selection is determined by a verifiable random function (VRF): each pool evaluates the VRF with its key and the epoch nonce, and if the output falls below a threshold proportional to their stake, they are the slot leader for that slot. This is private until the block is produced.

**Chain selection** — When competing chains exist (e.g. two pools produce blocks for the same slot), the node follows the longest valid chain. Ouroboros provides a formal proof that an adversary controlling less than 50% of stake cannot produce a longer chain than the honest network in the long run.

**KES keys** — Block production requires signing each block with a Key Evolving Signature (KES) key. KES keys evolve forward in time — a compromised old key cannot be used to re-sign past blocks. KES keys must be rotated before they expire (approximately every 90 days on mainnet); missing rotation causes the node to stop producing blocks.

## Cardano eras

Cardano has evolved through multiple ledger eras, each introducing new capabilities via a hard fork:

| Era | Key addition |
|-----|-------------|
| Byron | Initial PoS chain |
| Shelley | Decentralized block production, staking |
| Allegra | Token locking |
| Mary | Native tokens and NFTs |
| Alonzo | Plutus smart contracts |
| Babbage | Reference inputs, inline datums, reference scripts |
| Conway | On-chain governance (CIP-1694), DReps, Constitutional Committee |

see also [Historical Cardano Hardforks](https://cardano.org/hardforks/)

Since the Conway Era each era transition is triggered by a hard fork initiation governance action — a process that requires SPO, DRep, and Constitutional Committee votes to ratify. The Hard Fork Combinator in the consensus layer handles the transition transparently, without requiring a separate node binary per era.

## Formal specifications

What distinguishes Cardano's engineering approach is that each layer is specified formally before implementation. The ledger rules are defined in a mathematical notation (Agda and LaTeX), and the consensus protocol has a formal proof of security. This means:

- Rule changes are proposed as spec changes first, then implemented
- The implementation can be checked against the spec for conformance
- Security properties are proved, not just tested

The formal specs are public:
- [Cardano Ledger Specifications](https://github.com/IntersectMBO/cardano-ledger#cardano-ledger)
- [Ouroboros papers](https://iohk.io/en/research/library/) — the academic papers underpinning the consensus protocol

## Further reading

- [eUTXO model](../../../../learn/core-concepts/eutxo) — how Cardano's transaction model differs from account-based chains
- [Consensus & Staking](../../../../operate-a-stake-pool/basics/consensus-staking) — staking and block production from an operator's perspective
- [Installing cardano-node](../installing-cardano-node) — get the software running
