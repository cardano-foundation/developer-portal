---
id: oled-display-sh1106-13inch-i2c
title: 1.3" OLED Display (SH1106, I2C)
sidebar_label: 1.3" OLED (SH1106)
description: Compact 1.3" monochrome OLED display with the SH1106 controller and I2C interface - used in Workshop 03 as an alternative to the CYD's TFT.
---

A compact **1.3" monochrome OLED display** with the SH1106 controller and I2C interface. Used in [Workshop 03 - Connect and Read Sensor Data](/docs/developers/curriculum/dapps/iot/input-and-write/01-connect-and-read-sensor-data) as an alternative to the CYD's TFT for showing sensor readings on a smaller, lower-power screen.

![1.3 inch OLED top](./img/oled-01.webp)
![1.3 inch OLED back](./img/oled-02.webp)
![1.3 inch OLED side](./img/oled-03.webp)
![1.3 inch OLED in use](./img/oled-04.webp)

## Features

- 1.3" diagonal display
- 128×64 pixel resolution
- SH1106 controller
- I2C interface (SDA, SCL)
- 3.3V or 5V operation
- High-contrast monochrome OLED
- Wide viewing angle, no backlight needed
- Low power consumption

:::info Note on the SSD1306 vs SH1106
There's a near-identical 0.96" OLED that uses the **SSD1306** controller. Library and addresses differ slightly. The CardanoThings workshops use the SH1106 variant, but for the SSD1306 see the inline reference block in [Workshop 02 - Display Data](/docs/developers/curriculum/dapps/iot/read-and-output/02-display-data).
:::

## Resources

- [SH1106 datasheet](https://www.velleman.eu/downloads/29/infosheets/sh1106_datasheet.pdf)
- [Adafruit SH1106 library](https://github.com/winneymj/SH1106)
- [U8glib library](https://github.com/olikraus/u8glib) - alternate driver supporting SH1106 and many others.
- [Instructables - SH1106 1.3" OLED tutorial](https://www.instructables.com/How-to-Interface-With-OLED-13-Inch-LCD128x64/)

## Where to buy

- [AliExpress](https://s.click.aliexpress.com/e/_c4sQlYaj)
- [Amazon US](https://amzn.to/4pte57L)
- [Amazon Germany](https://amzn.to/4qfU7hY)

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware/oled-display-sh1106-13inch-i2c) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
