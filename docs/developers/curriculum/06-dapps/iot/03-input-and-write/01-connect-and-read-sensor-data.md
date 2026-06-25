---
id: 01-connect-and-read-sensor-data
title: Connect and Read Sensor Data
sidebar_label: 01 - Sensor Data
description: Wire an AHT10 over I2C, read temperature and humidity, and optionally render them on a 1.3" SH1106 OLED.
---

Wire up your first sensor - an AHT10 temperature and humidity sensor over I2C - read it, and optionally show the readings on an OLED.

## Hardware requirements

- ESP32-C3 (or ESP32) microcontroller.
- AHT10 temperature and humidity sensor (I2C, factory-calibrated).
- Optional: 1.3" SH1106 OLED display (I2C).
- Breadboard and jumper wires.

## Introduction to the AHT10

The AHT10 is a high-precision digital temperature and humidity sensor from Aosong. Compared to basic sensors like the DHT-22, it's more accurate, lower-power, and factory-calibrated.

- Temperature: -40°C to +85°C, ±0.3°C.
- Humidity: 0-100% RH, ±2% RH.
- I2C interface (only two wires for data).
- 3.3V (compatible with ESP32).
- Fast response, no calibration needed.

The AHT10 talks I2C - simpler than the single-wire protocol on the DHT-22. I2C uses two wires (SDA + SCL) and supports multiple devices on the same bus. The Adafruit AHTX0 library covers both AHT10 and AHT20.

## Wiring the AHT10

The module typically has four pins:

1. **VCC** → 3.3V.
2. **GND** → GND.
3. **SDA** → GPIO 8 (standard SDA on ESP32).
4. **SCL** → GPIO 9 (standard SCL on ESP32).

I2C needs pull-up resistors (4.7 kΩ - 10 kΩ) on SDA and SCL. Most AHT10 breakout modules include them. If yours doesn't, add them externally between the data/clock pins and VCC.

:::info ESP32-C3 pinout reference
Need a pinout reference for wiring? See the interactive ESP32-C3 pinout at [cardanothings.io](https://cardanothings.io), the official [ESP32-C3 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf), or your board's specific schematic. Common pin protocols on the C3: **SPI** uses MOSI / MISO / SCK / SS-CS; **I2C** uses SDA / SCL (typically GPIO 8 / 9); **UART** uses TX / RX.
:::

### Install the library

1. Open Arduino IDE.
2. **Sketch → Include Library → Manage Libraries**.
3. Search for **Adafruit AHT10**.
4. Install - and accept its dependencies (Adafruit BusIO + Adafruit Unified Sensor) when prompted.

:::info
The library handles all the I2C protocol details. `getEvent()` returns both temperature and humidity in one call. It uses the standard ESP32 I2C pins (GPIO 8/9) automatically. Source: [github.com/adafruit/Adafruit_AHTX0](https://github.com/adafruit/Adafruit_AHTX0).
:::

## Basic sensor read

Before adding a display, verify the sensor with serial-monitor output. This sketch reads every 500 ms and prints temperature + humidity.

```cpp
// Include required libraries
#include <Adafruit_AHT10.h>

// Create sensor object
Adafruit_AHT10 aht;

void setup() {
    // Initialize serial communication for debugging (115200 baud rate)
    Serial.begin(115200);
    Serial.println("Adafruit AHT10 demo!");

    // Initialize AHT10 sensor
    // begin() returns true if sensor is found, false if not found
    if (!aht.begin()) {
        Serial.println("Could not find AHT10? Check wiring");
        while (1) delay(10);  // Halt execution if sensor not found
    }
    Serial.println("AHT10 found");
}

void loop() {
    // Create sensor event structures to hold readings
    sensors_event_t humidity, temp;
    
    // Read both temperature and humidity simultaneously
    // getEvent() populates temp and humidity objects with fresh data
    aht.getEvent(&humidity, &temp);
    
    // Print temperature reading to serial monitor
    Serial.print("Temperature: ");
    Serial.print(temp.temperature);
    Serial.println(" degrees C");
    
    // Print humidity reading to serial monitor
    Serial.print("Humidity: ");
    Serial.print(humidity.relative_humidity);
    Serial.println("% rH");

    // Wait 500ms before next reading
    delay(500);
}
```

> Source: [`Workshop-03/examples/sensor-example/sensor-example.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/sensor-example/sensor-example.ino)

If the serial monitor doesn't show readings, check wiring and pull-up resistors.

:::info Other temperature sensors
The AHT10 is one option among many. Adapting the code for others:
- **SHT21 / SHT31** - similar I2C, different addresses (0x40 / 0x44).
- **DHT11 / DHT22** - single-wire, different library and wiring.
- **BME280** - also measures pressure, address 0x76 / 0x77.
- **HTU21D** - similar to SHT21, address 0x40.

Don't know what address your sensor uses? Run the I2C scanner sketch below to enumerate connected devices.
:::

<details>
<summary>**Reference: I2C device scanner sketch**</summary>

A small utility that scans every I2C address (0x00-0x7F) and prints which ones respond. Useful any time you don't know your sensor's or display's address, or when an I2C device isn't behaving and you want to confirm the chip is actually on the bus.

No extra libraries needed - uses the built-in `Wire` library.

**I2C pins:**

- ESP32-C3: `SDA = GPIO 8`, `SCL = GPIO 9`
- ESP32-CYD: `SDA = GPIO 27`, `SCL = GPIO 22` (check your board)

```cpp
/*
 * ESP32 I2C Scanner
 *
 * Scans all I2C addresses and reports which devices respond.
 * Use this when you don't know your device's I2C address
 * or to verify connections.
 *
 * Compatible with: ESP32-C3, ESP32 CYD, and all ESP32 boards.
 */

#include <Wire.h>

// I2C pins - adjust these for your board
// ESP32-C3: SDA = GPIO 8, SCL = GPIO 9
// ESP32 CYD: SDA = GPIO 27, SCL = GPIO 22 (may vary)
#define I2C_SDA 8
#define I2C_SCL 9

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("========================================");
  Serial.println("I2C Device Scanner");
  Serial.println("========================================");
  Serial.println();

  Wire.begin(I2C_SDA, I2C_SCL);

  Serial.print("Scanning I2C bus on SDA=GPIO");
  Serial.print(I2C_SDA);
  Serial.print(", SCL=GPIO");
  Serial.println(I2C_SCL);
  Serial.println();
}

void loop() {
  int devicesFound = 0;

  Serial.println("Scanning...");

  // Scan all 128 possible I2C addresses (0x00 to 0x7F)
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("Device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      Serial.println();
      devicesFound++;
    } else if (error == 4) {
      Serial.print("Unknown error at address 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      Serial.println();
    }
  }

  Serial.println();
  if (devicesFound == 0) {
    Serial.println("No I2C devices found.");
    Serial.println("Check your wiring:");
    Serial.println("- Is VCC connected to 3.3V?");
    Serial.println("- Is GND connected to GND?");
    Serial.println("- Are SDA and SCL connected correctly?");
  } else {
    Serial.print("Found ");
    Serial.print(devicesFound);
    Serial.print(" device");
    if (devicesFound > 1) Serial.print("s");
    Serial.println();
  }

  Serial.println("========================================");
  Serial.println();

  delay(5000);
}
```

</details>

## Adding a 1.3" OLED display (SH1106)

The SH1106-controlled 1.3" OLED also speaks I2C - so it shares the same SDA/SCL bus as the sensor. I2C supports multiple devices on one bus as long as they have different addresses.

### Wiring the OLED (sharing the I2C bus)

1. **VCC** → 3.3V (shared with the AHT10).
2. **GND** → GND (shared).
3. **SDA** → GPIO 8 (shared SDA).
4. **SCL** → GPIO 9 (shared SCL).

:::info Complete wiring
**Power and ground**

- AHT10 VCC + OLED VCC → ESP32 3.3V.
- AHT10 GND + OLED GND → ESP32 GND.

**I2C bus sharing**

- AHT10 → address `0x38` on GPIO 8/9.
- 1.3" SH1106 OLED → address `0x3C` (or `0x3D`) on the same GPIO 8/9.

I2C supports multi-device because each device has a unique address. The microcontroller addresses each one individually.

**I2C addresses**

- AHT10: `0x38` (fixed).
- 1.3" OLED (SH1106): `0x3C` or `0x3D` (check the display docs or use an I2C scanner).
:::

## Displaying sensor data

This sketch reads the AHT10 and renders temperature + humidity on the OLED, refreshing every 2 seconds.

```cpp
// Include necessary libraries
#include <Wire.h>                // I2C communication library (built-in)
#include <Adafruit_AHT10.h>     // Adafruit AHT10 library
#include <Adafruit_GFX.h>       // Adafruit graphics library
#include <Adafruit_SH110X.h>    // Adafruit SH1106 OLED library (for 1.3" OLED)

// OLED display settings
#define SCREEN_WIDTH 128         // OLED display width in pixels
#define SCREEN_HEIGHT 64         // OLED display height in pixels
#define OLED_RESET -1            // Reset pin (not used, set to -1)
#define SCREEN_ADDRESS 0x3C      // I2C address (usually 0x3C or 0x3D)

// Create sensor and display objects
Adafruit_AHT10 aht;             // Initialize AHT10 sensor
Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Variables to store sensor readings
float temperature = 0;         // Current temperature reading
float humidity = 0;            // Current humidity reading

// Variables for timing sensor reads
unsigned long lastRead = 0;                    // Timestamp of last sensor read
const unsigned long readInterval = 2000;        // Read every 2 seconds

void setup() {
    // Initialize serial communication for debugging (115200 baud rate)
    Serial.begin(115200);
    Serial.println("Adafruit AHT10 demo!");
    
    // Initialize AHT10 sensor
    if (!aht.begin()) {
        Serial.println("Could not find AHT10? Check wiring");
        while (1) delay(10);  // Halt if sensor not found
    }
    Serial.println("AHT10 found");
    
    // Initialize OLED display
    if (!display.begin(SCREEN_ADDRESS)) {
        Serial.println("SH1106 allocation failed");
        for (;;);  // Don't proceed, loop forever
    }
    Serial.println("OLED Display initialized!");
    
    // Clear display and show startup message
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SH110X_WHITE);
    display.setCursor(0, 0);
    display.println("Initializing...");
    display.display();
    delay(1000);
    
    // Clear and show ready message
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Ready!");
    display.display();
    delay(500);
}

void loop() {
    // Get current time in milliseconds
    unsigned long currentMillis = millis();
    
    // Check if enough time has passed since last sensor read
    if (currentMillis - lastRead >= readInterval) {
        readSensorData();  // Read from sensor
        displayData();     // Update display
        lastRead = currentMillis;  // Update last read timestamp
    }
}

void readSensorData() {
    // Create sensor event structures to hold readings
    sensors_event_t humidity_event, temp_event;
    
    // Read both temperature and humidity from sensor
    // The getEvent() function populates temp and humidity objects with fresh data
    aht.getEvent(&humidity_event, &temp_event);
    
    // Store readings in global variables
    temperature = temp_event.temperature;        // Temperature in Celsius
    humidity = humidity_event.relative_humidity;  // Humidity as percentage (0-100)
    
    // Print readings to serial monitor for debugging
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" degrees C");
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println("% rH");
}

void displayData() {
    // Clear display buffer
    display.clearDisplay();
    
    // Display temperature label and value
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("Temperature");
    display.setCursor(0, 14);
    display.setTextSize(3);
    display.print(temperature, 1);  // Format to 1 decimal place
    display.println("C");
    
    // Display humidity label and value
    display.setTextSize(1);
    display.setCursor(0, 52);
    display.print("Humidity: ");
    display.print(humidity, 1);  // Format to 1 decimal place
    display.println("%");
    
    // Update display to show all changes
    display.display();
}
```

> Source: [`Workshop-03/examples/display-sensor-data/display-sensor-data.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/display-sensor-data/display-sensor-data.ino)

You'll need the Adafruit SH110X library (with Adafruit GFX as a dependency) for the OLED, plus the AHT10 stack you already installed.

### Display layout

The OLED shows:

- "Temperature" label at the top in small text.
- Temperature value in size-3 text with the °C unit.
- Humidity label and value at the bottom in small text with the % unit.

Customise freely - add timestamps, graphs, dew-point calculations, anything.

### Troubleshooting

If you get "Failed to find AHT10 sensor!":

- Check VCC/GND/SDA/SCL connections.
- Confirm I2C pull-ups are present (usually on the module).
- Verify pin assignments (GPIO 8 SDA, GPIO 9 SCL on ESP32).
- Confirm the sensor has 3.3V power.
- Run an I2C scanner to confirm the sensor is at `0x38`.
- Make sure no other I2C devices conflict on the same bus.
- Confirm all libraries installed: Adafruit AHT10 + BusIO + Unified Sensor.

## Further Resources

- [Adafruit AHT10 Library](https://github.com/adafruit/Adafruit_AHTX0) - for AHT10/AHT20 sensors.
- [I2C tutorial](https://www.youtube.com/watch?v=pxhg2Rwm_h8) - protocol overview.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/03-input-and-write/connect-and-read-sensor-data) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-03](https://github.com/CardanoThings/Workshops/tree/main/Workshop-03).*
