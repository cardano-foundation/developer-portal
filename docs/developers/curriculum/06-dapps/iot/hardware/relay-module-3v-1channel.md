---
id: relay-module-3v-1channel
title: Relay Module (3V, 1 Channel)
sidebar_label: Relay Module 3V
description: Single-channel 3V relay module with optoisolation - switches AC/DC loads from a 3.3V microcontroller. Used in Workshop 02 "Light up the Tree".
---

A low-voltage **3V single-channel relay module** with opto-isolation. Switches AC or DC loads safely from a 3.3V microcontroller (ESP32) without needing a level shifter. This is the part used in [Workshop 02 - Light up the Tree](/docs/developers/curriculum/dapps/iot/read-and-output/03-light-up-the-tree).

![Relay module top](./img/relay-01.webp)
![Relay module side](./img/relay-02.webp)

## Features

- 3.3V operation (compatible with ESP32)
- Single channel
- Normally Open (NO) and Normally Closed (NC) contacts
- Max load: **10A / 250VAC** or **10A / 30VDC**
- Opto-isolated input for safety
- LED indicator for relay status
- Active LOW trigger
- No external driver circuit needed

:::danger High-voltage warning
A relay can switch mains-voltage loads (110V / 220V), which can cause serious injury or death if mishandled. Read the safety section in [Workshop 02 - Light up the Tree](/docs/developers/curriculum/dapps/iot/read-and-output/03-light-up-the-tree) before wiring anything to mains. If unsure, stick to low-voltage LED loads.
:::

## Resources

- [ESP32 IO - Relay tutorial](https://esp32io.com/tutorials/esp32-relay)
- [Random Nerd - ESP32 relay module web server](https://randomnerdtutorials.com/esp32-relay-module-ac-web-server/)

## Where to buy

- [AliExpress](https://s.click.aliexpress.com/e/_c4dcY23d)
- [Amazon US](https://amzn.to/3LHOEBA)
- [Amazon Germany](https://amzn.to/453y85x)

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware/relay-module-3v-1channel) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
