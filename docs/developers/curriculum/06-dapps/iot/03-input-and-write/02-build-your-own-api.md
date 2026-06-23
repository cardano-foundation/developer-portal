---
id: 02-build-your-own-api
title: Build your own API to put data on-chain
sidebar_label: 02 - Build your own API
description: Build a Node.js + Express API that uses Mesh SDK and the Koios provider to fetch wallet balance and submit transactions with sensor data as metadata.
---

Build a small Node.js API server that bridges your microcontroller to the chain: it fetches wallet balance, builds and submits transactions, and accepts sensor readings via POST that get attached as transaction metadata.

We use [Mesh SDK](https://meshjs.dev/) (open-source TypeScript SDK for Cardano) with the [Koios](https://api.koios.rest/) provider - Koios is free and needs no API key, perfect for development.

## Setting up Node.js

**Prerequisites:**

- Node.js 14+ and npm.
- A text editor (VS Code, Cursor, etc.).

**Create the project:**

1. Make a new directory and `cd` into it.
2. `npm init -y` - initialise.
3. `npm install express` - install Express.

### Basic Express server

```javascript
// Import required Node.js packages
import express from 'express';              // Web framework for building API

// Create Express application instance
const app = express();

// Server port number
const PORT = 3000;

// GET endpoint for health check
// Useful for testing if server is running
// URL: http://localhost:3000/health
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server and listen on specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

```

> Source: [`Workshop-03/examples/basic-nodejs-api/basic-api.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/basic-nodejs-api/basic-api.js)

Make sure your `package.json` has `"type": "module"` so ESM imports work:

```json
{
	"name": "basic-nodejs-api",
	"version": "1.0.0",
	"description": "Basic Node.js API server",
	"type": "module",
	"main": "server.js",
	"scripts": {
		"start": "node server.js"
	},
	"dependencies": {
		"express": "^4.18.2",
		"cors": "^2.8.5"
	}
}
```

Run it:

```bash
node basic-api.js
```

The server runs at `http://localhost:3000`. Hit `http://localhost:3000/health` in a browser or [Insomnia](https://insomnia.rest/) to verify.

## Adding a POST endpoint

Now add a POST endpoint that accepts data, an in-memory store, CORS, and JSON parsing.

Install CORS:

```bash
npm install cors
```

```javascript
// Import required Node.js packages
import express from 'express';              // Web framework for building API
import cors from 'cors';                   // Enable Cross-Origin Resource Sharing

// Create Express application instance
const app = express();

// Server port number
const PORT = 3000;

// Store received data in memory
// In a production app, you would use a database instead
let storedData = null;

// Middleware: Enable CORS to allow requests from different origins
app.use(cors());

// Middleware: Parse JSON request bodies
app.use(express.json());

// POST endpoint to receive and store data
// URL: http://localhost:3000/data
app.post('/data', async (req, res) => {
    try {
        // Extract data from request body
        const data = req.body;
        
        // Store the data in a variable
        storedData = data;
        
        // Log received data to console for debugging
        console.log('Received and stored data:', data);
        
        // Return success response
        res.json({ 
            success: true, 
            message: 'Data received and stored successfully.',
            data: data
        });
    } catch (error) {
        // Handle errors and return error response
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET endpoint to retrieve stored data
// URL: http://localhost:3000/data
app.get('/data', (req, res) => {
    try {
        if (storedData === null) {
            return res.status(404).json({ 
                success: false, 
                message: 'No data has been stored yet. Send a POST request to /data first.' 
            });
        }
        
        // Return the stored data
        res.json({ 
            success: true, 
            data: storedData 
        });
    } catch (error) {
        // Handle errors and return error response
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET endpoint for health check
// Useful for testing if server is running
// URL: http://localhost:3000/health
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server and listen on specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

```

> Source: [`Workshop-03/examples/basic-nodejs-api/server.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/basic-nodejs-api/server.js)

**Test:**

1. Start: `node server.js`.
2. POST to `http://localhost:3000/data` with body `{"temperature": 23.5, "humidity": 65.2}`.
3. GET `http://localhost:3000/data` to retrieve.

Data is in memory - it disappears on restart. In production, use a database.

## Adding Mesh for blockchain interaction

Now bring [Mesh SDK](https://meshjs.dev/) in to interact with the chain.

```bash
npm install @meshsdk/core @meshsdk/wallet
```

No API key required - Koios is free. If you hit rate limits, sign up for the free tier at [koios.rest](https://koios.rest/). Use `'preprod'` for testnet, `'api'` for mainnet.

For wallet operations, you'll need a mnemonic (seed phrase). The example code uses a `mnemonic` array - fine for examples, but in production always load from environment variables. Use a **testnet** wallet for development.

## Fetching wallet balance with Mesh

A standalone script - initialise a wallet from a mnemonic, fetch balance, log it.

```javascript
// Import Mesh SDK components
import { KoiosProvider } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';

// Initialize Koios provider for Preprod Testnet
// Koios is free to use and doesn't require an API key
// 'preprod' = Preprod testnet, 'api' = Mainnet
const provider = new KoiosProvider('preprod');

// Initialize wallet using mnemonic
// WARNING: This is for example purposes only! Never hardcode your mnemonic in production code!
// In production, always use environment variables: process.env.WALLET_MNEMONIC?.split(' ') || []
// Replace with your actual 12 or 24 word mnemonic phrase from your testnet wallet
const mnemonic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12"];

// Create MeshCardanoHeadlessWallet instance
// This wallet will be used to interact with the Cardano blockchain
// fromMnemonic is async (no separate init() step needed)
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
	networkId: 0,  // 0 = testnet (Preprod), 1 = mainnet
	walletAddressType: AddressType.Base,
	fetcher: provider,  // Provider for fetching blockchain data
	submitter: provider,  // Provider for submitting transactions
	mnemonic  // Array of mnemonic words
});

// Function to fetch and log wallet balance
async function fetchWalletBalance() {
	try {
		// Get wallet address
		// The change address is the address where change from transactions is sent
		const address = await wallet.getChangeAddressBech32();
		console.log('Wallet Address:', address);
		
		// Get wallet balance using Mesh's built-in method
		// Returns an array of assets: [{ unit: 'lovelace', quantity: '...' }, ...]
		// The first item is always lovelace (ADA), followed by any native tokens
		const balanceArray = await wallet.getBalanceMesh();
		
		// Extract lovelace from the balance array
		// Find the item with unit 'lovelace' and get its quantity
		const lovelaceAsset = balanceArray.find(asset => asset.unit === 'lovelace');
		const balanceLovelace = lovelaceAsset ? parseInt(lovelaceAsset.quantity) : 0;
		
		// Convert Lovelace to ADA
		// 1 ADA = 1,000,000 Lovelace
		const balanceADA = balanceLovelace / 1000000;
		
		// Log wallet information to console
		console.log('Wallet Balance:', balanceADA, 'ADA');
		console.log('Balance in Lovelace:', balanceLovelace);
	} catch (error) {
		// Handle any errors that occur during balance fetching
		console.error('Error fetching wallet balance:', error);
	}
}

// Call the function to fetch and log wallet balance
fetchWalletBalance();

```

> Source: [`Workshop-03/examples/mesh-basics/wallet-balance.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/mesh-basics/wallet-balance.js)

Run with `node wallet-balance.js` - your wallet address and balance print to the console.

:::info
- Always use testnet wallets for development.
- Never expose mnemonics in code.
- Koios is free and needs no API key.
:::

## Creating and submitting transactions

Now use [`MeshTxBuilder`](https://meshjs.dev/apis/txbuilder/basics) to send tADA to another address with metadata attached.

```javascript
// Import Mesh SDK components
import { KoiosProvider, MeshTxBuilder } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';

// Initialize Koios provider for Preprod Testnet
// Koios is free to use and doesn't require an API key
// 'preprod' = Preprod testnet, 'api' = Mainnet
const provider = new KoiosProvider('preprod');

// Initialize wallet using mnemonic
// WARNING: This is for example purposes only! Never hardcode your mnemonic in production code!
// In production, always use environment variables: process.env.WALLET_MNEMONIC?.split(' ') || []
// Replace with your actual 12 or 24 word mnemonic phrase from your testnet wallet
const mnemonic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12"];

// Create MeshCardanoHeadlessWallet instance
// This wallet will be used to create and sign transactions
// fromMnemonic is async (no separate init() step needed)
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
	networkId: 0,  // 0 = testnet (Preprod), 1 = mainnet
	walletAddressType: AddressType.Base,
	fetcher: provider,  // Provider for fetching blockchain data
	submitter: provider,  // Provider for submitting transactions
	mnemonic  // Array of mnemonic words
});

// Function to create and submit a transaction with metadata
async function sendTransaction() {
	try {
		// PingPong wallet address - this wallet will automatically refund the transaction minus fees within 60 seconds
		// Perfect for testing transactions on the Cardano Preprod testnet
		// The PingPong wallet sends your funds back automatically, making it ideal for testing
		const recipientAddress = 'addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w';
		
		// Amount to send in ADA
		// This will be converted to Lovelace (1 ADA = 1,000,000 Lovelace)
		const amountADA = 10.0;  // Send 10 ADA
		const amountLovelace = Math.floor(amountADA * 1000000);  // Convert to Lovelace
		
		// Transaction metadata
		// Metadata allows you to attach additional data to transactions that is permanently stored on the blockchain
		// Metadata labels must be numbers between 0 and 65535
		// Label 674 = Message (CIP-20 standard for transaction messages)
		const metadata = {
			674: {  // Message label (CIP-20 standard)
				msg: ['Hello from CardanoThings!', 'This is a test transaction with metadata.']
			}
		};
		
		// Log transaction details before creating it
		console.log('Creating transaction...');
		console.log('Recipient:', recipientAddress);
		console.log('Amount:', amountADA, 'ADA');
		console.log('Metadata:', JSON.stringify(metadata, null, 2));
		
		// Get wallet UTXOs (Unspent Transaction Outputs)
		// UTXOs represent available funds in your wallet that can be spent
		const utxos = await wallet.getUtxosMesh();
		
		// Get change address
		// This is where any remaining funds (after transaction amount and fees) will be sent
		const changeAddress = await wallet.getChangeAddressBech32();
		
		// Initialize MeshTxBuilder
		// MeshTxBuilder provides low-level APIs for building transactions with fine-grained control
		// This gives you more control than the higher-level wallet.buildTx() method
		const txBuilder = new MeshTxBuilder({
			fetcher: provider,  // Provider for fetching blockchain data needed for transaction building
			verbose: false  // Set to true for detailed debugging information during transaction building
		});
		
		// Build the transaction using MeshTxBuilder
		// This approach gives you more control over the transaction structure
		const unsignedTx = await txBuilder
			.txOut(recipientAddress, [{ unit: 'lovelace', quantity: amountLovelace.toString() }])  // Output: send lovelace to recipient address
			.changeAddress(changeAddress)  // Address to receive change (remaining funds after transaction)
			.metadataValue(674, metadata[674])  // Attach message metadata (label 674, CIP-20 standard)
			.selectUtxosFrom(utxos)  // Automatically select UTXOs from the provided list to fund the transaction
			.complete();  // Finalize the transaction structure and return the unsigned transaction
		
		// Sign the transaction with your wallet's private key
		// This proves that you own the wallet and authorizes the transaction
		const signedTx = await wallet.signTx(unsignedTx);
		
		// Submit the signed transaction to the Cardano network
		// The transaction will be broadcast to the network and included in the next block
		const txHash = await wallet.submitTx(signedTx);
		
		// Log success message and transaction details
		console.log('Transaction submitted successfully!');
		console.log('Transaction Hash:', txHash);
		console.log('View on Cardano Explorer:', `https://preprod.cardanoscan.io/transaction/${txHash}`);
		console.log('Metadata will be visible on the blockchain explorer');
	} catch (error) {
		// Handle any errors that occur during transaction creation or submission
		console.error('Error creating or submitting transaction:', error);
	}
}

// Call the function to create and submit transaction
sendTransaction();

```

> Source: [`Workshop-03/examples/mesh-basics/send-transaction.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/mesh-basics/send-transaction.js)

The `recipientAddress` is preset to the CardanoThings PingPong wallet - it bounces test transactions back to you within ~60 seconds, which is convenient for testing flows. Run with `node send-transaction.js` and view the resulting tx on [preprod.cardanoscan.io](https://preprod.cardanoscan.io/).

:::tip CardanoThings PingPong wallet
The PingPong wallet auto-refunds your transaction (minus fees) within ~60 seconds, so you can iterate without finding a friend with a Preprod wallet.

Address: `addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w`

Preprod-only.
:::

:::warning
- Use only testnet addresses (`addr_test1...`) for development.
- Each transaction needs a small fee (~0.17 to 0.2 ADA).
- Submitted transactions can't be reversed - verify before sending.
- Confirmation can take a few seconds to minutes.
:::

## Putting it all together

Combine Express + Mesh + Koios into one server. `GET /wallet` returns wallet info; `POST /data` accepts sensor readings and submits a transaction with the data as metadata to the PingPong wallet.

```javascript
// Import required Node.js packages
import express from 'express';
import cors from 'cors';
import { KoiosProvider, MeshTxBuilder } from '@meshsdk/core';
import { MeshCardanoHeadlessWallet, AddressType } from '@meshsdk/wallet';

// Create Express application instance
const app = express();

// Server port number
const PORT = 3000;

// Initialize Koios provider for Preprod Testnet
// Koios is free to use and doesn't require an API key
const provider = new KoiosProvider(
	'preprod'  // Network: 'preprod' for testnet, 'api' for mainnet
);

// Initialize wallet using mnemonic
// WARNING: This is for example purposes only! Never hardcode your mnemonic in production code!
// In production, always use environment variables: process.env.WALLET_MNEMONIC?.split(' ') || []
// Replace with your actual 12 or 24 word mnemonic phrase from your testnet wallet
const mnemonic = ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12"];

// Create MeshCardanoHeadlessWallet instance
// This wallet will be used to interact with the Cardano blockchain
// fromMnemonic is async (no separate init() step needed)
const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
	networkId: 0,  // 0 = testnet (Preprod), 1 = mainnet
	walletAddressType: AddressType.Base,
	fetcher: provider,  // Provider for fetching blockchain data
	submitter: provider,  // Provider for submitting transactions
	mnemonic  // Array of mnemonic words
});

// Middleware: Enable CORS to allow requests from different origins
// This allows your microcontroller to make requests to this API from a different domain
app.use(cors());

// Middleware: Parse JSON request bodies
// This automatically parses JSON data sent in POST/PUT requests
app.use(express.json());

// GET endpoint to retrieve wallet information
// Returns wallet address, balance, and network information
app.get('/wallet', async (req, res) => {
	try {
		// Get wallet address
		// The change address is the address where change from transactions is sent
		const address = await wallet.getChangeAddressBech32();
		
		// Get wallet balance using Mesh's built-in method
		// Returns an array of assets: [{ unit: 'lovelace', quantity: '...' }, ...]
		// The first item is always lovelace (ADA)
		const balanceArray = await wallet.getBalanceMesh();
		
		// Extract lovelace from the balance array
		// Find the item with unit 'lovelace' and get its quantity
		const lovelaceAsset = balanceArray.find(asset => asset.unit === 'lovelace');
		const balanceLovelace = lovelaceAsset ? parseInt(lovelaceAsset.quantity) : 0;
		
		// Convert Lovelace to ADA
		// 1 ADA = 1,000,000 Lovelace
		const balanceADA = balanceLovelace / 1000000;
		
		// Return wallet information as JSON response
		res.json({ 
			success: true, 
			address: address,  // Wallet address
			balance: {
				lovelace: balanceLovelace,  // Balance in Lovelace
				ada: balanceADA  // Balance in ADA
			},
			network: 'preprod'  // Network: preprod testnet
		});
	} catch (error) {
		// Handle errors and return error response
		console.error('Error:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// POST endpoint to receive sensor data and create a transaction
// URL: http://localhost:3000/data
// Request Body: { temperature: 23.5, humidity: 65.2 }
app.post('/data', async (req, res) => {
	try {
		// Extract sensor data from request body
		const { temperature, humidity } = req.body;
		
		// Validate required fields
		if (temperature === undefined || humidity === undefined) {
			return res.status(400).json({ 
				success: false, 
				error: 'temperature and humidity are required' 
			});
		}

		// Generate timestamp server-side when data is received
		const timestamp = Date.now();

		console.log('Received sensor data:', { temperature, humidity, timestamp });

		// PingPong wallet address - this wallet will automatically refund the transaction minus fees within 60 seconds
		// Perfect for testing transactions on the Cardano Preprod testnet
		const recipientAddress = 'addr_test1qpvla0l6zgkl4ufzur0wal0uny5lyqsg4rw7g6gxj08lzacth0hnd66lz6uqqz7kwkmx07xyppsk2cddvxnqvfd05reqf7p26w';

		// Amount to send in ADA (convert to Lovelace: 1 ADA = 1,000,000 Lovelace)
		const amountADA = 10.0;  // Send 10 ADA
		const amountLovelace = Math.floor(amountADA * 1000000);

		// Create transaction metadata with sensor data
		// Label 674 = Message (CIP-20 standard for transaction messages)
		const transactionMetadata = {
			674: {  // Message label (CIP-20 standard)
				msg: [
					`Sensor Data: Temperature ${temperature}°C, Humidity ${humidity}%RH`,
					`Timestamp: ${timestamp}`
				]
			}
		};

		// Get wallet UTXOs (Unspent Transaction Outputs)
		// UTXOs represent available funds in your wallet that can be spent
		const utxos = await wallet.getUtxosMesh();
		
		// Get change address
		// This is where any remaining funds (after transaction amount and fees) will be sent
		const changeAddress = await wallet.getChangeAddressBech32();
		
		// Initialize MeshTxBuilder
		// MeshTxBuilder provides low-level APIs for building transactions
		const txBuilder = new MeshTxBuilder({
			fetcher: provider,  // Provider for fetching blockchain data
			verbose: false  // Set to true for detailed debugging information during transaction building
		});
		
		// Build the transaction using MeshTxBuilder
		// This uses the same code pattern as the POST /transaction endpoint
		const unsignedTx = await txBuilder
			.txOut(recipientAddress, [{ unit: 'lovelace', quantity: amountLovelace.toString() }])  // Output: send lovelace to recipient
			.changeAddress(changeAddress)  // Address to receive change
			.metadataValue(674, transactionMetadata[674])  // Attach metadata with sensor data (label 674)
			.selectUtxosFrom(utxos)  // Automatically select UTXOs to fund the transaction
			.complete();  // Finalize the transaction structure
		
		// Sign the transaction with your wallet's private key
		// This proves that you own the wallet and authorizes the transaction
		const signedTx = await wallet.signTx(unsignedTx);
		
		// Submit the signed transaction to the Cardano network
		// The transaction will be broadcast to the network and included in the next block
		const txHash = await wallet.submitTx(signedTx);
		
		// Return success response with transaction details
		res.json({ 
			success: true, 
			message: 'Sensor data received and transaction submitted successfully',
			txHash: txHash,  // Transaction hash (unique identifier)
			explorerUrl: `https://preprod.cardanoscan.io/transaction/${txHash}`,  // Link to view transaction on explorer
			sensorData: {
				temperature: temperature,
				humidity: humidity,
				timestamp: timestamp  // Timestamp generated server-side when data was received
			}
		});
	} catch (error) {
		// Handle errors and return error response
		console.error('Error processing sensor data or submitting transaction:', error);
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
});

```

> Source: [`Workshop-03/examples/mesh-nodejs-api/server.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-03/examples/mesh-nodejs-api/server.js)

Matching `package.json`:

```json
{
	"name": "mesh-api",
	"version": "1.0.0",
	"description": "Node.js API with Mesh.js integration",
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

**Test it:**

1. `node server.js`.
2. `GET http://localhost:3000/wallet` - returns address + balance.
3. `POST http://localhost:3000/data` with `{"temperature": 23.5, "humidity": 65.2}` - auto-creates a transaction with the sensor data as CIP-20 message metadata.
4. Use the returned tx hash on [preprod.cardanoscan.io](https://preprod.cardanoscan.io/) to view metadata on-chain.

:::warning
Make sure your wallet has enough tADA for transaction amounts plus fees (~0.2 ADA per tx). Transactions are irreversible.
:::

## Next steps
You now have a working API that takes sensor data and stores it on-chain as metadata. The next lesson upgrades this so each sensor reading becomes an **NFT** instead of just metadata - a unique on-chain digital item that can be collected, traded, displayed.

## Further Resources

- [Mesh SDK](https://meshjs.dev/) - the SDK.
- [Express.js Documentation](https://expressjs.com/) - the framework.
- [Koios](https://api.koios.rest/) - free Cardano API.
- [Insomnia](https://insomnia.rest/) - API client.
- [Awesome JSON Viewer](https://github.com/rbrahul/Awesome-JSON-Viewer) - readable JSON in the browser.
- [REST API Tutorial](https://www.restapitutorial.com/) - REST primer.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/03-input-and-write/build-your-own-api) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-03](https://github.com/CardanoThings/Workshops/tree/main/Workshop-03).*
