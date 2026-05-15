---
id: 01-getting-started
title: Getting Started
sidebar_label: 01 - Getting Started
description: Set up a basic webserver on the ESP32, understand the project structure, upload files to LittleFS, and test it.
---

Foundation for the payment terminal: a small webserver running on the microcontroller, serving HTML/CSS/JS from LittleFS.

## What we're building

The full Workshop 05 flow:

1. Create a payment request via a website running directly on the microcontroller.
2. The microcontroller renders a QR code on the TFT display, scannable by a mobile wallet (Yoroi, Vespr, Begin).
3. The user signs and submits the transaction from their phone.
4. The microcontroller polls Koios and waits for the payment to confirm on-chain.
5. On confirmation, it shows a confirmation message on the TFT and updates the backend store.

We'll use Koios (already familiar) to check for payments, briefly cover [CIP-13](https://cips.cardano.org/cip/CIP-0013) for payment URIs, and render QR codes scannable by most Cardano mobile wallets.

## Project structure

The basic webserver project is laid out as:

```
basic-webserver/
├── basic-webserver.ino    # Main Arduino sketch
├── web_server.h           # Web server header
├── web_server.cpp         # Web server implementation
├── wifi_manager.h         # WiFi manager header
├── wifi_manager.cpp       # WiFi manager implementation
├── secrets.h              # WiFi credentials (gitignored)
├── secrets.h.example      # Template for secrets.h
└── data/                  # Files served by the webserver
    └── index.html         # Default page at root
```

### The `data` directory

The `data/` directory holds everything served by the webserver - stored on the ESP32's flash via LittleFS. When a client requests a file (e.g. `/index.html`), the server reads it from LittleFS and streams it back. HTML, CSS, JavaScript, images - all go in here.

### LittleFS

[LittleFS](https://github.com/littlefs-project/littlefs) is a lightweight filesystem for embedded devices like the ESP32. The webserver code initialises it in `webServerSetup()`:

```cpp
if (!LittleFS.begin(true)) {
  Serial.println("ERROR: LittleFS Mount Failed");
  return;
}
```

`begin(true)` formats the filesystem if it doesn't exist - handy for first-time setup.

:::tip File paths
Files in `data/` are served at the root path:

- `data/index.html` → `http://[IP]/index.html` or `http://[IP]/`
- `data/style.css` → `http://[IP]/style.css`
- `data/app.js` → `http://[IP]/app.js`
:::

## Creating the webserver

Start with WiFi - most of this is already familiar from Workshop 01.

`basic-webserver.ino`:

```cpp
// Include necessary libraries
#include <Arduino.h>

// Include our custom header files
#include "secrets.h"      // WiFi credentials (not in git)
#include "web_server.h"   // HTTP web server for serving files
#include "wifi_manager.h" // WiFi connection management

void setup() {
  // Initialize serial communication for debugging
  // Serial communication lets us send messages to the computer via USB
  // 115200 is the baud rate (speed of communication)
  // You can view these messages in the Arduino IDE Serial Monitor
  Serial.begin(115200);
  delay(1000); // Give serial monitor time to connect

  Serial.println("Basic Web Server Example");
  Serial.println("========================");

  // Set up WiFi connection
  // WIFI_SSID is your WiFi network name
  // WIFI_PASSWORD is your WiFi password
  // These are defined in secrets.h (which you should create from
  // secrets.h.example)
  wifiManagerSetup(WIFI_SSID, WIFI_PASSWORD);

  // Wait for WiFi connection (with timeout)
  // We need WiFi to serve web pages, so we wait here
  Serial.println("Waiting for WiFi connection...");
  const unsigned long wifiTimeout =
      30000; // 30 seconds timeout (in milliseconds)
  const unsigned long wifiStart = millis(); // Record when we started waiting

  // Keep checking if WiFi is connected, but don't wait forever
  // millis() returns the number of milliseconds since the device started
  while (!wifiManagerIsConnected() && (millis() - wifiStart) < wifiTimeout) {
    wifiManagerLoop(); // Check WiFi status and try to connect
    delay(100);        // Wait 100ms before checking again (don't waste CPU)
  }

  // Start web server if WiFi is connected
  if (wifiManagerIsConnected()) {
    webServerSetup();
  } else {
    Serial.println("WiFi connection failed - web server not started");
  }
}

void loop() {
  // Keep WiFi connection alive and check for reconnection if needed
  // This needs to be called regularly to maintain the connection
  wifiManagerLoop();

  // Handle web server requests (runs asynchronously, but we call loop for
  // consistency)
  if (wifiManagerIsConnected() && !webServerIsRunning()) {
    // If WiFi just reconnected, start the server
    webServerSetup();
  }
  webServerLoop();
}





```

`wifi_manager.cpp`:

```cpp
/**
 * wifi_manager.cpp - WiFi connection management implementation
 *
 * This file implements WiFi connection management with automatic reconnection.
 * It stores WiFi credentials and periodically attempts to connect or reconnect
 * if the connection is lost.
 */

#include "wifi_manager.h"
#include <WiFi.h>

namespace {
// Time to wait between reconnection attempts (5 seconds)
// Prevents rapid reconnection attempts that could overwhelm the WiFi module
const unsigned long WIFI_RETRY_INTERVAL_MS = 5000;

// Maximum time to wait for a connection before retrying (12 seconds)
// If connection takes longer than this, we assume it failed and retry
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 12000;

// Stored WiFi credentials (set by wifiManagerSetup)
const char *storedSsid = nullptr;
const char *storedPassword = nullptr;

// Timestamp of the last connection attempt
// Used to implement retry intervals and connection timeouts
unsigned long lastAttemptMs = 0;

/**
 * Attempt to connect to WiFi
 *
 * Disconnects any existing connection, sets WiFi to station mode,
 * and begins connection with stored credentials.
 *
 * @param force If true, attempts connection immediately regardless of retry
 * interval
 */
void attemptConnection(bool force) {
  // Don't attempt connection if SSID is not set or empty
  if (storedSsid == nullptr || storedSsid[0] == '\0') {
    return;
  }

  const unsigned long now = millis();
  // Respect retry interval unless forced (e.g., initial setup)
  if (!force && (now - lastAttemptMs) < WIFI_RETRY_INTERVAL_MS) {
    return;
  }

  lastAttemptMs = now;

  Serial.print("WiFi: connecting to ");
  Serial.println(storedSsid);

  // Disconnect any existing connection and clear stored credentials
  WiFi.disconnect(true, true);
  // Set WiFi to station mode (client mode, not access point)
  WiFi.mode(WIFI_STA);
  // Begin connection attempt
  WiFi.begin(storedSsid, storedPassword);
}
} // namespace

/**
 * Initialize WiFi manager with credentials
 *
 * Stores the WiFi credentials and immediately attempts to connect.
 *
 * @param ssid The WiFi network name (SSID)
 * @param password The WiFi network password
 */
void wifiManagerSetup(const char *ssid, const char *password) {
  storedSsid = ssid;
  storedPassword = password;
  // Force immediate connection attempt on setup
  attemptConnection(true);
}

/**
 * Monitor and maintain WiFi connection
 *
 * Checks connection status and automatically attempts to reconnect
 * if disconnected. Uses timeout mechanism to detect failed connections.
 * Should be called repeatedly in the main loop().
 */
void wifiManagerLoop() {
  // If already connected, no action needed
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  const unsigned long now = millis();
  // Check if connection attempt has timed out
  // Also handles case where no attempt has been made yet (lastAttemptMs == 0)
  const bool timedOut =
      (now - lastAttemptMs) > WIFI_CONNECT_TIMEOUT_MS || lastAttemptMs == 0;

  if (timedOut) {
    // Retry connection (respects retry interval)
    attemptConnection(false);
  }
}

/**
 * Check if WiFi is currently connected
 *
 * @return true if WiFi status is WL_CONNECTED, false otherwise
 */
bool wifiManagerIsConnected() { return WiFi.status() == WL_CONNECTED; }
```

`wifi_manager.h`:

```cpp
/**
 * wifi_manager.h - Header file for WiFi connection management
 * 
 * This file declares functions for managing WiFi connectivity on the ESP32.
 * It handles connection setup, connection monitoring, and provides status
 * information about the WiFi connection state.
 */

#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>

/**
 * Initialize WiFi connection
 * 
 * Sets up WiFi with the provided credentials and attempts to connect.
 * Call this once in setup() before using other WiFi functions.
 * 
 * @param ssid The WiFi network name (SSID)
 * @param password The WiFi network password
 */
void wifiManagerSetup(const char *ssid, const char *password);

/**
 * Update WiFi connection status
 * 
 * Monitors the WiFi connection and attempts to reconnect if disconnected.
 * Call this repeatedly in loop() to maintain connection.
 */
void wifiManagerLoop();

/**
 * Check if WiFi is currently connected
 * 
 * @return true if connected to WiFi, false otherwise
 */
bool wifiManagerIsConnected();

#endif


```

> Source: [`basic-webserver.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/basic-webserver/basic-webserver.ino), [`wifi_manager.cpp`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/basic-webserver/wifi_manager.cpp)

The webserver uses the ESP32's built-in `WebServer` library on port 80, serving files from LittleFS. How it works:

- **Server initialisation** - bound to port 80, listens for incoming requests.
- **File serving** - when a client requests a file, the server checks LittleFS; if found, streams it with the right content type.
- **Request handling** - `onNotFound()` catches every request and routes it to the file handler. Any path tries to find a matching file in LittleFS.
- **Fallback** - if the file isn't found, serves `index.html` if available, otherwise 404.
- **Continuous processing** - `webServerLoop()` must be called regularly from your main `loop()`. It's non-blocking, so other code can keep running.

`web_server.cpp`:

```cpp
#include "web_server.h"
#include <LittleFS.h>
#include <WebServer.h>
#include <WiFi.h>

namespace {
WebServer server(80);       // Web server on port 80
bool serverStarted = false; // Flag to check if server is started

// Get MIME type for HTML files
String getContentType(String filename) { return "text/html"; }

// Handle file requests
void handleFileRequest() {
  String path = server.uri();

  // Default to index.html for root path
  if (path == "/" || path == "") {
    path = "/index.html";
  }

  // Ensure path starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Check if file exists in LittleFS
  if (LittleFS.exists(path)) {
    String contentType = getContentType(path);
    File file = LittleFS.open(path, "r");
    if (file) {
      server.streamFile(file, contentType);
      file.close();
      Serial.print("Served file: ");
      Serial.println(path);
    } else {
      server.send(500, "text/plain", "Error opening file");
      Serial.print("Error opening file: ");
      Serial.println(path);
    }
  } else {
    // File not found - try index.html as fallback
    if (path != "/index.html" && LittleFS.exists("/index.html")) {
      File file = LittleFS.open("/index.html", "r");
      if (file) {
        server.streamFile(file, "text/html");
        file.close();
        Serial.print("File not found, serving index.html: ");
        Serial.println(path);
      } else {
        server.send(404, "text/plain", "File not found");
      }
    } else {
      // 404 Not Found
      server.send(404, "text/plain", "File not found");
      Serial.print("404 - File not found: ");
      Serial.println(path);
    }
  }
}
} // namespace

void webServerSetup() {
  // Initialize LittleFS file system
  if (!LittleFS.begin(true)) {
    Serial.println("ERROR: LittleFS Mount Failed");
    return;
  }
  Serial.println("LittleFS mounted successfully");

  // List all files in LittleFS (for debugging)
  File root = LittleFS.open("/");
  File file = root.openNextFile();
  Serial.println("Files in LittleFS:");
  while (file) {
    Serial.print("  ");
    Serial.print(file.name());
    Serial.print(" (");
    Serial.print(file.size());
    Serial.println(" bytes)");
    file = root.openNextFile();
  }

  // Serve files from root and all subdirectories
  server.onNotFound(handleFileRequest);

  // Start the server
  server.begin();
  serverStarted = true;

  // Print the server's IP address
  Serial.print("Web server started on http://");
  Serial.println(WiFi.localIP());
}

// Function to handle incoming client requests
void webServerLoop() {
  // If the server is started, handle incoming client requests
  if (serverStarted) {
    server.handleClient();
  }
}

// Function to check if the server is running
bool webServerIsRunning() { return serverStarted; }
```

`web_server.h`:

```cpp
#ifndef WEB_SERVER_H
#define WEB_SERVER_H

#include <Arduino.h>

// Initialize the web server (call after WiFi is connected)
void webServerSetup();

// Handle server requests (call in loop())
void webServerLoop();

// Check if server is running
bool webServerIsRunning();

#endif






```

> Source: [`web_server.cpp`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/basic-webserver/web_server.cpp)

## Creating web content

The webserver serves files from `data/`. `index.html` is the entry point - open the ESP32's IP in a browser and you'll see this page. Add CSS and JS files later as needed.

`data/index.html`:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">
    <title>Hello World!</title>
</head>

<body>

    <h1>Hello World!</h1>
    <p>This is a simple HTML page served by your microcontroller's web server.</p>

</body>

</html>
```

> Source: [`data/index.html`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/basic-webserver/data/index.html)

Once uploaded to LittleFS, this is reachable at `http://[ESP32_IP]/` or `http://[ESP32_IP]/index.html`.

## Uploading files to LittleFS

Sketch uploads don't include the `data/` directory - you need a separate tool for that.

### LittleFS Upload Tool

The [arduino-littlefs-upload](https://github.com/earlephilhower/arduino-littlefs-upload) plugin uploads `data/` to the ESP32's LittleFS.

**Install:**

1. Download the VSIX from the [releases page](https://github.com/earlephilhower/arduino-littlefs-upload/releases).
2. Copy it to the Arduino IDE plugins folder:
   - **macOS / Linux:** `~/.arduinoIDE/plugins/`
   - **Windows:** `C:\Users\<username>\.arduinoIDE\plugins\`
3. Restart Arduino IDE.

**Use:**

- **Windows / Linux:** `Ctrl+Shift+P` → Command Palette.
- **macOS:** `⌘+Shift+P` → Command Palette.
- Type and select **"Upload LittleFS to Pico/ESP8266/ESP32"**.

Files in `data/` upload to LittleFS.

:::info
- ESP32 must be connected and the right port selected before uploading.
- Upload **erases existing files** in LittleFS and replaces them with `data/`.
- LittleFS upload is separate from sketch upload - do both.
- After upload, restart the ESP32 or wait for the FS to be ready.
:::

## Testing the webserver

### Step 1: Upload the sketch

1. Open `basic-webserver.ino` in the Arduino IDE.
2. Make sure `secrets.h` exists (copy `secrets.h.example` and fill in WiFi).
3. Select your ESP32 board and port from **Tools**.
4. Click **Upload** (`Ctrl+U` / `⌘+U`).
5. Wait for upload, then open the Serial Monitor (115200 baud) to see the WiFi connection status.

### Step 2: Upload files to LittleFS

1. Make sure the ESP32 is still connected.
2. Command Palette (`Ctrl+Shift+P` / `⌘+Shift+P`).
3. Select **"Upload LittleFS to Pico/ESP8266/ESP32"**.
4. Wait for upload.

### Step 3: Find the IP address

After WiFi connects, the Serial Monitor shows:

```
Web server started on http://192.168.1.100
```

Note the IP - you'll need it.

### Step 4: Visit the site

1. From any device on the same WiFi, open a browser.
2. Go to `http://[ESP32_IP_ADDRESS]`.
3. You should see the "Hello World" page from `index.html`.

:::info Troubleshooting
- **Can't connect to WiFi:** check `secrets.h`.
- **Can't reach the site:** confirm both devices are on the same WiFi.
- **404 / blank page:** make sure you uploaded LittleFS after the sketch.
- **No IP shown:** check the Serial Monitor for errors; confirm WiFi connected.
:::

## Further Resources

- [arduino-littlefs-upload](https://github.com/earlephilhower/arduino-littlefs-upload) - upload tool for Arduino IDE 2.2.1+.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/05-qr-code-payments/getting-started) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-05](https://github.com/CardanoThings/Workshops/tree/main/Workshop-05).*
