---
id: 03-api-setup
title: API Setup & First Call
sidebar_label: 03 - API Setup
description: Use the Koios /tip endpoint to fetch the current epoch number from your microcontroller and log it to the serial monitor.
---

Make your first API call from the ESP32 to a Cardano API. We'll use [Koios](https://preprod.koios.rest/), a free and open-source REST API for Cardano data.

## What is Koios?

Koios is a free, open-source REST API for the Cardano blockchain (mainnet and testnets). All responses are JSON. The full endpoint reference is at [preprod.koios.rest](https://preprod.koios.rest/). For this lesson we'll use the [chain tip](https://preprod.koios.rest/#get-/tip) endpoint to get the current epoch.

## The API endpoint

Open the [chain tip endpoint](https://preprod.koios.rest/api/v1/tip) in your browser to see the JSON response.

:::tip
For readable JSON in the browser, install the [Awesome JSON Viewer](https://github.com/rbrahul/Awesome-JSON-Viewer) extension.
:::

The response includes the current epoch number, the absolute slot, the epoch slot, the block height, the block number, the block time, and the block hash. We'll fetch it from the ESP32 and log the epoch to the serial monitor.

## Fetching data in Arduino

We use the [HTTP Client](https://github.com/espressif/arduino-esp32/tree/master/libraries/HTTPClient) library to make the request and the [ArduinoJSON](https://www.arduino.cc/reference/en/libraries/arduinojson/) library to parse the response.

### Install ArduinoJSON

1. Open Arduino IDE.
2. **Tools → Manage Libraries** (or `Ctrl+Shift+I` / `Cmd+Shift+I`).
3. Search for **ArduinoJson**.
4. Install **"ArduinoJson" by Benoit Blanchon** (the one with millions of downloads).

The HTTPClient library ships with the ESP32 board package, so no extra install needed.

## The sketch

The sketch will:

1. Connect to WiFi.
2. Make an HTTP GET to the Koios `/tip` endpoint.
3. Parse the JSON response.
4. Log the epoch number to the serial monitor.

```cpp
#include <WiFi.h> // Include the WiFi library for ESP32
#include <HTTPClient.h> // Include the HTTPClient library for ESP32
#include <ArduinoJson.h> // Include the ArduinoJSON library for ESP32

const char* ssid = "Your SSID"; // Your WiFi SSID
const char* password = "Your Password"; // Your WiFi Password
const char* apiUrl = "https://preprod.koios.rest/api/v1/tip"; // The API URL for the Koios API

int epochNumber = 0; // Variable to store the epoch number

void setup() {
    Serial.begin(115200); // Initialize the serial communication at 115200 baud rate
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

void parseJsonResponse(String response) {
    JsonDocument doc; // Create a JSON document
    DeserializationError error = deserializeJson(doc, response); // Deserialize the JSON response

    if (error) {
        Serial.print("Failed to parse JSON: ");
        Serial.println(error.c_str());
        return;
    }

    // Extract the epoch number from the first element in the array
    epochNumber = doc[0]["epoch_no"];
}

void loop() {
    // Check if the WiFi connection is lost
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Reconnecting..."); // Print "WiFi connection lost. Reconnecting..." to the serial monitor
        WiFi.reconnect(); // Reconnect to WiFi
        while (WiFi.status() != WL_CONNECTED) {
            delay(1000); // Wait for 1 second
            Serial.print("."); // Print "." to the serial monitor
        }
        Serial.println("Reconnected!"); // Print "Reconnected!" to the serial monitor
    }
    makeHttpRequest(); // Make the HTTP request
    delay(60000); // Wait 60 seconds before making the next request
}

void makeHttpRequest() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(apiUrl);
        int httpResponseCode = http.GET();
        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println("HTTP Response Code: " + String(httpResponseCode));
            Serial.println("Response:");
            Serial.println(response);
            parseJsonResponse(response);
            Serial.println("Epoch number: " + String(epochNumber));
        } else {
            Serial.println("Error in HTTP request");
            Serial.println("HTTP Response Code: " + String(httpResponseCode));
        }
        http.end();
    } else {
        Serial.println("WiFi not connected");
    }
}
```

> Source: [`Workshop-01/examples/koios-api/koios-api.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-01/examples/koios-api/koios-api.ino)

## What you'll see in the Serial Monitor

After uploading and opening the Serial Monitor at 115200 baud, expect output like:

```
Connecting to WiFi...
Connecting to WiFi...
Connected to WiFi
IP address:
192.168.1.XXX

HTTP Response Code: 200
Response:
[{
  "hash": "14c6413b8df915c58d9da162cf22ad58dc52834c8ce7105fe91d08e804cb5a36",
  "epoch_no": 252,
  "abs_slot": 107460097,
  "epoch_slot": 237697,
  "block_height": 4122947,
  "block_no": 4122947,
  "block_time": 1763143297
}]
Epoch number: 252
```

The output repeats every 60 seconds with fresh blockchain data.

- **Connecting to WiFi…** - joining your network.
- **HTTP Response Code: 200** - successful API call.
- **Response** - the full JSON from Koios.
- **Epoch number** - the value parsed out of the JSON.

:::warning Troubleshooting
If you see `HTTP Response Code: -1` or connection errors:
- Confirm WiFi credentials.
- Confirm the ESP32 is in WiFi range.
- Check that your firewall isn't blocking HTTPS.
- Confirm the API is up at [preprod.koios.rest](https://preprod.koios.rest/).
:::

## Further Resources

- [Koios documentation](https://preprod.koios.rest/) - full endpoint reference.
- [REST API Tutorial](https://www.restapitutorial.com/) - REST primer.
- [Awesome JSON Viewer](https://github.com/rbrahul/Awesome-JSON-Viewer) - browser extension for readable JSON.
- [Insomnia](https://insomnia.rest/) - free open-source API client.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/01-basics/api-setup) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-01](https://github.com/CardanoThings/Workshops/tree/main/Workshop-01).*
