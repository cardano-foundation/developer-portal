---
id: utxo-contention
title: UTxO Contention
sidebar_label: UTxO Contention
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `utxo-contention`

**Property statement:**
The protocol is designed in such a way that disincentivises the attempt to consume the same UTxO by multiple actors.

**Test:**
One out of two or more transactions trying to consume the same UTxO fails due to the UTxO not existing anymore.

**Impact:**
Protocol stalling

**Further explanation:**
This vulnerability is very common in the case where a UTxO carries some global datum or shared value (global state).

For instance, a decentralised exchange (DEX) that holds in a single UTxO (global UTxO) the pool of assets available to be swapped would experience a high degree of contention, since every swap would require consuming the global UTxO and recreating it by locking back the pool of assets with the swap already performed. In practice, this would make the DEX unusable, since as soon as it becomes popular and volume of transactions is significant, the global UTxO would be unavailable for most of the users.

Protocols that aim to minimise this vulnerability should aim for parallel transactions and distributed state management wherever possible.
