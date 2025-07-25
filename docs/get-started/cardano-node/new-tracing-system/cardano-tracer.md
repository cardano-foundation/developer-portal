---
id: cardano-tracer
title: Cardano Tracer
sidebar_label: Cardano tracer
sidebar_position: 2
description: Using cardano tracer.
keywords: [Tracing, cardano-tracer, trace-dispatch, new tracing system, monitoring, cardano node]
---

## Cardano Tracer

`cardano-tracer` is a service for logging and monitoring over Cardano nodes. After it is connected to the node, it periodically asks the node for different information, receives it, and handles it.

## Contents

1. [Introduction](#introduction)
   1. [Motivation](#motivation)
   1. [Overview](#overview)
1. [Build and run](#build-and-run)
1. [Configuration](#configuration)
   1. [Settings in Cardano Node configuration file](#settings-in-cardano-node-configjson-file)
   1. [Distributed Scenario](#distributed-scenario)
   1. [Local Scenario](#local-scenario)
   1. [Network Magic](#network-magic)
   1. [Requests](#requests)
   1. [Logging](#logging)
   1. [Logs Rotation](#logs-rotation)
   1. [Prometheus](#prometheus)
   1. [EKG Monitoring](#ekg-monitoring)
   1. [Verbosity](#verbosity)

## Introduction

### Motivation

Previously, the node handled all the logging by itself. It provides two web-servers for application monitoring: Prometheus and EKG.

`cardano-tracer` is the result of _moving_ all the logging and monitoring-related components from the node to a separate service. As a result, the node becomes smaller, faster, and simpler once the current system is deprecated.

### Overview

You can think of Cardano node as a **producer** of logging and monitoring information, and `cardano-tracer` as a **consumer** of this information. After a network connection between them is established, `cardano-tracer` periodically asks for such information, and the node replies with it.

There are 3 such kinds of information:

1. **Trace object**, contains logging data. `cardano-tracer` periodically queries for new trace objects, receives them and stores them in the log files and/or in Linux `systemd`'s journal.
2. **EKG metric**, contains system metrics. [Consult the EKG documentation](https://hackage.haskell.org/package/ekg-core) for more info. `cardano-tracer` periodically queries for new EKG metrics, receives and displays them using monitoring tools.
3. **Data point**, contains arbitrary information about the node. `cardano-tracer` does not poll periodically for new data points, only by _explicit_ request when it needs it.

`cardano-tracer` can work as an aggregator as well: _one_ `cardano-tracer` process can receive the information from _multiple_ nodes.

## Build and run

For how to build `cardano-tracer`, refer to the [New Tracing Quickstart](docs/get-started/cardano-node/new-tracing-system/quick-start.md).

## Configuration

The way how to configure `cardano-tracer` depends on your requirements. There are two basic scenarios:

1. **Distributed** (real-life) scenario, when `cardano-tracer` is working on one machine, and your nodes are working on another machine(s).
2. **Local** (testing) scenario, when `cardano-tracer` and your nodes are working on the same machine.

Distributed scenario is for real-life case. You may have `N` nodes, running on `N` different hosts, and you want to collect all the logging and monitoring information from these nodes using one `cardano-tracer` process working on your machine.

Local scenario is best for testing and debugging. For example, you want to try your new infrastructure from scratch so you run `N` nodes and one `cardano-tracer` process on your machine.

### Settings in Cardano Node config.json file

Backends can be a combination of `Forwarder`, `EKGBackend`, `PrometheusSimple <...>`, and one of `Stdout MachineFormat`, `Stdout HumanFormatColoured` and `Stdout HumanFormatUncoloured`.

Tracing options that can be given based on a namespace are `severity`, `detail` and `maxFrequency`.

```json
{
  "UseTraceDispatcher": true,
  "TraceOptions": {
    "": {
      "severity": "Notice",
      "detail": "DNormal",
      "backends": [
        "Stdout MachineFormat",
        "EKGBackend",
        "Forwarder"
      ]
    },
    "ChainDB": {
      "severity": "Info",
      "detail": "DDetailed"
    },
    "ChainDB.AddBlockEvent.AddedBlockToQueue": {
      "maxFrequency": 2.0
    }
  },
  "TraceOptionPeerFrequency": 2000
}
```

For further node-side configuration explanations, refer to:

[New Tracing Quickstart](docs/get-started/cardano-node/new-tracing-system/quick-start.md)

### Distributed Scenario

This is an example with 3 nodes and one `cardano-tracer`:

```
machine A            machine B            machine C
+-----------------+  +-----------------+  +-----------------+
| node 1          |  | node 2          |  | node 3          |
+-----------------+  +-----------------+  +-----------------+
                ^             ^             ^
                 \            |            /
                  \           |           /
                   v          v          v
                   +---------------------+
                   | cardano-tracer      |
                   +---------------------+
                   machine D
```

The minimalistic configuration file for `cardano-tracer` would be:

```
{
  "networkMagic": 764824073,
  "network": {
    "tag": "AcceptAt",
    "contents": "/tmp/forwarder.sock"
  },
  "logging": [
    {
      "logRoot": "/tmp/cardano-tracer-logs",
      "logMode": "FileMode",
      "logFormat": "ForMachine"
    }
  ]
}
```

The `network` field specifies the way how `cardano-tracer` will be connected to your nodes. Here you see `AcceptAt` tag, which means that `cardano-tracer` works as a server: it _accepts_ network connections by listening the local socket `/tmp/forwarder.sock`. Your nodes work as clients: they _initiate_ network connections using their local sockets. It can be shown like this:

```
machine A                 machine B                 machine C
+----------------------+  +----------------------+  +----------------------+
| node 1               |  | node 2               |  | node 3               |
|      \               |  |      \               |  |      \               |
|       v              |  |       v              |  |       v              |
|  /tmp/forwarder.sock |  |  /tmp/forwarder.sock |  |  /tmp/forwarder.sock |
+----------------------+  +----------------------+  +----------------------+





                          +---------------------+
                          | /tmp/forwarder.sock |
                          |      ^              |
                          |       \             |
                          |      cardano-tracer |
                          +---------------------+
                          machine D
```

To establish the real network connections between your machines, you need SSH forwarding:

```
machine A                 machine B                 machine C
+----------------------+  +----------------------+  +----------------------+
| node 1               |  | node 2               |  | node 3               |
|      \               |  |      \               |  |      \               |
|       v              |  |       v              |  |       v              |
|  /tmp/forwarder.sock |  |  /tmp/forwarder.sock |  |  /tmp/forwarder.sock |
+----------------------+  +----------------------+  +----------------------+
                       ^             ^              ^
                        \            |             /
                        SSH         SSH           SSH
                          \          |           /
                           v         v          v
                          +---------------------+
                          | /tmp/forwarder.sock |
                          |      ^              |
                          |       \             |
                          |      cardano-tracer |
                          +---------------------+
                          machine D
```

The idea of SSH forwarding is simple: we do not connect directly to the process but to their network endpoints instead. You can think of it as a network channel from the local socket on one machine to the local socket on another machine:

```
machine A                                            machine D
+----------------------------------+                 +------------------------------------------+
| node 1 --> /tmp/forwarder.sock <-|---SSH channel---|-> /tmp/forwarder.sock <-- cardano-tracer |
+----------------------------------+                 +------------------------------------------+
```

Neither your nodes nor `cardano-tracer` know anything SSH, they only know about their local sockets. Using SSH forwarding mechanism they work together between machines. Since you already have your SSH credentials the connection between your nodes and `cardano-tracer` will be secure.

Path `/tmp/forwarder.sock` is just an example. You can use any other name in any other directory where you have read/write permissions.

To connect `cardano-node` working on machine `A` with `cardano-tracer` working on machine `D`, run this command on machine `A`:

```
ssh -nNT -L /tmp/forwarder.sock:/tmp/forwarder.sock -o "ExitOnForwardFailure yes" john@109.75.33.121
```

where:

- `/tmp/forwarder.sock` is a path to the local socket on machine `A` _and_ a path to the local socket on machine `D`,
- `john` is a user name you use to login on machine `D`,
- `109.75.33.121` is an IP-adress of machine `D`.

:::tip Important
Make sure you run `ssh`-command **before** you start your node. Since `ssh` creates the channel and `cardano-node` uses that channel, you should _create_ it before _using_ it.
:::

Now run the same command on machines `B` and `C` to connect corresponding nodes with the same `cardano-tracer` working on machine `D`.

Nodes working on machines `A`, `B` and `C` should specify paths `/tmp/forwarder.sock` using node's CLI-parameter `--tracer-socket-path-connect` or `--tracer-socket-path-accept` (see explanation below). There is another CLI-parameter `--socket-path` as well, but it's **not** related to `cardano-tracer`.

### Local Scenario

As was mentioned above, local scenario is for testing, when your nodes and `cardano-tracer` reside on the same machine. In this case all processes can see the same local sockets so we don't need `ssh`. The configuration file for 3 local nodes would look like this (same as before):

```
{
  "networkMagic": 764824073,
  "network": {
    "tag": "AcceptAt",
    "contents": "/tmp/forwarder.sock"
  },
  "logging": [
    {
      "logRoot": "/tmp/cardano-tracer-logs",
      "logMode": "FileMode",
      "logFormat": "ForMachine"
    }
  ]
}
```

`cardano-tracer` works as a server: it _accepts_ network connections by listening the local socket `/tmp/forwarder.sock`. Your local nodes work as clients: they _initiate_ network connections using the _same_ local socket `/tmp/forwarder.sock`.

There is another way to connect `cardano-tracer` to your nodes: the `cardano-tracer` can work as _initiator_, this is an example of configuration file:

```
{
  "networkMagic": 764824073,
  "network": {
    "tag": "ConnectTo",
    "contents": [
      "/tmp/cardano-node-1.sock"
      "/tmp/cardano-node-2.sock"
      "/tmp/cardano-node-3.sock"
    ]
  },
  "logging": [
    {
      "logRoot": "/tmp/cardano-tracer-logs",
      "logMode": "FileMode",
      "logFormat": "ForMachine"
    }
  ]
}
```

As you see, the tag in `network` field is `ConnectTo` now, which means that `cardano-tracer` works as a client: it _establishes_ network connections with your local nodes via the local sockets `/tmp/cardano-node-*.sock`. In this case each socket is used by a particular node.

It is **highly recommended** to use `AcceptAt` for easier maintainance. Use `ConnectTo` only if you really need it.

`AcceptTo` and `ConnectTo` are mirrored by the reciprocal option on the node `--tracer-socket-path-connect` / `--tracer-socket-path-accept`. If you choose one on the node, you choose the opposite on the tracer. This only makes a difference to which entity initiates the handshake; after the handshake the configuration is identical.

Suppose you have 3 working nodes, and they are connected to the same `cardano-tracer`. And then you want to connect a 4th node to it. If `cardano-tracer` is configured using `AcceptAt`, you don't need to change its configuration - you just connect the additional node to it. But if `cardano-tracer` is configured using `ConnectTo`, you'll need to add a 4th socket path to its configuration file and restart the `cardano-tracer` process.

### Network Magic

The field `networkMagic` specifies the value of network magic. It is an integer constant from the genesis file, the node uses this value for the network handshake with peers. Since `cardano-tracer` should be connected to the node, it needs that network magic.

The value from the example above, `764824073`, is taken from the Shelley genesis file for [Mainnet](https://book.world.dev.cardano.org/environments.html). Take this value from the genesis file your nodes are launched with.

### Requests

The optional field `loRequestNum` specifies the number of log items that will be requested from the node. For example, if `loRequestNum` is `10`, `cardano-tracer` will periodically ask 10 log items in one request. This value is useful for fine-tuning network traffic: it is possible to ask 50 log items in one request, or ask them in 50 requests one at a time. `loRequestNum` is the *maximum* number of log items. For example, if `cardano-tracer` requests 50 log items but the node has only 40 at that moment, these 40 items will be returned, the request won't block to wait for additional 10 items.

The optional field `ekgRequestFreq` specifies the period of how often EKG metrics will be requested, in seconds. For example, if `ekgRequestFreq` is `10`, `cardano-tracer` will ask for new EKG metrics every ten seconds. There is no limit as `loRequestNum`, so every request returns _all_ the metrics the node has _in this moment of time_.

The reliable default values are `loRequestNum: 100` and `ekgRequestFreq: 1`, which will be used when these fields are left out of your configuration file.

### Logging

Logging is one of the most important features of `cardano-tracer`. The field `logging` describes logging parameters:

```
"logging": [
  {
    "logRoot": "/tmp/cardano-tracer-logs",
    "logMode": "FileMode",
    "logFormat": "ForMachine"
  }
]
```

The field `logRoot` specifies the path to the root directory. This directory will contain all the subdirectories with the log files inside. Remember that each subdirectory corresponds to the particular node. If the root directory does not exist, it will be created.

This is an example of log structure:

```
/rootDir
   /subdirForNode0
      node-2021-11-25T10-06-52.json
      node.json -> /rootDir/subdirForNode0/node-2021-11-25T10-06-52.json
```

In this example, `subdirForNode0` is a subdirectory containing log files with items received from the node `0`. And `node-2021-11-25T10-06-52.json` is the _current_ log: it means that currently `cardano-tracer` is writing items in this log file.

The field `logMode` specifies logging mode. There are two possible modes: `FileMode` and `JournalMode`. `FileMode` is for storing logs to the files, `JournalMode` is for storing them in `systemd`'s journal. If you choose `JournalMode`, the field `logRoot` will be ignored.

The field `logFormat` specifies the format of logs. There are two possible modes: `ForMachine` and `ForHuman`. `ForMachine` is for JSON format, `ForHuman` is for human-friendly text format.

`logging` field accepts the list, so you can specify more than one logging section. For example, for both log formats:

```
"logging": [
  {
    "logRoot": "/tmp/cardano-tracer-logs-json",
    "logMode": "FileMode",
    "logFormat": "ForMachine"
  },
  {
    "logRoot": "/tmp/cardano-tracer-logs-text",
    "logMode": "FileMode",
    "logFormat": "ForHuman"
  }
]
```

In this case log items will be written in JSON format (in `.json`-files) as well as in text format (in `.log`-files).

### Logs Rotation

An optional field `rotation` describes parameters for log rotation. If you skip this field, all the log items will be stored in one single file, and usually it's not what you want. These are rotation parameters:

```
"rotation": {
  "rpFrequencySecs": 30,
  "rpKeepFilesNum": 3,
  "rpLogLimitBytes": 50000,
  "rpMaxAgeHours": 1
}
```

The field `rpFrequencySecs` specifies rotation period, in seconds. In this example, `rpFrequencySecs` is `30`, which means that rotation check will be performed every 30 seconds.

The field `rpLogLimitBytes` specifies the maximum size of the log file, in bytes. In this example, `rpLogLimitBytes` is `50000`, which means that once the size of the current log file is 50 KB, a new log file will be created.

The field `rpKeepFilesNum` specifies the number of log files that will be kept. In this example, `rpKeepFilesNum` is `3`, which means that 3 _last_ log files will always be kept.

The fields `rpMaxAgeMinutes`, `rpMaxAgeHours` specify the lifetime of the log file, in minutes, or hours. If both fields are specified, `rpMaxAgeMinutes` takes precedence. In this example, `rpMaxAgeHours` is `1`, which means that each log file will be kept for 1 hour only. After that, the log file is considered outdated. N _last_ log files (specified by `rpKeepFilesNum`) will be kept even if they are outdated. All other outdated files will be deleted by `cardano-tracer`.


### Prometheus

The optional field `hasPrometheus` specifies the host and port of the web page with metrics. For example:

```
"hasPrometheus": {
  "epHost": "127.0.0.1",
  "epPort": 3000
}
```

Here the web page is available at `http://127.0.0.1:3000`. If you skip this field, no Prometheus endpoint will be started.

After you open `http://127.0.0.1:3000` in your browser, you will see the list of identifiers of connected nodes (or the warning message, if there are no connected nodes yet), for example:

```
* KindStar_3001
```

This identifier corresponds to the `TraceOptionNodeName` in the node config, or the fallback `<hostname>_<node port>` if no such value is provided.

Each identifier is a hyperlink to the page where you will see the **current** list of metrics received from the corresponding node, in such a format:

```
# TYPE Mem_resident_int gauge
# HELP Mem_resident_int Kernel-reported RSS (resident set size)
Mem_resident_int 103792640
# TYPE rts_gc_max_bytes_used gauge
rts_gc_max_bytes_used 5811512
# TYPE rts_gc_gc_cpu_ms counter
rts_gc_gc_cpu_ms 50
# TYPE RTS_gcMajorNum_int gauge
# HELP RTS_gcMajorNum_int Major GCs
RTS_gcMajorNum_int 4
# TYPE rts_gc_num_bytes_usage_samples counter
rts_gc_num_bytes_usage_samples 4
# TYPE remainingKESPeriods_int gauge
remainingKESPeriods_int 62
# TYPE rts_gc_bytes_copied counter
rts_gc_bytes_copied 17114384
```

That page from the example can of course be directly accessed by `http://127.0.0.1:3000/kindstar-3001`.

### EKG Monitoring

The optional field `hasEKG` specifies the host and port of the web
page with EKG metrics. For example:

```
"hasEKG": {
    "epHost": "127.0.0.1",
    "epPort": 3100
}
```

Just as with Prometheus, the root path `/` on EKG shows a list of connected nodes. The response is either human-readable names (HTML) with clickable
links, or JSON mapping from connected node names to relative URLs,
depending on desired content type (`Accept:` header of the request).

The URL routes dynamically depend on the connected nodes _in this moment of time_; the node names
are [sluggified](https://hackage.haskell.org/package/slugify).

For a node with a specified name in its configuration:

```
{ 
  TraceOptionNodeName: "foo-node"
}
```
and another connection that does not specify a node name, the list of clickable identifiers of connected
nodes will be available at `http://127.0.0.1:3100` as:

```
* foo-node
* KindStar_3001
```
Just as with Prometheus, the fallback for `TraceOptionNodeName` is `<hostname>_<node port>`.

Clicking an identifier will take you to its monitoring page. Clicking
on `foo-node` (`http://localhost:3100/foo-node`) and `KindStar_3001` (`127.0.0.1:3100/kindstar-3001`) takes you to the
respective metrics monitoring.

Sending a HTTP GET request with a JSON Accept header gives the metrics
of an identifier as JSON. `jq '.'` pretty-prints the JSON object.

```
$ curl --silent -H 'Accept: application/json' '127.0.0.1:3100/kindstar-3001' | jq '.'
{
  "Mem": {
    "resident_int": {
      "type": "g",
      "val": 790822912
    }
  },
  "RTS": {
    "alloc_int": {
      "type": "g",
      "val": 159054205680
    },
    "gcHeapBytes_int": {
      "type": "g",
      "val": 750780416
[...]
```

### Verbosity

```
{
  "networkMagic": ..,
  .. 
  "verbosity": "ErrorsOnly"
}
```

The `verbosity` field (optional) specifies the verbosity level for the `cardano-tracer` itself. There are 3 levels:

1. `Minimum` - `cardano-tracer` will work as silently as possible.
2. `ErrorsOnly` - messages about problems will be shown in standard output.
3. `Maximum` - all the messages will be shown in standard output. **Caution**: the number of messages can be huge.

If you skip this field, `ErrorsOnly` verbosity will be used by default.
