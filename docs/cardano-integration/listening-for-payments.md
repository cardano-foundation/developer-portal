---
id: listening-for-payments
title: Listening for ADA Payments
sidebar_label: Receiving Payments
description: How to listen for ADA Payments
--- 
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### Overview 
:::note
This guide assumes that you have basic understanding of `cardano-cli`, how to use it and that you have installed it into your system. Otherwise we recommend reading [Installing cardano-node](/docs/cardano-integration/installing-cardano-node), [Running cardano-node](/docs/cardano-integration/running-cardano) and [Exploring Cardano Wallets](/docs/cardano-integration/creating-wallet-faucet) guides first.
:::

### Use case
There are many possible reasons why you would want to have the functionality of listening for `ADA` payments, but a very obvious use case would be for something like an **online shop** or a **payment gateway** that uses `ADA` tokens as the currency.

![img](../../static/img/cardano-integrations/ada-online-shop.png)

### Technical Flow
To understand how something like this could work in a technical point of view, let's take a look at the following diagram:

![img](../../static/img/cardano-integrations/ada-payment-flow.png)

So let's imagine a very basic scenario where a **customer** is browsing an online shop. Once the user has choosen and added all the items into the **shopping cart**, The next step would then be to checkout and pay for the items.

The **front-end** application would then request for a wallet address from the backend service and render a QR code to the **customer** to be scanned via a **Cardano wallet**. The backend service would then know that it has to query the wallet address using `cardano-cli` with a certain time interval to confirm and alert the **front-end** application that the payment has completed succesfully.

In the meantime the transaction is then being processed and settled within the **Cardano** network. We can see in the diagram above that both parties are ultimately connected to the network via the `cardano-node` software component.

### Time to code!

Now let's get our hands dirty and see how we can implement something like this in actual code.

:::note
In this section, We will use the path `/home/user/receive-ada-sample` to store all the related files as an example, please replace it with the directory you have choosen to store the files.
:::

**Generate Keys and Request some tADA**

First, lets create a directory to store our sample project:

```bash
mkdir -p /home/user/receive-ada-sample
```

Next, we generate our **payment key-pair** using `cardano-cli`:

```bash
cardano-cli address key-gen \
--verification-key-file /home/user/receive-ada-sample/keys/payment.vkey \
--signing-key-file /home/user/receive-ada-sample/keys/payment.skey
```

Since we now have our **payment key-pair**, the next step would be to generate a **wallet address** for the `testnet` network like so:

```bash
cardano-cli address build \
--payment-verification-key-file /home/user/receive-ada-sample/keys/payment.vkey \
--out-file /home/user/receive-ada-sample/keys/payment.addr \
--testnet-magic 1097911063
```

Your directory structure should now look like this:

```bash
/home/user/receive-ada-sample/receive-ada-sample
└── keys
    ├── payment.addr
    ├── payment.skey
    └── payment.vkey
```

Now lets go back to our root project folder:

```
cd /home/user/receive-ada-sample/receive-ada-sample
```

Now using your **programming language** of choice we create our first lines of code!

**Initial Variables**

First we will set the initial variables that we will be using: 

<Tabs
  defaultValue="js"
  values={[
    {label: 'JavaScript', value: 'js'},
    {label: 'Typescript', value: 'ts'},
    {label: 'Python', value: 'py'},
    {label: 'C#', value: 'cs'}
  ]}>

  <TabItem value="js">

```js 
/*
 * Filename: checkPayment.js
 */

import * as fs from 'fs';
// Please add this dependency using npm install node-cmd
import cmd from 'node-cmd';

// Path to the cardano-cli binary or use the global one
const CARDANO_CLI_PATH = "cardano-cli";
const CARDANO_ERA_FLAG = "--mary-era";
// The `testnet` identifier number
const CARDANO_NETWORK_MAGIC = 1097911063;
// The directory where we store our payment keys
// assuming our current directory context is /home/user/receive-ada-sample/receive-ada-sample
const CARDANO_KEYS_DIR = "keys";
// The imaginary total payment we expect in lovelace unit
const TOTAL_EXPECTED_LOVELACE = 1_000_000;
```
  </TabItem>
  <TabItem value="ts">
  </TabItem>
  <TabItem value="py">
  </TabItem>
  <TabItem value="cs">
  </TabItem>
</Tabs>

**Read Wallet Address Value**

Next, we get the string value of the wallet address from the `payment.addr` file that we generated awhile ago, like so:

<Tabs
  defaultValue="js"
  values={[
    {label: 'JavaScript', value: 'js'},
    {label: 'Typescript', value: 'ts'},
    {label: 'Python', value: 'py'},
    {label: 'C#', value: 'cs'}
  ]}>

  <TabItem value="js">

```js {20}
/*
 * Filename: checkPayment.js
 */

import * as fs from 'fs';
// Please add this dependency using npm install node-cmd
import cmd from 'node-cmd';

// Path to the cardano-cli binary or use the global one
const CARDANO_CLI_PATH = "cardano-cli";
const CARDANO_ERA_FLAG = "--mary-era";
// The `testnet` identifier number
const CARDANO_NETWORK_MAGIC = 1097911063;
// The directory where we store our payment keys
// assuming our current directory context is /home/user/receive-ada-sample/receive-ada-sample
const CARDANO_KEYS_DIR = "keys";
// The imaginary total payment we expect in lovelace unit
const TOTAL_EXPECTED_LOVELACE = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();
```
  </TabItem>
  <TabItem value="ts">
  </TabItem>
  <TabItem value="py">
  </TabItem>
  <TabItem value="cs">
  </TabItem>
</Tabs>

**Execute cardano-cli command**

Then we execute `cardano-cli` programatically and telling it to query the **UTXO** for the wallet address that we have generated with our keys and save the `stdout` result to our `rawUtxoTable` variable.


<Tabs
  defaultValue="js"
  values={[
    {label: 'JavaScript', value: 'js'},
    {label: 'Typescript', value: 'ts'},
    {label: 'Python', value: 'py'},
    {label: 'C#', value: 'cs'}
  ]}>

  <TabItem value="js">

```js {21-27}
/*
 * Filename: checkPayment.js
 */

import * as fs from 'fs';
// Please add this dependency using npm install node-cmd
import cmd from 'node-cmd';

// Path to the cardano-cli binary or use the global one
const CARDANO_CLI_PATH = "cardano-cli";
// The `testnet` identifier number
const CARDANO_NETWORK_MAGIC = 1097911063;
// The directory where we store our payment keys
// assuming our current directory context is /home/user/receive-ada-sample/receive-ada-sample
const CARDANO_KEYS_DIR = "keys";
// The imaginary total payment we expect in lovelace unit
const TOTAL_EXPECTED_LOVELACE = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();

const rawUtxoTable = cmd.runSync([
    CARDANO_CLI_PATH,
    "query", "utxo",
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
].join(" "));
```
  </TabItem>
  <TabItem value="ts">
  </TabItem>
  <TabItem value="py">
  </TabItem>
  <TabItem value="cs">
  </TabItem>
</Tabs>

### Summary

<Tabs
  defaultValue="js"
  values={[
    {label: 'JavaScript', value: 'js'},
    {label: 'Typescript', value: 'ts'},
    {label: 'Python', value: 'py'},
    {label: 'C#', value: 'cs'}
  ]}>
  <TabItem value="js">

```js
import * as fs from 'fs';
import cmd from 'node-cmd';

const CARDANO_CLI_PATH = "cardano-cli";
const CARDANO_NETWORK_MAGIC = 1097911063;
const CARDANO_KEYS_DIR = "keys";
const TOTAL_EXPECTED_ADA = 1;
const LOVELACE_PER_ADA = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();
const rawUtxoTable = cmd.runSync([
    CARDANO_CLI_PATH,
    "query", "utxo",
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
].join(" "));

const utxoTableRows = rawUtxoTable.data.trim().split('\n');
let totalLovelaceRecv = 0;
let isPaymentComplete = false;

for(let x = 2; x < utxoTableRows.length; x++) {
    const cells = utxoTableRows[x].split(" ").filter(i => i);
    totalLovelaceRecv += parseInt(cells[2]);
}

isPaymentComplete = totalLovelaceRecv / LOVELACE_PER_ADA >= TOTAL_EXPECTED_ADA;

console.log(`Total Received: ${totalLovelaceRecv / LOVELACE_PER_ADA} ADA`);
console.log(`Expected Payment: ${TOTAL_EXPECTED_ADA} ADA`);
console.log(`Payment Complete: ${(isPaymentComplete ? "✅" : "❌")}`);
```

  </TabItem>
  <TabItem value="ts">


```ts
import * as fs from 'fs';
import cmd from 'node-cmd';

const CARDANO_CLI_PATH = "cardano-cli";
const CARDANO_NETWORK_MAGIC = 1097911063;
const CARDANO_KEYS_DIR = "keys";
const TOTAL_EXPECTED_LOVELACE = 1_000_000;
const LOVELACE_PER_ADA = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();
const rawUtxoTable = cmd.runSync([
    CARDANO_CLI_PATH,
    "query", "utxo",
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
].join(" "));

const utxoTableRows = rawUtxoTable.data.trim().split('\n');
let totalLovelaceRecv = 0;

for(let x = 2; x < utxoTableRows.length; x++) {
    const cells = utxoTableRows[x].split(" ").filter(i => i);
    totalLovelaceRecv += parseInt(cells[2]);
}

console.log(`Total ADA Received: ${totalLovelaceRecv / LOVELACE_PER_ADA}`);
console.log(`Expected ADA Payment: ${TOTAL_EXPECTED_LOVELACE / LOVELACE_PER_ADA}`);
console.log(`Payment Complete: ${(totalLovelaceRecv >= TOTAL_EXPECTED_LOVELACE ? "✅":"❌")}`);
```

  </TabItem>
  <TabItem value="cs">

```csharp
using System;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using SimpleExec;

const string CARDANO_CLI_PATH = "cardano-cli";
const int CARDANO_NETWORK_MAGIC = 1097911063;
const string CARDANO_KEYS_DIR = "keys";
const long TOTAL_EXPECTED_ADA = 1;
const long LOVELACE_PER_ADA = 1_000_000;

var walletAddress = await File.ReadAllTextAsync(Path.Combine(CARDANO_KEYS_DIR, "payment.addr"));
var rawUtxoTable = await Command.ReadAsync(CARDANO_CLI_PATH, string.Join(" ",
    "query", "utxo",
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
), noEcho: true);

var utxoTableRows = rawUtxoTable.Trim().Split("\n");
var totalLovelaceRecv = 0L;
var isPaymentComplete = false;

for(var x = 2; x < utxoTableRows.Length; x++)
{
    var cells = utxoTableRows[x].Split(" ").Where(c => c.Trim() != string.Empty).ToArray();
    totalLovelaceRecv +=  long.Parse(cells[2]);
}

isPaymentComplete = totalLovelaceRecv / LOVELACE_PER_ADA >= TOTAL_EXPECTED_ADA;

Console.WriteLine($"Total ADA Received: {totalLovelaceRecv / LOVELACE_PER_ADA}");
Console.WriteLine($"Expected ADA Payment: {TOTAL_EXPECTED_ADA}");
Console.WriteLine($"Payment Complete: {(isPaymentComplete ? "✅":"❌")}");

```

  </TabItem>
  <TabItem value="python">

    ```py
    def hello_world():
      print 'Hello, world!'
    ```

  </TabItem>
</Tabs>