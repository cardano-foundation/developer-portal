---
id: overview
slug: /developers/curriculum/dapps/iot/read-and-output/
title: "Workshop 02: Read and Output"
sidebar_label: Overview
description: Fetch on-chain data on a schedule and use it to drive a TFT display, an external relay, and an LED ring that visualises epoch progress.
---

This workshop covers reading data from the blockchain in intervals and using that data to trigger actions on your microcontroller. You will work with two more Cardano APIs (Koios and Blockfrost) and learn how to wire external hardware - a TFT display, a relay, and a WS2812 LED ring - to the ESP32.

> Source code: [github.com/CardanoThings/Workshops/tree/main/Workshop-02](https://github.com/CardanoThings/Workshops/tree/main/Workshop-02)

## Steps

1. **[Fetch your Wallet Balance](./01-fetch-wallet-balance.md)** - Poll your stake address balance via Koios (and Blockfrost as an alternative), parse the JSON, and detect changes.
2. **[Display Data on your Microcontroller](./02-display-data.md)** - Configure the TFT_eSPI library for the Cheap Yellow Display and render the wallet balance on a 320×240 TFT.
3. **[Light up the Tree](./03-light-up-the-tree.md)** - Drive a 110V/220V relay from on-chain events. Includes safety guidance.
4. **[Epoch Clock](./04-epoch-clock.md)** - Build a physical Epoch Clock on a 12-LED WS2812 ring that lights up progressively as the epoch advances.

## What you'll need

- Everything from Workshop 01.
- A TFT display (the workshop uses the Cheap Yellow Display).
- A relay module (with status LED).
- A 12-LED WS2812 ring (NeoPixel) and an external 5V supply if you want to run it brighter than ~2%.
- Breadboard, jumper wires.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/02-read-and-output) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-02](https://github.com/CardanoThings/Workshops/tree/main/Workshop-02).*
