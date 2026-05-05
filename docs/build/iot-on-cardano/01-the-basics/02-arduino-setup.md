---
id: 02-arduino-setup
title: Arduino Setup
sidebar_label: 02 - Arduino Setup
description: Install the Arduino IDE, add ESP32 board support, install the CH340 driver if needed, and upload your first blink and WiFi sketches.
---

Install the toolchain you'll use for every workshop in this section, then upload two starter sketches: a blink and a WiFi connect.

## Install Arduino IDE

We use the [Arduino IDE](https://www.arduino.cc/en/software/#ide) as the development environment for every workshop. It's free, easy to install, and gets you up and running fast. Pick your operating system and follow the installer.

:::tip Pro tip
If you're an experienced developer and want a more advanced editor, look at [PlatformIO](https://platformio.org/) for VS Code, or the [Espressif Arduino SDK](https://docs.espressif.com/projects/arduino-esp32/en/latest/getting_started.html). For beginners, stick with the Arduino IDE.
:::

## Set up your microcontroller

Once the IDE is installed, add support for ESP32 boards.

### Step 1: Install ESP32 board support

The ESP32 package is available directly in the Arduino IDE Boards Manager.

1. Open Arduino IDE.
2. Go to **Tools → Board → Boards Manager**.
3. Search for **esp32**.
4. Find **"esp32 by Espressif Systems"** in the list.
5. Click **Install** (this may take a few minutes).
6. Wait for the installation to finish.

### Install CH340 driver (CYD users)

If you're using a Cheap Yellow Display, you'll need the CH340 driver:

1. Download from the [SparkFun CH340 driver guide](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all).
2. Install it following the instructions for your OS.

### Step 2: Select your board

After installation, select the board:

:::danger USB cable matters
Use a USB cable that supports **data transfer**, not just charging. Many cheap USB cables and the cables that ship with power banks are charging-only - the data lines aren't connected. If your computer doesn't recognise your ESP32, swap cables.
:::

1. Connect your ESP32 to your computer via USB.
2. Go to **Tools → Board → esp32**.
3. Select **ESP32C3 Dev Module** (or the variant that matches your board).
4. Go to **Tools → Port** and pick the port your ESP32 is on:
   - **Windows:** usually `COM3`, `COM4`, etc.
   - **macOS:** usually `/dev/cu.usbserial-*` or `/dev/cu.SLAB_USBtoUART`.
   - **Linux:** usually `/dev/ttyUSB0` or `/dev/ttyACM0`.

## Your first sketch

Upload a blink sketch to confirm the toolchain works.

:::info LED pin
This sketch uses pin 8 on the ESP32-C3. On the Cheap Yellow Display (CYD), the LED is on pin 4.
:::

```cpp
// Define the pin number for the LED
#define LED_PIN 8

// Setup function is called once when the microcontroller starts up.
void setup() {
    pinMode(LED_PIN, OUTPUT); // Set the LED pin as an output.
}

// Loop function is called repeatedly.
void loop() {
    digitalWrite(LED_PIN, HIGH); // Turn the LED on (HIGH is the voltage level).
    delay(1000); // Wait for 1 second.
    digitalWrite(LED_PIN, LOW); // Turn the LED off by making the voltage LOW.
    delay(1000); // Wait for 1 second.
}
```

Copy the code into the Arduino IDE and upload it. The on-board LED should blink.

> Source: [`Workshop-01/examples/blink/blink.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-01/examples/blink/blink.ino)

## Connect to WiFi

Now connect your microcontroller to WiFi.

```cpp
#include <WiFi.h> // Include the WiFi library for ESP32
const char* ssid = "Your SSID"; // Your WiFi SSID
const char* password = "Your Password"; // Your WiFi Password

// Setup function is called once when the microcontroller starts up.
void setup() {
    Serial.begin(115200); // Initialize the serial communication at 115200 baud rate
    WiFi.mode(WIFI_STA); // Set WiFi mode to Station (client mode)
    WiFi.setTxPower(WIFI_POWER_8_5dBm); // Workaround for ESP32-C3 Super Mini
    WiFi.begin(ssid, password); // Connect to WiFi using the SSID and Password
    // Wait for the connection to be established
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000); // Wait for 1 second
        Serial.println("Connecting to WiFi..."); // Print "Connecting to WiFi..." to the serial monitor
    }
    Serial.println("Connected to WiFi"); // Print "Connected to WiFi" to the serial monitor
    Serial.println("IP address: "); // Print "IP address: " to the serial monitor
    Serial.println(WiFi.localIP()); // Print the IP address to the serial monitor
}

// Loop function is called repeatedly.
void loop() {
    // Check if the WiFi connection is lost
    if (WiFi.status() != WL_CONNECTED) {
        // Print "WiFi connection lost. Reconnecting..." to the serial monitor
        Serial.println("WiFi connection lost. Reconnecting...");
        WiFi.reconnect(); // Reconnect to WiFi
        // Wait for the connection to be established
        while (WiFi.status() != WL_CONNECTED) {
            delay(1000); // Wait for 1 second
            Serial.print("."); // Print "." to the serial monitor
            Serial.print(".");
        }
        Serial.println("Reconnected!"); // Print "Reconnected!" to the serial monitor
    }
}
```

Update SSID/password, upload, and watch the serial monitor - you should see the IP address printed.

> Source: [`Workshop-01/examples/wifi/wifi.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-01/examples/wifi/wifi.ino)

:::info ESP32-C3 Super Mini WiFi workaround
If you're using an ESP32-C3 Super Mini and hit WiFi connection issues, the sketch includes `WiFi.setTxPower(WIFI_POWER_8_5dBm);` as a workaround. This sets the transmit power to 8.5 dBm and resolves connectivity problems specific to that board variant.
:::

:::tip Serial Monitor
Open it via **Tools → Serial Monitor** or `Ctrl+Shift+M` (`Cmd+Shift+M` on Mac). Set the baud rate to **115200** to match the sketch.
:::

## Further Resources

- [Arduino Workshop Video Tutorial](https://www.youtube.com/watch?v=EdXQUEMOfgU&list=PLPK2l9Knytg5s2dk8V09thBmNl2g5pRSr&index=2) - covers Arduino setup and basics.
- [Arduino Documentation](https://docs.arduino.cc/) - official.
- [Arduino IDE Download](https://www.arduino.cc/en/software/) - installer.
- [SparkFun CH340 Driver Guide](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all) - Windows/macOS/Linux.
- [Adafruit CH9102 Driver Guide](https://learn.adafruit.com/how-to-install-drivers-for-wch-usb-to-serial-chips-ch9102f-ch9102/overview) - alternate WCH USB-serial chips.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/01-basics/arduino-setup) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-01](https://github.com/CardanoThings/Workshops/tree/main/Workshop-01).*
