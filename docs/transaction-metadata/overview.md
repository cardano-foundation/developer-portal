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

The **Cardano Transaction Metadata** is a feature that allows anyone to embed metadata into transactions and ultimately storing metadata into the blockchain. There are four major applications of metadata, these include:

- **Validation and verification**  
As the Cardano Foundation has shown with Scantrust and Baia’s Wine, metadata can be used to validate and verify external physical products and genuine articles. This requires pairing with a physical identifier, such as a QR-code, but it is particularly useful for supply chain tracking of fast-moving consumer goods, at low cost.

- **Authentication and attribution**  
When you receive credentials from an educational institution, membership organization, or similar, there are usually physical identifiers to prove their authenticity. For digital courses and accreditations, this is more difficult. A transaction with metadata attached could serve as an immutable and always-accessible proof of certification, for a low fee.

- **Secure record of information**  
Metadata attached to a transaction and confirmed on the Cardano blockchain is immutable. This means no one can change or tamper with it, and it lasts as long as the Cardano blockchain exists. This is a great way to store and back-up information that is important, or could even just be used to leave a fun message for the future.

- **Timestamping**  
Timestamping is useful for any transaction which requires payment details to be attached, or for the history of ownership of certain assets. Metadata can be used to create a timestamp within a transaction, allowing anyone to verify the time and date at which something was bought, sold, or transferred.

Essentially, metadata can be used to tell the story of a transaction. When paired with off-chain infrastructure, such as physical identifiers, metadata can serve as a confirmation or assurance of authenticity.

## Metadata Workshop
On 18 January 2021, Jeremy Firster and Mel McCann from the Cardano Foundation’s integrations team delivered a workshop on transaction metadata. Together with Alan McSherry and Ben O’Hanlon from IOHK, Jeremy and Mel introduced transaction metadata and discussed its potential for building applications on Cardano. [The slides of the presentation are also available](https://docs.google.com/presentation/d/1KUy83TxpJwIxMHYoQQK6SYynTKrmokxgv_vRa3bpGw4/edit?usp=sharing).  

<iframe width="100%" height="325" src="https://www.youtube.com/embed/LrN3ETZ3fRM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

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