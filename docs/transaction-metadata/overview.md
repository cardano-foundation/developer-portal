---
id: overview
slug: /transaction-metadata/
title: Build with transaction metadata
sidebar_label: Overview
description: The Cardano Transaction Metadata is a feature that allows anyone to embed metadata into transactions and ultimately storing metadata into the blockchain.
image: ./img/og-developer-portal.png
---

![Cardano Transaction Metadata](../../static/img/card-transaction-metadata-title.svg)

## Introduction

The **Cardano Transaction Metadata** is a feature that allows anyone to embed metadata into transactions and ultimately storing metadata into the blockchain. It can be useful to many use-cases and has been used for **supply-chain tracking**, **on-chain-voting**, **non-fungible tokens**, and so much more. The possibilities are endless!

## Schema

Metadata can be expressed as a `JSON` object with some restrictions:

All top-level keys must be **integers** between 0 and 2^64 - 1. Each metadata value is tagged with its type. **Strings** must be at most 64 bytes when UTF-8 is encoded. **Bytestrings** are hex-encoded, with a maximum length of 64 bytes. Metadata aren't stored as `JSON` on the Cardano blockchain but are instead stored using a compact binary encoding (**CBOR**).

The binary encoding of metadata values supports three simple types:

- Integers in the range `-(2^64 - 1) to 2^64 - 1`
- Strings (`UTF-8` encoded)
- Bytestrings
- And two compound types:
    - Lists of metadata values
    - Mappings from metadata values to metadata values

It is possible to transform any JSON object into this schema.

However, according to your requirements, if your application uses floating-point values, they will need to be converted somehow. Likewise, for **null** or **bool** values. Also, when reading metadata from the chain, be aware that **integers** may exceed the programming language of choice numeric range and may need special **bigint** parsing.

**Example metadata**:

```json
{
    "0": {
        "string": "cardano"
    },
    "1": {
        "int": 14
    },
    "2": {
        "bytes": "2512a00e9653fe49a44a5886202e24d77eeb998f"
    },
    "3": {
        "list": [
            {
                "string": "test"
            }
        ]
    },
    "4": {
        "map": [
            {
                "k": {
                    "string": "key"
                },
                "v": {
                    "string": "value"
                }
            }
        ]
    }
}
```

**This is equivalent to the normalized JSON version**:

```json
{
    "0": "cardano", // string
    "1": 14, // int
    "2": [53, 23, 53, 64, 23, 06], // bytes
    "3": ["test"], // list or array
    "4": { "key": "value" }  // Object
}
```

## Explore

We encourage developers to explore and be creative with **Cardano Transaction Metadata**. Up next, we discuss the different ways you can create a transaction with metadata embedded into it.