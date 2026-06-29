---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
description: Common issues hit while running the IoT-on-Cardano workshops - WiFi, upload failures, I2C, board detection, serial monitor.
---

Quick fixes for the issues most readers run into while working through this section.

## My ESP32-C3 won't connect to WiFi

Check WiFi credentials and confirm the ESP32-C3 is on the same network as your computer. Two things specific to the C3:

- **The ESP32-C3 will not connect to 5 GHz WiFi networks.** Use a 2.4 GHz network.
- **Use the WiFi power workaround** in your sketch:

  ```cpp
  WiFi.setTxPower(WIFI_POWER_8_5dBm);
  ```

  This sets the WiFi transmit power to 8.5 dBm and resolves connectivity issues specific to the C3.

See also: the WiFi sketch in [Workshop 01: Arduino Setup](/docs/developers/curriculum/dapps/iot/the-basics/02-arduino-setup) which already includes this workaround.

## My code won't upload to my ESP32 CYD

Check, in order:

1. **Right board and port selected** in Arduino IDE (`Tools → Board → ESP32 → ESP32 Dev Module`, then `Tools → Port`).
2. **CH340 driver installed.** The CYD uses a CH340 USB-serial chip; the driver isn't installed by default on macOS or some Windows setups. See [SparkFun's CH340 install guide](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all).
3. **Different USB cable.** Many cheap USB cables are charge-only - they don't have data lines. If your computer doesn't see the board, swap the cable.
4. **Lower the upload speed.** Drop to **115200 baud** in `Tools → Upload Speed`. Slower uploads are sometimes the only way to flash on flaky USB connections.

## I'm having issues with I2C communication

Most I2C problems boil down to one of:

- **Wrong SDA / SCL pins** in your code (check your board's actual I2C pins - for the ESP32-C3 the defaults are GPIO 8 / GPIO 9).
- **Wrong I2C address** for the device. Different sensors use different addresses (AHT10 = `0x38`, SH1106 OLED = `0x3C` or `0x3D`).
- **Missing pull-up resistors** on SDA / SCL. Most breakout boards include them; if yours doesn't, add 4.7 kΩ - 10 kΩ between each line and VCC.

If you don't know the I2C address of your device, run the **I2C scanner sketch** included in [Workshop 03: Connect and Read Sensor Data](/docs/developers/curriculum/dapps/iot/input-and-write/01-connect-and-read-sensor-data) - it enumerates every device responding on the bus.

## My board is not detected by the Arduino IDE

Check, in order:

1. **Right board selected** (`Tools → Board → ...`).
2. **ESP32 board package installed** (`Tools → Board → Boards Manager` → search "esp32" → install). See [Arduino Setup](/docs/developers/curriculum/dapps/iot/the-basics/02-arduino-setup) for the full setup.
3. **CH340 driver installed** if using the CYD. See [SparkFun's CH340 install guide](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all) or the [Adafruit CH9102 guide](https://learn.adafruit.com/how-to-install-drivers-for-wch-usb-to-serial-chips-ch9102f-ch9102/overview) for similar chips.
4. **Different USB cable** (data, not charge-only).

## My serial monitor is not working or shows garbled text

Two likely causes:

- **Baud rate mismatch.** The serial monitor's baud rate (bottom-right of the IDE's Serial Monitor) must match `Serial.begin(...)` in your sketch. The workshops all use **115200**.
- **Bad USB cable.** Same as above - try a different one.

---

*Adapted from the [CardanoThings](https://cardanothings.io/troubleshooting) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
