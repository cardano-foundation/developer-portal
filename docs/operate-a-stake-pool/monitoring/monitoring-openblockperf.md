---
id: monitoring-openblockperf
title: Monitoring with openBlockPerf
sidebar_label: openBlockPerf monitoring
description: The Cardano openBlockPerf global network monitoring concept explained
keywords: [monitoring, blockperf, global, network, propagation, cardano ]
---

import Image from "@theme/IdealImage";
import obpf_layers from '@site/static/img/stake-pool-guide/openBlockperf_layer-benefits.png';
import obpf_gantt from '@site/static/img/stake-pool-guide/openBlockperf_block-propagation-gantt-diagram.png';


## Why global monitoring?

Cardano was built on a scientific foundation, developed by engineering teams, and is now operated by stake pool operators as a global decentralized network. The Cardano Blockchain infrastructure is available to applications and is governed by Drep's.

The telemetry data collected at the operational level is available to all these layers and functions for further development. 

<div style={{maxWidth:600}}><Image img={obpf_layers} alt="multiple Layers benefiting from openBlockPerf telemetry data" /></div>


## What does it observe?

OpenBlockPerf analyzes how quickly newly minted Cardano blocks propagate through the global peer-to-peer network. Instead of measuring only the final adoption time, it observes four distinct propagation stages in millisecond precision:

- when a relay node first receives a new block header
- how long it takes to request the block body
- how long the block body download takes
- when the local node validates and adopts the block

<div style={{maxWidth:600}}><Image img={obpf_gantt} alt="block propagation perception from multiple nodes in a gantt diagramm" /></div>

These measurements reflect real-world factors such as geographic distance, latency, peering topology, bandwidth, hardware performance, and block size.

It also records the relay node’s peering connections, its node version, and other data to provide the best possible context for the measured propagation times. openBlockPerf on relay nodes has no access to or influence over stake pool credentials or other operational security-related data. 

The operator has full insight into the code and full control over what is submitted to the global blockperf database. 

Read the full explanation here: [openBlockPerf Documentation](https://github.com/cardano-foundation/openblockperf/blob/main/docs/blockperf-client.md#what-the-client-reports)

## What happens to the submitted data?
Telemetry data is collected in the Blockperf backend. IP addresses are geolocated and mapped to ISP/ASN networks. In addition, public on-chain data from stake pools (active stake, pledge, relays, etc.) is combined to make the data as analyzable as possible. 

## How is this data published?
openBlockPerf itself focuses entirely on data collection and deliberately refrains from creating its own exclusive presentations, which would always contain a certain interpretation and opinion. 

The collected data is generally made available to everyone as raw data - sufficiently anonymized - so that everyone can conduct his own analyses and form own opinions. 

Actively participating stake pool operators receive, in return, performance data exclusively related to their own relays, which they can integrate into their own monitoring systems. 

## How can I participate?
Stake pool operators can obtain an openBlockPerf API key using a Calidus proof, which they can use simultaneously on all their relays. 

Anyone else who does not have a stake pool (Calidus key) can register their node using its public IP and receive a valid API key for it.

The API key should not be understood as a permissioned system, but rather as a way to uniquely identify or even filter submitted data.

## openBlockPerf open source repository

[https://github.com/cardano-foundation/openblockperf](https://github.com/cardano-foundation/openblockperf)