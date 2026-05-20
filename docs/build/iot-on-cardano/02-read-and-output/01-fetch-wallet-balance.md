---
id: 01-fetch-wallet-balance
title: Fetch your Wallet Balance
sidebar_label: 01 - Fetch Wallet Balance
description: Poll your stake address balance via Koios (and Blockfrost), parse the JSON, detect changes, and explore alternative APIs.
---

Poll your wallet balance from your microcontroller and react when it changes - the foundation for every "do something physical when something happens on-chain" project in this section.

## Setting up the API

We use the Koios [`/account_info`](https://preprod.koios.rest/#post-/account_info) endpoint. It's a POST that takes your stake address in the request body.

Get your stake address from Yoroi:

1. Open the Yoroi extension.
2. Confirm Preprod (orange banner at top).
3. Go to **Wallet → Receive**.
4. Copy your stake address from the rewards section - it starts with `stake_test1...`.

You can test the endpoint from [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/) with this body:

```json
{
  "_stake_addresses": [
    "stake_test1urq4rcynzj4uxqc74c852zky7wa6epgmn9r6k3j3gv7502q8jks0l"
  ]
}
```

Response (truncated):

```json
[
  {
    "stake_address": "stake_test1uz22g9jd408t8zq8g3dw8p60qla49qjgvhh7z74kjpvuyrctlwf4m",
    "status": "registered",
    "delegated_pool": null,
    "delegated_drep": "drep1ytesfw7n2pq5ys2rk0m7fxxd2dyagf820wy24d82rdd9yxqfm4qjg",
    "total_balance": "10497440929",
    "utxo": "10497440929",
    "rewards": "0",
    "withdrawals": "0",
    "rewards_available": "0",
    "deposit": "2000000",
    "reserves": "0",
    "treasury": "0",
    "proposal_refund": "0"
  }
]
```

Key fields:
- **stake_address** - your stake address.
- **status** - registration status.
- **total_balance** - total balance in lovelace (1 tADA = 1,000,000 lovelace).
- **utxo** - total UTxO value in lovelace.
- **rewards_available** - rewards you can withdraw.
- **delegated_pool** - pool ID if delegated.
- **delegated_drep** - DRep ID for governance.

## Fetching the balance from the ESP32

The sketch will:

1. Connect to WiFi.
2. POST to Koios with your stake address.
3. Parse the response and extract `total_balance`.
4. Display the balance via the serial monitor.

```cpp
// Include necessary libraries for WiFi, HTTP requests, and JSON parsing
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials - replace with your network details
const char* ssid = "Your SSID";
const char* password = "Your Password";

// Koios API endpoint for fetching account information
const char* apiUrl = "https://preprod.koios.rest/api/v1/account_info";

// Your Cardano stake address (Preprod Testnet)
String stakeAddress = "stake_test1...";

// Variables for timing balance checks
unsigned long lastCheck = 0;                    // Timestamp of last balance check
const unsigned long checkInterval = 30000;      // Check every 30 seconds (30000 milliseconds)

// Store previous balance to detect changes
float previousBalance = 0;

void setup() {
    // Initialize serial communication for debugging (115200 baud rate)
    Serial.begin(115200);

    // Start WiFi connection
    WiFi.begin(ssid, password);

    // Wait until WiFi is connected
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    // Print connection confirmation and IP address
    Serial.println("Connected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // Perform initial balance check on startup
    fetchStakeBalance();
}

void loop() {
    // Check if WiFi connection is still active
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Reconnecting...");
        WiFi.reconnect();

        // Wait for reconnection
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

                // Convert from Lovelace (smallest unit) to tADA (test ADA)
                // 1 tADA = 1,000,000 Lovelace
                float balance = balanceLovelace / 1000000.0;

                // Print account information
                Serial.println("Stake Address: " + String(accountInfo["stake_address"].as<const char*>()));
                Serial.println("Total Balance: " + String(balance, 6) + " tADA");

                    // Check if balance has changed since last check
                    if (balance != previousBalance) {
                        if (balance > previousBalance) {
                            Serial.println("✓ Balance increased!");
                        } else {
                            Serial.println("✓ Balance decreased!");
                        }
                        // Update previous balance for next comparison
                        previousBalance = balance;
                    }
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
```

> Source: [`Workshop-02/examples/wallet-balance/wallet-balance.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/wallet-balance/wallet-balance.ino)

Update WiFi credentials and your stake address before uploading.

## Listening for changes

The sketch already detects balance changes by storing the previous balance and comparing on each poll. From there you can hang any side-effect off the change:

- Light up an LED when funds arrive.
- Buzz a buzzer.
- Update a display (next lesson).
- Trigger a relay (lesson 3 of this workshop).

:::tip CardanoThings PingPong wallet
Need an easy way to test the change-detection loop? Send tADA to the CardanoThings **PingPong** wallet - it auto-refunds your transaction (minus fees) within ~60 seconds, so you can trigger the change handler repeatedly.

Address: `addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w`

Preprod-only.
:::

## Alternative APIs

Koios is free and open-source, but there are alternatives.

### Blockfrost

[Blockfrost](https://blockfrost.io/) is a popular Cardano API with free and paid tiers. It uses a simpler GET request and requires an API key. Sign up at [blockfrost.io](https://blockfrost.io/), create a Preprod project, and grab the key.

The Blockfrost response shape is slightly different:

```json
{
  "stake_address": "stake_test1ux3g2c9dx2nhhehyrezyxpkstartcqmu9hk63qgfkccw5rqttygt7",
  "active": true,
  "active_epoch": 412,
  "controlled_amount": "619154618165",
  "rewards_sum": "319154618165",
  "withdrawals_sum": "12125369253",
  "reserves_sum": "319154618165",
  "treasury_sum": "12000000",
  "withdrawable_amount": "319154618165",
  "pool_id": "pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy",
  "drep_id": "drep15cfxz9exyn5rx0807zvxfrvslrjqfchrd4d47kv9e0f46uedqtc"
}
```

```cpp
// Include necessary libraries for WiFi, HTTP requests, and JSON parsing
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials - replace with your network details
const char* ssid = "Your SSID";
const char* password = "Your Password";

// Blockfrost API endpoint (Preprod Testnet)
// Note: Blockfrost uses GET requests with stake address in URL path
const char* apiUrl = "https://cardano-preprod.blockfrost.io/api/v0/accounts/";

// Your Blockfrost API key (get free key from blockfrost.io)
const char* apiKey = "your-blockfrost-api-key";

// Your Cardano stake address (Preprod Testnet)
String stakeAddress = "stake_test1...";

// Variables for timing balance checks
unsigned long lastCheck = 0;                    // Timestamp of last balance check
const unsigned long checkInterval = 30000;      // Check every 30 seconds

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);

    // Start WiFi connection
    WiFi.begin(ssid, password);

    // Wait until WiFi is connected
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
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
        fetchStakeBalance();
        lastCheck = currentMillis;  // Update last check timestamp
    }
}

void fetchStakeBalance() {
    // Only proceed if WiFi is connected
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;

        // Build full URL by appending stake address to base URL
        String fullUrl = apiUrl + stakeAddress;

        // Initialize HTTP client with full URL
        http.begin(fullUrl);

        // Blockfrost requires API key in "project_id" header
        http.addHeader("project_id", apiKey);

        // Send GET request (Blockfrost uses GET, not POST like Koios)
        int httpResponseCode = http.GET();

        // Check if request was successful
        if (httpResponseCode > 0) {
            // Get response body as string
            String response = http.getString();

            // Create JSON document to parse response (1024 bytes buffer)
            DynamicJsonDocument doc(1024);
            DeserializationError error = deserializeJson(doc, response);

        // Check if JSON parsing was successful
        if (!error) {
            // Extract controlled_amount as string (Blockfrost returns balance as string)
            // controlled_amount is the total balance including delegated amount and rewards
            const char* balanceStr = doc["controlled_amount"];

            // Convert string to long long (for large Lovelace values)
            long long balanceLovelace = 0;
            if (balanceStr != nullptr) {
                balanceLovelace = atoll(balanceStr);
            }

            // Convert from Lovelace to tADA (test ADA) - 1 tADA = 1,000,000 Lovelace
            float balance = balanceLovelace / 1000000.0;

            // Print account information
            Serial.println("Stake Address: " + String(doc["stake_address"].as<const char*>()));
            Serial.println("Total Balance: " + String(balance, 6) + " tADA");
        }
        }

        // Close HTTP connection
        http.end();
    }
}
```

> Source: [`Workshop-02/examples/wallet-balance-blockfrost/wallet-balance-blockfrost.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-02/examples/wallet-balance-blockfrost/wallet-balance-blockfrost.ino)

:::tip PlatformIO + Blockfrost SDK
If you use PlatformIO, Blockfrost ships an official Arduino SDK that handles auth and serialization: [github.com/blockfrost/blockfrost-arduino](https://github.com/blockfrost/blockfrost-arduino).
:::

### Maestro

[Maestro](https://www.gomaestro.org/) is another Cardano API provider with a free tier and similar coverage to Blockfrost and Koios.

### Dolos

You can also self-host with [TxPipe Dolos](https://docs.txpipe.io/dolos), which exposes a [Mini Blockfrost API](https://docs.txpipe.io/dolos/apis/minibf) over your own node.

## Further Resources

- [Koios Documentation](https://preprod.koios.rest/) - full endpoint reference.
- [Blockfrost](https://blockfrost.io/) - alternate API with free tier.
- [Blockfrost API docs](https://docs.blockfrost.io/) - endpoint reference.
- [Maestro](https://www.gomaestro.org/) - another provider.
- [TxPipe Dolos](https://docs.txpipe.io/dolos) - self-host a Mini Blockfrost API.
- [ArduinoJSON Library](https://docs.arduino.cc/libraries/arduinojson/) - JSON parsing in Arduino.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/02-read-and-output/fetch-wallet-balance) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-02](https://github.com/CardanoThings/Workshops/tree/main/Workshop-02).*
