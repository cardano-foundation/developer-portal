---
id: overview
slug: /developers/curriculum/dapps/iot/input-and-write/
title: "Workshop 03: Input and Write"
sidebar_label: Overview
description: Read an AHT10 sensor on the ESP32, build a Node.js + Mesh SDK API, and put sensor data on-chain as transaction metadata and as NFTs.
---

This workshop is about *writing* to the chain. You will read temperature and humidity from an AHT10 sensor, post the readings to a Node.js API, and use [Mesh SDK](https://meshjs.dev/) with the [Koios](https://api.koios.rest/) provider to turn each reading into a Cardano transaction - and eventually into an NFT.

> Source code: [github.com/CardanoThings/Workshops/tree/main/Workshop-03](https://github.com/CardanoThings/Workshops/tree/main/Workshop-03)

## Steps

1. **[Connect and Read Sensor Data](./01-connect-and-read-sensor-data.md)** - Wire an AHT10 over I2C, read temperature and humidity, optionally render them on a small SH1106 OLED.
2. **[Build your own API to put data on-chain](./02-build-your-own-api.md)** - A Node.js + Express server that uses Mesh and Koios to fetch wallet balance and submit transactions with sensor data attached as metadata.
3. **[Mint Sensor Data on-chain](./03-mint-sensor-data-on-chain.md)** - Mint each sensor reading as an NFT using the CIP-25 metadata standard. Includes burning.

## What you'll need

- Everything from Workshops 01 and 02.
- AHT10 temperature and humidity sensor (or compatible I2C sensor).
- Optional: 1.3" SH1106 OLED for on-device display.
- Node.js 14+ and a Cardano testnet wallet with some tADA for transaction fees.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/03-input-and-write) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-03](https://github.com/CardanoThings/Workshops/tree/main/Workshop-03).*
