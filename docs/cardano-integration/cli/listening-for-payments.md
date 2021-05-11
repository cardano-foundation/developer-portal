---
id: listening-for-payments
title: Listening for ADA Payments
sidebar_label: Receiving Payments
description: How to listen for ADA Payments
--- 

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
const CARDANO_ERA_FLAG = "--mary-era";
const CARDANO_NETWORK_MAGIC = 1097911063;
const CARDANO_KEYS_DIR = "keys";
const TOTAL_EXPECTED_ADA = 1;
const LOVELACE_PER_ADA = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();
const rawUtxoTable = cmd.runSync([
    CARDANO_CLI_PATH,
    "query", "utxo", CARDANO_ERA_FLAG,
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
console.log(`Expected ADA Payment: ${TOTAL_EXPECTED_ADA}`);
console.log(`Payment Complete: ${(totalLovelaceRecv / LOVELACE_PER_ADA >= TOTAL_EXPECTED_ADA ? "✅":"❌")}`);
```

  </TabItem>
  <TabItem value="ts">


```ts
import * as fs from 'fs';
import cmd from 'node-cmd';

const CARDANO_CLI_PATH = "cardano-cli";
const CARDANO_ERA_FLAG = "--mary-era";
const CARDANO_NETWORK_MAGIC = 1097911063;
const CARDANO_KEYS_DIR = "keys";
const TOTAL_EXPECTED_LOVELACE = 1_000_000;
const LOVELACE_PER_ADA = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();
const rawUtxoTable = cmd.runSync([
    CARDANO_CLI_PATH,
    "query", "utxo", CARDANO_ERA_FLAG,
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
const string CARDANO_ERA_FLAG = "--mary-era";
const int CARDANO_NETWORK_MAGIC = 1097911063;
const string CARDANO_KEYS_DIR = "keys";
const long TOTAL_EXPECTED_ADA = 1;
const long LOVELACE_PER_ADA = 1_000_000;

var walletAddress = await File.ReadAllTextAsync(Path.Combine(CARDANO_KEYS_DIR, "payment.addr"));
var rawUtxoTable = await Command.ReadAsync(CARDANO_CLI_PATH, string.Join(" ",
    "query", "utxo", CARDANO_ERA_FLAG,
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
), noEcho: true);

var utxoTableRows = rawUtxoTable.Trim().Split("\n");
var totalLovelaceRecv = 0L;

for(var x = 2; x < utxoTableRows.Length; x++)
{
    var cells = utxoTableRows[x].Split(" ").Where(c => c.Trim() != string.Empty).ToArray();
    totalLovelaceRecv +=  long.Parse(cells[2]);
}

Console.WriteLine($"Total ADA Received: {totalLovelaceRecv / LOVELACE_PER_ADA}");
Console.WriteLine($"Expected ADA Payment: {TOTAL_EXPECTED_ADA}");
Console.WriteLine($"Payment Complete: {(totalLovelaceRecv / LOVELACE_PER_ADA >= TOTAL_EXPECTED_ADA ? "✅":"❌")}");
```

  </TabItem>
  <TabItem value="python">

    ```py
    def hello_world():
      print 'Hello, world!'
    ```

  </TabItem>
</Tabs>