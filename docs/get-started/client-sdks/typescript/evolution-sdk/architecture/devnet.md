---
title: Devnet
description: Local Cardano network orchestration for development and testing
---

## Abstract

Devnet orchestrates a complete Cardano network stack locally using Docker containers. It configures and manages a cardano-node as block producer, optional Kupo chain indexer, and optional Ogmios query layer. Genesis UTxOs are deterministically calculated by hashing address bytes to produce pseudo-TxIds, matching Cardano's `initialFundsPseudoTxIn` algorithm. Clusters support configurable protocol parameters, fast block times, and custom initial fund distribution—enabling rapid development cycles without external network dependencies.

## Design Philosophy

Production networks require synchronization, stake pool delegation, and real ADA. Development needs fast iteration: instant finality, configurable funds, and disposable state. Devnet resolves this tension by creating ephemeral networks that behave like production but start fresh in seconds.

Genesis configuration defines the initial blockchain state—who holds funds, protocol parameters, slot timing. Rather than waiting for chain sync, Devnet deterministically calculates all genesis UTxOs before the node starts. These calculated UTxOs match exactly what the node will produce, because both use the same algorithm: hash address bytes to derive TxId, use output index zero.

## Cluster Composition

A Devnet cluster orchestrates three container types:

**Cardano Node (Required)**: Block-producing node configured as sole stake pool. Runs in single-producer mode with 100% active slot coefficient. Exposes IPC socket for local communication and optional HTTP ports for remote submission.

**Kupo (Optional)**: Fast UTxO indexer that monitors chain events via node socket. Builds queryable index of UTxOs matching patterns (addresses, policy IDs, or all outputs). Exposes HTTP API for UTxO lookups.

**Ogmios (Optional)**: Lightweight query layer providing WebSocket API for chain queries (protocol parameters, UTxOs, transaction submission). Communicates with node via IPC socket.

## Configuration and Initialization

Cluster creation involves preparing configuration artifacts, writing them to temporary storage, and injecting them into containers via volume mounts.

**Merge Config with Defaults**: Provided configuration merges with comprehensive defaults (protocol parameters, genesis balances, network magic, port assignments).

**Create Temp Directory**: System temp directory gets unique subdirectory (`cardano-devnet-{random}`) to hold configuration files. Prevents conflicts between concurrent clusters.

**Write Config Files**: Node configuration, topology (empty producers array for isolated network), four genesis files (one per era), and cryptographic keys.

**Mount Temp Dir into Containers**: Bind mounts link host temp directory to container paths: `/opt/cardano/config` (read-only), `/opt/cardano/keys` (read-only), `/opt/cardano/ipc` (read-write).

## Startup Sequencing

**Start Node First**: Node container starts before dependent services. Performs database initialization, genesis loading, and IPC socket creation.

**Wait for First Block**: Cluster monitors node logs for block production indicators. Critical synchronization point—indexers need active chain before connecting.

**Start Indexers**: After node produces first block, Kupo and Ogmios containers start (if enabled). Both connect to node socket immediately.

## Genesis UTxO Calculation

Genesis UTxOs are calculated deterministically by hashing address bytes to produce TxIds, matching Cardano's ledger implementation:

1. **Address Hex from Config**: Genesis shelley configuration maps addresses (hex-encoded) to lovelace amounts in `initialFunds` object.

2. **Deserialize to Address Bytes**: Hex address string converts to raw bytes representing Cardano address structure.

3. **Blake2b-256 Hash**: Address bytes pass through Blake2b-256 hash function with 32-byte output length. This hash becomes the UTxO's TxId.

4. **TxId (Hash Hex)**: Hash bytes convert to 64-character hex string representing the transaction ID.

5. **UTxO (Index = 0)**: Genesis UTxOs always use output index zero. Cardano ledger rule: each genesis address gets exactly one output at index 0.

## Lifecycle Management

**Cluster.make()**: Creates all containers and writes configuration files. Containers exist but not started.

**Cluster.start()**: Starts all containers in dependency order (node first, indexers after first block).

**Cluster.stop()**: Stops all containers in reverse dependency order. Preserves container state and volumes.

**Cluster.remove()**: Stops containers (if running) then removes them permanently.

## Use Cases

**Fast Development Cycles**: Configure 1-second slots with 100% active coefficient. Instant transaction confirmation. Rapid iteration on transaction building.

**Custom Initial State**: Distribute genesis funds across multiple test addresses. Configure protocol parameters. Enable/disable specific eras.

**Isolated Test Environment**: Each cluster uses unique container names and ports. Run multiple clusters simultaneously for parallel tests.

**Chain Query Integration**: Kupo indexes all UTxOs for fast address queries. Ogmios provides protocol parameters, chain tip, transaction submission.

**Deterministic Testing**: Same genesis configuration produces same initial state every time. Genesis UTxO TxIds deterministically derived from addresses. Critical for CI/CD pipelines.

## Error Handling

**CardanoDevNetError Types**:
- `container_not_found`: Docker daemon unreachable or container missing
- `container_creation_failed`: Image pull failed or invalid configuration
- `container_start_failed`: Port already bound or insufficient resources
- `temp_directory_creation_failed`: System temp directory not writable
- `config_file_write_failed`: Insufficient disk space or permissions

**Effect-Based Error Handling**: All operations return `Effect<Success, CardanoDevNetError>`. Errors compose naturally with Effect operators.

## Related Topics

- [Devnet Getting Started](../devnet/getting-started) - Practical devnet setup
- [Devnet Configuration](../devnet/configuration) - Genesis customization
- [Provider Layer](./provider-layer) - How devnet integrates with provider abstraction
