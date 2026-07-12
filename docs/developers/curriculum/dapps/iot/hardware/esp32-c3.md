---
id: esp32-c3
title: ESP32-C3
sidebar_label: ESP32-C3
description: RISC-V ESP32-C3 microcontroller with WiFi + Bluetooth 5 (LE) - the default board across all five workshops.
---

The **ESP32-C3** is a cost-effective, RISC-V based microcontroller with WiFi and Bluetooth 5 (LE). It's the default board for every workshop in this section - modern architecture, low power, USB-C, and good Arduino IDE support.

![ESP32-C3 top](./img/esp32c3-01.webp)
![ESP32-C3 back](./img/esp32c3-02.webp)
![ESP32-C3 side](./img/esp32c3-03.webp)

## Features

- RISC-V 32-bit single-core processor (up to 160 MHz)
- 400 KB SRAM, 384 KB ROM
- 2.4 GHz WiFi (802.11 b/g/n)
- Bluetooth 5 (LE only)
- 22 GPIOs, ADC, I2C, SPI, UART
- USB-to-UART bridge for programming
- USB-C for power / programming
- Lower power consumption than the original ESP32
- Built-in USB support

:::info ESP32-C3 quirks worth knowing
- **No 5 GHz WiFi** - Connects only to 2.4 GHz networks.
- **WiFi power workaround.** The Super Mini variant often needs `WiFi.setTxPower(WIFI_POWER_8_5dBm);` to connect reliably. See [Troubleshooting](/docs/developers/curriculum/dapps/iot/troubleshooting) for the full note.
- **Default I2C pins** are `SDA = GPIO 8`, `SCL = GPIO 9`.
:::

## Resources

- [ESP32-C3 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf)
- [ESP32-C3 Technical Reference Manual](https://www.espressif.com/sites/default/files/documentation/esp32-c3_technical_reference_manual_en.pdf)
- [ESP32-C3 Super Mini pinout diagram](https://i0.wp.com/randomnerdtutorials.com/wp-content/uploads/2025/05/ESP32-C3-Super-Mini-Pinout-f.png?w=918&quality=100&strip=all&ssl=1)
- [ESP32-C3 Super Mini case STL files](https://www.printables.com/model/1137008-esp32-c3c6h2s3-super-mini-case)
- [ESP32-C3 on Random Nerd Tutorials](https://randomnerdtutorials.com/getting-started-esp32-c3-super-mini/)
- [ESP32io.com](https://esp32io.com/) - wider ESP32 tutorial portal.

## Where to buy

- [AliExpress](https://s.click.aliexpress.com/e/_c3Eyz6EL)
- [Amazon US](https://amzn.to/49V8xgT)
- [Amazon Germany](https://amzn.to/4sv2isB)

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware/esp32-c3) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
