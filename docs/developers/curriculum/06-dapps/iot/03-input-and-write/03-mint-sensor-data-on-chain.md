---
id: 03-mint-sensor-data-on-chain
title: Mint Sensor Data on-chain
sidebar_label: 03 - Mint Sensor Data
description: Mint each sensor reading as an NFT using the CIP-25 metadata standard. Includes burning.
---

The capstone for Workshop 03: turn the metadata-storing flow from the previous lesson into NFT minting. Each sensor reading becomes a unique on-chain item.

## What we're building

By the end of this lesson, every time the microcontroller posts sensor data to the API, the API mints an NFT containing that reading. NFTs are permanent - they can't be deleted or modified once minted.

**Prerequisites:**

- The previous two lessons in this workshop (sensor + Node.js API).
- Node.js and npm.
- A Preprod testnet wallet with some tADA for fees.

## Understanding NFT minting

**Minting** is just the term for "creating an NFT." Each NFT is a unique digital item on-chain - a permanent certificate that "this sensor reading happened at this time."

**Policy ID** is a unique identifier for an NFT collection - like a label on a series. You use the same policy ID to mint multiple NFTs in the same collection or to look up the whole collection on a block explorer.

The example NFT metadata structure used in this lesson:

```json
{
  "policyId": {
    "tokenName": {
      "name": "Sensor Data NFT - 2024-01-15T10:30:00Z",
      "image": "https://cardanothings.io/nft.png",
      "mediaType": "image/png",
      "description": "Temperature and humidity sensor data",
      "author": "A CardanoThings.io User",
      "temperature": "23.5",
      "humidity": "65.2",
      "timestamp": 1705312200000
    }
  }
}
```

`policyId` and `tokenName` are generated automatically by the server.

## Minting your first NFT

This script connects to Preprod, sets up your wallet, builds and signs a minting transaction with [CIP-25](https://cips.cardano.org/cips/cip25/) metadata, and submits it.

```javascript
// Import Mesh SDK components needed for minting NFTs
// KoiosProvider: Connects to Cardano blockchain to read and submit data
// MeshCardanoHeadlessWallet: Represents your wallet and handles signing transactions
// MeshTxBuilder: Builds blockchain transactions step by step
// ForgeScript: Creates the policy script that controls who can mint NFTs
// resolveScriptHash: Converts the policy script into a Policy ID
// stringToHex: Converts text names into hexadecimal format for blockchain
import { KoiosProvider } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';

// Step 1: Set up the blockchain provider
// This connects you to the Cardano network
// 'preprod' = testnet (free, for testing), 'api' = mainnet (real money)
const provider = new KoiosProvider('preprod');

// Step 2: Set up your wallet
// IMPORTANT: Replace these words with your actual wallet mnemonic phrase
// NEVER share your mnemonic with anyone or commit it to GitHub!
// In production, use environment variables: process.env.WALLET_MNEMONIC?.split(' ')
const mnemonic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12"];

// Step 3: Create your wallet instance
// This wallet will be used to sign transactions and interact with the blockchain
// fromMnemonic is async and builds a ready-to-use wallet - no separate init needed
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
	networkId: 0,                        // 0 = testnet (Preprod), 1 = mainnet
	walletAddressType: AddressType.Base,
	fetcher: provider,                   // Provider for reading blockchain data (like your balance)
	submitter: provider,                 // Provider for sending transactions to the network
	mnemonic                             // Your wallet's mnemonic words
});

// Step 5: Get your wallet's UTXOs (Unspent Transaction Outputs)
// UTXOs are like coins in your wallet - they represent available funds
// We need these to pay for the transaction fees
const utxos = await wallet.getUtxosMesh();

// Step 6: Get your change address
// This is your wallet address where any leftover funds will be sent back
const changeAddress = await wallet.getChangeAddressBech32();

// Step 7: Create a forging script (minting policy)
// This script defines who can mint NFTs from this collection
// withOneSignature means only your wallet can mint NFTs with this policy
const forgingScript = ForgeScript.withOneSignature(changeAddress);

// Step 8: Prepare the NFT metadata
// This is the information that will be stored in your NFT
// It can include name, description, image, and any custom data
const demoAssetMetadata = {
	name: "Sensor Data NFT - 2024-01-15T10:30:00Z",  // Name of your NFT
	image: "https://cardanothings.io/nft.png",      // URL to the NFT image
	mediaType: "image/png",                          // Type of image file
	description: "Temperature and humidity sensor data",  // Description of the NFT
	author: "A CardanoThings.io User",              // Who created this NFT
	temperature: "23.5",                            // Sensor reading: temperature
	humidity: "65.2",                               // Sensor reading: humidity
	timestamp: Date.now(),                           // When this data was recorded
};

// Step 9: Generate the Policy ID
// The Policy ID is a unique identifier for your NFT collection
// All NFTs minted with the same policy belong to the same collection
const policyId = resolveScriptHash(forgingScript);
console.log("Policy ID:", policyId);

// Step 10: Create a unique token name
// Each NFT needs a unique name within the collection
// We add a timestamp to make sure each NFT has a different name
const tokenName = "TemperatureNFT" + Date.now().toString();

// Step 11: Convert token name to hexadecimal
// Blockchain requires names to be in hexadecimal format (base 16)
const tokenNameHex = stringToHex(tokenName);

// Step 12: Structure the metadata according to CIP-25 standard
// CIP-25 is the Cardano standard for NFT metadata
// The structure is: { policyId: { tokenName: { metadata } } }
const metadata = { 
	[policyId]: { 
		[tokenName]: { ...demoAssetMetadata } 
	} 
};

// Step 13: Create a transaction builder
// This tool helps us build the minting transaction step by step
const txBuilder = new MeshTxBuilder({
	fetcher: provider,   // Provider for fetching blockchain data
	verbose: false,     // Set to true for detailed logging (helpful for debugging)
});

// Step 14: Build the minting transaction
// This creates the transaction that will mint your NFT
const unsignedTx = await txBuilder
	.mint("1", policyId, tokenNameHex)      // Mint 1 NFT with the given policy and name
	.mintingScript(forgingScript)            // Use our policy script
	.metadataValue(721, metadata)           // Attach metadata (721 is the CIP-25 standard label)
	.changeAddress(changeAddress)           // Where to send any leftover funds
	.selectUtxosFrom(utxos)                 // Which UTXOs to use for payment
	.complete();                             // Finish building the transaction

// Step 15: Sign the transaction
// Your wallet signs the transaction to prove you authorized it
// This is like signing a check - it proves the transaction came from you
const signedTx = await wallet.signTx(unsignedTx);

// Step 16: Submit the transaction to the blockchain
// This sends your transaction to the Cardano network
// The network will process it and create your NFT
const txHash = await wallet.submitTx(signedTx);

// Step 17: Check if the transaction was successful
// If txHash exists, the transaction was submitted successfully
if (txHash) {
	console.log("Transaction submitted successfully!");
	console.log("Transaction Hash:", txHash);
	// You can view your transaction on the Cardano explorer
	console.log("View on Cardano Explorer:", `https://preprod.cardanoscan.io/transaction/${txHash}`);
} else {
	console.error("Transaction submission failed!");
}

```

> Source: [`Workshop-03/examples/mesh-nft-basics/mint-nft.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/mesh-nft-basics/mint-nft.js)

Matching `package.json`:

```json
{
	"name": "mesh-nft-basics",
	"version": "1.0.0",
	"description": "Basic NFT minting and burning examples using Mesh SDK",
	"type": "module",
	"main": "mint-nft.js",
	"scripts": {
		"mint": "node mint-nft.js",
		"burn": "node burn-nft.js"
	},
	"dependencies": {
		"@meshsdk/core": "^1.7.0",
		"@meshsdk/wallet": "^1.7.0"
	}
}

```

Replace the mnemonic array with your testnet wallet's mnemonic, ensure your wallet has some tADA, then `node mint-nft.js`. Once the tx confirms (a moment later), view the NFT on [preprod.cardanoscan.io](https://preprod.cardanoscan.io/) by pasting the tx hash, or view the whole collection by pasting the policy ID. Your Yoroi NFTs tab will show it too.

## Posting sensor data from the microcontroller

Now wire the AHT10 sensor + Node.js API together: the ESP32 reads the sensor and POSTs to your API every 5 minutes.

:::info Send-once flag for testing
The sketch has a `sendOnce` flag (defaults to `true`) - sends the data once instead of on a 5-minute loop. Useful while debugging, so you don't burn through transactions. Set to `false` for continuous mode.
:::

```cpp
// Include necessary libraries
#include <WiFi.h>              // WiFi connectivity
#include <HTTPClient.h>       // HTTP client for API calls
#include <ArduinoJson.h>      // JSON parsing and creation
#include <Adafruit_AHT10.h>   // Adafruit AHT10 library

// Create AHT10 sensor object
Adafruit_AHT10 aht;

// WiFi credentials - replace with your network details
const char* ssid = "Your SSID";
const char* password = "Your Password";

// Your API server URL - replace with your server's IP address
const char* apiUrl = "http://YOUR_SERVER_IP:3000/data";

// Variables for timing sensor readings
unsigned long lastReading = 0;                    // Timestamp of last reading
const unsigned long readingInterval = 300000;     // Read every 5 minutes (300000 milliseconds)

// Send once flag - set to true for testing to avoid creating too many transactions
const bool sendOnce = true;                       // If true, send sensor data only once
bool dataSent = false;                            // Track if data has been sent

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(115200);
    Serial.println("Temperature Sensor NFT Demo!");
    
    // Initialize AHT10 sensor
    if (!aht.begin()) {
        Serial.println("Could not find AHT10? Check wiring");
        while (1) delay(10);  // Halt if sensor not found
    }
    Serial.println("AHT10 found");
    
    // Start WiFi connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
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
    
    // Check if enough time has passed since last reading
    if (currentMillis - lastReading >= readingInterval) {
        // Only send if sendOnce is false, or if sendOnce is true and data hasn't been sent yet
        if (!sendOnce || !dataSent) {
            sendSensorData();  // Read sensor and send to API
            dataSent = true;   // Mark that data has been sent
        }
        lastReading = currentMillis;  // Update last reading timestamp
    }
}

void sendSensorData() {
    // Create sensor event structures to hold readings
    sensors_event_t humidity_event, temp_event;
    
    // Read both temperature and humidity from sensor
    // The getEvent() function populates temp and humidity objects with fresh data
    aht.getEvent(&humidity_event, &temp_event);
    
    // Extract temperature and humidity values
    float temperature = temp_event.temperature;        // Temperature in Celsius
    float humidity = humidity_event.relative_humidity;  // Humidity as percentage (0-100)
    
    // Print sensor readings to serial monitor
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" degrees C");
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println("% rH");
    
    // Only proceed if WiFi is connected
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        
        // Initialize HTTP client with API URL
        http.begin(apiUrl);
        
        // Set content type header for JSON request
        http.addHeader("Content-Type", "application/json");
        
        // Create JSON document to build request payload
        DynamicJsonDocument doc(512);
        
        // Add sensor data to JSON document
        doc["temperature"] = temperature;    // Temperature in Celsius
        doc["humidity"] = humidity;          // Humidity as percentage (0-100)
        doc["timestamp"] = millis();         // Current time in milliseconds
        
        // Serialize JSON document to string
        String jsonPayload;
        serializeJson(doc, jsonPayload);
        
        Serial.println("Sending data to API...");
        Serial.println("Payload: " + jsonPayload);
        
        // Send POST request to API
        int httpResponseCode = http.POST(jsonPayload);
        
        // Check if request was successful
        if (httpResponseCode > 0) {
            // Get response body
            String response = http.getString();
            Serial.println("HTTP Response Code: " + String(httpResponseCode));
            Serial.println("Response: " + response);
        } else {
            // Print error if request failed
            Serial.println("Error in HTTP request");
            Serial.println("HTTP Response Code: " + String(httpResponseCode));
        }
        
        // Close HTTP connection
        http.end();
    }
}

```

> Source: [`Workshop-03/examples/post-sensor-data/post-sensor-data.ino`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/post-sensor-data/post-sensor-data.ino)

**Configure:**

1. Update `ssid` and `password` for your WiFi.
2. Replace `YOUR_SERVER_IP` with your computer's IP.
3. Make sure the Node.js API server is running and reachable on your network.
4. Upload, open the serial monitor at 115200 baud.

:::info Finding your server IP
- **Windows:** `ipconfig` → "IPv4 Address" under your active adapter.
- **macOS / Linux:** `ifconfig` or `ip addr` → look for `inet` on `en0` (Mac) or `wlan0` (Linux).

Both devices must be on the same network.
:::

At this point, the previous workshop's API still creates plain transactions with metadata - not NFTs. Time to upgrade the server.

## Putting it all together

Replace the previous server with one that mints an NFT per POST.

```javascript
// Import required Node.js packages
import express from 'express';
import cors from 'cors';
import { KoiosProvider, MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';

// Create Express application instance
const app = express();

// Server port number
const PORT = 3000;

// Initialize Koios provider for Preprod Testnet
// Koios is free to use and doesn't require an API key
const provider = new KoiosProvider('preprod');

// Initialize wallet using mnemonic
// IMPORTANT: Replace these words with your actual wallet mnemonic phrase
// NEVER share your mnemonic with anyone or commit it to GitHub!
const mnemonic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12"];

const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
    networkId: 0,                        // 0 = testnet (Preprod), 1 = mainnet
    walletAddressType: AddressType.Base,
    fetcher: provider,
    submitter: provider,
    mnemonic
});

// Middleware: Enable CORS to allow requests from different origins
app.use(cors());

// Middleware: Parse JSON request bodies
app.use(express.json());

// POST endpoint to receive sensor data and mint NFT
// URL: http://localhost:3000/data
app.post('/data', async (req, res) => {
    try {
        // Extract sensor data from request body
        const { temperature, humidity, timestamp } = req.body;
        
        // Validate required fields
        if (temperature === undefined || humidity === undefined) {
            return res.status(400).json({ 
                success: false, 
                error: 'temperature and humidity are required' 
            });
        }

        console.log('Received sensor data:', { temperature, humidity, timestamp });

        // Get wallet UTXOs and change address
        const utxos = await wallet.getUtxosMesh();
        const changeAddress = await wallet.getChangeAddressBech32();
        
        // Create forging script for minting
        // This creates a simple policy that allows minting from the wallet address
        const forgingScript = ForgeScript.withOneSignature(changeAddress);
        const policyId = resolveScriptHash(forgingScript);
        
        // Create unique token name based on timestamp
        const tokenName = `SensorData_${timestamp || Date.now()}`;
        const tokenNameHex = stringToHex(tokenName);
        
        // Create NFT metadata following CIP-25 standard (label 721)
        const assetMetadata = {
            name: `Sensor Data NFT - ${new Date().toISOString()}`,
            image: "https://cardanothings.io/nft.png",
            mediaType: "image/png",
            description: 'Temperature and humidity sensor data',
            author: "A CardanoThings.io User",
            temperature: temperature.toString(),
            humidity: humidity.toString(),
            timestamp: timestamp || Date.now()
        };
        
        // Structure metadata according to CIP-25 standard
        const metadata = {
            [policyId]: {
                [tokenName]: assetMetadata
            }
        };

        // Initialize MeshTxBuilder
        const txBuilder = new MeshTxBuilder({
            fetcher: provider,
            verbose: true
        });
        
        // Build the minting transaction
        const unsignedTx = await txBuilder
            .mint("1", policyId, tokenNameHex)  // Mint 1 token
            .mintingScript(forgingScript)         // Use the forging script
            .metadataValue(721, metadata)         // Attach NFT metadata (CIP-25 standard)
            .changeAddress(changeAddress)        // Address to receive change
            .selectUtxosFrom(utxos)              // Select UTXOs to fund the transaction
            .complete();
        
        // Sign the transaction with your wallet
        const signedTx = await wallet.signTx(unsignedTx);
        
        // Submit the transaction to the network
        const txHash = await wallet.submitTx(signedTx);
        
        console.log('NFT minted successfully!');
        console.log('Transaction Hash:', txHash);
        
        res.json({ 
            success: true, 
            message: 'Sensor data received and NFT minted successfully',
            txHash: txHash,
            explorerUrl: `https://preprod.cardanoscan.io/transaction/${txHash}`,
            policyId: policyId,
            tokenName: tokenName,
            metadata: assetMetadata
        });
    } catch (error) {
        console.error('Error minting NFT:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET endpoint for health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server and listen on specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('POST sensor data to: http://localhost:' + PORT + '/data');
});

```

> Source: [`Workshop-03/examples/nodejs-nft-api/server.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/nodejs-nft-api/server.js)

Matching `package.json`:

```json
{
  "name": "nodes-nft-api",
  "version": "1.0.0",
  "description": "Node.js API server that receives sensor data and automatically mints NFTs on Cardano blockchain",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@meshsdk/core": "^1.7.0",
    "@meshsdk/wallet": "^1.7.0"
  }
}

```

**Setup:**

1. `npm install express cors @meshsdk/core @meshsdk/wallet`.
2. Replace the mnemonic array with your testnet mnemonic.
3. `node server.js`.
4. Make sure the Arduino sketch points at this server's IP and port 3000.

:::info
**Security:** never commit a mnemonic. Use environment variables and `.gitignore` your `.env`.

**Testnet vs Mainnet:** Preprod here is `networkId: 0`. Mainnet is `1` and `new KoiosProvider('api')`.

**Fees:** each NFT mint costs ~0.2 tADA on testnet. Make sure your wallet has enough for the volume you intend to send.
:::

## Burning NFTs

Sometimes you want to destroy an NFT - clean up test mints, retire a series, etc. Burning permanently removes the NFT (the original transaction stays visible).

**Burning is mint with a negative amount.** Mint `-1` of a token and you destroy one.

**Important:**

- You can only burn NFTs you minted.
- Use the exact same policy ID and token name as the original mint.
- Burning is permanent.
- You still pay a transaction fee.

```javascript
// Import Mesh SDK components needed for burning NFTs
import { KoiosProvider } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';

// IMPORTANT: Replace these words with your actual wallet mnemonic phrase
// NEVER share your mnemonic with anyone or commit it to GitHub!
const mnemonic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12"];

// The exact name of the token you want to burn
// This should match the tokenName used when minting the NFT
const tokenName = ""; // Replace with your token name, e.g., "SensorData_1705312200000"

// Initialize Koios provider for Preprod Testnet
const provider = new KoiosProvider('preprod');

// Create the wallet instance
// fromMnemonic is async and builds a ready-to-use wallet - no separate init needed
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
	networkId: 0,                        // 0 = testnet (Preprod), 1 = mainnet
	walletAddressType: AddressType.Base,
	fetcher: provider,                   // Provider for fetching blockchain data
	submitter: provider,                 // Provider for submitting transactions
	mnemonic                             // Array of mnemonic words
});

// Get wallet UTXOs (Unspent Transaction Outputs) - these are like coins in your wallet
const utxos = await wallet.getUtxosMesh();

// Get the change address where any leftover funds will be sent back
const changeAddress = await wallet.getChangeAddressBech32();

// Create forging script for the policy
// This must match the policy used when minting the NFT
const forgingScript = ForgeScript.withOneSignature(changeAddress);

// Generate the Policy ID from the forging script
const policyId = resolveScriptHash(forgingScript);

// Convert token name to hexadecimal format (required by blockchain)
const tokenNameHex = stringToHex(tokenName);

// Initialize transaction builder
const txBuilder = new MeshTxBuilder({
	fetcher: provider, // Provider for fetching blockchain data
	verbose: false, // Set to true for detailed debugging information during transaction building
});

// Build the burn transaction
// Minting "-1" is the same as burning 1 token
const unsignedTx = await txBuilder
	.mint("-1", policyId, tokenNameHex)  // Mint -1 token (burns 1 token)
	.mintingScript(forgingScript)         // Use the same policy script
	.changeAddress(changeAddress)        // Address to receive change
	.selectUtxosFrom(utxos)               // Select UTXOs to fund the transaction
	.complete();

// Sign the transaction with your wallet
const signedTx = await wallet.signTx(unsignedTx);

// Submit the transaction to the blockchain
const txHash = await wallet.submitTx(signedTx);

// Log the transaction hash - you can view it on the Cardano explorer
if (txHash) {
	console.log("Transaction submitted successfully!");
	console.log("Transaction Hash:", txHash);
	console.log("View on Cardano Explorer:", `https://preprod.cardanoscan.io/transaction/${txHash}`);
} else {
	console.error("Transaction submission failed!");
}

```

> Source: [`Workshop-03/examples/mesh-nft-basics/burn-nft.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/mesh-nft-basics/burn-nft.js)

Set `tokenName` to the exact name of the NFT you want to burn (case-sensitive). Run with `node burn-nft.js`.

:::info Finding token names
- **From the API response** when minting - there's a `tokenName` field. Copy it exactly.
- **From your wallet** (Yoroi, Vespr, Eternl) - view your NFTs.
- **From an explorer** - view your transaction on [CardanoScan](https://preprod.cardanoscan.io/) and check the asset details.
:::

## Next steps
Some directions to explore:

- Mint NFTs hourly, daily, or only on threshold crossings (e.g. temperature > X).
- Build a website to display your NFTs and sensor data using Koios endpoints like [`/account_assets`](https://preprod.koios.rest/#post-/account_assets) or [`/policy_asset_info`](https://preprod.koios.rest/#get-/policy_asset_info).
- Wire other sensors (light, motion) and mint when conditions trigger.
- Build more complex apps with [Mesh SDK](https://meshjs.dev/).

If running your own minting infrastructure is too much, [NMKR](https://nmkr.io/) is a paid service for NFT minting via API. There's a third-party [tutorial integrating NMKR with an ESP32 Cam](https://github.com/elRaulito/IoT-NMKR-integration-Open-Source-).

If you want more, the next workshop builds a Cardano Ticker on the CYD - no soldering, no API server, all on-device.

## Further Resources

- [Mesh SDK Documentation](https://meshjs.dev/) - full reference.
- [Mesh Minting Guide](https://meshjs.dev/apis/txbuilder/minting) - minting examples (native + Plutus).
- [CIP-25 NFT Metadata Standard](https://cips.cardano.org/cips/cip25/) - the spec.
- [Preprod CardanoScan](https://preprod.cardanoscan.io/) - block explorer.
- [Koios API](https://api.koios.rest/) - free Cardano API.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/03-input-and-write/mint-sensor-data-on-chain) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-03](https://github.com/CardanoThings/Workshops/tree/main/Workshop-03).*
