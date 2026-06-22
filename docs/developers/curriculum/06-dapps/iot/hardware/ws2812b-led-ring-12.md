---
id: ws2812b-led-ring-12
title: WS2812B LED Ring (12 LEDs)
sidebar_label: WS2812B LED Ring (12)
description: Circular RGB LED ring using 12 WS2812B addressable LEDs - used to build the Epoch Clock in Workshop 02.
---

A circular **WS2812B LED ring with 12 individually addressable RGB LEDs** (NeoPixel-compatible). Each LED gives 24-bit colour control and the ring is daisy-chainable. Used in [Workshop 02 - Epoch Clock](/docs/developers/curriculum/dapps/iot/read-and-output/04-epoch-clock).

![WS2812B ring top](./img/led-ring-01.webp)
![WS2812B ring back](./img/led-ring-02.webp)
![WS2812B ring side](./img/led-ring-03.webp)

## Features

- 12 WS2812B addressable RGB LEDs in a circle
- 24-bit colour depth (16.7 million colours)
- Single-wire data interface (DIN / DOUT)
- 5V operation (3.3V logic compatible)
- Cascadable via DOUT
- Refresh rate up to 800 Hz
- No external resistors needed
- Perfect for circular displays and progress indicators

:::danger Current draw warning
At full white, each LED can draw up to **60 mA**. A 12-LED ring at full white can draw **720 mA** - more than most USB ports can supply. Run at low brightness when on USB power, or use an external 5V supply rated for ≥ 1 A. Full safety guidance is in [Workshop 02 - Epoch Clock](/docs/developers/curriculum/dapps/iot/read-and-output/04-epoch-clock).
:::

## Resources

- [WS2812B datasheet](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf)
- [Adafruit NeoPixel library](https://github.com/adafruit/Adafruit_NeoPixel)
- [FastLED library](https://github.com/FastLED/FastLED) - alternate library, more performant for large arrays.
- [Adafruit NeoPixel Überguide](https://learn.adafruit.com/adafruit-neopixel-uberguide/arduino-library-use)

## Where to buy

- [AliExpress](https://s.click.aliexpress.com/e/_c3iXvLqP)
- [Amazon US](https://amzn.to/3NlRBIv)
- [Amazon Germany](https://amzn.to/3Yw2IRH)

---

*Adapted from the [CardanoThings](https://cardanothings.io/hardware/ws2812b-led-ring-12) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
