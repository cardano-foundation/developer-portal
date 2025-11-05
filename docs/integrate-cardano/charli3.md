---
id: charli3
title: Charli3
sidebar_label: Charli3
description: Oracle solution providing price feeds and on-demand data for Cardano smart contracts.
image: /img/og/og-developer-portal.png
---

## What is Charli3?

[Charli3](https://charli3.io) is an oracle solution built for Cardano that connects smart contracts with trusted external information through decentralized nodes. These nodes gather data from trusted sources and calculate oracle feed values using a consensus algorithm.

Charli3 offers two distinct oracle models to meet different use case requirements: Push Oracle for continuous data delivery and On-Demand Validation (ODV) for pull-based data requests.

## What Charli3 Provides

**Push Oracle**: Pre-configured price feeds with regular updates for DeFi protocols, stablecoins, and applications requiring continuous data availability. Updates occur at fixed time intervals or when data deviates beyond specified thresholds.

**On-Demand Pull Oracle (ODV)**: Request-based data validation that delivers data on-demand when smart contracts need it. This pull-based model ensures data is always fresh when used, ideal for applications with unpredictable data needs or requiring maximum freshness.

**Datum Standard**: All Charli3 oracles use a standardized CBOR-formatted datum structure for compatibility across different oracle types, making integration consistent and straightforward.

**Decentralized Network**: Multiple independent validator nodes collect and validate data before publication, with consensus mechanisms that identify and exclude outlier data points.

## Network Support

Charli3 supports Cardano mainnet and preprod testnet environments.

## Getting Started

Visit [docs.charli3.io](https://docs.charli3.io/oracles) for:
- Integration guides for both Push and On-Demand oracles
- Example contracts and implementations
- Datum standard specifications
- Technical references and terminology

---

**Related**: [Orcfax](/docs/integrate-cardano/orcfax) | [Oracles Overview](/docs/integrate-cardano/oracles-overview)
