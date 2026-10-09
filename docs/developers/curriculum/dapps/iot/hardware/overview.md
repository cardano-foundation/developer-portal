---
id: overview
slug: /developers/curriculum/dapps/iot/hardware/
title: Hardware Reference
sidebar_label: Overview
description: The hardware the IoT-on-Cardano workshops use, what to search for to source each part, and a reference page per component with specs, pinouts, and datasheets.
---

Everything the workshops in this section use, in one place: what to get, what each part is called, and what substitutes work. Each component also has its own page with specs, pinouts, quirks, and datasheets.

## What you need

Parts are named the way a supplier lists them, so the name below is the search term. These are commodity components sold by many vendors, so this page names the part rather than a shop.

| Part | Search for | Needed by |
| --- | --- | --- |
| Microcontroller | **`ESP32-C3`** development board with USB-C. The workshops use the "Super Mini" form factor. | All workshops |
| Board with screen | **`ESP32-2432S028R`**, widely sold as the **Cheap Yellow Display** or **CYD**: an ESP32 with a built-in 2.8" TFT and resistive touch. | Workshops 02, 04, 05 |
| Display | 1.3" 128x64 monochrome I2C OLED with an **`SH1106`** controller. An **`SSD1306`** module is a common substitute and needs only a driver change in the sketch. | Workshop 03 (alternative to the CYD screen) |
| Sensor | **`AHT10`** temperature and humidity sensor, I2C breakout. The **`AHT20`** is a drop-in upgrade. | Workshop 03 |
| Actuator | Single-channel relay module with opto-isolation, rated for **3.3V logic**. | Workshop 02 |
| Actuator | **`WS2812B`** addressable RGB LED ring, 12 LEDs. Sold as NeoPixel-compatible. | Workshop 02 |
| Cabling | Breadboard, jumper wires, and a **USB data cable** (many cheap cables are charge-only and will not program the board). | All workshops |

An ESP8266 or an original ESP32 works for most lessons, with pin numbers and occasionally a library differing from what the sketches use.

## Component reference

### Boards

- **[Cheap Yellow Display (CYD)](./cheap-yellow-display-cyd.md)** - ESP32 with an integrated 2.8" TFT touchscreen. Used in Workshops 02, 04, and 05.
- **[ESP32-C3](./esp32-c3.md)** - RISC-V SoC with WiFi and Bluetooth 5 (LE). The default board across all five workshops, and the page carries the WiFi transmit-power workaround the Super Mini variant often needs.

### Displays

- **[1.3" OLED Display (SH1106, I2C)](./oled-display-sh1106-13inch-i2c.md)** - compact monochrome OLED, used in Workshop 03 as an alternative to the CYD's TFT.

### Sensors

- **[AHT10 Temperature & Humidity Sensor (I2C)](./aht10-temperature-humidity-sensor-i2c.md)** - used in Workshop 03 to read environmental data and put it on-chain.

### Actuators

- **[Relay Module 3V, 1 Channel](./relay-module-3v-1channel.md)** - switches AC or DC loads from a 3.3V microcontroller. Used in Workshop 02's "Light up the Tree" lesson.
- **[WS2812B LED Ring (12 LEDs)](./ws2812b-led-ring-12.md)** - addressable RGB ring used to build the Epoch Clock in Workshop 02.

If a board will not accept an upload or the serial monitor prints nothing, [Troubleshooting](/docs/developers/curriculum/dapps/iot/troubleshooting) covers the cable, driver, and baud-rate causes before you suspect the hardware.

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
