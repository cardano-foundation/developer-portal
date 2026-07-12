---
id: overview
slug: /developers/curriculum/dapps/iot/the-basics/
title: "Workshop 01: The Basics"
sidebar_label: Overview
description: Set up a Preprod Cardano wallet, install the Arduino IDE, prepare your microcontroller, and make your first API call to Koios.
---

This first workshop sets you up for everything that follows: install and fund a Cardano wallet on the Preprod testnet, install the Arduino IDE, set up your microcontroller, and make your first API call to a Cardano endpoint.

> Source code: [github.com/CardanoThings/Workshops/tree/main/Workshop-01](https://github.com/CardanoThings/Workshops/tree/main/Workshop-01)

## Steps

1. **[Cardano Setup](./01-cardano-setup.md)** - Install [Yoroi](https://yoroi-wallet.com/), switch to Preprod, create a wallet, and request tADA from the faucet.
2. **[Arduino Setup](./02-arduino-setup.md)** - Install the Arduino IDE, add ESP32 board support, install the CH340 driver if needed, and upload your first blink sketch.
3. **[API Setup & First Call](./03-api-setup.md)** - Use the Koios `/tip` endpoint to fetch the current epoch from your microcontroller and log it to the serial monitor.

## What you'll need

- ESP8266 or ESP32 microcontroller (the workshop uses the ESP32-C3 / Cheap Yellow Display family)
- Micro USB **data** cable (not a charge-only cable)
- A computer with the Arduino IDE installed
- WiFi with internet access
- Yoroi wallet on Preprod testnet


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/01-basics) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-01](https://github.com/CardanoThings/Workshops/tree/main/Workshop-01).*
