---
id: overview
slug: /developers/curriculum/dapps/iot/hardware/
title: Hardware Reference
sidebar_label: Overview
description: Hardware components used across the IoT-on-Cardano workshops - boards, sensors, displays, relays, and where to source them.
---

Reference pages for each hardware component the workshops in this section use. Each page covers what the part is, key specs, links to datasheets and tutorials, and suggested suppliers.

## Boards

- **[Cheap Yellow Display (CYD)](./cheap-yellow-display-cyd.md)** - ESP32 + 2.8" TFT touchscreen in one board. Used in Workshops 02, 04, and 05.
- **[ESP32-C3](./esp32-c3.md)** - RISC-V SoC with WiFi + Bluetooth 5 (LE). The default board used across all five workshops.

## Displays

- **[1.3" OLED Display (SH1106, I2C)](./oled-display-sh1106-13inch-i2c.md)** - Compact monochrome OLED used in Workshop 03 as an alternative to the CYD's TFT.

## Sensors

- **[AHT10 Temperature & Humidity Sensor (I2C)](./aht10-temperature-humidity-sensor-i2c.md)** - Used in Workshop 03 to read environmental data and put it on-chain.

## Actuators

- **[Relay Module 3V, 1 Channel](./relay-module-3v-1channel.md)** - Switches AC/DC loads from a 3.3V microcontroller. Used in Workshop 02's "Light up the Tree" lesson.
- **[WS2812B LED Ring (12 LEDs)](./ws2812b-led-ring-12.md)** - Addressable RGB LED ring used to build the Epoch Clock in Workshop 02.

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
