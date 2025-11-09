---
id: others-api
sidebar_position: 4
title: IPFS
sidebar_label: IPFS
description: Blockfrost IPFS
---

In addition to the Cardano ecosystem, [Blockfrost](https://blockfrost.io/) also offers entry points to other ecosystems:

| Network                           | Endpoint                                         |
| --------------------------------- | ------------------------------------------------ |
| InterPlanetary File System (IPFS) | `https://ipfs.blockfrost.io/api/v0/`              |

## IPFS

IPFS, or InterPlanetary File System, is a distributed, peer-to-peer protocol designed for efficient and secure sharing of files and data across a global network. Is it commonly utilized for storing digital content externally from the main chain.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="curl"
values={[
{label: 'curl', value: 'curl'},
{label: 'JavaScript', value: 'js'},
{label: 'Other languages', value: 'others'},
]}>

<TabItem value="curl">

```bash
export BLOCKFROST_PROJECT_ID_IPFS=ipfs_YOUR_PROJECT_ID
curl "https://ipfs.blockfrost.io/api/v0/ipfs/add" \
  -X POST \
  -H "project_id: $BLOCKFROST_PROJECT_ID_IPFS" \
  -F "file=@./static/img/logo.svg"
```

</TabItem>
<TabItem value="js">

```javascript
import { BlockFrostIPFS } from "@blockfrost/blockfrost-js";

const IPFS = new Blockfrost.BlockFrostIPFS({
  projectId: "YOUR IPFS KEY HERE",
});

async function runExample() {
  try {
    const added = await IPFS.add(`${__dirname}/static/img/logo.svg`);
    console.log("added", added);

    const pinned = await IPFS.pin(added.ipfs_hash);
    console.log("pinned", pinned);
  } catch (err) {
    console.log("error", err);
  }
}

runExample();
```

</TabItem>
<TabItem value="others">

There are over [over 15 different SDKs](https://blockfrost.dev/docs/sdks) available for a variety of programming languages.

* [blockfrost-js](https://github.com/blockfrost/blockfrost-js)
* [blockfrost-haskell](https://github.com/blockfrost/blockfrost-haskell)
* [blockfrost-python](https://github.com/blockfrost/blockfrost-python)
* [blockfrost-rust](https://github.com/blockfrost/blockfrost-rust)
* [blockfrost-go](https://github.com/blockfrost/blockfrost-go)
* [blockfrost-ruby](https://github.com/blockfrost/blockfrost-ruby)
* [blockfrost-java](https://github.com/blockfrost/blockfrost-java)
* [blockfrost-scala](https://github.com/blockfrost/blockfrost-scala)
* [blockfrost-swift](https://github.com/blockfrost/blockfrost-swift)
* [blockfrost-kotlin](https://github.com/blockfrost/blockfrost-kotlin)
* [blockfrost-elixir](https://github.com/blockfrost/blockfrost-elixir)
* [blockfrost-dotnet](https://github.com/blockfrost/blockfrost-dotnet)
* [blockfrost-arduino](https://github.com/blockfrost/blockfrost-arduino)
* [blockfrost-php](https://github.com/blockfrost/blockfrost-php)
* [blockfrost-crystal](https://github.com/blockfrost/blockfrost-crystal)

</TabItem>
</Tabs>

When executed correctly, you will receive a response in JSON format, resembling the following:

```json
{
  "name": "logo.svg",
  "ipfs_hash": "QmUCXMTcvuJpwHF3gABRr69ceQR2uEG2Fsik9CyWh8MUoQ",
  "size": "5617"
}
```

To learn more how to use IPFS with Blockfrost, have a look at the [official Blockfrost documentation](https://blockfrost.dev/docs/start-building/ipfs/)
