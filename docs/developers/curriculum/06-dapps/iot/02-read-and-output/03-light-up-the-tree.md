---
id: 03-light-up-the-tree
title: Light up the Tree
sidebar_label: 03 - Light up the Tree
description: Drive a 110V/220V relay from on-chain events. Switch a real light bulb on when funds arrive at your wallet.
---

Connect a relay to the ESP32 and switch a real light (or any AC appliance) based on what happens on-chain. Receiving funds turns the relay on; sending them turns it off.

:::danger Safety warning - high voltage
This lesson involves working with **110V/220V mains relays**. High voltage can cause serious injury, death, or destroyed equipment if mishandled.

Only proceed if you:

- Understand basic electronics and electrical safety.
- Know how to safely work with mains voltage.
- Understand the risks of relays and high-voltage circuits.
- Have appropriate PPE and a safe work area.

If unsure, use the LED examples first; consult someone experienced before connecting a relay; never work with live mains without proper training. We're not responsible for any injury or damage.
:::

## Hardware requirements

- ESP32-C3 microcontroller.
- Hardware relay module (with status LED - easier to debug).
- Breadboard and jumper wires.
- Optional: soldering iron for permanent installs.
- **Recommended for testing:** an LED + resistor before going to the relay.

## Introduction to external hardware

Microcontrollers run at 3.3V or 5V; they can't drive 110V/220V appliances directly. They control them through interface components - most commonly relays.

A **relay** is an electrically operated switch: a low-power signal from the microcontroller controls a high-power circuit. Internally an electromagnet physically moves a switch contact, providing electrical isolation between the control side (low voltage) and the load side (high voltage).

:::info Choosing a relay module
Pick one with a **status LED** - it lights up when the relay activates, so you can see your code is working without actually wiring up a high-voltage device.
:::

### Why use a relay?

- **Safety** - electrical isolation between control and load.
- **Power handling** - switch loads way beyond what the microcontroller can supply.
- **Versatility** - switches AC or DC.
- **Reliability** - physical switching, robust at high currents.

## Wiring

A typical relay module has:

- **Input pins (VCC, GND, IN)** - to the microcontroller.
- **Output terminals (NO, COM, NC)** - for the high-voltage device.
- **Optocoupler** - isolates control and load.
- **Status LED** - indicates when the relay is active.

### To the microcontroller

1. **VCC →** 5V (or 3.3V - check your module's spec).
2. **GND →** GND.
3. **IN (Signal) →** any GPIO (e.g., GPIO 2).

:::info ESP32-C3 pinout reference
Need a pinout reference for wiring? See the interactive ESP32-C3 pinout at [cardanothings.io](https://cardanothings.io), the official [ESP32-C3 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf), or your board's specific schematic. Common pin protocols on the C3: **SPI** uses MOSI / MISO / SCK / SS-CS; **I2C** uses SDA / SCL (typically GPIO 8 / 9); **UART** uses TX / RX.
:::

### To the device

The output side has three terminals:

- **COM** - common.
- **NO (Normally Open)** - disconnected from COM when off; connected when on.
- **NC (Normally Closed)** - connected to COM when off; disconnected when on.

For "turn the light on when activated," wire COM and NO:

1. Hot/live wire from the power source → COM.
2. One wire from your device → NO.
3. Neutral from the device back to the power source's neutral.

:::info Active LOW vs Active HIGH
Most relay modules are **active LOW** - set the GPIO LOW to turn the relay on. Some are active HIGH. Check your module. You'll know it's working when you hear the click and the status LED lights.
:::

## Blink test

Before going on-chain, verify the relay works with a blink: ON for 2s, OFF for 2s.

```cpp
// Simple Relay Blink Example
// This example demonstrates basic relay control without any network connectivity
// Perfect for testing your relay wiring before adding blockchain integration
//
// Wiring:
//   VCC -> 3.3V or 5V (check your relay module specifications)
//   GND -> GND
//   IN  -> GPIO 4 (or any available GPIO pin)
//
// Note: Most relay modules are active LOW (LOW = ON, HIGH = OFF)
// If your relay doesn't work, try reversing HIGH and LOW

// Define the GPIO pin connected to the relay IN pin
const int relayPin = 4;  // Change this to match your wiring

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);

    // Wait for serial port to initialize
    delay(1000);

    // Configure relay pin as output
    pinMode(relayPin, OUTPUT);

    // Set relay to OFF state initially
    // For active LOW relays: HIGH = OFF, LOW = ON
    // For active HIGH relays: LOW = OFF, HIGH = ON
    // Try both if unsure - you'll hear a click when the relay activates
    digitalWrite(relayPin, HIGH);  // Start with relay OFF

    Serial.println("Relay Blink Example");
    Serial.println("Relay will turn ON for 2 seconds, then OFF for 2 seconds");
    Serial.println("You should hear a click when the relay activates");
}

void loop() {
    // Turn relay ON
    // For active LOW: set pin to LOW
    // For active HIGH: set pin to HIGH
    Serial.println("Relay ON");
    digitalWrite(relayPin, LOW);  // LOW activates active LOW relays
    delay(2000);                  // Keep relay ON for 2 seconds

    // Turn relay OFF
    // For active LOW: set pin to HIGH
    // For active HIGH: set pin to LOW
    Serial.println("Relay OFF");
    digitalWrite(relayPin, HIGH); // HIGH deactivates active LOW relays
    delay(2000);                  // Keep relay OFF for 2 seconds

    // This creates a continuous 2-second ON/OFF cycle
    // You should hear the relay clicking every 2 seconds
}
```

> Source: [`Workshop-02/examples/relay-blink/relay-blink.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/relay-blink/relay-blink.ino)

If it doesn't click, try inverting HIGH/LOW (some relays are active HIGH).

## Putting it on-chain

Now wire the relay to wallet events. Receiving funds → relay on. Sending funds → relay off.

```cpp
// Include necessary libraries for WiFi, HTTP requests, and JSON parsing
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials - replace with your network details
const char* ssid = "Your SSID";
const char* password = "Your Password";

// Koios API endpoint for fetching address information
const char* apiUrl = "https://preprod.koios.rest/api/v1/address_info";

// Your Cardano wallet address (Preprod Testnet)
String walletAddress = "addr_test1...";

// GPIO pin connected to relay module control input
const int relayPin = 4;

// Variables for timing balance checks
unsigned long lastCheck = 0;                    // Timestamp of last balance check
const unsigned long checkInterval = 30000;      // Check every 30 seconds

// Store previous balance to detect changes
float previousBalance = 0;

// Track current light state
bool lightState = false;

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);

    // Configure relay pin as output
    pinMode(relayPin, OUTPUT);

    // Start with light off (LOW = relay off for most modules)
    digitalWrite(relayPin, LOW);

    // Start WiFi connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");

    // Perform initial balance check on startup
    fetchWalletBalance();
}

void loop() {
    // Check if WiFi connection is still active
    if (WiFi.status() != WL_CONNECTED) {
        WiFi.reconnect();
        while (WiFi.status() != WL_CONNECTED) {
            delay(1000);
        }
    }

    // Get current time in milliseconds
    unsigned long currentMillis = millis();

    // Check if enough time has passed since last check
    if (currentMillis - lastCheck >= checkInterval) {
        fetchWalletBalance();
        lastCheck = currentMillis;  // Update last check timestamp
    }
}

void fetchWalletBalance() {
    // Only proceed if WiFi is connected
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;

        // Initialize HTTP client with API URL
        http.begin(apiUrl);

        // Set content type header for JSON request
        http.addHeader("Content-Type", "application/json");

        // Create JSON payload with wallet address
        String jsonPayload = "{\"_addresses\":[\"" + walletAddress + "\"]}";

        // Send POST request
        int httpResponseCode = http.POST(jsonPayload);

        // Check if request was successful
        if (httpResponseCode > 0) {
            // Get response body as string
            String response = http.getString();

            // Create JSON document to parse response
            DynamicJsonDocument doc(2048);
            DeserializationError error = deserializeJson(doc, response);

            // Check if JSON parsing was successful and response has data
            if (!error && doc.is<JsonArray>() && doc.size() > 0) {
                // Get first address info object from array
                JsonObject addressInfo = doc[0];

                // Extract balance and convert from Lovelace to ADA
                float balance = addressInfo["balance"] | 0.0;
                balance = balance / 1000000;  // 1 ADA = 1,000,000 Lovelace

                // Check if balance increased (new transaction received)
                if (balance > previousBalance) {
                    Serial.println("New transaction detected! Turning on light...");
                    turnOnLight();  // Activate relay to turn on light
                } else if (balance < previousBalance) {
                    // Balance decreased (funds sent out)
                    Serial.println("Balance decreased. Turning off light...");
                    turnOffLight();  // Deactivate relay to turn off light
                }

                // Update previous balance for next comparison
                previousBalance = balance;
            }
        }

        // Close HTTP connection
        http.end();
    }
}

void turnOnLight() {
    // Set relay pin HIGH to activate relay (turn on light)
    digitalWrite(relayPin, HIGH);
    lightState = true;
    Serial.println("Light is ON");
}

void turnOffLight() {
    // Set relay pin LOW to deactivate relay (turn off light)
    digitalWrite(relayPin, LOW);
    lightState = false;
    Serial.println("Light is OFF");
}
```

> Source: [`Workshop-02/examples/relay-events/relay-events.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/relay-events/relay-events.ino)

Replace WiFi credentials and your wallet address (use a Preprod address starting with `addr_test1...`) before uploading. Send a test transaction to your wallet - the relay should fire.

:::tip CardanoThings PingPong wallet
For testing the relay loop without burning real test transactions, send tADA to the CardanoThings **PingPong** wallet - it auto-refunds your transaction (minus fees) within ~60 seconds, which round-trips through your wallet and triggers the relay twice.

Address: `addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w`

Preprod-only.
:::

## Next steps
You now have the building blocks for blockchain-driven actuation. A few directions:

- **Automated fountains.** Trigger when a specific transaction arrives.
- **Vending machine.** Dispense product when payment confirms.
- **Smart-home integration.** Lights, fans, appliances driven by token holdings or specific events.
- **Event-driven displays.** Update a sign when conditions are met on-chain.

## Further Resources

- [Arduino `digitalWrite()` reference](https://www.arduino.cc/reference/en/language/functions/digital-io/digitalwrite/) - controlling digital pins.
- [Intro to ESP32-C3](https://www.youtube.com/watch?v=V9I9koQ0AeA) - video.
- [Relays explained](https://www.youtube.com/watch?v=jXcdH1PgmMI) - how they work.
- [SPI tutorial](https://www.youtube.com/watch?v=ZGaCXHvgcE4) and [I2C tutorial](https://www.youtube.com/watch?v=pxhg2Rwm_h8) - for when you wire more peripherals.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/02-read-and-output/light-up-the-tree) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-02](https://github.com/CardanoThings/Workshops/tree/main/Workshop-02).*
