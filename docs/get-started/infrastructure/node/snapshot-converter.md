---
id: snapshot-converter
title: Migrating ledger snapshots between backends
sidebar_label: Migrating snapshots with snapshot-converter
sidebar_position: 6
description: This guide explains how to use snapshot-converter to migrate a cardano-node ledger snapshot between the in-memory, LMDB and LSM backends.
keywords: [snapshot-converter, ledger, UTxO-HD, LSM, LMDB, in-memory, Mem, backend, migration, cardano-node]
---

`snapshot-converter` is a utility shipped alongside `cardano-node` that converts a single ledger snapshot from one storage format to another, or runs as a daemon to keep a parallel copy of every snapshot a running node produces. It is the supported way to switch a node from one ledger backend to another without resyncing the chain.

The three snapshot formats currently supported are:

- **Mem** — the in-memory backend. The snapshot is a self-contained directory holding the ledger state and UTxO tables.
- **LMDB** — an on-disk backend backed by [LMDB](http://www.lmdb.tech/doc/). The snapshot is a self-contained directory.
- **LSM** — an on-disk backend backed by an LSM-tree. The snapshot is a directory that *references* a separate LSM database directory; both paths must be supplied together.

## Before you start

1. **Stop `cardano-node` cleanly.** The converter operates on snapshot files at rest; running it against a snapshot from a node that is still writing produces undefined results. A clean shutdown also flushes the most recent snapshot to disk, so you have a fresh starting point.
2. **Locate the latest snapshot.** Snapshots are written under your node's `--database-path`, in `db/ledger/`. Each snapshot directory (or, in older formats, file) is **named after the slot number** of the contained ledger state.
3. **Back up the latest snapshot and your `config.json`.** Copy the latest `db/ledger/<SLOT>` directory (and, for an LSM source, its LSM database directory) somewhere safe, along with `config.json`. The conversion itself does not modify its input, but a later step removes the old-format snapshots — if the node then fails to start on the new backend and no working snapshot remains, it must replay the chain from genesis, which can take many hours. A backup lets you roll back in seconds instead.
4. **Respect the slot-number naming convention.** The output path you pass to `snapshot-converter` must begin with the same slot number as the input. An optional suffix is allowed, separated from the slot number with `_`. Passing a wrong slot number causes the converter to fail.

   For example, an input snapshot for slot `185939365` may be written to `185939365`, `185939365_lsm`, or `185939365_mem`, but never to `latest` or `185939366`.

## Converter modes

`snapshot-converter` runs in one of two modes:

- **Oneshot** — converts a single snapshot and exits. Use this when you are migrating a node from one backend to another.
- **Daemon** — watches a node's snapshot directory and converts every new snapshot the node produces into Mem format. Use this if you run on `LMDB` or `LSM` but want to keep a Mem-format mirror (for example, for sharing or as a fallback).

Every invocation requires `--config <PATH>`, pointing at the same `config.json` your node uses.
## Oneshot mode

The general shape of an oneshot invocation is:

```
snapshot-converter <INPUT> <OUTPUT> --config <PATH> [--threshold <THRESHOLD>]
```

Where the input flag identifies the source format and the output flag identifies the target format.

`--threshold` is optional: it overrides the Byron-era `PBftSignatureThreshold`. You only need it on custom or private networks whose config sets a non-default value — on the public networks (mainnet, preview, preprod) the value comes from `--config`, so you can omit it.

### Mem to LSM

```bash
snapshot-converter \
  --input-mem /path/to/db/ledger/<SLOT> \
  --output-lsm-snapshot /path/to/db/ledger/<SLOT>_lsm \
  --output-lsm-database /path/to/db/lsm \
  --config /path/to/config.json
```

`--output-lsm-snapshot` is placed inside `db/ledger/` so the node discovers it on startup. `--output-lsm-database` is the persistent LSM database; pick a stable path **outside** `db/ledger/`, because the node will continue writing to it.

### Mem to LMDB

```bash
snapshot-converter \
  --input-mem /path/to/db/ledger/<SLOT> \
  --output-lmdb /path/to/db/ledger/<SLOT>_lmdb \
  --config /path/to/config.json
```

### LMDB to LSM

```bash
snapshot-converter \
  --input-lmdb /path/to/db/ledger/<SLOT> \
  --output-lsm-snapshot /path/to/db/ledger/<SLOT>_lsm \
  --output-lsm-database /path/to/db/lsm \
  --config /path/to/config.json
```

### LMDB to Mem

```bash
snapshot-converter \
  --input-lmdb /path/to/db/ledger/<SLOT> \
  --output-mem /path/to/db/ledger/<SLOT>_mem \
  --config /path/to/config.json
```

### LSM to Mem

Note that an LSM input requires *both* the snapshot directory and the LSM database directory the snapshot was taken against:

```bash
snapshot-converter \
  --input-lsm-snapshot /path/to/db/ledger/<SLOT> \
  --input-lsm-database /path/to/db/lsm \
  --output-mem /path/to/db/ledger/<SLOT>_mem \
  --config /path/to/config.json
```

### LSM to LMDB

```bash
snapshot-converter \
  --input-lsm-snapshot /path/to/db/ledger/<SLOT> \
  --input-lsm-database /path/to/db/lsm \
  --output-lmdb /path/to/db/ledger/<SLOT>_lmdb \
  --config /path/to/config.json
```

## Daemon mode

Daemon mode is only meaningful if your node is configured with the `LMDB` or `LSM` backend. It monitors the node's `ledger/` directory and writes a Mem-format copy of every new snapshot the node produces.

### LSM to Mem (daemon)

```bash
snapshot-converter \
  --monitor-lsm-snapshots-in /path/to/db/ledger \
  --lsm-database /path/to/db/lsm \
  --output-mem-snapshots-in /path/to/mem-mirror \
  --config /path/to/config.json
```

### LMDB to Mem (daemon)

```bash
snapshot-converter \
  --monitor-lmdb-snapshots-in /path/to/db/ledger \
  --output-mem-snapshots-in /path/to/mem-mirror \
  --config /path/to/config.json
```

In both cases `--output-mem-snapshots-in` should point at a directory **outside** the node's own `ledger/` to avoid the node trying to load the converted copies on startup.

## After converting: switching the node to the new backend

Converting the snapshot is only the first half of a migration. Once the new snapshot is on disk, you also need to:

1. **Move the old-format snapshots out of `db/ledger/`**, leaving only the snapshot in the format you are migrating to. Move them to your backup location rather than deleting them outright — that way they are still available if you need to roll back.
2. **Update `config.json`** so the node selects the matching backend on startup. See [Choosing a ledger backend](/docs/get-started/infrastructure/node/running-cardano#choosing-a-ledger-backend) in the *Running cardano-node* guide for the exact `LedgerDB` configuration block.
3. **Restart the node.** On startup it will discover the converted snapshot in `db/ledger/` and resume from it; if you migrated to LSM, it will continue writing to the `--output-lsm-database` directory you supplied.

:::tip Rolling back
If you need to roll back to the previous backend, restore the original snapshot you backed up to `db/ledger/`, revert the `LedgerDB` change in `config.json`, and restart. Because the immutable chain data was never touched, the node resumes from the restored snapshot — no resync from genesis required.
:::

## Next steps

Once the conversion has finished and the old snapshots have been cleared from `db/ledger/`, continue with [Running cardano-node](/docs/get-started/infrastructure/node/running-cardano#choosing-a-ledger-backend) — specifically the *Choosing a ledger backend* section, which covers the `config.json` changes required to start the node on its new backend.

## Reference: full help text

```
$ snapshot-converter --help
Utility for converting snapshots among the different snapshot formats used by
cardano-node.

Usage: snapshot-converter (
                            (--monitor-lsm-snapshots-in ARG --lsm-database ARG |
                              --monitor-lmdb-snapshots-in ARG)
                            --output-mem-snapshots-in ARG |
                            (--input-lsm-snapshot ARG --input-lsm-database ARG |
                              --input-mem ARG | --input-lmdb ARG)
                            (--output-lsm-snapshot ARG
                              --output-lsm-database ARG |
                              --output-mem ARG | --output-lmdb ARG))
                          --config PATH [--threshold THRESHOLD]

Available options:
  --config PATH            Path to config file
  --threshold THRESHOLD    PBftSignatureThreshold
  -h,--help                Show this help text
```
