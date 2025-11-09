---
id: overview
title: Plutarch (Haskell)
sidebar_label: Overview
description: Plutarch
--- 

Plutarch is a typed eDSL in Haskell for writing efficient Plutus Core validators.

## Why Plutarch?

Plutarch written validators are often significantly more efficient validators. With Plutarch, you have much more fine gained control of the Plutus Core you generate, without giving up any type information.

To put things into perspective, one validator script from a large production contract was rewritten in Plutarch, changed from Plinth. Here's the comparison between the Plutarch script's execution cost compared to the Plutus Tx script's execution cost. These numbers were gathered by simulating the whole contract flow on a testnet:

| Version            | CPU         | Memory  | Script Size |
| ------------------ | ----------- | ------- | ----------- |
| PlutusTx (current) | 198,505,651 | 465,358 |  2013       |
| Plutarch           | 51,475,605  |  99,992 |  489        |

More benchmarks, with reproducible code, soon to follow.

## Installation

* Add this [repo](https://github.com/Plutonomicon/plutarch-plutus) as a source repository package to your `cabal.project`.
* Add the `plutarch` package as a dependency to your cabal file.

## Benchmarks

See the [`plutarch-test`](https://github.com/Plutonomicon/plutarch-plutus/tree/master/plutarch-testlib/test) for testing and golden files containing benchmarks and UPLCs.

## Usage

Alongside the [User guide](#usage) above, you may also find the [Developers' guide](https://plutonomicon.github.io/plutarch-plutus/DEVGUIDE.html) useful for understanding the codebase.

## Community

- [Plutonomicon Discord](https://discord.gg/722KnTC8jF)

- [**Continue to Plutarch website**](https://plutonomicon.github.io/plutarch-plutus/)