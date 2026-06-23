---
id: 04-building-the-frontend
title: Building the Frontend
sidebar_label: 04 - Building the Frontend
description: Build the HTML/CSS/JS payment-request UI served from LittleFS by the microcontroller.
---

Build the frontend for the payment terminal: an HTML/CSS page served from LittleFS that lets the operator create payment requests and view a transaction list.

## Building the interface

Now that the webserver runs, build the UI. The flow:

- The page lists payment requests, their status, and a button to create a new request.
- Clicking the button posts to the webserver, which creates the request, saves it in a JSON file, and renders a QR code on the TFT.
- The user scans the QR with Yoroi (or another mobile wallet), signs, and submits.
- The backend polls Koios for the transaction; on confirmation it updates the request's status and shows a confirmation on the TFT.

:::info Re-uploading data
The `data/` directory must be re-uploaded to LittleFS every time you change the frontend. See [Getting Started](/docs/developers/curriculum/dapps/iot/qr-code-payments/01-getting-started#uploading-files-to-littlefs) for the procedure.
:::

## Project structure

The frontend lives in `data/`:

```
data/
├── index.html
├── styles.css
├── requestPayment.js
├── transactionList.js
├── transactions.json
├── favicon.ico
└── README.md
```

## HTML & CSS

The entry point - what the operator sees in the browser.

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">
    <title>Cardano POS</title>
    <link rel="stylesheet"
          href="styles.css">
</head>

<body>

    <!-- New Payment Request Button -->
    <button id="openPaymentModal"
            class="btn-primary">New Payment Request</button>

    <!-- Transactions Section -->
    <section id="transactionsSection"
             class="transactions-section">
        <h2>Transactions</h2>
        <div id="transactionsContainer"></div>
    </section>

    <!-- Payment Modal -->
    <dialog id="paymentModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create Payment Request</h2>
                <form method="dialog">
                    <button class="close">&times;</button>
                </form>
            </div>
            <form id="paymentForm"
                  class="modal-body">
                <div class="form-group">
                    <label for="adaAmount">ADA Amount:</label>
                    <input type="number"
                           id="adaAmount"
                           name="adaAmount"
                           step="0.1"
                           min="0.1"
                           placeholder="Enter amount in ADA"
                           required>
                </div>
                <div class="form-actions">
                    <button type="button"
                            class="btn-secondary"
                            id="cancelBtn">Cancel</button>
                    <button type="submit"
                            class="btn-primary">Create Payment Request</button>
                </div>
            </form>
        </div>
    </dialog>

    <!-- JavaScript files -->
    <script src="requestPayment.js"></script>
    <script src="transactionList.js"></script>
</body>

</html>
```

`styles.css`:

```css
/* Basic styling */
body {
	font-family: Arial, sans-serif;
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
	background-color: #f5f5f5;
}

h1 {
	color: #333;
	text-align: center;
}

/* Button styles */
.btn-primary {
	background-color: #007bff;
	color: white;
	border: none;
	padding: 12px 24px;
	font-size: 16px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.btn-primary:hover {
	background-color: #0056b3;
}

.btn-primary:disabled {
	background-color: #6c757d;
	cursor: not-allowed;
}

.btn-secondary {
	background-color: #6c757d;
	color: white;
	border: none;
	padding: 12px 24px;
	font-size: 16px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.btn-secondary:hover {
	background-color: #5a6268;
}

/* Modal styles using :modal pseudo-class */
:modal {
	border: 1px solid #888;
	border-radius: 8px;
	width: 90%;
	max-width: 500px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	padding: 0;
}

/* Backdrop styling */
::backdrop {
	background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
	background-color: #fefefe;
	padding: 0;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px;
	border-bottom: 1px solid #ddd;
}

.modal-header h2 {
	margin: 0;
	color: #333;
}

.modal-header form {
	margin: 0;
}

.close {
	background: none;
	border: none;
	color: #aaa;
	font-size: 28px;
	font-weight: bold;
	cursor: pointer;
	line-height: 20px;
	padding: 0;
	margin: 0;
}

.close:hover,
.close:focus {
	color: #000;
}

.modal-body {
	padding: 20px;
}

.form-group {
	margin-bottom: 20px;
}

.form-group label {
	display: block;
	margin-bottom: 8px;
	color: #333;
	font-weight: bold;
}

.form-group input {
	width: 100%;
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 16px;
	box-sizing: border-box;
}

.form-group input:focus {
	outline: none;
	border-color: #007bff;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 20px;
}

/* Transactions section */
.transactions-section {
	margin-top: 40px;
	background-color: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transactions-section h2 {
	margin-top: 0;
	color: #333;
	border-bottom: 2px solid #007bff;
	padding-bottom: 10px;
}

.transactions-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 20px;
}

.transactions-table thead {
	background-color: #f8f9fa;
}

.transactions-table th {
	padding: 12px;
	text-align: left;
	font-weight: bold;
	color: #333;
	border-bottom: 2px solid #dee2e6;
}

.transactions-table td {
	padding: 12px;
	border-bottom: 1px solid #dee2e6;
}

.transactions-table tbody tr:hover {
	background-color: #f8f9fa;
}

.transactions-table .empty-hash {
	color: #999;
	font-style: italic;
}
```

> Source: [`data/index.html`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/cardano-pos/data/index.html), [`data/styles.css`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/cardano-pos/data/styles.css)

## Creating the payment request

A simple form: enter the amount of ADA, submit it to the backend, which creates a new payment request and renders the QR.

`requestPayment.js`:

```javascript
/**
 * Payment Request Handler
 * 
 * This module handles the creation of new payment requests through a modal dialog.
 * It converts ADA amounts to lovelace, sends POST requests to the API, and
 * triggers the transaction list refresh.
 */

// Get references to DOM elements
const modal = document.getElementById('paymentModal');
const openBtn = document.getElementById('openPaymentModal');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('paymentForm');
const amountInput = document.getElementById('adaAmount');
const submitBtn = form.querySelector('button[type="submit"]');

// Open modal when "New Payment Request" button is clicked
openBtn.addEventListener('click', () => {
    modal.showModal(); // Show the native <dialog> element
    amountInput.focus(); // Automatically focus the amount input field
});

// Close modal when cancel button is clicked
cancelBtn.addEventListener('click', () => modal.close());

// Reset form when dialog closes (handles both cancel and successful submission)
modal.addEventListener('close', () => form.reset());

// Handle form submission - creates a new payment request
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate and parse the ADA amount input
    const adaAmount = parseFloat(amountInput.value);
    if (isNaN(adaAmount) || adaAmount <= 0) {
        console.log('Please enter a valid ADA amount greater than 0');
        return; // Exit early if validation fails
    }

    // Convert ADA to lovelace (1 ADA = 1,000,000 lovelace)
    // Math.round() ensures we get an integer value
    const lovelaceAmount = Math.round(adaAmount * 1000000);

    // Get current timestamp in milliseconds (Unix timestamp)
    const timestamp = Date.now();

    // Disable submit button and show processing state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        // Prepare request data with amount in lovelace and timestamp
        const requestData = { amount: lovelaceAmount, timestamp: timestamp };
        console.log('Sending request:', requestData);

        // Send POST request to create new transaction
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        // Check if request was successful
        if (!response.ok) {
            // Parse error response and throw error
            const error = await response.json();
            throw new Error(error.error || 'Failed to create payment request');
        }

        // Parse successful response
        const transaction = await response.json();

        // Close modal after successful creation
        modal.close();

        // Convert lovelace back to ADA for display in console log
        // Note: transaction.amount includes the transaction ID, so this is for display only
        const adaDisplay = (transaction.amount / 1000000).toFixed(6);
        console.log(`Payment request created! ID: ${transaction.id}, Amount: ${adaDisplay} ADA (${transaction.amount} lovelace)`);

        // Refresh transaction list to show the new transaction
        // window.refreshTransactions is defined in transactionList.js
        if (window.refreshTransactions) {
            window.refreshTransactions();
        }
    } catch (error) {
        // Log error to console (no alert shown to user)
        console.error('Error creating payment request:', error.message);
    } finally {
        // Always re-enable submit button and reset text, even if request failed
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Payment Request';
    }
});

```

> Source: [`data/requestPayment.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/cardano-pos/data/requestPayment.js)

## Displaying the transaction list

A simple list of recent payment requests, fetched periodically from the backend so it picks up new transaction hashes as they confirm.

`transactionList.js`:

```javascript
/**
 * Transaction List Handler
 * 
 * This module handles fetching and displaying transactions from the API.
 * It creates a table view of all transactions, automatically refreshes every
 * 30 seconds, and provides a manual refresh function for other modules.
 */

// Get reference to the container element where transactions will be displayed
const transactionsContainer = document.getElementById('transactionsContainer');

/**
 * Format timestamp to readable date string
 * Converts Unix timestamp (milliseconds) to localized date/time string
 * 
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date/time string (e.g., "12/25/2023, 3:45:30 PM")
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

/**
 * Load transactions from API and display them
 * Fetches all transactions from the GET /api/transactions endpoint
 * and calls displayTransactions() to render them
 */
async function loadTransactions() {
    try {
        // Fetch transactions from API
        const response = await fetch('/api/transactions');

        // Check if request was successful
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        // Parse JSON response
        const transactions = await response.json();

        // Display transactions in the table
        displayTransactions(transactions);
    } catch (error) {
        // Log error and show error message in container
        console.error('Error loading transactions:', error);
        transactionsContainer.innerHTML = '<p>Error loading transactions</p>';
    }
}

/**
 * Display transactions in a table format
 * Creates a table with columns: ID, Amount (ADA), Timestamp, Transaction Hash
 * 
 * @param {Array} transactions - Array of transaction objects from API
 */
function displayTransactions(transactions) {
    // Handle empty transaction list
    if (transactions.length === 0) {
        transactionsContainer.innerHTML = '<p>No transactions yet</p>';
        return;
    }

    // Create table element
    const table = document.createElement('table');
    table.className = 'transactions-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Create header cells for each column
    ['ID', 'Amount (ADA)', 'Timestamp', 'Transaction Hash'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Create a row for each transaction
    transactions.forEach(transaction => {
        const row = document.createElement('tr');

        // Transaction ID cell
        const idCell = document.createElement('td');
        idCell.textContent = transaction.id;
        row.appendChild(idCell);

        // Amount cell - convert lovelace to ADA for display
        const amountCell = document.createElement('td');
        // Note: transaction.amount includes the transaction ID, so this displays
        // the full amount including ID. For display purposes, we show it as ADA.
        // 1 ADA = 1,000,000 lovelace
        const adaAmount = (transaction.amount / 1000000).toFixed(2);
        amountCell.textContent = adaAmount;
        row.appendChild(amountCell);

        // Timestamp cell - format to readable date
        const timestampCell = document.createElement('td');
        timestampCell.textContent = formatTimestamp(transaction.timestamp);
        row.appendChild(timestampCell);

        // Transaction hash cell
        const hashCell = document.createElement('td');
        // Show "-" if hash is empty (payment not yet confirmed)
        hashCell.textContent = transaction.txHash || '-';
        // Add CSS class for styling empty hashes (grayed out)
        hashCell.className = transaction.txHash ? '' : 'empty-hash';
        row.appendChild(hashCell);

        // Add row to table body
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Clear container and add the new table
    transactionsContainer.innerHTML = '';
    transactionsContainer.appendChild(table);
}

// Polling interval ID (stored so it can be cleared if needed)
let pollingInterval = null;

/**
 * Start automatic polling for transactions
 * Fetches transactions from API every 30 seconds to keep the list up-to-date
 * This ensures new transactions and updated hashes are displayed automatically
 */
function startTransactionPolling() {
    // Clear any existing interval to prevent multiple polling instances
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // Set up interval to fetch transactions every 30 seconds
    pollingInterval = setInterval(() => {
        console.log('Polling for transactions...');
        loadTransactions();
    }, 30000); // 30 seconds = 30000 milliseconds
}

/**
 * Stop automatic polling
 * Useful for cleanup or if polling needs to be disabled
 */
function stopTransactionPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// Load transactions immediately when page loads
loadTransactions();

// Start automatic polling to keep transaction list updated
startTransactionPolling();

/**
 * Expose refresh function globally for other modules
 * This allows requestPayment.js to manually refresh the transaction list
 * after creating a new payment request, providing immediate feedback
 */
window.refreshTransactions = loadTransactions;

```

> Source: [`data/transactionList.js`](https://github.com/CardanoThings/Workshops/blob/main/Workshop-05/examples/cardano-pos/data/transactionList.js)

## Next steps
Frontend's done - you can upload `data/` to the microcontroller, but it can't actually create payment requests yet because the backend doesn't exist. That comes next.

Things you could add later: a confirmation screen, different styling, direct links to [CardanoScan](https://cardanoscan.io/) for transaction hashes.

The next lesson builds the backend - endpoints to create payment requests, render the CIP-13 QR code on the TFT, and confirm payments via Koios.

## Further Resources

- [W3Schools](https://www.w3schools.com/) - free HTML/CSS/JS reference.


---

*Adapted from the [CardanoThings](https://cardanothings.io/workshops/05-qr-code-payments/building-the-frontend) workshop series, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source code: [github.com/CardanoThings/Workshops/Workshop-05](https://github.com/CardanoThings/Workshops/tree/main/Workshop-05).*
