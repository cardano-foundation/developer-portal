---
id: overview
slug: /developers/curriculum/dapps/iot/qr-code-payments/
title: "Workshop 05: QR-Code Payments"
sidebar_label: Overview
description: Build a CIP-13 QR-code payment terminal on the ESP32 - a webserver hosts the UI, the TFT shows the QR, and Koios confirms the payment on-chain.
---

This final workshop combines everything from the previous ones into a working payment terminal. The microcontroller hosts a small webserver (LittleFS-served HTML/CSS/JS), the operator creates a payment request from the browser, the TFT displays a [CIP-13](https://cips.cardano.org/cip/CIP-0013) `web+cardano:` QR code, and the device polls Koios `/address_utxos` until a UTxO with the expected exact lovelace amount appears.

> Source code: [github.com/CardanoThings/Workshops/tree/main/Workshop-05](https://github.com/CardanoThings/Workshops/tree/main/Workshop-05)

## Steps

1. **[Getting Started](./01-getting-started.md)** - Project structure, LittleFS, and the basic webserver that serves an `index.html` from the device.
2. **[CIP-13 Integration](./02-cip13-integration.md)** - What CIPs are, the `web+cardano:` URI scheme, and how amounts and addresses encode into a payment URI.
3. **[QR-Code Creation](./03-qr-code-creation.md)** - Render a QR code on the TFT using the QRcodeDisplay + QRcode_eSPI libraries.
4. **[Building the Frontend](./04-building-the-frontend.md)** - HTML/CSS/JS for a simple payment-request UI served from LittleFS.
5. **[Building the Backend](./05-building-the-backend.md)** - Webserver routes, a JSON store of payment requests, and the on-chain transaction listener that matches by exact lovelace amount.

## What you'll need

- Cheap Yellow Display (or compatible ESP32 + TFT) from earlier workshops.
- Two Cardano wallets (one to pay from, one to receive) on Preprod.
- LittleFS upload tool for the Arduino IDE.
- All libraries from previous workshops, plus QRcodeDisplay and QRcode_eSPI.

> **Note on CIP-13 today.** As of the workshop's writing, no major mobile wallet correctly attaches the exact-lovelace amount from a `web+cardano:` URI. To exercise the on-chain confirmation flow you'll need to send the exact amount manually from a desktop wallet. Track the [CIP-0013 spec](https://cips.cardano.org/cip/CIP-0013) for progress.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/05-qr-code-payments) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-05](https://github.com/CardanoThings/Workshops/tree/main/Workshop-05).*
