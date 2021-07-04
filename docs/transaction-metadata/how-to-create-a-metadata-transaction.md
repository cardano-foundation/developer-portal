---
id: how-to-create-a-metadata-transaction
title: How to Create a Metadata Transaction
sidebar_label: Create a Metadata Transaction
description: How to create a metadata transaction.
image: ./img/og-developer-portal.png
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Prerequisites

Before creating a metadata transaction, you will need to install the [cardano-node](https://github.com/input-output-hk/cardano-node#cardano-node-overview) and to follow instructions on how to launch [cardano-CLI](https://github.com/input-output-hk/cardano-node/tree/master/cardano-cli#cardano-cli).

## Metadata Structure

The metadata structure is represented as a map from:
* **Metadata keys** - integers in the range 0 to 2<sup>64</sup> - 1
* **Metadata values** - one of three simple types or two compound types.

The Simple types include:
* Integers in the range -(2<sup>64</sup> - 1) to 2<sup>64</sup> - 1
* Strings (UTF-8 encoded)
* Bytestrings

The Compound types include:
* Lists of metadata values
* Mappings from metadata values to metadata values

The metadata can be a JSON object mapping metadata keys as decimal number strings to JSON objects for metadata values.The JSON representation in cardano-wallet is the following:

<Tabs
  groupId="types"
  defaultValue="int"
  values={[
    {label: 'Integers', value: 'int'},
    {label: 'Strings', value: 'str'},
    {label: 'Bytestrings base16-encoded', value: 'hex'},
    {label: 'Metadata values', value: 'list'},
    {label: 'Mapping values', value: 'map'},
  ]}>
<TabItem value="int">  

```js
{ "int": NUMBER }
```

</TabItem>
<TabItem value="str">

```js
{ "string": STRING }
```

</TabItem>
<TabItem value="hex">

```js
{ "bytes": HEX-STRING }
```

</TabItem>
<TabItem value="list">

```js
{ "list": [ METADATA-VALUE, ... ] }
```

</TabItem>
<TabItem value="map">

```js
{ "map": [{ "k": METADATA-VALUE, "v": METADATA-VALUE }, ... ] }
```

</TabItem>
</Tabs>

:::note
Note that lists and maps need not necessarily contain the same type of metadata value in each element.
:::

## Create Metadata using Wallet CLI

Metadata can be provided when creating transactions through the [Wallet CLI](https://github.com/input-output-hk/cardano-wallet/wiki/Wallet-command-line-interface). The JSON is provided directly as a command-line argument.

On Linux/MacOS, JSON metadata can be put inside single quotes. But on Windows, it can be put in double quotes with double quotes inside JSON metadata escaped as following:

<Tabs
  groupId="operating-systems"
  defaultValue="win"
  values={[
    {label: 'Windows', value: 'win'},
    {label: 'macOS', value: 'mac'},
    {label: 'Linux', value: 'linux'},
  ]
}>
<TabItem value="win">

```
--metadata "{ \"0\":{ \"string\":\"cardano\" } }"
```

</TabItem>
<TabItem value="mac">

```
--metadata '{ "0":{ "string":"cardano" } }'
```

</TabItem>
<TabItem value="linux">

```
--metadata '{ "0":{ "string":"cardano" } }'
```

</TabItem>
</Tabs>

Run the following command to create a transaction with a specified metadata,:
```
cabal exec cardano-cli -- transaction build-raw
```

## References

* [Cardano Shelley Ledger Spec, Figure 10.](https://hydra.iohk.io/job/Cardano/cardano-ledger-specs/specs.shelley-ledger/latest/download-by-type/doc-pdf/ledger-spec)
* [cardano-wallet OpenAPI Documentation, Shelley / Transactions / Create.](https://input-output-hk.github.io/cardano-wallet/api/edge/#operation/postTransaction)


:::note 
Please watch the Cardano [metadata workshop](https://www.crowdcast.io/e/metadata) for creating and submitting a metadata transaction to the Cardano blockchain ([presentation attached](https://docs.google.com/presentation/d/1ursHchJiBP5ZVuXcW2uVJMmzXjlJk_di65CKmAplEy4/edit#slide=id.gb7121fc2c5_4_0)). You can find more technical details in the [metadata transaction](https://docs.cardano.org/projects/cardano-node/en/latest/reference/tx-metadata.html?highlight=metadata) documentation and the [postTransaction API](https://input-output-hk.github.io/cardano-wallet/api/edge/#operation/postTransaction).
:::
