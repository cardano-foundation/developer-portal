---
id: 04-epoch-clock
title: Epoch Clock
sidebar_label: 04 - Epoch Clock
description: Build a physical Epoch Clock on a 12-LED WS2812 ring. The ring lights up progressively as the epoch advances.
---

The capstone for Workshop 02: a physical Epoch Clock that visualises Cardano epoch progress on a circular WS2812 LED ring. Each of the 12 LEDs represents 1/12th of the epoch.

## Hardware requirements

- ESP32-C3 microcontroller.
- 12-LED WS2812 LED ring (NeoPixel).
- Breadboard, jumper wires (M-M and M-F).
- Optional: soldering iron for permanent installs.

## Epochs and slots

A Cardano **epoch** is a ~5-day period during which the chain operates under specific parameters. Each epoch contains many slots; tracking the slot-within-epoch tells you how far through the epoch the chain has progressed.

This project pulls in everything from earlier lessons:

- WiFi connectivity from Workshop 01.
- API calls from this workshop's lesson 1.
- Display logic from this workshop's lesson 2.
- Hardware integration from lesson 3.

## Setting up the LED ring

We use a WS2812 (NeoPixel) ring - addressable RGB LEDs in a circle, each individually controllable. 12 LEDs is ideal because it maps cleanly to a clock-face metaphor.

:::danger Current draw warning
**WS2812 LEDs can draw significant current and damage your ESP32-C3 if mishandled.**

Current facts:
- Each LED can draw up to 60 mA at full white.
- A 12-LED ring at full white can draw **720 mA**.
- USB ports usually deliver 500 mA - 1 A. Insufficient for full brightness.
- Exceeding ratings can damage your ESP32, USB port, or supply.

Safety:
- **Always set brightness low in code** (the sketch uses 5/255 ≈ 2%) when on USB power.
- For brighter setups use an external 5V supply rated for ≥ 1 A.
- With external power, tie grounds together (common ground).
- Never run the ring at full brightness off the ESP32's 5V pin.
- Test low first, then ramp up if you have proper external power.

We're not responsible for any damage. Use the right supply and don't get cute with brightness.
:::

### Wiring

WS2812 ring pins:

- **V+** - 5V power.
- **V-** - ground.
- **IN** - data input.
- **OUT** - data output (for daisy-chaining).

Connect:

1. **V+** to 5V (low brightness on USB; external 5V for brighter).
2. **V-** to GND (common ground if external power).
3. **IN** to a GPIO pin for data (e.g., GPIO 4). WS2812 uses a single-wire timing protocol - any GPIO works.

:::info OUT pin
Only needed for daisy-chaining multiple rings. With a single ring, leave it.
:::

:::info ESP32-C3 pinout reference
Need a pinout reference for wiring? See the interactive ESP32-C3 pinout at [cardanothings.io](https://cardanothings.io), the official [ESP32-C3 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf), or your board's specific schematic. Common pin protocols on the C3: **SPI** uses MOSI / MISO / SCK / SS-CS; **I2C** uses SDA / SCL (typically GPIO 8 / 9); **UART** uses TX / RX.
:::

### Install the library

We use the Adafruit NeoPixel library:

1. Open Arduino IDE.
2. **Sketch → Include Library → Manage Libraries**.
3. Search for **Adafruit NeoPixel**.
4. Install the library by Adafruit.

## Basic LED ring test

Before wiring anything to the chain, verify the ring lights up. This sketch lights each LED in sequence at very low brightness.

```cpp
// Include the Adafruit NeoPixel library
#include <Adafruit_NeoPixel.h>

// Pin connected to the WS2812 data input
#define LED_PIN 4

// Number of LEDs in the ring (12 LEDs)
#define NUM_LEDS 12

// Create NeoPixel object
// Parameter 1 = number of pixels
// Parameter 2 = pin number
// Parameter 3 = pixel type flags (NEO_GRB + NEO_KHZ800 for WS2812)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);

    // Initialize the NeoPixel ring
    strip.begin();

    // Set brightness to a very low value (5 out of 255) to protect ESP32-C3
    // This is approximately 2% brightness - safe for USB power
    strip.setBrightness(5);

    // Clear all LEDs (turn them all off)
    strip.clear();

    // Update the strip to apply changes
    strip.show();

    Serial.println("LED Ring initialized. Starting blink sequence...");
}

void loop() {
    // Loop through all 12 LEDs one at a time
    for (int i = 0; i < NUM_LEDS; i++) {
        // Clear all LEDs first
        strip.clear();

        // Set the current LED to white (R=255, G=255, B=255)
        // The brightness is already limited by setBrightness(5) in setup()
        strip.setPixelColor(i, strip.Color(255, 255, 255));

        // Update the strip to show the change
        strip.show();

        // Print which LED is lit
        Serial.print("LED ");
        Serial.print(i);
        Serial.println(" ON");

        // Wait 200 milliseconds before moving to next LED
        delay(200);
    }

    // After all LEDs have been lit, clear the display
    strip.clear();
    strip.show();
}
```

> Source: [`Workshop-02/examples/led-ring-blink/led-ring-blink.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/led-ring-blink/led-ring-blink.ino)

Update `LED_PIN` to match your wiring. If no LEDs light, double-check power, ground, and the data pin.

## Fetching epoch and block data

The Koios `/tip` endpoint (from this workshop's first lesson) returns:

- **epoch_no** - current epoch.
- **epoch_slot** - slot within the current epoch (used for progress).
- **abs_slot** - absolute slot.
- **block_no** - current block height.

We use `epoch_slot` to compute progress: each epoch has ~432,000 slots. Map percent-complete onto the 12-LED ring.

:::info
At slot 216,000 in an epoch, you're at 50% - six of 12 LEDs lit.
:::

## The Epoch Clock

Combine WiFi, the API call, and ring control. The 12 LEDs light progressively in blue as the epoch progresses.

```cpp
// Include necessary libraries
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <WiFiClientSecure.h>

// Pin connected to the WS2812 data input
#define LED_PIN 4

// Number of LEDs in the ring (12 LEDs)
#define NUM_LEDS 12

// Total slots in an epoch (approximately 432,000 on Mainnet)
#define SLOTS_PER_EPOCH 432000

// Create NeoPixel object
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// WiFi credentials
const char* ssid = "Your SSID";
const char* password = "Your Password";

// Koios API endpoint
const char* apiUrl = "https://preprod.koios.rest/api/v1/tip";

// Variables for timing API calls
unsigned long lastCheck = 0;
const unsigned long checkInterval = 60000;  // Check every minute

// Variables for walking LED - creates a clock-like second hand effect
// The white LED moves around the ring every 5 seconds
// 12 LEDs × 5 seconds = 60 seconds (1 minute) for a full rotation
unsigned long lastWalkUpdate = 0;
const unsigned long walkInterval = 5000;  // Move to next LED every 5 seconds
int walkPosition = 0;  // Current position of walking LED (0-11)

// Store current epoch data
int currentEpoch = 0;
int currentEpochSlot = 0;
int lastEpoch = -1;

void setup() {
    Serial.begin(115200);

    // Initialize LED ring
    strip.begin();
    strip.setBrightness(5);  // Low brightness for safety
    strip.clear();
    strip.show();

    // Connect to WiFi
    WiFi.begin(ssid, password);
    WiFi.setTxPower(WIFI_POWER_8_5dBm);  // Workaround for ESP32-C3 Super Mini

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
    }

    // Initial fetch
    fetchEpochData();
    displayProgress();
}

void loop() {
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
        WiFi.reconnect();
        while (WiFi.status() != WL_CONNECTED) {
            delay(1000);
        }
    }

    // Check if enough time has passed for API call
    unsigned long currentMillis = millis();
    if (currentMillis - lastCheck >= checkInterval) {
        fetchEpochData();
        displayProgress();
        lastCheck = currentMillis;
    }

    // Update walking LED every 5 seconds (creates second-hand effect)
    if (currentMillis - lastWalkUpdate >= walkInterval) {
        updateWalkingLED();
        lastWalkUpdate = currentMillis;
    }
}

void fetchEpochData() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        WiFiClientSecure client;

        client.setInsecure();
        http.begin(client, apiUrl);

        int httpResponseCode = http.GET();

        if (httpResponseCode > 0) {
            String response = http.getString();

            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, response);

            if (!error && doc.is<JsonArray>() && doc.size() > 0) {
                JsonObject tip = doc[0];
                currentEpoch = tip["epoch_no"] | 0;
                currentEpochSlot = tip["epoch_slot"] | 0;

                // Reset display if epoch changed
                if (currentEpoch != lastEpoch) {
                    lastEpoch = currentEpoch;
                    strip.clear();
                    strip.show();
                    delay(500);
                }
            }
        }

        http.end();
    }
}

void displayProgress() {
    // Calculate epoch progress percentage
    int progressPercent = (currentEpochSlot * 100) / SLOTS_PER_EPOCH;
    if (progressPercent > 100) progressPercent = 100;

    // Calculate how many LEDs should be lit
    int ledsToLight = (progressPercent * NUM_LEDS) / 100;

    // Clear all LEDs
    strip.clear();

    // Light up LEDs based on progress in blue
    for (int i = 0; i < ledsToLight; i++) {
        strip.setPixelColor(i, strip.Color(0, 0, 255));  // Blue
    }

    strip.show();
}

void updateWalkingLED() {
    // Display epoch progress first (blue LEDs showing epoch completion)
    displayProgress();

    // Add white walking LED at current position (creates clock second-hand effect)
    // This LED blinks white for 5 seconds at each position before moving
    strip.setPixelColor(walkPosition, strip.Color(255, 255, 255));  // White
    strip.show();

    // Move to next position (wrap around after LED 11 to complete 60-second cycle)
    walkPosition = (walkPosition + 1) % NUM_LEDS;
}
```

> Source: [`Workshop-02/examples/epoch-clock/epoch-clock.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/epoch-clock/epoch-clock.ino)

Update `LED_PIN` and WiFi credentials. Upload, and you should see LEDs progressively light around the ring as the chain moves through the epoch.

## Next steps
You've finished Workshop 02 - you can fetch chain data, render it, and drive physical hardware off it. Some extensions:

- **Visual variations** - clockwise / anti-clockwise / alternating; animations on new blocks.
- **Colour-coded progress** - green early, yellow mid, red late in the epoch.
- **Multi-network rings** - one ring per network (mainnet / preprod / preview).
- **Epoch transition effects** - a chase animation when the new epoch starts.
- **Custom enclosures** - 3D print, laser-cut acrylic, or wood housing.
- **Battery / solar** - a portable epoch indicator.

## Further Resources

- [Adafruit NeoPixel Library](https://github.com/adafruit/Adafruit_NeoPixel) - controlling WS2812s.
- [Cardano Testnets](https://docs.cardano.org/cardano-testnets/environments) - Preview, Preprod, Mainnet.
- [Koios `/tip` endpoint](https://preprod.koios.rest/#get-/tip) - the API doc.
- [WS2812 LED guide](https://learn.adafruit.com/adafruit-neopixel-uberguide) - Adafruit's NeoPixel deep dive.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/02-read-and-output/epoch-clock) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-02](https://github.com/CardanoThings/Workshops/tree/main/Workshop-02).*
