---
id: overview
slug: /transaction-metadata/
title: Build with transaction metadata
sidebar_label: Overview
description: The Cardano Transaction Metadata is a feature that allows anyone to embed metadata into transactions and ultimately storing metadata into the blockchain.
image: /img/og/og-developer-portal.png
---

![Cardano Transaction Metadata](../../static/img/card-transaction-metadata-title.svg)

## Introduction

The **Cardano Transaction Metadata** feature allows anyone to embed metadata into transactions, which is then stored in the blockchain. The following are the four most common uses of metadata:

- **Validation and verification**  
Metadata can be utilized to check and verify external physical objects and legitimate content, as the Cardano Foundation has demonstrated with Scantrust and Baia's Wine. This necessitates coupling with a physical identifier, such as a QR-code, but it's especially beneficial for low-cost supply chain tracking of fast-moving consumer goods.

- **Authentication and attribution**  
There are frequently physical identifiers to confirm the authenticity of credentials received from an educational institution, membership group, or similar. This is more difficult for digital courses and accreditations. For a low fee, a transaction with metadata might serve as an immutable and always-accessible evidence of certification.

- **Secure record of information**  
Metadata attached to a transaction and confirmed on the Cardano blockchain is immutable. This means that no one can alter it, and it will last as long as the Cardano blockchain exists. This is a fantastic way to save and back up vital information, or even just to leave a humorous message for the future.

- **Timestamping**  
Any transaction that requires payment data to be attached, as well as the history of ownership of particular assets, can benefit from timestamping. Metadata can be used to create a timestamp within a transaction, allowing anyone to verify the time and date of a purchase, sale, or transfer.

Metadata, in essence, can be utilized to tell a transaction's story. Metadata can act as a confirmation or assurance of authenticity when combined with off-chain infrastructure such as physical identifiers.

## Metadata Workshop
The Cardano Foundation's integrations team hosted a session on transaction metadata on January 18, 2021. Jeremy Firster and Mel McCann from the Cardano Foundation's integrations team delivered the workshop. Jeremy and Mel introduced transaction metadata and discussed its potential for creating Cardano apps with IOHK's Alan McSherry and Ben O'Hanlon. [The slides of the presentation are also available](https://docs.google.com/presentation/d/1KUy83TxpJwIxMHYoQQK6SYynTKrmokxgv_vRa3bpGw4/edit?usp=sharing).  

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
        "bytes": "0x2512a00e9653fe49a44a5886202e24d77eeb998f"
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

We invite developers to experiment using **Cardano Transaction Metadata** and come up with new ideas. Next, we'll go over the various methods for creating a transaction that includes metadata.
