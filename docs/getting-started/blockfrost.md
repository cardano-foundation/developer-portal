---
id: blockfrost
title: Getting Started with Blockfrost
sidebar_label: Blockfrost
description: Getting Started with Blockfrost
image: ./img/og-developer-portal.png
--- 
Blockfrost provides API to access and process information stored on the Cardano blockchain. The basic tier is free and allows 50,000 requests per day.

## Sign in
[Sign in on Blockfrost](https://blockfrost.io/auth/signin) with your GitHub account. No registration required. Enter a project name and select Cardano mainnet or Cardano testnet, depending on your needs.

![img](../../static/img/getting-started/blockfrost/1-add-project.png)

## Get your API key
After clicking on `Save Project` you will immediately get your `API KEY`. Save it. You will need this key for every request.

![img](../../static/img/getting-started/blockfrost/2-get-api-key.png) 

## Send a request
Send your first request to get data about the latest epoch. Don't forget to replace `1234567890`with your `API KEY`.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="sh"
  values={[
    {label: 'Curl', value: 'sh'},
    {label: 'PHP', value: 'php'},
  ]}>
  <TabItem value="sh">

```sh
curl -H 'project_id: 1234567890' https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest
```

  </TabItem>
  <TabItem value="php">

```php
$headers = array('http'=> array(
					 'method' => 'GET',
					 'header' => 'project_id: 1234567890'
					)
   			    );
$context = stream_context_create($headers);
$json = file_get_contents('https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest', false, $context);
$parsedJson = json_decode($json);
```

  </TabItem>
</Tabs>



If you have done everything correctly you will get a response in JSON format, similar to this:

```json
{
  "epoch": 225,
  "start_time": 1603403091,
  "end_time": 1603835086,
  "first_block_time": 1603403092,
  "last_block_time": 1603835084,
  "block_count": 21298,
  "tx_count": 17856,
  "output": "7849943934049314",
  "fees": "4203312194",
  "active_stake": "784953934049314"
}
```

## Blockfrost documentation
Visit [docs.blockfrost.io](https://docs.blockfrost.io) to see the complete API documentation.