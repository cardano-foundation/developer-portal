---
id: new-tracing-system
title: Quick start
sidebar_label: Quick start
sidebar_position: 1
description: How to configure and use the new tracing system
keywords: [Tracing, cardano-tracer, trace-dispatch, new tracing system, monitoring, cardano node]
---

- [Introduction](#introduction)
- [Configuration and use of **Cardano Tracer**](#configuration-and-use-of-cardano-tracer)
  - [Advanced Configuration](#advanced-configuration)
- [Node-side configuration of new tracing](#node-side-configuration-of-new-tracing)
  - [Node-side configuration of new tracing: `TraceOptions`](#node-side-configuration-of-new-tracing-traceoptions)
  - [Node-side configuration of new tracing: other fields](#node-side-configuration-of-new-tracing-other-fields)
  - [Configuration formats and fallback](#configuration-formats-and-fallback)
  - [Old Tracing and New Tracing](#old-tracing-and-new-tracing)
- [You're set!](#youre-set)
  - [Feedback and Reporting](#feedback-and-reporting)
  - [Developers only: developing new tracers during transition time](#developers-only-developing-new-tracers-during-transition-time)
  - [Documentation and References](#documentation-and-references)


## Introduction

This document provides an overview of the **New Tracing System**'s functionality, configuration, and modes of operation. The system has been designed to offer flexible and efficient monitoring of Cardano nodes through trace forwarding and hierarchical trace message handling.

#### Functionality Split between Node and Tracer

The new system separates monitoring responsibilities between the **Cardano Node** and the **Cardano Tracer** services. This modular approach ensures the node focuses on core operations, while `cardano-tracer` manages logging, monitoring, and external communication.

#### Introducing Trace Forwarding

Trace forwarding enables seamless transmission of trace data and metrics from nodes to a centralized tracer service. This feature simplifies remote monitoring and supports scenarios where multiple nodes are monitored by a single `cardano-tracer` instance. Forwarding via Unix domain sockets or Windows named pipes is the preferred option, although support for forwarding over TCP/IP exists.

#### Hierarchical Namespaces for Trace Messages

To streamline configuration, the system now uses **hierarchical namespaces** for trace messages instead of directly referencing tracers. This change improves manageability and aligns trace configuration with logical groupings.

#### Modes of Operation

The new tracing system supports several modes of operation to suit different deployment scenarios:

- **Without Forwarding:** The node operates independently and writes trace messages to `stdout`. Metrics can be exposed by using the `PrometheusSimple` backend.

- **One Node, One Cardano Tracer:** The tracer connects to a single node over socket (or loopback device). Trace output and metrics are forwarded to the tracer, and are available according to its configuration.

- **One Tracer, Many Nodes:** A single tracer connects to multiple nodes over socket (possibly via SSH tunnel between hosts) or over IPv4 / IPv6. Forwarding works exactly as described under the previous point.

#### Two-Part Configuration

The configuration for the new tracing system is distributed across two key components:

1. **Node Configuration File**
   - Specifies the settings required to enable and manage trace forwarding from the node to the tracer.
   - Includes parameters such as:
     - Enabling the new tracing system.
     - Defining trace message filtering and granularity.
     - Additional details about trace forwarding.

2. **Cardano Tracer Configuration File**
   - Configures the tracer service itself with settings such as:
     - Communication endpoints (e.g., socket paths).
     - Logging formats and destinations.
     - Metrics, and where to query them (e.g., HTTP ports for EKG or Prometheus).
     - Directories for log storage and rotation.

These configurations work together to ensure efficient communication between the node and the tracer, providing a flexible and robust monitoring setup.


## Configuration and use of **Cardano Tracer**

`cardano-tracer` is a key component of the new tracing infrastructure. It operates as a standalone service that consumes trace messages from `cardano-node`, processes them, and provides outputs for monitoring and analysis.

**Key Features:**

- **Logging to File or System Services**: Write logs in JSON format for machine processing or as text for human readability.
- **Metrics Exposure**: Provides EKG and Prometheus metrics endpoints for system monitoring.

Below is an example of configuring a simple use case: a node and `cardano-tracer` running on the same machine.

---

#### Step 1: Transport from Node to Tracer

Add the following option to the Cardano node's CLI arguments:

```bash
--tracer-socket-path-connect /tmp/forwarder.sock
```

This instructs the node to forward trace messages to `cardano-tracer` via the specified socket path. The system only supports its own transport layer, the 'forwarding protocol'.

---

#### Step 2: Build and Run `cardano-tracer`

Build and run `cardano-tracer` using either `cabal` or `nix`. Below are examples for both methods.

**Using Cabal:**

```bash
cabal build cardano-tracer && cabal install cardano-tracer --installdir=PATH_TO_DIR --overwrite-policy=always
cd PATH_TO_DIR
./cardano-tracer --config PATH_TO_CONFIG
```

**Using Nix:**

```bash
nix build github://github.com/IntersectMBO/cardano-node#cardano-tracer
./result/bin/cardano-tracer --config PATH_TO_CONFIG
```

Replace `PATH_TO_CONFIG` with the path to your `cardano-tracer` configuration file (see next step).

---

#### Step 3: Minimal Example Configuration

Below is an example configuration for a single-node-to-single-tracer setup. The system's forwarding protocol encodes the network magic, so it is mandatory to provide one. Both ends of trace forwarding require the same magic; the example uses the one for mainnet:

**Minimal Example:**

```yaml
networkMagic: 764824073
network:
  tag: AcceptAt
  contents: "/tmp/forwarder.sock"
logging:
- logRoot: "/tmp/cardano-tracer-logs"
  logMode: FileMode
  logFormat: ForMachine
```

- `network`: Specifies the socket path for communication between the node and the tracer.
- `logging`: Configures logs to be written to the `/tmp/cardano-tracer-logs` directory in JSON format.

---

#### Step 4: Running the Setup

Starting with Node `10.2`, the new tracing system is chosen by default. On previous versions, it can be explicitly enabled in the config by setting `UseTraceDispatcher: true`.

Go through the adjustments for your Node configuration file (next chapter). When this is done, and `cardano-tracer` is running, start the Node. It will establish a connection to `cardano-tracer` and begin forwarding trace messages. The tracer will process these messages and generate logs in the specified directory (`/tmp/cardano-tracer-logs`).

---

### Advanced Configuration

For more complex setups, such as monitoring multiple nodes or exposing metrics via Prometheus, additional configuration examples are available. Please refer to the [Cardano Tracer Documentation] for detailed guidance on advanced setups and use cases.

#### Forwarding over TCP

In addition to forwarding over sockets, forwarding over TCP/IP is supported. In both cases, the 'forwarding protocol' is identical. For TCP forwarding, adjust the following:

_From Step 1_ - replace node CLI option:
```bash
--tracer-socket-network-connect 10.0.0.2:34567
```

_From Step 3_ - adjust value for `network` in `cardano-tracer`'s configuration:

```yaml
network:
  tag: AcceptAt
  contents: "0.0.0.0:34567"
```

In this example, `cardano-tracer` listens on port 34567. Nodes can connect via IPv4 for forwarding, with `10.0.0.2` being `cardano-tracer`'s IP in that example.

:::tip Important
On same-host setups sockets are always preferrable due to less overhead and better performance. On multi-host setups, socket connection via SSH tunnels is always preferrable due to increased security.

Use TCP forwarding **if and only if** you control each and every aspect of the environment, such as port mapping or firewalls, or virtual network setup - the 'forwarding protocol' does not implement encrypting traffic nor authentication methods.
:::

## Node-side configuration of new tracing

### Node-side configuration of new tracing: `TraceOptions`

The new tracing system uses **namespaces** for configuration values, enabling fine-grained control down to individual messages. More specific configuration values will override general ones, allowing for a flexible hierarchical setup.
The values are provided in the new `TraceOptions` object in the node configuration file, which we'll further inspect here:
  
---

#### 1. Specify Message Severity Filter

Define the **severity level** of messages you want to be included in trace output. More specific namespaces override more general ones.

**Example:**

```yaml
# namespace root - applies to all dependent messages (*): show messages of severity Notice or higher
"":
  severity: Notice

# ChainDB messages: show messages of severity Info or higher
# Overrides setting from namespace root, being more specific, and applies to all dependent messages (ChainDB.*).
ChainDB:
  severity: Info
```

To suppress all messages pertaining to a namespace, use the severity level `Silence`.  

For a map of the entire namespace of trace messages, please refer to the [Cardano Trace Documentation].

---

#### 2. Specify Message Detail Level

Configure the **detail level** for the messages to control the amount of information rendered for each message.

**Example:**

```yaml
"":
  severity: Notice
  detail: DNormal
```

- Supported detail levels:
  - `DMinimal`: minimal message verbosity
  - `DNormal`: default verbosity
  - `DDetailed`: extended message verbosity
  - `DMaximum`: be extremely verbose - only recommended for development or debugging

*Note*: Trace messages might choose to not support every detail level in their implementation - or only one; the highest matching detail level will then be chosen for rendering.

---

#### 3. Specify Message Frequency Limiters

Use **frequency limiters** to control how often messages are displayed. This replaces the old 'eliding tracers' functionality.

**Example:**

```yaml
ChainDB.AddBlockEvent.AddedBlockToQueue:
  # Show a maximum of 2 messages per second
  maxFrequency: 2.0
```

Setting `maxFrequency: 0.0` disables frequency limiting - which is the default.

---

#### 4. Specify backends for trace data

Define the **backends** that will be enabled inside the Node to process trace data.

**Example:**

```yaml
"":
  severity: Notice
  detail: DNormal
  backends:
    - Stdout MachineFormat
    - EKGBackend
    - Forwarder
    - PrometheusSimple 127.0.0.1 12798
```

- Write to standard output (only one can be used):
  - `Stdout MachineFormat`: in JSON format
  - `Stdout HumanFormatColoured`: in color-coded text format
  - `Stdout HumanFormatUncoloured`: in plain text format
- `EKGBackend`: Have the node collect metrics. Required to forward metrics or expose them via PrometheusSimple
- `Forwarder`: Forwards trace messages and metrics to `cardano-tracer`
- `PrometheusSimple` (with connection string): Have the node expose Prometheus metrics directly; in the example under URL `localhost:12798/metrics`

*Note*: For standard output, trace messages that do not implement a text format might be displayed as JSON.

*Note*: Metrics, although being based on trace data, are **independent** of trace messages. This means, you can access all metrics even if their corresponding trace messages are filtered out or silenced in your configuration. It also means, they can be forwarded to `cardano-tracer` even when you don't forward their corresponding trace messages

:::tip Important
Please make sure to enable the `Forwarder` backend **if and only if** you intend to consume the trace ouput with a running `cardano-tracer` instance. In case of unreliable forwarding connections, the Node generously buffers traces that have not been consumed; and though the buffer is bounded, you will experience permanently increased RAM usage if traces are never consumed at all.

Please make sure to enable the `PrometheusSimple` backend **if and only if** you intend to scrape the node process itself for metrics. This way, you avoid exposing the node over an open port unnecessarily.
:::

---

### Node-side configuration of new tracing: other fields

In addition to providing a `TraceOptions` entry, the new tracing system introduces additional configuration values in the node configuration file:

- `TraceOptionNodeName`: (string) This is used by `cardano-tracer` as the base for creating logging subdirectories and URL paths to query metrics. By default, the hostname is chosen.
- `TraceOptionMetricsPrefix`: (string) Adds a prefix to all metrics names. For increased compatibility with names in the old system, you could use `"cardano.node.metrics."`.
- `UseTraceDispatcher`: (boolean) Enables / disables the new tracing system

---

### Configuration formats and fallback

Configurations can be written in both **JSON** and **YAML**. The examples in this document are provided in **YAML** for readability.  

A full example of a mainnet node config file utilizing various settings for the new tracing system can be found here: [mainnet-config.json]

There's a sensible **fallback** configuration hard-coded inside a Haskell module of the Node: [Cardano.Node.Tracing.DefaultTraceConfig]. It is important to state the `TraceOptions` from this fallback will be used if and only if the `TraceOptions` object in your Node configuration is empty.

---

### Old Tracing and New Tracing

The **old tracing system** is slated for decommissioning but will coexist with the **new tracing system** during a transitional grace period of approximately **3 to 6 months**. During this time, both systems will remain part of the default `cardano-node` build, ensuring compatibility and easing the migration process.

#### Switching Between Tracing Systems

- To enable the **new tracing system**, set the Node's configuration value `UseTraceDispatcher: true`.
- To continue using the **old tracing system**, you need to explicitly set `UseTraceDispatcher: false` on Node 10.2 and onwards.

#### Deprecation of the `kind` field in trace messages

Certain legacy features will be deprecated to simplify and unify the tracing infrastructure. Specifically:

- The **`kind` field** will be **deprecated** and removed when decomissioning the old tracing system.
- We strongly recommend using **namespaces** (provided in the new `ns` field; see below) instead for any analysis tools or automations involving traces.


## You're set!

### Feedback and Reporting

Your feedback is invaluable during this transition. Please help us improve the system by reporting any regressions, issues or difficulties integrating with existing automations while using the new tracing infrastructure.


### Developers only: developing new tracers during transition time

During the transition from old to new tracing system, we recommend the following best practices for developing tracers:

1. **Avoid Using Strictness Annotations for Trace types**
   Trace messages are either discarded immediately or quickly converted into another format for processing. They are never stored for long durations. Using strictness annotations can make the code less efficient without adding any tangible benefits. Additionally, strictness annotations do not align well with the prototype requirements for messages in the new framework.

2. **Prioritize Developing New Tracers**
   Focus on developing new tracers first and then map them to the old tracers. This approach ensures compatibility while future-proofing your work, as the new tracers will remain in use after the old system is decommissioned. You can find numerous examples in
   `cardano-nodes` source code in module `Cardano.Node.Tracing.Tracers`.

3. **Leverage Expertise**
   If you have questions or need reviews for your tracers, reach out to the **Performance & Tracing Team**.

4. **`kind` Fields**
   As described above, keep in mind the `kind` field will be removed eventually; please rely on namespaces when analysing trace messages.

---

### Documentation and References

To support users, administrators and developers, the following documentation provides comprehensive insights into trace messages, metrics, and data points:

- **Trace Messages and Default Configuration**:
   This periodically regenerated document catalogs all trace messages, metrics, and data points in `cardano-node`. It also illustrates how these messages are handled with the current default configuration:
   [Cardano Trace Documentation]

- **Trace-Dispatcher Library**:
   This document describes the underlying library powering the new tracing system. It provides details about its design, flexibility, and efficiency:
   [trace-dispatcher: Efficient, Simple, and Flexible Program Tracing]

- **Cardano Tracer**:
   For information about the `cardano-tracer` service, which facilitates logging and monitoring, refer to its dedicated documentation:
   [Cardano Tracer Documentation]



[//]: # (references)

[Cardano Trace Documentation]: https://github.com/input-output-hk/cardano-node-wiki/blob/main/docs/new-tracing/tracers_doc_generated.md
[Cardano Tracer Documentation]: https://github.com/intersectmbo/cardano-node/blob/master/cardano-tracer/docs/cardano-tracer.md
[Cardano.Node.Tracing.DefaultTraceConfig]: https://github.com/intersectmbo/cardano-node/blob/master/cardano-node/src/Cardano/Node/Tracing/DefaultTraceConfig.hs
[mainnet-config.json]: https://github.com/IntersectMBO/cardano-node/blob/master/configuration/cardano/mainnet-config.json
[trace-dispatcher: Efficient, Simple, and Flexible Program Tracing]: https://github.com/intersectmbo/cardano-node/blob/master/trace-dispatcher/doc/trace-dispatcher.md
