---
id: overview
slug: /developers/curriculum/dapps/iot/cardano-ticker/
title: "Workshop 04: Cardano Ticker"
sidebar_label: Overview
description: Build a multi-screen Cardano ticker on a TFT display showing wallet balance, token prices from MinSwap, and NFT floors from Cexplorer.
---

This workshop builds a complete Cardano ticker: a multi-screen TFT display that rotates between your ADA balance, your token holdings with prices from MinSwap, your NFT collections with floor prices from Cexplorer, and a status screen - plus a stock-market-style scrolling ticker along the bottom.

The example uses **mainnet data** (the original CardanoThings wallet). API endpoints used here are intended for educational purposes; a production ticker would need official paid APIs or a self-hosted source.

> Source code: [github.com/CardanoThings/Workshops/tree/main/Workshop-04](https://github.com/CardanoThings/Workshops/tree/main/Workshop-04)

## Steps

1. **[Gathering Data](./01-gathering-data.md)** - APIs and endpoints used: Koios for stake balance, MinSwap portfolio API for token prices, Cexplorer for NFT collection floor prices. Includes a note on TapTools and Charli3 for production use.
2. **[Building the Ticker](./02-building-the-ticker.md)** - Walk through a multi-file Arduino project: WiFi manager, data fetcher, four data screens (wallet, tokens, NFTs, status) and the scrolling ticker.

## What you'll need

- Cheap Yellow Display (CYD) or compatible ESP32 + TFT setup from Workshop 02.
- A free [Cexplorer.io](https://cexplorer.io/) API key.
- Libraries already installed from earlier workshops: TFT_eSPI, ArduinoJson, WiFi, HTTPClient.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/04-cardano-ticker) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-04](https://github.com/CardanoThings/Workshops/tree/main/Workshop-04).*
