---
id: 03-qr-code-creation
title: QR-Code Creation
sidebar_label: 03 - QR-Code Creation
description: Render a QR code on the TFT using the QRcodeDisplay + QRcode_eSPI libraries.
---

Now turn the CIP-13 payment URI from the previous lesson into a QR code on the TFT - scannable by a mobile wallet.

## Introduction

You already know how easy CIP-13 makes payment links. The next step is rendering the link as a QR code on the TFT display so a mobile wallet can scan it. The work splits into two parts: install the QR-code libraries, then write a small sketch that turns a string into a sprite and pushes it to the screen. With those pieces in place, we can drop in any payment URI in the next lessons.

## Installing required libraries

Two libraries needed: **QRcodeDisplay** (the core QR generator) and **QRcode_eSPI** (the TFT_eSPI adapter). Install both - `QRcode_eSPI` depends on `QRcodeDisplay`. You should already have TFT_eSPI installed and configured from [Workshop 02](/docs/developers/curriculum/dapps/iot/read-and-output/02-display-data).

### Step 1: Install QRcodeDisplay

1. Open Arduino IDE.
2. **Sketch → Include Library → Manage Libraries** (or `Ctrl+Shift+I` / `⌘+Shift+I`).
3. Search for **"QRcodeDisplay"**.
4. Find **"QRcodeDisplay" by yoprogramo**.
5. Click **Install**.

### Step 2: Install QRcode_eSPI

1. In the same Library Manager, search **"QRcode_eSPI"**.
2. Find **"QRcode_eSPI" by yoprogramo**.
3. Click **Install**.

## QR code basics example

The example generates a QR code containing a URL and renders it on your TFT. Most of the code is familiar from earlier lessons; the only new bit is QR generation. The QR is rendered to a sprite (off-screen buffer) first so you can position it freely before drawing it.

```cpp
/*
 * This sketch renders a QR code to a sprite and displays it on a TFT screen.
 * The QR code is drawn to a sprite first, allowing for flexible positioning
 * and manipulation before displaying it on the screen.
 */

#include <SPI.h>
#include <TFT_eSPI.h>
#include <qrcode_espi.h>

// Display object - handles communication with the TFT screen
TFT_eSPI display = TFT_eSPI();

// Sprite object - an off-screen buffer for drawing the QR code
// Sprites allow you to draw to memory first, then push to the display
TFT_eSprite sprite = TFT_eSprite(&display);

// QR code generator - configured to draw to the sprite instead of directly to
// display
QRcode_eSPI qrcode(&sprite);

void setup() {
  // Initialize the display
  display.begin();

  // Invert display colors (useful for certain display types)
  display.invertDisplay(true);

  // Set display rotation (0 = portrait, 1-3 = other orientations)
  display.setRotation(0);

  // Fill the entire screen with black background
  display.fillScreen(TFT_BLACK);

  // ===== QR Code Sprite Setup =====
  // Set the desired QR code size in pixels
  // The sprite will be this size, and the QR code will be scaled to fit
  int qrSize = 200;

  // Create a sprite (off-screen buffer) with the specified dimensions
  // This allocates memory for a 200x200 pixel image
  sprite.createSprite(qrSize, qrSize);

  // Fill the sprite with white background (QR codes need white background)
  sprite.fillSprite(TFT_WHITE);

  // ===== QR Code Generation =====
  // Initialize the QR code generator with the sprite dimensions
  // This automatically calculates the scaling factor (multiply) based on:
  // multiply = spriteSize / WD (where WD is the QR code module width)
  // The QR code will be automatically scaled and centered within the sprite
  qrcode.init();

  // Generate and render the QR code to the sprite
  // The string will be encoded as a QR code and drawn to the sprite buffer
  qrcode.create("https://cardanothings.io");

  // ===== Display Positioning =====
  // Calculate position to center the sprite on the display
  // You can modify these values to position the QR code anywhere on screen
  int spriteX =
      (display.width() - qrSize) / 2; // X position (centered horizontally)
  int spriteY =
      (display.height() - qrSize) / 2; // Y position (centered vertically)

  // Push the sprite to the display at the calculated position
  // This copies the sprite buffer to the display at coordinates (spriteX,
  // spriteY)
  sprite.pushSprite(spriteX, spriteY);
}

void loop() {
  // Nothing to do in the loop - QR code is static
  // The delay prevents the loop from running too fast
  delay(1000);
}
```

> Source: [`Workshop-05/examples/qr-code-basics/qr-code-basics.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/qr-code-basics/qr-code-basics.ino)

:::info Sprites and memory
Sprites are off-screen RAM buffers - they prevent flicker and let you position before display. They're not free though: a 200×200 sprite eats ~80 KB (200 × 200 × 2 bytes per pixel). The ESP32 typically has 200-300 KB free, so be mindful. If you hit out-of-memory errors, reduce `qrSize`.
:::

## Next steps

Try a CIP-13 payment URI right now - generate one for the CardanoThings PingPong wallet (below) and send some tADA around with your mobile wallet.

:::tip CardanoThings PingPong wallet
Generate a `web+cardano:` URI pointing at this address, render it via the QR sketch above, scan with Yoroi Mobile, and pay. The PingPong wallet auto-refunds (minus fees) within ~60 seconds, so you'll see the round-trip immediately.

Address: `addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w`

Preprod-only.
:::

The next two lessons build the full payment terminal: a frontend that creates payment requests, a backend that displays the QR on the TFT and listens for confirmations on-chain.

## Further Resources

- [QRcodeDisplay](https://github.com/yoprogramo/QRcodeDisplay) - the core library.
- [QRcode_eSPI](https://github.com/yoprogramo/QRcode_eSPI) - TFT_eSPI adapter.
- [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) - the display library.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/05-qr-code-payments/qr-code-creation) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-05](https://github.com/CardanoThings/Workshops/tree/main/Workshop-05).*
