---
id: 02-display-data
title: Display Data on your Microcontroller
sidebar_label: 02 - Display Data
description: Configure the TFT_eSPI library for the Cheap Yellow Display and render the wallet balance on a 320x240 TFT.
---

Take the wallet-balance polling from the previous lesson and put it on a screen.

:::info Hardware
This lesson assumes the **Cheap Yellow Display (CYD)** with its built-in TFT. If you have a small I2C OLED instead (typical SSD1306 0.96", 128×64), the wiring and library are different - see the dropdown below.
:::

<details>
<summary>**Reference: small I2C OLED display (SSD1306)**</summary>

If your hardware is an ESP32-C3 with a small SSD1306 OLED instead of the CYD, here's the minimum-viable display sketch using `Adafruit_SSD1306` over I2C.

**Install libraries** in the Arduino IDE Library Manager:

- **Adafruit SSD1306** (by Adafruit)
- **Adafruit GFX Library** (dependency)

**Wiring (ESP32-C3):**

| OLED pin | ESP32-C3 pin |
|---|---|
| VCC | 3.3V |
| GND | GND |
| SDA | GPIO 8 |
| SCL | GPIO 9 |

GPIO 8 / 9 are the default I2C pins on the ESP32-C3. If your board differs, adjust the `I2C_SDA` / `I2C_SCL` defines.

```cpp
/*
 * ESP32-C3 I2C OLED Display Example (SSD1306)
 *
 * Display text and shapes on a 0.96" 128x64 OLED.
 *
 * Connections:
 *   OLED VCC -> ESP32 3.3V
 *   OLED GND -> ESP32 GND
 *   OLED SDA -> ESP32 GPIO 8
 *   OLED SCL -> ESP32 GPIO 9
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C  // or 0x3D, use the I2C scanner if unsure

#define I2C_SDA 8
#define I2C_SCL 9

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(I2C_SDA, I2C_SCL);

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("SSD1306 allocation failed");
    for (;;);
  }

  Serial.println("OLED Display initialized!");
}

void loop() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Small Text");

  display.setTextSize(2);
  display.setCursor(0, 15);
  display.println("Medium");

  display.setTextSize(3);
  display.setCursor(0, 40);
  display.println("Big!");

  display.drawRect(95, 5, 30, 25, SSD1306_WHITE);

  display.display();
  delay(2000);
}
```

To adapt the rest of this lesson for the OLED: replace each `tft.*` call with the corresponding `display.*` call (`display.fillRect`, `display.setCursor`, `display.println`, then `display.display()` to push the buffer).

</details>

## Introduction to TFT_eSPI

[TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) is a powerful library for driving TFT displays from ESP32 / ESP8266. It supports many display chips and gives you fast text, shapes, image and sprite rendering with rotation support.

## Installing and configuring the library

### Step 1: Install TFT_eSPI

1. Open Arduino IDE.
2. **Sketch → Include Library → Manage Libraries**.
3. Search for **TFT_eSPI**.
4. Install the library by Bodmer.

### Step 2: Configure for the CYD

TFT_eSPI needs to be configured for your specific display. Easiest path is to drop in a CYD-specific `User_Setup.h`:

1. Download the [CYD `User_Setup.h`](https://github.com/witnessmenow/ESP32-Cheap-Yellow-Display/blob/main/DisplayConfig/User_Setup.h) from the ESP32-Cheap-Yellow-Display repo.
2. Find your TFT_eSPI library folder:
   - **Windows:** `Documents\Arduino\libraries\TFT_eSPI\`
   - **macOS:** `~/Documents/Arduino/libraries/TFT_eSPI/`
   - **Linux:** `~/Arduino/libraries/TFT_eSPI/`
3. Replace the existing `User_Setup.h` with the downloaded one.
4. Restart Arduino IDE so the new config takes effect.

:::warning Without this step, the display won't work
The CYD-specific `User_Setup.h` configures: ILI9341_2_DRIVER, 240×320 resolution, the right GPIO pins, 55 MHz SPI, and GPIO 21 for backlight.
:::

## Testing the display

Before fetching wallet data, verify the display works with a Hello World - centred white text on a blue background.

```cpp
// Include TFT display library
#include <TFT_eSPI.h>
#include <SPI.h>

// Create TFT display object
TFT_eSPI tft = TFT_eSPI();

// Define custom gray color (RGB565 format: 5 bits red, 6 bits green, 5 bits blue)
#define TFT_GRAY 0x7BEF

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);

    // Initialize TFT display
    tft.init();

    // Set display rotation (1 = landscape)
    tft.setRotation(1);

    // Invert display colors (required for some CYD displays)
    tft.invertDisplay(true);

    // Fill entire screen with blue background
    tft.fillScreen(TFT_BLUE);

    // Set text properties
    tft.setTextColor(TFT_WHITE, TFT_BLUE);  // White text on blue background
    tft.setTextSize(3);                      // Large text size

    // Calculate text position to center it on screen
    String text = "Hello World!";
    int textWidth = text.length() * 6 * 3;   // Approximate width (6 pixels per char * text size)
    int textHeight = 8 * 3;                  // Approximate height (8 pixels * text size)
    int textX = (320 - textWidth) / 2;       // Center horizontally (320 is screen width)
    int textY = (240 - textHeight) / 2;      // Center vertically (240 is screen height)

    // Display the centered text
    tft.setCursor(textX, textY);
    tft.println("Hello World!");

    Serial.println("Display test complete!");
}

void loop() {
    // Nothing to do in the loop for this test
}
```

> Source: [`Workshop-02/examples/display-hello-world/display-hello-world.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/display-hello-world/display-hello-world.ino)

If you see "Hello World!" on a blue screen, you're good. If you see corrupted graphics or nothing at all, double-check that you replaced `User_Setup.h`.

### Understanding the code

- **`tft.init()`** - initialises the display.
- **`tft.setRotation(1)`** - landscape orientation. Values 0-3 rotate by 90° each.
- **`tft.invertDisplay(true)`** - some CYDs have inverted colours; without this, blue may show as yellow.
- **`tft.fillScreen(TFT_BLUE)`** - fills the screen with a colour constant.
- **`tft.setTextColor(fg, bg)`** - text colour and background.
- **`tft.setTextSize(size)`** - size multiplier for the default font.
- **`tft.setCursor(x, y)`** - origin (0,0) is top-left.

:::info Screen dimensions
The CYD is 320×240 in landscape (rotation 1). Use those dimensions when centring text.
:::

## Displaying the wallet balance

Now combine the previous lesson's Koios fetch with the display: white text on blue, balance in large type, a live timestamp updating every second, balance refreshed every 60 seconds.

```cpp
// Include necessary libraries
#include <WiFi.h>              // WiFi connectivity
#include <HTTPClient.h>       // HTTP client for API calls
#include <ArduinoJson.h>      // JSON parsing
#include <TFT_eSPI.h>         // TFT display library
#include <SPI.h>               // SPI communication for display

// Create TFT display object
TFT_eSPI tft = TFT_eSPI();

// WiFi credentials - replace with your network details
const char* ssid = "Your SSID";
const char* password = "Your Password";

// Koios API endpoint for fetching account information
const char* apiUrl = "https://preprod.koios.rest/api/v1/account_info";

// Your Cardano stake address (Preprod Testnet)
String stakeAddress = "stake_test1...";

// Variables for timing balance checks
unsigned long lastCheck = 0;                    // Timestamp of last balance check
const unsigned long checkInterval = 60000;      // Check every 60 seconds
unsigned long lastFetchTime = 0;                // Timestamp of last successful fetch
unsigned long lastDisplayUpdate = 0;            // Timestamp of last display update
const unsigned long displayUpdateInterval = 1000; // Update display every 1 second

// Store current balance to detect changes
float currentBalance = 0.0;

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);

    // Initialize TFT display
    tft.init();
    tft.setRotation(1);        // Set to landscape orientation
    tft.invertDisplay(true);   // Invert colors for correct display
    tft.fillScreen(TFT_BLUE);  // Fill screen with blue background
    tft.setTextColor(TFT_WHITE, TFT_BLUE);  // White text on blue background
    tft.setTextSize(2);        // Set text size

    // Display startup message on screen
    tft.setCursor(10, 10);
    tft.println("Connecting...");

    // Start WiFi connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // Clear screen and show connection success
    tft.fillScreen(TFT_BLUE);
    tft.setCursor(10, 10);
    tft.println("Connected!");
    delay(1000);

    // Perform initial balance fetch and display
    fetchStakeBalance();
}

void loop() {
    // Check if WiFi connection is still active
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Reconnecting...");
        WiFi.reconnect();

        while (WiFi.status() != WL_CONNECTED) {
            delay(1000);
            Serial.print(".");
        }
        Serial.println("Reconnected!");
    }

    // Get current time in milliseconds
    unsigned long currentMillis = millis();

    // Check if enough time has passed since last check
    if (currentMillis - lastCheck >= checkInterval) {
        fetchStakeBalance();
        lastCheck = currentMillis;  // Update last check timestamp
    }

    // Update the timestamp display every second
    if (currentMillis - lastDisplayUpdate >= displayUpdateInterval) {
        updateTimestamp();
        lastDisplayUpdate = currentMillis;
    }
}

void fetchStakeBalance() {
    // Only proceed if WiFi is connected
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;

        // Initialize HTTP client with API URL
        http.begin(apiUrl);

        // Set content type header for JSON request
        http.addHeader("Content-Type", "application/json");

        // Create JSON payload with stake address
        // Koios API expects stake addresses in an array under "_stake_addresses" key
        String jsonPayload = "{\\"";
        jsonPayload += "_stake_addresses";
        jsonPayload += "\\":[\\"";
        jsonPayload += stakeAddress;
        jsonPayload += "\\"]}";

        // Send POST request and get response code
        int httpResponseCode = http.POST(jsonPayload);

        // Check if request was successful (response code > 0)
        if (httpResponseCode > 0) {
            // Get response body as string
            String response = http.getString();
            Serial.println("HTTP Response Code: " + String(httpResponseCode));

            // Create JSON document to parse response (2048 bytes buffer)
            DynamicJsonDocument doc(2048);
            DeserializationError error = deserializeJson(doc, response);

            // Check if JSON parsing was successful
            if (!error) {
                // Verify response is an array with at least one element
                if (doc.is<JsonArray>() && doc.size() > 0) {
                    // Get first account info object from array
                    JsonObject accountInfo = doc[0];

                    // Extract total balance as string (Koios returns balance as string)
                    // total_balance includes delegated amount + rewards
                    const char* balanceStr = accountInfo["total_balance"];

                    // Convert string to long long (for large Lovelace values)
                    long long balanceLovelace = 0;
                    if (balanceStr != nullptr) {
                        balanceLovelace = atoll(balanceStr);
                    }

                    // Convert from Lovelace to tADA (test ADA)
                    // 1 tADA = 1,000,000 Lovelace
                    float balance = balanceLovelace / 1000000.0;

                    // Print account information
                    Serial.println("Stake Address: " + String(accountInfo["stake_address"].as<const char*>()));
                    Serial.println("Total Balance: " + String(balance, 6) + " tADA");

                    // Check if balance has changed since last check
                    if (balance != currentBalance) {
                        if (balance > currentBalance) {
                            Serial.println("✓ Balance increased!");
                        } else if (balance < currentBalance) {
                            Serial.println("✓ Balance decreased!");
                        }
                        // Update current balance
                        currentBalance = balance;
                    }

                    // Update last fetch time and refresh full display
                    lastFetchTime = millis();
                    updateDisplay();
                }
            } else {
                // Print error if JSON parsing failed
                Serial.print("JSON parsing failed: ");
                Serial.println(error.c_str());
            }
        } else {
            // Print error if HTTP request failed
            Serial.println("Error in HTTP request");
            Serial.println("HTTP Response Code: " + String(httpResponseCode));
        }

        // Close HTTP connection
        http.end();
    } else {
        Serial.println("WiFi not connected");
    }
}

void updateDisplay() {
    // Fill entire screen with blue background
    tft.fillScreen(TFT_BLUE);

    // Display title "Wallet Balance" in white
    tft.setTextSize(2);
    tft.setTextColor(TFT_WHITE, TFT_BLUE);
    tft.setCursor(10, 10);
    tft.println("Wallet Balance");

    // Display balance amount in large white text
    tft.setTextSize(4);
    tft.setTextColor(TFT_WHITE, TFT_BLUE);
    tft.setCursor(10, 50);
    tft.print(String(currentBalance, 2));  // Format to 2 decimal places

    // Display "ADA" unit
    tft.setTextSize(2);
    tft.println(" ADA");

    // Display initial timestamp
    updateTimestamp();
}

void updateTimestamp() {
    // Calculate seconds since last fetch
    unsigned long secondsAgo = (millis() - lastFetchTime) / 1000;

    // Clear the timestamp area (blue rectangle over the old text)
    tft.fillRect(10, 220, 200, 10, TFT_BLUE);

    // Display last update timestamp in lower left corner
    tft.setTextSize(1);
    tft.setTextColor(TFT_WHITE, TFT_BLUE);
    tft.setCursor(10, 220);
    tft.print("Updated ");
    tft.print(secondsAgo);
    tft.println("s ago");
}
```

> Source: [`Workshop-02/examples/display-wallet-balance/display-wallet-balance.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/display-wallet-balance/display-wallet-balance.ino)

Replace WiFi credentials and your stake address before uploading. You should see your tADA balance update every minute and the timestamp tick every second.

## Next steps
You can now poll on-chain data and render it on a screen. From here, try other Koios endpoints, or build alternative visualisations on the same hardware. The next lessons in this workshop add hardware actuation: a relay (drive a real light bulb) and an LED ring (an Epoch Clock).

## Further Resources

- [TFT_eSPI on GitHub](https://github.com/Bodmer/TFT_eSPI) - the library.
- [Adafruit GFX Graphics Library](https://learn.adafruit.com/adafruit-gfx-graphics-library) - TFT_eSPI builds on this.
- [Arduino TFT_eSPI Reference](https://docs.arduino.cc/libraries/tft_espi/) - Arduino's library docs.
- [ESP32-Cheap-Yellow-Display](https://github.com/witnessmenow/ESP32-Cheap-Yellow-Display) - community resources for the CYD.
- [LVGL](https://github.com/lvgl/lvgl) - much more featureful UI library if you outgrow TFT_eSPI.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/02-read-and-output/display-data) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-02](https://github.com/CardanoThings/Workshops/tree/main/Workshop-02).*
