---
id: overview
slug: /developers/curriculum/dapps/iot/
title: Internet of Things (IoT) on Cardano
sidebar_label: Internet of Things (IoT)
description: Build microcontroller projects that read from and write to the Cardano blockchain. A five-workshop course from wallet setup to a working QR-code payment terminal.
---

This section is a hands-on course for connecting microcontrollers to Cardano. Across five workshops you will set up a wallet, fetch on-chain data with an ESP32, drive displays and relays from blockchain events, push sensor data on-chain as transactions and NFTs, build a Cardano price ticker, and finish with a working QR-code payment terminal that listens for confirmations on the Preprod testnet.

The material was originally produced as the **CardanoThings** course (Project Catalyst Fund 11). The canonical web version remains at [cardanothings.io](https://cardanothings.io); the canonical source code is at [github.com/CardanoThings/Workshops](https://github.com/CardanoThings/Workshops).

## What you'll build

- **Workshop 01 - The Basics.** Wallet on Preprod, Arduino IDE setup, your first Koios API call from an ESP32.
- **Workshop 02 - Read and Output.** Fetch wallet balance on a schedule, display data on a TFT, drive a relay, build an Epoch Clock on a WS2812 ring.
- **Workshop 03 - Input and Write.** Read an AHT10 sensor, build a Node.js + Mesh API, push sensor data on-chain as transaction metadata and NFTs.
- **Workshop 04 - Cardano Ticker.** A multi-screen TFT ticker showing wallet balance, token prices (MinSwap), and NFT floors (Cexplorer).
- **Workshop 05 - QR-Code Payments.** A microcontroller-hosted webserver, CIP-13 payment URIs, on-screen QR code, and on-chain payment confirmation via Koios.

## Prerequisites

**Hardware**

- An ESP32 or ESP8266 microcontroller. Most workshops use the **ESP32 Cheap Yellow Display (CYD)** for its built-in TFT; an **ESP32-C3** with an I2C OLED works as well.
- USB data cable (not charge-only).
- Workshop-specific extras: relay module (W2), AHT10 sensor (W3), WS2812 LED ring (W2), breadboard and jumper wires.

**Software**

- [Arduino IDE](https://www.arduino.cc/en/software/)
- A Cardano wallet on **Preprod Testnet** ([Yoroi](https://yoroi-wallet.com/) is used in the workshops)
- Node.js 14+ for Workshop 03 and 05 backend pieces

**Knowledge**

- Comfort with C-like syntax (Arduino sketches are C++).
- Some JavaScript helps for Workshop 03 onward.
- No prior Cardano experience required.

## Workshops

1. [Workshop 01: The Basics](./the-basics/overview.md) - wallet, IDE, first API call.
2. [Workshop 02: Read and Output](./read-and-output/overview.md) - fetch, display, control hardware from chain data.
3. [Workshop 03: Input and Write](./input-and-write/overview.md) - sensor data on-chain, NFT minting from a microcontroller.
4. [Workshop 04: Cardano Ticker](./cardano-ticker/overview.md) - multi-screen ticker for wallet, tokens, NFTs.
5. [Workshop 05: QR-Code Payments](./qr-code-payments/overview.md) - CIP-13 QR codes and on-chain payment confirmation.

## Community projects

Builds from the community that extend or remix what's covered in this section:

- **[NMKR ESP32-Cam](https://github.com/elRaulito/IoT-NMKR-integration-Open-Source-)** by [elRaulito](https://github.com/elRaulito) - Minting NFTs with NMKR directly from an ESP32-Cam. A drop-in alternative to the self-hosted Mesh approach in [Workshop 03](./input-and-write/overview.md) for builders who'd rather hand minting off to a managed service.
- **[StarchMiner Lite](https://github.com/MadOrkestra/StarchMinerLite)** by [Mad Orkestra](https://github.com/madorkestra) - ESP32-based Starch miner. Goes potato.

## Attribution

The course was authored by the **CardanoThings** team and funded by **Project Catalyst Fund 11**. Source code lives at [github.com/CardanoThings/Workshops](https://github.com/CardanoThings/Workshops); the original web version is [cardanothings.io](https://cardanothings.io).
