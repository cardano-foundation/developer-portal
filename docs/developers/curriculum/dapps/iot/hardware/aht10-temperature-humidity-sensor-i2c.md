---
id: aht10-temperature-humidity-sensor-i2c
title: AHT10 Temperature & Humidity Sensor (I2C)
sidebar_label: AHT10 Sensor (I2C)
description: High-precision digital temperature and humidity sensor from Aosong with I2C interface - used in Workshop 03 to read environmental data and put it on-chain.
---

A high-precision digital **temperature and humidity sensor** from Aosong with an I2C interface. Used in [Workshop 03 - Connect and Read Sensor Data](/docs/developers/curriculum/dapps/iot/input-and-write/01-connect-and-read-sensor-data) to read environmental data and post it on-chain as transaction metadata or NFTs.

![AHT10 sensor](./img/aht10.webp)

## Features

- Temperature: -40°C to +85°C
  - Accuracy ±0.3°C (typical), resolution 0.01°C
- Humidity: 0-100% RH
  - Accuracy ±2% RH (typical), resolution 0.024% RH
- I2C interface (SDA, SCL)
- Operating voltage: 1.8V - 6.0V (3.3V recommended)
- Low power consumption
- **Factory calibrated** - no user calibration needed
- Fast response time
- Compact SMD package

I2C address: `0x38` (fixed).

## Resources

- [AHT10 datasheet](https://www.aosong.com/userfiles/files/media/AHT10%20%E8%8B%B1%E6%96%87%E7%89%88%E6%9C%AC%20Datasheet%20AHT10.pdf)
- [Adafruit AHTX0 library](https://github.com/adafruit/Adafruit_AHTX0) - supports AHT10 and AHT20.
- [Adafruit AHT20 tutorial](https://learn.adafruit.com/adafruit-aht20/arduino) - same library, similar API.

## Where to buy

- [AliExpress](https://s.click.aliexpress.com/e/_c32qqi9D)
- [Amazon US](https://amzn.to/4jDI9fF)
- [Amazon Germany](https://amzn.to/3Ywrml8)

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware/aht10-temperature-humidity-sensor-i2c) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
